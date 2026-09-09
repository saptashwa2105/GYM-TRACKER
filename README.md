# 🏋️‍♂️ GymForge — Smart Workout & Hostel Mess Nutrition Tracker

GymForge is an elite, cyberpunk-styled Progressive Web Application (PWA) designed for fitness enthusiasts and students living in hostels. Seamlessly track gym workouts, daily muscle splits, and hostel mess nutrition with intelligent menu OCR, real-time macro calculation, proximity-based Anger Meter entry security, and cloud sync via Supabase.

---

## ✨ Step 1 Features

- **🔐 Interactive Passcode Entry Gate with "Anger Meter"**:
  - Signature proximity-based rage visualizer tracking interaction speed and keypress velocity.
  - Virtual & keyboard numeric pinpad with shake animations on invalid attempts.
  - Particle burst celebration on unlock into the dashboard.
  - Default PIN: `1234` (with instant Demo Bypass).

- **☁️ Supabase Cloud Authentication & PostgreSQL Persistence with RLS**:
  - Full Authentication suite (Email & Password + Google OAuth + Instant Demo mode).
  - Row-Level Security (RLS) policies ensuring users can only read and write their own data.
  - Seamless one-time prompt to migrate legacy browser `localStorage` logs into Supabase.
  - Resilient offline/mock preview fallback: the app runs 100% locally with zero errors if environment variables are not yet configured.

- **💪 Workout Planner & Logger**:
  - 7-Day split editor with multi-muscle group selector (PPL & Bro-Split presets).
  - Exercise logging table with inline set, rep, and weight (kg) editing.
  - One-tap set completion with built-in interactive Rest Timer modal (30s, 60s, 90s, 120s).

- **🍛 Mess Menu & Daily Macro Tracker**:
  - Categorized meal schedule (Breakfast, Lunch, Evening Snacks, Dinner).
  - Automatic macro calculation (Calories, Protein, Carbs, Fats) with Veg/Non-Veg indicators.
  - Optical Character Recognition (OCR) powered by Tesseract.js to scan photo timetables.
  - Preference filters (Show Only Veg, High Protein First, Highlight Non-Veg Days).

- **🥛 Room Supplies & Hostel Hacks Recipe Generator**:
  - Itemized checklist for room essentials (Whey Protein, Oats, Peanut Butter, Eggs, Bananas).
  - Dynamic daily protein deficit calculator matching mess intake against your LEAN or BULK goal.
  - Zero-cooking hostel hacks and pre/post workout energy recipes.

- **📱 Progressive Web App (PWA)**:
  - Installable on Android, iOS Safari, and Desktop Chrome/Edge.
  - Offline-first cache architecture.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Cyberpunk obsidian `#0a0a0c`, electric green `#22c55e`, cyan `#22d3ee`)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Backend & Database**: [Supabase](https://supabase.com/) (`@supabase/supabase-js`) with Row-Level Security (RLS)
- **OCR Engine**: [Tesseract.js](https://tesseract.projectnaptha.com/)
- **Deployment**: [Vercel](https://vercel.com/)

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/saptashwa2105/GYM-TRACKER.git
cd GYM-TRACKER
npm install
```

### 2. Configure Supabase Environment Variables (Optional)
Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```
*(If omitted, GymForge will automatically run in local interactive demo mode.)*

### 3. Run Database Schema in Supabase
Open your **Supabase Dashboard** -> **SQL Editor**, and paste the contents of [`supabase/schema.sql`](supabase/schema.sql) to provision all tables and RLS security policies.

### 4. Start Local Development
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```

---

## 🌐 Deploying to Vercel

1. Push your repository to GitHub (`origin main`).
2. Import the project in [Vercel Dashboard](https://vercel.com/new).
3. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = `https://your-project-id.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-key-here`
4. Click **Deploy**. Vercel will automatically build and publish your app with continuous deployment on every git push.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
