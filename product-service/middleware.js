const jwt = require('jsonwebtoken');
require('dotenv').config();

function authenticate(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token tidak ada' });
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        res.status(403).json({ message: 'Token tidak valid' });
    }
}

function adminOnly(req, res, next) {
    if (req.user.role !== 'admin')
        return res.status(403).json({ message: 'Hanya admin' });
    next();
}

module.exports = { authenticate, adminOnly };