// backend/middleware/asyncHandler.js

/**
 * Higher-order function to wrap async route handlers.
 * This simplifies error handling by catching exceptions and passing them to Express's error handling middleware.
 * @param {Function} fn - The asynchronous route handler function.
 */
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
