import { describe, it, expect } from 'vitest';
import {
  normalizeText,
  containsSynonym,
  checkTypedAnswer,
  checkWordBankAnswerAdvanced,
} from '../src/lib/checker';

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

    it('handles punctuation and word suffixes (s, ed, ing)', () => {
      expect(containsSynonym('Later! We can talk later.', 'later')).toBe(true);
      expect(containsSynonym("It's postponed indefinitely.", 'postpone')).toBe(true);
      expect(containsSynonym('They are prioritizing meetings.', 'prioritize')).toBe(true);
    });
  });

  describe('checkTypedAnswer (Multiple Answers & Partial Idea Locking)', () => {
    const ideas = [
      ['later', 'not now', 'another time', 'postpone', 'delay'],
      ['busy', 'no time', 'not a priority', 'low priority'],
    ];
    const ideaLabels = ['rescheduling / postponing', 'lack of bandwidth / busy'];
    const satiricalAlternatives = [
      'shut up in front of everyone',
      'stop talking about this now',
      'avoid this topic forever',
    ];

    it('passes when at least "needed" ideas are matched', () => {
      const result = checkTypedAnswer("I'm too busy to look at this today", ideas, 1, ideaLabels);
      expect(result.passed).toBe(true);
      expect(result.matchedCount).toBe(1);
      expect(result.missedIdeas.length).toBe(1);
    });

    it('detects partial match and locks satisfied ideas', () => {
      // Only matches idea 1 ('delay'), but needed is 2
      const result = checkTypedAnswer('We should delay this meeting', ideas, 2, ideaLabels);
      expect(result.passed).toBe(false);
      expect(result.isPartial).toBe(true);
      expect(result.lockedIdeas).toContain('rescheduling / postponing');
      expect(result.missedIdeas).toContain('lack of bandwidth / busy');
    });

    it('accepts alternative satirical answers directly', () => {
      const result = checkTypedAnswer(
        'shut up in front of everyone',
        ideas,
        2,
        ideaLabels,
        satiricalAlternatives
      );
      expect(result.passed).toBe(true);
      expect(result.isSatiricalBonus).toBe(true);
    });
  });

  describe('checkWordBankAnswerAdvanced (Tile Locking & Multi-Sequence)', () => {
    const acceptedSequences = [
      ['stop', 'talking', 'about', 'this', 'in', 'front', 'of', 'everyone'],
      ['stop', 'talking', 'about', 'this', 'now'],
    ];
    const model = 'Stop talking about this in front of everyone.';
    const satiricalAlternatives = ['shut up in front of everyone'];

    it('accepts exact primary sequence', () => {
      const tiles = ['stop', 'talking', 'about', 'this', 'in', 'front', 'of', 'everyone'];
      const res = checkWordBankAnswerAdvanced(tiles, acceptedSequences, satiricalAlternatives, model);
      expect(res.passed).toBe(true);
      expect(res.isPartial).toBe(false);
      expect(res.lockedIndices.length).toBe(tiles.length);
    });

    it('accepts secondary alternative sequence', () => {
      const tiles = ['stop', 'talking', 'about', 'this', 'now'];
      const res = checkWordBankAnswerAdvanced(tiles, acceptedSequences, satiricalAlternatives, model);
      expect(res.passed).toBe(true);
    });

    it('accepts alternative satirical answer sequence', () => {
      const tiles = ['shut', 'up', 'in', 'front', 'of', 'everyone'];
      const res = checkWordBankAnswerAdvanced(tiles, acceptedSequences, satiricalAlternatives, model);
      expect(res.passed).toBe(true);
    });

    it('locks correct prefix and isolates wrong tiles for correction', () => {
      // First 3 tiles match ('stop talking about'), 4th is wrong ('loudly')
      const tiles = ['stop', 'talking', 'about', 'loudly'];
      const res = checkWordBankAnswerAdvanced(tiles, acceptedSequences, satiricalAlternatives, model);

      expect(res.passed).toBe(false);
      expect(res.isPartial).toBe(true);
      expect(res.lockedIndices).toEqual([0, 1, 2]); // 'stop', 'talking', 'about' locked!
      expect(res.wrongIndices).toEqual([3]); // 'loudly' flagged as wrong!
      expect(res.remainingWordsNeeded).toContain('this');
    });

    it('identifies completely wrong sequence as not partial', () => {
      const tiles = ['loudly', 'angry', 'bonus'];
      const res = checkWordBankAnswerAdvanced(tiles, acceptedSequences, satiricalAlternatives, model);
      expect(res.passed).toBe(false);
      expect(res.isPartial).toBe(false);
      expect(res.lockedIndices.length).toBe(0);
    });
  });
});
