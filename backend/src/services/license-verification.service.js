import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const LICENSE_VERIFICATION_API_URL = process.env.LICENSE_VERIFICATION_API_URL;
const LICENSE_VERIFICATION_API_KEY = process.env.LICENSE_VERIFICATION_API_KEY;

/**
 * Format Validation Regex Patterns
 */

// Doctor License Format: StateCode/Year/Number (e.g., MH/2019/12345, DL/2020/67890)
const DOCTOR_LICENSE_FORMAT = /^[A-Z]{2}\/\d{4}\/\d{3,5}$/;

// Pharmacy License Format: Various formats (e.g., PD/12345, DL-67890, 20-XXXXX)
const PHARMACY_LICENSE_FORMAT = /^[A-Z0-9\-\/]{5,15}$/;

/**
 * Validate Doctor License Number Format
 * @param {string} licenseNumber - Doctor's license number
 * @returns {Object} Format validation result
 */
export const validateDoctorLicenseFormat = (licenseNumber) => {
  if (!licenseNumber || typeof licenseNumber !== 'string') {
    return {
      valid: false,
      message: 'Invalid license number format',
    };
  }

  const trimmed = licenseNumber.trim().toUpperCase();
  
  if (!DOCTOR_LICENSE_FORMAT.test(trimmed)) {
    return {
      valid: false,
      message: 'Invalid license number format. Expected format: StateCode/Year/Number (e.g., MH/2019/12345)',
      format: 'XX/YYYY/XXXXX',
    };
  }

  return {
    valid: true,
    normalized: trimmed,
    message: 'License number format is valid',
  };
};

/**
 * Validate Pharmacy License Number Format
 * @param {string} registrationNumber - Pharmacy registration number
 * @returns {Object} Format validation result
 */
export const validatePharmacyLicenseFormat = (registrationNumber) => {
  if (!registrationNumber || typeof registrationNumber !== 'string') {
    return {
      valid: false,
      message: 'Invalid license number format',
    };
  }

  const trimmed = registrationNumber.trim().toUpperCase();
  
  if (!PHARMACY_LICENSE_FORMAT.test(trimmed)) {
    return {
      valid: false,
      message: 'Invalid pharmacy registration number format. Expected format: 5-15 alphanumeric characters with hyphens or slashes (e.g., PD/12345, DL-67890)',
      format: '5-15 alphanumeric characters (A-Z, 0-9, -, /)',
    };
  }

  return {
    valid: true,
    normalized: trimmed,
    message: 'Pharmacy registration number format is valid',
  };
};

/**
 * Verify Doctor License Number
 * Hybrid Validation Model:
 * 1. Format Validation (Regex)
 * 2. Document-Based Verification (Primary Method)
 * 3. Admin Review & Manual Approval
 * 
 * @param {string} licenseNumber - Doctor's license number
 * @param {string} medicalCouncilRegistration - Medical council registration number
 * @returns {Promise<Object>} Verification result
 */
