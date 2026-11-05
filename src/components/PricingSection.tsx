import React from 'react';
import { useWedding } from '../context/WeddingContext';
import { QrCode, HardDrive, DownloadCloud, Sparkles, Check, ArrowRight } from 'lucide-react';

interface PricingSectionProps {
  onOpenAuth: (mode?: 'login' | 'forgot') => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onOpenAuth }) => {
  const { photographer, events, setCurrentView } = useWedding();

  const handleDemoGallery = () => {
    if (events.length > 0) {
      setCurrentView({ type: 'guest-gallery', eventSlug: events[0].slug });
    }
  };

  const pillars = [
    {
      icon: QrCode,
      tag: 'Guest Experience',
      title: 'Instant QR Table Access',
      subtitle: 'Zero app friction for 3,000+ wedding attendees',
      description: 'Guests simply scan bespoke acrylic table QR codes to view live-updating wedding ceremonies and receptions on their phones.',
      highlights: [
        'No app downloads or guest sign-ups required',
        'Strict read-only security — zero guest junk uploads',
        'Instant photo favouriting & social sharing',
        'Real-time live photo feed as pictures are taken'
      ],
      highlight: false
    },
    {
      icon: HardDrive,
      tag: 'Scale & Performance',
      title: '15,000+ Photo Cloud Engine',
      subtitle: 'Engineered for full-scale luxury wedding coverage',
      description: 'High-throughput architecture separating original camera RAW/HD files from responsive WebP thumbnails with zero browser crashes.',
      highlights: [
        'Separated original master & responsive WebP storage',
        'Progressive windowed DOM pagination (36-slice batching)',
        'Magic header validation & SHA-256 deduplication',
        'Zero egress cost CDN delivery via Cloudflare R2'
      ],
      highlight: true,
      badge: 'Engineered for Scale'
    },
    {
      icon: DownloadCloud,
      tag: 'Effortless Archival',
      title: 'Multi-Volume Partitioned ZIPs',
      subtitle: 'Lossless original HD downloads for couples & families',
      description: 'Download entire collections with automatic chunking into manageable 50-photo volumes to prevent browser memory exhaustion.',
      highlights: [
        'Original resolution camera captures preserved',
        'Volume-chunked ZIPs for reliable downloads',
        'Single photo full-res download anytime',
        'Print-quality preservation for family albums'
      ],
      highlight: false
    }
  ];

  return (
    <section id="experience" className="py-20 lg:py-28 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#9A7B4F] uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Studio Delivery Architecture</span>
          </div>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight text-balance">
            Engineered for unforgettable celebrations of any scale
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            A dedicated, high-performance wedding platform crafted exclusively for Lumière Wedding Studios. Built to effortlessly handle 15,000+ photos and 3,000+ simultaneous guests with zero paywalls.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className={`rounded-2xl p-8 flex flex-col justify-between transition-all relative ${
                  pillar.highlight
                    ? 'bg-white border-2 border-[#9A7B4F] shadow-xl md:-translate-y-2'
                    : 'bg-white border border-[#E8E2D8] shadow-sm hover:shadow-md'
                }`}
              >
                {pillar.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#9A7B4F] to-[#B39364] text-white text-[11px] font-semibold px-3.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-200" />
                    <span>{pillar.badge}</span>
                  </div>
                )}

                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#FAF5EB] border border-[#E8DFC8] flex items-center justify-center text-[#9A7B4F] mb-6">
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="text-[11px] font-bold text-[#9A7B4F] uppercase tracking-wider mb-1">
                    {pillar.tag}
                  </div>

                  <h3 className="font-serif-luxury text-2xl font-bold text-slate-900 leading-snug">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1 mb-4">
                    {pillar.subtitle}
                  </p>

                  <p className="text-xs text-slate-600 leading-relaxed mb-6">
                    {pillar.description}
                  </p>

                  <div className="space-y-3 pt-6 border-t border-slate-100">
                    {pillar.highlights.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <Check className="w-4 h-4 text-[#9A7B4F] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 mt-6 border-t border-slate-100">
                  <button
                    onClick={handleDemoGallery}
                    className={`w-full py-3 px-4 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      pillar.highlight
                        ? 'bg-gradient-to-r from-[#9A7B4F] to-[#B39364] hover:from-[#8A6D43] hover:to-[#A38356] text-white shadow-md'
                        : 'bg-[#1E1B18] hover:bg-[#36322D] text-white'
                    }`}
                  >
                    <span>Preview Live Experience</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-14 p-6 sm:p-8 bg-[#FAF5EB] rounded-2xl border border-[#E8DFC8] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-serif-luxury text-lg font-bold text-slate-900">
              Private Studio Management for Lumière Wedding Studios
            </h4>
            <p className="text-xs text-slate-600">
              Only authorized studio photographers can upload or manage wedding events. Wedding guests enjoy free, unlimited read-only access.
            </p>
          </div>

          <button
            onClick={() => {
              if (photographer) {
                setCurrentView({ type: 'dashboard' });
              } else {
                onOpenAuth('login');
              }
            }}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-[#1E1B18] hover:bg-[#36322D] rounded-xl shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {photographer ? 'Studio Dashboard' : 'Studio Owner Login'}
          </button>
        </div>
      </div>
    </section>
  );
};
