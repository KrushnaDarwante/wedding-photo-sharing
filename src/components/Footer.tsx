import React from 'react';
import { Camera, Heart, Lock, LayoutDashboard, LogOut } from 'lucide-react';
import { useWedding } from '../context/WeddingContext';
import { isStudioOwner } from '../utils/pureLogic';

interface FooterProps {
  onOpenAuth: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAuth }) => {
  const { setCurrentView, events, photographer, logout } = useWedding();
  const isOwner = photographer && isStudioOwner(photographer.id);

  return (
    <footer className="bg-[#191715] text-[#E0D8CB] pt-16 pb-12 border-t border-[#2E2A26]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#2E2A26]">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#C8A97E] flex items-center justify-center text-slate-900">
                <Camera className="w-4 h-4" />
              </div>
              <span className="font-serif-luxury text-xl font-bold tracking-tight text-white">
                AuraWed
              </span>
            </div>
            <p className="text-xs text-[#B5A998] leading-relaxed max-w-sm">
              The dedicated wedding photo sharing platform built exclusively for Vedic Vows & Royal Indian Weddings and our couples. Instant QR codes, live reception feeds, and full-resolution memories.
            </p>
            <div className="text-[11px] text-[#8E8272] flex items-center gap-1.5 pt-1">
              <span>Strict Rule: Only verified studio owner uploads</span>
              <span aria-hidden="true">·</span>
              <span>Guests enjoy read-only galleries</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Explore
            </h4>
            <ul className="space-y-2 text-xs text-[#B5A998]">
              <li>
                <button
                  onClick={() => {
                    setCurrentView({ type: 'home' });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              {events.length > 0 && (
                <li>
                  <button
                    onClick={() => setCurrentView({ type: 'guest-gallery', eventSlug: events[0].slug })}
                    className="hover:text-white transition-colors cursor-pointer text-[#C8A97E]"
                  >
                    Demo Guest Gallery
                  </button>
                </li>
              )}
              <li>
                <button
                  onClick={() => {
                    setCurrentView({ type: 'home' });
                    setTimeout(() => {
                      document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView({ type: 'home' });
                    setTimeout(() => {
                      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Features & Security
                </button>
              </li>
            </ul>
          </div>

          {/* Studio Owner Portal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#C8A97E]" />
              <span>Studio Owner</span>
            </h4>
            <ul className="space-y-2 text-xs text-[#B5A998]">
              {isOwner ? (
                <>
                  <li>
                    <button
                      onClick={() => setCurrentView({ type: 'dashboard' })}
                      className="hover:text-white transition-colors cursor-pointer text-[#C8A97E] flex items-center gap-1.5"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>Studio Dashboard</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={logout}
                      className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-slate-400"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <button
                    onClick={onOpenAuth}
                    className="hover:text-white transition-colors cursor-pointer text-[#C8A97E]"
                  >
                    Studio Owner Sign In
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8E8272]">
          <p>© {new Date().getFullYear()} AuraWed SaaS. Crafted for timeless wedding memories.</p>
          <div className="flex items-center gap-1">
            <span>Designed with care</span>
            <Heart className="w-3.5 h-3.5 text-[#C8A97E] fill-[#C8A97E]" />
            <span>for wedding storytellers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
