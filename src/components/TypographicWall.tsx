import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Terminal } from 'lucide-react';

interface TypographicWallProps {
  words?: string[];
  className?: string;
  lightBlueColor?: string;
  yellowColor?: string;
  onWordClick?: (word: string) => void;
}

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=~[]{}|;:,.<>?';

const DEFAULT_PHRASES = [
  { text: 'CIRCLE BACK', color: 'blue' as const },
  { text: 'SYNERGY', color: 'yellow' as const },
  { text: 'BANDWIDTH', color: 'blue' as const },
  { text: 'TOUCH BASE', color: 'yellow' as const },
  { text: 'OFFLINE', color: 'blue' as const },
  { text: 'PARADIGM', color: 'yellow' as const },
  { text: 'PIVOT', color: 'blue' as const },
  { text: 'DEEP DIVE', color: 'yellow' as const },
  { text: 'LEVERAGE', color: 'blue' as const },
  { text: 'STAKEHOLDER', color: 'yellow' as const },
  { text: 'ALIGNMENT', color: 'blue' as const },
  { text: 'CALIBRATE', color: 'yellow' as const },
];

/**
 * TypographicWall (inspired by React Bits Pro typographic-wall-tw)
 * Renders a dynamic wall of scrambling glyphs that decodes scattered words line by line.
 * Styled with Light Blue and Yellow telemetry accents.
 */
