/**
 * Curated authentic Indian wedding photo datasets and dynamic SVG royal fallbacks.
 * Ensures zero broken image icons, zero layout shifts, and authentic Indian wedding heritage.
 */

export interface IndianRitualInfo {
  key: string;
  en: string;
  hi: string;
  color: string;
  bgGradient: string;
  description: string;
}

export const INDIAN_WEDDING_RITUALS: Record<string, IndianRitualInfo> = {
  Roka: {
    key: 'Roka',
    en: 'Roka Ceremony',
    hi: 'रोका संस्कार',
    color: '#B38738',
    bgGradient: 'from-[#6E1A24] to-[#400B12]',
    description: 'Family union, auspicious shagun blessings, and dry fruit gifts'
  },
  Engagement: {
    key: 'Engagement',
    en: 'Ring Ceremony',
    hi: 'सगाई',
    color: '#D4AF37',
    bgGradient: 'from-[#54121B] to-[#2B050B]',
    description: 'Exchange of royal diamond rings amidst champagne and fireworks'
  },
  Haldi: {
    key: 'Haldi',
    en: 'Haldi Utsav',
    hi: 'हल्दी उत्सव',
    color: '#E59616',
    bgGradient: 'from-[#8C5E00] to-[#4A3200]',
    description: 'Turmeric paste blessings with golden marigold petal showers'
  },
  Mehndi: {
    key: 'Mehndi',
    en: 'Mehndi Celebration',
    hi: 'मेहंदी की रात',
    color: '#2D5A3A',
    bgGradient: 'from-[#1B3E26] to-[#0D2214]',
    description: 'Intricate Rajasthani bridal henna patterns and folk rhythms'
  },
  Sangeet: {
    key: 'Sangeet',
    en: 'Sangeet Gala',
    hi: 'संगीत संध्या',
    color: '#8A2BE2',
    bgGradient: 'from-[#4B1248] to-[#260524]',
    description: 'Electric musical choreography, Punjabi dhol beats, and family dance'
  },
  Baraat: {
    key: 'Baraat',
    en: 'Royal Baraat',
    hi: 'शाही बारात',
    color: '#C0392B',
    bgGradient: 'from-[#661610] to-[#330805]',
    description: 'Groom royal procession with vintage car, dholaks, and brass band'
  },
  Wedding: {
    key: 'Wedding',
    en: 'Vedic Wedding & Varmala',
    hi: 'शुभ विवाह एवं वरमाला',
    color: '#800020',
    bgGradient: 'from-[#5E0C18] to-[#2B0409]',
    description: 'Sacred floral garland exchange under the royal rose-strewn mandap'
  },
  Pheras: {
    key: 'Pheras',
    en: 'Saat Pheras',
    hi: 'सात फेरे',
    color: '#E65100',
    bgGradient: 'from-[#6E2200] to-[#361100]',
    description: 'Seven sacred vows around the holy Agni fire and Sindoor ritual'
  },
  Vidaai: {
    key: 'Vidaai',
    en: 'Vidaai',
    hi: 'विदाई',
    color: '#9C27B0',
    bgGradient: 'from-[#42124D] to-[#1F0624]',
    description: 'Heartfelt emotional bridal departure showered with puffed rice'
  },
  Reception: {
    key: 'Reception',
    en: 'Grand Reception',
    hi: 'शाही प्रीतिभोज',
    color: '#1B263B',
    bgGradient: 'from-[#192231] to-[#0A0E17]',
    description: 'Opulent evening banquet, bespoke chandeliers, and royal toast'
  }
};

/**
 * Generates an elegant royal Indian SVG placeholder data URI.
 * Guaranteed to display instantly offline, in low connectivity, or if external CDN drops.
 */
