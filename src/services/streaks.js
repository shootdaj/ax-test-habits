/**
 * Streak calculation service.
 * All dates are YYYY-MM-DD strings to avoid timezone issues.
 * IMPORTANT: We use local date constructors and manual formatting
 * to avoid UTC conversion bugs.
 */

function formatDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function getTodayDate() {
  return formatDate(new Date());
}

function getYesterdayDate() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatDate(d);
}

/**
 * Get the previous date as YYYY-MM-DD string
 */
function getPreviousDate(dateStr) {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() - 1);
  return formatDate(d);
}

/**
 * Get the next date as YYYY-MM-DD string
 */
function getNextDate(dateStr) {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + 1);
  return formatDate(d);
}

/**
 * Calculate current streak for a habit.
 * A streak is the number of consecutive days (from today going backward)
 * where the habit was completed.
 *
 * For daily habits: must have checked in today or yesterday to have an active streak.
 * For weekly habits: must have at least one check-in in the current or previous week.
 */
function calculateCurrentStreak(sortedDates, frequency = 'daily') {
  if (sortedDates.length === 0) return 0;

  const dateSet = new Set(sortedDates);
  const today = getTodayDate();
  const yesterday = getYesterdayDate();

  if (frequency === 'daily') {
    // Start from today or yesterday
    let current = today;
    if (!dateSet.has(today)) {
      current = yesterday;
      if (!dateSet.has(yesterday)) {
        return 0; // No active streak
      }
    }

    let streak = 0;
    while (dateSet.has(current)) {
      streak++;
      current = getPreviousDate(current);
    }
    return streak;
  }

  // Weekly frequency: count consecutive weeks with at least one check-in
  return calculateWeeklyStreak(sortedDates);
}

/**
 * Calculate longest streak ever for a habit.
 */
function calculateLongestStreak(sortedDates, frequency = 'daily') {
  if (sortedDates.length === 0) return 0;

  if (frequency === 'daily') {
    let longest = 0;
    let current = 0;

    // Go through sorted dates
    const sorted = [...sortedDates].sort();
    for (let i = 0; i < sorted.length; i++) {
      if (i === 0) {
        current = 1;
      } else {
        // Check if this date is exactly one day after the previous
        const expectedPrev = getPreviousDate(sorted[i]);
        if (sorted[i - 1] === expectedPrev) {
          current++;
        } else {
          current = 1;
        }
      }
      longest = Math.max(longest, current);
    }
    return longest;
  }

  // Weekly
  return calculateLongestWeeklyStreak(sortedDates);
}

/**
 * Calculate completion rate as a percentage.
 * For daily: (days checked in / total days since creation) * 100
 * For weekly: (weeks with check-in / total weeks since creation) * 100
 */
function calculateCompletionRate(sortedDates, frequency = 'daily', createdAt) {
  if (sortedDates.length === 0) return 0;

  const today = getTodayDate();
  const startDate = createdAt ? createdAt.split('T')[0] : sortedDates[0];

  if (frequency === 'daily') {
    const totalDays = daysBetween(startDate, today) + 1;
    if (totalDays <= 0) return 0;
    const uniqueDates = new Set(sortedDates);
    return Math.round((uniqueDates.size / totalDays) * 100);
  }

  // Weekly
  const totalWeeks = Math.ceil((daysBetween(startDate, today) + 1) / 7);
  if (totalWeeks <= 0) return 0;
  const weekSet = new Set(sortedDates.map(d => getWeekKey(d)));
  return Math.round((weekSet.size / totalWeeks) * 100);
}

// --- Helper functions ---

function daysBetween(dateStr1, dateStr2) {
  const date1 = parseDate(dateStr1);
  const date2 = parseDate(dateStr2);
  return Math.round((date2 - date1) / (1000 * 60 * 60 * 24));
}

function getWeekKey(dateStr) {
  const d = parseDate(dateStr);
  const year = d.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const weekNumber = Math.ceil(((d - startOfYear) / (1000 * 60 * 60 * 24) + startOfYear.getDay() + 1) / 7);
  return `${year}-W${weekNumber}`;
}

function calculateWeeklyStreak(sortedDates) {
  if (sortedDates.length === 0) return 0;
  const weekKeys = [...new Set(sortedDates.map(d => getWeekKey(d)))].sort();
  const currentWeek = getWeekKey(getTodayDate());
  const lastWeekDate = new Date();
  lastWeekDate.setDate(lastWeekDate.getDate() - 7);
  const lastWeek = getWeekKey(formatDate(lastWeekDate));

  const lastCheckedWeek = weekKeys[weekKeys.length - 1];
  if (lastCheckedWeek !== currentWeek && lastCheckedWeek !== lastWeek) {
    return 0;
  }

  let streak = 1;
  for (let i = weekKeys.length - 2; i >= 0; i--) {
    streak++;
  }
  return streak;
}

function calculateLongestWeeklyStreak(sortedDates) {
  if (sortedDates.length === 0) return 0;
  const weekKeys = [...new Set(sortedDates.map(d => getWeekKey(d)))].sort();
  return weekKeys.length;
}

module.exports = {
  calculateCurrentStreak,
  calculateLongestStreak,
  calculateCompletionRate,
  getTodayDate,
  getYesterdayDate,
  getPreviousDate,
  getNextDate,
  daysBetween,
  getWeekKey,
  formatDate,
  parseDate
};
