import { describe, it, expect, beforeEach } from 'vitest';
const store = require('./index');

beforeEach(() => {
  store.reset();
});

describe('Store - Habits', () => {
  it('TestStore_CreateHabit', () => {
    const habit = store.createHabit({ name: 'Exercise', frequency: 'daily', color: '#FF0000', emoji: '💪' });
    expect(habit.id).toBeDefined();
    expect(habit.name).toBe('Exercise');
    expect(habit.frequency).toBe('daily');
    expect(habit.color).toBe('#FF0000');
    expect(habit.emoji).toBe('💪');
    expect(habit.createdAt).toBeDefined();
  });

  it('TestStore_CreateHabit_Defaults', () => {
    const habit = store.createHabit({ name: 'Read' });
    expect(habit.frequency).toBe('daily');
    expect(habit.color).toBe('#4CAF50');
    expect(habit.emoji).toBe('🎯');
    expect(habit.categoryId).toBeNull();
  });

  it('TestStore_GetHabit', () => {
    const created = store.createHabit({ name: 'Meditate' });
    const fetched = store.getHabit(created.id);
    expect(fetched).toEqual(created);
  });

  it('TestStore_GetHabit_NotFound', () => {
    expect(store.getHabit('nonexistent')).toBeNull();
  });

  it('TestStore_GetHabit_ReturnsCopy', () => {
    const created = store.createHabit({ name: 'Test' });
    const fetched = store.getHabit(created.id);
    fetched.name = 'Modified';
    const refetched = store.getHabit(created.id);
    expect(refetched.name).toBe('Test');
  });

  it('TestStore_GetAllHabits', () => {
    store.createHabit({ name: 'A' });
    store.createHabit({ name: 'B' });
    const all = store.getAllHabits();
    expect(all).toHaveLength(2);
    expect(all.map(h => h.name).sort()).toEqual(['A', 'B']);
  });

  it('TestStore_UpdateHabit', () => {
    const habit = store.createHabit({ name: 'Old Name' });
    const updated = store.updateHabit(habit.id, { name: 'New Name', color: '#000' });
    expect(updated.name).toBe('New Name');
    expect(updated.color).toBe('#000');
    expect(updated.frequency).toBe('daily'); // unchanged
  });

  it('TestStore_UpdateHabit_NotFound', () => {
    expect(store.updateHabit('nonexistent', { name: 'X' })).toBeNull();
  });

  it('TestStore_DeleteHabit', () => {
    const habit = store.createHabit({ name: 'ToDelete' });
    expect(store.deleteHabit(habit.id)).toBe(true);
    expect(store.getHabit(habit.id)).toBeNull();
    expect(store.getAllHabits()).toHaveLength(0);
  });

  it('TestStore_DeleteHabit_CleansUpCheckins', () => {
    const habit = store.createHabit({ name: 'WithCheckins' });
    store.addCheckin(habit.id, '2026-03-01');
    store.addCheckin(habit.id, '2026-03-02');
    store.deleteHabit(habit.id);
    expect(store.getCheckinsForHabit(habit.id)).toHaveLength(0);
  });

  it('TestStore_DeleteHabit_NotFound', () => {
    expect(store.deleteHabit('nonexistent')).toBe(false);
  });
});

describe('Store - Checkins', () => {
  it('TestStore_AddCheckin', () => {
    const habit = store.createHabit({ name: 'Test' });
    expect(store.addCheckin(habit.id, '2026-03-10')).toBe(true);
    expect(store.hasCheckin(habit.id, '2026-03-10')).toBe(true);
  });

  it('TestStore_AddCheckin_Duplicate', () => {
    const habit = store.createHabit({ name: 'Test' });
    store.addCheckin(habit.id, '2026-03-10');
    expect(store.addCheckin(habit.id, '2026-03-10')).toBe(false); // already exists
  });

  it('TestStore_RemoveCheckin', () => {
    const habit = store.createHabit({ name: 'Test' });
    store.addCheckin(habit.id, '2026-03-10');
    expect(store.removeCheckin(habit.id, '2026-03-10')).toBe(true);
    expect(store.hasCheckin(habit.id, '2026-03-10')).toBe(false);
  });

  it('TestStore_RemoveCheckin_NotFound', () => {
    expect(store.removeCheckin('fake', '2026-03-10')).toBe(false);
  });

  it('TestStore_GetCheckinsForHabit', () => {
    const habit = store.createHabit({ name: 'Test' });
    store.addCheckin(habit.id, '2026-03-10');
    store.addCheckin(habit.id, '2026-03-11');
    const checkins = store.getCheckinsForHabit(habit.id);
    expect(checkins).toHaveLength(2);
    expect(checkins[0].date).toBeDefined();
  });
});

describe('Store - Categories', () => {
  it('TestStore_CreateCategory', () => {
    const cat = store.createCategory({ name: 'Health' });
    expect(cat.id).toBeDefined();
    expect(cat.name).toBe('Health');
  });

  it('TestStore_GetAllCategories', () => {
    store.createCategory({ name: 'A' });
    store.createCategory({ name: 'B' });
    expect(store.getAllCategories()).toHaveLength(2);
  });

  it('TestStore_UpdateCategory', () => {
    const cat = store.createCategory({ name: 'Old' });
    const updated = store.updateCategory(cat.id, { name: 'New' });
    expect(updated.name).toBe('New');
  });

  it('TestStore_DeleteCategory_UnassignsHabits', () => {
    const cat = store.createCategory({ name: 'Temp' });
    const habit = store.createHabit({ name: 'H', categoryId: cat.id });
    store.deleteCategory(cat.id);
    const h = store.getHabit(habit.id);
    expect(h.categoryId).toBeNull();
  });
});
