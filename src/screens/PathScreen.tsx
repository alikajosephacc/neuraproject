import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Check, Lock, Play, Zap, Skull } from 'lucide-react';
import { Unit, Progress } from '../types';
import { MascotGerald } from '../components/MascotGerald';
import { MascotMushroom } from '../components/MascotMushroom';
import { Leaderboard } from '../components/Leaderboard';
import { SpotlightCard } from '../components/SpotlightCard';
import { BorderBeam } from '../components/BorderBeam';
import { ClickSpark } from '../components/ClickSpark';
import { LuminousType } from '../components/LuminousType';
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

interface UnitLessonTrackProps {
  unit: Unit;
  units: Unit[];
  progress: Progress;
  onSelectLesson: (unitId: number, lessonIndex: number) => void;
  onSelectBoss: (unitId: number) => void;
}

/**
 * UnitLessonTrack
 * Renders the winding interactive lesson nodes with dynamic SVG dotted trace lines
 * connecting Lesson 1 -> Lesson 2 -> Lesson 3 -> Boss battle node.
 */
const UnitLessonTrack: React.FC<UnitLessonTrackProps> = ({
  unit,
  units,
  progress,
  onSelectLesson,
  onSelectBoss,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [segments, setSegments] = useState<{ d: string; isCompleted: boolean }[]>([]);

  const unitCompletedLessons = unit.lessons.filter((l) =>
    progress.completedLessons.includes(l.id)
  ).length;
  const isBossCompleted = progress.completedLessons.includes(unit.boss.id);
  const allLessonsInUnitCompleted = unitCompletedLessons === unit.lessons.length;

  const updatePath = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const centers: { x: number; y: number }[] = [];

    buttonRefs.current.forEach((btn) => {
      if (btn) {
        const r = btn.getBoundingClientRect();
        centers.push({
          x: r.left + r.width / 2 - containerRect.left,
          y: r.top + r.height / 2 - containerRect.top,
        });
      }
    });

    if (centers.length < 2) return;

    const newSegments: { d: string; isCompleted: boolean }[] = [];
    for (let i = 0; i < centers.length - 1; i++) {
      const p1 = centers[i];
      const p2 = centers[i + 1];
      const midY = (p1.y + p2.y) / 2;
      const d = `M ${p1.x} ${p1.y} C ${p1.x} ${midY}, ${p2.x} ${midY}, ${p2.x} ${p2.y}`;

      const isSegmentCompleted =
        i < unit.lessons.length
          ? progress.completedLessons.includes(unit.lessons[i].id)
          : false;

      newSegments.push({ d, isCompleted: isSegmentCompleted });
    }

    setSegments(newSegments);
  }, [unit, progress.completedLessons]);

  useEffect(() => {
    updatePath();
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      ro = new ResizeObserver(() => updatePath());
      ro.observe(containerRef.current);
    }
    window.addEventListener('resize', updatePath);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', updatePath);
    };
  }, [updatePath]);

  // Fallback initial segments before first DOM measurement
  const displayedSegments =
    segments.length > 0
      ? segments
      : [
          {
            d: 'M 190 60 C 190 120, 130 140, 130 200',
            isCompleted: progress.completedLessons.includes(unit.lessons[0]?.id),
          },
          {
            d: 'M 130 200 C 130 260, 250 280, 250 340',
            isCompleted: progress.completedLessons.includes(unit.lessons[1]?.id),
          },
          {
            d: 'M 250 340 C 250 400, 190 420, 190 480',
            isCompleted: progress.completedLessons.includes(unit.lessons[2]?.id),
          },
        ];

  return (
    <div
      ref={containerRef}
      className="p-8 flex flex-col items-center space-y-7 relative font-mono bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-300 overflow-hidden"
    >
      {/* Dynamic Winding SVG Dotted Trace Line between lessons */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none -z-0">
        {displayedSegments.map((seg, idx) => (
          <g key={idx}>
            {/* Emerald glow aura behind completed segments */}
            {seg.isCompleted && (
              <path
                d={seg.d}
                fill="none"
                stroke="#10b981"
                strokeWidth="10"
                strokeOpacity="0.18"
                strokeLinecap="round"
              />
            )}
            {/* Winding Dotted Trace Line */}
            <path
              d={seg.d}
              fill="none"
              stroke={seg.isCompleted ? '#10b981' : '#94a3b8'}
              className={seg.isCompleted ? '' : 'dark:stroke-slate-700 opacity-60 dark:opacity-40'}
              strokeWidth={seg.isCompleted ? 4 : 3}
              strokeDasharray="8 8"
              strokeLinecap="round"
            />
          </g>
        ))}
      </svg>

      {unit.lessons.map((lesson, idx) => {
        const isCompleted = progress.completedLessons.includes(lesson.id);

        const prevLessonInUnit = idx > 0 ? unit.lessons[idx - 1] : null;
        const isPrevLessonCompleted = prevLessonInUnit
          ? progress.completedLessons.includes(prevLessonInUnit.id)
          : false;

        const prevUnit = unit.id > 1 ? units[unit.id - 2] : null;
        const isPrevUnitUnlocked = prevUnit
          ? progress.completedLessons.includes(prevUnit.boss.id) ||
            progress.completedLessons.includes(
              prevUnit.lessons[prevUnit.lessons.length - 1]?.id ?? ''
            )
          : false;

        const isUnlocked =
          (unit.id === 1 && idx === 0) ||
          isCompleted ||
          (idx > 0 && isPrevLessonCompleted) ||
          (idx === 0 && isPrevUnitUnlocked);

        const offsets = [
          'translate-x-0',
          '-translate-x-12 sm:-translate-x-16',
          'translate-x-12 sm:translate-x-16',
        ];
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

            <ClickSpark sparkColor="#10b981" sparkRadius={30} sparkCount={8}>
              <button
                ref={(el) => {
                  buttonRefs.current[idx] = el;
                }}
                onClick={() => {
                  if (isUnlocked) {
                    sound.playClick();
                    onSelectLesson(unit.id, lesson.lessonIndex);
                  }
                }}
                disabled={!isUnlocked}
                className={`relative overflow-hidden w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center font-black text-xl transition-all duration-200 cursor-pointer focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-emerald-500/50 ${
                  isCompleted
                    ? 'bg-emerald-500 text-white border-b-4 border-emerald-700 shadow-md hover:bg-emerald-400'
                    : isUnlocked
                    ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-4 border-emerald-500 shadow-lg hover:scale-105 active:translate-y-1'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-300 dark:text-slate-600 border-4 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                }`}
                title={`${lesson.title} - ${lesson.description}`}
              >
                {isUnlocked && !isCompleted && (
                  <BorderBeam
                    size={80}
                    duration={4}
                    borderWidth={3}
                    colorFrom="#10b981"
                    colorTo="#06b6d4"
                  />
                )}
                {isCompleted ? (
                  <Check size={28} strokeWidth={3.5} />
                ) : isUnlocked ? (
                  <Play size={24} className="fill-emerald-500 text-emerald-500 ml-1" />
                ) : (
                  <Lock size={22} />
                )}
              </button>
            </ClickSpark>

            <div className="text-center mt-2 max-w-[150px]">
              <p className="font-extrabold text-xs text-slate-800 dark:text-slate-200 truncate">
                {lesson.title}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                {lesson.exercises.length} Exercises
              </p>
            </div>
          </div>
        );
      })}

      {/* Boss Battle Node */}
      <div className="relative z-10 flex flex-col items-center pt-2">
        {allLessonsInUnitCompleted && !isBossCompleted && (
          <div className="absolute -top-7 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black text-[10px] uppercase tracking-wider animate-bounce-short shadow-sm flex items-center gap-1">
            <Skull size={12} /> BOSS READY
          </div>
        )}

        <ClickSpark sparkColor="#f59e0b" sparkRadius={36} sparkCount={12}>
          <button
            ref={(el) => {
              buttonRefs.current[unit.lessons.length] = el;
            }}
            onClick={() => {
              sound.playClick();
              onSelectBoss(unit.id);
            }}
            className={`relative overflow-hidden w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex flex-col items-center justify-center font-black transition-all duration-200 cursor-pointer shadow-lg hover:scale-105 active:translate-y-1 focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-amber-500/50 ${
              isBossCompleted
                ? 'bg-amber-500 text-white border-b-6 border-amber-700'
                : allLessonsInUnitCompleted
                ? 'bg-gradient-to-tr from-amber-500 to-rose-500 text-white border-b-6 border-rose-800'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-600 border-b-4 border-slate-300 dark:border-slate-700'
            }`}
            title={`Boss Battle: ${unit.boss.title}`}
          >
            {!isBossCompleted && allLessonsInUnitCompleted && (
              <BorderBeam
                size={100}
                duration={3}
                borderWidth={3}
                colorFrom="#f59e0b"
                colorTo="#f43f5e"
              />
            )}
            <Zap size={30} className="fill-white text-white animate-pulse" />
            <span className="text-[9px] font-extrabold tracking-widest uppercase mt-0.5">
              {isBossCompleted ? 'CLEARED' : 'BOSS'}
            </span>
          </button>
        </ClickSpark>

        <div className="text-center mt-2 max-w-[180px]">
          <p className="font-black text-xs text-slate-900 dark:text-slate-100">{unit.boss.title}</p>
          <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">
            Jargon Meter Challenge
          </p>
        </div>
      </div>
    </div>
  );
};

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
  const mascotType = store.getMascotType();

  // Calculate XP progress towards next rank
  let rankProgressPercent = 100;
  let xpRemaining = 0;
  if (nextRank) {
    const range = nextRank.minXp - currentRank.minXp;
    const gained = progress.xp - currentRank.minXp;
    rankProgressPercent = Math.min(100, Math.max(0, Math.round((gained / range) * 100)));
    xpRemaining = Math.max(0, nextRank.minXp - progress.xp);
  }

  const getUnitBannerClass = (unitId: number) => {
    switch (unitId) {
      case 1:
        return 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white';
      case 2:
        return 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-600 to-rose-700 text-white';
      case 4:
        return 'bg-gradient-to-r from-purple-600 to-pink-700 text-white';
      default:
        return 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white';
    }
  };

  return (
    <div className="transition-colors duration-300 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Interactive Monospace Buzzword Telemetry Bar */}
        <LuminousType
          phrases={[
            "circle back and align our core competencies",
            "put this in the parking lot to unblock bandwidth",
            "take this offline before anyone asks for an agenda",
            "leverage high altitude synergies for Q4 deliverables",
            "move fast and break things without notifying compliance",
          ]}
          className="mb-8"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Learning Path Units */}
          <main className="lg:col-span-7 space-y-6">
            {units.map((unit, unitIdx) => {
              const unitCompletedLessons = unit.lessons.filter((l) =>
                progress.completedLessons.includes(l.id)
              ).length;
              const isBossCompleted = progress.completedLessons.includes(unit.boss.id);

              return (
                <React.Fragment key={unit.id}>
                  <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-all duration-300">
                    {/* Unit Banner Header ("Meeting Survival Tab") in Inter Font */}
                    <div
                      className={`p-6 relative overflow-hidden font-['Inter',sans-serif] ${getUnitBannerClass(
                        unit.id
                      )}`}
                    >
                      <div className="flex items-center justify-between gap-4 relative z-10">
                        <div>
                          <span className="text-[11px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-black/25 text-white">
                            Unit {unit.id}
                          </span>
                          <h2 className="text-2xl font-black mt-1.5 tracking-tight text-white">
                            {unit.theme}
                          </h2>
                          <p className="text-xs text-white/90 font-medium max-w-md mt-1">
                            {unit.description}
                          </p>
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl shrink-0 shadow-inner text-white">
                          {unit.id === 1 ? '☕' : unit.id === 2 ? '✉️' : unit.id === 3 ? '📈' : '🚀'}
                        </div>
                      </div>

                      {/* Subtle progress bar in banner */}
                      <div className="mt-4 flex items-center gap-2">
                        <div className="flex-1 bg-black/25 h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-white transition-all duration-500 rounded-full"
                            style={{
                              width: `${Math.round(
                                ((unitCompletedLessons + (isBossCompleted ? 1 : 0)) /
                                  (unit.lessons.length + 1)) *
                                  100
                              )}%`,
                            }}
                          />
                        </div>
                        <span className="text-[11px] font-black text-white shrink-0">
                          {unitCompletedLessons + (isBossCompleted ? 1 : 0)} /{' '}
                          {unit.lessons.length + 1}
                        </span>
                      </div>
                    </div>

                    {/* Lesson Path Nodes with Dynamic Winding Trace Line */}
                    <UnitLessonTrack
                      unit={unit}
                      units={units}
                      progress={progress}
                      onSelectLesson={onSelectLesson}
                      onSelectBoss={onSelectBoss}
                    />
                  </section>

                  {/* Inter-unit trace line connecting units */}
                  {unitIdx < units.length - 1 && (
                    <div className="flex flex-col items-center my-3 pointer-events-none">
                      <div className="h-5 w-0 border-l-2 border-dotted border-slate-300 dark:border-slate-700" />
                      <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest my-1 px-3 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        Next Stage ↓
                      </span>
                      <div className="h-5 w-0 border-l-2 border-dotted border-slate-300 dark:border-slate-700" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </main>

          {/* Right Column: Mascot, Rank Progress, Synergy League */}
          <aside className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
            {/* Mascot Widget (Pip the Agile Mushroom or Gerald the Ficus) */}
            <SpotlightCard
              spotlightColor="rgba(16, 185, 129, 0.15)"
              className="p-6 shadow-xs flex flex-col items-center text-center transition-all duration-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            >
              {mascotType === 'mushroom' ? (
                <MascotMushroom mood={mascotMood} size="md" />
              ) : (
                <MascotGerald mood={mascotMood} size="md" />
              )}

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 w-full flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                <button
                  onClick={() => {
                    sound.playClick();
                    store.toggleMascot();
                  }}
                  className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Click to toggle between Gerald the Ficus and Pip the Agile Mushroom"
                >
                  <span>Switch:</span>
                  <span className="text-rose-600 dark:text-rose-400 font-extrabold underline decoration-dotted">
                    {mascotType === 'mushroom' ? '🍄 Pip (Mushroom)' : '🪴 Gerald (Ficus)'}
                  </span>
                </button>
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
              spotlightColor="rgba(16, 185, 129, 0.15)"
              className="p-5 shadow-xs transition-all duration-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Career Track
                </span>
                <button
                  onClick={onOpenRankModal}
                  className="text-xs font-black text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-0.5 cursor-pointer"
                >
                  <span>{currentRank.title}</span>
                  <span>({currentRank.badge})</span>
                </button>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/50">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${rankProgressPercent}%` }}
                />
              </div>

              {nextRank ? (
                <div className="flex justify-between items-center text-[11px] text-slate-400 dark:text-slate-500 mt-2 font-mono">
                  <span>{progress.xp} XP</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    +{xpRemaining} XP to {nextRank.title}
                  </span>
                </div>
              ) : (
                <div className="text-center text-xs font-bold text-amber-500 mt-2">
                  MAX RANK ACHIEVED! (CEO STATUS)
                </div>
              )}
            </SpotlightCard>

            {/* Fictional Coworker Leaderboard */}
            <Leaderboard playerXp={progress.xp} />
          </aside>
        </div>
      </div>
    </div>
  );
};
