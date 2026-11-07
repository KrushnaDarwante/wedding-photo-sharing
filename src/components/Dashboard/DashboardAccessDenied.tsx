import React from 'react';
import { ShieldAlert, Lock, ArrowLeft, KeyRound } from 'lucide-react';

interface DashboardAccessDeniedProps {
  onOpenLogin: () => void;
  onReturnHome: () => void;
}

export const DashboardAccessDenied: React.FC<DashboardAccessDeniedProps> = ({
  onOpenLogin,
  onReturnHome
}) => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-lg w-full border border-[#E8E2D8] shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#FAF5EB] border border-[#E8DFC8] mx-auto flex items-center justify-center text-[#800020] shadow-sm">
          <ShieldAlert className="w-8 h-8 text-[#800020]" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#800020] uppercase tracking-wider bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            <Lock className="w-3.5 h-3.5" />
            <span>Restricted Studio Owner Portal</span>
          </div>

          <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-slate-900">
            Owner Authorization Required
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            This administrative dashboard is strictly restricted to the verified photographer and studio owner of Vedic Vows & Royal Indian Weddings. Guests and public visitors have secure read-only access to published wedding galleries.
          </p>
        </div>

        <div className="p-4 bg-[#FCF9F2] rounded-2xl border border-[#E8DFC8] text-xs text-slate-700 text-left space-y-2">
          <div className="font-semibold text-[#800020] flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Security & Access Controls:</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-600">
            <li>Guests cannot create, edit, or delete wedding events or photographs.</li>
            <li>Database configuration and cloud storage controls are owner-only.</li>
            <li>All administrative routes require valid studio credentials.</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onOpenLogin}
            className="w-full sm:w-auto px-6 py-3 text-xs font-semibold text-white bg-[#800020] hover:bg-[#660019] rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Studio Owner Sign In</span>
          </button>

          <button
            onClick={onReturnHome}
            className="w-full sm:w-auto px-5 py-3 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
