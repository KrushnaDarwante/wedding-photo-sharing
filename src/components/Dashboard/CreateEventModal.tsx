import React, { useState } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { WEDDING_CATEGORIES } from '../../lib/constants';
import { X, Calendar, MapPin, Heart, Image as ImageIcon, Sparkles } from 'lucide-react';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (eventId: string) => void;
}

const PRESET_COVERS = [
  {
    name: 'Tuscan Estate Sunset',
    url: '/src/assets/images/hero_wedding_couple_1793789594998.jpg'
  },
  {
    name: 'Royal Heritage Golden',
    url: '/src/assets/images/sample_wedding_haldi_1793789596208.jpg'
  },
  {
    name: 'Candlelight Reception',
    url: '/src/assets/images/wedding_reception_table_1793789596043.jpg'
  }
];

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onEventCreated
}) => {
  const { createEvent } = useWedding();
  const [coupleNames, setCoupleNames] = useState('');
  const [weddingDate, setWeddingDate] = useState(new Date().toISOString().split('T')[0]);
  const [venue, setVenue] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCover, setSelectedCover] = useState(PRESET_COVERS[0].url);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'Ceremony',
    'Portraits',
    'Reception',
    'Cocktail'
  ]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupleNames.trim()) {
      setError('Please provide the couple names.');
      return;
    }
    if (!weddingDate) {
      setError('Please select a wedding date.');
      return;
    }

    try {
      const newEvent = createEvent({
        coupleNames: coupleNames.trim(),
        weddingDate,
        venue: venue.trim() || 'Private Wedding Estate',
        description: description.trim() || 'Welcome to our celebration. Scan and download all original wedding photos.',
        coverPhotoUrl: selectedCover,
        categories: selectedCategories.length > 0 ? selectedCategories : ['Ceremony', 'Reception']
      });

      onClose();
      onEventCreated(newEvent.id);
    } catch (err: any) {
      setError(err?.message || 'Failed to create wedding event.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-xl w-full p-7 border border-[#E8E2D8] shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="text-xs font-semibold text-[#9A7B4F] uppercase tracking-wider mb-1">
            New Wedding Event
          </div>
          <h2 className="font-serif-luxury text-2xl font-bold text-slate-900">
            Create Wedding Gallery & QR
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Set up the event details. A dedicated QR code and guest link will be generated automatically.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Couple Names *
            </label>
            <div className="relative">
              <Heart className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={coupleNames}
                onChange={(e) => setCoupleNames(e.target.value)}
                placeholder="e.g. Maya & Aarav, or Chloe & James"
                className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A7B4F] bg-slate-50/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Wedding Date *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="date"
                  required
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A7B4F] bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Venue or Destination
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Lake Como, Italy or The Plaza"
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A7B4F] bg-slate-50/50"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Welcome Message for Guests
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Welcome to our wedding! Browse through the ceremony and reception photos, save your favorites, and download in full resolution."
              className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A7B4F] bg-slate-50/50"
            />
          </div>

          {/* Cover Photo Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#9A7B4F]" />
              <span>Select Gallery Cover Photograph</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {PRESET_COVERS.map((cov, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedCover(cov.url)}
                  className={`relative rounded-xl overflow-hidden aspect-video border-2 cursor-pointer transition-all ${
                    selectedCover === cov.url
                      ? 'border-[#9A7B4F] ring-2 ring-[#9A7B4F]/30 scale-[1.02]'
                      : 'border-slate-200 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img
                    src={cov.url}
                    alt={cov.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-end p-1.5 text-[10px] text-white font-medium">
                    <span className="truncate">{cov.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Categories to Enable */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Event Ceremonies & Categories
            </label>
            <div className="flex flex-wrap gap-1.5">
              {WEDDING_CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.includes(cat);
                return (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#1E1B18] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#9A7B4F] to-[#B39364] hover:from-[#8A6D43] hover:to-[#A38356] rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create Event & Generate QR</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
