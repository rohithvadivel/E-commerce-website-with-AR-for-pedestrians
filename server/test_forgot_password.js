const http = require('http');

const data = JSON.stringify({ email: 'vadivelubigil@gmail.com' });

const options = {
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/forgot-password',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let responseData = '';

    res.on('data', (d) => {
        responseData += d;
    });

    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', responseData);
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

req.write(data);
req.end();
