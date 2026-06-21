const crypto = require('crypto');

/**
 * Encryption utility using AES-256-CBC
 * Encrypts data to be sent to/received from frontend
 */
class Encryption {
  constructor() {
    this.algorithm = 'aes-256-cbc';
    this.key = Buffer.from(process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'); // 32 bytes
    this.iv = Buffer.from(process.env.ENCRYPTION_IV || '1234567890123456'); // 16 bytes
  }

  /**
   * Encrypt data
   * @param {string|object} data - Data to encrypt
   * @returns {string} Encrypted data in hex format
   */
  encrypt(data) {
    try {
      const text = typeof data === 'object' ? JSON.stringify(data) : String(data);
      const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return encrypted;
    } catch (error) {
      throw new Error('Encryption failed: ' + error.message);
    }
  }

  /**
   * Decrypt data
   * @param {string} encryptedData - Encrypted data in hex format
   * @returns {object|string} Decrypted data
   */
  decrypt(encryptedData) {
    try {
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv);
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      // Try to parse as JSON, if fails return as string
      try {
        return JSON.parse(decrypted);
      } catch {
        return decrypted;
      }
    } catch (error) {
      throw new Error('Decryption failed: ' + error.message);
    }
  }

  /**
   * Hash data using SHA-256
   * @param {string} data - Data to hash
   * @returns {string} Hashed data
   */
  hash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generate random token
   * @param {number} length - Length of token (default: 32)
   * @returns {string} Random token
   */
  generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }
}

module.exports = new Encryption();
