const encryption = require('../utils/encryption');
const { ValidationError } = require('../utils/customErrors');

/**
 * Decrypt Request Body Middleware
 * Decrypts encrypted payload from frontend
 */
const decryptRequest = (req, res, next) => {
  try {
    // Skip decryption for non-POST/PUT/PATCH requests or if no body
    if (!req.body || Object.keys(req.body).length === 0) {
      return next();
    }

    // Debug logging
    console.log('Request Body:', JSON.stringify(req.body).substring(0, 200));

    // Check if body contains encrypted data
    if (req.body.encrypted && req.body.data) {
      try {
        console.log('Attempting to decrypt...');
        const decryptedData = encryption.decrypt(req.body.data);
        console.log('Decryption successful');
        req.body = decryptedData;
      } catch (error) {
        console.error('Decryption error:', error.message);
        throw new ValidationError('Failed to decrypt request data');
      }
    } else {
      console.log('No encryption detected, using plain body');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Encrypt Response Body Middleware
 * Encrypts response data before sending to frontend
 */
const encryptResponse = (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = function (data) {
    // Check if encryption is requested via query param or header
    const shouldEncrypt = 
      req.query.encrypt === 'true' || 
      req.headers['x-encrypt-response'] === 'true';

    if (shouldEncrypt && data.success && data.data) {
      try {
        data.data = {
          encrypted: true,
          data: encryption.encrypt(data.data)
        };
      } catch (error) {
        console.error('Encryption error:', error);
      }
    }

    return originalJson(data);
  };

  next();
};

module.exports = { decryptRequest, encryptResponse };
