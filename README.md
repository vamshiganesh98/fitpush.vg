# FitPush — Diet + Gym + AI (one free app)

**One app** for South Indian diet, gym logging, and AI coaching. No subscription.

| Tab | What |
|-----|------|
| **Home** | Macros, daily verdict, quick link to AI plan |
| **Diet** | Type meals → AI autofill → log manually |
| **Gym** | Type exercises → AI fills weights from history |
| **AI** | Daily meal + workout plan, chat coach |
| **You** | Profile, Gemini key, history, backup |

## Free AI

1. Open [Google AI Studio](https://aistudio.google.com/apikey) → Create API key (free tier)
2. **You** tab → paste Gemini key
3. **AI** tab → Plan my day / ask questions

Without a key, local coach + autofill still work.

## Live app

**https://vamshiganesh98.github.io/fitpush.vg/**

Add to iPhone Home Screen from Safari.

## Backup

**You → Download backup** — save JSON to Files/iCloud. Restore on a new phone with **Restore from backup**.

## Deploy with server AI (optional)

Connect repo to [Vercel](https://vercel.com) (free) and set `GEMINI_API_KEY` — then AI works without pasting a key on each device.

## Tech

Next.js · localStorage · Gemini API · PWA
