# PostureGuard

Real-time posture monitoring web app and Chrome extension. Uses MediaPipe Pose for on-device computer vision — no video ever leaves your browser.

## Features

- Live webcam pose tracking with neon skeleton overlay
- Forward head / slouch detection using CVA and torso lean metrics
- Alerts after 30 seconds of bad posture (visual flash + chime + notification)
- Session scoring and rank progression (Iron → Radiant)
- Posture history charts (localStorage; optional Firebase sync)
- Chrome Extension side panel scaffold

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS
- MediaPipe Pose (client-side)
- Zustand
- Recharts
- Firebase (optional)

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173`, click **Start Monitoring**, and allow camera access.

## Build

```bash
npm run build          # Web app
npm run build:extension # Extension bundle in dist/extension
```

## Chrome Extension

1. Run `npm run build:extension`
2. Open `chrome://extensions`
3. Enable Developer mode
4. Load unpacked → select `dist/extension`

## Privacy

All pose detection runs locally via MediaPipe WASM. Only aggregated session scores are stored (localStorage by default).

## Project Structure

```
src/
├── components/       # UI components
├── hooks/            # Camera, pose, posture, session hooks
├── lib/posture/      # Angle + scoring math
├── lib/gamification/ # Rank tiers + RR
└── stores/           # Zustand state
```

## License

MIT
