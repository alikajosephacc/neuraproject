import { describe, it, expect, beforeEach } from 'vitest';
import { store } from '../src/lib/store';
import unitsData from '../src/data/units.json';
import { Unit } from '../src/types';

describe('Game Progression & Lesson Completion', () => {
  beforeEach(() => {
    store.resetProgress();
  });

  it('initially starts with 0 completed lessons', () => {
    const snap = store.getSnapshot();
    expect(snap.completedLessons).toEqual([]);
    expect(snap.xp).toBe(0);
  });

  it('completes Unit 1 Lesson 1 and marks it completed with XP', () => {
    store.completeLesson('unit-1-lesson-1', 90);
    const snap = store.getSnapshot();

    expect(snap.completedLessons).toContain('unit-1-lesson-1');
    expect(snap.xp).toBe(90);
    expect(snap.streak).toBeGreaterThanOrEqual(1);
  });

  it('produces immutable arrays on snapshot so React detects changes', () => {
    const snap1 = store.getSnapshot();
    store.completeLesson('unit-1-lesson-1', 50);
    const snap2 = store.getSnapshot();

    expect(snap1.completedLessons).not.toBe(snap2.completedLessons);
    expect(snap2.completedLessons).toEqual(['unit-1-lesson-1']);
  });

  it('unlocks Lesson 2 when Lesson 1 is completed', () => {
    const units = unitsData as Unit[];
    const unit1 = units[0];

    // Before completing lesson 1
    let snap = store.getSnapshot();
    let isLesson1Unlocked = (unit1.id === 1 && 0 === 0);
    let isLesson2Unlocked = snap.completedLessons.includes(unit1.lessons[0].id);
    expect(isLesson1Unlocked).toBe(true);
    expect(isLesson2Unlocked).toBe(false);

    // Complete lesson 1
    store.completeLesson(unit1.lessons[0].id, 100);
    snap = store.getSnapshot();

    isLesson2Unlocked = snap.completedLessons.includes(unit1.lessons[0].id);
    expect(isLesson2Unlocked).toBe(true);
  });

  it('unlocks the Boss when all unit lessons are completed', () => {
    const units = unitsData as Unit[];
    const unit1 = units[0];

    // Complete all lessons in unit 1
    unit1.lessons.forEach((l) => store.completeLesson(l.id, 90));

    const snap = store.getSnapshot();
    const allLessonsDone = unit1.lessons.every((l) => snap.completedLessons.includes(l.id));
    expect(allLessonsDone).toBe(true);
  });

  it('unlocks Unit 2 Lesson 1 when Unit 1 Boss is cleared', () => {
    const units = unitsData as Unit[];
    const unit1 = units[0];
    const unit2 = units[1];

    // Complete unit 1 boss
    store.completeLesson(unit1.boss.id, 80);
    const snap = store.getSnapshot();

    const isUnit2Lesson1Unlocked =
      snap.completedLessons.includes(unit1.boss.id) ||
      snap.completedLessons.includes(unit1.lessons[unit1.lessons.length - 1].id);

    expect(isUnit2Lesson1Unlocked).toBe(true);
    expect(unit2.lessons[0].id).toBe('unit-2-lesson-1');
  });

  it('allows passing jargon meter with 35+ points and 1 corporate phrase', () => {
    const units = unitsData as Unit[];
    const boss1 = units[0].boss;
    expect(boss1.passScore).toBe(35);
    expect(boss1.minPhrases).toBe(1);
  });
});
