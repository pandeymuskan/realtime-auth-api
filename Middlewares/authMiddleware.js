const { verifyJwt } = require('../services/jwt.service');
const User = require('../Models/userModel');

/**
 * Authentication Middleware
 * Verifies JWT from cookies and checks session validity
 */
async function authMiddleware(req, res, next) {
  try {
    //  Extract token from cookies
    const token = req.cookies?.[process.env.COOKIE_NAME || 'token'];
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Verify JWT
    const decoded = verifyJwt(token);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Fetch user from DB
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Validate session
    if (user.sessionId !== decoded.sessionId) {
      return res.status(401).json({ message: 'Session expired or invalid' });
    }

    //  Attach user to request
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err);
    return res.status(401).json({ message: 'Authentication failed' });
  }
}

module.exports = authMiddleware;
