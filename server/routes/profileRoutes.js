const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
    getProfile,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    sendOTP,
    verifyOTP,
    sendAddressOTP,
    verifyAddressOTP
} = require('../controllers/profileController');

// Profile routes
router.get('/', auth, getProfile);
router.put('/', auth, updateProfile);

// Address routes
router.post('/address', auth, addAddress);
router.put('/address/:addressId', auth, updateAddress);
router.delete('/address/:addressId', auth, deleteAddress);

// OTP routes
router.post('/send-otp', auth, sendOTP);
router.post('/verify-otp', auth, verifyOTP);

// Address OTP routes
router.post('/address/send-otp', auth, sendAddressOTP);
router.post('/address/verify-otp', auth, verifyAddressOTP);

module.exports = router;
