# 🏋️‍♂️ GYM TRACKER — Smart Workout & Hostel Mess Nutrition Tracker

A modern, responsive Progressive Web App (PWA) designed for fitness enthusiasts and students. Seamlessly track gym workouts, daily muscle splits, and hostel mess nutrition with intelligent menu OCR and macro calculation.

---

## ✨ Features

- **💪 Workout & Routine Tracker**:
  - Daily muscle split management (Chest, Back, Legs, Shoulders, Biceps, Triceps, Abs, Forearms).
  - Built-in exercise database with customizable sets, reps, and weights.
  - Active workout logging and history with streak tracking.

- **🍛 Indian Hostel Mess Nutrition Estimator**:
  - Automatically calculate calories, protein, carbs, and fats for mess meals (Breakfast, Lunch, Snacks, Dinner).
  - Built-in database for common Indian hostel & college mess menus (Veg & Non-Veg options, Paneer, Soya, Eggs, Chicken, Dal, Roti, Rice, etc.).
  - Daily protein & caloric target progress bars.

- **📸 Mess Menu OCR (Optical Character Recognition)**:
  - Upload or scan your hostel mess menu image.
  - Powered by Tesseract.js to extract text and automatically map weekly meals to your daily nutrition log.

- **🥛 Room Nutrition & Stash Tracker**:
  - Track quick hostel staples (Bananas, Peanut Butter, Oats, Milk, Eggs, Whey Protein).
  - One-tap macro logging.

- **📱 Progressive Web App (PWA)**:
  - Offline support with Service Worker (`sw.js`).
  - Installable on mobile devices (Android/iOS) and desktop.
  - LocalStorage persistence for complete privacy.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **OCR Engine**: [Tesseract.js](https://tesseract.projectnaptha.com/)
- **Storage**: Browser LocalStorage (Zero backend required)
- **Deployment**: Zero-config static deployment (Vercel, Netlify, GitHub Pages)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn / pnpm

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/saptashwa2105/GYM-TRACKER.git
   cd GYM-TRACKER
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📱 PWA Installation

1. Open the deployed application in Chrome / Safari / Edge.
2. Tap the **"Add to Home Screen"** or **Install** prompt in your browser.
3. Use GYM TRACKER offline anytime at the gym!

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
