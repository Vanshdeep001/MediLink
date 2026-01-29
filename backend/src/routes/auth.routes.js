import express from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';
import { generateAccessToken, generateRefreshToken } from '../config/jwt.js';
import { setSession, deleteSession } from '../config/redis.js';
import { sendOTP, verifyOTP } from '../services/otp.service.js';
import { authenticate, requireEmailVerification } from '../middleware/auth.middleware.js';
import { authRateLimit } from '../middleware/rate-limit.middleware.js';
import {
  validateSignup,
  validateLogin,
  validateOTP,
} from '../middleware/validation.middleware.js';

const router = express.Router();

/**
 * @route   POST /api/auth/signup
 * @desc    Step 1: Common signup for all roles
 * @access  Public
 */
router.post('/signup', authRateLimit, validateSignup, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Hash password (minimum 10 salt rounds)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const userId = uuidv4();
    await query(
      `INSERT INTO users (id, name, email, password, role, status, email_verified, verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [userId, name, email, hashedPassword, role, 'PENDING', false, false]
    );

    // Send OTP for email verification
    await sendOTP(email);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email with OTP.',
      data: {
        userId,
        email,
        role,
        nextStep: role === 'PATIENT' ? 'complete-patient-profile' : 'complete-profile',
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email with OTP
 * @access  Public
 */
router.post('/verify-email', authRateLimit, validateOTP, async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Verify OTP
    const otpResult = await verifyOTP(email, otp);

    if (!otpResult.valid) {
      return res.status(400).json({
        success: false,
        message: otpResult.message,
      });
    }

    // Update user email_verified status
    await query(
      'UPDATE users SET email_verified = TRUE WHERE email = $1',
      [email]
    );

    // Get user details
    const userResult = await query(
      'SELECT id, name, email, role, email_verified, status FROM users WHERE email = $1',
      [email]
    );

    const user = userResult.rows[0];

    res.json({
      success: true,
      message: 'Email verified successfully',
      data: {
        userId: user.id,
        email: user.email,
        role: user.role,
        emailVerified: user.email_verified,
      },
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * @route   POST /api/auth/resend-otp
 * @desc    Resend OTP for email verification
 * @access  Public
 */
router.post('/resend-otp', authRateLimit, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Check if user exists
    const userResult = await query(
      'SELECT id, email_verified FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (userResult.rows[0].email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified',
      });
    }

    // Send OTP
    await sendOTP(email);

    res.json({
      success: true,
      message: 'OTP sent successfully',
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authRateLimit, validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user from database
    const userResult = await query(
      `SELECT u.id, u.name, u.email, u.password, u.role, u.email_verified, u.status, u.verified,
              d.verified as doctor_verified, p.verified as pharmacy_verified
       FROM users u
       LEFT JOIN doctors d ON u.id = d.user_id
       LEFT JOIN pharmacies p ON u.id = p.user_id
       WHERE u.email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const user = userResult.rows[0];

    // Check if account is suspended or rejected
    if (user.status === 'SUSPENDED' || user.status === 'REJECTED') {
      return res.status(403).json({
        success: false,
        message: `Your account has been ${user.status.toLowerCase()}. Please contact support.`,
      });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in',
        requiresEmailVerification: true,
      });
    }

    // Determine verified status based on role
    let verified = false;
    if (user.role === 'PATIENT') {
      verified = true; // Patients are auto-verified
    } else if (user.role === 'DOCTOR') {
      verified = user.doctor_verified || false;
    } else if (user.role === 'PHARMACY') {
      verified = user.pharmacy_verified || false;
    } else if (user.role === 'ADMIN') {
      verified = true;
    }

    // Update last login
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user.id,
      role: user.role,
      verified,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      role: user.role,
    });

    // Store session in Redis (24 hours)
    await setSession(user.id, accessToken, 86400);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          verified,
          status: user.status,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
        pendingVerification: (user.role === 'DOCTOR' || user.role === 'PHARMACY') && !verified,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (invalidate session)
 * @access  Private
 */
router.post('/logout', authenticate, async (req, res) => {
  try {
    // Delete session from Redis
    await deleteSession(req.user.id);

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const userResult = await query(
      `SELECT u.id, u.name, u.email, u.role, u.email_verified, u.status, u.verified,
              u.phone, u.profile_image_url, u.created_at, u.last_login
       FROM users u
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = userResult.rows[0];

    // Get role-specific details
    let roleDetails = null;
    if (user.role === 'DOCTOR') {
      const doctorResult = await query(
        'SELECT specialization, license_number, years_of_experience, medical_council_registration FROM doctors WHERE user_id = $1',
        [user.id]
      );
      roleDetails = doctorResult.rows[0] || null;
    } else if (user.role === 'PHARMACY') {
      const pharmacyResult = await query(
        'SELECT pharmacy_name, owner_name, address, pharmacy_registration_number FROM pharmacies WHERE user_id = $1',
        [user.id]
      );
      roleDetails = pharmacyResult.rows[0] || null;
    } else if (user.role === 'PATIENT') {
      const patientResult = await query(
        'SELECT age, gender, blood_group FROM patients WHERE user_id = $1',
        [user.id]
      );
      roleDetails = patientResult.rows[0] || null;
    }

    res.json({
      success: true,
      data: {
        user: {
          ...user,
          roleDetails,
        },
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;

