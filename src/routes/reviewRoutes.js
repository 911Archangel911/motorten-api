import { Router } from 'express';

import {
  getReviews,
  createReview,
  updateReview,
  deleteReview
} from '../controllers/reviewController.js';

import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Просмотр отзывов
router.get('/products/:id/reviews', getReviews);

// Добавление отзыва
router.post('/products/:id/reviews', requireAuth, createReview);

// Изменение своего отзыва
router.patch('/reviews/:id', requireAuth, updateReview);

// Удаление своего отзыва или администратором
router.delete('/reviews/:id', requireAuth, deleteReview);

export default router;