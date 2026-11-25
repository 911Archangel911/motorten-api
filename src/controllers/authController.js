import { z } from 'zod';
import { registerUser, loginUser } from '../services/authService.js';

const registerSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(8)
});

export async function register(req, res) {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: 'Некорректные данные регистрации'
    });
  }

  try {
    const { name, email, password } = result.data;

    const user = await registerUser(
      name,
      email.toLowerCase(),
      password
    );

    return res.status(201).json({
      message: 'Регистрация успешна',
      user
    });
  } catch (error) {
    if (error.status === 409 || error.code === 'P2002') {
      return res.status(409).json({
        error: 'Email уже зарегистрирован'
      });
    }

    console.error(error);

    return res.status(500).json({
      error: 'Ошибка сервера'
    });
  }
}
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function login(req, res) {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: 'Некорректные данные'
    });
  }

  try {
    const { email, password } = result.data;

    const data = await loginUser(
      email.trim().toLowerCase(),
      password
    );

    return res.status(200).json(data);
  } catch (error) {
    if (error.status === 401) {
      return res.status(401).json({
        error: 'Неверный email или пароль'
      });
    }

    console.error(error);
    return res.status(500).json({
      error: 'Ошибка сервера'
    });
  }
}