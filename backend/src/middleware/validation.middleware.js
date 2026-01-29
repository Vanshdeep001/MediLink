import { body, validationResult } from 'express-validator';

/**
 * Handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

/**
 * Common Signup Validation
 */
export const validateSignup = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['PATIENT', 'DOCTOR', 'PHARMACY']).withMessage('Invalid role'),
  
  handleValidationErrors,
];

/**
 * Doctor Registration Validation
 */
export const validateDoctorRegistration = [
  body('specialization')
    .trim()
    .notEmpty().withMessage('Specialization is required')
    .isLength({ min: 2, max: 255 }).withMessage('Specialization must be between 2 and 255 characters'),
  
  body('licenseNumber')
    .trim()
    .notEmpty().withMessage('License number is required')
    .isLength({ min: 5, max: 100 }).withMessage('License number must be between 5 and 100 characters'),
  
  body('yearsOfExperience')
    .notEmpty().withMessage('Years of experience is required')
    .isInt({ min: 0, max: 50 }).withMessage('Years of experience must be between 0 and 50'),
  
  body('medicalCouncilRegistration')
    .trim()
    .notEmpty().withMessage('Medical council registration number is required')
    .isLength({ min: 5, max: 100 }).withMessage('Medical council registration must be between 5 and 100 characters'),
  
  handleValidationErrors,
];

/**
 * Pharmacy Registration Validation
 */
export const validatePharmacyRegistration = [
  body('pharmacyName')
    .trim()
    .notEmpty().withMessage('Pharmacy name is required')
    .isLength({ min: 2, max: 255 }).withMessage('Pharmacy name must be between 2 and 255 characters'),
  
  body('ownerName')
    .trim()
    .notEmpty().withMessage('Owner name is required')
    .isLength({ min: 2, max: 255 }).withMessage('Owner name must be between 2 and 255 characters'),
  
  body('address')
    .trim()
    .notEmpty().withMessage('Address is required')
    .isLength({ min: 10, max: 500 }).withMessage('Address must be between 10 and 500 characters'),
  
  body('pharmacyRegistrationNumber')
    .trim()
    .notEmpty().withMessage('Pharmacy registration number is required')
    .isLength({ min: 5, max: 100 }).withMessage('Pharmacy registration number must be between 5 and 100 characters'),
  
  body('gstNumber')
    .optional()
    .trim()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).withMessage('Invalid GST number format'),
  
  handleValidationErrors,
];

/**
 * Patient Registration Validation
 */
export const validatePatientRegistration = [
  body('age')
    .optional()
    .isInt({ min: 1, max: 150 }).withMessage('Age must be between 1 and 150'),
  
  body('gender')
    .optional()
    .isIn(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).withMessage('Invalid gender'),
  
  body('bloodGroup')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood group'),
  
  handleValidationErrors,
];

/**
 * Login Validation
 */
export const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  handleValidationErrors,
];

/**
 * OTP Verification Validation
 */
export const validateOTP = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('otp')
    .trim()
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
    .isNumeric().withMessage('OTP must be numeric'),
  
  handleValidationErrors,
];

/**
 * Password Reset Request Validation
 */
export const validatePasswordResetRequest = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  handleValidationErrors,
];

/**
 * Password Reset Validation
 */
export const validatePasswordReset = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('token')
    .trim()
    .notEmpty().withMessage('Reset token is required'),
  
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  handleValidationErrors,
];

export default {
  handleValidationErrors,
  validateSignup,
  validateDoctorRegistration,
  validatePharmacyRegistration,
  validatePatientRegistration,
  validateLogin,
  validateOTP,
  validatePasswordResetRequest,
  validatePasswordReset,
};

