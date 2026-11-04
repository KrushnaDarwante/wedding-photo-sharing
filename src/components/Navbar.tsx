import React from 'react';
import { useWedding } from '../context/WeddingContext';
import { Camera, Sparkles, LogOut, LayoutDashboard, QrCode } from 'lucide-react';

interface NavbarProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenSupabaseConfig: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, onOpenSupabaseConfig }) => {
  const { photographer, currentView, setCurrentView, logout, events } = useWedding();

  const handleDemoGalleryClick = () => {
    if (events.length > 0) {
      setCurrentView({ type: 'guest-gallery', eventSlug: events[0].slug });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8E2D8] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark (single text element) */}
        <button
          onClick={() => setCurrentView({ type: 'home' })}
          className="flex items-center gap-2.5 text-left group cursor-pointer"
          aria-label="AuraWed Home"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#C8A97E] via-[#D8BC93] to-[#E5CCA8] p-0.5 shadow-sm">
            <div className="w-full h-full bg-[#FAF8F5] rounded-[10px] flex items-center justify-center">
              <Camera className="w-5 h-5 text-[#9A7B4F]" />
            </div>
          </div>
          <div>
            <span className="font-serif-luxury text-2xl font-bold tracking-tight text-slate-900 group-hover:text-[#9A7B4F] transition-colors">
              AuraWed
            </span>
          </div>
        </button>

        {/* Zone 2: 4-5 clean single-line nav links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <button
            onClick={() => {
              if (currentView.type !== 'home') setCurrentView({ type: 'home' });
              setTimeout(() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }, 50);
            }}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            How It Works
          </button>
          <button
            onClick={() => {
              if (currentView.type !== 'home') setCurrentView({ type: 'home' });
              setTimeout(() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }, 50);
            }}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Features
          </button>
          <button
            onClick={handleDemoGalleryClick}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer text-[#9A7B4F] font-semibold"
          >
            <QrCode className="w-3.5 h-3.5" />
            Live Guest Demo
          </button>
          <button
            onClick={() => {
              if (currentView.type !== 'home') setCurrentView({ type: 'home' });
              setTimeout(() => {
                document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
              }, 50);
            }}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Pricing
          </button>
          <button
            onClick={onOpenSupabaseConfig}
            className="text-xs text-slate-500 hover:text-slate-700 transition-colors whitespace-nowrap shrink-0"
            title="Database & Storage Settings"
          >
            Cloud DB
          </button>
          <a
            href="/aurawed-wedding-saas.zip"
            download="aurawed-wedding-saas.zip"
            className="text-xs font-semibold text-[#8B6D43] bg-[#F5EFE6] hover:bg-[#EBDDC8] px-2.5 py-1 rounded-lg border border-[#E0D4C0] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1"
            title="Download Complete Source Code ZIP"
          >
            <span>Project ZIP</span>
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {photographer ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView({ type: 'dashboard' })}
                className="px-4 py-2.5 text-xs font-semibold text-white bg-[#1A1816] hover:bg-[#2D2A26] rounded-xl shadow-sm transition-all flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#E5CCA8]" />
                <span>Studio Dashboard</span>
              </button>
              <button
                onClick={logout}
                className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 rounded-xl transition-colors cursor-pointer"
                title="Log Out"
                aria-label="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-[#EFEAE1]/60 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-4 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#9A7B4F] to-[#B39364] hover:from-[#8A6D43] hover:to-[#A38356] rounded-xl shadow-sm transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>Photographer Portal</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
