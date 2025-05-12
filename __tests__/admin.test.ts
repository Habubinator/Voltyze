// __tests__/adminService.test.ts
import { AdminService as AdminServiceClass } from '../src/admin/services';
import { prisma } from '@database';

jest.mock('@database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    userBan: {
      create: jest.fn(),
    },
  },
}));

describe('AdminService.blockUser', () => {
  const service = new AdminServiceClass();

  beforeEach(() => {
    jest.clearAllMocks();
    // Подставим возвращаемый объект по умолчанию
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      isBanned: false,
    });
  });

  it('успішно заблокував даного користувача', async () => {
    const userId = 42;
    const reason = 'Violation';

    // Вызываем метод
    const result = await service.blockUser(userId, reason);

    // Должен вернуть сообщение об успехе
    expect(result).toEqual({ message: 'User blocked successfully' });

    // findUnique должна быть вызвана с правильными параметрами
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: userId },
    });

    // userBan.create: проверяем, что создаётся запись бана на год
    expect(prisma.userBan.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId,
        reason,
        expiredAt: expect.any(Date),
      }),
    });

    // user.update: проверяем обновление флага isBanned
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: { isBanned: true },
    });
  });

  it('викинув помилку, бо не знайшов користувача', async () => {
    // Для этого теста findUnique вернёт null
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(service.blockUser(999, 'No user')).rejects.toThrow(
      'User not found',
    );

    // При этом другие методы не должны вызываться
    expect(prisma.userBan.create).not.toHaveBeenCalled();
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});
