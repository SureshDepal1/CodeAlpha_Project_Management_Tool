export const notFound = (req, _res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  error.code = 'ROUTE_NOT_FOUND';
  next(error);
};

export const errorHandler = (error, _req, res, _next) => {
  console.error(error.stack || error.message);

  if (error.name === 'ValidationError') {
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    error.details = Object.values(error.errors).map(({ path, message }) => ({ field: path, message }));
  }

  if (error.code === 11000) {
    error.statusCode = 409;
    error.code = 'DUPLICATE_RESOURCE';
    error.message = 'A resource with that value already exists';
  }

  res.status(error.statusCode || 500).json({
    success: false,
    code: error.code || 'INTERNAL_SERVER_ERROR',
    message: error.message || 'Internal server error',
    ...(error.details ? { details: error.details } : {}),
  });
};
