const { NotFoundError } = require('../utils/customErrors');

/**
 * 404 Not Found Handler
 * Catches all undefined routes
 */
const notFound = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`);
  next(error);
};

module.exports = notFound;
