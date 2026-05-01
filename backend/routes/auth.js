const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, protect } = require('../middleware/auth');

// ─── POST /api/auth/signup ─────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }

    // Check if email already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered. Please login.' });
    }

    // First user ever becomes Admin automatically
    const userCount = await User.countDocuments();
    const assignedRole = userCount === 0 ? 'Admin' : (role === 'Admin' ? 'Admin' : 'Member');

    const user = await User.create({ name, email, password, role: assignedRole });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: `Account created! You are ${assignedRole}.`,
      token,
      user
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ─── POST /api/auth/login ──────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Explicitly select password since it's select:false in schema
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated.' });
    }

    const token = generateToken(user._id);

    // Return user without password
    const userData = user.toJSON();

    res.json({ success: true, message: 'Login successful!', token, user: userData });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;
