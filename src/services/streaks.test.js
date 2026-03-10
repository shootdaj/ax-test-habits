import { describe, it, expect } from 'vitest';
const streaks = require('./streaks');

describe('Streaks Service', () => {
  describe('calculateCurrentStreak', () => {
    it('TestStreaks_CurrentStreak_EmptyDates', () => {
      expect(streaks.calculateCurrentStreak([])).toBe(0);
    });

    it('TestStreaks_CurrentStreak_TodayOnly', () => {
      const today = streaks.getTodayDate();
      expect(streaks.calculateCurrentStreak([today])).toBe(1);
    });

    it('TestStreaks_CurrentStreak_ConsecutiveDays', () => {
      const today = streaks.getTodayDate();
      const dates = [];
      for (let i = 2; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
      }
      expect(streaks.calculateCurrentStreak(dates.sort())).toBe(3);
    });

    it('TestStreaks_CurrentStreak_BrokenStreak', () => {
      // Only 3 days ago - no today or yesterday
      const d = new Date();
      d.setDate(d.getDate() - 3);
      const oldDate = d.toISOString().split('T')[0];
      expect(streaks.calculateCurrentStreak([oldDate])).toBe(0);
    });

    it('TestStreaks_CurrentStreak_YesterdayContinues', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yd = yesterday.toISOString().split('T')[0];
      const dayBefore = new Date();
      dayBefore.setDate(dayBefore.getDate() - 2);
      const dbd = dayBefore.toISOString().split('T')[0];
      expect(streaks.calculateCurrentStreak([dbd, yd].sort())).toBe(2);
    });
  });

  describe('calculateLongestStreak', () => {
    it('TestStreaks_LongestStreak_EmptyDates', () => {
      expect(streaks.calculateLongestStreak([])).toBe(0);
    });

    it('TestStreaks_LongestStreak_SingleDay', () => {
      expect(streaks.calculateLongestStreak(['2026-03-01'])).toBe(1);
    });

    it('TestStreaks_LongestStreak_ThreeConsecutive', () => {
      const dates = ['2026-03-01', '2026-03-02', '2026-03-03'];
      expect(streaks.calculateLongestStreak(dates)).toBe(3);
    });

    it('TestStreaks_LongestStreak_WithGap', () => {
      const dates = ['2026-03-01', '2026-03-02', '2026-03-04', '2026-03-05', '2026-03-06'];
      expect(streaks.calculateLongestStreak(dates)).toBe(3); // Mar 4-5-6
    });

    it('TestStreaks_LongestStreak_MultipleStreaks', () => {
      const dates = ['2026-01-01', '2026-01-02', '2026-02-01', '2026-02-02', '2026-02-03', '2026-02-04'];
      expect(streaks.calculateLongestStreak(dates)).toBe(4); // Feb 1-4
    });
  });

  describe('calculateCompletionRate', () => {
    it('TestStreaks_CompletionRate_EmptyDates', () => {
      expect(streaks.calculateCompletionRate([], 'daily', '2026-03-01T00:00:00Z')).toBe(0);
    });

    it('TestStreaks_CompletionRate_AllDays', () => {
      const today = streaks.getTodayDate();
      // If created today and checked in today, rate is 100%
      const rate = streaks.calculateCompletionRate([today], 'daily', today + 'T00:00:00Z');
      expect(rate).toBe(100);
    });
  });

  describe('helper functions', () => {
    it('TestStreaks_GetPreviousDate', () => {
      expect(streaks.getPreviousDate('2026-03-10')).toBe('2026-03-09');
      expect(streaks.getPreviousDate('2026-03-01')).toBe('2026-02-28');
      expect(streaks.getPreviousDate('2026-01-01')).toBe('2025-12-31');
    });

    it('TestStreaks_DaysBetween', () => {
      expect(streaks.daysBetween('2026-03-01', '2026-03-10')).toBe(9);
      expect(streaks.daysBetween('2026-03-10', '2026-03-10')).toBe(0);
    });
  });
});
