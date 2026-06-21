const { body, param } = require('express-validator');

exports.createBannerValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  
  body('subtitle')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Subtitle cannot exceed 200 characters'),
  
  body('image')
    .trim()
    .notEmpty()
    .withMessage('Image URL is required')
    .isURL()
    .withMessage('Image must be a valid URL'),
  
  body('buttonText')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Button text cannot exceed 50 characters'),
  
  body('buttonLink')
    .optional()
    .trim(),
  
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a positive integer'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

exports.updateBannerValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid banner ID'),
  
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  
  body('subtitle')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Subtitle cannot exceed 200 characters'),
  
  body('image')
    .optional()
    .trim()
    .isURL()
    .withMessage('Image must be a valid URL'),
  
  body('buttonText')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Button text cannot exceed 50 characters'),
  
  body('buttonLink')
    .optional()
    .trim(),
  
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a positive integer'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

exports.bannerIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid banner ID')
];
