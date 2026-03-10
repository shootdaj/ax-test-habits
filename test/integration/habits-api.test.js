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

beforeEach(() => {
  store.reset();
});

describe('Habits API Integration', () => {
  it('TestHabitsAPI_CreateHabit', async () => {
    const res = await makeRequest('POST', '/api/habits', {
      name: 'Exercise',
      frequency: 'daily',
      color: '#FF0000',
      emoji: '💪'
    });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Exercise');
    expect(res.body.id).toBeDefined();
  });

  it('TestHabitsAPI_CreateHabit_MissingName', async () => {
    const res = await makeRequest('POST', '/api/habits', { frequency: 'daily' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('TestHabitsAPI_CreateHabit_InvalidFrequency', async () => {
    const res = await makeRequest('POST', '/api/habits', { name: 'Test', frequency: 'monthly' });
    expect(res.status).toBe(400);
  });

  it('TestHabitsAPI_GetAllHabits', async () => {
    await makeRequest('POST', '/api/habits', { name: 'A' });
    await makeRequest('POST', '/api/habits', { name: 'B' });
    const res = await makeRequest('GET', '/api/habits');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('TestHabitsAPI_GetHabitById', async () => {
    const created = await makeRequest('POST', '/api/habits', { name: 'Test' });
    const res = await makeRequest('GET', `/api/habits/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Test');
  });

  it('TestHabitsAPI_GetHabitById_NotFound', async () => {
    const res = await makeRequest('GET', '/api/habits/nonexistent');
    expect(res.status).toBe(404);
  });

  it('TestHabitsAPI_UpdateHabit', async () => {
    const created = await makeRequest('POST', '/api/habits', { name: 'Old' });
    const res = await makeRequest('PUT', `/api/habits/${created.body.id}`, { name: 'New' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('New');
  });

  it('TestHabitsAPI_DeleteHabit', async () => {
    const created = await makeRequest('POST', '/api/habits', { name: 'ToDelete' });
    const res = await makeRequest('DELETE', `/api/habits/${created.body.id}`);
    expect(res.status).toBe(204);
    const check = await makeRequest('GET', `/api/habits/${created.body.id}`);
    expect(check.status).toBe(404);
  });

  it('TestHabitsAPI_HealthCheck', async () => {
    const res = await makeRequest('GET', '/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('TestHabitsAPI_CheckinToggle', async () => {
    const habit = await makeRequest('POST', '/api/habits', { name: 'Test' });
    const today = new Date().toISOString().split('T')[0];

    // Check in
    const checkin = await makeRequest('POST', '/api/checkins', {
      habitId: habit.body.id,
      date: today
    });
    expect(checkin.status).toBe(200);
    expect(checkin.body.checkedIn).toBe(true);

    // Toggle off
    const uncheckin = await makeRequest('POST', '/api/checkins', {
      habitId: habit.body.id,
      date: today
    });
    expect(uncheckin.status).toBe(200);
    expect(uncheckin.body.checkedIn).toBe(false);
  });

  it('TestHabitsAPI_Checkin_InvalidDate', async () => {
    const habit = await makeRequest('POST', '/api/habits', { name: 'Test' });
    const res = await makeRequest('POST', '/api/checkins', {
      habitId: habit.body.id,
      date: 'not-a-date'
    });
    expect(res.status).toBe(400);
  });

  it('TestHabitsAPI_StreaksEndpoint', async () => {
    const habit = await makeRequest('POST', '/api/habits', { name: 'Test' });
    const today = new Date().toISOString().split('T')[0];
    await makeRequest('POST', '/api/checkins', { habitId: habit.body.id, date: today });

    const res = await makeRequest('GET', `/api/habits/${habit.body.id}/streaks`);
    expect(res.status).toBe(200);
    expect(res.body.currentStreak).toBeGreaterThanOrEqual(1);
    expect(res.body.longestStreak).toBeGreaterThanOrEqual(1);
    expect(res.body.completionRate).toBeGreaterThan(0);
  });

  it('TestHabitsAPI_WeeklyStats', async () => {
    const res = await makeRequest('GET', '/api/stats/weekly');
    expect(res.status).toBe(200);
    expect(res.body.days).toHaveLength(7);
  });

  it('TestHabitsAPI_MonthlyStats', async () => {
    const res = await makeRequest('GET', '/api/stats/monthly');
    expect(res.status).toBe(200);
    expect(res.body.days).toHaveLength(30);
  });

  it('TestHabitsAPI_Categories', async () => {
    const cat = await makeRequest('POST', '/api/categories', { name: 'Health' });
    expect(cat.status).toBe(201);

    const all = await makeRequest('GET', '/api/categories');
    expect(all.body).toHaveLength(1);

    const updated = await makeRequest('PUT', `/api/categories/${cat.body.id}`, { name: 'Wellness' });
    expect(updated.body.name).toBe('Wellness');

    const deleted = await makeRequest('DELETE', `/api/categories/${cat.body.id}`);
    expect(deleted.status).toBe(204);
  });
});
