import { Router } from 'express';

import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';

import {
  requireAuth,
  requireRole
} from '../middleware/authMiddleware.js';

const router = Router();

// Публичные маршруты
router.get('/', getProducts);
router.get('/:id', getProductById);

// Только администратор
router.post(
  '/',
  requireAuth,
  requireRole('admin'),
  createProduct
);

router.patch(
  '/:id',
  requireAuth,
  requireRole('admin'),
  updateProduct
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('admin'),
  deleteProduct
);

export default router;