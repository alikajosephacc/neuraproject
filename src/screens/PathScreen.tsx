import React from 'react';
import { Check, Lock, Play, Zap, Skull, ChevronRight, Sparkles } from 'lucide-react';
import { Unit, Progress } from '../types';
import { MascotGerald } from '../components/MascotGerald';
import { Leaderboard } from '../components/Leaderboard';
import { SpotlightCard } from '../components/SpotlightCard';
import { BorderBeam } from '../components/BorderBeam';
import { getRankForXp, getNextRank } from '../lib/ranks';
import { store } from '../lib/store';
import { sound } from '../lib/sound';

interface PathScreenProps {
  units: Unit[];
  progress: Progress;
  onSelectLesson: (unitId: number, lessonIndex: number) => void;
  onSelectBoss: (unitId: number) => void;
  onOpenRankModal: () => void;
}

export const PathScreen: React.FC<PathScreenProps> = ({
  units,
  progress,
  onSelectLesson,
  onSelectBoss,
  onOpenRankModal,
}) => {
  const currentRank = getRankForXp(progress.xp);
  const nextRank = getNextRank(currentRank.index);
  const mascotMood = store.getMascotMood();

  // Calculate XP progress towards next rank
  let rankProgressPercent = 100;
  let xpRemaining = 0;
  if (nextRank) {
    const range = nextRank.minXp - currentRank.minXp;
    const gained = progress.xp - currentRank.minXp;
    rankProgressPercent = Math.min(100, Math.max(0, Math.round((gained / range) * 100)));
    xpRemaining = Math.max(0, nextRank.minXp - progress.xp);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Learning Path Units */}
      <main className="lg:col-span-7 space-y-12">
        {units.map((unit) => {
          const unitCompletedLessons = unit.lessons.filter((l) =>
            progress.completedLessons.includes(l.id)
          ).length;
          const isBossCompleted = progress.completedLessons.includes(unit.boss.id);

          return (
            <section
              key={unit.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors"
            >
              {/* Unit Banner Header */}
              <div
                className="p-6 text-white relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${unit.color}, ${adjustColorBrightness(unit.color, -25)})`,
                }}
              >
                <div className="flex items-center justify-between gap-4 relative z-10">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-widest bg-black/25 px-2.5 py-1 rounded-full">
                      Unit {unit.id}
                    </span>
                    <h2 className="text-2xl font-black mt-1.5 tracking-tight">{unit.theme}</h2>
                    <p className="text-xs text-white/90 font-medium max-w-md mt-1">
                      {unit.description}
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl shrink-0 shadow-inner">
                    {unit.id === 1 ? '☕' : unit.id === 2 ? '✉️' : unit.id === 3 ? '📈' : '🚀'}
                  </div>
                </div>

                {/* Subtle progress bar in banner */}
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex-1 bg-black/25 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-white h-full transition-all duration-500 rounded-full"
                      style={{
                        width: `${Math.round(((unitCompletedLessons + (isBossCompleted ? 1 : 0)) / (unit.lessons.length + 1)) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-black text-white/90 shrink-0">
                    {unitCompletedLessons + (isBossCompleted ? 1 : 0)} / {unit.lessons.length + 1}
                  </span>
                </div>
              </div>

              {/* Lesson Path Nodes */}
              <div className="p-8 flex flex-col items-center space-y-7 relative">
                {/* Winding connector SVG lines */}
                <div className="absolute inset-0 pointer-events-none flex justify-center">
                  <div className="w-1 h-full bg-slate-100 dark:bg-slate-800 -z-0" />
                </div>

                {unit.lessons.map((lesson, idx) => {
                  const isCompleted = progress.completedLessons.includes(lesson.id);
                  const isUnlocked =
                    (unit.id === 1 && idx === 0) ||
                    progress.completedLessons.includes(lesson.id) ||
                    (idx > 0 && progress.completedLessons.includes(unit.lessons[idx - 1].id)) ||
                    (idx === 0 && progress.completedLessons.includes(units[unit.id - 2]?.lessons?.slice(-1)[0]?.id ?? ''));

                  const offsets = ['translate-x-0', '-translate-x-12 sm:-translate-x-16', 'translate-x-12 sm:translate-x-16'];
                  const offsetClass = offsets[idx % offsets.length];

                  return (
                    <div
                      key={lesson.id}
                      className={`relative z-10 flex flex-col items-center ${offsetClass}`}
                    >
                      {/* Active lesson tooltip pill */}
                      {isUnlocked && !isCompleted && (
                        <div className="absolute -top-7 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[11px] uppercase tracking-wider animate-bounce-short shadow-sm">
                          START
                        </div>
                      )}

                      <button
                        onClick={() => {
                          if (isUnlocked) {
                            sound.playClick();
                            onSelectLesson(unit.id, lesson.lessonIndex);
                          }
                        }}
                        disabled={!isUnlocked}
                        className={`relative overflow-hidden w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center font-black text-xl transition-all duration-200 cursor-pointer ${
                          isCompleted
                            ? 'bg-emerald-500 text-white border-b-4 border-emerald-700 shadow-md hover:bg-emerald-400'
                            : isUnlocked
                            ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-4 border-emerald-500 shadow-lg hover:scale-105 active:translate-y-1'
                            : 'bg-slate-100 dark:bg-slate-800/60 text-slate-300 dark:text-slate-600 border-4 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                        }`}
                        title={`${lesson.title} - ${lesson.description}`}
                      >
                        {isUnlocked && !isCompleted && (
                          <BorderBeam size={80} duration={4} borderWidth={3} colorFrom="#10b981" colorTo="#06b6d4" />
                        )}
                        {isCompleted ? (
                          <Check size={28} strokeWidth={3.5} />
                        ) : isUnlocked ? (
                          <Play size={24} className="fill-emerald-500 text-emerald-500 ml-1" />
                        ) : (
                          <Lock size={22} />
                        )}
                      </button>

                      <div className="text-center mt-2 max-w-[150px]">
                        <p className="font-extrabold text-xs text-slate-800 dark:text-slate-200 truncate">
                          {lesson.title}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">6 Action Items</p>
                      </div>
                    </div>
                  );
                })}

                {/* Boss Battle Node */}
                <div className="relative z-10 flex flex-col items-center pt-2">
                  <div className="absolute -top-6 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black text-[10px] uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Skull size={12} /> Unit Boss
                  </div>

                  <button
                    onClick={() => {
                      sound.playClick();
                      onSelectBoss(unit.id);
                    }}
                    className={`relative overflow-hidden w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex flex-col items-center justify-center font-black transition-all duration-200 cursor-pointer shadow-lg hover:scale-105 active:translate-y-1 ${
                      isBossCompleted
                        ? 'bg-amber-500 text-white border-b-6 border-amber-700'
                        : 'bg-gradient-to-tr from-amber-500 to-rose-500 text-white border-b-6 border-rose-800'
                    }`}
                    title={`Boss Battle: ${unit.boss.title}`}
                  >
                    {!isBossCompleted && (
                      <BorderBeam size={100} duration={3} borderWidth={3} colorFrom="#f59e0b" colorTo="#f43f5e" />
                    )}
                    <Zap size={30} className="fill-white text-white animate-pulse" />
                    <span className="text-[9px] font-extrabold tracking-widest uppercase mt-0.5">
                      {isBossCompleted ? 'CLEARED' : 'BOSS'}
                    </span>
                  </button>

                  <div className="text-center mt-2 max-w-[180px]">
                    <p className="font-black text-xs text-slate-900 dark:text-slate-100">{unit.boss.title}</p>
                    <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">Jargon Meter Challenge</p>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </main>

      {/* Right Column: Mascot, Rank Progress, Synergy League */}
      <aside className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
        {/* Gerald Widget */}
        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.15)"
          className="p-6 shadow-xs flex flex-col items-center text-center"
        >
          <MascotGerald mood={mascotMood} size="md" />
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 w-full flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Mascot Status:</span>
            <span
              className={`font-black uppercase tracking-wider ${
                mascotMood === 'thriving'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : mascotMood === 'wilting'
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {mascotMood}
            </span>
          </div>
        </SpotlightCard>

        {/* Promotion Progress Card */}
        <SpotlightCard
          spotlightColor="rgba(59, 130, 246, 0.12)"
          className="p-5 shadow-xs"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Career Track</span>
            <button
              onClick={onOpenRankModal}
              className="text-xs font-black text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-0.5 cursor-pointer"
            >
              Ladder <ChevronRight size={14} />
            </button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-2xl">
              {currentRank.badge}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-black text-slate-800 dark:text-slate-100 text-base">{currentRank.title}</h4>
                <Sparkles size={14} className="text-amber-500" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {nextRank ? `${xpRemaining} XP to ${nextRank.title}` : 'Peak Corporate Enlightenment'}
              </p>
            </div>
          </div>

          {nextRank && (
            <div className="space-y-1.5">
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${rankProgressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500">
                <span>{progress.xp} XP</span>
                <span>{nextRank.minXp} XP</span>
              </div>
            </div>
          )}
        </SpotlightCard>

        {/* Fictional Coworker Leaderboard */}
        <Leaderboard playerXp={progress.xp} />
      </aside>
    </div>
  );
};

function adjustColorBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}
