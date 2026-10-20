import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Heart,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  MessageSquare,
  Mail,
  Users,
  Lightbulb,
  CornerDownLeft,
  Lock,
  Smile,
} from 'lucide-react';
import { Exercise, TranslateExercise, MatchExercise, ContextExercise } from '../types';
import {
  checkTypedAnswer,
  checkWordBankAnswerAdvanced,
  IdeaCheckResult,
} from '../lib/checker';
import { store } from '../lib/store';
import { sound } from '../lib/sound';
import { SpotlightCard } from '../components/SpotlightCard';
import { ClickSpark } from '../components/ClickSpark';
import { MascotMushroom } from '../components/MascotMushroom';

interface LessonScreenProps {
  lessonTitle: string;
  unitTheme: string;
  initialExercises: Exercise[];
  isPIPLesson?: boolean;
  onFinishLesson: (earnedXp: number, mistakes: number) => void;
  onExit: () => void;
}

const EXTRA_MUSHROOM_QUOTES = [
  "The higher you climb the org chart, the fewer slides you need to prepare.",
  "Never underestimate the power of saying 'let's take this offline' when you don't know the answer.",
  "Your synergy metrics are so high they're visible from our 30,000-foot view.",
  "If anyone questions your roadmap, just ask: 'Does this move the needle on our North Star metric?'",
  "Coffee is for closers, but cold brew on tap is for people who know what 'circle back' actually means.",
  "Treat humans like Ethernet cables—keep the bandwidth high and the latency low!",
];

function getMushroomMotivationalMessage(isPIP: boolean, mistakes: number): {
  tagline: string;
  speech: string;
  subtext: string;
} {
  if (isPIP) {
    return {
      tagline: 'HR Remediation Averted',
      speech:
        'Mycelial network rebooted! You navigated the paper trail like a C-suite veteran. HR has officially incinerated your PIP warning!',
      subtext: 'Morale restored to 100%. Organizational synergy back in green status.',
    };
  }

  if (mistakes === 0) {
    const speechOptions = [
      'Flawless sprint! Zero dropped action items. The C-suite is whisper-networking about your promotion trajectory right now!',
      '100% velocity, zero revisions! My red cap is literally glowing with unbridled corporate synergy. You are an agile god!',
      'Impeccable execution! Brad from BizDev tried to poke holes in your deliverable and found literally nothing.',
      'Surgical precision! You sidestepped every passive-aggressive trap and delivered pure executive presence.',
    ];
    return {
      tagline: 'Flawless Velocity // 100% Accuracy',
      speech: speechOptions[Math.floor(Math.random() * speechOptions.length)],
      subtext: 'Flawless deliverable bonus unlocked: +20 XP awarded for immaculate stakeholder alignment.',
    };
  }

  if (mistakes <= 2) {
    const speechOptions = [
      'High-bandwidth performance! You adapted quickly, pivoted past bottlenecks, and brought cross-functional alignment back to the room.',
      'Deliverable shipped ahead of quarterly review! A couple of tactical pivots only made your stakeholder buy-in stronger.',
      'Outstanding iteration! Your corporate mycelium is expanding across departmental silos. Keep this momentum rolling!',
    ];
    return {
      tagline: 'Deliverable Shipped // High Velocity',
      speech: speechOptions[Math.floor(Math.random() * speechOptions.length)],
      subtext: 'Tactical pivots handled gracefully. Ready to circle back on the next sprint.',
    };
  }

  return {
    tagline: 'Sprint Completed // Agile Resilience',
    speech:
      'Resilience score: 10/10! You absorbed the scope creep, iterated through constructive feedback, and crossed the finish line like an agile champion.',
    subtext: 'Growth mindset confirmed: Every mistake is just an agile retrospective in disguise.',
  };
}

