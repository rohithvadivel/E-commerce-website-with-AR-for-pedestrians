const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
    processPayment,
    getAllTransactions,
    createRazorpayOrder,
    verifyPayment,
    getSellerOrders,
    getBuyerOrders,
    verifyDAC
} = require('../controllers/paymentController');

// Razorpay routes
router.post('/create-order', auth, createRazorpayOrder);
router.post('/verify', auth, verifyPayment);

// Mock payment route (for demo/testing)
router.post('/mock-confirm', auth, processPayment);

// Legacy route (mock payment)
router.post('/', auth, processPayment);

// Admin transactions
router.get('/transactions', auth, getAllTransactions);

// Seller orders
router.get('/seller-orders', auth, getSellerOrders);

// Buyer orders
router.get('/buyer-orders', auth, getBuyerOrders);

// Verify DAC and mark delivered
router.put('/verify-dac/:orderId', auth, verifyDAC);

module.exports = router;

