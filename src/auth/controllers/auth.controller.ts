import {
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE_OPTIONS,
} from '@common/constants';
import { HttpCodes } from '@common/enums';
import { validateRequest } from '@common/utils';
import type { NextFunction, Request, Response } from 'express';
import { authService } from '../services';

class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      validateRequest(req);

      const { user, accessToken, refreshToken } =
        await authService.register(req);

      res.cookie(
        REFRESH_TOKEN_COOKIE,
        refreshToken,
        REFRESH_TOKEN_COOKIE_OPTIONS,
      );

      res.status(HttpCodes.Ok).json({
        success: true,
        data: { user, accessToken },
      });
    } catch (e: unknown) {
      next(e);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      validateRequest(req);

      const { user, accessToken, refreshToken } = await authService.login(req);

      res.cookie(
        REFRESH_TOKEN_COOKIE,
        refreshToken,
        REFRESH_TOKEN_COOKIE_OPTIONS,
      );

      res.status(HttpCodes.Ok).json({
        success: true,
        data: { user, accessToken },
      });
    } catch (e: unknown) {
      next(e);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.logout(req);

      res.clearCookie(REFRESH_TOKEN_COOKIE);

      res.status(HttpCodes.Ok).json({ success: true });
    } catch (e: unknown) {
      next(e);
    }
  }

  async verifyEmailResend(req: Request, res: Response, next: NextFunction) {
    try {
      validateRequest(req);

      // await authService.verifyEmailResend(req);

      res.status(HttpCodes.Ok).json({ success: true });
    } catch (e: unknown) {
      next(e);
    }
  }

  async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const verificationKey = req.params.verificationKey;
      await authService.verify(verificationKey);

      res
        .status(HttpCodes.PermanentRedirect)
        .redirect(process.env.CLIENT_URL + '/successful-verification');
    } catch (e: unknown) {
      next(e);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { accessToken, refreshToken } = await authService.refresh(req);

      res.cookie(
        REFRESH_TOKEN_COOKIE,
        refreshToken,
        REFRESH_TOKEN_COOKIE_OPTIONS,
      );

      res.status(HttpCodes.Ok).json({ success: true, data: { accessToken } });
    } catch (e: unknown) {
      next(e);
    }
  }

  async createRecoveryToken(req: Request, res: Response, next: NextFunction) {
    try {
      validateRequest(req);

      // await authService.createRecoveryToken(req.body.email);

      res.status(HttpCodes.Ok).json({ success: true });
    } catch (e: unknown) {
      next(e);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      validateRequest(req);

      const userId = await authService.verifyRecoveryToken(req.body.token);
      await authService.resetPassword(userId, req.body.newPassword);

      res.status(HttpCodes.Ok).json({ success: true });
    } catch (e: unknown) {
      next(e);
    }
  }
}

export const authController = new AuthController();
