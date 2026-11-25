import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Требуется авторизация'
    });
  }

  const token = header.slice(7).trim();

  let payload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256']
    });
  } catch {
    return res.status(401).json({
      error: 'Недействительный или просроченный токен'
    });
  }

  const id = Number(payload.sub);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(401).json({
      error: 'Недействительный токен'
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Пользователь не найден'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Требуется авторизация'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Недостаточно прав'
      });
    }

    next();
  };
}