import { PhotographerProfile, WeddingEvent, WeddingPhoto } from '../types';

export const WEDDING_CATEGORIES = [
  'Haldi',
  'Mehndi',
  'Sangeet',
  'Ceremony',
  'Reception',
  'Portraits',
  'Pre-Wedding',
  'Cocktail'
] as const;

export const DEFAULT_PHOTOGRAPHER: PhotographerProfile = {
  id: 'photo_stud_01',
  email: 'clara@lumierevows.com',
  businessName: 'Lumière Wedding Studios',
  role: 'owner',
  tagline: 'Fine-art editorial wedding cinematography & photography',
  logoUrl: '/src/assets/images/photographer_avatar_1793789596829.jpg',
  phone: '+1 (555) 782-9421',
  website: 'https://lumierevows.com',
  instagram: '@lumierevows',
  plan: 'studio-owner',
  storageLimitBytes: 500 * 1024 * 1024 * 1024, // 500 GB
  storageUsedBytes: 42.6 * 1024 * 1024 * 1024, // 42.6 GB
  createdAt: '2025-01-15T09:00:00.000Z'
};

export const INITIAL_WEDDING_EVENTS: WeddingEvent[] = [
  {
    id: 'evt_elena_christian',
    photographerId: 'photo_stud_01',
    coupleNames: 'Elena & Christian',
    slug: 'elena-and-christian-wedding',
    weddingDate: '2026-10-18',
    venue: 'Villa Corsini a Mezzomonte, Florence, Italy',
    description: 'An enchanting golden-hour garden celebration filled with olive groves, bespoke candlelight, and timeless joy.',
    coverPhotoUrl: '/src/assets/images/hero_wedding_couple_1793789594998.jpg',
    isQrActive: true,
    totalPhotos: 8,
    totalViews: 342,
    totalDownloads: 189,
    storageBytes: 84 * 1024 * 1024,
    categories: ['Ceremony', 'Portraits', 'Reception', 'Cocktail'],
    createdAt: '2026-10-18T10:00:00.000Z',
    updatedAt: '2026-10-18T22:30:00.000Z'
  },
  {
    id: 'evt_aarav_maya',
    photographerId: 'photo_stud_01',
    coupleNames: 'Maya & Aarav',
    slug: 'maya-and-aarav-royal-wedding',
    weddingDate: '2026-11-02',
    venue: 'Umaid Bhawan Palace, Jodhpur',
    description: 'A vibrant 3-day royal celebration celebrating heritage, golden marigolds, heartfelt laughter, and electric dance.',
    coverPhotoUrl: '/src/assets/images/sample_wedding_haldi_1793789596208.jpg',
    isQrActive: true,
    totalPhotos: 6,
    totalViews: 618,
    totalDownloads: 412,
    storageBytes: 68 * 1024 * 1024,
    categories: ['Haldi', 'Mehndi', 'Sangeet', 'Ceremony', 'Reception'],
    createdAt: '2026-11-01T08:00:00.000Z',
    updatedAt: '2026-11-03T18:15:00.000Z'
  }
];

