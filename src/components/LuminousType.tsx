import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Keyboard, RotateCcw, Zap } from 'lucide-react';
import { sound } from '../lib/sound';

interface LuminousTypeProps {
  phrases?: string[];
  className?: string;
}

const DEFAULT_CORPORATE_QUOTES = [
  "circle back and align our core competencies",
  "put this in the parking lot to unblock bandwidth",
  "take this offline before anyone asks for an agenda",
  "leverage high altitude synergies for Q4 deliverables",
  "move fast and break things without notifying compliance",
];
const TEST_DURATION_SECONDS = 30;

/**
 * LuminousType
 * Featuring interactive speed-typing telemetry and crisp monospace font.
 * Optimized for butter-smooth rendering with zero lag.
 */
export const LuminousType: React.FC<LuminousTypeProps> = ({
  phrases = DEFAULT_CORPORATE_QUOTES,
  className = '',
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  // A long repeating prompt lets the user keep typing for the whole timed run.
  const promptPhrases = Array.from({ length: 100 }, (_, index) => phrases[(quoteIndex + index) % phrases.length]);
  let promptOffset = 0;
  const promptLines = promptPhrases.map((phrase, index) => {
    const text = phrase + (index < promptPhrases.length - 1 ? ' ' : '');
    const line = { text, start: promptOffset };
    promptOffset += text.length;
    return line;
  });
  const targetText = promptLines.map((line) => line.text).join('');
  const [typedInput, setTypedInput] = useState('');
  const foundActivePhraseIndex = promptLines.findIndex((line) => typedInput.length < line.start + line.text.length);
  const activePhraseIndex = foundActivePhraseIndex === -1 ? promptLines.length - 1 : foundActivePhraseIndex;
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [wpm, setWpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(100);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (startTime === null || isFinished) return;
    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedSeconds(Math.min(elapsed, TEST_DURATION_SECONDS));
      if (elapsed >= TEST_DURATION_SECONDS) setIsFinished(true);
    };
    updateTimer();
    const interval = window.setInterval(updateTimer, 100);
    return () => window.clearInterval(interval);
  }, [startTime, isFinished]);

  // Reset state when quote index changes
  const handleReset = useCallback(() => {
    setTypedInput('');
    setStartTime(null);
    startTimeRef.current = null;
    setElapsedSeconds(0);
    setWpm(0);
    setAccuracy(100);
    setIsFinished(false);
    inputRef.current?.focus();
  }, []);

  const handleNextQuote = () => {
    sound.playClick();
    setQuoteIndex((prev) => prev + 1);
    handleReset();
  };

  // Keyboard typing handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (isFinished) return;

    if (startTimeRef.current === null) {
      const now = Date.now();
      startTimeRef.current = now;
      setStartTime(now);
    }

    setTypedInput(val);

    // Calculate accuracy
    let correct = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] === targetText[i]) correct++;
    }
    const acc = val.length > 0 ? Math.round((correct / val.length) * 100) : 100;
    setAccuracy(acc);

    // Calculate WPM
    const startedAt = startTimeRef.current;
    if (startedAt !== null) {
      const elapsedMinutes = Math.max((Date.now() - startedAt) / 60000, 1 / 60);
      const words = val.trim().length / 5;
      setWpm(Math.round(words / elapsedMinutes));
    }

    // Check completion
    if (val.length >= targetText.length) setIsFinished(true);
  };

  // Mouse tracker for ambient luminous highlight
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setMousePos(null);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => inputRef.current?.focus()}
      className={`relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 p-5 sm:p-6 shadow-sm select-none cursor-text ${className}`}
    >
      {/* Drifting Luminous Spotlight Glow via pure CSS */}
      <div className="pointer-events-none absolute -top-16 left-1/4 w-80 h-40 rounded-full blur-3xl opacity-20 dark:opacity-25 bg-amber-400 dark:bg-emerald-500 animate-pulse" />

      {/* Pointer Cursor Following Luminous Glow */}
      {mousePos && (
        <div
          className="pointer-events-none absolute w-48 h-48 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl opacity-25 dark:opacity-30 transition-opacity bg-amber-400 dark:bg-emerald-400"
          style={{
            left: mousePos.x,
            top: mousePos.y,
          }}
        />
      )}

      {/* Header Telemetry Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between pb-3.5 mb-4 border-b border-slate-100 dark:border-slate-800 text-[11px] font-mono">
        <div className="flex items-center gap-2">
          <Keyboard size={15} className="text-amber-500 dark:text-emerald-400 animate-pulse" />
          <span className="font-bold tracking-wider uppercase text-slate-800 dark:text-slate-200">
            Luminous Type // Interactive Telemetry
          </span>
          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            Speed Run
          </span>
        </div>

        {/* Real-time stats */}
        <div className="flex items-center gap-3 font-bold">
          <div className="flex items-center gap-1">
            <span className="text-slate-400">TIME:</span>
            <span className="text-slate-700 dark:text-slate-200">{String(Math.floor((TEST_DURATION_SECONDS - elapsedSeconds) / 60)).padStart(2, '0')}:{String((TEST_DURATION_SECONDS - elapsedSeconds) % 60).padStart(2, '0')}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-slate-400">WORDS:</span>
            <span className="text-slate-700 dark:text-slate-200">{typedInput.trim() ? typedInput.trim().split(/\s+/).filter((word) => word.length > 0).length : 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-slate-400">WPM:</span>
            <span className="text-amber-600 dark:text-emerald-400 text-sm font-black">
              {wpm}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-400">ACC:</span>
            <span className={`font-black ${accuracy >= 90 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
              {accuracy}%
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNextQuote();
            }}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            title="Next Corporate Phrase"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* Hidden real input for accessibility & mobile */}
      <input
        ref={inputRef}
        type="text"
        value={typedInput}
        onChange={handleInputChange}
        className="opacity-0 absolute inset-0 -z-10 cursor-text pointer-events-none"
        autoFocus
      />

      {/* Glyph Stage */}
      <div className="relative z-10 py-3 min-h-[112px] max-h-[180px] overflow-hidden flex flex-col justify-end gap-1">
        {promptLines.slice(Math.max(0, activePhraseIndex - 2), activePhraseIndex + 1).map((line) => (
          <div key={line.start} className="font-mono text-base sm:text-lg md:text-xl tracking-wide leading-relaxed break-words">
            {line.text.split('').map((char, charIndex) => {
              const index = line.start + charIndex;
              let state: 'correct' | 'wrong' | 'current' | 'pending' = 'pending';
              if (index < typedInput.length) {
                state = typedInput[index] === char ? 'correct' : 'wrong';
              } else if (index === typedInput.length) {
                state = 'current';
              }

              let charColorClass = 'text-slate-400/60 dark:text-slate-600';
              if (state === 'correct') {
                charColorClass = 'text-slate-900 dark:text-slate-100 font-bold';
              } else if (state === 'wrong') {
                charColorClass = 'text-rose-500 font-black bg-rose-100 dark:bg-rose-950/60 rounded-xs px-0.5';
              } else if (state === 'current') {
                charColorClass = 'text-slate-700 dark:text-slate-300';
              }

              return (
                <span key={index} className={`relative inline-block transition-colors duration-75 ${charColorClass}`}>
                  {state === 'current' && (
                    <span className="absolute -left-0.5 top-1 bottom-1 w-0.5 rounded-full bg-amber-500 dark:bg-emerald-400 animate-pulse shadow-sm" />
                  )}
                  {char === ' ' ? '\u00A0' : char}
                </span>
              );
            })}
          </div>
        ))}
      </div>

      {/* Completion Banner */}
      {isFinished && (
        <div className="relative z-10 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono animate-pop-in">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
            <Zap size={14} className="fill-emerald-500" />
            <span>Time’s up! {typedInput.trim() ? typedInput.trim().split(/\s+/).filter((word) => word.length > 0).length : 0} words · {wpm} WPM @ {accuracy}% accuracy.</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNextQuote();
            }}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
            >
            Try Again ↺
          </button>
        </div>
      )}

      {/* Footer Instructions */}
      {!isFinished && (
        <div className="relative z-10 mt-2 text-[10px] font-mono text-slate-400 dark:text-slate-500 flex items-center justify-between">
          <span>Click to focus and type the corporate buzzwords</span>
          <span className="hidden sm:inline">ESC or [↺] to skip</span>
        </div>
      )}
    </div>
  );
};
