const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const setupAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const email = 'vadivelubigil@gmail.com';
        const password = 'Admin@12345'; // Meets complexity requirements (uppercase, lowercase, number, symbol? maybe not symbol but length)
        // Let's make it strong just in case: Admin@12345

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let user = await User.findOne({ email });

        if (user) {
            console.log('Admin user found. Updating password and role...');
            user.password = hashedPassword;
            user.role = 'admin';
            user.phoneVerified = true;
            if (!user.phone) user.phone = '+919999999999';
            await user.save();
            console.log('Admin user updated successfully.');
        } else {
            console.log('Admin user not found. Creating new admin...');
            user = new User({
                name: 'Super Admin',
                email: email,
                password: hashedPassword,
                role: 'admin',
                phone: '+919999999999',
                phoneVerified: true,
                addresses: []
            });
            await user.save();
            console.log('Admin user created successfully.');
        }

        console.log(`\ncredentials:\nEmail: ${email}\nPassword: ${password}`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

setupAdmin();
