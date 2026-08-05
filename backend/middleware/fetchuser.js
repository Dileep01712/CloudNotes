const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'thisistestjwt';

const fetchuser = (req, res, next) => {
    const token = req.header('auth-token');

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Access denied. No token provided.'
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        const res =req.user = decoded.user;
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: 'Invalid token. Please authenticate again.'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token expired. Please log in again.'
            });
        }

        return res.status(401).json({
            success: false,
            error: 'Authentication failed. Please provide a valid token.'
        });
    }
};

module.exports = fetchuser;