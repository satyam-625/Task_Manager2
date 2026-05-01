const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);

// ─── GET /api/tasks  (filter by project, assignee, status) ────
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.project)  filter.project  = req.query.project;
    if (req.query.assignee) filter.assignee = req.query.assignee;
    if (req.query.status)   filter.status   = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;

    // Members see only their own tasks; Admins see all
    if (req.user.role === 'Member') filter.assignee = req.user._id;

    const tasks = await Task.find(filter)
      .populate('assignee', 'name avatar color')
      .populate('createdBy', 'name avatar')
      .populate('project', 'name color')
      .sort({ dueDate: 1 });

    res.json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/tasks/my  (current user's tasks) ────────────────
router.get('/my', async (req, res) => {
  try {
    const tasks = await Task.find({ assignee: req.user._id })
      .populate('assignee', 'name avatar color')
      .populate('createdBy', 'name avatar')
      .populate('project', 'name color')
      .sort({ dueDate: 1 });
    res.json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── POST /api/tasks  (Admin: assign to anyone; Member: self only) ──
router.post('/', async (req, res) => {
  try {
    const { title, description, project, assignee, status, priority, dueDate } = req.body;

    if (!title || !project || !assignee || !dueDate) {
      return res.status(400).json({ success: false, message: 'Title, project, assignee and due date are required.' });
    }

    // Members can only assign to themselves
    if (req.user.role === 'Member' && assignee !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Members can only assign tasks to themselves.' });
    }

    const task = await Task.create({
      title, description, project, assignee, status, priority, dueDate,
      createdBy: req.user._id
    });

    await task.populate('assignee', 'name avatar color');
    await task.populate('project', 'name color');
    await task.populate('createdBy', 'name avatar');

    res.status(201).json({ success: true, message: 'Task created!', task });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/tasks/:id ────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name avatar color')
      .populate('createdBy', 'name avatar')
      .populate('project', 'name color');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── PUT /api/tasks/:id ────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    // Members can only update status of their own tasks
    if (req.user.role === 'Member') {
      if (task.assignee.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'You can only update your own tasks.' });
      }
      // Members can only change status
      const { status } = req.body;
      task.status = status || task.status;
    } else {
      // Admin can update everything
      const { title, description, assignee, status, priority, dueDate } = req.body;
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (assignee) task.assignee = assignee;
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (dueDate) task.dueDate = dueDate;
    }

    await task.save();
    await task.populate('assignee', 'name avatar color');
    await task.populate('project', 'name color');

    res.json({ success: true, message: 'Task updated!', task });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// // ─── DELETE /api/tasks/:id  (Admin only) ──────────────────────
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    res.json({ success: true, message: 'Task deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/tasks/stats/dashboard ───────────────────────────
router.get('/stats/dashboard', async (req, res) => {
  try {
    const filter = req.user.role === 'Member' ? { assignee: req.user._id } : {};
    const all      = await Task.countDocuments(filter);
    const todo     = await Task.countDocuments({ ...filter, status: 'todo' });
    const inProg   = await Task.countDocuments({ ...filter, status: 'in-progress' });
    const done     = await Task.countDocuments({ ...filter, status: 'done' });
    const overdue  = await Task.countDocuments({ ...filter, status: { $ne: 'done' }, dueDate: { $lt: new Date() } });

    res.json({ success: true, stats: { all, todo, inProgress: inProg, done, overdue } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});





module.exports = router;