export function generateIndianRoyalSvgFallback(
  ritualName: string = 'Wedding',
  title: string = 'Royal Indian Wedding',
  coupleNames: string = 'Aarav & Maya'
): string {
  const ritual = INDIAN_WEDDING_RITUALS[ritualName] || INDIAN_WEDDING_RITUALS['Wedding'];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4A0E17" />
        <stop offset="50%" stop-color="#2D060D" />
        <stop offset="100%" stop-color="#1A0206" />
      </linearGradient>
      <pattern id="mandala" width="100" height="100" patternUnits="userSpaceOnUse">
        <circle cx="50" cy="50" r="30" fill="none" stroke="#D4AF37" stroke-width="0.75" stroke-opacity="0.15"/>
        <path d="M50 20 L50 80 M20 50 L80 50 M29 29 L71 71 M29 71 L71 29" stroke="#D4AF37" stroke-width="0.5" stroke-opacity="0.12"/>
        <polygon points="50,25 75,50 50,75 25,50" fill="none" stroke="#D4AF37" stroke-width="0.5" stroke-opacity="0.15"/>
      </pattern>
    </defs>
    <rect width="800" height="600" fill="url(#bgGrad)"/>
    <rect width="800" height="600" fill="url(#mandala)"/>
    
    <!-- Royal Ornamental Border -->
    <rect x="24" y="24" width="752" height="552" fill="none" stroke="#D4AF37" stroke-width="1.5" stroke-opacity="0.6" rx="16"/>
    <rect x="32" y="32" width="736" height="536" fill="none" stroke="#D4AF37" stroke-width="0.75" stroke-opacity="0.3" rx="12"/>
    
    <!-- Corner Paisley / Floral Accents -->
    <circle cx="48" cy="48" r="8" fill="none" stroke="#D4AF37" stroke-width="1.2" stroke-opacity="0.7"/>
    <circle cx="752" cy="48" r="8" fill="none" stroke="#D4AF37" stroke-width="1.2" stroke-opacity="0.7"/>
    <circle cx="48" cy="552" r="8" fill="none" stroke="#D4AF37" stroke-width="1.2" stroke-opacity="0.7"/>
    <circle cx="752" cy="552" r="8" fill="none" stroke="#D4AF37" stroke-width="1.2" stroke-opacity="0.7"/>

    <!-- Central Mandala Crest -->
    <g transform="translate(400, 240)">
      <circle r="72" fill="#380911" stroke="#D4AF37" stroke-width="1.5" stroke-opacity="0.8"/>
      <circle r="56" fill="none" stroke="#D4AF37" stroke-width="0.75" stroke-dasharray="4,3" stroke-opacity="0.6"/>
      <circle r="40" fill="none" stroke="#D4AF37" stroke-width="1" stroke-opacity="0.7"/>
      <!-- Sacred Om / Kalash Motif representation -->
      <path d="M-15 -10 C-10 -25, 10 -25, 15 -10 C20 10, -20 10, -15 -10 Z" fill="#D4AF37" fill-opacity="0.85"/>
      <circle cx="0" cy="8" r="6" fill="#D4AF37" fill-opacity="0.9"/>
      <polygon points="0,-32 8,-20 -8,-20" fill="#D4AF37" fill-opacity="0.75"/>
    </g>

    <!-- Ritual Devanagari Title -->
    <text x="400" y="365" font-family="'Cinzel', Georgia, serif" font-size="28" font-weight="700" fill="#FBF6EC" text-anchor="middle" letter-spacing="1">
      ${ritual.hi}
    </text>

    <!-- Ritual English Subtitle -->
    <text x="400" y="398" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="600" fill="#D4AF37" text-anchor="middle" letter-spacing="3">
      ${ritual.en.toUpperCase()}
    </text>

    <!-- Couple Names & Gold Divider -->
    <line x1="320" y1="425" x2="480" y2="425" stroke="#D4AF37" stroke-width="1" stroke-opacity="0.5"/>
    <polygon points="400,422 404,425 400,428 396,425" fill="#D4AF37"/>

    <text x="400" y="455" font-family="'Cinzel', Georgia, serif" font-size="18" fill="#E8DEC9" text-anchor="middle" letter-spacing="1">
      ${coupleNames}
    </text>

    <!-- Description or caption snippet -->
    <text x="400" y="485" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" fill="#BFA785" text-anchor="middle">
      ${title.length > 55 ? title.substring(0, 52) + '...' : title}
    </text>

    <!-- AuraWed Watermark Crest -->
    <text x="400" y="540" font-family="'Cinzel', Georgia, serif" font-size="10" font-weight="600" fill="#D4AF37" fill-opacity="0.6" text-anchor="middle" letter-spacing="2">
      AURAWED · ROYAL INDIAN WEDDING ARCHIVE
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
