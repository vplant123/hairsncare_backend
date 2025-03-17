// error handling middleware

const ApiError = require('../utils/ApiError.js');

const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal server error';

    // If it's an operational error, send the error response
    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
    }

    // Log the error
    console.error(err);

    // Send error response
    res.status(statusCode).json({ error: message });
};

module.exports = errorHandler;
