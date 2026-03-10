const { Router } = require('express');
const store = require('../store');

const router = Router();

// GET /api/categories - list all categories
router.get('/api/categories', (req, res) => {
  const categories = store.getAllCategories();
  res.json(categories);
});

// POST /api/categories - create category
router.post('/api/categories', (req, res) => {
  const { name, color, emoji } = req.body;
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Name is required' });
  }
  const category = store.createCategory({ name: name.trim(), color, emoji });
  res.status(201).json(category);
});

// PUT /api/categories/:id - update category
router.put('/api/categories/:id', (req, res) => {
  const { name, color, emoji } = req.body;
  if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
    return res.status(400).json({ error: 'Name cannot be empty' });
  }
  const updates = {};
  if (name !== undefined) updates.name = name.trim();
  if (color !== undefined) updates.color = color;
  if (emoji !== undefined) updates.emoji = emoji;

  const category = store.updateCategory(req.params.id, updates);
  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }
  res.json(category);
});

// DELETE /api/categories/:id - delete category
router.delete('/api/categories/:id', (req, res) => {
  const deleted = store.deleteCategory(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Category not found' });
  }
  res.status(204).send();
});

module.exports = router;