export const TypographicWall: React.FC<TypographicWallProps> = ({
  className = '',
  lightBlueColor = '#38bdf8', // Light Blue (Sky)
  yellowColor = '#facc15',    // Yellow
  onWordClick,
}) => {
  const [revealedCount, setRevealedCount] = useState<number>(0);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [scrambleTick, setScrambleTick] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Line by line decoding sequence on site load
  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setRevealedCount(current);
      if (current >= DEFAULT_PHRASES.length + 4) {
        clearInterval(interval);
      }
    }, 280);

    return () => clearInterval(interval);
  }, []);

  // Ambient glyph background flicker
  useEffect(() => {
    const flicker = setInterval(() => {
      setScrambleTick((t) => (t + 1) % 1000);
    }, 120);
    return () => clearInterval(flicker);
  }, []);

  // Pre-configured typographic rows with embedded keywords
  const rows = [
    {
      prefix: '010X#$@&',
      word: DEFAULT_PHRASES[0], // CIRCLE BACK (blue)
      middle: '%*+-^~9281',
      secondWord: DEFAULT_PHRASES[1], // SYNERGY (yellow)
      suffix: '!@#01KMW',
    },
    {
      prefix: 'KMW829!#',
      word: DEFAULT_PHRASES[2], // BANDWIDTH (blue)
      middle: '><+==?8194',
      secondWord: DEFAULT_PHRASES[3], // TOUCH BASE (yellow)
      suffix: '&*%$#@!0',
    },
    {
      prefix: '&*(#@!90',
      word: DEFAULT_PHRASES[4], // OFFLINE (blue)
      middle: '0101928374',
      secondWord: DEFAULT_PHRASES[5], // PARADIGM (yellow)
      suffix: '^~*+_=-?',
    },
    {
      prefix: '=+_~#819',
      word: DEFAULT_PHRASES[6], // PIVOT (blue)
      middle: '!@#$%^&*()',
      secondWord: DEFAULT_PHRASES[7], // DEEP DIVE (yellow)
      suffix: '829104KMW',
    },
    {
      prefix: '7281#$@!',
      word: DEFAULT_PHRASES[8], // LEVERAGE (blue)
      middle: '*+-/=<>;:',
      secondWord: DEFAULT_PHRASES[9], // STAKEHOLDER (yellow)
      suffix: '01928374#',
    },
  ];

  // Helper to generate scrambling background glyphs
  const getFlickerChar = (seedChar: string, rowIndex: number, charIndex: number) => {
    if (hoveredRow === rowIndex) {
      return GLYPHS[(charIndex + scrambleTick * 3) % GLYPHS.length];
    }
    if ((charIndex + rowIndex + scrambleTick) % 7 === 0) {
      return GLYPHS[(charIndex * 7 + scrambleTick) % GLYPHS.length];
    }
    return seedChar;
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-white shadow-xl select-none transition-colors p-5 sm:p-7 ${className}`}
    >
      {/* Ambient background glow accents in Light Blue and Yellow */}
      <div
        className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full opacity-20 blur-3xl transition-opacity"
        style={{ background: lightBlueColor }}
      />
      <div
        className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 rounded-full opacity-20 blur-3xl transition-opacity"
        style={{ background: yellowColor }}
      />

      {/* Header bar of the Typographic Wall */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-800 text-[11px] font-mono">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-sky-400 animate-pulse" />
          <span className="font-bold uppercase tracking-wider text-slate-300">
            Jargon Decoder Matrix // Typographic Wall
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            <span className="text-sky-400 font-bold">LIGHT BLUE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
            <span className="text-yellow-400 font-bold">YELLOW</span>
          </div>
          <span className="text-slate-500 hidden sm:inline">60 FPS RUNTIME</span>
        </div>
      </div>

      {/* The Typographic Glyph Grid */}
      <div className="space-y-2 font-mono text-xs sm:text-sm md:text-base leading-relaxed tracking-wider">
        {rows.map((row, rIdx) => {
          const isRowDecoded = revealedCount > rIdx;

          return (
            <div
              key={rIdx}
              onMouseEnter={() => setHoveredRow(rIdx)}
              onMouseLeave={() => setHoveredRow(null)}
              className="flex flex-wrap items-center gap-x-2.5 gap-y-1 transition-all py-0.5 px-2 rounded-lg hover:bg-slate-800/60"
            >
              {/* Prefix ambient glyphs */}
              <span className="text-slate-600 dark:text-slate-600 tracking-widest text-[11px] sm:text-xs">
                {row.prefix.split('').map((c, i) => getFlickerChar(c, rIdx, i)).join('')}
              </span>

              {/* Word 1 (Light Blue accent) */}
              <button
                onClick={() => onWordClick && onWordClick(row.word.text)}
                className={`font-black tracking-wide transition-all duration-300 cursor-pointer ${
                  isRowDecoded
                    ? 'text-sky-400 hover:text-sky-300 drop-shadow-[0_0_12px_rgba(56,189,248,0.6)] scale-100'
                    : 'text-slate-700 blur-[0.5px]'
                }`}
                style={{
                  color: isRowDecoded ? lightBlueColor : undefined,
                }}
                title={`Click keyword: ${row.word.text}`}
              >
                {isRowDecoded
                  ? row.word.text
                  : row.word.text.split('').map((c, i) => getFlickerChar(c, rIdx, i + 10)).join('')}
              </button>

              {/* Middle ambient glyphs */}
              <span className="text-slate-700 dark:text-slate-600 tracking-widest text-[11px] sm:text-xs hidden sm:inline">
                {row.middle.split('').map((c, i) => getFlickerChar(c, rIdx, i + 20)).join('')}
              </span>

              {/* Word 2 (Yellow accent) */}
              <button
                onClick={() => onWordClick && onWordClick(row.secondWord.text)}
                className={`font-black tracking-wide transition-all duration-300 cursor-pointer ${
                  isRowDecoded
                    ? 'text-yellow-400 hover:text-yellow-300 drop-shadow-[0_0_12px_rgba(250,204,21,0.6)] scale-100'
                    : 'text-slate-700 blur-[0.5px]'
                }`}
                style={{
                  color: isRowDecoded ? yellowColor : undefined,
                }}
                title={`Click keyword: ${row.secondWord.text}`}
              >
                {isRowDecoded
                  ? row.secondWord.text
                  : row.secondWord.text.split('').map((c, i) => getFlickerChar(c, rIdx, i + 30)).join('')}
              </button>

              {/* Suffix ambient glyphs */}
              <span className="text-slate-600 dark:text-slate-600 tracking-widest text-[11px] sm:text-xs hidden md:inline ml-auto">
                {row.suffix.split('').map((c, i) => getFlickerChar(c, rIdx, i + 40)).join('')}
              </span>
            </div>
          );
        })}
      </div>

      {/* Subtext info pill */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-1.5">
          <Sparkles size={12} className="text-yellow-400" />
          <span>Interactive React Bits Pro Component: Hover rows to scramble telemetry</span>
        </div>
        <span className="text-slate-500">DECODE: 100% COMPLETE</span>
      </div>
    </div>
  );
};
