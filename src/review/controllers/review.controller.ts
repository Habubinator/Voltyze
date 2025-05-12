import { NextFunction, Response } from 'express';
import { reviewService } from '../services';
import { AuthorizedRequest } from '@auth/types';
import { HttpCodes } from '@common/enums';
import { validateRequest } from '@common/utils';

class ReviewController {
  async createReview(
    req: AuthorizedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      validateRequest(req);

      const { stationId, commentText, rating } = req.body;
      const data = await reviewService.addReview(req.user.id, {
        stationId,
        commentText,
        rating,
      });
      res.status(HttpCodes.Ok).json({ success: true, data });
    } catch (e: unknown) {
      console.error(e);
      next(e);
    }
  }

  // Remove a review
  async deleteReview(
    req: AuthorizedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      validateRequest(req);

      const { reviewId } = req.params;
      const data = await reviewService.removeReview(
        req.user,
        parseInt(reviewId),
      );
      res.status(HttpCodes.Ok).json({ success: true, data });
    } catch (e: unknown) {
      console.error(e);
      next(e);
    }
  }
}

export const reviewController = new ReviewController();
