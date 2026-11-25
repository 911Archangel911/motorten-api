export function errorHandler(err, req, res, next) {
  console.error('Ошибка API:', err);

  // Некорректный JSON
  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({
      error: 'Некорректный JSON'
    });
  }

  // Неверная связь с другой таблицей
  if (err.code === 'P2003') {
    return res.status(409).json({
      error: 'Ошибка связи данных'
    });
  }

  // Запись не найдена
  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Запись не найдена'
    });
  }

  // Нарушение уникальности
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Запись уже существует'
    });
  }

  const status = Number.isInteger(err.status) &&
    err.status >= 400 && err.status < 500
    ? err.status
    : 500;

  return res.status(status).json({
    error: status === 500
      ? 'Внутренняя ошибка сервера'
      : err.message
  });
}