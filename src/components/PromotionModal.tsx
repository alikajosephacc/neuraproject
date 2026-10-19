import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Check, Copy, Sparkles, X } from 'lucide-react';
import { RANKS } from '../lib/ranks';
import { sound } from '../lib/sound';

interface PromotionModalProps {
  rankIndex: number | null;
  onClose: () => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({ rankIndex, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (rankIndex === null) return null;
  const rank = RANKS[rankIndex] || RANKS[0];

  // Fire confetti
  useEffect(() => {
    sound.playFanfare();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignore if canvas-confetti fails
    }
  }, [rankIndex]);

  const handleCopy = () => {
    navigator.clipboard.writeText(rank.linkedInAnnouncement);
    setCopied(true);
    sound.playClick();
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-pop-in">
      <div className="bg-white rounded-3xl max-w-xl w-full border-4 border-emerald-500 shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={22} className="text-amber-300 animate-spin" />
            <span className="font-black text-sm uppercase tracking-wider">
              Corporate Promotion Unlocked!
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto space-y-5">
          {/* Badge & Title */}
          <div className="text-center space-y-2">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-4xl shadow-inner animate-bounce-short">
              {rank.badge}
            </div>
            <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs uppercase tracking-wider">
              Level {rank.index} Title
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {rank.title}
            </h2>
            <p className="text-slate-600 text-sm italic font-medium max-w-md mx-auto">
              "{rank.blurb}"
            </p>
          </div>

          {/* LinkedIn Style Post Card */}
          <div className="bg-slate-50 border-2 border-blue-200 rounded-2xl p-4 sm:p-5 relative">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
              <div className="w-7 h-7 rounded bg-[#0a66c2] flex items-center justify-center text-white font-black text-xs">
                in
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Your Fictional LinkedIn Post</p>
                <p className="text-[10px] text-slate-400">Ready to copy & share</p>
              </div>
            </div>

            <pre className="text-xs font-sans text-slate-800 whitespace-pre-wrap leading-relaxed select-all bg-white p-3.5 rounded-xl border border-slate-200">
              {rank.linkedInAnnouncement}
            </pre>

            <button
              onClick={handleCopy}
              className={`mt-3 w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-300'
              }`}
            >
              {copied ? (
                <>
                  <Check size={16} />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>Copy Satirical LinkedIn Post</span>
                </>
              )}
            </button>
          </div>

          {/* Close / Continue Button */}
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:translate-y-0.5 border-b-4 border-emerald-800 text-white font-black text-sm rounded-2xl shadow-md transition-all cursor-pointer"
          >
            Back to the Corporate Grind 🚀
          </button>
        </div>
      </div>
    </div>
  );
};
