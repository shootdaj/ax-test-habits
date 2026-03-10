const { Router } = require('express');
const store = require('../store');

const router = Router();

// POST /api/checkins - toggle a check-in for a habit on a date
router.post('/api/checkins', (req, res) => {
  const { habitId, date } = req.body;
  if (!habitId || !date) {
    return res.status(400).json({ error: 'habitId and date are required' });
  }
  // Validate date format YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
  }
  // Check habit exists
  const habit = store.getHabit(habitId);
  if (!habit) {
    return res.status(404).json({ error: 'Habit not found' });
  }

  // Toggle: if checked in, remove; if not, add
  const isCheckedIn = store.hasCheckin(habitId, date);
  if (isCheckedIn) {
    store.removeCheckin(habitId, date);
    res.json({ habitId, date, checkedIn: false });
  } else {
    store.addCheckin(habitId, date);
    res.json({ habitId, date, checkedIn: true });
  }
});

// GET /api/checkins/:habitId - get all check-ins for a habit
router.get('/api/checkins/:habitId', (req, res) => {
  const habit = store.getHabit(req.params.habitId);
  if (!habit) {
    return res.status(404).json({ error: 'Habit not found' });
  }
  const checkins = store.getCheckinsForHabit(req.params.habitId);
  res.json(checkins);
});

// DELETE /api/checkins - remove a specific check-in
router.delete('/api/checkins', (req, res) => {
  const { habitId, date } = req.body;
  if (!habitId || !date) {
    return res.status(400).json({ error: 'habitId and date are required' });
  }
  const removed = store.removeCheckin(habitId, date);
  if (!removed) {
    return res.status(404).json({ error: 'Check-in not found' });
  }
  res.status(204).send();
});

module.exports = router;
