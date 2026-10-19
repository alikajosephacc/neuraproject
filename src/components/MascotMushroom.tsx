import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MascotMood } from '../types';
import { sound } from '../lib/sound';

interface MascotMushroomProps {
  mood?: MascotMood;
  speechText?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  interactive?: boolean;
  className?: string;
  onTap?: () => void;
}

/**
 * Pip the Corporate Mushroom
 * Built following Rive state-machine architecture & Duolingo motion design principles:
 * - Dynamic cursor/pointer tracking for pupils & head orientation
 * - Periodic procedural eye-blinking cycle
 * - Spring-damper squash-and-stretch interaction physics on click/tap
 * - Distinct game mood states: thriving, neutral, wilting, celebrating
 */
export const MascotMushroom: React.FC<MascotMushroomProps> = ({
  mood = 'neutral',
  speechText,
  size = 'md',
  interactive = true,
  className = '',
  onTap,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Rive-style State Machine inputs
  const [pupilOffset, setPupilOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [headTilt, setHeadTilt] = useState<number>(0);
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [squashState, setSquashState] = useState<'idle' | 'squash' | 'stretch' | 'settle'>('idle');
  const [tapSparkles, setTapSparkles] = useState<boolean>(false);

  // Corporate dialogue lines for the Mushroom mascot
  const defaultSpeech = {
    thriving: 'Deep mycorrhizal stakeholder network active! Synergies are viral.',
    neutral: 'Thriving in dark conference rooms and damp agile sprints. Need bandwidth?',
    wilting: 'Cap desiccation imminent! HR forgot to allocate organic moisture...',
  };

  const bubbleText = speechText || defaultSpeech[mood];

  // 1. Natural periodic eye blinking state machine
  useEffect(() => {
    let blinkTimer: NodeJS.Timeout;
    const scheduleNextBlink = () => {
      const delay = Math.random() * 2500 + 2000; // blink every 2.0 to 4.5 seconds
      blinkTimer = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleNextBlink();
        }, 140); // 140ms blink duration
      }, delay);
    };
    scheduleNextBlink();
    return () => clearTimeout(blinkTimer);
  }, []);

  // 2. Interactive Pointer Tracking (Eyes follow user cursor smoothly)
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    const distance = Math.hypot(deltaX, deltaY);

    if (distance === 0) return;

    // Clamp pupil travel within physical eye boundaries (-4px to +4px)
    const maxPupilOffset = 4.2;
    const ratio = Math.min(1, distance / 350);
    const pupilX = (deltaX / distance) * maxPupilOffset * ratio;
    const pupilY = (deltaY / distance) * (maxPupilOffset * 0.75) * ratio;

    setPupilOffset({ x: pupilX, y: pupilY });

    // Subtle head tilt (-3.5 deg to +3.5 deg)
    const tilt = (deltaX / window.innerWidth) * 7;
    setHeadTilt(Math.max(-4, Math.min(4, tilt)));
  }, []);

  useEffect(() => {
    if (!interactive) return;
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [interactive, handleMouseMove]);

  // 3. Interactive Squash-and-Stretch physics on Tap / Click
  const handleMascotClick = () => {
    if (!interactive) return;
    sound.playClick();
    setTapSparkles(true);
    setTimeout(() => setTapSparkles(false), 900);

    // Trigger squash -> stretch -> settle state transition sequence
    setSquashState('squash');
    setTimeout(() => {
      setSquashState('stretch');
      setTimeout(() => {
        setSquashState('settle');
        setTimeout(() => setSquashState('idle'), 250);
      }, 180);
    }, 120);

    if (onTap) onTap();
  };

  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-36 h-36',
    lg: 'w-52 h-52',
    hero: 'w-64 h-64 sm:w-72 sm:h-72',
  };

  // Transform styles based on squash-and-stretch state
  let transformStyle = `rotate(${headTilt}deg)`;
  if (squashState === 'squash') {
    transformStyle += ' scale(1.18, 0.82) translateY(6px)';
  } else if (squashState === 'stretch') {
    transformStyle += ' scale(0.88, 1.16) translateY(-14px)';
  } else if (squashState === 'settle') {
    transformStyle += ' scale(1.04, 0.96) translateY(-2px)';
  }

  return (
    <div
      ref={containerRef}
      className={`flex flex-col items-center select-none ${className}`}
      onClick={handleMascotClick}
    >
      {/* Speech Bubble */}
      {bubbleText && (
        <div className="relative mb-3 max-w-[280px] bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 shadow-sm text-sm text-slate-700 dark:text-slate-200 animate-pop-in transition-colors">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className="font-black text-xs tracking-wide uppercase text-rose-600 dark:text-rose-400">
              Pip (Agile Mushroom)
            </p>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Tap me!</span>
          </div>
          <p className="leading-snug text-xs sm:text-sm font-medium">{bubbleText}</p>
          {/* Bubble tail */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-slate-800 border-b-2 border-r-2 border-slate-200 dark:border-slate-700 rotate-45" />
        </div>
      )}

      {/* Interactive Mascot Chassis */}
      <div
        className={`${sizeClasses[size]} relative cursor-pointer group transition-transform duration-150 ease-out`}
        style={{ transform: transformStyle }}
      >
        {/* Click Sparkles Burst */}
        {tapSparkles && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-0">
            <span className="absolute -top-4 -left-2 text-xl animate-bounce-short">✨</span>
            <span className="absolute -top-6 right-2 text-lg animate-bounce-short" style={{ animationDelay: '0.1s' }}>🌟</span>
            <span className="absolute bottom-2 -right-4 text-xl animate-bounce-short" style={{ animationDelay: '0.15s' }}>🍄</span>
            <span className="absolute bottom-4 -left-4 text-base animate-bounce-short" style={{ animationDelay: '0.05s' }}>⭐</span>
          </div>
        )}

        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-lg overflow-visible"
        >
          <defs>
            {/* Shading Gradients */}
            <linearGradient id="capGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ff4d4d" />
              <stop offset="60%" stopColor="#e5252a" />
              <stop offset="100%" stopColor="#b91c1c" />
            </linearGradient>

            <linearGradient id="stalkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fffdfa" />
              <stop offset="70%" stopColor="#fdf6e7" />
              <stop offset="100%" stopColor="#faecd0" />
            </linearGradient>

            <linearGradient id="rimGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#faecd0" />
              <stop offset="100%" stopColor="#f3deb3" />
            </linearGradient>

            {/* Wilting Muted Gradients */}
            <linearGradient id="wiltedCap" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#c2410c" />
              <stop offset="100%" stopColor="#9a3412" />
            </linearGradient>

            <linearGradient id="wiltedStalk" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>

            {/* Specular Cap Highlight */}
            <radialGradient id="specularGlow" cx="35%" cy="30%" r="45%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Ground Contact Shadow (stretches dynamically) */}
          <ellipse
            cx="100"
            cy="188"
            rx={squashState === 'squash' ? '54' : squashState === 'stretch' ? '36' : '46'}
            ry="7"
            fill="#0f172a"
            opacity="0.12"
            className="transition-all duration-150"
          />

          {/* STUBBY FEET */}
          <g className="transition-transform duration-150">
            {/* Left foot */}
            <path
              d="M 80,165 Q 80,184 68,184 Q 60,184 62,176 Q 66,165 78,165 Z"
              fill={mood === 'wilting' ? 'url(#wiltedStalk)' : '#faecd0'}
              stroke="#581c1c"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Right foot */}
            <path
              d="M 120,165 Q 120,184 132,184 Q 140,184 138,176 Q 134,165 122,165 Z"
              fill={mood === 'wilting' ? 'url(#wiltedStalk)' : '#faecd0'}
              stroke="#581c1c"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
          </g>

          {/* CREAM STALK BODY */}
          <path
            d="M 68,102 C 64,128 60,164 80,172 C 90,176 110,176 120,172 C 140,164 136,128 132,102 Z"
            fill={mood === 'wilting' ? 'url(#wiltedStalk)' : 'url(#stalkGradient)'}
            stroke="#581c1c"
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* CUTE LITTLE HANDS */}
          <g>
            {/* Left Arm/Hand */}
            <path
              d="M 66,126 Q 52,138 54,150 Q 56,158 64,154 Q 70,146 70,134 Z"
              fill={mood === 'wilting' ? 'url(#wiltedStalk)' : '#fffdfa'}
              stroke="#581c1c"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Right Arm/Hand */}
            <path
              d="M 134,126 Q 148,138 146,150 Q 144,158 136,154 Q 130,146 130,134 Z"
              fill={mood === 'wilting' ? 'url(#wiltedStalk)' : '#fffdfa'}
              stroke="#581c1c"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
          </g>

          {/* FACIAL FEATURES */}
          {/* Soft Pink Blushing Cheeks */}
          <ellipse
            cx="76"
            cy="133"
            rx="6.5"
            ry="4"
            fill={mood === 'wilting' ? '#f59e0b' : '#fb7185'}
            opacity={mood === 'wilting' ? '0.35' : '0.65'}
          />
          <ellipse
            cx="124"
            cy="133"
            rx="6.5"
            ry="4"
            fill={mood === 'wilting' ? '#f59e0b' : '#fb7185'}
            opacity={mood === 'wilting' ? '0.35' : '0.65'}
          />

          {/* EYES with dynamic cursor tracking & blink state */}
          <g>
            {/* LEFT EYE */}
            <g transform="translate(84, 122)">
              {isBlinking ? (
                // Blinking closed line
                <path d="M -7,2 Q 0,8 7,2" fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
              ) : mood === 'thriving' ? (
                // Super joyful curved eyes
                <g>
                  <path d="M -7,4 Q 0,-6 7,4" fill="none" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
                  <circle cx="0" cy="5" r="1.5" fill="#f59e0b" />
                </g>
              ) : (
                // Expressive Duolingo oval eye with pupil tracking
                <g>
                  {/* Eye outline / white socket */}
                  <ellipse cx="0" cy="0" rx="7.5" ry="11" fill="#0f172a" />
                  {/* Specular high-gloss pupil highlight (following cursor) */}
                  <ellipse
                    cx={pupilOffset.x}
                    cy={pupilOffset.y}
                    rx="6"
                    ry="9"
                    fill="#1e293b"
                  />
                  {/* Top-right primary gleam */}
                  <circle
                    cx={pupilOffset.x + 2}
                    cy={pupilOffset.y - 3}
                    r="2.5"
                    fill="#ffffff"
                  />
                  {/* Bottom secondary micro-reflection */}
                  <circle
                    cx={pupilOffset.x - 2}
                    cy={pupilOffset.y + 3}
                    r="1.2"
                    fill="#ffffff"
                    opacity="0.8"
                  />
                </g>
              )}
            </g>

            {/* RIGHT EYE */}
            <g transform="translate(116, 122)">
              {isBlinking ? (
                // Blinking closed line
                <path d="M -7,2 Q 0,8 7,2" fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
              ) : mood === 'thriving' ? (
                // Super joyful curved eyes
                <g>
                  <path d="M -7,4 Q 0,-6 7,4" fill="none" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
                  <circle cx="0" cy="5" r="1.5" fill="#f59e0b" />
                </g>
              ) : (
                // Expressive Duolingo oval eye with pupil tracking
                <g>
                  <ellipse cx="0" cy="0" rx="7.5" ry="11" fill="#0f172a" />
                  <ellipse
                    cx={pupilOffset.x}
                    cy={pupilOffset.y}
                    rx="6"
                    ry="9"
                    fill="#1e293b"
                  />
                  <circle
                    cx={pupilOffset.x + 2}
                    cy={pupilOffset.y - 3}
                    r="2.5"
                    fill="#ffffff"
                  />
                  <circle
                    cx={pupilOffset.x - 2}
                    cy={pupilOffset.y + 3}
                    r="1.2"
                    fill="#ffffff"
                    opacity="0.8"
                  />
                </g>
              )}
            </g>
          </g>

          {/* MOUTH according to mood */}
          {mood === 'thriving' ? (
            // Big open happy tongue grin
            <g transform="translate(100, 134)">
              <path
                d="M -9,0 Q 0,11 9,0 Z"
                fill="#b91c1c"
                stroke="#0f172a"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path
                d="M -4,5 Q 0,3 4,5 Q 2,9 -2,9 Z"
                fill="#f43f5e"
              />
            </g>
          ) : mood === 'wilting' ? (
            // Trembling sad mouth + tear
            <g transform="translate(100, 137)">
              <path
                d="M -8,2 Q 0,-5 8,2"
                fill="none"
                stroke="#0f172a"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Teardrop */}
              <path
                d="M -16,4 C -19,1 -16,-3 -16,-3 C -16,-3 -13,1 -16,4 Z"
                fill="#38bdf8"
                stroke="#0284c7"
                strokeWidth="1"
              />
            </g>
          ) : (
            // Friendly Duolingo curved smile
            <path
              d="M 93,134 Q 100,142 107,134"
              fill="none"
              stroke="#0f172a"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
          )}

          {/* INNER CAP RIM (Underside volume) */}
          <path
            d="M 38,98 C 45,116 155,116 162,98 C 158,118 42,118 38,98 Z"
            fill="url(#rimGradient)"
            stroke="#581c1c"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* BIG RED POLKA-DOT MUSHROOM CAP */}
          <g>
            {/* The Big Red Cap Dome */}
            <path
              d="M 35,98 C 30,55 60,20 100,20 C 140,20 170,55 165,98 C 145,112 55,112 35,98 Z"
              fill={mood === 'wilting' ? 'url(#wiltedCap)' : 'url(#capGradient)'}
              stroke="#581c1c"
              strokeWidth="4.5"
              strokeLinejoin="round"
            />

            {/* Specular Ambient Glow Sheen */}
            <path
              d="M 35,98 C 30,55 60,20 100,20 C 140,20 170,55 165,98 C 145,112 55,112 35,98 Z"
              fill="url(#specularGlow)"
            />

            {/* CRISP WHITE POLKA DOTS */}
            {/* Top-Center Big Spot */}
            <circle cx="108" cy="38" r="14" fill="#ffffff" />
            <circle cx="108" cy="38" r="13" fill="#fffdfa" />

            {/* Front-Center Medium Spot */}
            <circle cx="78" cy="62" r="16.5" fill="#ffffff" />
            <circle cx="78" cy="62" r="15.5" fill="#fffdfa" />

            {/* Top-Left Spot */}
            <ellipse cx="62" cy="36" rx="11" ry="9" fill="#ffffff" transform="rotate(-15 62 36)" />

            {/* Right Spot */}
            <circle cx="134" cy="65" r="13.5" fill="#ffffff" />

            {/* Left Edge Partial Spot */}
            <path
              d="M 35,74 C 42,70 48,82 42,90 C 37,86 35,80 35,74 Z"
              fill="#ffffff"
            />

            {/* Right Edge Partial Spot */}
            <path
              d="M 165,74 C 158,70 152,82 158,90 C 163,86 165,80 165,74 Z"
              fill="#ffffff"
            />
          </g>

          {/* Thriving State: Tiny Golden Crown or Halo */}
          {mood === 'thriving' && (
            <g className="animate-bounce-short">
              <path
                d="M 90,14 L 94,6 L 100,12 L 106,6 L 110,14 Z"
                fill="#fbbf24"
                stroke="#b45309"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <circle cx="94" cy="6" r="1.5" fill="#f43f5e" />
              <circle cx="100" cy="12" r="1.5" fill="#3b82f6" />
              <circle cx="106" cy="6" r="1.5" fill="#10b981" />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
