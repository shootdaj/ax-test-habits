const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();

// In-memory data store
const habits = new Map();
const checkins = new Map(); // key: `${habitId}:${date}` (date as YYYY-MM-DD)
const categories = new Map();

// --- Habits ---

function createHabit({ name, frequency = 'daily', color = '#4CAF50', emoji = '🎯', categoryId = null }) {
  const id = uuidv4();
  const habit = {
    id,
    name,
    frequency,
    color,
    emoji,
    categoryId,
    createdAt: new Date().toISOString()
  };
  habits.set(id, habit);
  return { ...habit };
}

function getHabit(id) {
  const habit = habits.get(id);
  return habit ? { ...habit } : null;
}

function getAllHabits() {
  return Array.from(habits.values()).map(h => ({ ...h }));
}

function updateHabit(id, updates) {
  const habit = habits.get(id);
  if (!habit) return null;
  const allowed = ['name', 'frequency', 'color', 'emoji', 'categoryId'];
  for (const key of allowed) {
    if (updates[key] !== undefined) {
      habit[key] = updates[key];
    }
  }
  habits.set(id, habit);
  return { ...habit };
}

function deleteHabit(id) {
  const existed = habits.has(id);
  habits.delete(id);
  // Clean up associated checkins
  for (const key of checkins.keys()) {
    if (key.startsWith(`${id}:`)) {
      checkins.delete(key);
    }
  }
  return existed;
}

// --- Check-ins ---

function addCheckin(habitId, date) {
  const key = `${habitId}:${date}`;
  if (checkins.has(key)) return false; // already checked in
  checkins.set(key, { habitId, date, checkedAt: new Date().toISOString() });
  return true;
}

function removeCheckin(habitId, date) {
  const key = `${habitId}:${date}`;
  return checkins.delete(key);
}

function hasCheckin(habitId, date) {
  return checkins.has(`${habitId}:${date}`);
}

function getCheckinsForHabit(habitId) {
  const result = [];
  for (const [key, value] of checkins.entries()) {
    if (key.startsWith(`${habitId}:`)) {
      result.push({ ...value });
    }
  }
  return result;
}

function getAllCheckins() {
  return Array.from(checkins.values()).map(c => ({ ...c }));
}

// --- Categories ---

function createCategory({ name, color = '#2196F3', emoji = '📁' }) {
  const id = uuidv4();
  const category = { id, name, color, emoji, createdAt: new Date().toISOString() };
  categories.set(id, category);
  return { ...category };
}

function getCategory(id) {
  const cat = categories.get(id);
  return cat ? { ...cat } : null;
}

function getAllCategories() {
  return Array.from(categories.values()).map(c => ({ ...c }));
}

function updateCategory(id, updates) {
  const cat = categories.get(id);
  if (!cat) return null;
  const allowed = ['name', 'color', 'emoji'];
  for (const key of allowed) {
    if (updates[key] !== undefined) {
      cat[key] = updates[key];
    }
  }
  categories.set(id, cat);
  return { ...cat };
}

function deleteCategory(id) {
  const existed = categories.has(id);
  categories.delete(id);
  // Unassign habits from this category
  for (const [, habit] of habits.entries()) {
    if (habit.categoryId === id) {
      habit.categoryId = null;
    }
  }
  return existed;
}

// --- Reset (for testing) ---

function reset() {
  habits.clear();
  checkins.clear();
  categories.clear();
}

module.exports = {
  createHabit,
  getHabit,
  getAllHabits,
  updateHabit,
  deleteHabit,
  addCheckin,
  removeCheckin,
  hasCheckin,
  getCheckinsForHabit,
  getAllCheckins,
  createCategory,
  getCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  reset
};
