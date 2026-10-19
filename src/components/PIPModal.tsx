import { AlertTriangle, ShieldAlert, ArrowRight } from 'lucide-react';
import { MascotGerald } from './MascotGerald';
import { MascotMushroom } from './MascotMushroom';
import { store } from '../lib/store';

interface PIPModalProps {
  isOpen: boolean;
  onStartPIPLesson: () => void;
}

export const PIPModal: React.FC<PIPModalProps> = ({ isOpen, onStartPIPLesson }) => {
  if (!isOpen) return null;
  const mascotType = store.getMascotType();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-pop-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border-4 border-rose-500 shadow-2xl overflow-hidden relative transition-colors">
        {/* Urgent Warning Header Stripe */}
        <div className="bg-rose-600 px-6 py-3 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert size={22} className="animate-pulse" />
            <span className="font-black text-sm uppercase tracking-wider">
              Mandatory HR Compliance Alert
            </span>
          </div>
          <span className="bg-rose-800 text-[11px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            PIP-FORM-007
          </span>
        </div>

        <div className="p-6 md:p-8">
          <div className="flex items-start gap-4 mb-5">
            {mascotType === 'mushroom' ? (
              <MascotMushroom mood="wilting" size="sm" speechText="My cap is dried up... HR is monitoring!" />
            ) : (
              <MascotGerald mood="wilting" size="sm" speechText="My leaves... the optics are compromised!" />
            )}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-black text-xs uppercase tracking-wide mb-1">
                <AlertTriangle size={14} /> Morale Depleted (0/5)
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                Performance Improvement Plan (PIP)
              </h2>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-2 mb-6 font-mono">
            <p className="font-bold text-slate-800 dark:text-slate-100">
              TO: Employee #8942 // FROM: Talent & People Operations
            </p>
            <p>
              Your recent translation outputs failed to meet baseline quarterly synergy benchmarks. As a result, your departmental morale has reached zero.
            </p>
            <p>
              Per corporate policy, keycard privileges and free breakroom cold brew have been temporarily throttled. To restore full morale (5/5), you must pass a remedial <strong>Morale Calibration Exercise</strong>.
            </p>
            <p className="text-emerald-700 dark:text-emerald-400 font-bold">
              ✓ Good news: No morale points can be lost during this calibration session.
            </p>
          </div>

          <button
            onClick={onStartPIPLesson}
            className="w-full py-4 px-6 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 active:translate-y-0.5 border-b-4 border-rose-900 text-white font-black text-base rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Begin Mandatory Calibration</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
