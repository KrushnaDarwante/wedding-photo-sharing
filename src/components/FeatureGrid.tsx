import React from 'react';
import {
  Lock,
  Radio,
  QrCode,
  FolderArchive,
  Layers,
  Heart,
  Share2,
  BarChart3,
  SlidersHorizontal
} from 'lucide-react';

export const FeatureGrid: React.FC = () => {
  const features = [
    {
      icon: Lock,
      title: 'Photographer-Only Authorization',
      description: 'Guests can NEVER upload, modify, or delete photos. Only the authenticated photographer has full control over their gallery.',
      badge: 'Core Security'
    },
    {
      icon: Radio,
      title: 'Real-Time Live Photo Feed',
      description: 'Whenever you upload photos during cocktail hour or reception, open guest galleries update automatically without requiring a refresh.',
      badge: 'Live Sync'
    },
    {
      icon: QrCode,
      title: 'Instant QR Code Generation',
      description: 'Generate unique, high-resolution QR codes in seconds. Download clean PNGs or printable table cards ready for reception centerpieces.',
      badge: 'Table Tents'
    },
    {
      icon: FolderArchive,
      title: 'Bulk ZIP Download System',
      description: 'Guests can download individual HD originals, select favorite photos for a custom ZIP, or download the entire event in one single archive.',
      badge: 'Full Quality'
    },
    {
      icon: Layers,
      title: 'Event Ritual Categories',
      description: 'Sort photos cleanly into Haldi, Mehndi, Sangeet, Ceremony, Reception, Portraits, and Cocktail tabs for effortless guest browsing.',
      badge: 'Organized'
    },
    {
      icon: Heart,
      title: 'Personal Guest Favourites',
      description: 'Guests tap the heart icon on their favorite memories to curate a private collection and download all favorites in a single click.',
      badge: 'Convenience'
    },
    {
      icon: SlidersHorizontal,
      title: 'Automated Full-Screen Slideshow',
      description: 'Transform any television, tablet, or projector into an automatic wedding memory slideshow with customizable slide durations.',
      badge: 'Display Ready'
    },
    {
      icon: Share2,
      title: 'Native & WhatsApp Sharing',
      description: 'Deep-link directly to individual photos with custom wedding titles and instant sharing to family WhatsApp groups and messaging apps.',
      badge: 'Viral Reach'
    },
    {
      icon: BarChart3,
      title: 'Studio Event Analytics',
      description: 'Track gallery visitors, most viewed ceremony shots, total bulk downloads, and storage usage across all your wedding bookings.',
      badge: 'Insights'
    }
  ];

  return (
    <section id="features" className="py-20 lg:py-28 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#9A7B4F] uppercase tracking-wider mb-3">
            <span>Built for Modern Wedding Studios</span>
          </div>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight text-balance">
            Every feature you need, with none of the clutter
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            AuraWed focuses exclusively on high-speed photographer uploads, instant QR access, and effortless guest downloads.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-7 border border-[#E8E2D8] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-xl bg-[#FAF5EB] border border-[#E8DFC8] flex items-center justify-center text-[#9A7B4F]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold text-[#8B6D43] bg-[#F7F2E7] px-2.5 py-0.5 rounded-md">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="font-serif-luxury text-lg font-bold text-slate-900 mb-2">
                    {feat.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
