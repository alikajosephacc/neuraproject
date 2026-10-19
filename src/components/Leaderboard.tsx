import React from 'react';
import { Trophy, TrendingUp } from 'lucide-react';

interface LeaderboardProps {
  playerXp: number;
}

interface Coworker {
  name: string;
  role: string;
  xp: number;
  avatar: string;
  tagline: string;
}

const STATIC_COWORKERS: Coworker[] = [
  {
    name: 'Chad from Sales',
    role: 'SVP of Pipeline',
    xp: 1840,
    avatar: '🏄‍♂️',
    tagline: 'Sent 400 cold emails while doing bench press',
  },
  {
    name: 'Brenda (Escalations)',
    role: 'Head of CC’ing Everyone',
    xp: 1490,
    avatar: '💅',
    tagline: 'Has never said sorry in her entire corporate career',
  },
  {
    name: 'Linda from HR',
    role: 'Director of Mandatory Fun',
    xp: 1120,
    avatar: '📋',
    tagline: 'Crafted 14 new mandatory compliance quizzes today',
  },
  {
    name: 'Todd (Strategy)',
    role: 'Managing Buzzword Architect',
    xp: 890,
    avatar: '🧢',
    tagline: 'Delegates every single slide deck to ChatGPT',
  },
  {
    name: 'Chloe (Product)',
    role: 'Senior Roadmap Artist',
    xp: 620,
    avatar: '🎨',
    tagline: 'Turned the product roadmap into an interpretive watercolor',
  },
  {
    name: 'Intern Dave',
    role: 'Keycard Seeker',
    xp: 210,
    avatar: '📦',
    tagline: 'Currently trapped in the 3rd floor supply closet',
  },
];

export const Leaderboard: React.FC<LeaderboardProps> = ({ playerXp }) => {
  // Combine player with static coworkers and sort by XP descending
  const list = [
    ...STATIC_COWORKERS,
    {
      name: 'You (Player)',
      role: 'Corporate Aspirant',
      xp: playerXp,
      avatar: '🪴',
      tagline: 'Aggressively circling back on key deliverables',
      isPlayer: true,
    },
  ].sort((a, b) => b.xp - a.xp);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-amber-500" />
          <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">Synergy League</h3>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
          <TrendingUp size={12} /> Division 1
        </span>
      </div>

      <div className="space-y-2">
        {list.map((person, idx) => {
          const isPlayer = 'isPlayer' in person && person.isPlayer;
          return (
            <div
              key={person.name}
              className={`flex items-center justify-between p-2.5 rounded-2xl transition-all ${
                isPlayer
                  ? 'bg-emerald-50 border-2 border-emerald-400 font-bold shadow-xs'
                  : 'hover:bg-slate-50 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`w-5 text-center text-xs font-black ${
                    idx === 0
                      ? 'text-amber-500 text-sm'
                      : idx === 1
                      ? 'text-slate-400 text-sm'
                      : idx === 2
                      ? 'text-amber-700 text-sm'
                      : 'text-slate-400'
                  }`}
                >
                  {idx + 1}
                </span>
                <span className="text-xl shrink-0">{person.avatar}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className={`text-xs truncate ${isPlayer ? 'text-emerald-900 font-black' : 'text-slate-800 font-bold'}`}>
                      {person.name}
                    </p>
                    {isPlayer && (
                      <span className="bg-emerald-600 text-white text-[9px] px-1 rounded uppercase font-black">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">{person.tagline}</p>
                </div>
              </div>

              <div className="text-right shrink-0 ml-2">
                <span className={`text-xs font-extrabold ${isPlayer ? 'text-emerald-700' : 'text-slate-700'}`}>
                  {person.xp}
                </span>
                <span className="text-[10px] font-medium text-slate-400 ml-0.5">XP</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
