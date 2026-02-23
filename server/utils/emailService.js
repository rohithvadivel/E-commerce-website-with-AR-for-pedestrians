const nodemailer = require('nodemailer');

// Create transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send order confirmation email to buyer
const sendOrderConfirmationEmail = async (buyerEmail, buyerName, orderDetails) => {
    const { orderId, items, totalAmount, orderDate } = orderDetails;

    // Format items list for email
    const itemsList = items.map(item =>
        `• ${item.title} (Qty: ${item.quantity || 1}) - ₹${item.price}`
    ).join('\n');

    const mailOptions = {
        from: `"Artistry" <${process.env.EMAIL_USER}>`,
        to: buyerEmail,
        subject: `Order Confirmed - ${orderId}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">🎨 Artistry</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Premium Art Marketplace</p>
                </div>
                
                <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
                    <h2 style="color: #1f2937; margin-top: 0;">Order Confirmed! ✓</h2>
                    
                    <p style="color: #4b5563; line-height: 1.6;">
                        Hi <strong>${buyerName}</strong>,<br><br>
                        Thank you for your purchase! Your order has been confirmed and is being processed.
                    </p>
                    
                    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <h3 style="color: #374151; margin-top: 0; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">Order Details</h3>
                        <p style="color: #6b7280; margin: 5px 0;"><strong>Order ID:</strong> ${orderId}</p>
                        <p style="color: #6b7280; margin: 5px 0;"><strong>Date:</strong> ${orderDate}</p>
                        
                        <h4 style="color: #374151; margin: 20px 0 10px 0;">Items Purchased:</h4>
                        <pre style="color: #4b5563; font-family: Arial, sans-serif; white-space: pre-wrap;">${itemsList}</pre>
                        
                        <div style="border-top: 1px solid #e5e7eb; margin-top: 15px; padding-top: 15px;">
                            <p style="color: #1f2937; font-size: 18px; margin: 0;">
                                <strong>Total Paid: ₹${totalAmount}</strong>
                            </p>
                        </div>
                    </div>
                    
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                        If you have any questions about your order, please contact us at 
                        <a href="mailto:${process.env.EMAIL_USER}" style="color: #f59e0b;">${process.env.EMAIL_USER}</a>
                    </p>
                </div>
                
                <div style="background: #1f2937; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
                    <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                        © ${new Date().getFullYear()} Artistry. All rights reserved.
                    </p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Order confirmation email sent to ${buyerEmail}`);
        return true;
    } catch (error) {
        console.error('Error sending email:', error.message);
        return false;
    }
};

// Send OTP verification email
const sendOTPEmail = async (email, otp) => {
    const mailOptions = {
        from: `"Artistry" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Your Verification Code - ${otp}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">🎨 Artistry</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Email Verification</p>
                </div>
                
                <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
                    <h2 style="color: #1f2937; margin-top: 0; text-align: center;">Verify Your Email</h2>
                    
                    <p style="color: #4b5563; line-height: 1.6; text-align: center;">
                        Use the following code to complete your registration:
                    </p>
                    
                    <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center;">
                        <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">Your verification code:</p>
                        <h1 style="color: #1f2937; margin: 0; font-size: 42px; letter-spacing: 8px; font-family: monospace;">${otp}</h1>
                    </div>
                    
                    <p style="color: #6b7280; font-size: 14px; text-align: center;">
                        This code will expire in <strong>5 minutes</strong>.<br>
                        If you didn't request this code, please ignore this email.
                    </p>
                </div>
                
                <div style="background: #1f2937; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
                    <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                        © ${new Date().getFullYear()} Artistry. All rights reserved.
                    </p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP email sent to ${email}`);
        return true;
    } catch (error) {
        console.error('Error sending OTP email:', error.message);
        return false;
    }
};

