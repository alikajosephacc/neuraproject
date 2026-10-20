import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Keyboard, RotateCcw, Sparkles, Zap } from 'lucide-react';
import { sound } from '../lib/sound';
import { MonkeyTheme, getThemeById } from '../lib/themes';

interface LuminousTypeProps {
  phrases?: string[];
  className?: string;
  themeId?: string;
  theme?: MonkeyTheme;
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
 * Featuring interactive speed-typing telemetry and multi-theme palette lighting.
 * Drifting luminous spotlight illuminates otherwise dimmed monospace glyphs.
 */
export const LuminousType: React.FC<LuminousTypeProps> = ({
  phrases = DEFAULT_CORPORATE_QUOTES,
  className = '',
  themeId,
  theme,
}) => {
  const activeTheme = theme || getThemeById(themeId);
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
      className={`relative overflow-hidden rounded-3xl border transition-all duration-300 p-5 sm:p-6 shadow-sm select-none cursor-text ${className}`}
      style={{
        backgroundColor: activeTheme.cardBg,
        borderColor: activeTheme.border,
        color: activeTheme.text,
        boxShadow: `0 4px 20px -2px ${activeTheme.accent}1a`,
      }}
    >
      {/* Drifting Luminous Spotlight Glow */}
      <div
        className="pointer-events-none absolute -top-16 w-80 h-40 rounded-full blur-3xl opacity-25 transition-transform"
        style={{
          background: activeTheme.accent,
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
            background: activeTheme.accent,
          }}
        />
      )}

      {/* Header Telemetry Bar */}
      <div
        className="relative z-10 flex flex-wrap items-center justify-between pb-3.5 mb-4 border-b text-[11px] font-mono"
        style={{ borderColor: activeTheme.border }}
      >
        <div className="flex items-center gap-2">
          <Keyboard size={15} style={{ color: activeTheme.accent }} className="animate-pulse" />
          <span className="font-bold tracking-wider uppercase" style={{ color: activeTheme.text }}>
            Luminous Type // Interactive Telemetry
          </span>
          <span
            className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: activeTheme.border,
              color: activeTheme.text,
            }}
          >
            {activeTheme.name}
          </span>
        </div>

        {/* Real-time stats */}
        <div className="flex items-center gap-3 font-bold">
          <div className="flex items-center gap-1">
            <span style={{ color: activeTheme.sub }}>WPM:</span>
            <span style={{ color: activeTheme.accent }} className="text-sm">
              {wpm}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span style={{ color: activeTheme.sub }}>ACC:</span>
            <span className={accuracy >= 90 ? 'text-emerald-600' : 'text-amber-500'}>
              {accuracy}%
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNextQuote();
            }}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
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

          let charColor = activeTheme.sub;
          let textShadow = 'none';

          if (isCorrect) {
            charColor = activeTheme.accent;
            textShadow = `0 0 10px ${activeTheme.accent}aa`;
          } else if (isWrong) {
            charColor = '#ef4444';
            textShadow = `0 0 8px rgba(239, 68, 68, 0.5)`;
          } else if (isCurrent) {
            charColor = activeTheme.text;
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
                borderColor: activeTheme.accent,
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          );
        })}
      </div>

      {/* Subtext info bar */}
      <div
        className="relative z-10 mt-3 pt-3 border-t flex flex-wrap items-center justify-between text-[11px] font-mono"
        style={{ borderColor: activeTheme.border, color: activeTheme.sub }}
      >
        <div className="flex items-center gap-1.5">
          <Sparkles size={12} style={{ color: activeTheme.accent }} />
          <span>Click to type the corporate phrase & test your velocity</span>
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
