import React, { useState } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { formatBytes } from '../../utils/pureLogic';
import { Building, Globe, Instagram, Phone, Mail, Award, Check, HardDrive } from 'lucide-react';

export const PhotographerSettings: React.FC = () => {
  const { photographer, updatePhotographerProfile } = useWedding();
  const [businessName, setBusinessName] = useState(photographer?.businessName || '');
  const [tagline, setTagline] = useState(photographer?.tagline || '');
  const [phone, setPhone] = useState(photographer?.phone || '');
  const [website, setWebsite] = useState(photographer?.website || '');
  const [instagram, setInstagram] = useState(photographer?.instagram || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePhotographerProfile({
      businessName,
      tagline,
      phone,
      website,
      instagram
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const storageUsedPercent = photographer
    ? Math.round((photographer.storageUsedBytes / photographer.storageLimitBytes) * 100)
    : 0;

  return (
    <div className="max-w-3xl space-y-8">
      {/* Studio Profile Form */}
      <div className="bg-white rounded-2xl p-7 border border-[#E8E2D8] shadow-sm">
        <div className="mb-6">
          <h3 className="font-serif-luxury text-xl font-bold text-slate-900">
            Photographer Studio & Branding
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            This branding appears on your wedding QR cards and at the footer of all your guest galleries.
          </p>
        </div>

        {savedSuccess && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Studio profile and branding settings updated!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Studio Business Name
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Lumière Wedding Studios"
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A7B4F] bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  disabled
                  value={photographer?.email || ''}
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-100 text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Studio Tagline / Philosophy
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Fine-art editorial wedding cinematography & photography"
              className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A7B4F] bg-slate-50/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 782-9421"
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A7B4F] bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Website
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://lumierevows.com"
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A7B4F] bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Instagram Handle
              </label>
              <div className="relative">
                <Instagram className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@lumierevows"
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A7B4F] bg-slate-50/50"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#9A7B4F] to-[#B39364] hover:from-[#8A6D43] hover:to-[#A38356] rounded-xl shadow-md transition-all cursor-pointer"
            >
              Save Branding Settings
            </button>
          </div>
        </form>
      </div>

      {/* Storage and Plan Tier */}
      <div className="bg-white rounded-2xl p-7 border border-[#E8E2D8] shadow-sm space-y-4">
        <h3 className="font-serif-luxury text-xl font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-[#9A7B4F]" />
          <span>Subscription & Storage Capacity</span>
        </h3>

        <div className="flex items-center justify-between p-4 bg-[#FAF8F5] rounded-xl border border-[#E8DFC8]">
          <div>
            <div className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Current Plan: <span className="text-[#9A7B4F] font-bold">{photographer?.plan.toUpperCase()}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Unlimited wedding galleries · Unlimited QR guest scans · Priority HD download CDN
            </p>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-slate-400" />
              <span>Cloud Storage Quota</span>
            </span>
            <span className="font-mono text-slate-600">
              {formatBytes(photographer?.storageUsedBytes || 0)} / {formatBytes(photographer?.storageLimitBytes || 500 * 1024 * 1024 * 1024)} ({storageUsedPercent}%)
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#C8A97E] to-[#9A7B4F] rounded-full transition-all duration-500"
              style={{ width: `${Math.max(storageUsedPercent, 3)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
