const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
    label: { type: String, default: 'Home' }, // Home, Work, Other
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
});

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['admin', 'buyer', 'seller'],
        default: 'buyer'
    },
    phone: { type: String },
    phoneVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiry: { type: Date },
    addresses: [AddressSchema],
    requiresPasswordChange: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
