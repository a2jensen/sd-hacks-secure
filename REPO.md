# UCSD Safety Alerts

A real-time campus safety reporting web app for UCSD students. Users authenticate with their @ucsd.edu Google account, view a map of UCSD with incident pins, and file incident reports with photos analyzed by AI.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| Auth | Firebase Auth (Google Sign-In, restricted to @ucsd.edu) |
| Database | Cloud Firestore (real-time) |
| File Storage | Firebase Storage |
| Map | Leaflet + react-leaflet |
| AI Analysis | EyePop.ai (stubbed for development) |
| Package Manager | pnpm |

## Project Structure

```
my-app/
├── app/                     # Next.js App Router pages
│   ├── layout.tsx           # Root layout: AuthProvider + AuthGate + Navbar
│   ├── page.tsx             # Redirect: authenticated → /map, otherwise → /sign-in
│   ├── globals.css          # Tailwind config + UCSD brand colors
│   ├── sign-in/
│   │   └── page.tsx         # Google Sign-In page with @ucsd.edu enforcement
│   ├── map/
│   │   └── page.tsx         # Interactive map with real-time incident pins
│   ├── report/
│   │   └── page.tsx         # Multi-step report flow (location → photo → review → submit)
│   ├── incidents/
│   │   └── page.tsx         # Chronological feed of all reported incidents
│   └── account/
│       └── page.tsx         # User info + sign out
│
├── components/              # Reusable UI components
│   ├── auth-gate.tsx        # Redirects unauthenticated users to /sign-in
│   ├── navbar.tsx           # Top nav bar (Map, Incidents, Account)
│   ├── map-view.tsx         # Leaflet map with color-coded risk markers (client component, ssr: false)
│   ├── incident-pin.tsx     # Custom map markers colored by risk level
│   ├── incident-card.tsx    # Card displaying incident photo, risk badge, summary, timestamp
│   ├── report-button.tsx    # Floating "+" button linking to /report
│   ├── photo-upload.tsx     # File input with image preview
│   └── risk-badge.tsx       # Colored badge for risk levels (low/medium/high/critical)
│
├── lib/                     # Core logic and API integrations
│   ├── firebase.ts          # Firebase app init (lazy singletons to avoid SSR issues)
│   ├── auth.ts              # signInWithGoogle() and logOut(), @ucsd.edu validation
│   ├── firestore.ts         # subscribeToIncidents() (real-time) and createIncident()
│   ├── storage.ts           # uploadIncidentPhoto() → returns download URL
│   └── eyepop.ts            # analyzePhoto() — stubbed, returns mock RiskAssessment
│
├── context/
│   └── auth-context.tsx     # AuthProvider + useAuth() hook wrapping onAuthStateChanged
│
├── types/
│   └── incident.ts          # Incident, RiskAssessment, RiskLevel types
│
├── constants/
│   └── map.ts               # UCSD campus center coords (32.8801, -117.234), default zoom
│
├── .env.local               # Firebase config (NEXT_PUBLIC_FIREBASE_*)
└── .env.local.example       # Template for environment variables
```

## Authentication Flow

1. User visits any page → `AuthGate` checks auth state
2. If not authenticated → redirect to `/sign-in`
3. User clicks "Sign in with Google" → `signInWithPopup` opens Google OAuth
4. After sign-in, email is checked for `@ucsd.edu` domain
5. Non-UCSD emails are immediately signed out with an error message
6. Authenticated users are redirected to `/map`

## Incident Reporting Flow

1. User taps the gold "+" button on the map → navigates to `/report`
2. **Step 1 — Location**: Click on the map to drop a pin
3. **Step 2 — Photo**: Upload or take a photo of the incident
4. **Step 3 — Analysis**: Photo is sent to EyePop.ai for risk assessment (currently stubbed)
5. **Step 4 — Review**: User sees the risk level, labels, and summary
6. **Submit**: Photo uploads to Firebase Storage, incident document is created in Firestore
7. User is redirected to `/map` where the new pin appears in real-time

## Firestore Schema

### `incidents` collection

| Field | Type | Description |
|-------|------|-------------|
| `latitude` | number | Incident location latitude |
| `longitude` | number | Incident location longitude |
| `photoUrl` | string | Firebase Storage download URL |
| `riskAssessment.level` | `'low' \| 'medium' \| 'high' \| 'critical'` | Risk classification |
| `riskAssessment.score` | number | Risk score (0–100) |
| `riskAssessment.labels` | string[] | Detected objects from EyePop |
| `riskAssessment.summary` | string | Human-readable summary |
| `createdAt` | Timestamp | Server-generated timestamp |

## Real-time Updates

The app uses Firestore `onSnapshot` listeners on both the map and incidents pages. When any user submits a new incident, all connected clients see the new pin/card appear immediately without refreshing.

## Environment Variables

All Firebase config uses the `NEXT_PUBLIC_` prefix so it's available client-side. See `.env.local.example` for the full list:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

## Key Architecture Decisions

- **Lazy Firebase init**: Firebase services are initialized via getter functions (not top-level `const`) to prevent errors during Next.js static page generation / SSR.
- **Leaflet with `ssr: false`**: Leaflet depends on `window`, so `map-view.tsx` is loaded via `next/dynamic` with SSR disabled.
- **Client components**: Auth, Firestore listeners, and the map all require browser APIs, so relevant components use `"use client"`.
- **No backend API routes**: All data flows directly between the browser and Firebase services. No Next.js API routes are needed.

## Development

```bash
cd my-app
pnpm install
pnpm dev        # http://localhost:3000
```

## Deployment

```bash
cd my-app
vercel          # Follow prompts, set env vars in Vercel dashboard
vercel --prod   # Production deploy
```

After deploying, add your `*.vercel.app` domain to Firebase Console → Authentication → Settings → Authorized domains.

## UCSD Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Navy | `#003B5C` | Primary (navbar, buttons, headings) |
| Gold | `#C69214` | Accent (report button, submit actions) |
