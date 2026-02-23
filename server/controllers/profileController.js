const User = require('../models/User');
const twilio = require('twilio');

// Initialize Twilio client
const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -otp -otpExpiry');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update profile
exports.updateProfile = async (req, res) => {
    const { name, phone } = req.body;
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, phone },
            { new: true }
        ).select('-password -otp -otpExpiry');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Add address
exports.addAddress = async (req, res) => {
    const { label, fullName, phone, addressLine1, addressLine2, city, state, pincode, isDefault } = req.body;
    try {
        const user = await User.findById(req.user.id);

        // If this is set as default, unset other defaults
        if (isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        user.addresses.push({
            label, fullName, phone, addressLine1, addressLine2, city, state, pincode, isDefault
        });

        await user.save();
        res.json(user.addresses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update address
exports.updateAddress = async (req, res) => {
    const { addressId } = req.params;
    const { label, fullName, phone, addressLine1, addressLine2, city, state, pincode, isDefault } = req.body;

    try {
        const user = await User.findById(req.user.id);
        const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);

        if (addressIndex === -1) {
            return res.status(404).json({ msg: 'Address not found' });
        }

        // If this is set as default, unset other defaults
        if (isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        user.addresses[addressIndex] = {
            ...user.addresses[addressIndex].toObject(),
            label, fullName, phone, addressLine1, addressLine2, city, state, pincode, isDefault
        };

        await user.save();
        res.json(user.addresses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Delete address
exports.deleteAddress = async (req, res) => {
    const { addressId } = req.params;

    try {
        const user = await User.findById(req.user.id);
        user.addresses = user.addresses.filter(addr => addr._id.toString() !== addressId);
        await user.save();
        res.json(user.addresses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Generate random 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via Twilio SMS
exports.sendOTP = async (req, res) => {
    const { phone } = req.body;

    if (!phone || phone.length < 10) {
        return res.status(400).json({ msg: 'Valid phone number required' });
    }

    // Format phone number for India (add +91 if not present)
    let formattedPhone = phone;
    if (!phone.startsWith('+')) {
        formattedPhone = '+91' + phone.replace(/^0+/, ''); // Remove leading zeros and add +91
    }

    try {
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Save OTP to database
        await User.findByIdAndUpdate(req.user.id, {
            phone: formattedPhone,
            otp,
            otpExpiry,
            phoneVerified: false
        });

        try {
            // Send SMS via Twilio
            await twilioClient.messages.create({
                body: `Your Artistry verification code is: ${otp}. Valid for 5 minutes.`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: formattedPhone
            });
            console.log(`📱 OTP sent to ${formattedPhone} via Twilio`);
        } catch (twilioErr) {
            console.warn('⚠️ Twilio message failed (likely trial account restrictions). Using mock SMS.');
            console.log(`📱 [MOCK SMS] verification code for ${formattedPhone} is: ${otp}`);
        }

        res.json({ msg: 'OTP sent successfully to your phone!' });
    } catch (err) {
        console.error('Failed to process OTP request:', err.message);
        res.status(500).json({ msg: 'Failed to process OTP request.' });
    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    const { otp } = req.body;

    try {
        const user = await User.findById(req.user.id);

        if (!user.otp || !user.otpExpiry) {
            return res.status(400).json({ msg: 'No OTP request found. Please request a new OTP.' });
        }

        if (new Date() > user.otpExpiry) {
            return res.status(400).json({ msg: 'OTP has expired. Please request a new one.' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ msg: 'Invalid OTP. Please try again.' });
        }

        // OTP verified successfully
        user.phoneVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        res.json({ msg: 'Phone number verified successfully!', phoneVerified: true });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Send OTP for Address Phone Verification
exports.sendAddressOTP = async (req, res) => {
    const { phone } = req.body;

    if (!phone || phone.length < 10) {
        return res.status(400).json({ msg: 'Valid phone number required' });
    }

    let formattedPhone = phone;
    if (!phone.startsWith('+')) {
        formattedPhone = '+91' + phone.replace(/^0+/, '');
    }

    try {
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // ONLY update OTP tracking flags, DO NOT override primary user phone
        await User.findByIdAndUpdate(req.user.id, {
            otp,
            otpExpiry
        });

        try {
            // Send SMS via Twilio
            await twilioClient.messages.create({
                body: `Your Artistry Address Verification code is: ${otp}. Valid for 5 minutes.`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: formattedPhone
            });
            console.log(`📱 Address OTP sent to ${formattedPhone} via Twilio`);
        } catch (twilioErr) {
            console.warn('⚠️ Twilio message failed (likely trial account restrictions). Using mock SMS.');
            console.log(`📱 [MOCK SMS] Address Verification code for ${formattedPhone} is: ${otp}`);
        }

        res.json({ msg: 'OTP sent successfully to the provided phone number!' });
    } catch (err) {
        console.error('Failed to process OTP request:', err.message);
        res.status(500).json({ msg: 'Failed to process OTP request.' });
    }
};

// Verify OTP for Address Phone
exports.verifyAddressOTP = async (req, res) => {
    const { otp } = req.body;

    try {
        const user = await User.findById(req.user.id);

        if (!user.otp || !user.otpExpiry) {
            return res.status(400).json({ msg: 'No OTP request found. Please request a new OTP.' });
        }

        if (new Date() > user.otpExpiry) {
            return res.status(400).json({ msg: 'OTP has expired. Please request a new one.' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ msg: 'Invalid OTP. Please try again.' });
        }

        // OTP verified successfully for the address
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        res.json({ msg: 'Phone number verified successfully for this address!' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
