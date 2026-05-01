const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// All routes require login
router.use(protect);

// ─── GET /api/users  (Admin: all users, Member: just team members) ──
router.get('/', async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).sort({ createdAt: 1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── POST /api/users  (Admin: add member directly) ──────────────
router.post('/', adminOnly, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password required.' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already exists.' });
    }
    const user = await User.create({ name, email, password, role: role || 'Member' });
    res.status(201).json({ success: true, message: 'Member added successfully!', user });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── PUT /api/users/:id  (Admin: update role/status) ────────────
router.put('/:id', adminOnly, async (req, res) => {
  try {
    const { role, isActive, name } = req.body;

    // Prevent demoting yourself
    if (req.params.id === req.user._id.toString() && role === 'Member') {
      return res.status(400).json({ success: false, message: 'You cannot change your own role.' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...(role && { role }), ...(isActive !== undefined && { isActive }), ...(name && { name }) },
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, message: 'User updated!', user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── DELETE /api/users/:id  (Admin only) ──────────────────────
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete yourself.' });
    }
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Member removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
