const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);

// ─── GET /api/projects ─────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find({ isActive: true })
      .populate('owner', 'name avatar color')
      .populate('members', 'name avatar color role')
      .sort({ createdAt: -1 });
    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── POST /api/projects  (Admin only) ─────────────────────────
router.post('/', adminOnly, async (req, res) => {
  try {
    const { name, description, color, memberIds } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Project name is required.' });

    const members = memberIds || [];
    const project = await Project.create({
      name, description, color: color || '#4a6cf7',
      owner: req.user._id,
      members: [...new Set([req.user._id.toString(), ...members])]
    });

    await project.populate('owner', 'name avatar color');
    await project.populate('members', 'name avatar color role');

    res.status(201).json({ success: true, message: 'Project created!', project });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/projects/:id ─────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name avatar color')
      .populate('members', 'name avatar color role');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });
    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── PUT /api/projects/:id  (Admin only) ──────────────────────
router.put('/:id', adminOnly, async (req, res) => {
  try {
    const { name, description, color, memberIds } = req.body;
    const update = {};
    if (name) update.name = name;
    if (description !== undefined) update.description = description;
    if (color) update.color = color;
    if (memberIds) update.members = [...new Set([req.user._id.toString(), ...memberIds])];

    const project = await Project.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('owner', 'name avatar color')
      .populate('members', 'name avatar color role');

    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });
    res.json({ success: true, message: 'Project updated!', project });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── DELETE /api/projects/:id  (Admin only) ───────────────────
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    await Project.findByIdAndUpdate(req.params.id, { isActive: false });
    await Task.deleteMany({ project: req.params.id });
    res.json({ success: true, message: 'Project deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
