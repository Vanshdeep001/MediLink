import { verifyToken } from '../config/jwt.js';
import { query } from '../config/database.js';
import { getSession } from '../config/redis.js';

/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Authorization header required.',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    // Check if session exists in Redis (optional but recommended)
    const sessionToken = await getSession(decoded.id);
    if (!sessionToken || sessionToken !== token) {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please login again.',
      });
    }

    // Get user from database
    const userResult = await query(
      'SELECT id, name, email, role, email_verified, status, verified FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = userResult.rows[0];

    // Check if user account is active
    if (user.status === 'SUSPENDED' || user.status === 'REJECTED') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended or rejected',
      });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      email_verified: user.email_verified,
      status: user.status,
      verified: user.verified || false,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

/**
 * Role-based Authorization Middleware
 * @param {Array} allowedRoles - Array of allowed roles
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
      });
    }

    next();
  };
};

/**
 * Verify Email Middleware
 * Checks if user's email is verified
 */
export const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  if (!req.user.email_verified) {
    return res.status(403).json({
      success: false,
      message: 'Email verification required. Please verify your email.',
    });
  }

  next();
};

/**
 * Verify Account Status Middleware
 * For doctors and pharmacies, checks if account is verified by admin
 */
export const requireVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  // Patients don't need admin verification
  if (req.user.role === 'PATIENT') {
    return next();
  }

  // Doctors and Pharmacies need admin verification
  if (req.user.role === 'DOCTOR' || req.user.role === 'PHARMACY') {
    if (!req.user.verified || req.user.status !== 'APPROVED') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending admin verification. Please wait for approval.',
        pending: true,
      });
    }
  }

  next();
};

/**
 * Admin Only Middleware
 */
export const requireAdmin = authorize('ADMIN');

/**
 * Doctor Only Middleware
 */
export const requireDoctor = authorize('DOCTOR');

/**
 * Pharmacy Only Middleware
 */
export const requirePharmacy = authorize('PHARMACY');

/**
 * Patient Only Middleware
 */
export const requirePatient = authorize('PATIENT');

export default {
  authenticate,
  authorize,
  requireEmailVerification,
  requireVerification,
  requireAdmin,
  requireDoctor,
  requirePharmacy,
  requirePatient,
};

