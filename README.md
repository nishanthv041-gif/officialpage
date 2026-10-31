# SRT UNIVERSAL HR.SEC SCHOOL — Official Website & Admissions Portal

Official website, 3D interactive campus observatory, pre-admission registration portal, and administrative CMS for **SRT Universal Higher Secondary School, Sathyamangalam, Erode District, Tamil Nadu**.

## Tech Stack
- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS v4
- **3D & Motion**: Three.js (Studio PBR `RoomEnvironment`, composite multi-part procedural geometries, software-WebGL frame pacing), GSAP
- **Backend & Persistence**: Firebase Authentication (Google Auth), Cloud Firestore (`firestore.rules` with zero-trust attribute-based validation), Firebase Storage

## Setup & Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Provisioned Firebase configuration is stored in `firebase-applet-config.json`.
3. Start the development server on port 3000:
   ```bash
   npm run dev
   ```
4. Run unit tests for core school logic:
   ```bash
   npx --yes tsx --test src/utils/schoolLogic.test.ts
   ```
5. Lint Firestore security rules:
   ```bash
   npx eslint firestore.rules
   ```

## Admin Portal Access (`/admin`)
- Click the discreet lock icon in the website footer or navigate to `/admin`.
- **Default Admin Email**: `admin@srtuniversal.edu.in` (or your bootstrapped Google account `nishanthv041@gmail.com`)
- **Default Admin Passkey**: `SrtAdmin@2026` (can be updated anytime inside `/admin` -> **Settings & Roles**).

## Deployment (Firebase Hosting or Vercel)

1. Build the production bundle:
   ```bash
   npm run build
   ```
2. **Firebase Hosting**:
   ```bash
   firebase deploy --only hosting,firestore:rules
   ```
3. **Vercel**:
   Import the repository into Vercel, set framework preset to **Vite**, output directory to `dist`, and configure single-page application rewrites to `/index.html`.
