import Column from '../models/Column.js';
import Comment from '../models/Comment.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';

const userFields = 'name email avatarColor';

const populateProject = (query) => query
  .populate('owner', userFields)
  .populate('members.user', userFields);

const publicProject = (project) => project;

export const listProjects = async (req, res) => {
  const projects = await populateProject(Project.find({
    $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
  }).sort({ createdAt: -1 }));

  return res.status(200).json({ projects: projects.map(publicProject) });
};

export const createProject = async (req, res) => {
  const { title, description } = req.body;
  const project = await Project.create({
    title,
    description,
    owner: req.user._id,
    members: [{ user: req.user._id, role: 'admin' }],
  });

  try {
    await Column.insertMany([
      { title: 'To Do', project: project._id, order: 0 },
      { title: 'In Progress', project: project._id, order: 1 },
      { title: 'Done', project: project._id, order: 2 },
    ]);
  } catch (error) {
    await Project.deleteOne({ _id: project._id });
    throw error;
  }

  const populatedProject = await populateProject(Project.findById(project._id));
  return res.status(201).json({ project: populatedProject });
};

export const getProject = async (req, res) => res.status(200).json({ project: req.project });

export const updateProject = async (req, res) => {
  const { title, description } = req.body;

  if (title !== undefined) req.project.title = title;
  if (description !== undefined) req.project.description = description;
  await req.project.save();
  const populatedProject = await populateProject(Project.findById(req.project._id));

  return res.status(200).json({ project: populatedProject });
};

export const deleteProject = async (req, res) => {
  const projectTasks = await Task.find({ project: req.project._id }).select('_id');

  await Promise.all([
    Project.deleteOne({ _id: req.project._id }),
    Column.deleteMany({ project: req.project._id }),
    Task.deleteMany({ project: req.project._id }),
    Comment.deleteMany({ task: { $in: projectTasks.map(({ _id: taskId }) => taskId) } }),
  ]);

  return res.status(204).send();
};

export const addMember = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    const error = new Error('No user exists with that email address');
    error.statusCode = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  if (req.project.owner.equals(user._id) || req.project.members.some(({ user: member }) => member.equals(user._id))) {
    const error = new Error('That user is already a project member');
    error.statusCode = 409;
    error.code = 'MEMBER_ALREADY_EXISTS';
    throw error;
  }

  req.project.members.push({ user: user._id, role: 'member' });
  await req.project.save();
  const populatedProject = await populateProject(Project.findById(req.project._id));

  return res.status(200).json({ project: populatedProject });
};

export const removeMember = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    const error = new Error('No user exists with that email address');
    error.statusCode = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  if (req.project.owner.equals(user._id)) {
    const error = new Error('The project owner cannot be removed');
    error.statusCode = 400;
    error.code = 'OWNER_CANNOT_BE_REMOVED';
    throw error;
  }

  const memberIndex = req.project.members.findIndex(({ user: member }) => member.equals(user._id));
  if (memberIndex === -1) {
    const error = new Error('That user is not a project member');
    error.statusCode = 404;
    error.code = 'MEMBER_NOT_FOUND';
    throw error;
  }

  req.project.members.splice(memberIndex, 1);
  await req.project.save();
  const populatedProject = await populateProject(Project.findById(req.project._id));

  return res.status(200).json({ project: populatedProject });
};