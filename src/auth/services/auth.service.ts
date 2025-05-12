import { REFRESH_TOKEN_COOKIE } from '@common/constants';
import { ErrorCodes } from '@common/enums';
import { HttpException } from '@common/exceptions';
import { prisma } from '@database';
import { encrypt } from '@common/utils';
// import { MAIL_SEND, MailDto } from '@mail';
// import { mailHtml } from '../utils';

import { compare, genSalt, hash } from 'bcryptjs';
import { Request } from 'express';
import { LoginDto, RegisterDto } from '../dto';
import { Roles } from '../enums';
import { sessionService } from './session.service';
import { tokenService } from './token.service';
import { v4 } from 'uuid';
import moment from 'moment';

class AuthService {
  async register(req: Request) {
    const dto = new RegisterDto({
      ...req.body,
      headers: {
        ip: req.clientIp || '',
        userAgent: req.headers['user-agent'] || '',
      },
    });

    const candidate = await prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });

    if (candidate) {
      throw HttpException.BadRequest(
        ErrorCodes.BadRequest,
        req.__('errors.auth.emailTaken', dto.email),
      );
    }

    const user = await this.createUser(
      dto.name,
      dto.email,
      dto.password,
      Roles.User,
      true,
    );

    // this.sendVerificationEmail(user.email, user.emailVerificationKey);

    const sessionId = await sessionService.create(
      user.id,
      dto.headers.userAgent,
      dto.headers.ip,
    );
    const tokens = tokenService.generateTokens(user.id, sessionId);
    await sessionService.setRefreshToken(sessionId, tokens.refreshToken);

    return { user, ...tokens };
  }

  async login(req: Request) {
    const dto = new LoginDto({
      ...req.body,
      headers: {
        ip: req.clientIp || 'hidden',
        userAgent: req.headers['user-agent'] || 'hidden',
      },
    });

    const user = await prisma.user.findUnique({
      where: { email: dto.email },
      omit: { roleId: true },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw HttpException.BadRequest(
        ErrorCodes.BadRequest,
        req.__('errors.auth.invalidLoginOrPassword'),
      );
    }

    const isValidPassword = await compare(dto.password, user.passwordHash);
    if (!isValidPassword) {
      throw HttpException.BadRequest(
        ErrorCodes.BadRequest,
        req.__('errors.auth.invalidLoginOrPassword'),
      );
    }

    const sessionId = await sessionService.create(
      user.id,
      dto.headers.userAgent,
      dto.headers.ip,
    );
    const tokens = tokenService.generateTokens(user.id, sessionId);
    await sessionService.setRefreshToken(sessionId, tokens.refreshToken);

    delete user.passwordHash;

    return { user, ...tokens };
  }

  // async verifyEmailResend(req: Request) {
  //   const dto = new VerifyEmailResendDto(req.body);

  //   const user = await prisma.user.findUnique({
  //     where: { email: dto.email },
  //     select: { emailVerificationKey: true },
  //   });

  //   if (!user) {
  //     throw HttpException.BadRequest(
  //       ErrorCodes.BadRequest,
  //       req.__('errors.auth.userWithEmailNotFound', dto.email),
  //     );
  //   }

  //   this.sendVerificationEmail(dto.email, user.emailVerificationKey);
  // }

  async verify(verificationKey: string) {
    const user = await prisma.user.findUnique({
      where: { emailVerificationKey: verificationKey },
      select: { id: true },
    });

    if (!user) {
      throw HttpException.BadRequest(ErrorCodes.BadRequest);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationKey: null,
        emailVerifiedAt: new Date(),
      },
    });
  }

  async logout(req: Request) {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE];

    if (!refreshToken) {
      throw HttpException.Unauthorized(
        ErrorCodes.Auth,
        req.__('errors.auth.sessionNotFound'),
      );
    }

    const claims = await tokenService.validateRefreshToken(refreshToken);
    await sessionService.destroy(claims, req);
  }

  async refresh(req: Request) {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE];

    if (!refreshToken) {
      throw HttpException.Unauthorized(ErrorCodes.Auth);
    }

    const claims = tokenService.validateRefreshToken(refreshToken);
    await sessionService.validate(claims, req);

    const tokens = tokenService.generateTokens(claims.userId, claims.sessionId);
    await sessionService.setRefreshToken(claims.sessionId, tokens.refreshToken);

    return tokens;
  }

  // async createRecoveryToken(email: string) {
  //   const user = await prisma.user.findUnique({ where: { email } });

  //   if (!user) {
  //     throw HttpException.BadRequest(
  //       ErrorCodes.BadRequest,
  //       'User to recovery not found',
  //     );
  //   }

  //   const token = v4().replaceAll('-', '');
  //   const body = {
  //     tokenHash: encrypt(token),
  //     expiresAt: moment.utc().add(30, 'minutes').toDate(),
  //   };

  //   await prisma.recoveryToken.upsert({
  //     where: { userId: user.id },
  //     create: {
  //       userId: user.id,
  //       ...body,
  //     },
  //     update: body,
  //   });

  //   emitEvent(
  //     MAIL_SEND,
  //     new MailDto({
  //       to: email,
  //       subject: `Password recovery on ${process.env.DOMAIN}`,
  //       html: mailHtml(
  //         `Password recovery on ${process.env.DOMAIN}`,
  //         '',
  //         `https://${process.env.DOMAIN}/password-recovery/${token}`,
  //         'Recover password',
  //       ),
  //     }),
  //   );
  // }

  // private sendVerificationEmail(to: string, verificationKey: string) {
  //   const link = `${process.env.API_URL}/auth/verify/${verificationKey}`;

  //   emitEvent(
  //     MAIL_SEND,
  //     new MailDto({
  //       to,
  //       subject: `Email verification on ${process.env.DOMAIN}`,
  //       html: mailHtml(
  //         `Email verification on ${process.env.DOMAIN}`,
  //         'Please, verify your email',
  //         link,
  //         'Verify',
  //       ),
  //     }),
  //   );
  // }

  async verifyRecoveryToken(token: string) {
    const recoveryToken = await prisma.recoveryToken.findFirst({
      where: { tokenHash: encrypt(token) },
    });

    if (!recoveryToken) {
      throw HttpException.BadRequest(
        ErrorCodes.BadRequest,
        'Recovery token not found',
      );
    }

    if (moment(recoveryToken.expiresAt).diff(moment.utc(), 'minutes') > 30) {
      await prisma.recoveryToken.delete({
        where: { userId: recoveryToken.userId },
      });
      throw HttpException.BadRequest(
        ErrorCodes.BadRequest,
        'Recovery token expired',
      );
    }

    return recoveryToken.userId;
  }

  async resetPassword(userId: number, newPassword: string) {
    const salt = await genSalt(10);
    const passwordHash = await hash(newPassword, salt);

    const user = await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw HttpException.BadRequest(ErrorCodes.BadRequest, 'User not found');
    }

    await prisma.$transaction([
      prisma.recoveryToken.deleteMany({
        where: { userId: user.id },
      }),
      prisma.userSession.deleteMany({
        where: { userId: user.id },
      }),
    ]);
  }

  private async hashPassword(password: string) {
    const salt = await genSalt(10);
    const passwordHash = await hash(password, salt);

    return passwordHash;
  }

  async changePassword(req: Request) {
    const id = +req.params.id;

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { passwordHash: true },
    });

    if (!targetUser) {
      throw HttpException.BadRequest(
        ErrorCodes.BadRequest,
        req.__('errors.users.notFound'),
      );
    }

    const passwordHash = await this.hashPassword(req.body.password);

    await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }

  async createUser(
    name: string,
    email: string,
    password: string,
    roleId: Roles,
    verified: boolean = false,
    permissions: { rolePermissionId: number }[] = [],
  ) {
    const passwordHash = await this.hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        roleId,
        emailVerificationKey: verified ? null : v4(),
        emailVerifiedAt: verified ? new Date() : null,
        permissions:
          permissions.length > 0
            ? {
                createMany: {
                  data: permissions,
                },
              }
            : undefined,
      },
      omit: { passwordHash: true, roleId: true },
      include: { role: true },
    });

    return user;
  }
}

export const authService = new AuthService();
