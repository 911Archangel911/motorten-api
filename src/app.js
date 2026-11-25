import reviewRoutes from './routes/reviewRoutes.js';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';

import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());

// Главная страница API
app.get('/', (req, res) => {
  res.json({
    name: 'MotorTen API',
    version: '1.0.0',
    message: 'Сервер работает успешно!'
  });
});

// Проверка сервера
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok'
  });
});

// Маршруты API
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api', reviewRoutes);

// Неизвестные маршруты
app.use((req, res) => {
  res.status(404).json({
    error: 'Маршрут не найден'
  });
});

// Централизованная обработка ошибок
app.use(errorHandler);

export default app;