# PostureGuard

Real-time posture monitoring web app and Chrome extension with strict neck/spine analysis, background alerts, and a ranked progression system.

**Live demo:** deploy with Vercel (see below) · **Repo:** https://github.com/immmune-etude/posture-guard

## Features

- Strict multi-point posture scoring (CVA, neck angle, forward head, spine curvature, shoulder roll)
- Neon skeleton overlay with customizable colors
- Background monitoring + desktop notifications (Chrome extension)
- Rank ladder: Iron → Bronze → Silver → Gold → Platinum → Diamond → Master → Champion
- Date-tracked streaks, RR history charts, and session analytics
- Showcase landing page for portfolio demos
- 100% client-side MediaPipe pose detection

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173/ → **Try Live Demo** → **Start Monitoring**

## Deploy Online (Showcase)

### Vercel (recommended)

```bash
npm run build
npx vercel --prod
```

Or connect the GitHub repo at [vercel.com](https://vercel.com):
- **Build command:** `npm run build`
- **Output directory:** `dist/app`

### Preview production build locally

```bash
npm run build
npm run preview
```

## Chrome Extension

```bash
npm run build:extension
```

Load `dist/extension/` as an unpacked extension in `chrome://extensions`.

- **Side panel:** main monitoring UI
- **Monitor in Background:** keeps camera running via offscreen document while you browse
- **Notifications:** alerts when bad posture persists ~20 seconds

## Privacy

All pose detection runs locally via MediaPipe WASM. No video leaves your device.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production web build → `dist/app/` |
| `npm run build:extension` | Extension bundle → `dist/extension/` |
| `npm test` | Unit tests |
| `npm run preview` | Preview production build |

## License

MIT
