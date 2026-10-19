import { describe, it, expect } from 'vitest';
import { scoreCorporateText } from '../src/lib/meter';

describe('Jargon Meter (Section 8 Boss Battles)', () => {
  const targetPhrases = ['hard stop', 'bandwidth', 'circle back', 'take this offline', 'touch base'];
  const bannedWords = ['no', "can't", 'cant', 'refuse', 'busy'];

  it('caps score at 40 when word count is below 15 words', () => {
    // 6 words with 2 phrases
    const shortText = 'Hard stop. Need more bandwidth today.';
    const result = scoreCorporateText(shortText, targetPhrases, bannedWords, 2, 60, 15);

    expect(result.cappedByLength).toBe(true);
    expect(result.score).toBeLessThanOrEqual(40);
    expect(result.passed).toBe(false);
  });

  it('applies -15 penalty for each banned plain word', () => {
    // 16 words, 2 phrases, but hits banned word 'no' and 'busy'
    const textWithBanned = 'I have a hard stop and low bandwidth because I am so busy, so no we cannot talk.';
    const result = scoreCorporateText(textWithBanned, targetPhrases, bannedWords, 2, 60, 15);

    expect(result.bannedWordsHit).toContain('no');
    expect(result.bannedWordsHit).toContain('busy');
    expect(result.breakdown.penaltyScore).toBe(30);
    expect(result.passed).toBe(false);
  });

  it('scores +10 for distinct jargon phrases found', () => {
    // 20 words, 4 distinct phrases, no banned words
    const greatCorporateText =
      'I have a hard stop today, so let us take this offline to preserve bandwidth and circle back next week.';
    const result = scoreCorporateText(greatCorporateText, targetPhrases, bannedWords, 3, 60, 15);

    expect(result.phrasesFound).toContain('hard stop');
    expect(result.phrasesFound).toContain('take this offline');
    expect(result.phrasesFound).toContain('bandwidth');
    expect(result.phrasesFound).toContain('circle back');
    expect(result.bannedWordsHit.length).toBe(0);
    expect(result.cappedByLength).toBe(false);
    expect(result.score).toBeGreaterThanOrEqual(40);
  });

  it('passes boss battle when meeting 60+ points and minPhrases with 0 banned words', () => {
    // 22 words with 6 corporate phrases, meets 60+ points and minPhrases: 3
    const winningCorporateSpeech =
      'Due to a hard stop and limited bandwidth, let us take this offline, touch base later, and circle back to review our action items.';
    const result = scoreCorporateText(winningCorporateSpeech, targetPhrases, bannedWords, 3, 60, 15);

    expect(result.phrasesFound.length).toBeGreaterThanOrEqual(3);
    expect(result.score).toBeGreaterThanOrEqual(60);
    expect(result.passed).toBe(true);
  });

  it('fails if minPhrases is not satisfied even with long text', () => {
    // 20 words, only 1 phrase
    const weakText =
      'I am currently experiencing very limited bandwidth during this entire quarter so please send me an update via an email document.';
    const result = scoreCorporateText(weakText, targetPhrases, bannedWords, 3, 60, 15);

    expect(result.phrasesNeededMet).toBe(false);
    expect(result.passed).toBe(false);
  });
});
