import React from 'react';
import { MascotMood } from '../types';

interface MascotProps {
  mood?: MascotMood;
  speechText?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MascotGerald: React.FC<MascotProps> = ({
  mood = 'neutral',
  speechText,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-36 h-36',
    lg: 'w-52 h-52',
  };

  // Corporate dialogue lines for Gerald based on mood
  const defaultSpeech = {
    thriving: 'High leverage detected! Synergies are compounding nicely.',
    neutral: "Let's touch base on your next deliverable. Remember: circle back early.",
    wilting: 'HR is monitoring our optics... Please calibrate before the 1:1!',
  };

  const bubbleText = speechText || defaultSpeech[mood];

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Speech Bubble */}
      {bubbleText && (
        <div className="relative mb-3 max-w-[260px] bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 shadow-sm text-sm text-slate-700 dark:text-slate-200 animate-pop-in transition-colors">
          <p className="font-semibold text-xs tracking-wide uppercase text-emerald-600 dark:text-emerald-400 mb-0.5">
            Gerald (Office Ficus)
          </p>
          <p className="leading-snug">{bubbleText}</p>
          {/* Bubble tail */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-slate-800 border-b-2 border-r-2 border-slate-200 dark:border-slate-700 rotate-45" />
        </div>
      )}

      {/* Gerald SVG Illustration */}
      <div className={`${sizeClasses[size]} relative transition-transform duration-300 hover:scale-105`}>
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
          {/* Clay Pot */}
          <polygon
            points="55,145 145,145 135,190 65,190"
            fill="#d97706"
            stroke="#92400e"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Pot Rim */}
          <rect
            x="50"
            y="136"
            width="100"
            height="14"
            rx="4"
            fill="#f59e0b"
            stroke="#92400e"
            strokeWidth="3.5"
          />
          {/* Pot Badge (Corporate Lanyard / Sticker) */}
          <rect x="80" y="155" width="40" height="22" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
          <line x1="86" y1="162" x2="114" y2="162" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
          <line x1="86" y1="168" x2="104" y2="168" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />

          {/* Plant Stems */}
          <path
            d="M100,136 Q95,95 80,60"
            fill="none"
            stroke={mood === 'wilting' ? '#a16207' : '#15803d'}
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M100,136 Q110,95 130,65"
            fill="none"
            stroke={mood === 'wilting' ? '#a16207' : '#15803d'}
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M100,136 Q100,70 100,40"
            fill="none"
            stroke={mood === 'wilting' ? '#a16207' : '#15803d'}
            strokeWidth="7"
            strokeLinecap="round"
          />

          {/* Leaves according to state */}
          {mood === 'thriving' && (
            <g className="transition-all duration-300">
              {/* Vibrant Lush Top Leaves */}
              <path d="M100,40 C80,10 120,10 100,40" fill="#22c55e" stroke="#16a34a" strokeWidth="3" />
              <path d="M75,55 C40,40 60,15 75,55" fill="#16a34a" stroke="#15803d" strokeWidth="3" />
              <path d="M125,58 C160,40 145,15 125,58" fill="#16a34a" stroke="#15803d" strokeWidth="3" />
              <path d="M65,90 C30,80 40,50 65,90" fill="#22c55e" stroke="#16a34a" strokeWidth="3" />
              <path d="M135,90 C170,80 160,50 135,90" fill="#22c55e" stroke="#16a34a" strokeWidth="3" />

              {/* Tiny Corporate Sunglasses */}
              <path d="M78,92 L100,93 L122,92" stroke="#0f172a" strokeWidth="2.5" />
              <rect x="73" y="90" width="22" height="15" rx="3" fill="#0f172a" />
              <rect x="105" y="90" width="22" height="15" rx="3" fill="#0f172a" />
              <path d="M76,93 L83,101" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
              <path d="M108,93 L115,101" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

              {/* Confident Grin */}
              <path d="M90,113 Q100,123 110,113" fill="none" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />

              {/* Tiny Necktie */}
              <polygon points="98,122 102,122 104,136 100,140 96,136" fill="#ef4444" stroke="#991b1b" strokeWidth="1" />
            </g>
          )}

          {mood === 'neutral' && (
            <g className="transition-all duration-300">
              {/* Healthy Leaves */}
              <path d="M100,45 C85,20 115,20 100,45" fill="#10b981" stroke="#059669" strokeWidth="3" />
              <path d="M80,65 C55,50 65,25 80,65" fill="#059669" stroke="#047857" strokeWidth="3" />
              <path d="M120,68 C145,50 135,25 120,68" fill="#059669" stroke="#047857" strokeWidth="3" />
              <path d="M70,95 C40,90 50,65 70,95" fill="#10b981" stroke="#059669" strokeWidth="3" />
              <path d="M130,95 C160,90 150,65 130,95" fill="#10b981" stroke="#059669" strokeWidth="3" />

              {/* Corporate Wireframe Glasses */}
              <circle cx="85" cy="98" r="9" fill="none" stroke="#334155" strokeWidth="2" />
              <circle cx="115" cy="98" r="9" fill="none" stroke="#334155" strokeWidth="2" />
              <line x1="94" y1="98" x2="106" y2="98" stroke="#334155" strokeWidth="2" />

              {/* Calm Eyes */}
              <circle cx="85" cy="98" r="3" fill="#0f172a" />
              <circle cx="115" cy="98" r="3" fill="#0f172a" />

              {/* Polite Modest Smile */}
              <path d="M94,115 Q100,121 106,115" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}

          {mood === 'wilting' && (
            <g className="transition-all duration-300">
              {/* Drooping, Yellowed/Brown Leaves */}
              <path d="M100,60 C85,75 110,80 100,60" fill="#eab308" stroke="#ca8a04" strokeWidth="3" />
              <path d="M75,90 C45,115 50,135 75,90" fill="#ca8a04" stroke="#854d0e" strokeWidth="3" />
              <path d="M125,90 C155,115 150,135 125,90" fill="#ca8a04" stroke="#854d0e" strokeWidth="3" />
              <path d="M60,110 C35,130 40,145 60,110" fill="#a16207" stroke="#713f12" strokeWidth="3" />

              {/* Panicked / Sad Eyes */}
              <ellipse cx="85" cy="100" rx="3.5" ry="4" fill="#0f172a" />
              <ellipse cx="115" cy="100" rx="3.5" ry="4" fill="#0f172a" />

              {/* Worry Eyebrows */}
              <path d="M80,92 L90,95" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
              <path d="M120,92 L110,95" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />

              {/* Quivering Frown */}
              <path d="M92,118 Q100,110 108,118" fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />

              {/* Anxiety Sweat Drop */}
              <path
                d="M130,95 C130,91 134,86 134,86 C134,86 138,91 138,95 C138,97 136,99 134,99 C132,99 130,97 130,95 Z"
                fill="#38bdf8"
                stroke="#0284c7"
                strokeWidth="1"
              />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
