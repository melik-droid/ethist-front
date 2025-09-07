# Racfella – Call and Calm. Your Balance.

Racfella is a privacy‑first, emotion‑intelligent companion that restores signal when noise overwhelms. It’s built for traders and anyone who faces chaotic states: a confidant that helps you stabilize before you even ask.

## What Racfella does

- Instant Guidance
  - Rapid stabilization when spirals hit. Calming sequences grounded in cognitive science: breathing anchors, reframing cues, and calm prompts. Designed to intercept volatility so you recover in seconds, not hours.
- Emotion Tracking
  - Your invisible journal. Track spikes without exposure, surface hidden triggers, and map recovery patterns—turning chaos into patterns, and patterns into resilience.
- Privacy First
  - No public identity. No invasive profiling. Your state exists only in the moment you share it—encrypted, transient, sovereign. Rac’fella doesn’t remember you to own you; it forgets to protect you.
- Agentic Flow
  - Not passive or reactive. Rac’fella steers with pacing and questions, guiding you out of loops instead of echoing them—the difference between a mirror and a mentor.

## Who it’s for

- Traders and operators navigating high‑volatility environments
- Anyone who wants a non‑judgmental companion for clarity, grounding, and recovery

## Principles

- Privacy‑first by default
- Non‑judgmental, stabilizing tone
- Designed for volatile emotional states: fast, stable, and focused

## Try it

Start a session and feel the difference:
- WhatsApp: https://wa.me/18207773878?text=hi

---

## For developers

### Tech stack

- React 19 + TypeScript 5 + Vite 7
- Tailwind CSS v4
- RainbowKit 2 + wagmi 2 + viem
- TanStack Query 5

## Getting started

Prerequisites:
- Node.js 18+ and npm

Install dependencies:
- npm install

Run in development:
- npm run dev

Build for production:
- npm run build

Preview the production build:
- npm run preview

## Project structure

Key files and folders:
- `src/pages/HomePage.tsx` – Landing hero, video, and marketing sections
- `src/pages/RecordPage.tsx` – Record flow with entry overlay and wallet gating
- `src/pages/JournalPage.tsx` – Journal timeline (connected) + disconnected preview
- `src/components/Navigation.tsx` or `SiteNavbar` – Header with mobile overlay menu
- `src/wagmi.ts` – wagmi/RainbowKit configuration (connectors and chains)
- `src/index.css` – Global styles, arch background, and animation keyframes
- `public/Intro.mp4` – Demo video asset (see below)

## Video asset

The demo video on the Home page loads from `public/Intro.mp4`. Ensure the file name is exactly `Intro.mp4` (case-sensitive). A remote fallback source is included for development.

## Wallets and chains

Wallets: MetaMask, Coinbase, WalletConnect, and a generic Injected option are configured via RainbowKit connectors. To change supported wallets or target chains, edit `src/wagmi.ts`.

Notes:
- The connect modal is triggered before protected flows (e.g., record API). No API call is made until the wallet is connected.
- If you need custom RPC endpoints or testnets, configure them in `src/wagmi.ts` using viem chain helpers.

## Styling and animations

- The hero background ring is a centered, static radial pattern implemented via `.bg-arch-pattern::before`.
- The circle behind the hero heading uses a slow spin and staggered ripple animation (`.spin-slow`, `.ripple`, `.ripple-delay`).
- Mobile menu opens as a full-screen overlay with dim/blur, locks body scroll, and can be dismissed via ESC or close button.

## Accessibility

- Keyboard focus states are emphasized on primary CTAs.
- Animations are subtle; if needed, a future enhancement can add `prefers-reduced-motion` guards.

## Deployment

This is a static Vite app. You can deploy the `dist` folder to any static host (Vercel, Netlify, GitHub Pages, etc.).

Steps:
1) Build – `npm run build`
2) Upload the `dist/` output to your hosting provider

If your app is served from a subpath, configure Vite’s `base` in `vite.config.ts` accordingly.

## Troubleshooting

- Video does not load
  - Ensure `public/Intro.mp4` exists (case-sensitive)
  - Check the browser console for CORS or decoding errors
  - The remote fallback should appear if the local file is missing

- Wallet modal does not open
  - Make sure you’re using a supported browser wallet (e.g., MetaMask) and the extension is unlocked
  - Some wallets require HTTPS in production; localhost is fine for development

- Styles look off / background shifts
  - The hero arch background is centered and sized with fixed dimensions in `.bg-arch-pattern::before`
  - Adjust the size in `src/index.css` if you want a larger/smaller ring

## Scripts

- `npm run dev` – Start the dev server
- `npm run build` – Type-check and build for production
- `npm run preview` – Preview the built app
- `npm run lint` – Run ESLint

## License

Proprietary – All rights reserved. Contact the maintainers for usage permissions.

