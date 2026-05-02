const Task    = require('../models/Task');
const Project = require('../models/Project');

const getTasks = async (req, res) => {
  try {
    const { projectId, status, priority } = req.query;
    const filter = {};
    if (req.user.role !== 'admin') filter.assignedTo = req.user._id;
    if (projectId) filter.project  = projectId;
    if (status)    filter.status   = status;
    if (priority)  filter.priority = priority;

    const tasks = await Task.find(filter)
      .populate('project',    'title color')
      .populate('assignedTo', 'name email')
      .populate('createdBy',  'name email')
      .sort('-createdAt');

    res.json({ success: true, count: tasks.length, tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project',    'title color members')
      .populate('assignedTo', 'name email')
      .populate('createdBy',  'name email');

    if (!task)
      return res.status(404).json({ success: false, message: 'Task not found.' });

    if (req.user.role !== 'admin' && task.assignedTo?._id.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Access denied.' });

    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description, project, assignedTo, status, priority, dueDate, tags } = req.body;
    if (!title || !project)
      return res.status(400).json({ success: false, message: 'Title and project are required.' });

    if (!(await Project.findById(project)))
      return res.status(404).json({ success: false, message: 'Project not found.' });

    const task = await Task.create({
      title, description, project,
      assignedTo: assignedTo || null,
      createdBy:  req.user._id,
      status:     status   || 'todo',
      priority:   priority || 'medium',
      dueDate:    dueDate  || null,
      tags:       tags     || [],
    });

    await task.populate('project',    'title color');
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy',  'name email');
    res.status(201).json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const { title, description, assignedTo, status, priority, dueDate, tags } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, assignedTo, status, priority, dueDate, tags },
      { new: true, runValidators: true }
    )
      .populate('project',    'title color')
      .populate('assignedTo', 'name email')
      .populate('createdBy',  'name email');

    if (!task)
      return res.status(404).json({ success: false, message: 'Task not found.' });

    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['todo', 'in-progress', 'completed'];
    if (!valid.includes(status))
      return res.status(400).json({ success: false, message: `Status must be: ${valid.join(', ')}` });

    const task = await Task.findById(req.params.id);
    if (!task)
      return res.status(404).json({ success: false, message: 'Task not found.' });

    if (req.user.role !== 'admin' && task.assignedTo?.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'You can only update your own tasks.' });

    task.status = status;
    await task.save();
    await task.populate('project',    'title color');
    await task.populate('assignedTo', 'name email');
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task)
      return res.status(404).json({ success: false, message: 'Task not found.' });
    res.json({ success: true, message: 'Task deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const filter = req.user.role !== 'admin' ? { assignedTo: req.user._id } : {};
    const now = new Date();

    const [total, completed, inProgress, todo, overdue, recentTasks] = await Promise.all([
      Task.countDocuments(filter),
      Task.countDocuments({ ...filter, status: 'completed' }),
      Task.countDocuments({ ...filter, status: 'in-progress' }),
      Task.countDocuments({ ...filter, status: 'todo' }),
      Task.countDocuments({ ...filter, status: { $ne: 'completed' }, dueDate: { $lt: now } }),
      Task.find(filter)
        .populate('project',    'title color')
        .populate('assignedTo', 'name email')
        .sort('-createdAt')
        .limit(6),
    ]);

    const projectCount = req.user.role === 'admin'
      ? await require('../models/Project').countDocuments()
      : await require('../models/Project').countDocuments({ members: req.user._id });

    res.json({
      success: true,
      stats: { total, completed, inProgress, todo, overdue, projectCount },
      recentTasks,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getTasks, getTask, createTask, updateTask, updateTaskStatus, deleteTask, getDashboardStats };
