const Order = require('../models/Order');
const Product = require('../models/Product');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');
const { sendOrderEmailToBuyer, sendOrderEmailToSeller, sendDACEmail } = require('../utils/emailService');

// Generate a random 6-digit DAC code
const generateDACCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hash DAC code for storage
const hashDAC = (code) => {
    return crypto.createHash('sha256').update(code).digest('hex');
};

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Helper function to format address
const formatAddress = (address) => {
    if (!address) return 'Address not provided';
    if (typeof address === 'string') return address;
    const parts = [
        address.fullName,
        address.addressLine1,
        address.addressLine2,
        address.city,
        address.state,
        address.pincode ? `PIN: ${address.pincode}` : null,
        address.phone ? `Phone: ${address.phone}` : null
    ].filter(Boolean);
    return parts.join(', ') || 'Address not provided';
};

// Helper function to send order emails to both parties
const sendOrderEmails = async (buyer, cartItems, orderId, totalAmount, shippingAddress) => {
    try {
        console.log('📧 =============================================');
        console.log('📧 Starting email send process...');
        console.log('📧 Buyer:', buyer?.name, buyer?.email);
        console.log('📧 Cart items count:', cartItems?.length);

        const orderDate = new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Get product IDs from cart items - handle both _id and id fields
        const productIds = cartItems.map(item => {
            const id = item._id || item.id;
            console.log('📧 Cart item:', item.title, '- ID:', id);
            return id;
        });

        // Re-fetch products from DB with full seller details
        const products = await Product.find({ _id: { $in: productIds } })
            .populate('seller', 'name email phone addresses');

        console.log('📧 Found', products.length, 'products from DB');

        if (products.length === 0) {
            console.error('📧 ❌ No products found in DB! Cart item IDs:', productIds);
            return;
        }

        // Group products by seller
        const sellerMap = new Map();
        for (const product of products) {
            if (!product.seller) {
                console.error('📧 ❌ Product has no seller:', product.title, product._id);
                continue;
            }

            const sellerId = product.seller._id.toString();
            console.log('📧 Product:', product.title, '→ Seller:', product.seller.name, '(' + product.seller.email + ')');

            if (!sellerMap.has(sellerId)) {
                sellerMap.set(sellerId, {
                    seller: product.seller,
                    items: []
                });
            }

            // Find matching cart item
            const cartItem = cartItems.find(item => {
                const itemId = (item._id || item.id || '').toString();
                return itemId === product._id.toString();
            });

            sellerMap.get(sellerId).items.push({
                title: product.title,
                price: product.price,
                quantity: cartItem?.quantity || 1
            });
        }

        console.log('📧 Found', sellerMap.size, 'unique seller(s)');

        // Build seller details for buyer email
        const sellerDetails = Array.from(sellerMap.values()).map(({ seller }) => {
            const sellerAddr = seller.addresses && seller.addresses.length > 0
                ? (seller.addresses.find(a => a.isDefault) || seller.addresses[0])
                : null;
            return {
                name: seller.name,
                email: seller.email,
                phone: seller.phone || 'Not provided',
                address: formatAddress(sellerAddr),
                products: sellerMap.get(seller._id.toString()).items.map(i => i.title)
            };
        });

        console.log('📧 Seller details for buyer email:', JSON.stringify(sellerDetails));

        // ── SEND EMAIL TO BUYER (with seller contact details) ──
        if (buyer && buyer.email) {
            console.log('📧 Sending buyer email to:', buyer.email);
            try {
                // Build items list from cart items (they have title/price from frontend)
                const buyerItems = cartItems.map(item => ({
                    title: item.title,
                    price: item.price,
                    quantity: item.quantity || 1
                }));

                const buyerOrderDetails = {
                    orderId: orderId.toString(),
                    items: buyerItems,
                    totalAmount,
                    orderDate,
                    buyerName: buyer.name,
                    sellerDetails
                };

                await sendOrderEmailToBuyer(buyer.email, buyerOrderDetails);
                console.log('📧 ✅ Buyer email sent successfully to:', buyer.email);
            } catch (err) {
                console.error('📧 ❌ Buyer email FAILED:', err.message);
            }
        } else {
            console.error('📧 ❌ No buyer email found!');
        }

        // ── SEND EMAIL TO EACH SELLER (with buyer contact details) ──
        const buyerId = buyer._id.toString();
        for (const [sellerId, { seller, items }] of sellerMap) {
            // Skip sending seller email if buyer IS the seller (same person)
            if (sellerId === buyerId) {
                console.log(`📧 ⚠️ Skipping seller email for ${seller.name} — buyer and seller are the same person`);
                continue;
            }

            const sellerTotal = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

            console.log('📧 Sending seller email to:', seller.name, '(' + seller.email + ')');
            console.log('📧 Seller items:', JSON.stringify(items));
            console.log('📧 Buyer details for seller:', buyer.name, buyer.email, buyer.phone);

            // Get the buyer's address for shipping
            let address = shippingAddress;
            if (!address && buyer.addresses && buyer.addresses.length > 0) {
                const defaultAddr = buyer.addresses.find(a => a.isDefault) || buyer.addresses[0];
                address = defaultAddr;
            }

            const sellerOrderDetails = {
                orderId: orderId.toString(),
                items: items,
                totalAmount: sellerTotal,
                orderDate,
                sellerName: seller.name,
                buyerDetails: {
                    name: buyer.name,
                    email: buyer.email,
                    phone: buyer.phone || 'Not provided'
                },
                shippingAddress: formatAddress(address)
            };

            try {
                await sendOrderEmailToSeller(seller.email, sellerOrderDetails);
                console.log(`📧 ✅ Seller email sent successfully to: ${seller.email}`);
            } catch (err) {
                console.error(`📧 ❌ Seller email FAILED for ${seller.email}:`, err.message);
            }
        }

        console.log('📧 =============================================');
    } catch (error) {
        console.error('📧 ❌ CRITICAL ERROR in sendOrderEmails:', error.message);
        console.error(error.stack);
    }
};