export const INITIAL_PHOTOS: WeddingPhoto[] = [
  // Elena & Christian photos
  {
    id: 'photo_ec_01',
    eventId: 'evt_elena_christian',
    photographerId: 'photo_stud_01',
    originalUrl: '/src/assets/images/hero_wedding_couple_1793789594998.jpg',
    thumbnailUrl: '/src/assets/images/hero_wedding_couple_1793789594998.jpg',
    filename: 'Elena_Christian_GoldenHour_01.jpg',
    fileSizeBytes: 12.4 * 1024 * 1024,
    width: 3840,
    height: 2160,
    category: 'Portraits',
    caption: 'Strolling through the Italian villa rose gardens during sunset',
    tags: ['couple', 'golden hour', 'bouquet', 'tuscany'],
    viewsCount: 142,
    downloadsCount: 88,
    createdAt: '2026-10-18T18:30:00.000Z',
    uploadedAt: '2026-10-18T18:30:00.000Z'
  },
  {
    id: 'photo_ec_02',
    eventId: 'evt_elena_christian',
    photographerId: 'photo_stud_01',
    originalUrl: '/src/assets/images/wedding_reception_table_1793789596043.jpg',
    thumbnailUrl: '/src/assets/images/wedding_reception_table_1793789596043.jpg',
    filename: 'Reception_Candlelight_QRTable_02.jpg',
    fileSizeBytes: 10.8 * 1024 * 1024,
    width: 2560,
    height: 1920,
    category: 'Reception',
    caption: 'Table setting with custom QR cards and fragrant white garden roses',
    tags: ['reception', 'tablescape', 'qr', 'candles'],
    viewsCount: 89,
    downloadsCount: 41,
    createdAt: '2026-10-18T20:10:00.000Z',
    uploadedAt: '2026-10-18T20:10:00.000Z'
  },
  {
    id: 'photo_ec_03',
    eventId: 'evt_elena_christian',
    photographerId: 'photo_stud_01',
    originalUrl: '/src/assets/images/hero_wedding_couple_1793789594998.jpg',
    thumbnailUrl: '/src/assets/images/hero_wedding_couple_1793789594998.jpg',
    filename: 'Elena_Christian_Vows_03.jpg',
    fileSizeBytes: 11.2 * 1024 * 1024,
    width: 3840,
    height: 2160,
    category: 'Ceremony',
    caption: 'Exchange of vows under the historic stone archway',
    tags: ['ceremony', 'vows', 'archway', 'arch'],
    viewsCount: 112,
    downloadsCount: 65,
    createdAt: '2026-10-18T16:45:00.000Z',
    uploadedAt: '2026-10-18T16:45:00.000Z'
  },
  {
    id: 'photo_ec_04',
    eventId: 'evt_elena_christian',
    photographerId: 'photo_stud_01',
    originalUrl: '/src/assets/images/wedding_reception_table_1793789596043.jpg',
    thumbnailUrl: '/src/assets/images/wedding_reception_table_1793789596043.jpg',
    filename: 'Cocktail_Hour_Chandelier_04.jpg',
    fileSizeBytes: 9.6 * 1024 * 1024,
    width: 2560,
    height: 1920,
    category: 'Cocktail',
    caption: 'String lights and warm toasts as dusk settles over the courtyard',
    tags: ['cocktail', 'cheers', 'evening'],
    viewsCount: 76,
    downloadsCount: 30,
    createdAt: '2026-10-18T19:00:00.000Z',
    uploadedAt: '2026-10-18T19:00:00.000Z'
  },

  // Maya & Aarav photos
  {
    id: 'photo_ma_01',
    eventId: 'evt_aarav_maya',
    photographerId: 'photo_stud_01',
    originalUrl: '/src/assets/images/sample_wedding_haldi_1793789596208.jpg',
    thumbnailUrl: '/src/assets/images/sample_wedding_haldi_1793789596208.jpg',
    filename: 'Maya_Aarav_Haldi_Shower_01.jpg',
    fileSizeBytes: 14.1 * 1024 * 1024,
    width: 3200,
    height: 2400,
    category: 'Haldi',
    caption: 'Pure joy during the golden floral blessing ceremony',
    tags: ['haldi', 'yellow', 'celebration', 'joy'],
    viewsCount: 280,
    downloadsCount: 195,
    createdAt: '2026-11-01T11:00:00.000Z',
    uploadedAt: '2026-11-01T11:00:00.000Z'
  },
  {
    id: 'photo_ma_02',
    eventId: 'evt_aarav_maya',
    photographerId: 'photo_stud_01',
    originalUrl: '/src/assets/images/sample_wedding_haldi_1793789596208.jpg',
    thumbnailUrl: '/src/assets/images/sample_wedding_haldi_1793789596208.jpg',
    filename: 'Maya_Aarav_Royal_Portraits_02.jpg',
    fileSizeBytes: 13.7 * 1024 * 1024,
    width: 3200,
    height: 2400,
    category: 'Portraits',
    caption: 'Intricate golden sherwani and embroidered lehenga royal portraits',
    tags: ['portraits', 'royal', 'palace'],
    viewsCount: 198,
    downloadsCount: 140,
    createdAt: '2026-11-02T16:00:00.000Z',
    uploadedAt: '2026-11-02T16:00:00.000Z'
  },
  {
    id: 'photo_ma_03',
    eventId: 'evt_aarav_maya',
    photographerId: 'photo_stud_01',
    originalUrl: '/src/assets/images/sample_wedding_haldi_1793789596208.jpg',
    thumbnailUrl: '/src/assets/images/sample_wedding_haldi_1793789596208.jpg',
    filename: 'Maya_Aarav_Sangeet_Night_03.jpg',
    fileSizeBytes: 11.5 * 1024 * 1024,
    width: 3200,
    height: 2400,
    category: 'Sangeet',
    caption: 'Dazzling choreography and family musical celebrations',
    tags: ['sangeet', 'music', 'dance'],
    viewsCount: 140,
    downloadsCount: 77,
    createdAt: '2026-11-01T21:30:00.000Z',
    uploadedAt: '2026-11-01T21:30:00.000Z'
  }
];

export const PRICING_PLANS = [
  {
    id: 'starter',
    name: 'Studio Starter',
    target: 'For independent solo wedding photographers',
    priceMonthly: 29,
    priceAnnual: 24,
    features: [
      'Up to 15 active wedding galleries',
      '50 GB ultra-fast cloud storage',
      'Unlimited guest QR code scans',
      'Original HD single & bulk ZIP downloads',
      'Real-time live photo uploads',
      'Print-ready table QR cards (PNG/PDF)',
      'Basic visitor analytics'
    ],
    highlight: false,
    ctaText: 'Start 14-Day Free Trial'
  },
  {
    id: 'pro',
    name: 'Studio Pro',
    target: 'For established wedding & destination studios',
    priceMonthly: 69,
    priceAnnual: 55,
    features: [
      'Unlimited active wedding galleries',
      '500 GB high-speed cloud storage',
      'Custom studio logo, colors & domain',
      'Unlimited guests & live real-time sync',
      'Instant ZIP downloads with progress bar',
      'High-res printable QR cards with branding',
      'Detailed gallery visitor & download analytics',
      'Permanent client archival options',
      'Priority live support'
    ],
    highlight: true,
    badge: 'Most Popular for Wedding Studios',
    ctaText: 'Get Started with Studio Pro'
  },
  {
    id: 'agency',
    name: 'Agency Elite',
    target: 'For multi-photographer teams & cinema studios',
    priceMonthly: 149,
    priceAnnual: 119,
    features: [
      'Everything in Pro with unlimited galleries',
      '2 TB enterprise storage quota',
      'Multi-seat photographer team access',
      'White-label gallery (no AuraWed badge)',
      'Custom watermark & copyright embedding',
      'Dedicated high-throughput upload pipelines',
      'Custom contract & SLA guarantees'
    ],
    highlight: false,
    ctaText: 'Contact Studio Sales'
  }
];
