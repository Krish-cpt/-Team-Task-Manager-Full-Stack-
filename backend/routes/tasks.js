const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Task, Project, User, ProjectMember } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get tasks (with filters)
router.get('/', auth, async (req, res) => {
  const { projectId, status, priority, assigneeId, overdue } = req.query;
  try {
    const where = {};
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;
    if (overdue === 'true') {
      where.dueDate = { [Op.lt]: new Date().toISOString().split('T')[0] };
      where.status = { [Op.ne]: 'done' };
    }

    // If not admin, only show tasks in projects the user is member of
    let projectIds;
    if (req.user.role !== 'admin') {
      const memberships = await ProjectMember.findAll({ where: { userId: req.user.id } });
      projectIds = memberships.map(m => m.projectId);
      where.projectId = { [Op.in]: projectIds };
    }

    const tasks = await Task.findAll({
      where,
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name'] },
        { model: Project, attributes: ['id', 'name', 'color'] },
      ],
      order: [['dueDate', 'ASC'], ['priority', 'DESC']],
    });
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create task
router.post('/', auth, [
  body('title').trim().notEmpty().withMessage('Title required'),
  body('projectId').notEmpty().withMessage('Project required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { title, description, projectId, assigneeId, priority, dueDate, status } = req.body;
  try {
    // Check access
    if (req.user.role !== 'admin') {
      const membership = await ProjectMember.findOne({ where: { projectId, userId: req.user.id } });
      if (!membership) return res.status(403).json({ error: 'Not a project member' });
    }

    const count = await Task.count({ where: { projectId } });
    const task = await Task.create({
      title, description, projectId, assigneeId: assigneeId || null,
      creatorId: req.user.id, priority, dueDate, status, order: count,
    });

    const full = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name'] },
        { model: Project, attributes: ['id', 'name', 'color'] },
      ],
    });
    res.status(201).json({ task: full });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Check access
    if (req.user.role !== 'admin') {
      const membership = await ProjectMember.findOne({ where: { projectId: task.projectId, userId: req.user.id } });
      if (!membership) return res.status(403).json({ error: 'Access denied' });
    }

    const allowed = ['title', 'description', 'status', 'priority', 'assigneeId', 'dueDate', 'order'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    await task.update(updates);
    const full = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name'] },
        { model: Project, attributes: ['id', 'name', 'color'] },
      ],
    });
    res.json({ task: full });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ error: 'Not found' });

    if (req.user.role !== 'admin') {
      const membership = await ProjectMember.findOne({ where: { projectId: task.projectId, userId: req.user.id } });
      if (!membership || (membership.role === 'member' && task.creatorId !== req.user.id)) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    await task.destroy();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dashboard stats
router.get('/stats/dashboard', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    let projectFilter = {};
    if (req.user.role !== 'admin') {
      const memberships = await ProjectMember.findAll({ where: { userId: req.user.id } });
      const projectIds = memberships.map(m => m.projectId);
      projectFilter = { projectId: { [Op.in]: projectIds } };
    }

    const [total, todo, inProgress, review, done, overdue, myTasks] = await Promise.all([
      Task.count({ where: { ...projectFilter } }),
      Task.count({ where: { ...projectFilter, status: 'todo' } }),
      Task.count({ where: { ...projectFilter, status: 'in_progress' } }),
      Task.count({ where: { ...projectFilter, status: 'review' } }),
      Task.count({ where: { ...projectFilter, status: 'done' } }),
      Task.count({ where: { ...projectFilter, dueDate: { [Op.lt]: today }, status: { [Op.ne]: 'done' } } }),
      Task.count({ where: { ...projectFilter, assigneeId: req.user.id } }),
    ]);

    res.json({ stats: { total, todo, inProgress, review, done, overdue, myTasks } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
