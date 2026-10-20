import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Keyboard, RotateCcw, Sparkles, Zap } from 'lucide-react';
import { sound } from '../lib/sound';

interface LuminousTypeProps {
  phrases?: string[];
  className?: string;
  goldenAccent?: string;
  isDayShift?: boolean;
}

const DEFAULT_CORPORATE_QUOTES = [
  "circle back and align our core competencies",
  "put this in the parking lot to unblock bandwidth",
  "take this offline before anyone asks for an agenda",
  "leverage high altitude synergies for Q4 deliverables",
  "move fast and break things without notifying compliance",
];

/**
 * LuminousType (inspired by React Bits Pro @reactbits-starter/luminous-type-tw)
 * Featuring Monkeytype Serika/Honey warm yellow palette & interactive speed-typing telemetry.
 * Drifting luminous spotlight illuminates otherwise dimmed monospace glyphs.
 */
export const LuminousType: React.FC<LuminousTypeProps> = ({
  phrases = DEFAULT_CORPORATE_QUOTES,
  className = '',
  goldenAccent = '#e2b714',
  isDayShift = true,
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const targetText = phrases[quoteIndex % phrases.length];

  const [typedInput, setTypedInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(100);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [spotlightOffset, setSpotlightOffset] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Drifting ambient luminous spotlight wave
  useEffect(() => {
    let frameId: number;
    let step = 0;
    const animate = () => {
      step += 0.02;
      setSpotlightOffset(Math.sin(step) * 120 + 120);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Reset state when quote index changes
  const handleReset = useCallback(() => {
    setTypedInput('');
    setStartTime(null);
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

    if (!startTime && val.length === 1) {
      setStartTime(Date.now());
    }

    sound.playClick();
    setTypedInput(val);

    // Calculate accuracy
    let correct = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] === targetText[i]) correct++;
    }
    const acc = val.length > 0 ? Math.round((correct / val.length) * 100) : 100;
    setAccuracy(acc);

    // Calculate real-time WPM
    if (startTime) {
      const elapsedMinutes = Math.max(0.01, (Date.now() - startTime) / 60000);
      const wordsTyped = correct / 5;
      setWpm(Math.round(wordsTyped / elapsedMinutes));
    }

    if (val.length >= targetText.length) {
      setIsFinished(true);
      sound.playCorrect();
    }
  };

  // Track cursor position for pointer-following luminous aura
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
      className={`relative overflow-hidden rounded-3xl border transition-all duration-300 p-5 sm:p-6 shadow-sm select-none cursor-text ${
        isDayShift
          ? 'bg-[#fffdf7] border-[#e8dfc8] text-[#323437]'
          : 'bg-slate-900/90 border-slate-800 text-slate-100'
      } ${className}`}
      style={{
        boxShadow: isDayShift ? '0 4px 20px -2px rgba(226, 183, 20, 0.08)' : undefined,
      }}
    >
      {/* Drifting Luminous Spotlight Glow */}
      <div
        className="pointer-events-none absolute -top-16 w-80 h-40 rounded-full blur-3xl opacity-25 transition-transform"
        style={{
          background: goldenAccent,
          transform: `translateX(${spotlightOffset}px)`,
        }}
      />

      {/* Pointer Cursor Following Luminous Glow */}
      {mousePos && (
        <div
          className="pointer-events-none absolute w-48 h-48 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl opacity-35 transition-opacity"
          style={{
            left: mousePos.x,
            top: mousePos.y,
            background: goldenAccent,
          }}
        />
      )}

      {/* Monkeytype Header Telemetry Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between pb-3.5 mb-4 border-b border-[#e8dfc8]/60 dark:border-slate-800 text-[11px] font-mono">
        <div className="flex items-center gap-2">
          <Keyboard size={15} style={{ color: goldenAccent }} className="animate-pulse" />
          <span className="font-bold tracking-wider uppercase text-slate-600 dark:text-slate-300">
            Luminous Type // Monkeytype Serika Theme
          </span>
          <span
            className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: isDayShift ? '#fef3c7' : '#78350f',
              color: isDayShift ? '#92400e' : '#fde68a',
            }}
          >
            Day Shift Palette
          </span>
        </div>

        {/* Real-time stats */}
        <div className="flex items-center gap-3 font-bold">
          <div className="flex items-center gap-1">
            <span className="text-slate-400">WPM:</span>
            <span style={{ color: goldenAccent }} className="text-sm">
              {wpm}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-400">ACC:</span>
            <span className={accuracy >= 90 ? 'text-emerald-600' : 'text-amber-500'}>
              {accuracy}%
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNextQuote();
            }}
            className="p-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            title="Next corporate quote"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* Hidden input capturing keystrokes */}
      <input
        ref={inputRef}
        type="text"
        value={typedInput}
        onChange={handleInputChange}
        className="absolute opacity-0 pointer-events-none"
        autoFocus
        tabIndex={0}
      />

      {/* The Luminous Monospace Typography */}
      <div className="relative z-10 font-mono text-base sm:text-lg md:text-xl tracking-wide leading-relaxed py-2">
        {targetText.split('').map((char, index) => {
          const isTyped = index < typedInput.length;
          const isCurrent = index === typedInput.length;
          const isCorrect = isTyped && typedInput[index] === char;
          const isWrong = isTyped && typedInput[index] !== char;

          let charColor = isDayShift ? '#9ca3af' : '#64748b'; // default dimmed
          let textShadow = 'none';

          if (isCorrect) {
            charColor = goldenAccent; // Monkeytype golden yellow illumination
            textShadow = `0 0 10px rgba(226, 183, 20, 0.65)`;
          } else if (isWrong) {
            charColor = '#ef4444'; // Red error
            textShadow = `0 0 8px rgba(239, 68, 68, 0.5)`;
          } else if (isCurrent) {
            charColor = isDayShift ? '#1f2937' : '#f8fafc';
          }

          return (
            <span
              key={index}
              className={`relative inline-block transition-colors duration-100 ${
                isCurrent ? 'border-b-2 animate-pulse' : ''
              }`}
              style={{
                color: charColor,
                textShadow,
                borderColor: goldenAccent,
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          );
        })}
      </div>

      {/* Subtext info bar */}
      <div className="relative z-10 mt-3 pt-3 border-t border-[#e8dfc8]/60 dark:border-slate-800 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 dark:text-slate-500">
        <div className="flex items-center gap-1.5">
          <Sparkles size={12} style={{ color: goldenAccent }} />
          <span>Click to type the corporate phrase & test your alignment velocity</span>
        </div>
        <div className="flex items-center gap-2">
          {isFinished ? (
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <Zap size={12} /> Deliverable Typed!
            </span>
          ) : (
            <span>{typedInput.length}/{targetText.length} glyphs</span>
          )}
        </div>
      </div>
    </div>
  );
};
