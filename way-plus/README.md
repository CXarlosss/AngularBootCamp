# WAY+ | Clinical Gamification Platform

Professional SaaS platform for social skills development in children (4-6 years), built with a focus on offline-first clinical environments and data-driven therapeutic oversight.

## 🚀 Technical Stack
*   **Frontend**: React + TypeScript + Vite.
*   **Styling**: Vanilla CSS + Framer Motion (Animations).
*   **State Management**: Zustand (Global) + IndexedDB (Offline Storage).
*   **Backend/SaaS**: Supabase (Auth, PostgreSQL, Storage, RLS).
*   **PWA**: Service Workers (Custom caching) + Manifest + App Shell.

## 🏗️ Architecture
*   **DDD Approach**: Separated by features (auth, content, editor, kiosk, player, rewards, therapist).
*   **Offline-First**: Uses IndexedDB to cache all therapeutic content, images (as Blobs), and progress.
*   **Sync Engine**: Intelligent queue system that synchronizes local changes to the cloud when connectivity is restored.
*   **Kiosk Mode**: Security layer using Fullscreen API, Wake Lock, Orientation Lock, and Gesture Blockers.

## 🛠️ Installation & Setup

### 1. Environment Variables
Create a `.env` file in the root:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

## 🔐 Clinical Security
*   **Multi-tenancy**: Row Level Security (RLS) ensures therapists only access their own patient data.
*   **Kiosk Security**: 4-digit PIN system + Secret gesture (5-tap corner) for session termination.
*   **Privacy**: All patient identifiers can be pseudonymous to comply with data protection regulations.

## 📂 Documentation
*   [Clinical User Manual](./docs/USER_MANUAL.md): Guide for therapists and clinical staff.
*   [Supabase Schema](./docs/SCHEMA.sql): Database structure and RLS policies (in progress).

## 📄 License
Commercial / Clinical Proprietary.

---
*Developed for professional therapeutic intervention.*
