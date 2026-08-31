# FitPush — AI Fitness & Diet Tracker

A mobile-first PWA built for your recomposition goals: lose love handles, gain muscle, improve posture.

## Features

- **Meal logging** with South Indian food presets (idli, dosa, chapati, pongal, upma, rice, dal, sambar, paneer, curd, protein shakes)
- **Post-meal AI coach** — blunt feedback after every meal (rule-based; optional OpenAI)
- **Workout tracker** — sets, reps, weight for your Mon–Fri split + badminton
- **Weekly check-in** — weight, waist, body fat, posture notes with trend tracking
- **Daily dashboard** — protein/calorie progress, coach verdict, posture reminders
- **Your profile pre-configured** — vegetarian, no eggs at home, paneer yes, 145g protein target

## Run locally

```bash
cd fitpush
npm install
npm run dev
```

Open on your iPhone: `http://<your-computer-ip>:3000`

### Add to iPhone Home Screen

1. Open the app in Safari
2. Tap Share → **Add to Home Screen**
3. Use it like a native app

## Deploy to GitHub Pages (fitpush.vg)

Repo: **https://github.com/fitpush.vg/fitpush**

### Push code

```bash
cd fitpush
git remote add origin https://github.com/fitpush.vg/fitpush.git
git branch -M main
git push -u origin main
```

### Enable GitHub Pages

1. GitHub → **fitpush.vg/fitpush** → **Settings** → **Pages**
2. Source: **GitHub Actions**
3. Wait for the deploy workflow to finish (green check on Actions tab)

### Custom domain

The app is configured for **https://fitpush.vg**

1. In **Pages** settings, set custom domain to `fitpush.vg`
2. At your domain registrar, add DNS records:
   - `A` records → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - OR `CNAME` for `www` → `fitpush.vg.github.io` (if using www)
3. Enable **Enforce HTTPS** once DNS propagates

### iPhone

1. Open **https://fitpush.vg** in Safari
2. Share → **Add to Home Screen**

## Tech

- Next.js 16 + TypeScript + Tailwind
- Client-side storage (localStorage) — your data stays on your device
- PWA manifest for iPhone home screen install

## Your daily workflow

1. **Log breakfast** → get coach feedback (add paneer/curd if missing)
2. **Log lunch** → rice capped at 180g warning
3. **Log workout** → track weights for progressive overload
4. **Log dinner + evening snacks**
5. **Sunday** → weekly waist/weight/body fat check-in
