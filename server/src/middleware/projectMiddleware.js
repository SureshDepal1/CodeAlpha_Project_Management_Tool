import Project from '../models/Project.js';

const projectError = (message, statusCode, code) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

export const requireProjectMember = async (req, _res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(projectError('Project not found', 404, 'PROJECT_NOT_FOUND'));
  }

  const isMember = project.owner.equals(req.user._id)
    || project.members.some(({ user }) => user.equals(req.user._id));

  if (!isMember) {
    return next(projectError('You must be a project member to access this project', 403, 'PROJECT_ACCESS_DENIED'));
  }

  req.project = project;
  return next();
};

export const requireProjectAdmin = (req, _res, next) => {
  const isOwner = req.project.owner.equals(req.user._id);
  const member = req.project.members.find(({ user }) => user.equals(req.user._id));

  if (!isOwner && member?.role !== 'admin') {
    return next(projectError('Only the project owner or an admin can perform this action', 403, 'PROJECT_ADMIN_REQUIRED'));
  }

  return next();
};