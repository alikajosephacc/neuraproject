/**
 * Jargon Meter for Boss Battles
 *
 * Evaluates player's corporate-speak output against constraints:
 * - +10 points for each distinct jargon phrase found, up to 60 base pts (or more with bonuses)
 * - -15 points for each banned plain word hit
 * - Must be at least 15 words long, otherwise score is capped at 40
 * - Pass threshold typically >= 60 points
 */

import { normalizeText, containsSynonym } from './checker';

export interface MeterResult {
  score: number; // 0 - 100
  passed: boolean;
  passScore: number;
  wordCount: number;
  minWords: number;
  phrasesFound: string[];
  bannedWordsHit: string[];
  minPhrases: number;
  phrasesNeededMet: boolean;
  cappedByLength: boolean;
  breakdown: {
    phraseScore: number;
    penaltyScore: number;
    lengthPenalty: boolean;
  };
}

export const COMMON_BUZZWORDS = [
  'circle back',
  'take this offline',
  'take it offline',
  'more bandwidth',
  'bandwidth',
  'hard stop',
  'parking lot',
  'touch base',
  'double click',
  'unpack',
  'sync up',
  'bio break',
  'boil the ocean',
  'peel the onion',
  'run it up the flagpole',
  'table this',
  'move the needle',
  'low hanging fruit',
  '30000 foot view',
  'net net',
  'wheelhouse',
  'action item',
  'per my last email',
  'friendly reminder',
  'bumping this',
  'as discussed',
  'please advise',
  'any updates',
  'thanks in advance',
  'visibility',
  'correct me if i am wrong',
  'correct me if i\'m wrong',
  'looping in',
  'loop in',
  'happy to discuss live',
  'per our conversation',
  'opportunity for growth',
  'manage up',
  'demonstrate ownership',
  'executive presence',
  'lean in',
  'growth mindset',
  'wear multiple hats',
  'self starter',
  'culture fit',
  'thought leadership',
  'agile pivot',
  'heavy lifting',
  'comfortable with ambiguity',
  'critical path',
  'synergistic',
  'synergy',
  'value add',
  'high leverage',
  'humbled and thrilled',
  'next chapter',
  'agree',
  'open to new opportunities',
  'thought partner',
  'visionary catalyst',
  'unlock synergies',
  'disrupt the paradigm',
  'game changing',
  'supercharge growth',
  'future proof',
  'ecosystem',
  'paradigm shift',
  'north star',
  'deep dive',
  'zero to one',
  'stakeholder',
  'deliverable',
  'optimize',
  'holistic',
  'streamline',
  'core competency'
];

/**
 * Evaluates corporate answer for Boss Battles
 */
export function scoreCorporateText(
  text: string,
  targetPhrases: string[] = [],
  bannedWords: string[] = [],
  minPhrases = 1,
  passScore = 35,
  minWords = 8
): MeterResult {
  const normText = normalizeText(text);

  // Count words
  const words = normText.length > 0 ? normText.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;

  // Combine target phrases with global buzzwords, deduplicating
  const phrasePool = Array.from(
    new Set([...targetPhrases, ...COMMON_BUZZWORDS].map((p) => p.trim().toLowerCase()))
  );

  // Detect distinct jargon phrases found
  const phrasesFound: string[] = [];
  for (const phrase of phrasePool) {
    if (phrase && containsSynonym(normText, phrase)) {
      // Don't add if already represented by a longer matched phrase
      const alreadyCovered = phrasesFound.some((f) => f.includes(phrase) && f !== phrase);
      if (!alreadyCovered) {
        phrasesFound.push(phrase);
      }
    }
  }

  // Detect banned plain words hit
  const bannedWordsHit: string[] = [];
  for (const banned of bannedWords) {
    const cleanBanned = banned.trim().toLowerCase();
    if (cleanBanned && containsSynonym(normText, cleanBanned)) {
      bannedWordsHit.push(cleanBanned);
    }
  }

  // Base scoring calculation:
  // +15 per phrase found, plus base word length points
  let phraseScore = 0;
  if (phrasesFound.length <= 2) {
    phraseScore = phrasesFound.length * 15;
  } else {
    phraseScore = 30 + Math.min(50, (phrasesFound.length - 2) * 12);
  }

  // Length bonus: if word count meets target, add +10 points
  if (wordCount >= minWords) {
    phraseScore += 10;
  }

  // -15 per banned word hit
  const penaltyScore = bannedWordsHit.length * 15;

  let rawScore = Math.max(0, phraseScore - penaltyScore);

  // Length check: minimum words required, otherwise capped at 25
  const cappedByLength = wordCount < minWords;
  if (cappedByLength) {
    rawScore = Math.min(25, rawScore);
  }

  const phrasesNeededMet = phrasesFound.length >= minPhrases;
  const score = Math.min(100, rawScore);

  // Must achieve passScore AND meet minPhrases AND have no disqualified penalties
  const passed = score >= passScore && phrasesNeededMet && bannedWordsHit.length === 0 && !cappedByLength;

  return {
    score,
    passed,
    passScore,
    wordCount,
    minWords,
    phrasesFound,
    bannedWordsHit,
    minPhrases,
    phrasesNeededMet,
    cappedByLength,
    breakdown: {
      phraseScore,
      penaltyScore,
      lengthPenalty: cappedByLength,
    },
  };
}
