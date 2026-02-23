const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

const updateAdminRole = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const result = await User.findOneAndUpdate(
            { email: 'vadivelubigil@gmail.com' },
            { role: 'admin' },
            { new: true }
        );

        if (result) {
            console.log('✅ User updated to admin:', result.email);
            console.log('   Role:', result.role);
        } else {
            console.log('❌ User not found with email: vadivelubigil@gmail.com');
        }

        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

updateAdminRole();
