const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const users = await User.find({});
        console.log(`Found ${users.length} users:`);
        users.forEach(u => {
            console.log(`- ID: ${u._id}`);
            console.log(`  Email: "${u.email}"`);
            console.log(`  Role: ${u.role}`);
            console.log(`  Password Hash: ${u.password.substring(0, 20)}...`);
            console.log('---');
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
