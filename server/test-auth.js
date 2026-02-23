const API_URL = 'http://localhost:5001/api/auth';

const post = async (url, data) => {
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    const text = await res.text();
    try {
        const json = JSON.parse(text);
        if (!res.ok) {
            throw new Error(json.msg || res.statusText);
        }
        return json;
    } catch (e) {
        console.error('Response Status:', res.status);
        console.error('Raw Response:', text);
        throw new Error('Failed to parse JSON response');
    }
};

const testAuth = async () => {
    try {
        const uniqueEmail = `test${Date.now()}@example.com`;
        const user = {
            name: 'Test User',
            email: uniqueEmail,
            password: 'password123',
            role: 'buyer'
        };

        console.log('1. Testing Register...');
        const regRes = await post(`${API_URL}/register`, user);
        console.log('Register Success:', regRes.token ? 'Has Token' : 'No Token');

        console.log('2. Testing Login...');
        const loginRes = await post(`${API_URL}/login`, {
            email: uniqueEmail,
            password: 'password123'
        });
        console.log('Login Success:', loginRes.token ? 'Has Token' : 'No Token');

    } catch (err) {
        console.error('Error:', err.message);
    }
};

testAuth();
