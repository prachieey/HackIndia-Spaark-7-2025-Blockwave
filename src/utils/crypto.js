const crypto = require('crypto');
const AppError = require('./appError');

/**
 * Generate a cryptographically secure random string
 * @param {number} [length=32] - Length of the random string
 * @param {string} [type='alphanumeric'] - Type of characters to include
 * @returns {string} - Random string
 */
const generateRandomString = (length = 32, type = 'alphanumeric') => {
  if (length < 1) {
    throw new AppError('Length must be at least 1', 400);
  }

  let characters = '';
  
  switch (type.toLowerCase()) {
    case 'numeric':
      characters = '0123456789';
      break;
    case 'alpha':
      characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      break;
    case 'alphanumeric':
      characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      break;
    case 'hex':
      characters = '0123456789abcdef';
      break;
    case 'base64':
      return crypto.randomBytes(Math.ceil(length * 0.75)).toString('base64').slice(0, length);
    default:
      throw new AppError(`Unsupported random string type: ${type}`, 400);
  }

  const charactersLength = characters.length;
  const randomBytes = crypto.randomBytes(length);
  const result = [];

  for (let i = 0; i < length; i++) {
    const randomIndex = randomBytes[i] % charactersLength;
    result.push(characters.charAt(randomIndex));
  }

  return result.join('');
};

/**
 * Generate a secure random number in a range
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {number} - Random number in the specified range
 */
const generateRandomNumber = (min, max) => {
  if (min >= max) {
    throw new AppError('Min must be less than max', 400);
  }

  const range = max - min + 1;
  const maxRange = 2 ** 32 - 1;
  
  if (range > maxRange) {
    throw new AppError('Range is too large', 400);
  }

  const randomBytes = crypto.randomBytes(4);
  const randomValue = randomBytes.readUInt32BE(0);
  
  return min + (randomValue % range);
};

/**
 * Hash a string using a cryptographic hash function
 * @param {string} data - Data to hash
 * @param {string} [algorithm='sha256'] - Hash algorithm to use
 * @param {string} [encoding='hex'] - Output encoding
 * @returns {string} - Hashed data
 */
const hash = (data, algorithm = 'sha256', encoding = 'hex') => {
  if (typeof data !== 'string') {
    data = JSON.stringify(data);
  }
  
  return crypto
    .createHash(algorithm)
    .update(data)
    .digest(encoding);
};

/**
 * Create a HMAC (Hash-based Message Authentication Code)
 * @param {string} data - Data to hash
 * @param {string} secret - Secret key
 * @param {string} [algorithm='sha256'] - Hash algorithm to use
 * @param {string} [encoding='hex'] - Output encoding
 * @returns {string} - HMAC
 */
const hmac = (data, secret, algorithm = 'sha256', encoding = 'hex') => {
  if (typeof data !== 'string') {
    data = JSON.stringify(data);
  }
  
  return crypto
    .createHmac(algorithm, secret)
    .update(data)
    .digest(encoding);
};

/**
 * Encrypt data using AES-256-GCM
 * @param {string|Buffer} data - Data to encrypt
 * @param {string} key - Encryption key (must be 32 bytes for AES-256)
 * @param {string} [iv] - Initialization vector (if not provided, a random one will be generated)
 * @returns {Object} - Encrypted data and metadata
 */
const encrypt = (data, key, iv) => {
  const algorithm = 'aes-256-gcm';
  const inputEncoding = 'utf8';
  const outputEncoding = 'base64';
  
  if (key.length !== 32) {
    throw new AppError('Key must be 32 bytes for AES-256', 400);
  }
  
  // Generate a random IV if not provided
  const initializationVector = iv || crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, initializationVector);
  
  let encrypted = cipher.update(data, inputEncoding, outputEncoding);
  encrypted += cipher.final(outputEncoding);
  
  const authTag = cipher.getAuthTag();
  
  return {
    encryptedData: encrypted,
    iv: initializationVector.toString(outputEncoding),
    authTag: authTag.toString(outputEncoding),
    algorithm,
  };
};

/**
 * Decrypt data encrypted with AES-256-GCM
 * @param {string} encryptedData - Encrypted data
 * @param {string} key - Encryption key (must be 32 bytes for AES-256)
 * @param {string} iv - Initialization vector
 * @param {string} authTag - Authentication tag
 * @returns {string} - Decrypted data
 */
const decrypt = (encryptedData, key, iv, authTag) => {
  const algorithm = 'aes-256-gcm';
  const inputEncoding = 'base64';
  const outputEncoding = 'utf8';
  
  if (key.length !== 32) {
    throw new AppError('Key must be 32 bytes for AES-256', 400);
  }
  
  const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(authTag, 'base64'));
  
  let decrypted = decipher.update(encryptedData, inputEncoding, outputEncoding);
  try {
    decrypted += decipher.final(outputEncoding);
  } catch (error) {
    throw new AppError('Failed to decrypt data: authentication failed', 401);
  }
  
  return decrypted;
};

/**
 * Generate a secure password hash using PBKDF2
 * @param {string} password - Password to hash
 * @param {string} [salt] - Salt (if not provided, a random one will be generated)
 * @param {Object} [options] - Options
 * @param {number} [options.iterations=10000] - Number of iterations
 * @param {number} [options.keylen=64] - Key length
 * @param {string} [options.digest='sha512'] - Digest algorithm
 * @returns {Object} - Hashed password and salt
 */
const hashPassword = (password, salt, options = {}) => {
  const {
    iterations = 10000,
    keylen = 64,
    digest = 'sha512',
  } = options;
  
  const saltToUse = salt || crypto.randomBytes(16).toString('hex');
  
  const hash = crypto
    .pbkdf2Sync(password, saltToUse, iterations, keylen, digest)
    .toString('hex');
  
  return {
    hash,
    salt: saltToUse,
    iterations,
    keylen,
    digest,
  };
};

/**
 * Verify a password against a hash
 * @param {string} password - Password to verify
 * @param {string} hash - Expected hash
 * @param {string} salt - Salt used for hashing
 * @param {Object} [options] - Options used for hashing
 * @returns {boolean} - True if the password matches the hash
 */
const verifyPassword = (password, hash, salt, options = {}) => {
  const hashed = hashPassword(password, salt, options);
  return crypto.timingSafeEqual(
    Buffer.from(hashed.hash, 'hex'),
    Buffer.from(hash, 'hex')
  );
};

module.exports = {
  generateRandomString,
  generateRandomNumber,
  hash,
  hmac,
  encrypt,
  decrypt,
  hashPassword,
  verifyPassword,
};
