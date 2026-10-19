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
} from 'lucide-react';
import { Exercise, TranslateExercise, MatchExercise, ContextExercise } from '../types';
import { checkTypedAnswer, checkWordBankAnswer, IdeaCheckResult } from '../lib/checker';
import { store } from '../lib/store';
import { sound } from '../lib/sound';

interface LessonScreenProps {
  lessonTitle: string;
  unitTheme: string;
  initialExercises: Exercise[];
  isPIPLesson?: boolean;
  onFinishLesson: (earnedXp: number, mistakes: number) => void;
  onExit: () => void;
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

  // Typed input state
  const [typedInput, setTypedInput] = useState('');

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
  } | null>(null);

  const [isCompleted, setIsCompleted] = useState(false);
  const textInputRef = useRef<HTMLInputElement>(null);

  // Initialize state when current question changes
  useEffect(() => {
    if (!currentExercise) return;

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
      const m = currentExercise as MatchExercise;
      setSelectedLeft(null);
      setMatchedPairs([]);
      const rightItems = m.pairs.map((p, idx) => ({ originalIndex: idx, text: p[1] }));
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

  // Word Bank tile click
  const handleSelectTile = (tile: string, index: number) => {
    sound.playClick();
    setSelectedTiles((prev) => [...prev, tile]);
    setAvailableTiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeselectTile = (tile: string, index: number) => {
    sound.playClick();
    setSelectedTiles((prev) => prev.filter((_, i) => i !== index));
    setAvailableTiles((prev) => [...prev, tile]);
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
    let model = '';
    let snark = '';
    let why = '';
    let ideaResult: IdeaCheckResult | undefined;

    if (currentExercise.type === 'translate') {
      const tr = currentExercise as TranslateExercise;
      model = tr.model;
      snark = tr.snark;

      if (tr.mode === 'wordbank') {
        if (selectedTiles.length === 0) return;
        passed = checkWordBankAnswer(selectedTiles, tr.accepted, tr.model);
      } else {
        if (!typedInput.trim()) return;
        ideaResult = checkTypedAnswer(typedInput, tr.ideas, tr.needed, tr.ideaLabels);
        passed = ideaResult.passed;
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
    } else {
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

    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border-2 border-slate-200 max-w-md w-full p-8 text-center shadow-xl space-y-6 animate-pop-in">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-emerald-100 flex items-center justify-center text-5xl shadow-inner animate-bounce-short">
            🎉
          </div>

          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs uppercase tracking-wider mb-2">
              Deliverable Shipped
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {isPIPLesson ? 'PIP Remediation Passed!' : 'Lesson Complete!'}
            </h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              {isPIPLesson
                ? 'Your morale has been successfully restored to 5/5. HR is satisfied.'
                : 'Your organizational synergy metrics are on the rise.'}
            </p>
          </div>

          {/* Reward Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <div className="flex items-center justify-center gap-1 text-emerald-600 font-black text-xs uppercase">
                <Sparkles size={14} /> Total XP
              </div>
              <p className="text-3xl font-black text-emerald-800 mt-1">+{totalXp}</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-center justify-center gap-1 text-amber-600 font-black text-xs uppercase">
                Mistakes
              </div>
              <p className="text-3xl font-black text-amber-800 mt-1">{mistakes}</p>
            </div>
          </div>

          {bonus > 0 && (
            <div className="bg-gradient-to-r from-amber-100 to-amber-50 border border-amber-300 rounded-2xl p-3 text-xs font-bold text-amber-900 flex items-center justify-center gap-2">
              <span>🌟 Flawless Lesson Bonus: +20 XP (Zero Action Items Missed!)</span>
            </div>
          )}

          <button
            onClick={() => onFinishLesson(totalXp, mistakes)}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 active:translate-y-0.5 border-b-4 border-emerald-800 text-white font-black text-base rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Claim XP & Circle Back</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  const snapshot = store.getSnapshot();

  return (
    <div className="min-h-screen flex flex-col justify-between max-w-3xl mx-auto px-4 py-6">
      {/* Header Bar */}
      <header className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={onExit}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Exit lesson"
        >
          <X size={24} />
        </button>

        {/* Lesson Progress Bar */}
        <div className="flex-1 bg-slate-200 h-3.5 rounded-full overflow-hidden p-0.5">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Morale counter in lesson */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200">
          <Heart size={18} className="fill-rose-500 text-rose-500" />
          <span className="font-black text-xs text-rose-700">
            {isPIPLesson ? '∞' : snapshot.morale}
          </span>
        </div>
      </header>

      {/* Main Exercise View */}
      <main className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full py-4">
        {currentExercise.type === 'translate' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>{unitTheme}</span>
              <span>•</span>
              <span>{lessonTitle}</span>
            </div>

            {/* Corporate Message Card */}
            {(() => {
              const tr = currentExercise as TranslateExercise;
              return (
                <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                        {tr.channel === 'email' ? <Mail size={16} /> : tr.channel === 'slack' ? <MessageSquare size={16} /> : <Users size={16} />}
                      </div>
                      <div>
                        <p className="font-extrabold text-xs text-slate-800">{tr.sender}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">{tr.channel}</p>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      Corporate Speak
                    </span>
                  </div>

                  <p className="text-xl sm:text-2xl font-black text-slate-800 leading-snug">
                    "{tr.text}"
                  </p>
                </div>
              );
            })()}

            {/* Interaction: Word Bank or Typed */}
            {(currentExercise as TranslateExercise).mode === 'wordbank' ? (
              <div className="space-y-6">
                {/* Sentence Assembling Tray */}
                <div className="min-h-[70px] p-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-100/60 flex flex-wrap gap-2 items-center">
                  {selectedTiles.length === 0 ? (
                    <span className="text-slate-400 text-xs italic ml-2">
                      Tap tiles below to build the plain English translation...
                    </span>
                  ) : (
                    selectedTiles.map((tile, i) => (
                      <button
                        key={`${tile}-${i}`}
                        onClick={() => handleDeselectTile(tile, i)}
                        className="px-3.5 py-2 bg-white text-slate-800 font-bold text-sm rounded-xl border-b-2 border-slate-300 shadow-xs hover:border-slate-400 active:translate-y-0.5 transition-all cursor-pointer animate-pop-in"
                      >
                        {tile}
                      </button>
                    ))
                  )}
                </div>

                {/* Available Tiles Pool */}
                <div className="flex flex-wrap gap-2.5 justify-center">
                  {availableTiles.map((tile, i) => (
                    <button
                      key={`${tile}-${i}`}
                      onClick={() => handleSelectTile(tile, i)}
                      className="px-4 py-2.5 bg-white text-slate-800 font-bold text-sm sm:text-base rounded-2xl border-2 border-slate-200 border-b-4 hover:border-slate-300 active:translate-y-1 shadow-sm transition-all cursor-pointer"
                    >
                      {tile}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Typed Mode */
              <div className="space-y-3">
                <div className="relative">
                  <input
                    ref={textInputRef}
                    type="text"
                    value={typedInput}
                    onChange={(e) => setTypedInput(e.target.value)}
                    placeholder="Type what this actually means in plain English..."
                    className="w-full px-5 py-4 rounded-2xl border-2 border-slate-300 focus:border-emerald-500 focus:outline-hidden text-base sm:text-lg font-bold text-slate-800 bg-white shadow-xs transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                    <span>Press</span> <CornerDownLeft size={12} />
                  </div>
                </div>
                <p className="text-xs text-slate-400 text-right">
                  Checked by Idea Matcher (meaning & synonyms, not exact spelling)
                </p>
              </div>
            )}
          </div>
        )}

        {/* Exercise: Match Pairs */}
        {currentExercise.type === 'match' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
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
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 opacity-60 cursor-default'
                              : isSelected
                              ? 'bg-blue-50 text-blue-800 border-blue-500 shadow-md ring-2 ring-blue-300'
                              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 shadow-xs'
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
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 opacity-60 cursor-default'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 shadow-xs'
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
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>{unitTheme}</span>
              <span>•</span>
              <span>Context Analysis</span>
            </div>

            {(() => {
              const ctx = currentExercise as ContextExercise;
              return (
                <div className="space-y-5">
                  {/* Email message mockup */}
                  <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div>
                        <p className="font-extrabold text-xs text-slate-900">{ctx.sender}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{ctx.senderRole}</p>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        {ctx.subject ? 'Email' : 'Chat'}
                      </span>
                    </div>
                    {ctx.subject && (
                      <p className="text-xs font-black text-slate-700">Subject: {ctx.subject}</p>
                    )}
                    <p className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                      "{ctx.email}"
                    </p>
                  </div>

                  <p className="font-extrabold text-sm text-slate-800">
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
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-500 shadow-md ring-2 ring-emerald-200'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 shadow-xs'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-600'
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
        <footer className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-400 hidden sm:block">
            {currentExercise.type === 'context'
              ? 'Press 1-4 to select, Enter to check'
              : 'Press Enter to submit'}
          </div>

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
            className="w-full sm:w-auto ml-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 disabled:text-slate-400 disabled:border-transparent active:translate-y-0.5 border-b-4 border-emerald-800 text-white font-black text-sm rounded-2xl shadow-sm transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            Check Answer
          </button>
        </footer>
      )}

      {/* Slide-Up Feedback Bottom Sheet */}
      {feedback?.show && (
        <div
          className={`fixed inset-x-0 bottom-0 z-40 p-5 sm:p-6 shadow-2xl transition-all border-t-4 animate-pop-in ${
            feedback.passed
              ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
              : 'bg-rose-50 border-rose-500 text-rose-950'
          }`}
        >
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                {feedback.passed ? (
                  <>
                    <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
                    <h3 className="text-lg font-black text-emerald-800">
                      Synergistic! You nailed it.
                    </h3>
                  </>
                ) : (
                  <>
                    <AlertCircle size={24} className="text-rose-600 shrink-0" />
                    <h3 className="text-lg font-black text-rose-800">
                      Needs Alignment! Question re-queued.
                    </h3>
                  </>
                )}
              </div>

              {/* Model Translation */}
              <div className="text-xs sm:text-sm font-semibold">
                <span className="font-bold text-slate-500 uppercase tracking-wide text-[10px] block">
                  Plain English Model:
                </span>
                <span>{feedback.model}</span>
              </div>

              {/* Matched vs Missed Ideas (for Typed exercises) */}
              {feedback.ideaResult && (
                <div className="text-[11px] font-medium space-y-1">
                  {feedback.ideaResult.matchedIdeas.length > 0 && (
                    <p className="text-emerald-700">
                      ✓ Ideas matched: {feedback.ideaResult.matchedIdeas.join(', ')}
                    </p>
                  )}
                  {feedback.ideaResult.missedIdeas.length > 0 && (
                    <p className="text-rose-700">
                      ✗ Ideas missed: {feedback.ideaResult.missedIdeas.join(', ')}
                    </p>
                  )}
                </div>
              )}

              {/* Snark / Why people say this */}
              {(feedback.snark || feedback.why) && (
                <div className="flex items-start gap-1.5 text-xs text-slate-600 bg-white/70 p-2.5 rounded-xl border border-slate-200/60">
                  <Lightbulb size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <p>
                    <span className="font-bold text-slate-800">Why people talk this way: </span>
                    {feedback.snark || feedback.why}
                  </p>
                </div>
              )}
            </div>

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
          </div>
        </div>
      )}
    </div>
  );
};
