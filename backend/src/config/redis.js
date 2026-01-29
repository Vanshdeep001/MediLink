import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// Redis Client Configuration
const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  password: process.env.REDIS_PASSWORD || undefined,
});

let isConnected = false;

// Initialize Redis connection
export const connectRedis = async () => {
  try {
    if (!isConnected) {
      await redisClient.connect();
      isConnected = true;
      console.log('✅ Redis connected successfully');
    }
  } catch (error) {
    console.error('❌ Redis connection error:', error);
    // Don't throw - allow app to continue without Redis (graceful degradation)
  }
};

redisClient.on('error', (err) => {
  console.error('❌ Redis error:', err);
  isConnected = false;
});

redisClient.on('connect', () => {
  console.log('✅ Redis connected successfully');
  isConnected = true;
});

redisClient.on('disconnect', () => {
  console.log('⚠️ Redis disconnected');
  isConnected = false;
});

// Initialize connection on import
connectRedis().catch(console.error);

// Redis Helper Functions

// OTP Operations
export const setOTP = async (email, otp, expirySeconds = 300) => {
  if (!isConnected) await connectRedis();
  const key = `otp:${email}`;
  await redisClient.setEx(key, expirySeconds, otp.toString());
};

export const getOTP = async (email) => {
  if (!isConnected) await connectRedis();
  const key = `otp:${email}`;
  return await redisClient.get(key);
};

export const deleteOTP = async (email) => {
  if (!isConnected) await connectRedis();
  const key = `otp:${email}`;
  await redisClient.del(key);
};

// Session Operations
export const setSession = async (userId, token, expirySeconds = 86400) => {
  if (!isConnected) await connectRedis();
  const key = `session:${userId}`;
  await redisClient.setEx(key, expirySeconds, token);
};

export const getSession = async (userId) => {
  if (!isConnected) await connectRedis();
  const key = `session:${userId}`;
  return await redisClient.get(key);
};

export const deleteSession = async (userId) => {
  if (!isConnected) await connectRedis();
  const key = `session:${userId}`;
  await redisClient.del(key);
};

// Rate Limiting
export const incrementRateLimit = async (identifier, windowSeconds = 900) => {
  if (!isConnected) await connectRedis();
  const key = `ratelimit:${identifier}`;
  const count = await redisClient.incr(key);
  if (count === 1) {
    await redisClient.expire(key, windowSeconds);
  }
  return count;
};

export const getRateLimit = async (identifier) => {
  if (!isConnected) await connectRedis();
  const key = `ratelimit:${identifier}`;
  return await redisClient.get(key) || 0;
};

// Cache Operations
export const setCache = async (key, value, expirySeconds = 3600) => {
  if (!isConnected) await connectRedis();
  await redisClient.setEx(key, expirySeconds, JSON.stringify(value));
};

export const getCache = async (key) => {
  if (!isConnected) await connectRedis();
  const value = await redisClient.get(key);
  return value ? JSON.parse(value) : null;
};

export const deleteCache = async (key) => {
  if (!isConnected) await connectRedis();
  await redisClient.del(key);
};

// Email Verification Token
export const setEmailVerificationToken = async (email, token, expirySeconds = 3600) => {
  if (!isConnected) await connectRedis();
  const key = `email_verify:${email}`;
  await redisClient.setEx(key, expirySeconds, token);
};

export const getEmailVerificationToken = async (email) => {
  if (!isConnected) await connectRedis();
  const key = `email_verify:${email}`;
  return await redisClient.get(key);
};

export const deleteEmailVerificationToken = async (email) => {
  if (!isConnected) await connectRedis();
  const key = `email_verify:${email}`;
  await redisClient.del(key);
};

// Password Reset Token
export const setPasswordResetToken = async (email, token, expirySeconds = 1800) => {
  if (!isConnected) await connectRedis();
  const key = `password_reset:${email}`;
  await redisClient.setEx(key, expirySeconds, token);
};

export const getPasswordResetToken = async (email) => {
  if (!isConnected) await connectRedis();
  const key = `password_reset:${email}`;
  return await redisClient.get(key);
};

export const deletePasswordResetToken = async (email) => {
  if (!isConnected) await connectRedis();
  const key = `password_reset:${email}`;
  await redisClient.del(key);
};

export default redisClient;
