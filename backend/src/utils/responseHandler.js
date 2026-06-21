/**
 * Standard API Response Handler
 * Provides consistent response structure across all endpoints
 */

/**
 * Success response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {object} data - Response data
 */
const successResponse = (res, statusCode = 200, message = 'Success', data = null) => {
  const response = {
    success: true,
    message,
    ...(data && { data })
  };
  return res.status(statusCode).json(response);
};

/**
 * Error response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {object} errors - Detailed error information
 */
const errorResponse = (res, statusCode = 500, message = 'Error', errors = null) => {
  const response = {
    success: false,
    message,
    ...(errors && { errors })
  };
  return res.status(statusCode).json(response);
};

/**
 * Validation error response
 * @param {object} res - Express response object
 * @param {array} errors - Validation errors array
 */
const validationErrorResponse = (res, errors) => {
  return errorResponse(res, 400, 'Validation Error', errors);
};

/**
 * Pagination response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {object} data - Response data with pagination
 */
const paginationResponse = (res, statusCode = 200, message = 'Success', data) => {
  const { items, currentPage, totalPages, totalItems, limit } = data;
  
  const response = {
    success: true,
    message,
    data: items,
    pagination: {
      currentPage,
      totalPages,
      totalItems,
      limit,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    }
  };
  
  return res.status(statusCode).json(response);
};

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse,
  paginationResponse
};
