import React from 'react';
import { Camera, TrendingUp, ShieldAlert, Award } from 'lucide-react';

export const PhotographerBenefits: React.FC = () => {
  const benefits = [
    {
      icon: TrendingUp,
      title: 'Turn 200 Guests into Inbound Bookings',
      description: 'Every guest who scans the QR code sees your studio branding, website, and Instagram handle. Deliver the photos directly to the very people planning future weddings.'
    },
    {
      icon: Camera,
      title: 'Deliver Same-Night Reception Teasers',
      description: 'Upload 15-20 edited teaser shots right from your laptop during dinner. Watch guests gasp with delight as your photos appear live on their screens.'
    },
    {
      icon: ShieldAlert,
      title: 'Pristine Curation with Zero Guest Junk',
      description: 'Say goodbye to messy shared Google Drives or WhatsApp groups flooded with blurry selfies. AuraWed enforces strict photographer-only upload authority.'
    },
    {
      icon: Award,
      title: 'Elevate Your Client Experience',
      description: 'Couples love placing our custom acrylic QR table cards at their reception tables. It adds an ultra-modern luxury touch that sets your studio apart.'
    }
  ];

  return (
    <section className="py-20 lg:py-28 bg-[#F5EFE6]/50 border-y border-[#E8E2D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#9A7B4F] uppercase tracking-wider">
              <span>Studio Growth Engine</span>
            </div>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight text-balance">
              Built by wedding photographers, for wedding photographers
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Most photo sharing tools are either messy consumer albums or rigid client delivery portals. AuraWed bridges the gap: a live, elegant guest experience that highlights your studio artistry while saving hours of post-wedding follow-ups.
            </p>

            <div className="pt-2">
              <div className="p-5 bg-white rounded-2xl border border-[#E8E2D8] shadow-sm flex items-start gap-4">
                <img
                  src="/assets/images/photographer_avatar_1793789596829.jpg"
                  alt="Clara Dupont"
                  className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <p className="text-xs sm:text-sm text-slate-700 italic">
                    "At our last destination wedding in Lake Como, over 180 guests scanned the table QR code before dessert was served. We booked two sister weddings within three weeks."
                  </p>
                  <p className="text-xs font-semibold text-slate-900 mt-2">
                    Clara Dupont · Lumière Wedding Studios
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {benefits.map((b, idx) => {
              const Icon = b.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 border border-[#E8E2D8] shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#FAF5EB] border border-[#E8DFC8] flex items-center justify-center text-[#9A7B4F] mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif-luxury text-base font-bold text-slate-900 mb-2">
                    {b.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {b.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
