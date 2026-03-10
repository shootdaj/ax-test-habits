const { Router } = require('express');
const store = require('../store');
const streaksService = require('../services/streaks');
const statsService = require('../services/stats');

const router = Router();

// GET /api/habits/:id/streaks - get streak info for a habit
router.get('/api/habits/:id/streaks', (req, res) => {
  const habit = store.getHabit(req.params.id);
  if (!habit) {
    return res.status(404).json({ error: 'Habit not found' });
  }
  const checkins = store.getCheckinsForHabit(req.params.id);
  const dates = checkins.map(c => c.date).sort();

  const currentStreak = streaksService.calculateCurrentStreak(dates, habit.frequency);
  const longestStreak = streaksService.calculateLongestStreak(dates, habit.frequency);
  const completionRate = streaksService.calculateCompletionRate(dates, habit.frequency, habit.createdAt);

  res.json({
    habitId: req.params.id,
    currentStreak,
    longestStreak,
    completionRate
  });
});

// GET /api/stats/weekly - weekly stats for all habits
router.get('/api/stats/weekly', (req, res) => {
  const habits = store.getAllHabits();
  const allCheckins = store.getAllCheckins();
  const weekly = statsService.getWeeklyStats(habits, allCheckins);
  res.json(weekly);
});

// GET /api/stats/monthly - monthly stats for all habits
router.get('/api/stats/monthly', (req, res) => {
  const habits = store.getAllHabits();
  const allCheckins = store.getAllCheckins();
  const monthly = statsService.getMonthlyStats(habits, allCheckins);
  res.json(monthly);
});

// GET /api/stats/heatmap/:habitId - weekly heatmap data for a habit
router.get('/api/stats/heatmap/:habitId', (req, res) => {
  const habit = store.getHabit(req.params.habitId);
  if (!habit) {
    return res.status(404).json({ error: 'Habit not found' });
  }
  const checkins = store.getCheckinsForHabit(req.params.habitId);
  const heatmap = statsService.getHeatmapData(checkins, 7);
  res.json(heatmap);
});

module.exports = router;
