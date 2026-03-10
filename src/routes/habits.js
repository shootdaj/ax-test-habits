const { Router } = require('express');
const store = require('../store');

const router = Router();

// GET /api/habits - list all habits
router.get('/api/habits', (req, res) => {
  const habits = store.getAllHabits();
  res.json(habits);
});

// GET /api/habits/:id - get single habit
router.get('/api/habits/:id', (req, res) => {
  const habit = store.getHabit(req.params.id);
  if (!habit) {
    return res.status(404).json({ error: 'Habit not found' });
  }
  res.json(habit);
});

// POST /api/habits - create habit
router.post('/api/habits', (req, res) => {
  const { name, frequency, color, emoji, categoryId } = req.body;
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Name is required' });
  }
  if (frequency && !['daily', 'weekly'].includes(frequency)) {
    return res.status(400).json({ error: 'Frequency must be "daily" or "weekly"' });
  }
  const habit = store.createHabit({ name: name.trim(), frequency, color, emoji, categoryId });
  res.status(201).json(habit);
});

// PUT /api/habits/:id - update habit
router.put('/api/habits/:id', (req, res) => {
  const { name, frequency, color, emoji, categoryId } = req.body;
  if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
    return res.status(400).json({ error: 'Name cannot be empty' });
  }
  if (frequency !== undefined && !['daily', 'weekly'].includes(frequency)) {
    return res.status(400).json({ error: 'Frequency must be "daily" or "weekly"' });
  }
  const updates = {};
  if (name !== undefined) updates.name = name.trim();
  if (frequency !== undefined) updates.frequency = frequency;
  if (color !== undefined) updates.color = color;
  if (emoji !== undefined) updates.emoji = emoji;
  if (categoryId !== undefined) updates.categoryId = categoryId;

  const habit = store.updateHabit(req.params.id, updates);
  if (!habit) {
    return res.status(404).json({ error: 'Habit not found' });
  }
  res.json(habit);
});

// DELETE /api/habits/:id - delete habit
router.delete('/api/habits/:id', (req, res) => {
  const deleted = store.deleteHabit(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Habit not found' });
  }
  res.status(204).send();
});

module.exports = router;
