import { describe, it, expect, beforeEach } from 'vitest';
const http = require('http');
const app = require('../../src/app');
const store = require('../../src/store');

function makeRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      const options = {
        hostname: 'localhost',
        port,
        path,
        method: method.toUpperCase(),
        headers: { 'Content-Type': 'application/json' }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          server.close();
          let parsed;
          try { parsed = JSON.parse(data); } catch { parsed = data; }
          resolve({ status: res.statusCode, body: parsed });
        });
      });

      req.on('error', (err) => {
        server.close();
        reject(err);
      });

      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  });
}

function getDateStr(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

beforeEach(() => {
  store.reset();
});

describe('Check-in and Streak Scenarios', () => {
  it('TestStreakBuilding_ThreeDayStreak', async () => {
    // Create habit
    const habit = await makeRequest('POST', '/api/habits', { name: 'Meditate' });
    const habitId = habit.body.id;

    // Check in for today, yesterday, and day before
    for (let i = 0; i <= 2; i++) {
      const date = getDateStr(i);
      await makeRequest('POST', '/api/checkins', { habitId, date });
    }

    // Verify streak is 3
    const streaks = await makeRequest('GET', `/api/habits/${habitId}/streaks`);
    expect(streaks.body.currentStreak).toBe(3);
    expect(streaks.body.longestStreak).toBeGreaterThanOrEqual(3);
  });

  it('TestStreakBreaking_UncheckinBreaksStreak', async () => {
    const habit = await makeRequest('POST', '/api/habits', { name: 'Read' });
    const habitId = habit.body.id;

    // Check in today
    const today = getDateStr(0);
    await makeRequest('POST', '/api/checkins', { habitId, date: today });

    let streaks = await makeRequest('GET', `/api/habits/${habitId}/streaks`);
    expect(streaks.body.currentStreak).toBe(1);

    // Uncheck today (toggle)
    await makeRequest('POST', '/api/checkins', { habitId, date: today });

    // Streak should be 0 now
    streaks = await makeRequest('GET', `/api/habits/${habitId}/streaks`);
    expect(streaks.body.currentStreak).toBe(0);
  });

  it('TestPastDateCheckin', async () => {
    const habit = await makeRequest('POST', '/api/habits', { name: 'Exercise' });
    const habitId = habit.body.id;

    // Check in for 5 days ago
    const pastDate = getDateStr(5);
    const res = await makeRequest('POST', '/api/checkins', { habitId, date: pastDate });
    expect(res.body.checkedIn).toBe(true);

    // Get checkins for this habit
    const checkins = await makeRequest('GET', `/api/checkins/${habitId}`);
    expect(checkins.body).toHaveLength(1);
    expect(checkins.body[0].date).toBe(pastDate);
  });

  it('TestWeeklyStatsAfterCheckins', async () => {
    const habit = await makeRequest('POST', '/api/habits', { name: 'Run' });
    const habitId = habit.body.id;
    const today = getDateStr(0);

    await makeRequest('POST', '/api/checkins', { habitId, date: today });

    const stats = await makeRequest('GET', '/api/stats/weekly');
    expect(stats.body.totalCompleted).toBeGreaterThan(0);
    const todayStats = stats.body.days.find(d => d.date === today);
    expect(todayStats.completed).toBe(1);
  });

  it('TestMonthlyStatsAfterCheckins', async () => {
    const habit = await makeRequest('POST', '/api/habits', { name: 'Yoga' });
    const today = getDateStr(0);
    await makeRequest('POST', '/api/checkins', { habitId: habit.body.id, date: today });

    const stats = await makeRequest('GET', '/api/stats/monthly');
    expect(stats.body.totalCompleted).toBeGreaterThan(0);
    expect(stats.body.weeks).toHaveLength(4);
  });

  it('TestHeatmapData', async () => {
    const habit = await makeRequest('POST', '/api/habits', { name: 'Code' });
    const today = getDateStr(0);
    await makeRequest('POST', '/api/checkins', { habitId: habit.body.id, date: today });

    const heatmap = await makeRequest('GET', `/api/stats/heatmap/${habit.body.id}`);
    expect(heatmap.body.cells).toBeDefined();
    const todayCell = heatmap.body.cells.find(c => c.date === today);
    expect(todayCell.done).toBe(true);
  });
});
