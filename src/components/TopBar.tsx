import React from 'react';
import { Heart, Flame, Award, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { Progress } from '../types';
import { getRankForXp } from '../lib/ranks';
import { sound } from '../lib/sound';

interface TopBarProps {
  progress: Progress;
  onReset: () => void;
  onToggleSound: () => void;
  onOpenRankModal?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  progress,
  onReset,
  onToggleSound,
  onOpenRankModal,
}) => {
  const currentRank = getRankForXp(progress.xp);

  const handleReset = () => {
    if (window.confirm('Reset all progress, XP, streak and morale to day 1?')) {
      onReset();
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-2.5 shadow-sm">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-xl shadow-sm text-white">
            🪴
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-800 text-lg tracking-tight">Circle Back</span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                v1.0
              </span>
            </div>
            <p className="hidden sm:block text-xs text-slate-500 font-medium">Corporate Speak Language Learning</p>
          </div>
        </div>

        {/* Stats & Meters */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Morale (Replaces Hearts) */}
          <div
            className="flex items-center gap-1 bg-rose-50 border border-rose-200/80 px-2.5 py-1.5 rounded-xl shadow-xs"
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
                      : 'text-slate-300 scale-90'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-rose-700 ml-1">{progress.morale}</span>
          </div>

          {/* Days of Uninterrupted Productivity (Streak) */}
          <div
            className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 px-2.5 py-1.5 rounded-xl shadow-xs"
            title="Days of Uninterrupted Productivity (Consecutive active days)"
          >
            <Flame size={18} className="fill-amber-500 text-amber-500 animate-pulse" />
            <div className="flex items-baseline gap-1">
              <span className="font-extrabold text-amber-700 text-sm">{progress.streak}</span>
              <span className="hidden md:inline text-[11px] font-semibold text-amber-600">days</span>
            </div>
          </div>

          {/* XP & Job Title Rank */}
          <button
            onClick={onOpenRankModal}
            className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/90 px-3 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer group"
            title="Click to view Job Title Ladder and Promotion status"
          >
            <Award size={18} className="text-emerald-600 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <div className="flex items-center gap-1">
                <span className="font-black text-emerald-800 text-sm">{progress.xp}</span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase">XP</span>
              </div>
              <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <span>{currentRank.badge}</span>
                <span className="hidden sm:inline">{currentRank.title}</span>
              </div>
            </div>
          </button>

          {/* Audio toggle */}
          <button
            onClick={() => {
              onToggleSound();
              sound.playClick();
            }}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title={progress.soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
            aria-label="Toggle sound"
          >
            {progress.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} className="text-slate-400" />}
          </button>

          {/* Reset progress */}
          <button
            onClick={handleReset}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
