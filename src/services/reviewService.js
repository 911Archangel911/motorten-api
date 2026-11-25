import { prisma } from '../config/prisma.js';

export async function getProductReviews(productId) {
  return prisma.review.findMany({
    where: { productId },
    include: {
      user: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

export async function createReview(userId, productId, data) {
  return prisma.review.create({
    data: {
      userId,
      productId,
      rating: data.rating,
      comment: data.comment ?? null
    }
  });
}
export async function getReviewById(id) {
  return prisma.review.findUnique({
    where: { id }
  });
}

export async function updateReview(id, data) {
  return prisma.review.update({
    where: { id },
    data
  });
}

export async function deleteReview(id) {
  return prisma.review.delete({
    where: { id }
  });
}