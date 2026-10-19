export type ExerciseType = 'translate' | 'match' | 'context' | 'boss';

export interface IdeaGroup {
  name: string;
  synonyms: string[];
}

export type TranslateExercise = {
  id: string;
  type: 'translate';
  mode: 'wordbank' | 'typed';
  channel: 'email' | 'slack' | 'meeting';
  sender: string;
  senderRole?: string;
  text: string;
  model: string;
  snark: string;
  // wordbank
  tiles?: string[];
  accepted?: string[][];
  // typed
  ideas?: string[][]; // each inner array is synonyms for one required idea
  ideaLabels?: string[]; // friendly label for feedback display
  needed?: number; // how many ideas must match
};

export type MatchExercise = {
  id: string;
  type: 'match';
  pairs: [string, string][]; // [corporate phrase, plain english]
};

export type ContextExercise = {
  id: string;
  type: 'context';
  channel: 'email' | 'slack' | 'meeting';
  sender: string;
  senderRole: string;
  subject?: string;
  email: string;
  options: string[];
  answer: number; // 0-based index of correct option
  why: string;
};

export type BossExercise = {
  id: string;
  type: 'boss';
  unitId: number;
  title: string;
  prompt: string;
  bannedWords: string[];
  minPhrases: number;
  passScore: number;
  hint: string;
};

export type Exercise = TranslateExercise | MatchExercise | ContextExercise | BossExercise;

export interface Lesson {
  id: string;
  unitId: number;
  lessonIndex: number;
  title: string;
  description: string;
  exercises: Exercise[];
}

export interface Unit {
  id: number;
  title: string;
  theme: string;
  description: string;
  color: string;
  iconName: string;
  lessons: Lesson[];
  boss: BossExercise;
}

export interface Progress {
  xp: number;
  morale: number; // 0 - 5
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  completedLessons: string[]; // lesson IDs or unit-boss IDs
  rank: number; // index into rank ladder
  soundEnabled: boolean;
}

export interface RankInfo {
  index: number;
  title: string;
  minXp: number;
  blurb: string;
  badge: string;
  linkedInAnnouncement: string;
}

export type MascotMood = 'thriving' | 'neutral' | 'wilting';
