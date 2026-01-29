import { incrementRateLimit, getRateLimit } from '../config/redis.js';

/**
 * Rate Limiting Middleware
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowSeconds - Time window in seconds
 */
export const rateLimit = (maxRequests = 100, windowSeconds = 900) => {
  return async (req, res, next) => {
    try {
      // Get identifier (IP address or user ID if authenticated)
      const identifier = req.user?.id || req.ip || req.connection.remoteAddress;
      const key = `ratelimit:${identifier}`;

      // Increment rate limit counter
      const count = await incrementRateLimit(identifier, windowSeconds);

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - count));
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + windowSeconds * 1000).toISOString());

      // Check if limit exceeded
      if (count > maxRequests) {
        return res.status(429).json({
          success: false,
          message: 'Too many requests. Please try again later.',
          retryAfter: windowSeconds,
        });
      }

      next();
    } catch (error) {
      console.error('Rate limiting error:', error);
      // On error, allow request to proceed (fail open)
      next();
    }
  };
};

/**
 * Strict Rate Limiting for Authentication Endpoints
 */
export const authRateLimit = rateLimit(5, 900); // 5 requests per 15 minutes

/**
 * Standard Rate Limiting
 */
export const standardRateLimit = rateLimit(100, 900); // 100 requests per 15 minutes

export default {
  rateLimit,
  authRateLimit,
  standardRateLimit,
};

