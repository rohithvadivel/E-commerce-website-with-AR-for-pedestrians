const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getUser,
    sendSignupOTP,
    verifySignupOTP,
    sendEmailOTP,
    verifyEmailOTP,
    changePassword,
    forgotPassword,
    verifyForgotPasswordOTP,
    resetPassword
} = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

// Registration with OTP verification
router.post('/register/send-email-otp', sendEmailOTP);
router.post('/register/verify-email-otp', verifyEmailOTP);
router.post('/register/send-otp', sendSignupOTP);
router.post('/register/verify-otp', verifySignupOTP);
router.post('/register', register);

router.post('/login', login);
router.get('/', auth, getUser);
router.put('/change-password', auth, changePassword);

// Forgot Password Flow
router.post('/forgot-password', forgotPassword);
router.post('/verify-forgot-password-otp', verifyForgotPasswordOTP);
router.post('/reset-password', resetPassword);

module.exports = router;
