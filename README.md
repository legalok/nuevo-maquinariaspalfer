# Maquinarias PalFer — Premium Coffee Machinery Web

A multilingual landing site for Maquinarias PalFer (industrial coffee machinery).
Built with **React + Vite + TypeScript** on the frontend and **FastAPI + MongoDB** on
the backend. Includes:

- Hero + categories with auto-optimised, lazy-loaded video showcases.
- Editable site content via an in-app admin panel (double-click logo →
  password).
- Floating AI chat assistant (Claude Haiku 4.5) that only answers using the
  current site content.
- "I'm ready to buy" lead form with a dedicated **"Personas listas para
  comprar"** dashboard for the admin.
- Auto-detected language by visitor country (Cloudflare `cf-ipcountry`) +
  manual override that takes priority. **14 languages** translated by AI and
  cached on disk so subsequent visitors load instantly.

---

## 📁 Project structure

```
.
├── backend/                       # FastAPI app (port 8001)
│   ├── server.py                  # All routes
│   ├── i18n.py                    # Language helpers + translation cache
│   ├── site-content.json          # Editable content (admin panel writes here)
│   ├── requirements.txt
│   └── .env.example
├── frontend/                      # Vite + React + TS app (port 3000)
│   ├── src/
│   │   ├── App.tsx
│   │   ├── i18n.tsx               # I18n provider + useI18n() hook
│   │   └── components/
│   │       ├── ChatWidget.tsx
│   │       ├── LeadForm.tsx
│   │       └── Hero.tsx
│   ├── public/                    # Static assets (videos, posters, logo)
│   ├── package.json
│   ├── vite.config.ts
│   └── .env.example
├── vercel.json                    # Vercel deploy config (frontend)
├── .gitignore
└── README.md
```

---

## 🔧 Local development

### 1. Clone and install

```bash
git clone https://github.com/<your-user>/maquinarias-palfer.git
cd maquinarias-palfer

# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then fill EMERGENT_LLM_KEY etc.
cd ..

# Frontend
cd frontend
yarn install
cp .env.example .env   # set REACT_APP_BACKEND_URL=http://localhost:8001
cd ..
```

### 2. Run

```bash
# Terminal A — backend
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 8001

# Terminal B — frontend
cd frontend
yarn dev
```

Open http://localhost:3000.

> **Note about ffmpeg:** the backend auto-optimises uploaded videos with
> `+faststart` and generates poster JPEGs. Install ffmpeg if you intend to
> upload through the admin panel:
> ```bash
> sudo apt install ffmpeg            # Debian / Ubuntu
> brew install ffmpeg                # macOS
> ```
> If ffmpeg is missing, uploads still work but are not optimised.

### 3. Admin panel

- Double-click the logo (top-left or footer).
- Default password: `palfer2024` (override via `ADMIN_PASSWORD` env var).

---

## ☁️ Deployment

The cleanest production layout is **frontend on Vercel** + **backend on a
container host** (Railway, Render, Fly.io, Hetzner, …) with **MongoDB Atlas**
as the database. Vercel's serverless platform cannot run ffmpeg or persist
files between requests, so the backend is best deployed as a long-running
service.

### A. Frontend on Vercel

1. Push the repo to GitHub.
2. In Vercel → **New Project → Import**.
3. Vercel will auto-detect Vite from `vercel.json` and run
   `cd frontend && yarn install && yarn build`.
4. Set the project environment variable in Vercel:
   - `REACT_APP_BACKEND_URL` → leave empty (rewrites handle `/api/*`).
5. Edit `vercel.json` and replace `https://YOUR-BACKEND.example.com` with the
   real URL of your deployed backend (e.g. `https://palfer-api.up.railway.app`).
6. Re-deploy.

That's it — the SPA is served from Vercel's edge CDN and `/api/*` requests are
proxied to your backend.

### B. Backend on Railway (recommended)

1. Push the repo to GitHub.
2. In Railway → **New Project → Deploy from GitHub repo**.
3. Set the **Root Directory** to `backend`.
4. **Start command:** `uvicorn server:app --host 0.0.0.0 --port $PORT`.
5. Add environment variables:
   - `MONGO_URL` → your MongoDB Atlas connection string.
   - `DB_NAME` → `palfer`.
   - `EMERGENT_LLM_KEY` → your key.
   - `ADMIN_PASSWORD` → choose a strong password.
6. Add the public domain Railway gives you to the rewrite in `vercel.json`.

> Railway's Nixpacks builder installs ffmpeg automatically when it sees
> `requirements.txt`. If you switch to another host, install ffmpeg in the
> Docker image so video optimisation keeps working.

### C. Backend on Vercel (with limitations)

If you really want everything on Vercel:

- Use **MongoDB Atlas** (no localhost MongoDB on Vercel).
- Convert `backend/server.py` into Vercel functions (move into `/api/`
  directory and use `@vercel/python`).
- Disable the ffmpeg optimisation step (Vercel runtime has no ffmpeg).
- Replace the file-upload endpoint with **Vercel Blob** or **Cloudinary**
  (the Vercel filesystem is read-only).
- Replace the disk-based `.i18n_cache.json` with a MongoDB collection.

These are non-trivial changes; option A+B above is what we recommend.

### Database

Create a free MongoDB Atlas cluster, allow your Vercel/Railway IPs (or
`0.0.0.0/0` for simplicity), and copy the connection string into `MONGO_URL`.

---

## 🔐 Environment variables

### Backend (`backend/.env`)

| Variable            | Required | Purpose                                         |
|---------------------|----------|-------------------------------------------------|
| `MONGO_URL`         | yes      | MongoDB connection string                       |
| `DB_NAME`           | yes      | Mongo database name (default `palfer`)          |
| `EMERGENT_LLM_KEY`  | yes      | Powers chat + i18n translation                  |
| `ADMIN_PASSWORD`    | no       | Master password for admin panel (default `palfer2024`) |

### Frontend (`frontend/.env`)

| Variable                | Purpose                                               |
|-------------------------|-------------------------------------------------------|
| `REACT_APP_BACKEND_URL` | Public URL of the backend. Leave empty when serving frontend and backend behind the same host (Vercel rewrites). |

> The frontend currently uses **relative `/api/*` URLs**, which means in
> production the same domain that serves the SPA must also route `/api/*` to
> the backend. With the provided `vercel.json` rewrites that is automatic
> once you fill the destination URL.

---

## 🌐 Supported languages

`es, en, pt, fr, de, it, ja, zh, ko, ar, vi, am, ru, tr` — auto-translated
on first request and cached on disk (`backend/.i18n_cache.json`).

To add a new language:

1. Add the code to `SUPPORTED_LANGS` and `LANG_NAMES_FOR_LLM` in
   `backend/i18n.py`.
2. Add a new entry to the `LANGUAGES` array in `frontend/src/App.tsx`.
3. The first visitor to pick the language triggers a one-time translation
   (1-5 seconds) which is then cached forever.

---

## 📦 Scripts

```bash
# Frontend
cd frontend
yarn dev          # local dev server on :3000
yarn build        # production build → frontend/dist
yarn preview      # serve the built bundle locally

# Backend
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

---

## 📝 License

Proprietary © 2024 Maquinarias PalFer. Contact the company before reusing
the assets, copy or content.
