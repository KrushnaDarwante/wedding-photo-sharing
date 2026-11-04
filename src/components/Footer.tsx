import React from 'react';
import { Camera, Heart } from 'lucide-react';
import { useWedding } from '../context/WeddingContext';

interface FooterProps {
  onOpenAuth: () => void;
  onOpenSupabaseConfig: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAuth, onOpenSupabaseConfig }) => {
  const { setCurrentView, events } = useWedding();

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
              The premium wedding photo sharing platform built exclusively for professional photographers and their couples. Instant QR codes, live reception feeds, and full-resolution bulk downloads.
            </p>
            <div className="text-[11px] text-[#8E8272] flex items-center gap-1.5 pt-1">
              <span>Strict Rule: Only photographers upload</span>
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
                      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Pricing & Plans
                </button>
              </li>
              <li>
                <a
                  href="/aurawed-wedding-saas.zip"
                  download="aurawed-wedding-saas.zip"
                  className="hover:text-white transition-colors cursor-pointer text-[#C8A97E] flex items-center gap-1"
                >
                  Download Source Code (ZIP)
                </a>
              </li>
            </ul>
          </div>

          {/* Photographer Studio */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Photographer Portal
            </h4>
            <ul className="space-y-2 text-xs text-[#B5A998]">
              <li>
                <button
                  onClick={() => onOpenAuth()}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Studio Login
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView({ type: 'dashboard' })}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Photographer Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenSupabaseConfig}
                  className="hover:text-white transition-colors cursor-pointer text-[#C8A97E]"
                >
                  Supabase & Cloud Storage
                </button>
              </li>
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