// Create Razorpay Order
exports.createRazorpayOrder = async (req, res) => {
    const { amount } = req.body;

    try {
        const options = {
            amount: amount * 100, // Razorpay expects amount in paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
            payment_capture: 1 // Auto capture
        };

        const order = await razorpay.orders.create(options);
        res.json({
            success: true,
            order_id: order.id,
            amount: order.amount,
            currency: order.currency,
            key_id: process.env.RAZORPAY_KEY_ID
        });
    } catch (err) {
        console.error('Razorpay Order Error:', err);
        res.status(500).json({ error: 'Failed to create Razorpay order' });
    }
};

// Verify Payment and Create Order
exports.verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, cartItems, totalAmount, shippingAddress } = req.body;

    try {
        // Verify signature
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign)
            .digest('hex');

        if (razorpay_signature !== expectedSign) {
            return res.status(400).json({ error: 'Invalid payment signature' });
        }

        // Payment verified - Create Order
        const commission = totalAmount * 0.03;

        // Generate DAC code
        const dacCode = generateDACCode();
        const hashedDAC = hashDAC(dacCode);

        // Check stock availability and prevent buying own products
        for (const item of cartItems) {
            const product = await Product.findById(item._id).populate('seller', 'email');
            if (!product) {
                return res.status(404).json({ error: `Product not found: ${item.title}` });
            }
            if (product.seller && product.seller._id.toString() === req.user.id) {
                return res.status(400).json({ error: `You cannot buy your own product: ${product.title}` });
            }
            if (product.quantity < (item.quantity || 1)) {
                return res.status(400).json({ error: `Insufficient stock for ${product.title}` });
            }
        }

        const newOrder = new Order({
            buyer: req.user.id,
            products: cartItems.map(item => ({ product: item._id, quantity: item.quantity || 1 })),
            totalAmount,
            commissionAmount: commission,
            status: 'completed',
            deliveryStatus: 'Not Delivered',
            dacCode: hashedDAC,
            paymentId: razorpay_payment_id
        });

        await newOrder.save();

        // Decrement product quantities
        for (const item of cartItems) {
            const quantityOrdered = item.quantity || 1;
            await Product.findByIdAndUpdate(
                item._id,
                { $inc: { quantity: -quantityOrdered } }
            );
        }

        // Send emails to both buyer and sellers
        const buyer = await User.findById(req.user.id);
        await sendOrderEmails(buyer, cartItems, newOrder._id, totalAmount, shippingAddress);

        // Send DAC code email to buyer
        if (buyer && buyer.email) {
            sendDACEmail(buyer.email, buyer.name, dacCode, newOrder._id.toString())
                .then(() => console.log('🔐 DAC email sent to buyer'))
                .catch(err => console.error('🔐 DAC email error:', err.message));
        }

        res.json({
            success: true,
            msg: 'Payment Verified Successfully',
            orderId: newOrder._id,
            paymentId: razorpay_payment_id
        });

    } catch (err) {
        console.error('Payment Verification Error:', err.message);
        res.status(500).json({ error: 'Payment verification failed' });
    }
};

