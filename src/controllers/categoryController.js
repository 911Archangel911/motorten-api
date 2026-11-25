import { getAllCategories } from '../services/categoryService.js';

export async function getCategories(req, res, next) {
  try {
    const categories = await getAllCategories();
    res.json(categories);
  } catch (error) {
    next(error);
  }
}