// Send order notification email to BUYER (with seller details)
const sendOrderEmailToBuyer = async (buyerEmail, orderDetails) => {
    const { orderId, items, totalAmount, orderDate, buyerName, sellerDetails } = orderDetails;

    // Format items list with seller info
    const itemsList = items.map(item => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.title}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity || 1}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${item.price}</td>
        </tr>
    `).join('');

    // Seller contact details section
    const sellerSection = sellerDetails.map(seller => `
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin: 10px 0;">
            <p style="margin: 0; color: #374151;"><strong>Seller:</strong> ${seller.name}</p>
            <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">📧 ${seller.email}</p>
            ${seller.phone && seller.phone !== 'Not provided' ? `<p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">📱 ${seller.phone}</p>` : ''}
            ${seller.address && seller.address !== 'Address not provided' ? `<p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">📍 ${seller.address}</p>` : ''}
            <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Products: ${seller.products.join(', ')}</p>
        </div>
    `).join('');

    const mailOptions = {
        from: `"Artistry" <${process.env.EMAIL_USER}>`,
        to: buyerEmail,
        subject: `Order Confirmed - ${orderId}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">🎨 Artistry</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Order Confirmation</p>
                </div>
                
                <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
                    <h2 style="color: #1f2937; margin-top: 0;">Hi ${buyerName}, Your Order is Confirmed! ✓</h2>
                    
                    <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <p style="color: #6b7280; margin: 5px 0;"><strong>Order ID:</strong> ${orderId}</p>
                        <p style="color: #6b7280; margin: 5px 0;"><strong>Date:</strong> ${orderDate}</p>
                    </div>
                    
                    <h3 style="color: #374151; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">Items Ordered</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f3f4f6;">
                                <th style="padding: 12px; text-align: left;">Product</th>
                                <th style="padding: 12px; text-align: center;">Qty</th>
                                <th style="padding: 12px; text-align: right;">Price</th>
                            </tr>
                        </thead>
                        <tbody>${itemsList}</tbody>
                    </table>
                    
                    <div style="border-top: 2px solid #1f2937; margin-top: 15px; padding-top: 15px; text-align: right;">
                        <p style="color: #1f2937; font-size: 20px; margin: 0;">
                            <strong>Total: ₹${totalAmount}</strong>
                        </p>
                    </div>

                    <h3 style="color: #374151; margin-top: 30px; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">Seller Contact Details</h3>
                    ${sellerSection}
                </div>
                
                <div style="background: #1f2937; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
                    <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                        © ${new Date().getFullYear()} Artistry. Thank you for your purchase!
                    </p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Order confirmation email sent to buyer: ${buyerEmail}`);
        return true;
    } catch (error) {
        console.error('Error sending buyer email:', error.message);
        return false;
    }
};

// Send order notification email to SELLER (with buyer details)
const sendOrderEmailToSeller = async (sellerEmail, orderDetails) => {
    const { orderId, items, totalAmount, orderDate, sellerName, buyerDetails, shippingAddress } = orderDetails;

    // Format items list
    const itemsList = items.map(item => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.title}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity || 1}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${item.price}</td>
        </tr>
    `).join('');

    const mailOptions = {
        from: `"Artistry" <${process.env.EMAIL_USER}>`,
        to: sellerEmail,
        subject: `🎉 New Order Received - ${orderId}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #16a34a, #15803d); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">🎨 Artistry</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">New Sale Notification</p>
                </div>
                
                <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
                    <h2 style="color: #1f2937; margin-top: 0;">Congratulations ${sellerName}! 🎉</h2>
                    <p style="color: #4b5563;">You have received a new order for your product(s).</p>
                    
                    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <p style="color: #166534; margin: 5px 0;"><strong>Order ID:</strong> ${orderId}</p>
                        <p style="color: #166534; margin: 5px 0;"><strong>Date:</strong> ${orderDate}</p>
                    </div>

                    <h3 style="color: #374151; border-bottom: 2px solid #16a34a; padding-bottom: 10px;">Buyer Information</h3>
                    <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin: 15px 0;">
                        <p style="margin: 5px 0; color: #374151;"><strong>👤 Name:</strong> ${buyerDetails.name}</p>
                        <p style="margin: 5px 0; color: #374151;"><strong>📧 Email:</strong> ${buyerDetails.email}</p>
                        <p style="margin: 5px 0; color: #374151;"><strong>📱 Phone:</strong> ${buyerDetails.phone || 'Not provided'}</p>
                    </div>

                    <h3 style="color: #374151; border-bottom: 2px solid #16a34a; padding-bottom: 10px;">Shipping Address</h3>
                    <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin: 15px 0;">
                        <p style="margin: 0; color: #374151;">${shippingAddress || 'Address not provided'}</p>
                    </div>
                    
                    <h3 style="color: #374151; border-bottom: 2px solid #16a34a; padding-bottom: 10px;">Products Sold</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f3f4f6;">
                                <th style="padding: 12px; text-align: left;">Product</th>
                                <th style="padding: 12px; text-align: center;">Qty</th>
                                <th style="padding: 12px; text-align: right;">Price</th>
                            </tr>
                        </thead>
                        <tbody>${itemsList}</tbody>
                    </table>
                    
                    <div style="border-top: 2px solid #1f2937; margin-top: 15px; padding-top: 15px; text-align: right;">
                        <p style="color: #1f2937; font-size: 20px; margin: 0;">
                            <strong>Total: ₹${totalAmount}</strong>
                        </p>
                        <p style="color: #6b7280; font-size: 12px; margin: 5px 0 0 0;">
                            (3% platform commission will be deducted)
                        </p>
                    </div>
                </div>
                
                <div style="background: #1f2937; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
                    <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                        © ${new Date().getFullYear()} Artistry. Please prepare the order for shipping.
                    </p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Order notification email sent to seller: ${sellerEmail}`);
        return true;
    } catch (error) {
        console.error('Error sending seller email:', error.message);
        return false;
    }
};

