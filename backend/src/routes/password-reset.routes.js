import express from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';
import {
  setPasswordResetToken,
  getPasswordResetToken,
  deletePasswordResetToken,
} from '../config/redis.js';
import { sendPasswordResetEmail } from '../services/email.service.js';
import { authRateLimit } from '../middleware/rate-limit.middleware.js';
import {
  validatePasswordResetRequest,
  validatePasswordReset,
} from '../middleware/validation.middleware.js';

const router = express.Router();

/**
 * @route   POST /api/password-reset/request
 * @desc    Request password reset (send reset token via email)
 * @access  Public
 */
router.post('/request', authRateLimit, validatePasswordResetRequest, async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const userResult = await query(
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      // Don't reveal if user exists or not (security best practice)
      return res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent.',
      });
    }

    // Generate reset token
    const resetToken = uuidv4();

    // Store reset token in Redis (expires in 30 minutes)
    await setPasswordResetToken(email, resetToken, 1800);

    // Send password reset email
    try {
      await sendPasswordResetEmail(email, resetToken);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send password reset email',
      });
    }

    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset request failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * @route   POST /api/password-reset/reset
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset', authRateLimit, validatePasswordReset, async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    // Verify reset token
    const storedToken = await getPasswordResetToken(email);

    if (!storedToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    if (storedToken !== token) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token',
      });
    }

    // Check if user exists
    const userResult = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await query(
      'UPDATE users SET password = $1 WHERE email = $2',
      [hashedPassword, email]
    );

    // Delete reset token
    await deletePasswordResetToken(email);

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * @route   POST /api/password-reset/verify-token
 * @desc    Verify password reset token validity
 * @access  Public
 */
router.post('/verify-token', authRateLimit, async (req, res) => {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({
        success: false,
        message: 'Email and token are required',
      });
    }

    const storedToken = await getPasswordResetToken(email);

    if (!storedToken || storedToken !== token) {
      return res.json({
        success: false,
        valid: false,
        message: 'Invalid or expired token',
      });
    }

    res.json({
      success: true,
      valid: true,
      message: 'Token is valid',
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({
      success: false,
      message: 'Token verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;

