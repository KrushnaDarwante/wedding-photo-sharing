import React, { useState } from 'react';
import { useWedding } from '../context/WeddingContext';
import { X, Sparkles, Mail, Lock, Building, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login'
}) => {
  const { login, register, loginAsDemo } = useWedding();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studioName, setStudioName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (res.success) {
          onClose();
        } else {
          setError(res.error || 'Invalid credentials.');
        }
      } else if (mode === 'register') {
        const res = await register(email, password, studioName);
        if (res.success) {
          onClose();
        } else {
          setError(res.error || 'Registration failed.');
        }
      } else if (mode === 'forgot') {
        if (!email || !email.includes('@')) {
          setError('Please provide a valid registered email address.');
        } else {
          setSuccessMsg(`A password reset link has been dispatched to ${email}. Check your inbox!`);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = () => {
    loginAsDemo();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full p-7 border border-[#E8E2D8] shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="text-xs font-semibold text-[#9A7B4F] uppercase tracking-wider mb-1">
            Photographer Portal
          </div>
          <h2 className="font-serif-luxury text-2xl font-bold text-slate-900">
            {mode === 'login' && 'Sign in to your studio'}
            {mode === 'register' && 'Create your studio account'}
            {mode === 'forgot' && 'Reset your password'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'login' && 'Manage your wedding galleries, QR codes, and photo uploads.'}
            {mode === 'register' && 'Start delivering instant QR galleries to couples and wedding guests.'}
            {mode === 'forgot' && 'Enter your email to receive recovery instructions.'}
          </p>
        </div>

        {/* Demo Studio Instant Login Banner */}
        <div className="mb-5 p-3.5 bg-[#FAF5EB] rounded-xl border border-[#E8DFC8] flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-[#8B6D43] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant Studio Preview</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Log in as Clara (Lumière Wedding Studios) with preloaded events
            </p>
          </div>
          <button
            type="button"
            onClick={handleDemoClick}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-[#9A7B4F] hover:bg-[#85673E] rounded-lg transition-colors shrink-0 shadow-sm cursor-pointer"
          >
            Demo Login
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Studio or Photographer Name
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  placeholder="e.g. Lumière Wedding Films"
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A7B4F] bg-slate-50/50"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="photographer@studio.com"
                className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A7B4F] bg-slate-50/50"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(null); }}
                    className="text-[11px] text-[#9A7B4F] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A7B4F] bg-slate-50/50"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 text-xs font-semibold text-white bg-gradient-to-r from-[#1E1B18] to-[#36322D] hover:from-[#110F0D] hover:to-[#221F1B] rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Studio Account' : 'Send Reset Link'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          {mode === 'login' && (
            <p>
              New to AuraWed?{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); setError(null); }}
                className="font-semibold text-[#9A7B4F] hover:underline cursor-pointer"
              >
                Create studio account
              </button>
            </p>
          )}
          {mode === 'register' && (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className="font-semibold text-[#9A7B4F] hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </p>
          )}
          {mode === 'forgot' && (
            <p>
              Remembered your password?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className="font-semibold text-[#9A7B4F] hover:underline cursor-pointer"
              >
                Return to sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
