const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler'); // If you use this for catching async errors

module.exports = asyncHandler(async (req, res, next) => {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ✅ Fix: Attach the user field from the token
        req.user = decoded.user;

        if (!req.user || !req.user.id) {
            return res.status(401).json({ msg: 'Token decoded but user ID missing' });
        }

        next();
    } catch (err) {
        console.error('JWT verification failed:', err.message);
        res.status(401).json({ msg: 'Token is not valid' });
    }
});
