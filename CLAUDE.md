# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Primary Reference

Use the skills I installed to follow best practices!

---

## Implementation Plan: UCSD Safety Alert Web App

### Overview
A web app for UCSD students to report and receive real-time safety incidents on campus. Students authenticate with their @ucsd.edu Google account, view a map of UCSD with incident pins, and can file incident reports with photos analyzed by EyePop.ai.

### Tech Stack
- **Framework**: Next.js 16 (App Router) with React 19
- **Styling**: Tailwind CSS 4
- **Auth**: Firebase Auth with Google Sign-In (restricted to @ucsd.edu)
- **Database**: Firestore (real-time incident data)
- **Storage**: Firebase Storage (incident photos)
- **Map**: Leaflet via `react-leaflet` (free, no API key required)
- **Computer Vision**: EyePop.ai (photo risk assessment)
- **Package Manager**: pnpm

---

### Dependencies to Install

```bash
# Firebase
pnpm add firebase

# Map
pnpm add leaflet react-leaflet
pnpm add -D @types/leaflet

# File upload handling (if needed for server-side)
pnpm add sharp
```

> **Note**: Using the Firebase JS SDK (not `@react-native-firebase`). All Firebase services (Auth, Firestore, Storage) are accessed client-side through the web SDK.

---

### File Structure

#### New files to create:
```
my-app/
  lib/
    firebase.ts          -- Firebase client init + exports
    auth.ts              -- Google Sign-In helpers, @ucsd.edu validation
    firestore.ts         -- Incident CRUD + real-time subscriptions (onSnapshot)
    storage.ts           -- Photo upload to Firebase Storage
    eyepop.ts            -- EyePop.ai API integration
  context/
    auth-context.tsx     -- React context for auth state (client component)
  types/
    incident.ts          -- TypeScript types (Incident, RiskAssessment)
  constants/
    map.ts               -- UCSD campus coordinates + map config
  app/
    layout.tsx           -- Root layout (modify existing: wrap with AuthProvider)
    page.tsx             -- Modify existing: redirect to /map or /sign-in
    sign-in/
      page.tsx           -- Google Sign-In page
    map/
      page.tsx           -- MapView centered on UCSD with incident pins + report button
    report/
      page.tsx           -- Multi-step report flow (pin location -> photo -> review -> submit)
    incidents/
      page.tsx           -- Incident feed list
    account/
      page.tsx           -- User info + sign-out
  components/
    navbar.tsx           -- Top nav with links: Map, Incidents, Account
    map-view.tsx         -- Leaflet map wrapper (client component, dynamic import with ssr: false)
    incident-pin.tsx     -- Custom map marker by risk level
    incident-card.tsx    -- Card for incidents feed
    risk-badge.tsx       -- Colored risk level badge
    report-button.tsx    -- Floating action button on map
    auth-gate.tsx        -- Client component that redirects unauthenticated users to /sign-in
    photo-upload.tsx     -- File input + preview for incident photos
```

#### Files to modify:
- `app/layout.tsx` -- Wrap with AuthProvider, add navbar, add global auth gate
- `app/page.tsx` -- Replace template content with redirect logic to /map
- `app/globals.css` -- Add UCSD brand colors as CSS variables / Tailwind theme

---

### Firestore Schema

**`incidents` collection:**
```
{
  latitude: number,
  longitude: number,
  photoUrl: string,          // Firebase Storage URL
  riskAssessment: {
    level: 'low' | 'medium' | 'high' | 'critical',
    score: number,           // 0-100
    labels: string[],        // detected objects from EyePop
    summary: string
  },
  createdAt: Timestamp
}
```

---

### Implementation Order

#### Phase 1: Foundation
1. Firebase console setup -- Create project, enable Auth (Google provider), Firestore, Storage
2. Install dependencies (`firebase`, `leaflet`, `react-leaflet`, `@types/leaflet`)
3. `lib/firebase.ts` + `types/incident.ts` -- Firebase init with env vars, type definitions
4. `context/auth-context.tsx` + `lib/auth.ts` -- Auth state via `onAuthStateChanged`, Google Sign-In with `signInWithPopup`, @ucsd.edu email check
5. `components/auth-gate.tsx` -- Client component that checks auth and redirects to /sign-in
6. `app/layout.tsx` -- Add AuthProvider + navbar
7. `app/sign-in/page.tsx` -- Sign-in page with Google button
8. Test auth flow: sign in with @ucsd.edu, verify non-UCSD emails rejected

#### Phase 2: Map + Real-time Data
9. `constants/map.ts` -- UCSD campus center coords (32.8801, -117.2340), default zoom
10. `lib/firestore.ts` -- `subscribeToIncidents()` using `onSnapshot` and `createIncident()`
11. `components/map-view.tsx` -- Leaflet map (client component, loaded with `next/dynamic` + `ssr: false` to avoid SSR issues)
12. `components/incident-pin.tsx` -- Custom Leaflet markers colored by risk level
13. `app/map/page.tsx` -- Map page with real-time incident markers + floating report button
14. `components/report-button.tsx`

#### Phase 3: Incident Reporting
15. `lib/storage.ts` -- `uploadIncidentPhoto()` using Firebase Storage `uploadBytes`
16. `lib/eyepop.ts` -- `analyzePhoto()` with risk assessment mapping
17. `components/photo-upload.tsx` -- `<input type="file" accept="image/*">` with preview
18. `app/report/page.tsx` -- Multi-step form: pick location on map -> upload photo -> EyePop analysis -> review -> submit
19. `components/risk-badge.tsx`

#### Phase 4: Feed + Account
20. `app/incidents/page.tsx` -- List of incidents with `incident-card.tsx`, sorted by recency
21. `components/incident-card.tsx` -- Risk badge, summary, timestamp, photo thumbnail
22. `app/account/page.tsx` -- Display user email + sign-out button
23. `components/navbar.tsx` -- Navigation bar (Map, Incidents, Account links)

#### Phase 5: Polish
24. Update `app/globals.css` with UCSD brand colors (Navy `#003B5C`, Gold `#C69214`) + risk level colors
25. Clean up default Next.js template content from `app/page.tsx`
26. Test end-to-end flow

---

### Key Next.js Considerations

- **Client vs Server Components**: Map, auth, and Firestore real-time listeners must be client components (`"use client"`). Pages can be server components that render client component children.
- **Leaflet SSR**: Leaflet accesses `window` — always load with `next/dynamic` and `{ ssr: false }`.
- **Environment Variables**: Firebase config goes in `.env.local` with `NEXT_PUBLIC_` prefix so it's available client-side.
- **No native modules needed**: Unlike the React Native version, the web SDK handles everything without native dependencies or dev builds.

### EyePop.ai Integration Notes
- The exact API endpoint and auth method will come from the EyePop dashboard
- Stub `analyzePhoto()` with a hardcoded response during development
- The mapping from EyePop object detection labels to risk score is customizable (threat keywords + weights)

---

### Verification
1. Run `pnpm dev` and open in browser
2. Sign in with a @ucsd.edu Google account; verify non-UCSD emails are rejected
3. View the UCSD map on the Map page
4. Navigate to Report -> pick a location on map -> upload a photo -> see risk assessment -> submit
5. Verify the new incident appears as a pin on the map in real-time
6. Check the Incidents page shows the new report in the feed
7. Sign out from the Account page; verify redirect to sign-in screen
