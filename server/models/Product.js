const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    productType: {
        type: String,
        enum: ['electronics', 'furniture', 'painting', 'drawings'],
        required: true,
        default: 'electronics'
    },
    price: { type: Number, required: true },
    offerPercentage: { type: Number, min: 5, max: 30, default: () => Math.floor(Math.random() * 26) + 5 }, // Random 5-30%
    originalPrice: { type: Number }, // Auto-calculated inflated price
    quantity: { type: Number, required: true },
    image: { type: String, required: true }, // URL or path
    model3D: { type: String }, // Optional 3D model file path (.glb, .gltf)
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);
