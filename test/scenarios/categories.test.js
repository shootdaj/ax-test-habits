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

describe('Category Workflow Scenarios', () => {
  it('TestCategoryWorkflow_CreateAssignFilter', async () => {
    // Step 1: Create a category
    const cat = await makeRequest('POST', '/api/categories', { name: 'Health', emoji: '💚' });
    expect(cat.status).toBe(201);
    expect(cat.body.name).toBe('Health');

    // Step 2: Create habits - one with category, one without
    const h1 = await makeRequest('POST', '/api/habits', {
      name: 'Run',
      categoryId: cat.body.id
    });
    const h2 = await makeRequest('POST', '/api/habits', {
      name: 'Read'
    });
    expect(h1.body.categoryId).toBe(cat.body.id);
    expect(h2.body.categoryId).toBeNull();

    // Step 3: Verify all habits returned
    const all = await makeRequest('GET', '/api/habits');
    expect(all.body).toHaveLength(2);

    // Step 4: Filter by category
    const habitsInCategory = all.body.filter(h => h.categoryId === cat.body.id);
    expect(habitsInCategory).toHaveLength(1);
    expect(habitsInCategory[0].name).toBe('Run');

    // Step 5: Reassign habit to category
    const updated = await makeRequest('PUT', `/api/habits/${h2.body.id}`, {
      categoryId: cat.body.id
    });
    expect(updated.body.categoryId).toBe(cat.body.id);

    // Step 6: Now both are in the category
    const allAgain = await makeRequest('GET', '/api/habits');
    const inCat = allAgain.body.filter(h => h.categoryId === cat.body.id);
    expect(inCat).toHaveLength(2);
  });

  it('TestCategoryWorkflow_DeleteCategoryUnassignsHabits', async () => {
    // Create category and habit
    const cat = await makeRequest('POST', '/api/categories', { name: 'Work' });
    const habit = await makeRequest('POST', '/api/habits', {
      name: 'Code',
      categoryId: cat.body.id
    });
    expect(habit.body.categoryId).toBe(cat.body.id);

    // Delete category
    const delRes = await makeRequest('DELETE', `/api/categories/${cat.body.id}`);
    expect(delRes.status).toBe(204);

    // Habit should be unassigned
    const h = await makeRequest('GET', `/api/habits/${habit.body.id}`);
    expect(h.body.categoryId).toBeNull();

    // Category should be gone
    const cats = await makeRequest('GET', '/api/categories');
    expect(cats.body).toHaveLength(0);
  });

  it('TestCategoryWorkflow_MultipleCategoriesWithAllTab', async () => {
    // Create two categories
    const cat1 = await makeRequest('POST', '/api/categories', { name: 'Health' });
    const cat2 = await makeRequest('POST', '/api/categories', { name: 'Learning' });

    // Create habits in different categories
    await makeRequest('POST', '/api/habits', { name: 'Run', categoryId: cat1.body.id });
    await makeRequest('POST', '/api/habits', { name: 'Yoga', categoryId: cat1.body.id });
    await makeRequest('POST', '/api/habits', { name: 'Read', categoryId: cat2.body.id });
    await makeRequest('POST', '/api/habits', { name: 'No Category' });

    // All tab: 4 habits
    const all = await makeRequest('GET', '/api/habits');
    expect(all.body).toHaveLength(4);

    // Health filter: 2 habits
    const health = all.body.filter(h => h.categoryId === cat1.body.id);
    expect(health).toHaveLength(2);

    // Learning filter: 1 habit
    const learning = all.body.filter(h => h.categoryId === cat2.body.id);
    expect(learning).toHaveLength(1);

    // Uncategorized: 1 habit
    const uncategorized = all.body.filter(h => !h.categoryId);
    expect(uncategorized).toHaveLength(1);
  });

  it('TestCategoryWorkflow_UpdateCategory', async () => {
    const cat = await makeRequest('POST', '/api/categories', { name: 'Fitness' });
    const updated = await makeRequest('PUT', `/api/categories/${cat.body.id}`, {
      name: 'Health & Fitness',
      emoji: '🏋️'
    });
    expect(updated.status).toBe(200);
    expect(updated.body.name).toBe('Health & Fitness');
  });
});
