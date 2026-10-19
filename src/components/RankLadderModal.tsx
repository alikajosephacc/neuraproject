import React from 'react';
import { X, CheckCircle2, Lock, Award } from 'lucide-react';
import { RANKS } from '../lib/ranks';

interface RankLadderModalProps {
  currentXp: number;
  isOpen: boolean;
  onClose: () => void;
}

export const RankLadderModal: React.FC<RankLadderModalProps> = ({
  currentXp,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-pop-in">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Award size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg">Job Title Ladder</h3>
              <p className="text-xs text-slate-500">Corporate hierarchy progression</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Rank List */}
        <div className="p-5 overflow-y-auto space-y-3">
          {RANKS.map((rank) => {
            const isUnlocked = currentXp >= rank.minXp;
            const isCurrent =
              isUnlocked &&
              (rank.index === RANKS.length - 1 || currentXp < RANKS[rank.index + 1].minXp);

            return (
              <div
                key={rank.index}
                className={`p-4 rounded-2xl border-2 transition-all ${
                  isCurrent
                    ? 'border-emerald-500 bg-emerald-50/70 shadow-sm'
                    : isUnlocked
                    ? 'border-slate-200 bg-white opacity-90'
                    : 'border-slate-100 bg-slate-50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl p-2 rounded-xl bg-white shadow-xs border border-slate-100">
                      {rank.badge}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-slate-800 text-base">{rank.title}</h4>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold text-[10px] uppercase tracking-wider">
                            Current Role
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-snug">{rank.blurb}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-slate-700">{rank.minXp} XP</span>
                    <div className="mt-1">
                      {isUnlocked ? (
                        <CheckCircle2 size={18} className="text-emerald-600 ml-auto" />
                      ) : (
                        <Lock size={16} className="text-slate-400 ml-auto" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