// Send DAC (Delivery Authentication Code) email to buyer
const sendDACEmail = async (buyerEmail, buyerName, dacCode, orderId) => {
    const mailOptions = {
        from: `"Artistry" <${process.env.EMAIL_USER}>`,
        to: buyerEmail,
        subject: `🔐 Your Delivery Code (DAC) - Order ${orderId}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">🎨 Artistry</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Delivery Authentication Code</p>
                </div>
                
                <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
                    <h2 style="color: #1f2937; margin-top: 0;">Hi ${buyerName},</h2>
                    
                    <p style="color: #4b5563; line-height: 1.6;">
                        Your order <strong>#${orderId}</strong> has been confirmed! Below is your 
                        <strong>Delivery Authentication Code (DAC)</strong>. Share this code with the seller 
                        only after you receive your order to confirm delivery.
                    </p>
                    
                    <div style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border: 2px solid #4f46e5; border-radius: 16px; padding: 30px; margin: 25px 0; text-align: center;">
                        <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Your DAC Code</p>
                        <h1 style="color: #4f46e5; margin: 0; font-size: 48px; letter-spacing: 10px; font-family: monospace; font-weight: 800;">${dacCode}</h1>
                    </div>
                    
                    <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 15px; margin: 20px 0;">
                        <p style="color: #92400e; margin: 0; font-size: 14px;">
                            ⚠️ <strong>Important:</strong> Do NOT share this code until you have physically received your order. 
                            The seller needs this code to confirm delivery.
                        </p>
                    </div>
                    
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                        If you have any questions, contact us at 
                        <a href="mailto:${process.env.EMAIL_USER}" style="color: #4f46e5;">${process.env.EMAIL_USER}</a>
                    </p>
                </div>
                
                <div style="background: #1f2937; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
                    <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                        © ${new Date().getFullYear()} Artistry. Keep your DAC code safe.
                    </p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`DAC email sent to ${buyerEmail}`);
        return true;
    } catch (error) {
        console.error('Error sending DAC email:', error.message);
        return false;
    }
};

// Send Password Reset OTP email
const sendPasswordResetOTPEmail = async (email, otp) => {
    const mailOptions = {
        from: `"Artistry" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Password Reset Verification Code - ${otp}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #ef4444, #b91c1c); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">🎨 Artistry</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Password Reset Request</p>
                </div>
                
                <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
                    <h2 style="color: #1f2937; margin-top: 0; text-align: center;">Reset Your Password</h2>
                    
                    <p style="color: #4b5563; line-height: 1.6; text-align: center;">
                        We received a request to reset the password for your Artistry account associated with this email address.
                        Use the following code to proceed:
                    </p>
                    
                    <div style="background: white; border: 2px solid #ef4444; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center;">
                        <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">Your reset code:</p>
                        <h1 style="color: #1f2937; margin: 0; font-size: 42px; letter-spacing: 8px; font-family: monospace;">${otp}</h1>
                    </div>
                    
                    <p style="color: #6b7280; font-size: 14px; text-align: center;">
                        This code will expire in <strong>5 minutes</strong>.<br>
                        If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                    </p>
                </div>
                
                <div style="background: #1f2937; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
                    <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                        © ${new Date().getFullYear()} Artistry. All rights reserved.
                    </p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Password reset OTP email sent to ${email}`);
        return true;
    } catch (error) {
        console.error('Error sending password reset OTP email:', error.message);
        return false;
    }
};

module.exports = { sendOrderConfirmationEmail, sendOTPEmail, sendOrderEmailToBuyer, sendOrderEmailToSeller, sendDACEmail, sendPasswordResetOTPEmail };