export const LessonScreen: React.FC<LessonScreenProps> = ({
  lessonTitle,
  unitTheme,
  initialExercises,
  isPIPLesson = false,
  onFinishLesson,
  onExit,
}) => {
  // Queue of remaining exercises (re-queues on mistake)
  const [queue, setQueue] = useState<Exercise[]>(() => [...initialExercises]);
  const [totalInitial] = useState(initialExercises.length);
  const [completedCount, setCompletedCount] = useState(0);
  const [mistakes, setMistakes] = useState(0);

  // Current question inputs
  const currentExercise = queue[0];

  // Word Bank state
  const [selectedTiles, setSelectedTiles] = useState<string[]>([]);
  const [availableTiles, setAvailableTiles] = useState<string[]>([]);
  const [lockedTileCount, setLockedTileCount] = useState(0); // number of tiles locked from the left

  // Typed input state
  const [typedInput, setTypedInput] = useState('');
  const [lockedIdeas, setLockedIdeas] = useState<string[]>([]);

  // Partial match banner
  const [partialNotice, setPartialNotice] = useState<string | null>(null);

  // Match state
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]); // indexes of matched left items
  const [shuffledRight, setShuffledRight] = useState<{ originalIndex: number; text: string }[]>([]);

  // Context question state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Feedback Sheet state
  const [feedback, setFeedback] = useState<{
    show: boolean;
    passed: boolean;
    model: string;
    snark?: string;
    ideaResult?: IdeaCheckResult;
    why?: string;
    isSatiricalBonus?: boolean;
  } | null>(null);

  const [isCompleted, setIsCompleted] = useState(false);
  const [mushroomQuoteIndex, setMushroomQuoteIndex] = useState(0);
  const textInputRef = useRef<HTMLInputElement>(null);

  // Initialize state when current question changes
  useEffect(() => {
    if (!currentExercise) return;

    setLockedTileCount(0);
    setLockedIdeas([]);
    setPartialNotice(null);

    if (currentExercise.type === 'translate') {
      const tr = currentExercise as TranslateExercise;
      if (tr.mode === 'wordbank') {
        setSelectedTiles([]);
        setAvailableTiles(tr.tiles ? [...tr.tiles] : []);
      } else {
        setTypedInput('');
        setTimeout(() => textInputRef.current?.focus(), 100);
      }
    } else if (currentExercise.type === 'match') {
      setSelectedLeft(null);
      setMatchedPairs([]);
      const rightItems = (currentExercise as MatchExercise).pairs.map((p, idx) => ({
        originalIndex: idx,
        text: p[1],
      }));
      setShuffledRight(rightItems.sort(() => Math.random() - 0.5));
    } else if (currentExercise.type === 'context') {
      setSelectedOption(null);
    }

    setFeedback(null);
  }, [currentExercise]);

  // Global keyboard shortcuts (Enter to check/continue, 1-4 for context options)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (feedback?.show) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleContinue();
        }
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        handleCheckAnswer();
      } else if (currentExercise?.type === 'context') {
        if (['1', '2', '3', '4'].includes(e.key)) {
          const optIdx = parseInt(e.key, 10) - 1;
          const ctx = currentExercise as ContextExercise;
          if (optIdx < ctx.options.length) {
            setSelectedOption(optIdx);
            sound.playClick();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [feedback, currentExercise, selectedTiles, typedInput, selectedOption, matchedPairs]);

  // Word Bank tile selection
  const handleSelectTile = (tile: string, index: number) => {
    sound.playClick();
    setSelectedTiles((prev) => [...prev, tile]);
    setAvailableTiles((prev) => prev.filter((_, i) => i !== index));
    setPartialNotice(null);
  };

  // Word Bank tile deselection (only unlocked tiles can be removed)
  const handleDeselectTile = (tile: string, index: number) => {
    if (index < lockedTileCount) {
      // Locked tile cannot be removed!
      sound.playClick();
      return;
    }
    sound.playClick();
    setSelectedTiles((prev) => prev.filter((_, i) => i !== index));
    setAvailableTiles((prev) => [...prev, tile]);
    setPartialNotice(null);
  };

  // Match item click
  const handleLeftClick = (index: number) => {
    if (matchedPairs.includes(index)) return;
    sound.playClick();
    setSelectedLeft(index);
  };

  const handleRightClick = (originalIndex: number) => {
    if (selectedLeft === null) return;
    if (matchedPairs.includes(selectedLeft)) return;

    if (selectedLeft === originalIndex) {
      // Matched!
      sound.playCorrect();
      setMatchedPairs((prev) => [...prev, selectedLeft]);
      setSelectedLeft(null);
    } else {
      // Wrong match
      sound.playWrong();
      setSelectedLeft(null);
    }
  };

  // Check Answer Handler
  const handleCheckAnswer = () => {
    if (!currentExercise || feedback?.show) return;

    let passed = false;
    let isPartialMatch = false;
    let model = '';
    let snark = '';
    let why = '';
    let ideaResult: IdeaCheckResult | undefined;
    let isSatiricalBonus = false;

    if (currentExercise.type === 'translate') {
      const tr = currentExercise as TranslateExercise;
      model = tr.model;
      snark = tr.snark;

      if (tr.mode === 'wordbank') {
        if (selectedTiles.length === 0) return;

        // Evaluate with advanced partial prefix locking
        const wbResult = checkWordBankAnswerAdvanced(
          selectedTiles,
          tr.accepted,
          tr.acceptedAlternatives,
          tr.model
        );

        if (wbResult.passed) {
          passed = true;
          setLockedTileCount(selectedTiles.length);
        } else if (wbResult.isPartial) {
          // PARTIAL MATCH: Lock correct prefix tiles! Allow correcting the rest!
          isPartialMatch = true;
          const newLockedCount = wbResult.longestPrefixLength;
          setLockedTileCount(newLockedCount);

          // Return wrong tiles to available pool
          const wrongTiles = selectedTiles.slice(newLockedCount);
          setAvailableTiles((prev) => [...prev, ...wrongTiles]);
          setSelectedTiles(selectedTiles.slice(0, newLockedCount));

          const lockedWords = selectedTiles.slice(0, newLockedCount).join(' ');
          setPartialNotice(
            `🔒 Part of your translation is correct! We locked "${lockedWords}". Now pick the remaining words to finish!`
          );
          sound.playCorrect();
          return; // Do not fail or deduct morale!
        }
      } else {
        // Typed Mode
        if (!typedInput.trim()) return;
        ideaResult = checkTypedAnswer(
          typedInput,
          tr.ideas,
          tr.needed,
          tr.ideaLabels,
          tr.acceptedAlternatives
        );

        if (ideaResult.passed) {
          passed = true;
          isSatiricalBonus = !!ideaResult.isSatiricalBonus;
        } else if (ideaResult.isPartial) {
          // PARTIAL MATCH: Lock matched ideas!
          isPartialMatch = true;
          setLockedIdeas(ideaResult.matchedIdeas);
          setPartialNotice(
            `🔒 Part 1 recognized: [${ideaResult.matchedIdeas.join(', ')}]. Now add what they actually plan to do (e.g. ${ideaResult.missedIdeas.join(' or ')}) to complete the translation!`
          );
          sound.playCorrect();
          return; // Do not fail or deduct morale!
        }
      }
    } else if (currentExercise.type === 'match') {
      const m = currentExercise as MatchExercise;
      if (matchedPairs.length !== m.pairs.length) return;
      passed = true;
      model = 'All corporate euphemisms successfully mapped.';
      snark = 'Notice how much shorter the plain translations are than the jargon!';
    } else if (currentExercise.type === 'context') {
      if (selectedOption === null) return;
      const ctx = currentExercise as ContextExercise;
      passed = selectedOption === ctx.answer;
      model = ctx.options[ctx.answer];
      why = ctx.why;
    }

    if (passed) {
      sound.playCorrect();
    } else if (!isPartialMatch) {
      sound.playWrong();
      setMistakes((prev) => prev + 1);
      // Cost 1 morale point (unless PIP lesson where morale loss is exempted)
      if (!isPIPLesson) {
        store.deductMorale();
      }
    }

    setFeedback({
      show: true,
      passed,
      model,
      snark,
      ideaResult,
      why,
      isSatiricalBonus,
    });
  };

  // Continue to next question or re-queue
  const handleContinue = () => {
    sound.playClick();
    const wasPassed = feedback?.passed;

    if (wasPassed) {
      setCompletedCount((prev) => prev + 1);
      const remaining = queue.slice(1);
      if (remaining.length === 0) {
        // All completed!
        finishLesson();
      } else {
        setQueue(remaining);
      }
    } else {
      // Re-queue the failed question at the end of the lesson (Section 4.1 Rule 6)
      const failed = queue[0];
      const remaining = [...queue.slice(1), failed];
      setQueue(remaining);
    }

    setFeedback(null);
  };

  const finishLesson = () => {
    setIsCompleted(true);
    sound.playFanfare();
    try {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
  };

  // Progress percentage calculation
  const progressPercent = Math.min(
    100,
    Math.round((completedCount / Math.max(1, totalInitial)) * 100)
  );

  // Lesson Complete Celebration Screen
  if (isCompleted) {
    const basePoints = totalInitial * 10;
    const bonus = mistakes === 0 ? 20 : 0;
    const totalXp = basePoints + bonus;
    const motivation = getMushroomMotivationalMessage(isPIPLesson, mistakes);
    const displayedSpeech =
      mushroomQuoteIndex > 0
        ? EXTRA_MUSHROOM_QUOTES[(mushroomQuoteIndex - 1) % EXTRA_MUSHROOM_QUOTES.length]
        : motivation.speech;

    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 sm:p-8 text-center shadow-2xl space-y-6 animate-pop-in transition-colors">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs uppercase tracking-wider">
            <Sparkles size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span>{motivation.tagline}</span>
          </div>

          {/* Mushroom Mascot with Motivational Speech Bubble */}
          <div className="py-1 flex justify-center">
            <MascotMushroom
              mood="thriving"
              size="lg"
              speechText={displayedSpeech}
              interactive={true}
              onTap={() => {
                setMushroomQuoteIndex((i) => i + 1);
                sound.playClick();
              }}
            />
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {isPIPLesson ? 'PIP Remediation Passed!' : 'Lesson Complete!'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium leading-relaxed max-w-sm mx-auto">
              {motivation.subtext}
            </p>
          </div>

          {/* Reward Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4">
              <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase">
                <Sparkles size={14} /> Total XP
              </div>
              <p className="text-3xl font-black text-emerald-800 dark:text-emerald-200 mt-1">+{totalXp}</p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
              <div className="flex items-center justify-center gap-1 text-amber-600 dark:text-amber-400 font-black text-xs uppercase">
                Mistakes
              </div>
              <p className="text-3xl font-black text-amber-800 dark:text-amber-200 mt-1">{mistakes}</p>
            </div>
          </div>

          {bonus > 0 && (
            <div className="bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-950/60 dark:to-amber-900/40 border border-amber-300 dark:border-amber-800 rounded-2xl p-3 text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center justify-center gap-2">
              <span>🌟 Flawless Deliverable Bonus: +20 XP (Zero Action Items Dropped!)</span>
            </div>
          )}

          <ClickSpark sparkColor="#10b981" sparkRadius={36} sparkCount={14} className="w-full">
            <button
              onClick={() => onFinishLesson(totalXp, mistakes)}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 active:translate-y-0.5 border-b-4 border-emerald-800 text-white font-black text-base rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Claim XP & Circle Back</span>
              <ArrowRight size={20} />
            </button>
          </ClickSpark>
        </div>
      </div>
    );
  }

  const snapshot = store.getSnapshot();

  return (
    <div className="min-h-screen flex flex-col justify-between max-w-3xl mx-auto px-4 py-6 text-slate-900 dark:text-slate-100">
      {/* Header Bar */}
      <header className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={onExit}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Exit lesson"
        >
          <X size={24} />
        </button>

        {/* Lesson Progress Bar */}
        <div className="flex-1 bg-slate-200 dark:bg-slate-800 h-3.5 rounded-full overflow-hidden p-0.5">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Morale counter in lesson */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900">
          <Heart size={18} className="fill-rose-500 text-rose-500" />
          <span className="font-black text-xs text-rose-700 dark:text-rose-300">
            {isPIPLesson ? '∞' : snapshot.morale}
          </span>
        </div>
      </header>

      {/* Main Exercise View */}
      <main className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full py-4">
        {currentExercise.type === 'translate' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <span>{unitTheme}</span>
              <span>•</span>
              <span>{lessonTitle}</span>
            </div>

            {/* Corporate Message Card */}
            {(() => {
              const tr = currentExercise as TranslateExercise;
              return (
                <SpotlightCard className="p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs">
                        {tr.channel === 'email' ? <Mail size={16} /> : tr.channel === 'slack' ? <MessageSquare size={16} /> : <Users size={16} />}
                      </div>
                      <div>
                        <p className="font-extrabold text-xs text-slate-800 dark:text-slate-200">{tr.sender}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">{tr.channel}</p>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      Corporate Speak
                    </span>
                  </div>

                  <div>
                    <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 leading-snug tracking-tight">
                      "{tr.text}"
                    </p>
                  </div>
                </SpotlightCard>
              );
            })()}

            {/* Partial Match Locking Banner */}
            {partialNotice && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border-2 border-emerald-400 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-start gap-2.5 animate-pop-in font-mono">
                <Lock size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed font-sans">
                  {partialNotice}
                </div>
              </div>
            )}

            {/* Interaction: Word Bank or Typed */}
            {(currentExercise as TranslateExercise).mode === 'wordbank' ? (
              <div className="space-y-6">
                {/* Sentence Assembling Tray */}
                <div className="min-h-[76px] p-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-900/60 flex flex-wrap gap-2 items-center">
                  {selectedTiles.length === 0 ? (
                    <span className="text-slate-400 dark:text-slate-500 text-xs italic ml-2">
                      Tap tiles below to build the plain English translation...
                    </span>
                  ) : (
                    selectedTiles.map((tile, i) => {
                      const isLocked = i < lockedTileCount;
                      if (isLocked) {
                        return (
                          <div
                            key={`${tile}-${i}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-950 dark:text-emerald-200 font-extrabold text-xs sm:text-sm rounded-xl border border-emerald-500 dark:border-emerald-600 shadow-xs select-none font-mono"
                            title="Locked as correct! You can now finish the rest of the sentence."
                          >
                            <Lock size={13} className="text-emerald-700 dark:text-emerald-400" />
                            <span>{tile}</span>
                          </div>
                        );
                      }
                      return (
                        <button
                          key={`${tile}-${i}`}
                          onClick={() => handleDeselectTile(tile, i)}
                          className="px-3.5 py-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 border-b-[3px] border-b-slate-300 dark:border-b-slate-900 shadow-xs hover:border-slate-300 dark:hover:border-slate-600 active:translate-y-[2px] active:border-b-[1px] transition-all cursor-pointer animate-pop-in select-none"
                        >
                          {tile}
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Available Tiles Pool (Teenage Engineering OP-1 Mechanical Keycaps) */}
                <div className="flex flex-wrap gap-2.5 justify-center">
                  {availableTiles.map((tile, i) => (
                    <button
                      key={`${tile}-${i}`}
                      onClick={() => handleSelectTile(tile, i)}
                      className="px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 border-b-[3.5px] border-b-slate-300 dark:border-b-slate-950 hover:border-slate-300 dark:hover:border-slate-600 active:translate-y-[2px] active:border-b-[1px] shadow-xs transition-all cursor-pointer select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                      {tile}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Typed Mode */
              <div className="space-y-3">
                {lockedIdeas.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800">
                    <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                      <Lock size={14} /> Locked Ideas:
                    </span>
                    {lockedIdeas.map((idea) => (
                      <span
                        key={idea}
                        className="px-2.5 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 text-xs font-bold"
                      >
                        ✓ {idea}
                      </span>
                    ))}
                  </div>
                )}

                <div className="relative">
                  <input
                    ref={textInputRef}
                    type="text"
                    value={typedInput}
                    onChange={(e) => {
                      setTypedInput(e.target.value);
                      setPartialNotice(null);
                    }}
                    placeholder="Type what this actually means in plain English..."
                    className="w-full px-5 py-4 rounded-2xl border-2 border-slate-300 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-hidden text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 shadow-xs transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md">
                    <span>Press</span> <CornerDownLeft size={12} />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                  <span className="flex items-center gap-1">
                    <Smile size={14} className="text-amber-500" /> Multiple plain & satirical interpretations accepted
                  </span>
                  <span>Checked by Idea Matcher</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Exercise: Match Pairs */}
        {currentExercise.type === 'match' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <span>{unitTheme}</span>
              <span>•</span>
              <span>Match Pairs: Corporate Speak &harr; Plain English</span>
            </div>

            {(() => {
              const m = currentExercise as MatchExercise;
              return (
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {/* Left Column: Corporate Phrases */}
                  <div className="space-y-2.5">
                    {m.pairs.map((pair, idx) => {
                      const isMatched = matchedPairs.includes(idx);
                      const isSelected = selectedLeft === idx;
                      return (
                        <button
                          key={pair[0]}
                          onClick={() => handleLeftClick(idx)}
                          disabled={isMatched}
                          className={`w-full p-3.5 rounded-2xl text-left font-black text-xs sm:text-sm border-2 transition-all cursor-pointer ${
                            isMatched
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 opacity-60 cursor-default'
                              : isSelected
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-500 shadow-md ring-2 ring-blue-300 dark:ring-blue-700'
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-xs'
                          }`}
                        >
                          {pair[0]}
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Column: Plain Meanings */}
                  <div className="space-y-2.5">
                    {shuffledRight.map((item) => {
                      const isMatched = matchedPairs.includes(item.originalIndex);
                      return (
                        <button
                          key={item.text}
                          onClick={() => handleRightClick(item.originalIndex)}
                          disabled={isMatched}
                          className={`w-full p-3.5 rounded-2xl text-left font-medium text-xs sm:text-sm border-2 transition-all cursor-pointer ${
                            isMatched
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 opacity-60 cursor-default'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-xs'
                          }`}
                        >
                          {item.text}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Exercise: Context Scenario */}
        {currentExercise.type === 'context' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <span>{unitTheme}</span>
              <span>•</span>
              <span>Context Analysis</span>
            </div>

            {(() => {
              const ctx = currentExercise as ContextExercise;
              return (
                <div className="space-y-5">
                  {/* Email message mockup */}
                  <SpotlightCard
                    spotlightColor="rgba(245, 158, 11, 0.12)"
                    className="p-5 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
                      <div>
                        <p className="font-extrabold text-xs text-slate-900 dark:text-slate-100">{ctx.sender}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{ctx.senderRole}</p>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                        {ctx.subject ? 'Email' : 'Chat'}
                      </span>
                    </div>
                    {ctx.subject && (
                      <p className="text-xs font-black text-slate-700 dark:text-slate-300">Subject: {ctx.subject}</p>
                    )}
                    <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 leading-relaxed italic bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                      "{ctx.email}"
                    </p>
                  </SpotlightCard>

                  <p className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                    What does the sender <span className="underline decoration-amber-500">actually</span> want?
                  </p>

                  {/* Options */}
                  <div className="space-y-2.5">
                    {ctx.options.map((opt, idx) => {
                      const isSelected = selectedOption === idx;
                      return (
                        <button
                          key={opt}
                          onClick={() => {
                            sound.playClick();
                            setSelectedOption(idx);
                          }}
                          className={`w-full p-4 rounded-2xl text-left flex items-start gap-3 border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border-emerald-500 shadow-md ring-2 ring-emerald-200 dark:ring-emerald-800'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-xs'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="text-xs sm:text-sm font-bold leading-snug">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </main>

      {/* Bottom Action Footer (Before Check) */}
      {!feedback?.show && (
        <footer className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 dark:text-slate-500 hidden sm:block">
            {currentExercise.type === 'context'
              ? 'Press 1-4 to select, Enter to check'
              : 'Press Enter to submit'}
          </div>

          <ClickSpark sparkColor="#10b981" sparkRadius={36} sparkCount={12} className="w-full sm:w-auto ml-auto">
            <button
              onClick={handleCheckAnswer}
              disabled={
                (currentExercise.type === 'translate' &&
                  (currentExercise as TranslateExercise).mode === 'wordbank' &&
                  selectedTiles.length === 0) ||
                (currentExercise.type === 'translate' &&
                  (currentExercise as TranslateExercise).mode === 'typed' &&
                  !typedInput.trim()) ||
                (currentExercise.type === 'context' && selectedOption === null) ||
                (currentExercise.type === 'match' &&
                  matchedPairs.length !== (currentExercise as MatchExercise).pairs.length)
              }
              className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:border-transparent active:translate-y-0.5 border-b-4 border-emerald-800 text-white font-black text-sm rounded-2xl shadow-sm transition-all cursor-pointer disabled:cursor-not-allowed focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              Check Answer
            </button>
          </ClickSpark>
        </footer>
      )}

      {/* Slide-Up Feedback Bottom Sheet */}
      {feedback?.show && (
        <div
          className={`fixed inset-x-0 bottom-0 z-40 p-5 sm:p-6 shadow-2xl transition-all border-t-4 animate-pop-in ${
            feedback.passed
              ? 'bg-emerald-50 dark:bg-slate-900 border-emerald-500 text-emerald-950 dark:text-emerald-100'
              : 'bg-rose-50 dark:bg-slate-900 border-rose-500 text-rose-950 dark:text-rose-100'
          }`}
        >
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                {feedback.passed ? (
                  <>
                    <CheckCircle2 size={24} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <h3 className="text-lg font-black text-emerald-800 dark:text-emerald-300">
                      {feedback.isSatiricalBonus
                        ? '🔥 Satirical Genius! Perfectly decoded the corporate subtext.'
                        : 'Synergistic! You nailed it.'}
                    </h3>
                  </>
                ) : (
                  <>
                    <AlertCircle size={24} className="text-rose-600 dark:text-rose-400 shrink-0" />
                    <h3 className="text-lg font-black text-rose-800 dark:text-rose-300">
                      Needs Alignment! Question re-queued.
                    </h3>
                  </>
                )}
              </div>

              {/* Model Translation */}
              <div className="text-xs sm:text-sm font-semibold">
                <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide text-[10px] block font-mono">
                  Plain English Model:
                </span>
                <span className="text-slate-800 dark:text-slate-200">{feedback.model}</span>
              </div>

              {/* Matched vs Missed Ideas (for Typed exercises) */}
              {feedback.ideaResult && (
                <div className="text-[11px] font-medium space-y-1 font-mono">
                  {feedback.ideaResult.matchedIdeas.length > 0 && (
                    <p className="text-emerald-700 dark:text-emerald-400">
                      ✓ Ideas matched: {feedback.ideaResult.matchedIdeas.join(', ')}
                    </p>
                  )}
                  {feedback.ideaResult.missedIdeas.length > 0 && (
                    <p className="text-rose-700 dark:text-rose-400">
                      ✗ Ideas missed: {feedback.ideaResult.missedIdeas.join(', ')}
                    </p>
                  )}
                </div>
              )}

              {/* Snark / Why people say this */}
              {(feedback.snark || feedback.why) && (
                <div className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  <Lightbulb size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <p>
                    <span className="font-bold text-slate-800 dark:text-slate-100">Why people talk this way: </span>
                    {feedback.snark || feedback.why}
                  </p>
                </div>
              )}
            </div>

            <ClickSpark sparkColor={feedback.passed ? "#10b981" : "#ef4444"} sparkRadius={36} sparkCount={12} className="w-full sm:w-auto">
              <button
                onClick={handleContinue}
                className={`w-full sm:w-auto px-8 py-3.5 text-white font-black text-sm rounded-2xl shadow-md border-b-4 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 ${
                  feedback.passed
                    ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-800'
                    : 'bg-rose-600 hover:bg-rose-500 border-rose-800'
                }`}
              >
                <span>Continue</span>
                <ArrowRight size={18} />
              </button>
            </ClickSpark>
          </div>
        </div>
      )}
    </div>
  );
};
