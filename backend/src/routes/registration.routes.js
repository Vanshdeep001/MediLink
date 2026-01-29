import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';
import { authenticate, requireEmailVerification } from '../middleware/auth.middleware.js';
import { authRateLimit } from '../middleware/rate-limit.middleware.js';
import {
  validateDoctorRegistration,
  validatePharmacyRegistration,
  validatePatientRegistration,
} from '../middleware/validation.middleware.js';
import { uploadDocument } from '../services/upload.service.js';
import {
  validateDoctorLicenseFormat,
  validatePharmacyLicenseFormat,
  verifyDoctorLicense,
  verifyPharmacyLicense,
} from '../services/license-verification.service.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'));
    }
  },
});

/**
 * @route   POST /api/registration/doctor
 * @desc    Step 2: Complete doctor registration
 * @access  Private (requires authentication and email verification)
 */
router.post(
  '/doctor',
  authenticate,
  requireEmailVerification,
  authRateLimit,
  upload.fields([
    { name: 'certificate', maxCount: 1 },
    { name: 'governmentId', maxCount: 1 },
  ]),
  validateDoctorRegistration,
  async (req, res) => {
    try {
      const { specialization, licenseNumber, yearsOfExperience, medicalCouncilRegistration, governmentIdType } = req.body;
      const userId = req.user.id;

      // Check if user is a doctor
      if (req.user.role !== 'DOCTOR') {
        return res.status(403).json({
          success: false,
          message: 'This endpoint is only for doctors',
        });
      }

      // Check if doctor profile already exists
      const existingDoctor = await query(
        'SELECT id FROM doctors WHERE user_id = $1',
        [userId]
      );

      if (existingDoctor.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Doctor profile already exists',
        });
      }

      // Step 1: Format Validation (Regex)
      const formatValidation = validateDoctorLicenseFormat(licenseNumber);
      
      if (!formatValidation.valid) {
        return res.status(400).json({
          success: false,
          message: formatValidation.message,
          formatError: true,
          expectedFormat: formatValidation.format || 'XX/YYYY/XXXXX',
          example: 'MH/2019/12345 or DL/2020/67890',
        });
      }

      // Check if license number already exists
      const normalizedLicenseNumber = formatValidation.normalized;
      const existingLicense = await query(
        'SELECT id FROM doctors WHERE license_number = $1 OR license_number = $2',
        [licenseNumber, normalizedLicenseNumber]
      );

      if (existingLicense.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'License number already registered',
        });
      }

      // Step 2: Hybrid Verification (Format validated, now verify with documents)
      const licenseVerification = await verifyDoctorLicense(normalizedLicenseNumber, medicalCouncilRegistration);

      // If format is invalid (shouldn't happen here, but double-check)
      if (!licenseVerification.valid || !licenseVerification.formatValid) {
        return res.status(400).json({
          success: false,
          message: licenseVerification.message || 'Invalid license number format',
          formatError: true,
        });
      }

      // Upload documents
      let certificateUrl = null;
      let governmentIdUrl = null;

      if (req.files?.certificate?.[0]) {
        const certResult = await uploadDocument(
          req.files.certificate[0],
          'certificate',
          userId
        );
        certificateUrl = certResult.url;
      }

      if (req.files?.governmentId?.[0]) {
        const idResult = await uploadDocument(
          req.files.governmentId[0],
          'government-id',
          userId
        );
        governmentIdUrl = idResult.url;
      }

      // Create doctor record
      const doctorId = uuidv4();
      await query(
        `INSERT INTO doctors (
          id, user_id, specialization, license_number, years_of_experience,
          medical_council_registration, certificate_url, government_id_url,
          government_id_type, verified, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          doctorId,
          userId,
          specialization,
          normalizedLicenseNumber, // Use normalized license number
          parseInt(yearsOfExperience),
          medicalCouncilRegistration,
          certificateUrl,
          governmentIdUrl,
          governmentIdType || 'AADHAR',
          licenseVerification.verified || false,
          'PENDING',
        ]
      );

      // Update user status
      await query(
        'UPDATE users SET status = $1 WHERE id = $2',
        ['PENDING', userId]
      );

      res.status(201).json({
        success: true,
        message: licenseVerification.verified
          ? 'Doctor registration completed successfully.'
          : 'Doctor registration completed. License format validated. Waiting for admin verification based on submitted documents.',
        data: {
          doctorId,
          licenseVerification: {
            formatValid: licenseVerification.formatValid,
            verified: licenseVerification.verified || false,
            message: licenseVerification.message,
            requiresManualVerification: licenseVerification.requiresManualVerification !== false,
            verificationMethod: licenseVerification.verificationMethod || 'document-based',
          },
        },
      });
    } catch (error) {
      console.error('Doctor registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Doctor registration failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

/**
 * @route   POST /api/registration/pharmacy
 * @desc    Step 2: Complete pharmacy registration
 * @access  Private (requires authentication and email verification)
 */
router.post(
  '/pharmacy',
  authenticate,
  requireEmailVerification,
  authRateLimit,
  upload.single('drugLicenseCertificate'),
  validatePharmacyRegistration,
  async (req, res) => {
    try {
      const {
        pharmacyName,
        ownerName,
        address,
        city,
        state,
        pinCode,
        pharmacyRegistrationNumber,
        gstNumber,
      } = req.body;
      const userId = req.user.id;

      // Check if user is a pharmacy
      if (req.user.role !== 'PHARMACY') {
        return res.status(403).json({
          success: false,
          message: 'This endpoint is only for pharmacies',
        });
      }

      // Check if pharmacy profile already exists
      const existingPharmacy = await query(
        'SELECT id FROM pharmacies WHERE user_id = $1',
        [userId]
      );

      if (existingPharmacy.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Pharmacy profile already exists',
        });
      }

      // Step 1: Format Validation (Regex)
      const formatValidation = validatePharmacyLicenseFormat(pharmacyRegistrationNumber);
      
      if (!formatValidation.valid) {
        return res.status(400).json({
          success: false,
          message: formatValidation.message,
          formatError: true,
          expectedFormat: formatValidation.format || '5-15 alphanumeric characters (A-Z, 0-9, -, /)',
          examples: 'PD/12345, DL-67890, 20-XXXXX',
        });
      }

      // Check if registration number already exists
      const normalizedRegistrationNumber = formatValidation.normalized;
      const existingRegistration = await query(
        'SELECT id FROM pharmacies WHERE pharmacy_registration_number = $1 OR pharmacy_registration_number = $2',
        [pharmacyRegistrationNumber, normalizedRegistrationNumber]
      );

      if (existingRegistration.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Pharmacy registration number already registered',
        });
      }

      // Step 2: Hybrid Verification (Format validated, now verify with documents)
      const licenseVerification = await verifyPharmacyLicense(normalizedRegistrationNumber, gstNumber);

      // If format is invalid (shouldn't happen here, but double-check)
      if (!licenseVerification.valid || !licenseVerification.formatValid) {
        return res.status(400).json({
          success: false,
          message: licenseVerification.message || 'Invalid pharmacy registration number format',
          formatError: true,
        });
      }

      // Upload drug license certificate
      let drugLicenseUrl = null;
      if (req.file) {
        const certResult = await uploadDocument(
          req.file,
          'drug-license',
          userId
        );
        drugLicenseUrl = certResult.url;
      }

      // Create pharmacy record
      const pharmacyId = uuidv4();
      await query(
        `INSERT INTO pharmacies (
          id, user_id, pharmacy_name, owner_name, address, city, state,
          pin_code, pharmacy_registration_number, gst_number,
          drug_license_certificate_url, verified, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          pharmacyId,
          userId,
          pharmacyName,
          ownerName,
          address,
          city || null,
          state || null,
          pinCode || null,
          normalizedRegistrationNumber, // Use normalized registration number
          gstNumber || null,
          drugLicenseUrl,
          licenseVerification.verified || false,
          'PENDING',
        ]
      );

      // Update user status
      await query(
        'UPDATE users SET status = $1 WHERE id = $2',
        ['PENDING', userId]
      );

      res.status(201).json({
        success: true,
        message: licenseVerification.verified
          ? 'Pharmacy registration completed successfully.'
          : 'Pharmacy registration completed. Registration number format validated. Waiting for admin verification based on submitted documents.',
        data: {
          pharmacyId,
          licenseVerification: {
            formatValid: licenseVerification.formatValid,
            verified: licenseVerification.verified || false,
            message: licenseVerification.message,
            requiresManualVerification: licenseVerification.requiresManualVerification !== false,
            verificationMethod: licenseVerification.verificationMethod || 'document-based',
          },
        },
      });
    } catch (error) {
      console.error('Pharmacy registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Pharmacy registration failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

/**
 * @route   POST /api/registration/patient
 * @desc    Step 2: Complete patient registration
 * @access  Private (requires authentication and email verification)
 */
router.post(
  '/patient',
  authenticate,
  requireEmailVerification,
  authRateLimit,
  validatePatientRegistration,
  async (req, res) => {
    try {
      const { age, gender, bloodGroup, medicalHistory, emergencyContactName, emergencyContactPhone, address, city, state, pinCode } = req.body;
      const userId = req.user.id;

      // Check if user is a patient
      if (req.user.role !== 'PATIENT') {
        return res.status(403).json({
          success: false,
          message: 'This endpoint is only for patients',
        });
      }

      // Check if patient profile already exists
      const existingPatient = await query(
        'SELECT id FROM patients WHERE user_id = $1',
        [userId]
      );

      if (existingPatient.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Patient profile already exists',
        });
      }

      // Create patient record (auto-approved)
      const patientId = uuidv4();
      await query(
        `INSERT INTO patients (
          id, user_id, age, gender, blood_group, medical_history,
          emergency_contact_name, emergency_contact_phone,
          address, city, state, pin_code, verified, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          patientId,
          userId,
          age ? parseInt(age) : null,
          gender || null,
          bloodGroup || null,
          medicalHistory || null,
          emergencyContactName || null,
          emergencyContactPhone || null,
          address || null,
          city || null,
          state || null,
          pinCode || null,
          true, // Patients are auto-verified
          'APPROVED', // Patients are auto-approved
        ]
      );

      // Update user status to approved
      await query(
        'UPDATE users SET status = $1, verified = $2 WHERE id = $3',
        ['APPROVED', true, userId]
      );

      res.status(201).json({
        success: true,
        message: 'Patient registration completed successfully',
        data: {
          patientId,
          verified: true,
          status: 'APPROVED',
        },
      });
    } catch (error) {
      console.error('Patient registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Patient registration failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

export default router;

