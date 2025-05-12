import { Router } from 'express';
import {
  loginValidator,
  registerValidator,
  // createTokenValidator,
  // resetPasswordValidator,
  // verifyEmailResendValidator,
} from '../validators';
import { authController } from '../controllers';
import { auth } from '../middlewares';

export const authRouter = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *          schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 example: string@mail.com
 *               password:
 *                 type: string
 *                 description: length should be between 8 and 64 chars
 *     responses:
 *       "200":
 *         description: Success
 *       "400":
 *         description: Bad request
 *       "500":
 *         description: Internal server error
 */
authRouter.post('/register', registerValidator, authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *          schema:
 *            type: object
 *            required:
 *              - email
 *              - password
 *            properties:
 *              email:
 *                type: string
 *                example: string@mail.com
 *              password:
 *                type: string
 *                description: length should be between 8 and 64 chars
 *     responses:
 *       "200":
 *         description: Success
 *       "400":
 *         description: Bad request
 *       "500":
 *         description: Internal server error
 */
authRouter.post('/login', loginValidator, authController.login);

// /**
//  * @swagger
//  * /api/auth/verify/resend:
//  *   post:
//  *     summary: Resend verify email
//  *     tags:
//  *       - Auth
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *          schema:
//  *            type: object
//  *            required:
//  *              - email
//  *            properties:
//  *              email:
//  *                type: string
//  *                example: string@mail.com
//  *     responses:
//  *       "200":
//  *         description: Success
//  *       "400":
//  *         description: Bad request
//  *       "500":
//  *         description: Internal server error
//  */
// authRouter.post(
//   '/verify/resend',
//   verifyEmailResendValidator,
//   authController.verifyEmailResend,
// );

// /**
//  * @swagger
//  * /api/auth/verify/{verificationKey}:
//  *   get:
//  *     summary: Verify user email
//  *     tags:
//  *       - Auth
//  *     parameters:
//  *       - in: path
//  *         name: verificationKey
//  *         schema:
//  *          type: string
//  *     responses:
//  *       "200":
//  *         description: Success
//  *       "400":
//  *         description: Bad request
//  *       "500":
//  *         description: Internal server error
//  */
// authRouter.get('/verify/:verificationKey', authController.verify);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user session
 *     tags:
 *       - Auth
 *     responses:
 *       "200":
 *         description: Success
 *       "401":
 *         description: Unauthorized
 *       "500":
 *         description: Internal server error
 */
authRouter.post('/logout', auth, authController.logout);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags:
 *       - Auth
 *     responses:
 *       "200":
 *         description: Success
 *       "401":
 *         description: Unauthorized
 *       "403":
 *         description: Forbidden resource
 *       "500":
 *         description: Internal server error
 */
authRouter.post('/refresh', authController.refresh);

// /**
//  * @swagger
//  * /api/auth/recovery/token:
//  *   post:
//  *     summary: Create recovery token and send mail
//  *     tags:
//  *       - Auth
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *          schema:
//  *            type: object
//  *            required:
//  *              - email
//  *            properties:
//  *              email:
//  *                type: string
//  *                example: string@mail.com
//  *     responses:
//  *       "200":
//  *         description: Success
//  *       "400":
//  *         description: Bad request
//  *       "500":
//  *         description: Internal server error
//  */
// authRouter.post(
//   '/recovery/token',
//   createTokenValidator,
//   authController.createRecoveryToken,
// );

// /**
//  * @swagger
//  * /api/auth/recovery/reset-password:
//  *   post:
//  *     summary: Reset password using recovery token
//  *     tags:
//  *       - Auth
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *          schema:
//  *            type: object
//  *            required:
//  *              - token
//  *              - newPassword
//  *            properties:
//  *              token:
//  *                type: string
//  *              newPassword:
//  *                type: string
//  *     responses:
//  *       "200":
//  *         description: Success
//  *       "400":
//  *         description: Bad request
//  *       "500":
//  *         description: Internal server error
//  */
// authRouter.post(
//   '/recovery/reset-password',
//   resetPasswordValidator,
//   authController.resetPassword,
// );
