const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const authenticate = require('../middleware/auth');

// Get all projects for the authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    // Debug log
    console.log('Fetching projects for user:', req.user._id, req.user.email);
    const projects = await Project.find({ members: req.user._id });
    projects.forEach(p => {
      console.log('Project:', p.title, 'Members:', p.members);
    });
    console.log('Projects found:', projects.length);
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Create a new project
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, description, statuses } = req.body;
    // Ensure members is always an array of ObjectIds
    const project = await Project.create({
      title,
      description,
      owner: req.user._id,
      members: [req.user._id], // always use ObjectId
      statuses: statuses && statuses.length ? statuses : undefined,
    });
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create project' });
  }
});

// Get a single project by ID (if user is a member)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, members: req.user._id })
      .populate('members', 'email name');
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: 'Invalid project ID' });
  }
});

// Update a project (only owner)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true }
    );
    if (!project) return res.status(404).json({ error: 'Project not found or not owner' });
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update project' });
  }
});

// Delete a project (only owner)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!project) return res.status(404).json({ error: 'Project not found or not owner' });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete project' });
  }
});

// Invite user to project by email (owner only)
router.post('/:id/invite', authenticate, async (req, res) => {
  try {
    const { email } = req.body;
    const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
    if (!project) return res.status(404).json({ error: 'Project not found or not owner' });

    const User = require('../models/User');
    const userToInvite = await User.findOne({ email });
    if (!userToInvite) return res.status(404).json({ error: 'User not found' });

    // Ensure all member ObjectIds are strings for comparison
    const memberIds = project.members.map(m => String(m));
    if (!memberIds.includes(String(userToInvite._id))) {
      project.members.push(userToInvite._id);
      await project.save();
    }

    // Populate members for frontend consistency
    await project.populate('members', 'email name');
    res.json({ message: 'User invited', project });
  } catch (err) {
    res.status(400).json({ error: 'Failed to invite user' });
  }
});

module.exports = router;
