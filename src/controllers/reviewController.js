import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import * as reviewService from '../services/reviewService.js';

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional()
}).strict();

function getProductId(req, res) {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(400).json({
      error: 'Некорректный ID товара'
    });
    return null;
  }

  return id;
}

export async function getReviews(req, res, next) {
  const productId = getProductId(req, res);
  if (productId === null) return;

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true }
    });

    if (!product) {
      return res.status(404).json({
        error: 'Товар не найден'
      });
    }

    const reviews =
      await reviewService.getProductReviews(productId);

    return res.json(reviews);
  } catch (error) {
    next(error);
  }
}

export async function createReview(req, res, next) {
  const productId = getProductId(req, res);
  if (productId === null) return;

  const result = reviewSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: 'Некорректные данные отзыва'
    });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true }
    });

    if (!product) {
      return res.status(404).json({
        error: 'Товар не найден'
      });
    }

    const review = await reviewService.createReview(
      req.user.id,
      productId,
      result.data
    );

    return res.status(201).json(review);
  } catch (error) {
    next(error);
  }
}
const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().trim().max(1000).optional()
}).strict().refine(
  data => Object.keys(data).length > 0
);

export async function updateReview(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      error: 'Некорректный ID отзыва'
    });
  }

  const result = updateReviewSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: 'Некорректные данные отзыва'
    });
  }

  try {
    const review = await reviewService.getReviewById(id);

    if (!review) {
      return res.status(404).json({
        error: 'Отзыв не найден'
      });
    }

    if (review.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Можно изменять только свои отзывы'
      });
    }

    const updated = await reviewService.updateReview(
      id,
      result.data
    );

    return res.json(updated);
  } catch (error) {
    next(error);
  }
}

export async function deleteReview(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      error: 'Некорректный ID отзыва'
    });
  }

  try {
    const review = await reviewService.getReviewById(id);

    if (!review) {
      return res.status(404).json({
        error: 'Отзыв не найден'
      });
    }

    const isOwner = review.userId === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: 'Недостаточно прав'
      });
    }

    await reviewService.deleteReview(id);

    return res.json({
      message: 'Отзыв успешно удалён',
      reviewId: id
    });
  } catch (error) {
    next(error);
  }
}