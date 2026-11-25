import { prisma } from '../config/prisma.js';

export async function getAllCategories() {
  return prisma.category.findMany({
    orderBy: { id: 'asc' }
  });
}