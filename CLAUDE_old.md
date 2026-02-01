# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Primary Reference

Use the skills I installed to follow best practices!

---

## Implementation Plan: UCSD Safety Alert App

### Overview
A mobile app for UCSD students to report and receive real-time safety incidents on campus. Students authenticate with their @ucsd.edu Google account, view a map of UCSD with incident pins, and can file incident reports with photos analyzed by EyePop.ai.

### Tech Stack
- **Frontend**: React Native + Expo SDK 54 (Expo Router v6)
- **Auth**: Firebase Auth with Google Sign-In (restricted to @ucsd.edu)
- **Database**: Firestore (real-time incident data)
- **Storage**: Firebase Storage (incident photos)
- **Push Notifications**: Firebase Cloud Messaging (FCM) + expo-notifications
- **Map**: react-native-maps
- **Computer Vision**: EyePop.ai (photo risk assessment)
- **Camera**: expo-image-picker

> **Important**: This requires a development build (not Expo Go) due to native modules (Firebase, maps, Google Sign-In).

---

### Dependencies to Install

```bash
# Firebase
npx expo install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore @react-native-firebase/storage @react-native-firebase/messaging

# Google Sign-In
npx expo install @react-native-google-signin/google-signin

# Map, Camera, Notifications, Location
npx expo install react-native-maps expo-image-picker expo-notifications expo-device expo-location
```

---

### File Structure

#### New files to create:
```
lib/
  firebase.ts          -- Firebase init + exports
  auth.ts              -- Google Sign-In helpers, @ucsd.edu validation
  firestore.ts         -- Incident CRUD + real-time subscriptions
  storage.ts           -- Photo upload to Firebase Storage
  eyepop.ts            -- EyePop.ai API integration
  notifications.ts     -- Push notification registration
context/
  auth-context.tsx     -- React context for auth state
types/
  incident.ts          -- TypeScript types (Incident, RiskAssessment)
constants/
  map.ts               -- UCSD campus coordinates
app/
  sign-in.tsx          -- Google Sign-In screen
  report.tsx           -- Multi-step report modal (pin -> photo -> review -> submit)
  (tabs)/
    incidents.tsx      -- Incident feed list
    account.tsx        -- Logout screen
components/
  incident-pin.tsx     -- Custom map marker by risk level
  incident-card.tsx    -- Card for incidents feed
  risk-badge.tsx       -- Colored risk level badge
  report-button.tsx    -- Floating action button on map
```

#### Files to modify:
- `app.json` -- Add Firebase, maps, image-picker, notifications, location plugins
- `app/_layout.tsx` -- Add AuthProvider + auth gate (redirect to sign-in if not logged in)
- `app/(tabs)/_layout.tsx` -- Change to 3 tabs: Map, Incidents, Account
- `app/(tabs)/index.tsx` -- Replace template with MapView + incident pins + report button
- `constants/theme.ts` -- Add UCSD brand colors + risk level colors
- `components/ui/icon-symbol.tsx` -- Add icon mappings for new tabs

#### Files to delete (template boilerplate):
- `app/(tabs)/explore.tsx`, `app/modal.tsx`
- `components/parallax-scroll-view.tsx`, `components/hello-wave.tsx`, `components/external-link.tsx`, `components/ui/collapsible.tsx`

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

**`fcmTokens` collection:**
```
{
  token: string,
  platform: 'ios' | 'android',
  updatedAt: Timestamp
}
```

---

### Implementation Order

#### Phase 1: Foundation
1. Firebase console setup -- Create project, enable Auth/Firestore/Storage/FCM, download config files
2. Install dependencies + update `app.json` with plugins
3. `lib/firebase.ts` + `types/incident.ts` -- Firebase init, type definitions
4. `context/auth-context.tsx` + `lib/auth.ts` -- Auth state management, Google Sign-In with @ucsd.edu check
5. `app/_layout.tsx` -- Auth gate + Stack with sign-in, tabs, report modal
6. `app/sign-in.tsx` -- Sign-in screen with Google button
7. Create dev build (`eas build --profile development`) and test auth flow

#### Phase 2: Map + Real-time Data
8. `constants/map.ts` -- UCSD campus region coords
9. `lib/firestore.ts` -- `subscribeToIncidents()` and `createIncident()`
10. `app/(tabs)/_layout.tsx` -- 3-tab layout (Map, Incidents, Account) + icon mappings
11. `app/(tabs)/index.tsx` -- MapView centered on UCSD, real-time incident Markers, floating Report button
12. `components/report-button.tsx` + `components/incident-pin.tsx`

#### Phase 3: Incident Reporting
13. `lib/storage.ts` -- `uploadIncidentPhoto()`
14. `lib/eyepop.ts` -- `analyzePhoto()` with risk assessment mapping
15. `app/report.tsx` -- Multi-step modal: drop pin -> pick/take photo -> EyePop analysis -> review -> submit
16. `components/risk-badge.tsx`

#### Phase 4: Feed + Account
17. `app/(tabs)/incidents.tsx` -- FlatList of incidents with `incident-card.tsx`
18. `components/incident-card.tsx` -- Risk badge, summary, timestamp, photo thumbnail
19. `app/(tabs)/account.tsx` -- Email display + sign-out button

#### Phase 5: Notifications (stretch goal if time permits)
20. `lib/notifications.ts` -- FCM token registration
21. Register for notifications in root layout after auth
22. Firebase Cloud Function -- Trigger on new incident, send FCM to all tokens

> **Fallback**: Skip Cloud Functions entirely. Firestore real-time listeners already update the map/feed for users who have the app open.

#### Phase 6: Polish
23. Delete template files (explore.tsx, modal.tsx, hello-wave, etc.)
24. Update theme with UCSD brand colors (Navy #003B5C, Gold #C69214) + risk colors
25. Test end-to-end flow

---

### EyePop.ai Integration Notes
- The exact API endpoint and auth method will come from the EyePop dashboard
- Stub `analyzePhoto()` with a hardcoded response during development
- The mapping from EyePop object detection labels to risk score is customizable (threat keywords + weights)

---

### Verification
1. Build a development build with `eas build --profile development`
2. Sign in with a @ucsd.edu Google account; verify non-UCSD emails are rejected
3. View the UCSD map on the Map tab
4. Tap Report -> drop a pin -> take/upload a photo -> see risk assessment -> submit
5. Verify the new incident appears as a pin on the map in real-time
6. Check the Incidents tab shows the new report in the feed
7. Sign out from the Account tab; verify redirect to sign-in screen