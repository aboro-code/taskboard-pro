const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const authenticate = require('../middleware/auth');

// Get tasks for a project
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

// Create a new task in a project
router.post('/project/:projectId', authenticate, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.projectId, members: req.user._id });
    if (!project) return res.status(403).json({ error: 'Access denied' });
    const { title, description, dueDate, status, assignee } = req.body;

    // If assignee is set and status is "To Do", force status to "In Progress"
    if (assignee && (!status || status === "To Do")) {
      status = "In Progress";
    }

    const existingTask = await Task.findOne({ project: project._id, title: title.trim() });
    if (existingTask) {
      return res.status(400).json({ error: 'A task with this name already exists in this project.' });
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

// Update a task
router.put('/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task || !task.project.members.includes(req.user._id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // If the task is being moved out of Done, prevent it
    if (task.status === 'Done' && req.body.status && req.body.status !== 'Done') {
      return res.status(400).json({ error: 'Cannot move a task out of Done.' });
    }

    const prevStatus = task.status;
    const prevAssignee = task.assignee;

    // Apply updates
    Object.assign(task, req.body);

    // If the task was unassigned and is now assigned, set status to In Progress (unless Done)
    if (
      !prevAssignee &&
      req.body.assignee &&
      (!req.body.status || req.body.status === prevStatus) &&
      task.status !== 'Done'
    ) {
      task.status = 'In Progress';
    }

    // If the task is being moved to Done, award a badge to the assignee
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
    await task.populate('assignee', 'email name');
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update task' });
  }
});

// Delete a task
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task || !task.project.members.includes(req.user._id)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    // If the task is Done, prevent it from being deleted
    if (task.status === 'Done') {
      return res.status(400).json({ error: 'Cannot delete a task that is Done.' });
    }
    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete task' });
  }
});

// Create a new project
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

