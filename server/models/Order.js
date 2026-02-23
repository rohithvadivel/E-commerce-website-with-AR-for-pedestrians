const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, default: 1 }
    }],
    totalAmount: { type: Number, required: true },
    commissionAmount: { type: Number, required: true }, // 3% of total
    status: { type: String, default: 'pending', enum: ['pending', 'completed'] },
    deliveryStatus: { type: String, default: 'Not Delivered', enum: ['Not Delivered', 'Delivered'] },
    dacCode: { type: String }, // Hashed DAC code for delivery verification
    deliveredAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
