import { setOTP, getOTP, deleteOTP } from '../config/redis.js';
import { sendOTPEmail } from './email.service.js';

/**
 * Generate 6-digit OTP
 * @returns {string} 6-digit OTP
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP to email and store in Redis
 * @param {string} email - User email
 * @returns {Promise<Object>} { success, otp }
 */
export const sendOTP = async (email) => {
  try {
    const otp = generateOTP();
    
    // Store OTP in Redis (expires in 5 minutes)
    await setOTP(email, otp, 300);
    
    // Send OTP via email
    await sendOTPEmail(email, otp);
    
    // In development, log OTP for testing
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] OTP for ${email}: ${otp}`);
    }
    
    return { success: true, otp: process.env.NODE_ENV === 'development' ? otp : undefined };
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Failed to send OTP');
  }
};

/**
 * Verify OTP
 * @param {string} email - User email
 * @param {string} otp - OTP to verify
 * @returns {Promise<boolean>} True if OTP is valid
 */
export const verifyOTP = async (email, otp) => {
  try {
    const storedOTP = await getOTP(email);
    
    if (!storedOTP) {
      return { valid: false, message: 'OTP expired or not found' };
    }
    
    if (storedOTP !== otp) {
      return { valid: false, message: 'Invalid OTP' };
    }
    
    // Delete OTP after successful verification
    await deleteOTP(email);
    
    return { valid: true, message: 'OTP verified successfully' };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw new Error('Failed to verify OTP');
  }
};

export default {
  generateOTP,
  sendOTP,
  verifyOTP,
};

