/**
 * Answer Checker for Circle Back
 * Handles:
 * - Typed-answer idea matching with synonym sets on word boundaries
 * - Multiple acceptable plain and satirical answers
 * - Partial matching with tile / idea locking for incremental correction
 */

export interface IdeaCheckResult {
  passed: boolean;
  isPartial: boolean;
  matchedCount: number;
  needed: number;
  matchedIdeaIndices: number[];
  missedIdeaIndices: number[];
  matchedIdeas: string[];
  missedIdeas: string[];
  lockedIdeas: string[];
  normalizedUserAnswer: string;
  isSatiricalBonus?: boolean;
}

export interface WordBankCheckResult {
  passed: boolean;
  isPartial: boolean;
  lockedIndices: number[]; // Indices in selectedTiles that are correct prefix & should be locked
  wrongIndices: number[]; // Indices in selectedTiles that are incorrect
  longestPrefixLength: number;
  matchedTargetSequence: string[];
  remainingWordsNeeded: string[];
  matchedSentence?: string;
}

/**
 * Normalizes text:
 * - Lowercases
 * - Strips punctuation (keeps letters, numbers, and single spaces)
 * - Trims extra whitespace
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Escapes regex special characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Checks if a synonym appears in the normalized text on word boundaries.
 * Supports optional plural and tense endings (s, es, ed, ing).
 */
export function containsSynonym(text: string, synonym: string): boolean {
  const normText = normalizeText(text);
  const normSynonym = normalizeText(synonym);
  if (!normSynonym) return false;

  const stem = normSynonym.endsWith('e') ? normSynonym.slice(0, -1) : normSynonym;
  const escapedSynonym = escapeRegex(normSynonym);
  const escapedStem = escapeRegex(stem);

  // Use word boundaries. Supports optional suffixes like 's', 'es', 'ed', 'd', 'ing'
  // and dropped trailing 'e' (e.g. postpone -> postponed, prioritize -> prioritizing)
  const pattern = new RegExp(
    `(^|\\s)(?:${escapedSynonym}(?:s|es|ed|d|ing)?|${escapedStem}(?:ing|ed|es|s))(\\s|$)`,
    'i'
  );
  return pattern.test(normText);
}

/**
 * Checks a typed answer against required idea groups and multiple alternative answers.
 *
 * @param userAnswer The raw string typed by the player
 * @param ideas Array of idea groups (each inner array is a list of acceptable synonyms)
 * @param needed Minimum number of idea groups that must match
 * @param ideaLabels Optional readable descriptions for each idea group
 * @param acceptedAlternatives Optional list of full alternative satirical or plain phrases
 */
export function checkTypedAnswer(
  userAnswer: string,
  ideas: string[][] = [],
  needed = 1,
  ideaLabels: string[] = [],
  acceptedAlternatives: string[] = []
): IdeaCheckResult {
  const normAnswer = normalizeText(userAnswer);

  // 1. Direct alternative match check (allows full satirical expressions)
  if (acceptedAlternatives && acceptedAlternatives.length > 0) {
    const matchesAlternative = acceptedAlternatives.some((alt) => {
      const normAlt = normalizeText(alt);
      return normAnswer.includes(normAlt) || normAlt.includes(normAnswer);
    });

    if (matchesAlternative && normAnswer.split(/\s+/).length >= 2) {
      return {
        passed: true,
        isPartial: false,
        matchedCount: needed,
        needed,
        matchedIdeaIndices: ideas.map((_, i) => i),
        missedIdeaIndices: [],
        matchedIdeas: ideaLabels.length > 0 ? ideaLabels : ['Satirical Accuracy'],
        missedIdeas: [],
        lockedIdeas: ideaLabels,
        normalizedUserAnswer: normAnswer,
        isSatiricalBonus: true,
      };
    }
  }

  // 2. Idea Matcher evaluation
  const matchedIdeaIndices: number[] = [];
  const missedIdeaIndices: number[] = [];
  const matchedIdeas: string[] = [];
  const missedIdeas: string[] = [];

  ideas.forEach((ideaGroup, idx) => {
    const label = ideaLabels[idx] || (ideaGroup[0] ?? `Idea #${idx + 1}`);
    const hasMatch = ideaGroup.some((synonym) => containsSynonym(normAnswer, synonym));

    if (hasMatch) {
      matchedIdeaIndices.push(idx);
      matchedIdeas.push(label);
    } else {
      missedIdeaIndices.push(idx);
      missedIdeas.push(label);
    }
  });

  const matchedCount = matchedIdeaIndices.length;
  const passed = matchedCount >= needed;
  const isPartial = matchedCount > 0 && !passed;

  return {
    passed,
    isPartial,
    matchedCount,
    needed,
    matchedIdeaIndices,
    missedIdeaIndices,
    matchedIdeas,
    missedIdeas,
    lockedIdeas: matchedIdeas,
    normalizedUserAnswer: normAnswer,
  };
}

