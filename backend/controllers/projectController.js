const Project = require('../models/Project');
const Task    = require('../models/Task');
const User    = require('../models/User');

const getProjects = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { members: req.user._id };
    const projects = await Project.find(filter)
      .populate('owner', 'name email')
      .populate('members', 'name email role')
      .sort('-createdAt');

    const projectsWithCounts = await Promise.all(
      projects.map(async (p) => {
        const [taskCount, completedCount] = await Promise.all([
          Task.countDocuments({ project: p._id }),
          Task.countDocuments({ project: p._id, status: 'completed' }),
        ]);
        return { ...p.toJSON(), taskCount, completedCount };
      })
    );

    res.json({ success: true, count: projects.length, projects: projectsWithCounts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email role');

    if (!project)
      return res.status(404).json({ success: false, message: 'Project not found.' });

    if (req.user.role !== 'admin' && !project.members.some(m => m._id.toString() === req.user._id.toString()))
      return res.status(403).json({ success: false, message: 'Access denied.' });

    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createProject = async (req, res) => {
  try {
    const { title, description, color } = req.body;
    if (!title)
      return res.status(400).json({ success: false, message: 'Title is required.' });

    const project = await Project.create({
      title, description, color: color || '#6366f1',
      owner: req.user._id, members: [req.user._id],
    });
    await project.populate('owner', 'name email');
    res.status(201).json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const { title, description, status, color } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { title, description, status, color },
      { new: true, runValidators: true }
    ).populate('owner', 'name email').populate('members', 'name email role');

    if (!project)
      return res.status(404).json({ success: false, message: 'Project not found.' });

    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project)
      return res.status(404).json({ success: false, message: 'Project not found.' });

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();
    res.json({ success: true, message: 'Project and all tasks deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const [user, project] = await Promise.all([
      User.findById(userId),
      Project.findById(req.params.id),
    ]);

    if (!user)    return res.status(404).json({ success: false, message: 'User not found.' });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });
    if (project.members.includes(userId))
      return res.status(400).json({ success: false, message: 'Already a member.' });

    project.members.push(userId);
    await project.save();
    await project.populate('members', 'name email role');
    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project)
      return res.status(404).json({ success: false, message: 'Project not found.' });

    project.members = project.members.filter(m => m.toString() !== req.params.userId);
    await project.save();
    await project.populate('members', 'name email role');
    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getProjects, getProject, createProject, updateProject, deleteProject, addMember, removeMember };
