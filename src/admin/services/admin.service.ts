import { prisma } from '@database';

export class AdminService {
  // Блокування користувача
  async blockUser(userId: number, reason: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    await prisma.userBan.create({
      data: {
        userId,
        reason,
        expiredAt: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1),
        ), // блокування на рік
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { isBanned: true },
    });

    return { message: 'User blocked successfully' };
  }
}

export default new AdminService();
