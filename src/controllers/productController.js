import { z } from 'zod';
import * as productService from '../services/productService.js';

const productSchema = z.object({
  name: z.string().trim().min(2),
  description: z.string().trim().optional(),
  price: z.number().finite().positive(),
  stock: z.number().int().min(0),
  categoryId: z.number().int().positive()
}).strict();

export async function createProduct(req, res) {
  const result = productSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: 'Некорректные данные товара',
      details: result.error.flatten().fieldErrors
    });
  }

  try {
    const product = await productService.createProduct(
      result.data
    );

    return res.status(201).json(product);
  } catch (error) {
    if (error.code === 'P2003') {
      return res.status(409).json({
        error: 'Указанная категория не существует'
      });
    }

    console.error(error);
    return res.status(500).json({
      error: 'Ошибка создания товара'
    });
  }
}
const updateProductSchema = z.object({
  name: z.string().trim().min(2).optional(),
  description: z.string().optional(),
  price: z.number().finite().positive().optional(),
  stock: z.number().int().min(0).optional(),
  categoryId: z.number().int().positive().optional()
}).strict().refine(
  data => Object.keys(data).length > 0,
  { message: 'Укажи хотя бы одно поле' }
);

export async function updateProduct(req, res) {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      error: 'Некорректный ID товара'
    });
  }

  const result = updateProductSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: 'Некорректные данные товара'
    });
  }

  try {
    const product = await productService.updateProduct(
      id,
      result.data
    );

    return res.json(product);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'Товар не найден'
      });
    }

    if (error.code === 'P2003') {
      return res.status(409).json({
        error: 'Указанная категория не существует'
      });
    }

    console.error(error);
    return res.status(500).json({
      error: 'Ошибка обновления товара'
    });
  }
}
export async function deleteProduct(req, res) {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      error: 'Некорректный ID товара'
    });
  }

  try {
    await productService.deleteProduct(id);

    return res.status(200).json({
      message: 'Товар успешно удалён',
      productId: id
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'Товар не найден'
      });
    }

    if (error.code === 'P2003' || error.code === 'P2014') {
      return res.status(409).json({
        error: 'Невозможно удалить товар со связанными записями'
      });
    }

    console.error(error);

    return res.status(500).json({
      error: 'Ошибка удаления товара'
    });
  }
}
export async function getProducts(req, res, next) {
  try {
    const products = await productService.getAllProducts();
    return res.status(200).json(products);
  } catch (error) {
    next(error);
  }
}

export async function getProductById(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      error: 'Некорректный ID товара'
    });
  }

  try {
    const product = await productService.getProductById(id);

    if (!product) {
      return res.status(404).json({
        error: 'Товар не найден'
      });
    }

    return res.status(200).json(product);
  } catch (error) {
    next(error);
  }
}