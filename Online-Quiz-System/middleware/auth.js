const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - Verify JWT token
exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'quizpro_secret_key_2026');
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({ success: false, error: 'User no longer exists' });
        }

        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
};

// Role-based authorization middleware
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `User role '${req.user ? req.user.role : 'none'}' is not authorized to access this route`
            });
        }
        next();
    };
};
