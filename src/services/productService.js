import { prisma } from '../config/prisma.js';

export async function createProduct(data) {
  return prisma.product.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      price: String(data.price),
      stock: data.stock,
      categoryId: data.categoryId
    },
    include: {
      category: true
    }
  });
}
export async function updateProduct(id, data) {
  const updateData = { ...data };

  if (updateData.price !== undefined) {
    updateData.price = String(updateData.price);
  }

  return prisma.product.update({
    where: { id },
    data: updateData,
    include: {
      category: true
    }
  });
}
export async function deleteProduct(id) {
  return prisma.product.delete({
    where: { id }
  });
}
export async function getAllProducts() {
  return prisma.product.findMany({
    include: {
      category: true
    },
    orderBy: {
      id: 'asc'
    }
  });
}

export async function getProductById(id) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      category: true
    }
  });
}