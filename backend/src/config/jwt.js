import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_in_production';
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

/**
 * Generate JWT Access Token
 * @param {Object} payload - { id, role, verified }
 * @returns {string} JWT token
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(
    {
      id: payload.id,
      role: payload.role,
      verified: payload.verified || false,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_ACCESS_EXPIRY,
      issuer: 'medilink',
      audience: 'medilink-users',
    }
  );
};

/**
 * Generate JWT Refresh Token
 * @param {Object} payload - { id, role }
 * @returns {string} JWT refresh token
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(
    {
      id: payload.id,
      role: payload.role,
      type: 'refresh',
    },
    JWT_SECRET,
    {
      expiresIn: JWT_REFRESH_EXPIRY,
      issuer: 'medilink',
      audience: 'medilink-users',
    }
  );
};

/**
 * Verify JWT Token
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'medilink',
      audience: 'medilink-users',
    });
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Decode JWT Token without verification (for debugging)
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
export const decodeToken = (token) => {
  return jwt.decode(token);
};

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  decodeToken,
};
