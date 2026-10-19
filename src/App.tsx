import React, { useState, useEffect } from 'react';
import { Unit, Progress, Exercise } from './types';
import unitsData from './data/units.json';
import { store } from './lib/store';
import { TopBar } from './components/TopBar';
import { PathScreen } from './screens/PathScreen';
import { LessonScreen } from './screens/LessonScreen';
import { BossBattleScreen } from './screens/BossBattleScreen';
import { PIPModal } from './components/PIPModal';
import { PromotionModal } from './components/PromotionModal';
import { RankLadderModal } from './components/RankLadderModal';
import { sound } from './lib/sound';

type ViewMode = 'path' | 'lesson' | 'boss';

export const App: React.FC = () => {
  const [progress, setProgress] = useState<Progress>(() => store.getSnapshot());
  const [view, setView] = useState<ViewMode>('path');

  // Active lesson/boss state
  const [activeUnitId, setActiveUnitId] = useState<number>(1);
  const [activeLessonIndex, setActiveLessonIndex] = useState<number>(1);
  const [activeExercises, setActiveExercises] = useState<Exercise[]>([]);
  const [isPIPLesson, setIsPIPLesson] = useState(false);

  // Modals
  const [isRankLadderOpen, setIsRankLadderOpen] = useState(false);
  const [promotedRank, setPromotedRank] = useState<number | null>(null);

  const units: Unit[] = unitsData as Unit[];

  // Subscribe to store updates
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const snap = store.getSnapshot();
      setProgress({ ...snap });

      if (store.newlyPromotedRank !== null) {
        setPromotedRank(store.newlyPromotedRank);
        store.clearNewlyPromoted();
      }
    });
    return unsubscribe;
  }, []);

  // Check for PIP when morale hits 0
  const isPIPOpen = progress.morale === 0 && view !== 'lesson';

  // Handle starting a regular lesson
  const handleSelectLesson = (unitId: number, lessonIndex: number) => {
    const unit = units.find((u) => u.id === unitId);
    if (!unit) return;

    const lesson = unit.lessons.find((l) => l.lessonIndex === lessonIndex);
    if (!lesson) return;

    setActiveUnitId(unitId);
    setActiveLessonIndex(lessonIndex);
    setActiveExercises(lesson.exercises);
    setIsPIPLesson(false);
    setView('lesson');
  };

  // Handle starting a boss battle
  const handleSelectBoss = (unitId: number) => {
    setActiveUnitId(unitId);
    setView('boss');
  };

  // Handle starting the PIP Review lesson
  const handleStartPIPLesson = () => {
    // 3 refresher questions with no morale penalty
    const pipExercises: Exercise[] = [
      {
        id: 'pip-1',
        type: 'translate',
        mode: 'wordbank',
        channel: 'slack',
        sender: 'Linda (HR Calibration)',
        text: "Let's take this offline",
        model: 'Stop talking about this in front of everyone',
        snark: "The quintessential corporate silencing technique.",
        tiles: ['Stop', 'talking', 'about', 'this', 'in', 'front', 'of', 'everyone', 'loudly', 'forever'],
        accepted: [['Stop', 'talking', 'about', 'this', 'in', 'front', 'of', 'everyone']],
      },
      {
        id: 'pip-2',
        type: 'translate',
        mode: 'wordbank',
        channel: 'email',
        sender: 'Todd (HR Compliance)',
        text: 'Per my last email',
        model: 'Can you not read',
        snark: 'A polite dagger in corporate correspondence.',
        tiles: ['Can', 'you', 'not', 'read', 'yesterday', 'please'],
        accepted: [['Can', 'you', 'not', 'read']],
      },
      {
        id: 'pip-3',
        type: 'context',
        channel: 'meeting',
        sender: 'HR Synergy Bot',
        senderRole: 'Compliance Officer',
        email: "Let's put this in the parking lot and circle back when we have bandwidth.",
        options: [
          'They want to drive to a parking lot.',
          'They are ignoring this idea and postponing it indefinitely.',
          'They are increasing your internet bandwidth.',
          'They are hiring three more engineers.'
        ],
        answer: 1,
        why: 'The parking lot is where uncomfortable ideas go to rest forever.'
      }
    ];

    setActiveUnitId(1);
    setActiveLessonIndex(0);
    setActiveExercises(pipExercises);
    setIsPIPLesson(true);
    setView('lesson');
  };

  // Handle finishing lesson
  const handleFinishLesson = (earnedXp: number) => {
    if (isPIPLesson) {
      store.restoreMorale();
      sound.playFanfare();
    } else {
      const lessonId = `unit-${activeUnitId}-lesson-${activeLessonIndex}`;
      store.completeLesson(lessonId, earnedXp);
    }
    setView('path');
  };

  // Handle finishing boss battle
  const handleFinishBoss = (earnedXp: number) => {
    const bossId = `boss-unit-${activeUnitId}`;
    store.completeLesson(bossId, earnedXp);
    setView('path');
  };

  const currentUnit = units.find((u) => u.id === activeUnitId) || units[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <TopBar
        progress={progress}
        onReset={() => store.resetProgress()}
        onToggleSound={() => store.toggleSound()}
        onOpenRankModal={() => setIsRankLadderOpen(true)}
      />

      {/* Main Screens */}
      <div className="flex-1">
        {view === 'path' && (
          <PathScreen
            units={units}
            progress={progress}
            onSelectLesson={handleSelectLesson}
            onSelectBoss={handleSelectBoss}
            onOpenRankModal={() => setIsRankLadderOpen(true)}
          />
        )}

        {view === 'lesson' && (
          <LessonScreen
            lessonTitle={
              isPIPLesson ? 'Mandatory Morale Calibration (PIP)' : `Lesson ${activeLessonIndex}`
            }
            unitTheme={currentUnit.theme}
            initialExercises={activeExercises}
            isPIPLesson={isPIPLesson}
            onFinishLesson={handleFinishLesson}
            onExit={() => setView('path')}
          />
        )}

        {view === 'boss' && (
          <BossBattleScreen
            boss={currentUnit.boss}
            targetPhrases={currentUnit.lessons.flatMap((l) =>
              l.exercises
                .filter((e) => e.type === 'translate')
                .map((e) => (e as any).text.toLowerCase())
            )}
            onFinishBoss={handleFinishBoss}
            onExit={() => setView('path')}
          />
        )}
      </div>

      {/* Performance Improvement Plan (PIP) Modal */}
      <PIPModal
        isOpen={isPIPOpen}
        onStartPIPLesson={handleStartPIPLesson}
      />

      {/* Promotion Celebratory Modal */}
      <PromotionModal
        rankIndex={promotedRank}
        onClose={() => setPromotedRank(null)}
      />

      {/* Job Title Ladder Modal */}
      <RankLadderModal
        currentXp={progress.xp}
        isOpen={isRankLadderOpen}
        onClose={() => setIsRankLadderOpen(false)}
      />

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 bg-white/50 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            <strong>Circle Back</strong> — Steal//Remake Hackathon submission. Remixed from Duolingo.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleSelectBoss(1)}
              className="text-emerald-700 hover:underline font-bold"
            >
              ⚡ Test Unit 1 Boss
            </button>
            <button
              onClick={() => handleSelectBoss(4)}
              className="text-amber-700 hover:underline font-bold"
            >
              ⚡ Test LinkedIn Boss
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
