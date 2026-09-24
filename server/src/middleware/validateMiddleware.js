import { validationResult } from 'express-validator';

export const validate = (req, _res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Request validation failed');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    error.details = errors.array().map(({ path, msg }) => ({ field: path, message: msg }));
    return next(error);
  }

  return next();
};