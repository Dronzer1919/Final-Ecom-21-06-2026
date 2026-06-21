const { validationResult } = require('express-validator');
const { ValidationError } = require('../utils/customErrors');

/**
 * Validation Middleware
 * Checks for validation errors from express-validator
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = {};
    errors.array().forEach(error => {
      formattedErrors[error.path || error.param] = error.msg;
    });
    
    throw new ValidationError('Validation failed', formattedErrors);
  }
  
  next();
};

module.exports = validate;
