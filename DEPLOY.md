# Deploy PostureGuard Online

PostureGuard is a static React app. Deploy the **`dist/app`** folder after building.

## Option 1: Vercel (Recommended — free, ~2 minutes)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New → Project**
3. Import **`immmune-etude/posture-guard`**
4. Use these settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/app`
5. Click **Deploy**

Vercel will give you a URL like `https://posture-guard.vercel.app`.

Every push to `main` auto-deploys if you connected the repo.

### Deploy from terminal

```bash
cd ~/Projects/posture-guard
npm install
npx vercel --prod
```

Follow the prompts. First run links the project; later runs redeploy instantly.

---

## Option 2: Netlify

1. Go to [netlify.com](https://netlify.com) → **Add new site → Import from Git**
2. Select the `posture-guard` repo
3. Settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist/app`
4. Deploy

---

## Option 3: GitHub Pages

```bash
npm run build
npx gh-pages -d dist/app
```

Or use GitHub Actions — add a workflow that runs `npm run build` and publishes `dist/app`.

---

## After deploying

- Open your live URL → **Try Live Demo** → **Start Monitoring**
- Allow camera access when prompted
- The app requires **HTTPS** for webcam access (Vercel/Netlify provide this automatically)

## Custom domain

In Vercel or Netlify project settings → **Domains** → add your domain (e.g. `postureguard.yourname.com`).

## Notes

- MediaPipe WASM files are bundled in `public/mediapipe/` — no extra server config needed
- `vercel.json` already sets COOP/COEP headers required for WASM
- Chrome extension is separate — load `dist/extension/` locally; it is not hosted on the website
