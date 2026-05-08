const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Project, Task, User, ProjectMember } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Helper: check if user is project member
const getProjectMembership = async (projectId, userId) => {
  return ProjectMember.findOne({ where: { projectId, userId } });
};

// List projects for current user
router.get('/', auth, async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'admin') {
      projects = await Project.findAll({
        include: [
          { model: User, as: 'members', attributes: ['id', 'name', 'email', 'role'], through: { attributes: ['role'] } },
          { model: Task, as: 'tasks', attributes: ['id', 'status'] },
        ],
        order: [['createdAt', 'DESC']],
      });
    } else {
      projects = await Project.findAll({
        include: [
          { model: User, as: 'members', attributes: ['id', 'name', 'email', 'role'], through: { attributes: ['role'] }, where: { id: req.user.id }, required: true },
          { model: Task, as: 'tasks', attributes: ['id', 'status'] },
        ],
        order: [['createdAt', 'DESC']],
      });
    }
    res.json({ projects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create project (admin only)
router.post('/', auth, [
  body('name').trim().notEmpty().withMessage('Project name required'),
], async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, description, color, dueDate, memberIds } = req.body;
  try {
    const project = await Project.create({ name, description, color, dueDate });
    // Add creator as owner
    await ProjectMember.create({ projectId: project.id, userId: req.user.id, role: 'owner' });
    // Add other members
    if (memberIds && memberIds.length > 0) {
      for (const uid of memberIds) {
        if (uid !== req.user.id) {
          await ProjectMember.create({ projectId: project.id, userId: uid, role: 'member' });
        }
      }
    }
    const full = await Project.findByPk(project.id, {
      include: [{ model: User, as: 'members', attributes: ['id', 'name', 'email'], through: { attributes: ['role'] } }],
    });
    res.status(201).json({ project: full });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: User, as: 'members', attributes: ['id', 'name', 'email', 'role'], through: { attributes: ['role'] } },
        { model: Task, as: 'tasks', include: [
          { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
          { model: User, as: 'creator', attributes: ['id', 'name'] },
        ], order: [['order', 'ASC']] },
      ],
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Access check
    if (req.user.role !== 'admin') {
      const membership = await getProjectMembership(project.id, req.user.id);
      if (!membership) return res.status(403).json({ error: 'Access denied' });
    }
    res.json({ project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update project (admin only)
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: 'Not found' });
    await project.update(req.body);
    res.json({ project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add member to project (admin only)
router.post('/:id/members', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const { userId, role } = req.body;
  try {
    const existing = await getProjectMembership(req.params.id, userId);
    if (existing) return res.status(400).json({ error: 'Already a member' });
    await ProjectMember.create({ projectId: req.params.id, userId, role: role || 'member' });
    res.json({ message: 'Member added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove member (admin only)
router.delete('/:id/members/:userId', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  try {
    await ProjectMember.destroy({ where: { projectId: req.params.id, userId: req.params.userId } });
    res.json({ message: 'Member removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete project (admin only)
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: 'Not found' });
    await project.destroy();
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
