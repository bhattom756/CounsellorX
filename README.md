<div align="center">
  
  <h1><strong>CouncellorX</strong></h1>
  
  <p><strong>Your intelligent legal companion powered by Generative AI.</strong></p>
  
  <p>
    <img alt="Simple" src="https://img.shields.io/badge/Simple-ffe082?style=for-the-badge&labelColor=111827" />
    <img alt="Transparent" src="https://img.shields.io/badge/Transparent-c8e6c9?style=for-the-badge&labelColor=111827" />
    <img alt="Accessible" src="https://img.shields.io/badge/Accessible-bbdefb?style=for-the-badge&labelColor=111827" />
  </p>

</div>

### About Us

At **CouncellorX**, we are building an intelligent legal companion powered by Generative AI to make the law **simple**, **transparent**, and **accessible** for everyone.

Legal documents—whether rental agreements, loan contracts, or divorce papers—are often filled with jargon and hidden clauses that leave individuals confused and vulnerable. Our platform bridges this gap by providing **plain-language explanations**, **clause breakdowns**, and **risk alerts**, ensuring that no one enters a legal agreement blind.

By combining the power of **Generative AI** with a user-friendly platform, we empower individuals, small businesses, and communities to make informed legal decisions without fear of complexity. Our vision is to be the **first point of contact for legal clarity**, where every person feels confident, supported, and ready to protect their rights.

#### Core Features

- **Evidence & Document Analysis**: Identify what is admissible in court and highlight missing requirements.
- **Virtual Trial Simulation**: Experience a mock trial with AI judges, lawyers, and juries to assess your chances of winning.
- **Lawyer Recommendation System**: Find top-rated lawyers tailored to your case, based on specialization, success rate, and star ratings.

## CouncellorX

Modern Next.js app using the App Router, React 19, Tailwind CSS v4, and Turbopack. Fonts are optimized with `next/font` (Montserrat). This README covers setup, scripts, conventions, and deployment.

## Tech Stack

- **Framework**: Next.js 15 (App Router, React Server Components)
- **Runtime**: Node.js 18+
- **UI**: React 19, Tailwind CSS v4
- **Icons**: `lucide-react`, `react-icons`
- **Animation**: `react-awesome-reveal`, `tw-animate-css`
- **Tooling**: TypeScript 5, ESLint 9, Turbopack

## Requirements

- Node.js 18 or 20 (LTS recommended)
- pnpm, npm, bun, or yarn (examples use npm)

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server (Turbopack):

```bash
npm run dev
```

Open `http://localhost:3000` to view the app.

## Available Scripts

- `npm run dev`: Start dev server with Turbopack
- `npm run build`: Production build with Turbopack
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

## Project Structure

```
app/                 # App Router (server-first)
  layout.tsx         # Root layout (wraps all routes)
  page.tsx           # Home route
  globals.css        # Global styles (Tailwind v4 entry)
lib/                 # Utilities and shared code
public/              # Static assets
next.config.ts       # Next.js configuration
tailwind/postcss     # Config via @tailwindcss/postcss (Tailwind v4)
```

## Styling (Tailwind CSS v4)

- Tailwind v4 is enabled via `@tailwindcss/postcss` in `postcss.config.mjs` and imported in `app/globals.css`.
- Use utility classes directly in components. Global styles go in `app/globals.css`.

## Fonts (next/font)

Montserrat is configured in `app/layout.tsx` using `next/font` for automatic optimization and `font-display: swap`.

## Client vs Server Components

Next.js App Router is server-first by default.

- **Server Components (default)**: Fetch data, run on server, no client state.
- **Client Components**: Interactivity, browser APIs, React state/effects.

When creating a client page or component, add the directive at the very top of the file:

```tsx
"use client";
```

Keep it as the first statement (no imports or comments before it).

## TypeScript

- Strict, modern TypeScript with React 19 types.
- Prefer explicit types on public APIs and exported functions.

## Linting

Run ESLint:

```bash
npm run lint
```

Fix issues as reported. Follow the existing code style and formatting.

## Environment Variables

If you add environment variables, create `.env.local` in the project root and restart the dev server.

```env
# Example
NEXT_PUBLIC_API_BASE_URL=
```

Never commit secrets. Use `.env.local` for local development.

## Build

```bash
npm run build
```

Artifacts are output to `.next`. Start locally with `npm run start`.

## Docker

Containerization is supported. See `README.Docker.md` for detailed instructions and `compose.yaml` for local orchestration.

## Deployment

- Any Node.js host that supports Next.js 15. Build on CI and run `npm run start`.
- For best DX, deploy to Vercel. See Next.js deployment docs: `https://nextjs.org/docs/app/building-your-application/deploying`.

## Troubleshooting

- Port already in use: stop the other process or change the port.
- Stale types after dependency updates: restart the dev server/TS server.
- Fonts not applying: ensure `Montserrat` is initialized and `className` applied to `<body>` in `app/layout.tsx`.
