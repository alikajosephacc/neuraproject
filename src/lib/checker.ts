/**
 * Answer Checker for Circle Back
 * Handles:
 * - Typed-answer idea matching with synonym sets on word boundaries
 * - Word-bank sequence validation
 */

export interface IdeaCheckResult {
  passed: boolean;
  matchedCount: number;
  needed: number;
  matchedIdeaIndices: number[];
  missedIdeaIndices: number[];
  matchedIdeas: string[];
  missedIdeas: string[];
  normalizedUserAnswer: string;
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

  // Use word boundaries. Supports optional suffixes like 's', 'es', 'ed', 'ing'
  const pattern = new RegExp(`(^|\\s)${escapeRegex(normSynonym)}(?:s|es|ed|ing)?(\\s|$)`, 'i');
  return pattern.test(normText);
}

/**
 * Checks a typed answer against required idea groups.
 *
 * @param userAnswer The raw string typed by the player
 * @param ideas Array of idea groups (each inner array is a list of acceptable synonyms)
 * @param needed Minimum number of idea groups that must match (defaults to ideas.length or 1)
 * @param ideaLabels Optional readable descriptions for each idea group
 */
export function checkTypedAnswer(
  userAnswer: string,
  ideas: string[][] = [],
  needed = 1,
  ideaLabels: string[] = []
): IdeaCheckResult {
  const normAnswer = normalizeText(userAnswer);
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

  return {
    passed,
    matchedCount,
    needed,
    matchedIdeaIndices,
    missedIdeaIndices,
    matchedIdeas,
    missedIdeas,
    normalizedUserAnswer: normAnswer,
  };
}

/**
 * Checks word bank answer.
 * Accepts either exact tile sequence matches or normalized joined sentence matches.
 */
export function checkWordBankAnswer(
  selectedTiles: string[],
  acceptedSequences?: string[][],
  modelAnswer?: string
): boolean {
  if (selectedTiles.length === 0) return false;

  const joinedSelected = normalizeText(selectedTiles.join(' '));

  // If accepted sequences provided, check against each
  if (acceptedSequences && acceptedSequences.length > 0) {
    const matchesAny = acceptedSequences.some((seq) => {
      const joinedSeq = normalizeText(seq.join(' '));
      return joinedSelected === joinedSeq;
    });
    if (matchesAny) return true;
  }

  // Fallback check against normalized model answer if provided
  if (modelAnswer) {
    if (joinedSelected === normalizeText(modelAnswer)) {
      return true;
    }
  }

  return false;
}
