# Teardown Guide

How to fully shut down the UCSD Safety Alerts app after hackathon judging.

## 1. Vercel — Remove Deployment

1. Go to https://vercel.com/dashboard
2. Click on your project (e.g. `my-app`)
3. Go to **Settings** → scroll to the bottom → **Delete Project**
4. Confirm deletion

This immediately takes the site offline. The URL will stop working.

## 2. Firebase — Disable Services

### Option A: Delete the entire Firebase project (nuclear option)

1. Go to https://console.firebase.google.com
2. Click on your project (`sd-hacks-82d76`)
3. Click the **gear icon** → **Project settings**
4. Scroll to the very bottom → **Delete project**
5. Check all the confirmation boxes → **Delete project**

This removes everything: Auth, Firestore, Storage, all data. Done.

### Option B: Disable individual services (keep project for later)

#### Disable Auth
1. Firebase Console → Authentication → Settings → **Authorized domains**
2. Remove your Vercel domain (keep only `localhost` and the default Firebase domains)
3. This prevents anyone from signing in from the deployed site

#### Lock down Firestore
1. Firebase Console → Firestore Database → **Rules** tab
2. Replace rules with:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```
3. Click **Publish** — this blocks all reads and writes

#### Lock down Storage
1. Firebase Console → Storage → **Rules** tab
2. Replace rules with:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```
3. Click **Publish** — this blocks all uploads and downloads

#### Delete stored data (optional)
- Firestore Console → select `incidents` collection → **Delete collection**
- Storage Console → select `incidents/` folder → **Delete all files**

## 3. Firebase Billing — Verify No Charges

1. Firebase Console → gear icon → **Usage and billing**
2. Confirm you're on the **Spark (free)** plan
3. If you're on Blaze (pay-as-you-go): switch back to Spark, or delete the project entirely

If you linked a card to upgrade to Blaze at any point:
1. Go to https://console.cloud.google.com/billing
2. Click your billing account
3. **Account management** → **Close billing account**
4. This prevents any future charges from any Google Cloud / Firebase project linked to that account

## 4. Vercel Billing — Verify No Charges

1. Go to https://vercel.com/dashboard
2. Click your avatar → **Settings** → **Billing**
3. Confirm you're on the **Hobby (free)** plan
4. If you added a payment method: remove it under **Payment Method**

## 5. Local Cleanup (optional)

Remove the env file with your Firebase config:
```bash
rm my-app/.env.local
```

## Checklist

- [ ] Vercel project deleted
- [ ] Firebase project deleted (or services locked down)
- [ ] Confirmed on Firebase Spark (free) plan
- [ ] Confirmed on Vercel Hobby (free) plan
- [ ] Payment methods removed (if any were added)
- [ ] Local `.env.local` deleted
