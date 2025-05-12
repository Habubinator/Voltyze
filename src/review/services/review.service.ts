import { Roles } from '@auth/enums';
import { AuthorizedUser } from '@auth/types';
import { prisma } from '@database';

class ReviewService {
  // Додавання відгуку
  async addReview(
    user_id: number,
    data: { stationId: number; commentText: string; rating: number },
  ) {
    const review = await prisma.comments.create({
      data: {
        user: { connect: { id: user_id } },
        station_description: { connect: { description_id: data.stationId } },
        comment_text: data.commentText,
        rating: data.rating,
      },
    });
    return review;
  }

  // Видалення відгуку
  async removeReview(user: AuthorizedUser, reviewId: number) {
    const review = await prisma.comments.findUnique({
      where: { comment_id: reviewId },
    });

    if (!review || (review.user_id !== user.id && user.role.id == Roles.User)) {
      throw new Error('Review not found or not authorized to delete');
    }

    await prisma.comments.delete({
      where: { comment_id: reviewId },
    });
    return { message: 'Review deleted successfully' };
  }
}

export const reviewService = new ReviewService();
