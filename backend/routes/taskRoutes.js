const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const authenticate = require('../middleware/auth');

router.get('/project/:projectId', authenticate, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.projectId, members: req.user._id });
    if (!project) return res.status(403).json({ error: 'Access denied' });
    const tasks = await Task.find({ project: project._id }).populate('assignee', 'email name');
    res.json(tasks);
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch tasks' });
  }
});

router.post('/project/:projectId', authenticate, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.projectId, members: req.user._id });
    if (!project) return res.status(403).json({ error: 'Access denied' });
    const { title, description, dueDate, status, assignee } = req.body;
    const task = await Task.create({
      project: project._id,
      title,
      description,
      dueDate,
      status: status || 'To Do',
      assignee,
      createdBy: req.user._id,
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create task' });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task || !task.project.members.includes(req.user._id)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (task.status === 'Done' && req.body.status && req.body.status !== 'Done') {
      return res.status(400).json({ error: 'Cannot move a task out of Done.' });
    }
    Object.assign(task, req.body);
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update task' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task || !task.project.members.includes(req.user._id)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (task.status === 'Done') {
      return res.status(400).json({ error: 'Cannot delete a task that is Done.' });
    }
    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;
