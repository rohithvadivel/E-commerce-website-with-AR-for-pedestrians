
require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

        console.log('Setting all products to quantity 1...');
        const result = await Product.updateMany({}, { $set: { quantity: 1 } });
        console.log(`Updated ${result.modifiedCount} products to quantity 1.`);

        console.log('\n=== VERIFICATION ===');
        const products = await Product.find({}, 'title quantity');
        products.forEach(p => console.log(`- ${p.title}: Qty ${p.quantity}`));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
})();
