const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user; // Extract user object from payload
        next();
    } catch (e) {
        res.status(400).json({ msg: 'Token is not valid' });
    }
};

// Role-based middleware: only allow sellers
const sellerOnly = (req, res, next) => {
    if (req.user.role !== 'seller') {
        return res.status(403).json({ msg: 'Access denied. Sellers only.' });
    }
    next();
};

module.exports = auth;
module.exports.sellerOnly = sellerOnly;
