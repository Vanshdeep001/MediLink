/**
 * modules/auth/auth.controller.js
 * Thin Express handlers – delegates to auth.service.js.
 */

import * as authService from './auth.service.js';
import { sendSuccess, sendError } from '../../common/response.js';
import {
  registerStep1Schema,
  registerStep2Schema,
  loginSchema,
  refreshTokenSchema,
} from './auth.validation.js';

// ── Register Step 1 ───────────────────────────────────────────────────────
export const registerStep1 = async (req, res, next) => {
  try {
    const body = registerStep1Schema.parse(req.body);
    const result = await authService.registerStep1(body);
    return sendSuccess(res, {
      message: 'Registration step 1 complete. Use the temp token to finish step 2.',
      data: result,
      status: 201,
    });
  } catch (error) {
    next(error);
  }
};

// ── Register Step 2 ───────────────────────────────────────────────────────
export const registerStep2 = async (req, res, next) => {
  try {
    const body = registerStep2Schema.parse(req.body);
    const result = await authService.registerStep2(req.user.id, body);
    return sendSuccess(res, {
      message: 'Registration complete!',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ── Login ──────────────────────────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const result = await authService.login(body);

    if (result.incomplete) {
      return sendSuccess(res, {
        message: result.message,
        data: {
          incomplete: true,
          registrationStep: result.registrationStep,
          tempToken: result.tempToken,
        },
        status: 200,
      });
    }

    return sendSuccess(res, {
      message: 'Login successful',
      data: {
        user: result.user,
        tokens: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── Logout ─────────────────────────────────────────────────────────────────
export const logoutUser = async (req, res, next) => {
  try {
    await authService.logout(req.user.id);
    return sendSuccess(res, { message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// ── Refresh Token ──────────────────────────────────────────────────────────
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = refreshTokenSchema.parse(req.body);
    const tokens = await authService.refreshAccessToken(token);
    return sendSuccess(res, {
      message: 'Token refreshed',
      data: { tokens },
    });
  } catch (error) {
    next(error);
  }
};
