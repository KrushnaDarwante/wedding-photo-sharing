import React from 'react';
import { QrCode, UploadCloud, Download, CheckCircle2 } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Create Event & Print QR Table Cards',
      description: 'Set up the couple’s wedding event in 30 seconds. Generate high-resolution QR cards ready for elegant acrylic table stands or welcome banners.',
      icon: QrCode,
      highlights: ['Instant custom QR code', 'PNG and PDF printable tent cards', 'Custom branding and studio logo']
    },
    {
      number: '02',
      title: 'Live & Bulk Upload Photographs',
      description: 'Drag and drop hundreds or thousands of high-resolution photos. Automated thumbnailing prepares fast previews while preserving raw HD originals.',
      icon: UploadCloud,
      highlights: ['Real-time live gallery updates', 'Categorized (Haldi, Ceremony, Reception)', 'Duplicate upload prevention']
    },
    {
      number: '03',
      title: 'Guests Scan, Heart & Download',
      description: 'Guests scan the QR code with their phone camera to instantly browse memories, mark personal favourites, and download individual HD photos or bulk ZIPs.',
      icon: Download,
      highlights: ['Zero guest account or app install needed', 'One-click full event or favourites ZIP', 'WhatsApp and social sharing']
    }
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-[#F4EFE6]/60 border-y border-[#E8E2D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#9A7B4F] uppercase tracking-wider mb-3">
            <span>Seamless Workflow</span>
            <span aria-hidden="true">·</span>
            <span>Zero Guest Friction</span>
          </div>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight text-balance">
            How AuraWed transforms wedding photo delivery
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Designed to eliminate the endless post-wedding messages from guests asking "where can I find the wedding photos?"
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="bg-white rounded-2xl p-8 border border-[#E8E2D8] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-serif-luxury text-2xl font-bold text-[#9A7B4F]">
                      {step.number}
                    </span>
                    <div className="w-12 h-12 rounded-xl bg-[#FAF5EB] flex items-center justify-center text-[#9A7B4F] border border-[#E8DFC8]">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="font-serif-luxury text-xl font-bold text-slate-900 mb-3">
                    {step.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    {step.description}
                  </p>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-slate-100">
                  {step.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-[#9A7B4F] shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
