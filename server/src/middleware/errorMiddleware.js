export const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

export const errorHandler = (error, _req, res, _next) => {
  console.error(error.stack);
  res.status(error.statusCode || 500).json({
    message: error.message || 'Internal server error',
  });
};
