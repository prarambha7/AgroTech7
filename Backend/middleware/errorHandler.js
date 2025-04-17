// middleware/errorHandler.js

class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode || 500;
      this.isOperational = true; // Distinguish operational errors
    }
  }
  
  // Centralized error-handling middleware
  const errorHandler = (err, req, res, next) => {
    console.error(`Error: ${err.message}`);
  
    // Check if the error is operational (created by AppError)
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: 'error',
        message: err.message,
      });
    }
  
    // For unexpected errors, log the details and respond with a generic message
    console.error('Unexpected error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong. Please try again later.',
    });
  };
  
  module.exports = { AppError, errorHandler };
  