import { describe, it, expect } from 'vitest';
const stats = require('./stats');

describe('Stats Service', () => {
  it('TestStats_WeeklyStats_EmptyData', () => {
    const result = stats.getWeeklyStats([], []);
    expect(result.days).toHaveLength(7);
    expect(result.overallRate).toBe(0);
    expect(result.totalExpected).toBe(0);
    expect(result.totalCompleted).toBe(0);
  });

  it('TestStats_WeeklyStats_WithCheckins', () => {
    const today = new Date().toISOString().split('T')[0];
    const habits = [{ id: 'h1', frequency: 'daily' }, { id: 'h2', frequency: 'daily' }];
    const checkins = [
      { habitId: 'h1', date: today },
      { habitId: 'h2', date: today }
    ];
    const result = stats.getWeeklyStats(habits, checkins);
    expect(result.days).toHaveLength(7);
    const todayStats = result.days.find(d => d.date === today);
    expect(todayStats.completed).toBe(2);
    expect(todayStats.expected).toBe(2);
    expect(todayStats.rate).toBe(100);
  });

  it('TestStats_MonthlyStats_Structure', () => {
    const result = stats.getMonthlyStats([], []);
    expect(result.days).toHaveLength(30);
    expect(result.weeks).toHaveLength(4);
    expect(result.overallRate).toBe(0);
  });

  it('TestStats_MonthlyStats_WithData', () => {
    const today = new Date().toISOString().split('T')[0];
    const habits = [{ id: 'h1', frequency: 'daily' }];
    const checkins = [{ habitId: 'h1', date: today }];
    const result = stats.getMonthlyStats(habits, checkins);
    const todayEntry = result.days.find(d => d.date === today);
    expect(todayEntry.completed).toBe(1);
  });

  it('TestStats_HeatmapData_EmptyCheckins', () => {
    const result = stats.getHeatmapData([], 7);
    expect(result.weeks).toBe(7);
    expect(result.cells).toHaveLength(49); // 7 weeks * 7 days
    expect(result.cells.every(c => c.done === false)).toBe(true);
  });

  it('TestStats_HeatmapData_WithCheckins', () => {
    const today = new Date().toISOString().split('T')[0];
    const checkins = [{ habitId: 'h1', date: today }];
    const result = stats.getHeatmapData(checkins, 1);
    expect(result.cells).toHaveLength(7);
    const todayCell = result.cells.find(c => c.date === today);
    expect(todayCell.done).toBe(true);
  });
});
