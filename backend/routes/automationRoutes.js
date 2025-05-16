const express = require('express');
const router = express.Router();
const Automation = require('../models/Automation');
const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');
const Notification = require('../models/Notification'); 
const authenticate = require('../middleware/auth');

let notifications = [];

async function triggerAutomations(task, prevStatus, prevAssignee) {
  const automations = await Automation.find({ project: task.project });
  for (const auto of automations) {
    if (
      auto.trigger === 'status_change' &&
      prevStatus !== 'Done' &&
      task.status === 'Done' &&
      auto.action &&
      auto.action.type === 'assign_badge'
    ) {
      if (task.assignee) {
        await User.findByIdAndUpdate(
          task.assignee,
          { $addToSet: { badges: auto.action.badge || 'Completed Task' } }
        );
        await Notification.create({
          user: task.assignee,
          message: `Congratulations! You earned the badge "${auto.action.badge || 'Completed Task'}" for completing "${task.title}".`,
        });
      }
    }
  }
  if (prevStatus !== 'Done' && task.status === 'Done') {
    if (task.assignee) {
      await Notification.create({
        user: task.assignee,
        message: `Task "${task.title}" is marked as Done.`,
      });
    }
  }
  for (const auto of automations) {
    if (
      auto.trigger === 'assignment' &&
      prevAssignee !== task.assignee?.toString() &&
      task.assignee &&
      auto.condition &&
      auto.condition.user &&
      String(task.assignee) === String(auto.condition.user) &&
      auto.action &&
      auto.action.type === 'move_status'
    ) {
      if (task.status !== auto.action.status) {
        task.status = auto.action.status || 'In Progress';
        await task.save();
      }
    }
  }
}

router.get('/project/:projectId', authenticate, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.projectId, owner: req.user._id });
    if (!project) return res.status(403).json({ error: 'Access denied' });
    const automations = await Automation.find({ project: project._id });
    res.json(automations);
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch automations' });
  }
});

router.post('/project/:projectId', authenticate, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.projectId, owner: req.user._id });
    if (!project) return res.status(403).json({ error: 'Access denied' });
    const { trigger, condition, action } = req.body;
    const automation = await Automation.create({
      project: project._id,
      trigger,
      condition,
      action,
      createdBy: req.user._id,
    });
    res.status(201).json(automation);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create automation' });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const automation = await Automation.findById(req.params.id).populate('project');
    if (!automation || String(automation.project.owner) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    Object.assign(automation, req.body);
    await automation.save();
    res.json(automation);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update automation' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const automation = await Automation.findById(req.params.id).populate('project');
    if (!automation || String(automation.project.owner) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    await automation.deleteOne();
    res.json({ message: 'Automation deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete automation' });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task || !task.project.members.includes(req.user._id)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const prevStatus = task.status;
    const prevAssignee = task.assignee ? task.assignee.toString() : null;
    Object.assign(task, req.body);
    await task.save();
    await triggerAutomations(task, prevStatus, prevAssignee);
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update task' });
  }
});

router.get('/notifications', authenticate, async (req, res) => {
  try {
    const notes = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.post('/check-due-dates', async (req, res) => {
  const now = new Date();
  const overdueTasks = await Task.find({ dueDate: { $lt: now }, status: { $ne: 'Done' } });
  for (const task of overdueTasks) {
    if (task.assignee) {
      await Notification.create({
        user: task.assignee,
        message: `Task "${task.title}" is overdue!`,
      });
    }
  }
  res.json({ message: 'Notifications sent for overdue tasks.' });
});


router.post('/task/:taskId/comment', authenticate, async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Comment text required' });
  const task = await Task.findById(req.params.taskId);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  if (!task.comments) task.comments = [];
  task.comments.push({
    user: req.user._id,
    text,
    createdAt: new Date(),
  });
  await task.save();
  res.json({ message: 'Comment added' });
});

router.get('/task/:taskId/comments', authenticate, async (req, res) => {
  const task = await Task.findById(req.params.taskId).populate('comments.user', 'name email');
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task.comments || []);
});

module.exports = router;
