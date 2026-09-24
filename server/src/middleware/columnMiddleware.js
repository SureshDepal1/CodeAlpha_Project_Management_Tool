import Column from '../models/Column.js';
import Project from '../models/Project.js';

const accessError = (message, statusCode, code) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

export const requireColumnProjectMember = async (req, _res, next) => {
  const column = await Column.findById(req.params.id);
  const project = column && await Project.findById(column.project);
  const isMember = project && (project.owner.equals(req.user._id)
    || project.members.some(({ user }) => user.equals(req.user._id)));

  if (!column || !project) return next(accessError('Column not found', 404, 'COLUMN_NOT_FOUND'));
  if (!isMember) return next(accessError('You must be a project member to access this column', 403, 'PROJECT_ACCESS_DENIED'));

  req.column = column;
  req.project = project;
  return next();
};

export const requireProjectColumn = async (req, _res, next) => {
  const column = req.column || await Column.findOne({ _id: req.params.id, project: req.project._id });
  if (!column) {
    const error = new Error('Column not found');
    error.statusCode = 404;
    error.code = 'COLUMN_NOT_FOUND';
    return next(error);
  }
  req.column = column;
  return next();
};