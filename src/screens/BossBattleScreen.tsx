import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Zap,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { BossExercise } from '../types';
import { scoreCorporateText, MeterResult } from '../lib/meter';
import { sound } from '../lib/sound';
import { SpotlightCard } from '../components/SpotlightCard';
import { BorderBeam } from '../components/BorderBeam';

interface BossBattleScreenProps {
  boss: BossExercise;
  targetPhrases: string[];
  onFinishBoss: (earnedXp: number) => void;
  onExit: () => void;
}

export const BossBattleScreen: React.FC<BossBattleScreenProps> = ({
  boss,
  targetPhrases,
  onFinishBoss,
  onExit,
}) => {
  const [inputText, setInputText] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [hasEvaluated, setHasEvaluated] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  // Live Jargon Meter evaluation as user types!
  const meterResult: MeterResult = useMemo(() => {
    return scoreCorporateText(
      inputText,
      targetPhrases,
      boss.bannedWords,
      boss.minPhrases,
      boss.passScore,
      15
    );
  }, [inputText, targetPhrases, boss]);

  const handleSubmit = () => {
    setHasEvaluated(true);
    if (meterResult.passed) {
      setIsVictory(true);
      sound.playFanfare();
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.55 },
        });
      } catch {
        // ignore
      }
    } else {
      sound.playWrong();
    }
  };

  // Victory view
  if (isVictory) {
    const earnedXp = 80;

    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border-4 border-amber-400 max-w-lg w-full p-8 text-center shadow-2xl space-y-6 animate-pop-in transition-colors">
          <BorderBeam size={260} duration={5} borderWidth={3} colorFrom="#f59e0b" colorTo="#10b981" />
          <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-rose-400 flex items-center justify-center text-5xl shadow-lg animate-bounce-short text-white">
            👑
          </div>

          <div>
            <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-black text-xs uppercase tracking-wider">
              Boss Battle Cleared!
            </span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
              Jargon Mastery Achieved
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium">
              You converted human authenticity into impenetrable corporate strategy with a Jargon Meter score of{' '}
              <strong className="text-emerald-700 dark:text-emerald-400 font-extrabold">{meterResult.score}/100</strong>!
            </p>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 flex items-center justify-center gap-3">
            <Sparkles size={24} className="text-emerald-600 dark:text-emerald-400" />
            <div className="text-left">
              <span className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400">Executive Reward</span>
              <p className="text-2xl font-black text-emerald-800 dark:text-emerald-200">+{earnedXp} XP</p>
            </div>
          </div>

          <button
            onClick={() => onFinishBoss(earnedXp)}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:translate-y-0.5 border-b-4 border-emerald-800 text-white font-black text-base rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Claim Glory & Return to Path</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between max-w-3xl mx-auto px-4 py-6 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="flex items-center justify-between gap-4 mb-4">
        <button
          onClick={onExit}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Exit Boss Battle"
        >
          <X size={24} />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-xs">
            <Zap size={18} />
          </div>
          <div>
            <h2 className="font-black text-sm text-slate-900 dark:text-white leading-tight">
              Unit {boss.unitId} Boss Battle
            </h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              Reverse Translation Challenge
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowHint((h) => !h)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
            showHint
              ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
          title="Toggle buzzword hints"
        >
          <HelpCircle size={16} />
          <span>Hints</span>
        </button>
      </header>

      {/* Main Boss Content */}
      <main className="space-y-6 flex-1 py-2">
        {/* Situation / Prompt Card */}
        <SpotlightCard
          spotlightColor="rgba(244, 63, 94, 0.12)"
          className="p-6 shadow-sm space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
              The Workplace Crisis
            </span>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Target Score: {boss.passScore}+</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
            {boss.title}
          </h3>
          <p className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
            {boss.prompt}
          </p>

          {/* Rules / Banned words */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-500 dark:text-slate-400">Banned Plain Words:</span>
            {boss.bannedWords.map((word) => (
              <span
                key={word}
                className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-mono font-bold"
              >
                "{word}"
              </span>
            ))}
          </div>
        </SpotlightCard>

        {/* Hint Sheet */}
        {showHint && (
          <div className="bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-200 dark:border-amber-800 rounded-2xl p-4 text-xs text-amber-900 dark:text-amber-200 space-y-1.5 animate-pop-in">
            <p className="font-extrabold flex items-center gap-1.5">
              💡 Corporate Cheat Sheet:
            </p>
            <p className="leading-relaxed">{boss.hint}</p>
          </div>
        )}

        {/* Jargon Meter Live Dashboard */}
        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.14)"
          className="p-5 shadow-sm space-y-4"
        >
          {meterResult.score >= boss.passScore && (
            <BorderBeam size={220} duration={4} borderWidth={3} colorFrom="#10b981" colorTo="#06b6d4" />
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap
                size={20}
                className={
                  meterResult.score >= boss.passScore
                    ? 'text-emerald-500 fill-emerald-500 animate-pulse'
                    : 'text-amber-500'
                }
              />
              <span className="font-black text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                Live Jargon Meter
              </span>
            </div>

            {/* Score Pill */}
            <div
              className={`px-3 py-1 rounded-xl font-black text-sm border ${
                meterResult.score >= boss.passScore
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  : meterResult.score >= 40
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
              }`}
            >
              Score: {meterResult.score} / 100
            </div>
          </div>

          {/* Visual Gauge Bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-4 rounded-full overflow-hidden p-0.5 relative">
            {/* Target 60% Marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-slate-400 dark:bg-slate-300 z-10"
              style={{ left: `${boss.passScore}%` }}
              title={`Pass threshold: ${boss.passScore}`}
            />
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                meterResult.score >= boss.passScore
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : meterResult.score >= 40
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                  : 'bg-gradient-to-r from-rose-400 to-rose-500'
              }`}
              style={{ width: `${meterResult.score}%` }}
            />
          </div>

          {/* Live Diagnostic Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {/* Word Count */}
            <div
              className={`p-2.5 rounded-xl border font-bold flex items-center justify-between ${
                meterResult.cappedByLength
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              }`}
            >
              <span>Length (Min 15):</span>
              <span className="font-black">{meterResult.wordCount} words</span>
            </div>

            {/* Jargon Phrases */}
            <div
              className={`p-2.5 rounded-xl border font-bold flex items-center justify-between ${
                meterResult.phrasesNeededMet
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
              }`}
            >
              <span>Phrases (Min {boss.minPhrases}):</span>
              <span className="font-black">{meterResult.phrasesFound.length} found</span>
            </div>

            {/* Banned Words */}
            <div
              className={`p-2.5 rounded-xl border font-bold flex items-center justify-between ${
                meterResult.bannedWordsHit.length > 0
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              }`}
            >
              <span>Banned Words:</span>
              <span className="font-black">{meterResult.bannedWordsHit.length} hits</span>
            </div>
          </div>

          {/* Detected Phrases Pills */}
          {meterResult.phrasesFound.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                Corporate Buzzwords Detected (+10 pts each):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {meterResult.phrasesFound.map((phrase) => (
                  <span
                    key={phrase}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 text-xs font-bold border border-emerald-200 dark:border-emerald-800"
                  >
                    <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />
                    {phrase}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Banned Words Hit Pills */}
          {meterResult.bannedWordsHit.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-rose-500 dark:text-rose-400">
                Banned Plain Words Triggered (-15 pts each):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {meterResult.bannedWordsHit.map((word) => (
                  <span
                    key={word}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-200 text-xs font-bold border border-rose-200 dark:border-rose-800"
                  >
                    <AlertTriangle size={13} className="text-rose-600 dark:text-rose-400" />
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}
        </SpotlightCard>

        {/* Textarea for player to write corporate reply */}
        <div className="space-y-2">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Write your corporate-speak translation:
          </label>
          <textarea
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Craft your corporate response here using meeting jargon, passive aggression, or visionary platitudes..."
            className="w-full p-4 rounded-2xl border-2 border-slate-300 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 focus:outline-hidden text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 shadow-xs resize-none transition-all leading-relaxed"
          />
        </div>
      </main>

      {/* Action Footer */}
      <footer className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
        {hasEvaluated && !meterResult.passed && (
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-bold">
            <AlertTriangle size={16} />
            <span>
              {meterResult.cappedByLength
                ? 'Score capped at 40: write at least 15 words!'
                : meterResult.bannedWordsHit.length > 0
                ? 'Remove banned plain words to qualify!'
                : !meterResult.phrasesNeededMet
                ? `Include at least ${boss.minPhrases} corporate phrases!`
                : `Need ${boss.passScore} points to pass.`}
            </span>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!inputText.trim()}
          className="w-full sm:w-auto ml-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 disabled:opacity-40 disabled:cursor-not-allowed active:translate-y-0.5 border-b-4 border-rose-800 text-white font-black text-sm rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Zap size={18} />
          <span>Submit to Jargon Meter</span>
        </button>
      </footer>
    </div>
  );
};
