import React, { useState, useEffect } from 'react';
import { useWedding } from '../context/WeddingContext';
import { generateQRCodeDataUrl } from '../lib/qrHelper';
import { ArrowRight, QrCode, ShieldCheck, Zap, DownloadCloud, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenAuth }) => {
  const { events, setCurrentView, photographer } = useWedding();
  const [demoQrUrl, setDemoQrUrl] = useState<string>('');

  const featuredEvent = events[0] || null;

  useEffect(() => {
    if (featuredEvent) {
      const fullUrl = `${window.location.origin}${window.location.pathname}?gallery=${featuredEvent.slug}`;
      generateQRCodeDataUrl(fullUrl, { width: 320 })
        .then(setDemoQrUrl)
        .catch(() => {});
    }
  }, [featuredEvent]);

  const handleLaunchGuestDemo = () => {
    if (featuredEvent) {
      setCurrentView({ type: 'guest-gallery', eventSlug: featuredEvent.slug });
    }
  };

  const handlePhotographerAction = () => {
    if (photographer) {
      setCurrentView({ type: 'dashboard' });
    } else {
      onOpenAuth('register');
    }
  };

  return (
    <section className="relative overflow-hidden pt-10 pb-20 lg:pt-16 lg:pb-28">
      {/* Subtle warm backdrop glow */}
      <div className="absolute top-0 right-1/4 -z-10 w-96 h-96 bg-[#EBDBC2]/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 -z-10 w-80 h-80 bg-[#E2D8EB]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Split Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Typographic Hierarchy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-xs font-medium text-[#9A7B4F] tracking-wide uppercase">
              <span>Wedding Photo SaaS</span>
              <span aria-hidden="true">·</span>
              <span>For Professional Photographers</span>
              <span aria-hidden="true">·</span>
              <span>Instant QR Delivery</span>
            </div>

            <h1 className="font-serif-luxury text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.12] text-balance">
              Give wedding guests <span className="italic font-normal text-[#9A7B4F]">instant access</span> to every breathtaking photo.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              Photographers upload curated, high-definition wedding photos in real-time. Guests simply scan their table QR code to view and download full-resolution memories—with zero apps, zero login friction, and strict photographer-only upload security.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={handlePhotographerAction}
                className="px-6 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-[#1E1B18] to-[#36322D] hover:from-[#110F0D] hover:to-[#221F1B] rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 group cursor-pointer"
              >
                <span>{photographer ? 'Go to Studio Dashboard' : 'Launch Photographer Studio'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={handleLaunchGuestDemo}
                className="px-6 py-3.5 text-sm font-semibold text-slate-800 bg-white hover:bg-[#FAF5EB] border border-[#E3DAC9] rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-[#9A7B4F]" />
                <span>Test Live Guest Gallery</span>
              </button>
            </div>

            {/* Strict Business Rules & Assurance Strip */}
            <div className="pt-4 border-t border-[#E8E2D8] flex flex-wrap items-center gap-6 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Strict Photographer-Only Uploads</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#9A7B4F] shrink-0" />
                <span>Real-Time Live Photo Feed</span>
              </div>
              <div className="flex items-center gap-2">
                <DownloadCloud className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Original HD Bulk ZIP Downloads</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Showcase & Interactive QR Table Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-[#E8E2D8] bg-white group">
              <img
                src="/src/assets/images/hero_wedding_couple_1793789594998.jpg"
                alt="Elena and Christian Luxury Wedding"
                className="w-full h-[440px] sm:h-[480px] object-cover group-hover:scale-102 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Event caption overlay */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white/95">
                <span className="text-xs font-medium tracking-wide uppercase bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20">
                  Live Wedding Preview
                </span>
                <span className="text-xs bg-[#C8A97E] text-slate-900 font-semibold px-2.5 py-1 rounded-lg shadow-sm">
                  8 HD Photos Online
                </span>
              </div>

              {/* Interactive QR Floating Badge */}
              <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-xl border border-[#E8E2D8] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  {demoQrUrl ? (
                    <img
                      src={demoQrUrl}
                      alt="Sample Wedding QR Code"
                      className="w-14 h-14 rounded-lg border border-slate-200 shadow-sm shrink-0 bg-white p-1"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                      <QrCode className="w-8 h-8 text-slate-400" />
                    </div>
                  )}
                  <div>
                    <h2 className="font-serif-luxury text-base font-bold text-slate-900 leading-tight">
                      Elena & Christian
                    </h2>
                    <p className="text-xs text-slate-500">
                      Villa Corsini, Florence · 18 Oct 2026
                    </p>
                    <p className="text-[11px] text-[#9A7B4F] font-semibold flex items-center gap-1 mt-0.5">
                      <Sparkles className="w-3 h-3" />
                      Scan or tap to preview gallery
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLaunchGuestDemo}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-[#1E1B18] hover:bg-[#36322D] rounded-lg transition-colors shrink-0 shadow-sm cursor-pointer"
                >
                  View
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Metric Proof Strip Below Split */}
        <div className="mt-16 pt-10 border-t border-[#E8E2D8] grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="font-serif-luxury text-3xl sm:text-4xl font-bold text-slate-900 tabular-nums">
              0 sec
            </div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Guest App Install Time
            </div>
          </div>
          <div>
            <div className="font-serif-luxury text-3xl sm:text-4xl font-bold text-slate-900 tabular-nums">
              100%
            </div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Original HD Quality
            </div>
          </div>
          <div>
            <div className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#9A7B4F] tabular-nums">
              Zero
            </div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Guest Upload Intrusion
            </div>
          </div>
          <div>
            <div className="font-serif-luxury text-3xl sm:text-4xl font-bold text-slate-900 tabular-nums">
              1-Click
            </div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Full Event ZIP Download
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