export const verifyDoctorLicense = async (licenseNumber, medicalCouncilRegistration) => {
  try {
    // Step 1: Format Validation (Regex)
    const formatValidation = validateDoctorLicenseFormat(licenseNumber);
    
    if (!formatValidation.valid) {
      return {
        valid: false,
        verified: false,
        formatValid: false,
        message: formatValidation.message,
        requiresManualVerification: false,
      };
    }

    // Normalize license number for processing
    const normalizedLicenseNumber = formatValidation.normalized;

    // Step 2: Document-Based Verification (Primary Method)
    // Since India does not publish a public API for verifying medical licenses,
    // we rely on document-based verification (same as hospitals and telemedicine companies).
    // Documents are uploaded to Cloudinary and reviewed by admins.
    
    // If no API URL is configured, use document-based verification only
    if (!LICENSE_VERIFICATION_API_URL || !LICENSE_VERIFICATION_API_KEY) {
      console.info('License verification API not configured. Using document-based verification.');
      return {
        valid: true,
        verified: false, // Not auto-verified, requires admin approval
        formatValid: true,
        message: 'License format is valid. Pending admin verification based on submitted documents.',
        requiresManualVerification: true,
        verificationMethod: 'document-based',
        details: {
          licenseNumber: normalizedLicenseNumber,
          medicalCouncilRegistration,
          status: 'PENDING_ADMIN_REVIEW',
        },
      };
    }

    // Optional: Call external license verification API if available
    try {
      const response = await axios.post(
        `${LICENSE_VERIFICATION_API_URL}/doctor/verify`,
        {
          licenseNumber: normalizedLicenseNumber,
          medicalCouncilRegistration,
        },
        {
          headers: {
            'Authorization': `Bearer ${LICENSE_VERIFICATION_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 seconds timeout
        }
      );

      if (response.data && response.data.valid) {
        return {
          valid: true,
          verified: response.data.verified || false,
          formatValid: true,
          message: 'License format is valid. API verification successful.',
          requiresManualVerification: !response.data.verified,
          verificationMethod: 'api',
          details: response.data.details || {},
        };
      }

      return {
        valid: true,
        verified: false,
        formatValid: true,
        message: response.data.message || 'License format is valid. Pending admin verification.',
        requiresManualVerification: true,
        verificationMethod: 'api-failed',
        details: response.data.details || {},
      };
    } catch (apiError) {
      console.warn('License verification API unavailable. Falling back to document-based verification.');
      // Fall back to document-based verification
      return {
        valid: true,
        verified: false,
        formatValid: true,
        message: 'License format is valid. Pending admin verification based on submitted documents.',
        requiresManualVerification: true,
        verificationMethod: 'document-based',
        details: {
          licenseNumber: normalizedLicenseNumber,
          medicalCouncilRegistration,
          status: 'PENDING_ADMIN_REVIEW',
        },
      };
    }

    // Call external license verification API
    const response = await axios.post(
      `${LICENSE_VERIFICATION_API_URL}/doctor/verify`,
      {
        licenseNumber,
        medicalCouncilRegistration,
      },
      {
        headers: {
          'Authorization': `Bearer ${LICENSE_VERIFICATION_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 seconds timeout
      }
    );

    if (response.data && response.data.valid) {
      return {
        valid: true,
        verified: true,
        message: 'License verified successfully',
        details: response.data.details || {},
      };
    }

  } catch (error) {
    console.error('Error verifying doctor license:', error);
    
    // If format validation passed but other errors occurred, still allow registration for admin review
    const formatValidation = validateDoctorLicenseFormat(licenseNumber);
    
    if (formatValidation.valid) {
      return {
        valid: true,
        verified: false,
        formatValid: true,
        message: 'License format is valid. Pending admin verification based on submitted documents.',
        requiresManualVerification: true,
        verificationMethod: 'document-based',
        details: {
          licenseNumber: formatValidation.normalized,
          medicalCouncilRegistration,
          status: 'PENDING_ADMIN_REVIEW',
        },
      };
    }

    return {
      valid: false,
      verified: false,
      formatValid: false,
      message: 'Invalid license number format',
      requiresManualVerification: false,
    };
  }
};

/**
 * Verify Pharmacy Registration Number
 * Hybrid Validation Model:
 * 1. Format Validation (Regex)
 * 2. Document-Based Verification (Primary Method)
 * 3. Admin Review & Manual Approval
 * 
 * @param {string} registrationNumber - Pharmacy registration number
 * @param {string} gstNumber - GST number (optional)
 * @returns {Promise<Object>} Verification result
 */
export const verifyPharmacyLicense = async (registrationNumber, gstNumber = null) => {
  try {
    // Step 1: Format Validation (Regex)
    const formatValidation = validatePharmacyLicenseFormat(registrationNumber);
    
    if (!formatValidation.valid) {
      return {
        valid: false,
        verified: false,
        formatValid: false,
        message: formatValidation.message,
        requiresManualVerification: false,
      };
    }

    // Normalize registration number for processing
    const normalizedRegistrationNumber = formatValidation.normalized;

    // Step 2: Document-Based Verification (Primary Method)
    // Since India does not publish a public API for verifying pharmacy licenses,
    // we rely on document-based verification (same as hospitals and telemedicine companies).
    // Documents are uploaded to Cloudinary and reviewed by admins.

    // If no API URL is configured, use document-based verification only
    if (!LICENSE_VERIFICATION_API_URL || !LICENSE_VERIFICATION_API_KEY) {
      console.info('Pharmacy verification API not configured. Using document-based verification.');
      return {
        valid: true,
        verified: false, // Not auto-verified, requires admin approval
        formatValid: true,
        message: 'Registration number format is valid. Pending admin verification based on submitted documents.',
        requiresManualVerification: true,
        verificationMethod: 'document-based',
        details: {
          registrationNumber: normalizedRegistrationNumber,
          gstNumber,
          status: 'PENDING_ADMIN_REVIEW',
        },
      };
    }

    // Optional: Call external pharmacy verification API if available
    try {
      const response = await axios.post(
        `${LICENSE_VERIFICATION_API_URL}/pharmacy/verify`,
        {
          registrationNumber: normalizedRegistrationNumber,
          gstNumber,
        },
        {
          headers: {
            'Authorization': `Bearer ${LICENSE_VERIFICATION_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 seconds timeout
        }
      );

      if (response.data && response.data.valid) {
        return {
          valid: true,
          verified: response.data.verified || false,
          formatValid: true,
          message: 'Registration number format is valid. API verification successful.',
          requiresManualVerification: !response.data.verified,
          verificationMethod: 'api',
          details: response.data.details || {},
        };
      }

      return {
        valid: true,
        verified: false,
        formatValid: true,
        message: response.data.message || 'Registration number format is valid. Pending admin verification.',
        requiresManualVerification: true,
        verificationMethod: 'api-failed',
        details: response.data.details || {},
      };
    } catch (apiError) {
      console.warn('Pharmacy verification API unavailable. Falling back to document-based verification.');
      // Fall back to document-based verification
      return {
        valid: true,
        verified: false,
        formatValid: true,
        message: 'Registration number format is valid. Pending admin verification based on submitted documents.',
        requiresManualVerification: true,
        verificationMethod: 'document-based',
        details: {
          registrationNumber: normalizedRegistrationNumber,
          gstNumber,
          status: 'PENDING_ADMIN_REVIEW',
        },
      };
    }
  } catch (error) {
    console.error('Error verifying pharmacy license:', error);
    
    // If format validation passed but other errors occurred, still allow registration for admin review
    const formatValidation = validatePharmacyLicenseFormat(registrationNumber);
    
    if (formatValidation.valid) {
      return {
        valid: true,
        verified: false,
        formatValid: true,
        message: 'Registration number format is valid. Pending admin verification based on submitted documents.',
        requiresManualVerification: true,
        verificationMethod: 'document-based',
        details: {
          registrationNumber: formatValidation.normalized,
          gstNumber,
          status: 'PENDING_ADMIN_REVIEW',
        },
      };
    }

    return {
      valid: false,
      verified: false,
      formatValid: false,
      message: 'Invalid pharmacy registration number format',
      requiresManualVerification: false,
    };
  }
};

/**
 * Batch verify multiple licenses (for admin use)
 * @param {Array} licenses - Array of license objects
 * @returns {Promise<Array>} Array of verification results
 */
export const batchVerifyLicenses = async (licenses) => {
  const results = await Promise.allSettled(
    licenses.map(async (license) => {
      if (license.type === 'DOCTOR') {
        return await verifyDoctorLicense(
          license.licenseNumber,
          license.medicalCouncilRegistration
        );
      } else if (license.type === 'PHARMACY') {
        return await verifyPharmacyLicense(
          license.registrationNumber,
          license.gstNumber
        );
      }
    })
  );

  return results.map((result, index) => ({
    license: licenses[index],
    result: result.status === 'fulfilled' ? result.value : { valid: false, error: result.reason },
  }));
};

export default {
  validateDoctorLicenseFormat,
  validatePharmacyLicenseFormat,
  verifyDoctorLicense,
  verifyPharmacyLicense,
  batchVerifyLicenses,
};

