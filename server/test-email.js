require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('Testing Email Configuration...');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? `(set - ${process.env.EMAIL_PASS.length} chars)` : '(NOT SET)');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify transporter
transporter.verify((error, success) => {
    if (error) {
        console.log('\n❌ Email configuration ERROR:');
        console.log(error.message);
        console.log('\n📝 Fix: Make sure you are using a Gmail App Password, not your regular password.');
        console.log('   Go to: Google Account > Security > 2-Step Verification > App passwords');
    } else {
        console.log('\n✅ Email configuration is CORRECT!');
        console.log('   Server is ready to send emails.');
    }
    process.exit();
});
