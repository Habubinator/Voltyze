import { Router } from 'express';
import { reviewController } from '../controllers';

const router = Router();

// POST /review - Create a new review
router.post('/review', reviewController.createReview);

// DELETE /review/:id - Delete a review by ID
router.delete('/review/:reviewId', reviewController.deleteReview);
