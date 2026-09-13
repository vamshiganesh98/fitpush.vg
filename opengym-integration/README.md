# FitPush + [openGym](https://github.com/DuarteSantos8/openGym)

Use **both** apps together — each does what it's best at.

| | **openGym** | **FitPush** (this repo) |
|---|---|---|
| **Workouts** | ✅ Guided sessions, 1,300+ exercises, progression, muscle map | Basic log only |
| **Diet** | ❌ | ✅ South Indian meals, AI autofill |
| **Data storage** | ✅ Your server (not just phone) | Browser only |
| **AI coach** | ✅ Gemini / OpenAI — **writes & revises your plan** | Meal/workout autofill as you type |
| **Apple Health** | ✅ Import **body weight** from export | ❌ Web app can't read HealthKit |
| **Cost** | Self-host free; AI = your API key | Free on GitHub Pages |

## Quick try (no install)

1. **Workouts:** [openGym demo](https://opengym.duarte-santos.ch/demo/) — real app with sample data  
2. **Diet:** [FitPush](https://vamshiganesh98.github.io/fitpush.vg/)

## Import your weekly plan into openGym

1. Open openGym → **Plan** → **Import plan** (or Settings → share/import)  
2. Import `vamshi-weekly-plan.opengym.json` from this folder  
3. Adjust exercise names/weights — incline DB is pre-filled at **30 kg** per your log  

Schedule: Mon chest, Tue legs, Wed back, Fri arms, Thu shoulders.

## Self-host openGym (recommended)

You need a small server (VPS, Railway, home PC with Docker).

```bash
git clone https://github.com/DuarteSantos8/openGym
cd openGym
cp .env.example .env
# Edit .env: RP_ID and ORIGIN = your domain (HTTPS for passkeys on phone)
docker compose pull
docker compose up -d
```

Open `http://YOUR_SERVER:8080` → create profile with **Face ID / passkey**.

### Enable AI coach with **Gemini** (free tier)

1. Get a key: [Google AI Studio](https://aistudio.google.com/apikey)  
2. In openGym: **Settings → Admin → AI Coach** → ON  
3. Provider: **Gemini** → paste key → **Test**  
4. **Plan → AI Coach** → intake → it builds/revises your program from what you log  

Same for OpenAI if you prefer — both are **your** keys, **your** server.

### Apple Health (body weight)

openGym cannot live-sync HealthKit in the browser. It **can**:

- Import an **Apple Health export** (Settings → export data → import in openGym)  
- Log weight each workout (quick weigh-in before session)  

Steps/sleep/HR from Apple Watch need a **native app** — openGym's **Android APK** or future iOS; the web PWA does not get HealthKit.

## Why not one app?

openGym is a mature **AGPL** gym tracker (1,300 exercises, progression engine). FitPush is your **diet + South Indian coach**. Merging them means a large fork. This folder is the practical bridge until a single native iOS app exists.

## Links

- openGym: https://github.com/DuarteSantos8/openGym  
- AI coach docs: https://github.com/DuarteSantos8/openGym/blob/main/docs/AI_COACH.md  
- Self-hosting: https://github.com/DuarteSantos8/openGym/blob/main/docs/SELF_HOSTING.md  
