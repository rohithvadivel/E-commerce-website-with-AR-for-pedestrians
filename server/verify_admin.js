const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const verifyAdmin = async () => {
    try {
        console.log('Attempting login...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'vadivelubigil@gmail.com',
            password: 'Admin@12345'
        });

        const token = loginRes.data.token;
        console.log('Login successful. Token received.');

        if (loginRes.data.user.role !== 'admin') {
            console.error('User is not admin!', loginRes.data.user);
            process.exit(1);
        }

        console.log('Attempting to fetch admin stats...');
        // Try to fetch something only admin can see, e.g. pending products
        const productsRes = await axios.get(`${API_URL}/products/pending`, {
            headers: { 'x-auth-token': token }
        });

        console.log(`Success! Fetched ${productsRes.data.length} pending products.`);
        process.exit(0);
    } catch (err) {
        console.error('Verification failed:', err.response ? err.response.data : err.message);
        process.exit(1);
    }
};

verifyAdmin();
