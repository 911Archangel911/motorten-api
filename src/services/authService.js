import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import { prisma } from '../config/prisma.js';

export async function registerUser(name, email, password) {
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    const error = new Error('Email уже зарегистрирован');
    error.status = 409;
    throw error;
  }

  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id
  });

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: 'user'
    }
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}
export async function loginUser(email, password) {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  const validPassword = user
    ? await argon2.verify(user.passwordHash, password)
    : false;

  if (!validPassword) {
    const error = new Error('Неверный email или пароль');
    error.status = 401;
    throw error;
  }

  if (!process.env.JWT_SECRET ||
      process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET не настроен');
  }

  const accessToken = jwt.sign(
    {},
    process.env.JWT_SECRET,
    {
      subject: String(user.id),
      expiresIn: '1h',
      algorithm: 'HS256'
    }
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    accessToken
  };
}