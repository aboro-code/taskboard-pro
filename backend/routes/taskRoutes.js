const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
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

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

router.post('/project/:projectId', authenticate, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.projectId, members: req.user._id });
    if (!project) return res.status(403).json({ error: 'Access denied' });
    let { title, description, dueDate, status, assignee } = req.body;
    const existingTask = await Task.findOne({ project: project._id, title: title.trim() });
    if (existingTask) {
      return res.status(400).json({ error: 'A task with this name already exists in this project.' });
    }
    if (assignee && (!status || status === "To Do")) {
      status = "In Progress";
    }
    const task = await Task.create({
      project: project._id,
      title: title.trim(),
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
    const prevStatus = task.status;
    const wasUnassigned = !task.assignee;
    Object.assign(task, req.body);

    if (
      wasUnassigned &&
      req.body.assignee &&
      (!req.body.status || req.body.status === task.status) &&
      task.status !== 'Done'
    ) {
      task.status = 'In Progress';
    }

    if (
      prevStatus !== 'Done' &&
      task.status === 'Done' &&
      task.assignee
    ) {
      const badge = `Completed task ${task.title} in project ${task.project.title}`;
      await User.findByIdAndUpdate(
        task.assignee,
        { $addToSet: { badges: badge } }
      );
      task.updatedAt = new Date();
    }

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

router.post('/', authenticate, async (req, res) => {
  try {
    const { title, description } = req.body;
    const existingProject = await Project.findOne({ owner: req.user._id, title: title.trim() });
    if (existingProject) {
      return res.status(400).json({ error: 'You already have a project with this name.' });
    }
    const project = await Project.create({
      title: title.trim(),
      description,
      owner: req.user._id,
      members: [req.user._id],
      statuses: ['To Do', 'In Progress', 'Done'],
    });
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create project' });
  }
});

module.exports = router;

