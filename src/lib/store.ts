import { Progress, MascotMood } from '../types';
import { getRankForXp } from './ranks';
import { sound } from './sound';

const STORAGE_KEY = 'circleback:v1';

export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const DEFAULT_PROGRESS: Progress = {
  xp: 0,
  morale: 5,
  streak: 0,
  lastActiveDate: '',
  completedLessons: [],
  rank: 0,
  soundEnabled: true,
};

type Listener = () => void;

class GameStore {
  private progress: Progress;
  private listeners: Set<Listener> = new Set();
  public newlyPromotedRank: number | null = null;

  constructor() {
    this.progress = this.load();
    this.checkStreakIntegrity();
    sound.enabled = this.progress.soundEnabled;
  }

  private load(): Progress {
    if (typeof window === 'undefined') return { ...DEFAULT_PROGRESS };
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          ...DEFAULT_PROGRESS,
          ...parsed,
        };
      }
    } catch {
      // Fallback
    }
    return { ...DEFAULT_PROGRESS };
  }

  private save() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress));
    } catch (e) {
      console.error('Error saving progress to localStorage', e);
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getSnapshot(): Progress {
    return this.progress;
  }

  /**
   * Checks if consecutive days were missed.
   * If last active date is older than yesterday, streak resets to 0.
   */
  private checkStreakIntegrity() {
    const today = getTodayString();
    const yesterday = getYesterdayString();
    const { lastActiveDate, streak } = this.progress;

    if (streak > 0 && lastActiveDate && lastActiveDate !== today && lastActiveDate !== yesterday) {
      // Missed at least one calendar day!
      this.progress.streak = 0;
      this.save();
    }
  }

  public deductMorale(): number {
    const prev = this.progress.morale;
    const next = Math.max(0, prev - 1);
    this.progress.morale = next;
    this.save();
    return next;
  }

  public restoreMorale(): void {
    this.progress.morale = 5;
    this.save();
  }

  public toggleSound(): boolean {
    this.progress.soundEnabled = !this.progress.soundEnabled;
    sound.enabled = this.progress.soundEnabled;
    this.save();
    return this.progress.soundEnabled;
  }

  public completeLesson(lessonId: string, earnedXp: number): { promotedToRank: number | null } {
    const today = getTodayString();
    const yesterday = getYesterdayString();

    // 1. Update streak
    if (this.progress.lastActiveDate === yesterday) {
      this.progress.streak += 1;
    } else if (this.progress.lastActiveDate !== today) {
      this.progress.streak = 1;
    }
    this.progress.lastActiveDate = today;

    // 2. Mark lesson complete if not already
    if (!this.progress.completedLessons.includes(lessonId)) {
      this.progress.completedLessons.push(lessonId);
    }

    // 3. Add XP and check rank promotion
    const oldRank = getRankForXp(this.progress.xp).index;
    this.progress.xp += earnedXp;
    const newRank = getRankForXp(this.progress.xp).index;

    let promotedToRank: number | null = null;
    if (newRank > oldRank) {
      promotedToRank = newRank;
      this.progress.rank = newRank;
      this.newlyPromotedRank = newRank;
    }

    this.save();
    return { promotedToRank };
  }

  public clearNewlyPromoted() {
    this.newlyPromotedRank = null;
    this.notify();
  }

  public getMascotMood(): MascotMood {
    if (this.progress.morale <= 1) return 'wilting';
    if (this.progress.streak === 0 && this.progress.lastActiveDate !== '' && this.progress.lastActiveDate !== getTodayString()) {
      return 'wilting';
    }
    if (this.progress.streak >= 1 && this.progress.morale >= 4) {
      return 'thriving';
    }
    return 'neutral';
  }

  public resetProgress() {
    this.progress = { ...DEFAULT_PROGRESS };
    this.newlyPromotedRank = null;
    this.save();
  }
}

export const store = new GameStore();
