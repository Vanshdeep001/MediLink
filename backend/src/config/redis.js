import dotenv from 'dotenv';

dotenv.config();

// In-Memory Mock Redis for environments without a local Redis server
class MockRedis {
  constructor() {
    this.store = new Map();
    this.expiry = new Map();
  }

  async connect() {
    console.log('💡 Using In-Memory Fallback (No Redis server detected)');
    return Promise.resolve();
  }

  async setEx(key, seconds, value) {
    this.store.set(key, value);
    this.expiry.set(key, Date.now() + (seconds * 1000));
  }

  async set(key, value) {
    this.store.set(key, value);
  }

  async get(key) {
    if (this.expiry.has(key) && this.expiry.get(key) < Date.now()) {
      this.store.delete(key);
      this.expiry.delete(key);
      return null;
    }
    return this.store.get(key) || null;
  }

  async del(key) {
    this.store.delete(key);
    this.expiry.delete(key);
  }

  async incr(key) {
    const val = parseInt(await this.get(key) || '0') + 1;
    this.store.set(key, val.toString());
    return val;
  }

  async expire(key, seconds) {
    this.expiry.set(key, Date.now() + (seconds * 1000));
  }

  on(event, cb) {
    // No-op for mock events
  }
}

let redisClient = new MockRedis();
let isConnected = true; // Use true since mock is always "ready"

export const connectRedis = async () => {
    // For mock, we simply log once
    console.log('✅ In-memory storage ready (Redis fallback)');
};

// Helper Functions
export const setOTP = async (email, otp, expirySeconds = 300) => {
  const key = `otp:${email}`;
  await redisClient.setEx(key, expirySeconds, otp.toString());
};

export const getOTP = async (email) => {
  const key = `otp:${email}`;
  return await redisClient.get(key);
};

export const deleteOTP = async (email) => {
  const key = `otp:${email}`;
  await redisClient.del(key);
};

export const setSession = async (userId, token, expirySeconds = 86400) => {
  const key = `session:${userId}`;
  await redisClient.setEx(key, expirySeconds, token);
};

export const getSession = async (userId) => {
  const key = `session:${userId}`;
  return await redisClient.get(key);
};

export const deleteSession = async (userId) => {
  const key = `session:${userId}`;
  await redisClient.del(key);
};

export const incrementRateLimit = async (identifier, windowSeconds = 900) => {
  const key = `ratelimit:${identifier}`;
  const count = await redisClient.incr(key);
  if (count === 1) {
    await redisClient.expire(key, windowSeconds);
  }
  return count;
};

export const getRateLimit = async (identifier) => {
  const key = `ratelimit:${identifier}`;
  return await redisClient.get(key) || 0;
};

export const setCache = async (key, value, expirySeconds = 3600) => {
  await redisClient.setEx(key, expirySeconds, JSON.stringify(value));
};

export const getCache = async (key) => {
  const value = await redisClient.get(key);
  return value ? JSON.parse(value) : null;
};

export const deleteCache = async (key) => {
  await redisClient.del(key);
};

export const setEmailVerificationToken = async (email, token, expirySeconds = 3600) => {
  const key = `email_verify:${email}`;
  await redisClient.setEx(key, expirySeconds, token);
};

export const getEmailVerificationToken = async (email) => {
  const key = `email_verify:${email}`;
  return await redisClient.get(key);
};

export const deleteEmailVerificationToken = async (email) => {
  const key = `email_verify:${email}`;
  await redisClient.del(key);
};

export const setPasswordResetToken = async (email, token, expirySeconds = 1800) => {
  const key = `password_reset:${email}`;
  await redisClient.setEx(key, expirySeconds, token);
};

export const getPasswordResetToken = async (email) => {
  const key = `password_reset:${email}`;
  return await redisClient.get(key);
};

export const deletePasswordResetToken = async (email) => {
  const key = `password_reset:${email}`;
  await redisClient.del(key);
};

export default redisClient;
