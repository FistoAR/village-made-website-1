/**
 * 404 Handler — catches any request that didn't match a route.
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

/**
 * Global Error Handler — must have 4 params so Express recognises it as error middleware.
 */
export const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.status ?? err.statusCode ?? 500;
  const message = err.message ?? 'Internal Server Error';

  console.error(`[Error] ${statusCode} - ${message}`);

  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
