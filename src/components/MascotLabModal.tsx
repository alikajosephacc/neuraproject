import React, { useState } from 'react';
import { X, Sparkles, Download, ExternalLink, RefreshCw, Zap } from 'lucide-react';
import { MascotMushroom } from './MascotMushroom';
import { MascotMood } from '../types';
import { store } from '../lib/store';
import { sound } from '../lib/sound';

interface MascotLabModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MascotLabModal: React.FC<MascotLabModalProps> = ({ isOpen, onClose }) => {
  const [testMood, setTestMood] = useState<MascotMood>('neutral');
  const [activeTab, setActiveTab] = useState<'interactive' | 'lottie' | 'references'>('interactive');
  const [tapCount, setTapCount] = useState(0);

  if (!isOpen) return null;

  const currentMascot = store.getMascotType();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-pop-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border-2 border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-600 flex items-center justify-center text-xl shadow-xs text-white">
              🍄
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base">
                Pip the Agile Mushroom
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                Duolingo Vector Mascot & Creative Technologist Studio
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 gap-2 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-black">
          <button
            onClick={() => setActiveTab('interactive')}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'interactive'
                ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            🕹️ Rive State Machine Lab
          </button>
          <button
            onClick={() => setActiveTab('lottie')}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'lottie'
                ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            📦 Lottie Bodymovin Spec
          </button>
          <button
            onClick={() => setActiveTab('references')}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'references'
                ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            📚 Case Study Notes
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'interactive' && (
            <div className="space-y-6">
              {/* Mascot Stage */}
              <div className="bg-gradient-to-b from-rose-50/60 to-slate-50/80 dark:from-rose-950/20 dark:to-slate-850/40 rounded-3xl p-6 border border-rose-100/80 dark:border-rose-950/60 flex flex-col items-center justify-center relative overflow-hidden">
                <span className="absolute top-3 left-4 text-[10px] font-mono uppercase tracking-wider text-rose-500 dark:text-rose-400 font-bold">
                  Runtime State: {testMood} • Taps: {tapCount}
                </span>

                <MascotMushroom
                  mood={testMood}
                  size="hero"
                  interactive={true}
                  onTap={() => setTapCount((c) => c + 1)}
                />

                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-3 text-center">
                  💡 Move your cursor to see eyes track you. Click or tap Pip to trigger squash-and-stretch jump physics!
                </p>
              </div>

              {/* State Machine Switcher Controls */}
              <div className="space-y-2.5">
                <span className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  Rive State Machine Inputs:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setTestMood('thriving');
                    }}
                    className={`py-2.5 px-3 rounded-2xl font-black text-xs border-2 transition-all cursor-pointer ${
                      testMood === 'thriving'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-500 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    👑 State: Thriving
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setTestMood('neutral');
                    }}
                    className={`py-2.5 px-3 rounded-2xl font-black text-xs border-2 transition-all cursor-pointer ${
                      testMood === 'neutral'
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-500 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    😐 State: Neutral
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setTestMood('wilting');
                    }}
                    className={`py-2.5 px-3 rounded-2xl font-black text-xs border-2 transition-all cursor-pointer ${
                      testMood === 'wilting'
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-500 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    🥀 State: Wilting
                  </button>
                </div>
              </div>

              {/* Set as Active Companion Mascot Toggle */}
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-black text-xs text-slate-800 dark:text-slate-200">
                    Active Companion Mascot in App
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Currently selected: <strong>{currentMascot === 'mushroom' ? '🍄 Pip (Mushroom)' : '🪴 Gerald (Ficus)'}</strong>
                  </p>
                </div>

                <button
                  onClick={() => {
                    sound.playClick();
                    store.toggleMascot();
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 active:translate-y-0.5 text-white font-black text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw size={14} />
                  <span>Switch Mascot</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'lottie' && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                    public/animations/mushroom-lottie.json
                  </span>
                  <a
                    href="/animations/mushroom-lottie.json"
                    download="mushroom-lottie.json"
                    className="flex items-center gap-1 text-[11px] font-black text-rose-600 dark:text-rose-400 hover:underline"
                  >
                    <Download size={13} />
                    <span>Download JSON</span>
                  </a>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Compliant with Bodymovin / LottieFiles specifications (60fps, 120-frame loop, vector bezier shapes, procedural eye-blink and squash transforms).
                </p>
              </div>

              {/* Preview Illustration */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col items-center p-4 bg-white dark:bg-slate-800">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                  Generated Duolingo Vector Illustration:
                </span>
                <img
                  src="/images/duolingo_mushroom.png"
                  alt="Duolingo Style White and Red Mushroom"
                  className="w-48 h-48 object-contain rounded-xl drop-shadow-md"
                />
              </div>
            </div>
          )}

          {activeTab === 'references' && (
            <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between font-black text-slate-900 dark:text-slate-100">
                  <span className="flex items-center gap-1.5">
                    <Zap size={16} className="text-amber-500" />
                    1. Rive: Creative Technologist Handoff
                  </span>
                  <a
                    href="https://rive.app/blog/creative-technologists-duolingo-s-solution-to-the-designer-to-developer-handoff"
                    target="_blank"
                    rel="noreferrer"
                    className="text-rose-600 dark:text-rose-400 flex items-center gap-1 hover:underline font-bold"
                  >
                    <span>Read Article</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
                <p>
                  Duolingo established the <strong>Creative Technologist</strong> role to bridge animation designers and front-end engineers. Rather than static video files or mockups, characters are authored with dynamic <strong>State Machines</strong> that listen to runtime inputs (cursor positions, happiness triggers, phonetic states).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between font-black text-slate-900 dark:text-slate-100">
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={16} className="text-emerald-500" />
                    2. LottieFiles: Delight in Duolingo's DNA
                  </span>
                  <a
                    href="https://lottiefiles.com/case-studies/duolingo"
                    target="_blank"
                    rel="noreferrer"
                    className="text-rose-600 dark:text-rose-400 flex items-center gap-1 hover:underline font-bold"
                  >
                    <span>Read Case Study</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
                <p>
                  Duolingo utilizes Lottie vector files across mobile and web for lightweight reward bursts, streak milestones, and playful feedback without bloating app bundle sizes or sacrificing 60fps render performance.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