// Legacy mock payment (keeping for backwards compatibility)
exports.processPayment = async (req, res) => {
    const { cartItems, totalAmount, shippingAddress } = req.body;

    // ── DEBUG: Log exactly who is placing this order ──
    const authenticatedUser = await User.findById(req.user.id).select('name email role');
    console.log('🛒 =============================================');
    console.log('🛒 NEW ORDER REQUEST');
    console.log('🛒 Authenticated user ID:', req.user.id);
    console.log('🛒 Authenticated user:', authenticatedUser?.name, '(' + authenticatedUser?.email + ')');
    console.log('🛒 User role:', authenticatedUser?.role);
    console.log('🛒 Token role:', req.user.role);
    console.log('🛒 =============================================');

    try {
        const commission = totalAmount * 0.03;

        // Generate DAC code
        const dacCode = generateDACCode();
        const hashedDAC = hashDAC(dacCode);

        // Check stock availability and prevent buying own products
        for (const item of cartItems) {
            const product = await Product.findById(item._id).populate('seller', 'email');
            if (!product) {
                return res.status(404).json({ error: `Product not found: ${item.title}` });
            }
            if (product.seller && product.seller._id.toString() === req.user.id) {
                return res.status(400).json({ error: `You cannot buy your own product: ${product.title}` });
            }
            if (product.quantity < (item.quantity || 1)) {
                return res.status(400).json({ error: `Insufficient stock for ${product.title}` });
            }
        }

        const newOrder = new Order({
            buyer: req.user.id,
            products: cartItems.map(item => ({ product: item._id, quantity: item.quantity || 1 })),
            totalAmount,
            commissionAmount: commission,
            status: 'completed',
            deliveryStatus: 'Not Delivered',
            dacCode: hashedDAC
        });

        await newOrder.save();

        for (const item of cartItems) {
            const quantityOrdered = item.quantity || 1;
            await Product.findByIdAndUpdate(
                item._id,
                { $inc: { quantity: -quantityOrdered } }
            );
        }

        // Send emails to both buyer and sellers
        const buyer = await User.findById(req.user.id);
        console.log('📧 Order placed by:', buyer.name, `(${buyer.email})`, '- Role:', buyer.role || 'unknown');
        console.log('📧 Sending order emails to buyer and sellers...');
        await sendOrderEmails(buyer, cartItems, newOrder._id, totalAmount, shippingAddress);

        // Send DAC code email to buyer
        if (buyer && buyer.email) {
            sendDACEmail(buyer.email, buyer.name, dacCode, newOrder._id.toString())
                .then(() => console.log('🔐 DAC email sent to buyer'))
                .catch(err => console.error('🔐 DAC email error:', err.message));
        }

        res.json({ msg: 'Payment Successful', orderId: newOrder._id });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getAllTransactions = async (req, res) => {
    try {
        const orders = await Order.find().populate('buyer', 'name');
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get orders for seller (orders containing their products)
exports.getSellerOrders = async (req, res) => {
    try {
        const sellerId = req.user.id;

        // Find products belonging to this seller
        const sellerProducts = await Product.find({ seller: sellerId }).select('_id');
        const productIds = sellerProducts.map(p => p._id);

        // Find orders containing the seller's products
        const orders = await Order.find({
            'products.product': { $in: productIds },
            status: 'completed'
        })
            .populate('buyer', 'name email phone')
            .populate('products.product', 'title price seller image')
            .sort({ createdAt: -1 });

        // Filter products in each order to only show this seller's products
        const sellerOrders = orders.map(order => {
            const orderObj = order.toObject();
            orderObj.products = orderObj.products.filter(p =>
                p.product && productIds.some(id => id.toString() === p.product._id.toString())
            );
            return orderObj;
        });

        res.json(sellerOrders);
    } catch (err) {
        console.error('Get seller orders error:', err.message);
        res.status(500).send('Server Error');
    }
};

// Get orders for buyer
exports.getBuyerOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            buyer: req.user.id,
            status: 'completed'
        })
            .populate('products.product', 'title price image seller')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (err) {
        console.error('Get buyer orders error:', err.message);
        res.status(500).send('Server Error');
    }
};

// Verify DAC code and mark order as delivered
exports.verifyDAC = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { dacCode } = req.body;

        if (!dacCode) {
            return res.status(400).json({ error: 'DAC code is required' });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.deliveryStatus === 'Delivered') {
            return res.status(400).json({ error: 'Order is already marked as delivered' });
        }

        // Verify the seller owns products in this order
        const sellerId = req.user.id;
        const sellerProducts = await Product.find({ seller: sellerId }).select('_id');
        const productIds = sellerProducts.map(p => p._id.toString());
        const hasSellerProduct = order.products.some(p => productIds.includes(p.product.toString()));

        if (!hasSellerProduct) {
            return res.status(403).json({ error: 'You are not authorized to update this order' });
        }

        // Verify DAC code
        const hashedInput = hashDAC(dacCode);
        if (hashedInput !== order.dacCode) {
            return res.status(400).json({ error: 'Invalid DAC code. Please check and try again.' });
        }

        // Update delivery status
        order.deliveryStatus = 'Delivered';
        order.deliveredAt = new Date();
        await order.save();

        res.json({ msg: 'Order marked as delivered successfully', deliveryStatus: 'Delivered' });
    } catch (err) {
        console.error('Verify DAC error:', err.message);
        res.status(500).send('Server Error');
    }
};
