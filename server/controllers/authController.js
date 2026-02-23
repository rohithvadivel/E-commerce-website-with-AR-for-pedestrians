const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');
const { validatePassword, passwordMeetsRequirements } = require('../utils/passwordValidator');
const { sendOTPEmail, sendPasswordResetOTPEmail } = require('../utils/emailService');

// Initialize Twilio client
const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// In-memory store for pending OTP verification during signup
// In production, consider using Redis or similar
const pendingSignups = new Map();
const pendingEmailOTPs = new Map();

// Generate random 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP for signup (before account creation)
exports.sendSignupOTP = async (req, res) => {
    const { phone, role } = req.body;

    if (!phone || phone.length < 10) {
        return res.status(400).json({ msg: 'Valid phone number required' });
    }

    // Format phone number for India (add +91 if not present)
    let formattedPhone = phone;
    if (!phone.startsWith('+')) {
        formattedPhone = '+91' + phone.replace(/^0+/, '');
    }

    try {
        // Check if phone already exists for the same role
        // Allow same phone for different roles (buyer can also be seller)
        const existingUser = await User.findOne({ phone: formattedPhone, role: role, phoneVerified: true });
        if (existingUser) {
            return res.status(400).json({ msg: `Phone number already registered as a ${role}` });
        }

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Store pending signup OTP
        pendingSignups.set(formattedPhone, { otp, otpExpiry, verified: false });

        // Send SMS via Twilio
        await twilioClient.messages.create({
            body: `Your Artistry verification code is: ${otp}. Valid for 5 minutes.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedPhone
        });

        console.log(`📱 Signup OTP sent to ${formattedPhone}`);
        res.json({ msg: 'OTP sent successfully!', phone: formattedPhone });
    } catch (err) {
        console.error('OTP Error:', err.message);
        res.status(500).json({ msg: 'Failed to send OTP. Please check your phone number.' });
    }
};

// Verify OTP during signup
exports.verifySignupOTP = async (req, res) => {
    const { phone, otp } = req.body;

    // Format phone number
    let formattedPhone = phone;
    if (!phone.startsWith('+')) {
        formattedPhone = '+91' + phone.replace(/^0+/, '');
    }

    const pending = pendingSignups.get(formattedPhone);

    if (!pending) {
        return res.status(400).json({ msg: 'No OTP request found. Please request a new OTP.' });
    }

    if (new Date() > pending.otpExpiry) {
        pendingSignups.delete(formattedPhone);
        return res.status(400).json({ msg: 'OTP has expired. Please request a new one.' });
    }

    if (pending.otp !== otp) {
        return res.status(400).json({ msg: 'Invalid OTP. Please try again.' });
    }

    // Mark as verified
    pendingSignups.set(formattedPhone, { ...pending, verified: true });

    res.json({ msg: 'Phone verified successfully!', verified: true });
};

// Send Email OTP for signup
exports.sendEmailOTP = async (req, res) => {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
        return res.status(400).json({ msg: 'Valid email address required' });
    }

    try {
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: 'Email already registered' });
        }

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Store pending email OTP
        pendingEmailOTPs.set(email, { otp, otpExpiry, verified: false });

        // Send OTP via email
        const emailSent = await sendOTPEmail(email, otp);

        if (!emailSent) {
            return res.status(500).json({ msg: 'Failed to send verification email. Please try again.' });
        }

        console.log(`📧 Email OTP sent to ${email}`);
        res.json({ msg: 'Verification code sent to your email!', email });
    } catch (err) {
        console.error('Email OTP Error:', err.message);
        res.status(500).json({ msg: 'Failed to send verification email.' });
    }
};

// Verify Email OTP during signup
exports.verifyEmailOTP = async (req, res) => {
    const { email, otp } = req.body;

    const pending = pendingEmailOTPs.get(email);

    if (!pending) {
        return res.status(400).json({ msg: 'No verification request found. Please request a new code.' });
    }

    if (new Date() > pending.otpExpiry) {
        pendingEmailOTPs.delete(email);
        return res.status(400).json({ msg: 'Verification code has expired. Please request a new one.' });
    }

    if (pending.otp !== otp) {
        return res.status(400).json({ msg: 'Invalid verification code. Please try again.' });
    }

    // Mark as verified
    pendingEmailOTPs.set(email, { ...pending, verified: true });

    res.json({ msg: 'Email verified successfully!', verified: true });
};

exports.register = async (req, res) => {
    let { name, email, password, role, phone, address } = req.body;
    email = email.toLowerCase().trim();

    // Format phone number
    let formattedPhone = phone;
    if (phone && !phone.startsWith('+')) {
        formattedPhone = '+91' + phone.replace(/^0+/, '');
    }

    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        // Validate password strength
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                msg: 'Password does not meet requirements',
                errors: passwordValidation.errors
            });
        }

        // Verify email was verified via OTP
        const pendingEmail = pendingEmailOTPs.get(email);
        if (!pendingEmail || !pendingEmail.verified) {
            return res.status(400).json({ msg: 'Email not verified. Please verify your email first.' });
        }

        // Verify phone was verified via OTP
        const pending = pendingSignups.get(formattedPhone);
        if (!pending || !pending.verified) {
            return res.status(400).json({ msg: 'Phone number not verified. Please verify your phone first.' });
        }

        // Restrict admin role to specific email
        let finalRole = role;
        if (email === 'vadivelubigil@gmail.com') {
            finalRole = 'admin'; // Always make this email an admin
        } else if (role === 'admin') {
            finalRole = 'buyer'; // Force to buyer if unauthorized admin attempt
        }

        user = new User({
            name,
            email,
            password,
            role: finalRole,
            phone: formattedPhone,
            phoneVerified: true,
            addresses: address ? [{
                label: 'Home',
                fullName: name,
                phone: formattedPhone,
                addressLine1: address.addressLine1,
                addressLine2: address.addressLine2 || '',
                city: address.city,
                state: address.state,
                pincode: address.pincode,
                isDefault: true
            }] : []
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Clean up pending signup
        pendingSignups.delete(formattedPhone);

        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    phoneVerified: user.phoneVerified
                }
            });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.login = async (req, res) => {
    let { email, password } = req.body;
    email = email.toLowerCase().trim();
    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        // Check if password meets current requirements
        const passwordValidation = validatePassword(password);
        let requiresPasswordChange = !passwordValidation.isValid;

        // Update user's requiresPasswordChange flag if needed
        if (requiresPasswordChange && !user.requiresPasswordChange) {
            user.requiresPasswordChange = true;
            await user.save();
        }

        // Extra safeguard: Only one specific email can be admin
        let finalRole = user.role;
        if (user.role === 'admin' && user.email !== 'vadivelubigil@gmail.com') {
            finalRole = 'buyer'; // Treat as buyer if somehow another user has admin role
        }

        const payload = { user: { id: user.id, role: finalRole } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: finalRole,
                    requiresPasswordChange: requiresPasswordChange
                }
            });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Current password is incorrect' });
        }

        // Validate new password strength
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                msg: 'New password does not meet requirements',
                errors: passwordValidation.errors
            });
        }

        // Hash and save new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.requiresPasswordChange = false;
        await user.save();

        res.json({ msg: 'Password changed successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const pendingPasswordResets = new Map();

// Generate OTP for forgot password
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
        return res.status(400).json({ msg: 'Valid email address required' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            // Give a generic message to prevent email enumeration
            return res.json({ msg: 'If this email is registered, a reset code will be sent.' });
        }

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        pendingPasswordResets.set(email, { otp, otpExpiry, verified: false });

        const emailSent = await sendPasswordResetOTPEmail(email, otp);

        if (!emailSent) {
            return res.status(500).json({ msg: 'Failed to send reset email. Please try again.' });
        }

        console.log(`🔑 Password reset OTP sent to ${email}`);
        res.json({ msg: 'If this email is registered, a reset code will be sent.', email });
    } catch (err) {
        console.error('Forgot Password Error:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Verify Forgot Password OTP
exports.verifyForgotPasswordOTP = async (req, res) => {
    const { email, otp } = req.body;

    const pending = pendingPasswordResets.get(email);

    if (!pending) {
        return res.status(400).json({ msg: 'No reset request found or expired. Please request a new code.' });
    }

    if (new Date() > pending.otpExpiry) {
        pendingPasswordResets.delete(email);
        return res.status(400).json({ msg: 'Reset code has expired. Please request a new one.' });
    }

    if (pending.otp !== otp) {
        return res.status(400).json({ msg: 'Invalid reset code. Please try again.' });
    }

    pendingPasswordResets.set(email, { ...pending, verified: true });
    res.json({ msg: 'Email verified successfully!', verified: true });
};

// Reset Password
exports.resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;

    const pending = pendingPasswordResets.get(email);

    if (!pending || !pending.verified) {
        return res.status(400).json({ msg: 'Email not verified or session expired.' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                msg: 'Password does not meet requirements',
                errors: passwordValidation.errors
            });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.requiresPasswordChange = false; // Reset complete

        await user.save();

        // Clean up
        pendingPasswordResets.delete(email);

        res.json({ msg: 'Password has been reset successfully. You can now login.' });
    } catch (err) {
        console.error('Reset Password Error:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
};
