const Product = require('../models/Product');

exports.getProducts = async (req, res) => {
    try {
        // Only return APPROVED products with quantity > 0
        const products = await Product.find({
            quantity: { $gt: 0 },
            status: 'approved'
        }).populate('seller', 'name');
        res.json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.createProduct = async (req, res) => {
    const { title, price, quantity, image, description, model3D, productType } = req.body;
    try {
        // Only apply offers to products priced ₹100 or above
        const offerPercentage = price >= 100 ? Math.floor(Math.random() * 26) + 5 : 0;
        const originalPrice = offerPercentage > 0 ? Math.round(price * 100 / (100 - offerPercentage)) : price;

        const newProduct = new Product({
            title,
            price,
            offerPercentage,
            originalPrice,
            quantity,
            image,
            description,
            model3D,
            productType,
            seller: req.user.id,
            status: 'pending'
        });
        const product = await newProduct.save();
        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getMyProducts = async (req, res) => {
    try {
        const products = await Product.find({ seller: req.user.id });
        res.json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Admin: Get all pending products
exports.getPendingProducts = async (req, res) => {
    try {
        const products = await Product.find({ status: 'pending' }).populate('seller', 'name email');
        res.json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Admin: Approve a product
exports.approveProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { status: 'approved' },
            { new: true }
        ).populate('seller', 'name');

        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        res.json({ msg: 'Product approved successfully', product });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Admin: Reject a product
exports.rejectProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected' },
            { new: true }
        ).populate('seller', 'name');

        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        res.json({ msg: 'Product rejected', product });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

