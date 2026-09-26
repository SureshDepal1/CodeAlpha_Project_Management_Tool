import Column from '../models/Column.js';
import Comment from '../models/Comment.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { createNotification, emitToProject } from '../realtime/socket.js';

const userFields = 'name email avatarColor';
const populateTask = (query) => query
  .populate('assignee', userFields)
  .populate('createdBy', userFields);
const populateComment = (query) => query.populate('author', userFields);

const taskFields = ['title', 'description', 'priority', 'dueDate', 'assignee'];

const projectMember = (project, userId) => project.owner.equals(userId)
  || project.members.some(({ user }) => user.equals(userId));

const taskOrder = async (projectId, columnId) => {
  const lastTask = await Task.findOne({ project: projectId, column: columnId }).sort({ order: -1 });
  return lastTask ? lastTask.order + 1 : 0;
};

const validateAssignee = async (project, assigneeId) => {
  if (assigneeId === null || assigneeId === undefined) return null;

  const member = project.members.some(({ user }) => user.equals(assigneeId)) || project.owner.equals(assigneeId);
  if (!member) {
    const error = new Error('Assignee must be a member of the project');
    error.statusCode = 400;
    error.code = 'ASSIGNEE_NOT_IN_PROJECT';
    throw error;
  }

  return User.findById(assigneeId);
};

const ensureColumnInProject = async (projectId, columnId) => {
  const column = await Column.findOne({ _id: columnId, project: projectId });
  if (!column) {
    const error = new Error('Column does not belong to this project');
    error.statusCode = 400;
    error.code = 'COLUMN_NOT_IN_PROJECT';
    throw error;
  }
  return column;
};

export const listTasks = async (req, res) => {
  const tasks = await populateTask(Task.find({ project: req.project._id }).sort({ column: 1, order: 1, createdAt: 1 }));
  const tasksWithCommentCount = await Promise.all(tasks.map(async (task) => ({
    ...task.toObject(),
    commentCount: await Comment.countDocuments({ task: task._id }),
  })));
  return res.status(200).json({ tasks: tasksWithCommentCount });
};

export const createTask = async (req, res) => {
  await ensureColumnInProject(req.project._id, req.body.column);
  await validateAssignee(req.project, req.body.assignee);
  const task = await Task.create({
    ...req.body,
    project: req.project._id,
    createdBy: req.user._id,
    order: req.body.order ?? await taskOrder(req.project._id, req.body.column),
  });
  const populatedTask = await populateTask(Task.findById(task._id));
  emitToProject(req.project._id, 'task:created', { task: populatedTask });
  if (task.assignee && !task.assignee.equals(req.user._id)) {
    await createNotification({
      recipient: task.assignee,
      type: 'task_assigned',
      message: `You were assigned to "${task.title}".`,
      link: `/projects/${req.project._id}/board`,
    });
  }
  return res.status(201).json({ task: populatedTask });
};

export const getTask = async (req, res) => {
  const task = await populateTask(Task.findById(req.task._id));
  return res.status(200).json({ task });
};

export const updateTask = async (req, res) => {
  const previousAssignee = req.task.assignee?.toString();
  for (const field of taskFields) {
    if (req.body[field] !== undefined) req.task[field] = req.body[field];
  }
  if (req.body.column !== undefined) {
    await ensureColumnInProject(req.project._id, req.body.column);
    req.task.column = req.body.column;
  }
  if (req.body.assignee !== undefined) await validateAssignee(req.project, req.body.assignee);
  await req.task.save();
  const task = await populateTask(Task.findById(req.task._id));
  emitToProject(req.project._id, 'task:updated', { task });
  if (task.assignee && task.assignee._id.toString() !== req.user._id.toString() && task.assignee._id.toString() !== previousAssignee) {
    await createNotification({
      recipient: task.assignee._id,
      type: 'task_assigned',
      message: `You were assigned to "${task.title}".`,
      link: `/projects/${req.project._id}/board`,
    });
  }
  return res.status(200).json({ task });
};

