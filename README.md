# AuraWed - Wedding Photo Sharing SaaS

AuraWed is a premium, modern SaaS platform designed exclusively for professional wedding photographers and their couples. Photographers upload high-resolution wedding photographs, generate instant QR codes for reception tables, and guests scan the QR code to view, favourite, and download original HD memories—with zero app downloads and zero guest upload clutter.

---

## Key Features & Business Rules

1. **Strict Photographer-Only Authorization**
   - Only authenticated photographers can upload, modify, or delete wedding photos.
   - Guests have strictly read-only gallery and download access. Guests cannot upload files or clutter the gallery.
2. **Real-Time Live Uploads**
   - Whenever the photographer uploads photos during cocktail hour or reception, open guest galleries update automatically in real-time without requiring a page refresh.
3. **Instant QR Code Generation**
   - Dedicated QR code generated for every wedding.
   - High-resolution PNG and print-ready table tent cards (PDF) with couple names, wedding date, and photographer branding.
   - Ability to deactivate or regenerate QR links anytime.
4. **Bulk & High-Performance Photo Uploads**
   - Multi-file drag-and-drop.
   - In-browser canvas thumbnail generation (drastically speeds up preview loading).
   - Duplicate file detection preventing accidental re-uploads.
   - Preserves original raw HD quality files for guest downloads.
5. **Comprehensive Download System**
   - Individual original HD download.
   - Multiple selection download as a single ZIP.
   - One-click full wedding event ZIP archive download.
   - Download all personal favorite photos as a ZIP.
   - Real-time percentage progress bar for large ZIP compression.
6. **Guest Experience**
   - Responsive masonry grid layout.
   - Ritual categories: Haldi, Mehndi, Sangeet, Ceremony, Reception, Portraits, Cocktail.
   - Fullscreen lightbox with zoom (1x, 1.5x, 2x), keyboard navigation, and EXIF metadata.
   - Automated fullscreen slideshow with custom transition speeds.
   - Native device and WhatsApp photo sharing.
7. **Studio Analytics & Branding**
   - Total QR scans, photo views, bulk downloads, and storage tracking.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Motion
- **Database & Auth**: Supabase PostgreSQL + Supabase Storage (with built-in offline/local fallback engine)
- **Utilities**: `qrcode` (QR generation), `jszip` (client-side ZIP packaging)
- **Deployment**: Netlify

---

## Getting Started (Local Development)

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd aurawed
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Add your Supabase credentials (optional—app works out of the box with the built-in storage engine):
```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the platform.

---

## Supabase Database Setup

1. Create a new project in [Supabase](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Open `supabase/schema.sql` from this repository and run the entire script. It creates:
   - `photographer_profiles`
   - `wedding_events`
   - `wedding_photos`
   - `photo_favourites`
   - `gallery_analytics`
   - `photographer_subscriptions`
   - Row Level Security (RLS) policies enforcing photographer write and guest read-only access.
   - Automatic triggers for calculating storage and photo counts.
4. Go to **Project Settings -> API** in Supabase and copy the **Project URL** and **anon public key** into your `.env` file or paste them directly into the in-app **Cloud DB** settings modal.

---

## Netlify Deployment

This repository includes a pre-configured `netlify.toml` file.

1. Push your repository to GitHub / GitLab.
2. Log in to [Netlify](https://www.netlify.com) and click **Add new site -> Import an existing project**.
3. Select your repository.
4. Netlify will automatically detect:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Under **Environment variables**, optionally add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click **Deploy Site**.
