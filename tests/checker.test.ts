import { describe, it, expect } from 'vitest';
import { normalizeText, containsSynonym, checkTypedAnswer, checkWordBankAnswer } from '../src/lib/checker';

describe('Answer Checker (Idea Matcher & Word Bank)', () => {
  describe('normalizeText', () => {
    it('lowercases and strips punctuation', () => {
      expect(normalizeText("Let's TAKE this offline, please!!")).toBe("let's take this offline please");
      expect(normalizeText('  Multiple   Spaces   ')).toBe('multiple spaces');
    });
  });

  describe('containsSynonym', () => {
    it('matches exact single words on word boundaries', () => {
      expect(containsSynonym('we are too busy right now', 'busy')).toBe(true);
      expect(containsSynonym('business is booming', 'busy')).toBe(false); // boundary check
    });

    it('matches multi-word synonyms', () => {
      expect(containsSynonym('i will do this another time', 'another time')).toBe(true);
      expect(containsSynonym('we have no time today', 'no time')).toBe(true);
    });

    it('handles punctuation around words', () => {
      expect(containsSynonym('Later! We can talk later.', 'later')).toBe(true);
      expect(containsSynonym("It's postponed indefinitely.", 'postponed')).toBe(true);
    });
  });

  describe('checkTypedAnswer (Section 7)', () => {
    const ideas = [
      ['later', 'not now', 'another time', 'postpone', 'delay'],
      ['busy', 'no time', 'not a priority', 'low priority'],
    ];

    it('passes when at least "needed" ideas are matched', () => {
      const result = checkTypedAnswer("I'm too busy to look at this today", ideas, 1);
      expect(result.passed).toBe(true);
      expect(result.matchedCount).toBe(1);
      expect(result.missedIdeas.length).toBe(1);
    });

    it('passes when both ideas are matched', () => {
      const result = checkTypedAnswer("We have no time right now, let's do this another time", ideas, 1);
      expect(result.passed).toBe(true);
      expect(result.matchedCount).toBe(2);
    });

    it('fails when no ideas match', () => {
      const result = checkTypedAnswer('The sky is blue today', ideas, 1);
      expect(result.passed).toBe(false);
      expect(result.matchedCount).toBe(0);
      expect(result.missedIdeas.length).toBe(2);
    });

    it('enforces needed threshold of 2 when specified', () => {
      const result1 = checkTypedAnswer("I'm busy", ideas, 2);
      expect(result1.passed).toBe(false);

      const result2 = checkTypedAnswer("I'm busy, so postpone it for another time", ideas, 2);
      expect(result2.passed).toBe(true);
    });
  });

  describe('checkWordBankAnswer', () => {
    const accepted = [['stop', 'talking', 'about', 'this', 'in', 'front', 'of', 'everyone']];
    const model = 'Stop talking about this in front of everyone.';

    it('accepts correct tile sequence', () => {
      const tiles = ['stop', 'talking', 'about', 'this', 'in', 'front', 'of', 'everyone'];
      expect(checkWordBankAnswer(tiles, accepted, model)).toBe(true);
    });

    it('rejects scrambled or wrong tiles', () => {
      const tiles = ['everyone', 'stop', 'talking'];
      expect(checkWordBankAnswer(tiles, accepted, model)).toBe(false);
    });

    it('rejects empty selections', () => {
      expect(checkWordBankAnswer([], accepted, model)).toBe(false);
    });
  });
});
