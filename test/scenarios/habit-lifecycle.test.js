import { describe, it, expect, beforeEach } from 'vitest';
const http = require('http');
const app = require('../../src/app');
const store = require('../../src/store');

function makeRequest(method, path, body) {
  return new Promise((resolve) => {
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

      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  });
}

beforeEach(() => {
  store.reset();
});

describe('Full Habit Lifecycle Scenario', () => {
  it('TestFullHabitLifecycle_CreateCheckInAndStreak', async () => {
    // Step 1: Create a habit
    const createRes = await makeRequest('POST', '/api/habits', {
      name: 'Morning Run',
      frequency: 'daily',
      color: '#FF5722',
      emoji: '🏃'
    });
    expect(createRes.status).toBe(201);
    const habitId = createRes.body.id;

    // Step 2: Check in today
    const today = new Date().toISOString().split('T')[0];
    const checkinRes = await makeRequest('POST', '/api/checkins', {
      habitId,
      date: today
    });
    expect(checkinRes.status).toBe(200);
    expect(checkinRes.body.checkedIn).toBe(true);

    // Step 3: Check streak
    const streakRes = await makeRequest('GET', `/api/habits/${habitId}/streaks`);
    expect(streakRes.status).toBe(200);
    expect(streakRes.body.currentStreak).toBeGreaterThanOrEqual(1);
    expect(streakRes.body.completionRate).toBeGreaterThan(0);

    // Step 4: Uncheck today (toggle)
    const uncheckRes = await makeRequest('POST', '/api/checkins', {
      habitId,
      date: today
    });
    expect(uncheckRes.status).toBe(200);
    expect(uncheckRes.body.checkedIn).toBe(false);

    // Step 5: Verify streak is now 0
    const streakRes2 = await makeRequest('GET', `/api/habits/${habitId}/streaks`);
    expect(streakRes2.body.currentStreak).toBe(0);

    // Step 6: Edit habit
    const editRes = await makeRequest('PUT', `/api/habits/${habitId}`, {
      name: 'Evening Run',
      emoji: '🌙'
    });
    expect(editRes.status).toBe(200);
    expect(editRes.body.name).toBe('Evening Run');

    // Step 7: Delete habit
    const deleteRes = await makeRequest('DELETE', `/api/habits/${habitId}`);
    expect(deleteRes.status).toBe(204);

    // Step 8: Verify it's gone
    const getRes = await makeRequest('GET', `/api/habits/${habitId}`);
    expect(getRes.status).toBe(404);
  });

  it('TestMultipleHabits_WeeklyStats', async () => {
    // Create two habits
    const h1 = await makeRequest('POST', '/api/habits', { name: 'Meditate' });
    const h2 = await makeRequest('POST', '/api/habits', { name: 'Read' });

    const today = new Date().toISOString().split('T')[0];

    // Check in both today
    await makeRequest('POST', '/api/checkins', { habitId: h1.body.id, date: today });
    await makeRequest('POST', '/api/checkins', { habitId: h2.body.id, date: today });

    // Get weekly stats
    const statsRes = await makeRequest('GET', '/api/stats/weekly');
    expect(statsRes.status).toBe(200);
    expect(statsRes.body.days).toHaveLength(7);
    // Today should have 2 completed
    const todayStats = statsRes.body.days.find(d => d.date === today);
    expect(todayStats.completed).toBe(2);
  });
});
