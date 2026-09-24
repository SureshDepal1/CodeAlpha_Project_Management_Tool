import Project from '../models/Project.js';
import Task from '../models/Task.js';

const accessError = (message, statusCode, code) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

export const requireTaskMember = async (req, _res, next) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return next(accessError('Task not found', 404, 'TASK_NOT_FOUND'));
  }

  const project = await Project.findById(task.project);
  const isMember = project && (project.owner.equals(req.user._id)
    || project.members.some(({ user }) => user.equals(req.user._id)));

  if (!isMember) {
    return next(accessError('You must be a project member to access this task', 403, 'PROJECT_ACCESS_DENIED'));
  }

  req.task = task;
  req.project = project;
  return next();
};