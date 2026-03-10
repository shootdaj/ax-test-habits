/**
 * Stats aggregation service.
 * Provides weekly and monthly statistics for habits.
 */

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

function getDateNDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

/**
 * Get weekly stats: for each of the last 7 days, how many habits were completed vs expected.
 */
function getWeeklyStats(habits, allCheckins) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = getDateNDaysAgo(i);
    const dayOfWeek = new Date(date + 'T12:00:00').getDay();

    // Filter habits relevant to this day
    const relevantHabits = habits.filter(h => {
      if (h.frequency === 'daily') return true;
      // Weekly habits: only count on their creation day of week
      return true; // Simplified: weekly habits count every day
    });

    const completed = relevantHabits.filter(h =>
      allCheckins.some(c => c.habitId === h.id && c.date === date)
    ).length;

    days.push({
      date,
      dayOfWeek,
      expected: relevantHabits.length,
      completed,
      rate: relevantHabits.length > 0 ? Math.round((completed / relevantHabits.length) * 100) : 0
    });
  }

  const totalExpected = days.reduce((sum, d) => sum + d.expected, 0);
  const totalCompleted = days.reduce((sum, d) => sum + d.completed, 0);

  return {
    days,
    totalExpected,
    totalCompleted,
    overallRate: totalExpected > 0 ? Math.round((totalCompleted / totalExpected) * 100) : 0
  };
}

/**
 * Get monthly stats: for each of the last 30 days, aggregate completion rates.
 */
function getMonthlyStats(habits, allCheckins) {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const date = getDateNDaysAgo(i);

    const completed = habits.filter(h =>
      allCheckins.some(c => c.habitId === h.id && c.date === date)
    ).length;

    days.push({
      date,
      expected: habits.length,
      completed,
      rate: habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0
    });
  }

  const totalExpected = days.reduce((sum, d) => sum + d.expected, 0);
  const totalCompleted = days.reduce((sum, d) => sum + d.completed, 0);

  // Weekly aggregation (4 weeks)
  const weeks = [];
  for (let w = 0; w < 4; w++) {
    const weekDays = days.slice(w * 7, (w + 1) * 7);
    const weekExpected = weekDays.reduce((sum, d) => sum + d.expected, 0);
    const weekCompleted = weekDays.reduce((sum, d) => sum + d.completed, 0);
    weeks.push({
      week: w + 1,
      expected: weekExpected,
      completed: weekCompleted,
      rate: weekExpected > 0 ? Math.round((weekCompleted / weekExpected) * 100) : 0
    });
  }

  return {
    days,
    weeks,
    totalExpected,
    totalCompleted,
    overallRate: totalExpected > 0 ? Math.round((totalCompleted / totalExpected) * 100) : 0
  };
}

/**
 * Get heatmap data: last N weeks of check-in data.
 */
function getHeatmapData(checkins, weeks = 7) {
  const totalDays = weeks * 7;
  const dateSet = new Set(checkins.map(c => c.date));
  const cells = [];

  for (let i = totalDays - 1; i >= 0; i--) {
    const date = getDateNDaysAgo(i);
    cells.push({
      date,
      done: dateSet.has(date)
    });
  }

  return { weeks, cells };
}

module.exports = {
  getWeeklyStats,
  getMonthlyStats,
  getHeatmapData
};
