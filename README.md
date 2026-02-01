# UCSD Safety Alerts

A real-time campus safety reporting web app for UCSD students. Authenticate with your @ucsd.edu Google account, view incidents on an interactive map, and file reports with AI-powered photo analysis.

**Live site:** [Deployed on Vercel](https://my-app-theta-smoky-47.vercel.app) *(update with your actual URL)*

## How It Works

1. Sign in with your UCSD Google account
2. View the campus map with color-coded incident pins (green/yellow/orange/red by risk level)
3. Tap the "+" button to report an incident: pick a location, upload a photo, and submit
4. All users see new incidents appear in real-time

## Tech Stack

Next.js 16 | React 19 | Tailwind CSS 4 | Firebase (Auth, Firestore, Storage) | Leaflet | EyePop.ai

## Getting Started

```bash
cd my-app
cp .env.local.example .env.local   # fill in your Firebase config
pnpm install
pnpm dev                            # http://localhost:3000
```

## Documentation

- [REPO.md](REPO.md) — Full project structure, architecture, Firestore schema, and deployment guide
- [CLAUDE.md](CLAUDE.md) — Implementation plan and phased build order
- [PROD.md](PROD.md) — Teardown guide for shutting down Vercel, Firebase, and billing after the hackathon
