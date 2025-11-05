const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const User = require('../Models/userModel');
const { signjwt } = require('../services/jwt.service');

// Set Cookie Helper Function
function setCookie(res, token) {
  res.cookie(process.env.COOKIE_NAME || 'token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // only secure in production
    sameSite: 'lax', // fixed typo: '1ax' → 'lax'
    maxAge: 2 * 60 * 60 * 1000, // 2 hours
  });
}

// Register Controller
async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password and save
    const hashedPass = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPass });

    return res
      .status(201)
      .json({ id: user._id, email: user.email, name: user.name });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Registration failed' });
  }
}

// Login Controller
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const matchPass = await bcrypt.compare(password, user.password);
    if (!matchPass) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create new session
    const sessionId = uuidv4();
    user.sessionId = sessionId;
    await user.save();

    // Generate JWT
    const token = signjwt({ userId: user._id, sessionId, role: user.role });

    // Set cookie
    setCookie(res, token);

    return res.json({ message: 'Logged in successfully' });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Login failed' });
  }
}

//  Logout Controller
async function logout(req, res) {
  try {
    const userId = req.user?.id;

    if (userId) {
      await User.findByIdAndUpdate(userId, { sessionId: null });
    }

    res.clearCookie(process.env.COOKIE_NAME || 'token');
    return res.json({ message: 'Logout successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ message: 'Logout failed' });
  }
}

// Get Authenticated User
async function user(req, res) {
  res.json({ user: req.user });
}

// Export Controllers
module.exports = {
  register,
  login,
  logout,
  user,
};