export const deleteTask = async (req, res) => {
  await Promise.all([
    Task.deleteOne({ _id: req.task._id }),
    Comment.deleteMany({ task: req.task._id }),
  ]);
  return res.status(204).send();
};

export const moveTask = async (req, res) => {
  const targetColumn = await ensureColumnInProject(req.project._id, req.body.column);
  const targetOrder = req.body.order;
  const oldColumn = req.task.column;
  const oldOrder = req.task.order;

  if (oldColumn.equals(targetColumn._id)) {
    if (targetOrder > oldOrder) {
      await Task.updateMany({ project: req.project._id, column: oldColumn, order: { $gt: oldOrder, $lte: targetOrder } }, { $inc: { order: -1 } });
    } else if (targetOrder < oldOrder) {
      await Task.updateMany({ project: req.project._id, column: oldColumn, order: { $gte: targetOrder, $lt: oldOrder } }, { $inc: { order: 1 } });
    }
  } else {
    await Task.updateMany({ project: req.project._id, column: oldColumn, order: { $gt: oldOrder } }, { $inc: { order: -1 } });
    await Task.updateMany({ project: req.project._id, column: targetColumn._id, order: { $gte: targetOrder } }, { $inc: { order: 1 } });
  }

  req.task.column = targetColumn._id;
  req.task.order = targetOrder;
  await req.task.save();
  const task = await populateTask(Task.findById(req.task._id));
  const projectTasks = await populateTask(Task.find({ project: req.project._id }).sort({ column: 1, order: 1, createdAt: 1 }));
  emitToProject(req.project._id, 'task:moved', { task, tasks: projectTasks });
  return res.status(200).json({ task });
};

export const listComments = async (req, res) => {
  const comments = await populateComment(Comment.find({ task: req.task._id }).sort({ createdAt: 1 }));
  return res.status(200).json({ comments });
};

export const createComment = async (req, res) => {
  const comment = await Comment.create({ task: req.task._id, author: req.user._id, text: req.body.text });
  const populatedComment = await populateComment(Comment.findById(comment._id));
  emitToProject(req.task.project, 'comment:created', { taskId: req.task._id, comment: populatedComment, actorId: req.user._id });
  if (req.task.assignee && !req.task.assignee.equals(req.user._id)) {
    await createNotification({
      recipient: req.task.assignee,
      type: 'task_commented',
      message: `${req.user.name} commented on "${req.task.title}".`,
      link: `/projects/${req.task.project}/board`,
    });
  }
  return res.status(201).json({ comment: populatedComment });
};

export const deleteComment = async (req, res) => {
  const comment = await Comment.findOne({ _id: req.params.commentId, task: req.task._id });
  if (!comment) {
    const error = new Error('Comment not found');
    error.statusCode = 404;
    error.code = 'COMMENT_NOT_FOUND';
    throw error;
  }
  if (!comment.author.equals(req.user._id)) {
    const error = new Error('Only the comment author can delete this comment');
    error.statusCode = 403;
    error.code = 'COMMENT_DELETE_DENIED';
    throw error;
  }
  await comment.deleteOne();
  emitToProject(req.task.project, 'comment:deleted', { taskId: req.task._id, commentId: req.params.commentId, actorId: req.user._id });
  return res.status(204).send();
};

const taskView = (query) => query
  .populate('assignee', userFields)
  .populate('createdBy', userFields)
  .populate({ path: 'project', select: 'title owner members', populate: [{ path: 'owner', select: userFields }, { path: 'members.user', select: userFields }] })
  .populate('column', 'title');

const projectIdsForUser = async (userId) => {
  const projects = await Project.find({
    $or: [{ owner: userId }, { 'members.user': userId }],
  }).select('_id');
  return projects.map(({ _id }) => _id);
};

export const listMyTasks = async (req, res) => {
  const projectIds = await projectIdsForUser(req.user._id);
  const tasks = await taskView(Task.find({ project: { $in: projectIds }, assignee: req.user._id }).sort({ dueDate: 1, createdAt: -1 }));
  return res.status(200).json({ tasks });
};