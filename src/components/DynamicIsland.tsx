import React, { useState } from 'react';
import {
  Heart,
  Flame,
  Award,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Activity,
} from 'lucide-react';
import { Progress } from '../types';
import { getRankForXp } from '../lib/ranks';
import { sound } from '../lib/sound';

interface DynamicIslandProps {
  progress: Progress;
  onReset: () => void;
  onToggleSound: () => void;
  onToggleDarkMode: () => void;
  onOpenRankModal?: () => void;
  onOpenMascotLab?: () => void;
}

/**
 * Hardware Dynamic Island (Apple Dynamic Island + Teenage Engineering OP-1 Telemetry)
 * - Clean matte ceramic chassis with precision border
 * - Monospace telemetry signals with LED status indicators
 * - Expandable status deck with sleek native Light and Dark theme controls
 */
export const DynamicIsland: React.FC<DynamicIslandProps> = ({
  progress,
  onReset,
  onToggleSound,
  onToggleDarkMode,
  onOpenRankModal,
  onOpenMascotLab,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const currentRank = getRankForXp(progress.xp);

  const handleReset = () => {
    if (window.confirm('Reset all progress, XP, streak and morale to day 1?')) {
      onReset();
    }
  };

  const isLowMorale = progress.morale <= 1;

  return (
    <header className="sticky top-2 z-40 px-3 sm:px-6 pointer-events-none transition-all duration-300">
      <div className="max-w-4xl mx-auto flex justify-center">
        {/* Dynamic Island Pill Chassis */}
        <div
          className={`pointer-events-auto relative overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isExpanded
              ? 'w-full max-w-2xl rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200/90 dark:border-slate-800'
              : 'w-auto rounded-full px-4 py-2 shadow-lg hover:shadow-xl border border-slate-200/90 dark:border-slate-800'
          } bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl text-slate-800 dark:text-slate-100 select-none`}
        >
          {/* Collapsed State Bar */}
          {!isExpanded ? (
            <div className="flex items-center gap-3 sm:gap-5 text-xs font-mono font-bold">
              {/* Brand Logo & Telemetry Indicator */}
              <button
                onClick={() => setIsExpanded(true)}
                className="flex items-center gap-2 text-left group cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg p-0.5"
                title="Expand telemetry deck"
              >
                <div className="w-5 h-5 rounded-md bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Activity size={12} className="animate-pulse" />
                </div>
                <span className="font-extrabold tracking-tight text-slate-900 dark:text-white font-sans text-xs sm:text-sm">
                  CircleBack
                </span>
                <span className="text-[10px] text-slate-400 font-mono tracking-tighter hidden md:inline">
                  SYS:OK
                </span>
              </button>

              <div className="h-3.5 w-px bg-slate-200 dark:bg-slate-800" />

              {/* Morale Pill */}
              <div
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] transition-colors ${
                  isLowMorale
                    ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
                title={`Morale: ${progress.morale}/5`}
              >
                <Heart
                  size={13}
                  className={`transition-colors ${
                    isLowMorale
                      ? 'fill-rose-500 text-rose-500'
                      : 'fill-rose-500/70 text-rose-500'
                  }`}
                />
                <span className="font-mono font-black">{progress.morale}/5</span>
              </div>

              {/* Streak Pill */}
              <div
                className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-[11px]"
                title={`Productivity Streak: ${progress.streak} days`}
              >
                <Flame size={14} className="fill-amber-500 text-amber-500 animate-pulse" />
                <span className="font-mono font-black">{progress.streak}d</span>
              </div>

              {/* XP Rank Pill */}
              <button
                onClick={onOpenRankModal}
                className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                title="View Rank Ladder"
              >
                <Award size={14} />
                <span className="font-mono font-black">{progress.xp} XP</span>
              </button>

              <div className="h-3.5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

              {/* Quick Controls */}
              <div className="flex items-center gap-1">
                {/* Mascot Lab Trigger */}
                <button
                  onClick={() => {
                    sound.playClick();
                    if (onOpenMascotLab) onOpenMascotLab();
                  }}
                  className="p-1 rounded-md text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Mascot Lab (Pip the Mushroom)"
                >
                  <Sparkles size={14} />
                </button>

                {/* Day / Night Shift */}
                <button
                  onClick={() => {
                    sound.playClick();
                    onToggleDarkMode();
                  }}
                  className="p-1 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title={progress.darkMode ? 'Switch to Day Shift' : 'Switch to Crunch Mode'}
                >
                  {progress.darkMode ? <Sun size={14} /> : <Moon size={14} />}
                </button>

                {/* Sound Toggle */}
                <button
                  onClick={() => {
                    sound.playClick();
                    onToggleSound();
                  }}
                  className="p-1 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title={progress.soundEnabled ? 'Mute' : 'Unmute'}
                >
                  {progress.soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                </button>

                {/* Expand Toggle */}
                <button
                  onClick={() => setIsExpanded(true)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ml-1"
                  title="Expand Deck"
                >
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>
          ) : (
            /* Expanded Dynamic Island Deck (Teenage Engineering Hardware Surface) */
            <div className="space-y-4 animate-pop-in">
              {/* Header row */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    TELEMETRY DECK // HARDWARE OP-1
                  </span>
                </div>

                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-xs font-mono font-bold text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 px-2 py-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  [COLLAPSE]
                </button>
              </div>

              {/* Hardware Telemetry Readouts Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* 1. Morale Spec */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>MORALE</span>
                    <Heart size={13} className="text-rose-500 fill-rose-500" />
                  </div>
                  <div className="text-xl font-mono font-black text-rose-600 dark:text-rose-400 mt-1">
                    {progress.morale} / 5
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${(progress.morale / 5) * 100}%` }}
                    />
                  </div>
                </div>

                {/* 2. Productivity Streak */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>STREAK</span>
                    <Flame size={13} className="text-amber-500 fill-amber-500" />
                  </div>
                  <div className="text-xl font-mono font-black text-amber-600 dark:text-amber-400 mt-1">
                    {progress.streak} <span className="text-xs font-normal">DAYS</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-2 truncate">
                    {progress.lastActiveDate || 'INACTIVE'}
                  </div>
                </div>

                {/* 3. XP Accumulator */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>XP TOTAL</span>
                    <Award size={13} className="text-emerald-500" />
                  </div>
                  <div className="text-xl font-mono font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {progress.xp}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-2">
                    LADDER: {progress.rank}
                  </div>
                </div>

                {/* 4. Active Rank */}
                <div
                  onClick={onOpenRankModal}
                  className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 cursor-pointer hover:border-emerald-500 transition-colors"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>TITLE</span>
                    <span>{currentRank.badge}</span>
                  </div>
                  <div className="text-sm font-sans font-black text-slate-900 dark:text-white mt-1 truncate">
                    {currentRank.title}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-2 font-bold">
                    VIEW LADDER →
                  </div>
                </div>
              </div>

              {/* Hardware Deck Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      sound.playClick();
                      if (onOpenMascotLab) onOpenMascotLab();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-mono text-xs font-bold border border-rose-200 dark:border-rose-900 hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    <Sparkles size={14} />
                    <span>Mascot Lab (Mushroom)</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      onToggleDarkMode();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    {progress.darkMode ? <Sun size={14} /> : <Moon size={14} />}
                    <span>{progress.darkMode ? 'Day Shift' : 'Crunch Mode'}</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      onToggleSound();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    {progress.soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                    <span>{progress.soundEnabled ? 'Audio ON' : 'Muted'}</span>
                  </button>
                </div>

                <button
                  onClick={handleReset}
                  className="text-xs font-mono text-rose-500 hover:text-rose-600 dark:text-rose-400 flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>Reset Progress</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
