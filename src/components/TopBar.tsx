import React from 'react';
import { Heart, Flame, Award, Volume2, VolumeX, RotateCcw, Moon, Sun } from 'lucide-react';
import { Progress } from '../types';
import { getRankForXp } from '../lib/ranks';
import { sound } from '../lib/sound';

interface TopBarProps {
  progress: Progress;
  onReset: () => void;
  onToggleSound: () => void;
  onToggleDarkMode: () => void;
  onOpenRankModal?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  progress,
  onReset,
  onToggleSound,
  onToggleDarkMode,
  onOpenRankModal,
}) => {
  const currentRank = getRankForXp(progress.xp);

  const handleReset = () => {
    if (window.confirm('Reset all progress, XP, streak and morale to day 1?')) {
      onReset();
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 shadow-sm transition-colors duration-200">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-xl shadow-sm text-white">
            🪴
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-800 dark:text-slate-100 text-lg tracking-tight">Circle Back</span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                v1.1
              </span>
            </div>
            <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 font-medium">Corporate Speak Language Learning</p>
          </div>
        </div>

        {/* Stats & Meters */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Morale (Replaces Hearts) */}
          <div
            className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 px-2.5 py-1.5 rounded-xl shadow-xs"
            title={`Corporate Morale: ${progress.morale}/5. Mistakes cost 1. Zero triggers a PIP.`}
          >
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Heart
                  key={i}
                  size={16}
                  className={`transition-all duration-200 ${
                    i <= progress.morale
                      ? 'fill-rose-500 text-rose-500 scale-100'
                      : 'text-slate-300 dark:text-slate-700 scale-90'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400 ml-1">{progress.morale}</span>
          </div>

          {/* Days of Uninterrupted Productivity (Streak) */}
          <div
            className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 px-2.5 py-1.5 rounded-xl shadow-xs"
            title="Days of Uninterrupted Productivity (Consecutive active days)"
          >
            <Flame size={18} className="fill-amber-500 text-amber-500 animate-pulse" />
            <div className="flex items-baseline gap-1">
              <span className="font-extrabold text-amber-700 dark:text-amber-400 text-sm">{progress.streak}</span>
              <span className="hidden md:inline text-[11px] font-semibold text-amber-600 dark:text-amber-500">days</span>
            </div>
          </div>

          {/* XP & Job Title Rank */}
          <button
            onClick={onOpenRankModal}
            className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200/90 dark:border-emerald-800 px-3 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer group"
            title="Click to view Job Title Ladder and Promotion status"
          >
            <Award size={18} className="text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <div className="flex items-center gap-1">
                <span className="font-black text-emerald-800 dark:text-emerald-200 text-sm">{progress.xp}</span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">XP</span>
              </div>
              <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <span>{currentRank.badge}</span>
                <span className="hidden sm:inline">{currentRank.title}</span>
              </div>
            </div>
          </button>

          {/* Dark Theme toggle */}
          <button
            onClick={() => {
              onToggleDarkMode();
              sound.playClick();
            }}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={progress.darkMode ? 'Day Shift (Light Theme)' : 'Overtime Crunch (Dark Theme)'}
            aria-label="Toggle dark mode"
          >
            {progress.darkMode ? (
              <Sun size={18} className="text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon size={18} className="hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Audio toggle */}
          <button
            onClick={() => {
              onToggleSound();
              sound.playClick();
            }}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={progress.soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
            aria-label="Toggle sound"
          >
            {progress.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} className="text-slate-400" />}
          </button>

          {/* Reset progress */}
          <button
            onClick={handleReset}
            className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Reset progress to day 1"
            aria-label="Reset progress"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