/**
 * Advanced Word Bank Answer Evaluation.
 * Evaluates multiple valid sequences and finds longest matching prefix to lock correct tiles.
 */
export function checkWordBankAnswerAdvanced(
  selectedTiles: string[],
  acceptedSequences: string[][] = [],
  acceptedAlternatives: string[] = [],
  modelAnswer = ''
): WordBankCheckResult {
  if (selectedTiles.length === 0) {
    return {
      passed: false,
      isPartial: false,
      lockedIndices: [],
      wrongIndices: [],
      longestPrefixLength: 0,
      matchedTargetSequence: [],
      remainingWordsNeeded: [],
    };
  }

  const normSelected = selectedTiles.map((t) => normalizeText(t));
  const joinedSelected = normSelected.join(' ');

  // Compile all valid sequences:
  // 1) explicitly defined sequences
  // 2) sequences generated from modelAnswer
  // 3) sequences generated from acceptedAlternatives
  const candidateSequences: string[][] = [...acceptedSequences];

  if (modelAnswer) {
    const modelWords = normalizeText(modelAnswer).split(/\s+/).filter(Boolean);
    if (!candidateSequences.some((s) => s.join(' ') === modelWords.join(' '))) {
      candidateSequences.push(modelWords);
    }
  }

  if (acceptedAlternatives && acceptedAlternatives.length > 0) {
    for (const alt of acceptedAlternatives) {
      const altWords = normalizeText(alt).split(/\s+/).filter(Boolean);
      if (!candidateSequences.some((s) => s.join(' ') === altWords.join(' '))) {
        candidateSequences.push(altWords);
      }
    }
  }

  // 1. Check for exact full match against any candidate sequence
  for (const seq of candidateSequences) {
    const normSeq = seq.map((w) => normalizeText(w));
    if (normSeq.join(' ') === joinedSelected) {
      return {
        passed: true,
        isPartial: false,
        lockedIndices: selectedTiles.map((_, i) => i),
        wrongIndices: [],
        longestPrefixLength: selectedTiles.length,
        matchedTargetSequence: seq,
        remainingWordsNeeded: [],
        matchedSentence: seq.join(' '),
      };
    }
  }

  // 2. Partial Prefix Matching & Locking:
  // Find candidate sequence that shares the longest matching prefix with selectedTiles
  let bestPrefixLength = 0;
  let bestTargetSeq: string[] = candidateSequences[0] || [];

  for (const seq of candidateSequences) {
    const normSeq = seq.map((w) => normalizeText(w));
    let matchLen = 0;
    while (
      matchLen < normSelected.length &&
      matchLen < normSeq.length &&
      normSelected[matchLen] === normSeq[matchLen]
    ) {
      matchLen++;
    }

    if (matchLen > bestPrefixLength) {
      bestPrefixLength = matchLen;
      bestTargetSeq = seq;
    }
  }

  // Identify locked vs wrong indices
  const lockedIndices: number[] = [];
  for (let i = 0; i < bestPrefixLength; i++) {
    lockedIndices.push(i);
  }

  const wrongIndices: number[] = [];
  for (let i = bestPrefixLength; i < selectedTiles.length; i++) {
    wrongIndices.push(i);
  }

  const remainingWordsNeeded = bestTargetSeq.slice(bestPrefixLength);
  const isPartial = bestPrefixLength > 0 && bestPrefixLength < bestTargetSeq.length;

  return {
    passed: false,
    isPartial,
    lockedIndices,
    wrongIndices,
    longestPrefixLength: bestPrefixLength,
    matchedTargetSequence: bestTargetSeq,
    remainingWordsNeeded,
  };
}

/**
 * Simple compatibility wrapper for checkWordBankAnswer
 */
export function checkWordBankAnswer(
  selectedTiles: string[],
  acceptedSequences?: string[][],
  modelAnswer?: string
): boolean {
  const res = checkWordBankAnswerAdvanced(selectedTiles, acceptedSequences, [], modelAnswer);
  return res.passed;
}
