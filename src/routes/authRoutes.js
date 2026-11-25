import { Router } from 'express';
import { register, login } from '../controllers/authController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.get(
  '/admin-check',
  requireAuth,
  requireRole('admin'),
  (req, res) => {
    res.json({ message: 'Доступ администратора разрешён' });
  }
);

export default router;