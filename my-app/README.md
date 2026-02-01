This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## EyePop.ai integration 🔧

This app can send uploaded photos to EyePop.ai for automatic analysis. To enable it locally:

1. Add your EyePop API key to `.env.local`:

```env
EYEPOP_API_KEY=sk_...  # or EYEPOP_SECRET_KEY if you already have that
EYEPOP_POP_ID=...      # optional, some EyePop flows use a pop id
```

2. (Optional) Install the official SDK if you prefer to use it instead of the HTTP fallback:

```bash
# in my-app
pnpm add @eyepop.ai/eyepop
# or
npm install @eyepop.ai/eyepop --save
```

3. Restart the dev server. When you upload a photo and click **Analyze Photo**, the app will POST the file to `/api/analyze`, the server will call EyePop, and the returned tags will be shown as risk labels in the review step.

> If the API key is not configured, the analyze endpoint will return a harmless stubbed analysis so you can continue development.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
