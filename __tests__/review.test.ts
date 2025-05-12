// __tests__/reviewService.test.ts
import { ReviewService } from '../src/review/services/';
import { prisma } from '@database';
import { Roles } from '@auth/enums';

jest.mock('@database', () => ({
  prisma: {
    comments: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('ReviewService', () => {
  const service = new ReviewService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addReview', () => {
    it('створює відгук та повертає його', async () => {
      const userId = 7;
      const payload = { stationId: 100, commentText: 'Great!', rating: 5 };
      const fakeReview = { comment_id: 1, ...payload, user_id: userId };

      (prisma.comments.create as jest.Mock).mockResolvedValue(fakeReview);

      const result = await service.addReview(userId, payload);

      expect(prisma.comments.create).toHaveBeenCalledWith({
        data: {
          user: { connect: { id: userId } },
          station_description: {
            connect: { description_id: payload.stationId },
          },
          comment_text: payload.commentText,
          rating: payload.rating,
        },
      });
      expect(result).toEqual(fakeReview);
    });
  });

  describe('removeReview', () => {
    const owner = { id: 5, role: { id: Roles.User } };
    const admin = { id: 99, role: { id: Roles.Admin } };
    const reviewId = 123;

    it('видаляє відгук', async () => {
      const existing = { comment_id: reviewId, user_id: owner.id };
      (prisma.comments.findUnique as jest.Mock).mockResolvedValue(existing);

      const res = await service.removeReview(owner as any, reviewId);

      expect(prisma.comments.findUnique).toHaveBeenCalledWith({
        where: { comment_id: reviewId },
      });
      expect(prisma.comments.delete).toHaveBeenCalledWith({
        where: { comment_id: reviewId },
      });
      expect(res).toEqual({ message: 'Review deleted successfully' });
    });

    it('дозволяє адміну видалити чужий відгук', async () => {
      const existing = { comment_id: reviewId, user_id: 42 };
      (prisma.comments.findUnique as jest.Mock).mockResolvedValue(existing);

      const res = await service.removeReview(admin as any, reviewId);

      expect(prisma.comments.delete).toHaveBeenCalledWith({
        where: { comment_id: reviewId },
      });
      expect(res).toEqual({ message: 'Review deleted successfully' });
    });

    it('якщо відгук не знайдений', async () => {
      (prisma.comments.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.removeReview(owner as any, reviewId),
      ).rejects.toThrow('Review not found or not authorized to delete');

      expect(prisma.comments.delete).not.toHaveBeenCalled();
    });

    it('якщо юзеру не вистачає прав на видалення відгуку', async () => {
      const existing = { comment_id: reviewId, user_id: 42 };
      (prisma.comments.findUnique as jest.Mock).mockResolvedValue(existing);

      await expect(
        service.removeReview(owner as any, reviewId),
      ).rejects.toThrow('Review not found or not authorized to delete');

      expect(prisma.comments.delete).not.toHaveBeenCalled();
    });
  });
});
