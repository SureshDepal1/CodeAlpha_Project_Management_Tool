import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, _res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      const error = new Error('Authentication required');
      error.statusCode = 401;
      error.code = 'AUTH_REQUIRED';
      return next(error);
    }

    const token = authorization.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      const error = new Error('User account no longer exists');
      error.statusCode = 401;
      error.code = 'INVALID_AUTH';
      return next(error);
    }

    req.user = user;
    return next();
  } catch (error) {
    error.statusCode = 401;
    error.code = 'INVALID_AUTH';
    error.message = error.name === 'TokenExpiredError' ? 'Authentication token expired' : 'Invalid authentication token';
    return next(error);
  }
};