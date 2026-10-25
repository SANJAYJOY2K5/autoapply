# AutoApply AI — Complete Live Cloud Deployment Guide

Follow this guide to deploy AutoApply AI live online so it runs 24/7 without needing your laptop powered on.

```
┌────────────────────────────────────────────────────────┐
│                   1. GitHub Repository                 │
│                 (Houses entire codebase)               │
└───────────────────────────┬────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
┌───────────────────────────┐ ┌───────────────────────────┐
│     Next.js Frontend      │ │      FastAPI Backend      │
│     (Hosted on Vercel)    │ │   & 24/7 Celery Worker    │
│                           │ │    (Hosted on Render)     │
└─────────────┬─────────────┘ └───────────┬───────────────┘
              │                           │
              └─────────────┬─────────────┘
                            ▼
              ┌───────────────────────────┐
              │    Supabase PostgreSQL    │
              │  & Private Resume Storage │
              └───────────────────────────┘
```

---

## Step 1: Push Code to GitHub

1. Open [github.com/new](https://github.com/new) in your browser.
2. Set repository name to: **`autoapply`** (leave it Public or Private).
3. Do **NOT** initialize with README or .gitignore (we already have them). Click **"Create repository"**.
4. In your terminal (in `c:\Users\kisho\OneDrive\Desktop\autoapply`), run:
   ```powershell
   git remote add origin https://github.com/<YOUR-GITHUB-USERNAME>/autoapply.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 2: Set Up Supabase Cloud Database & Storage (Free)

1. Go to [supabase.com](https://supabase.com) and create a free project:
   - Name: `autoapply`
   - Region: **South Asia (Mumbai)** for lowest latency.
2. In your Supabase Dashboard, click **SQL Editor** on the left menu:
   - Run [`supabase/migrations/00001_initial_schema.sql`](../supabase/migrations/00001_initial_schema.sql) (creates tables and constraints).
   - Run [`supabase/migrations/00002_rls_and_storage.sql`](../supabase/migrations/00002_rls_and_storage.sql) (enables RLS and private resume bucket).
3. Copy your project credentials:
   - Go to **Project Settings** → **API**.
   - Copy:
     - `Project URL`
     - `anon public key`
     - `service_role secret key`
     - `JWT Secret`

---

## Step 3: Deploy Backend & 24/7 Worker to Render (render.com)

1. Open [dashboard.render.com](https://dashboard.render.com). (Sign up for free if you haven't yet).
2. Click the blue **"New +"** button in the top right → select **"Blueprint"**.
3. Connect your GitHub account and select your **`autoapply`** repository.
4. Render will read [`render.yaml`](../render.yaml) automatically! It will show:
   - Service 1: `autoapply-backend-api` (FastAPI Web Service)
   - Service 2: `autoapply-worker` (24/7 Celery hourly discovery buddy)
   - Service 3: `autoapply-redis` (Internal task broker)
5. Fill in the environment variables when prompted:
   - `SUPABASE_URL`: (from Step 2)
   - `SUPABASE_SERVICE_ROLE_KEY`: (from Step 2)
   - `SUPABASE_JWT_SECRET`: (from Step 2)
6. Click **"Apply"**.
7. Once deployment finishes (takes ~2 minutes), copy your live backend URL:
   - Example: `https://autoapply-backend-api.onrender.com`

---

## Step 4: Deploy Frontend to Vercel (vercel.com)

1. Open [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New..."** → **"Project"**.
3. Find your **`autoapply`** repository and click **"Import"**.
4. In the configuration screen:
   - Click **Edit** next to **Root Directory** and select: **`frontend`**.
   - Expand **Environment Variables** and add:
     - `NEXT_PUBLIC_API_BASE_URL` = your live Render URL (e.g. `https://autoapply-backend-api.onrender.com`)
     - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase Anon Key
5. Click **"Deploy"**.
6. Within 60 seconds, Vercel will give you your live URL:
   - Example: `https://autoapply-ai.vercel.app`

---

## Step 5: Test Your Live System Online

1. Open your live Vercel URL on your phone or laptop.
2. Go to **Profile** → Upload your resume and save your preferences for **Chennai + Remote India (75% Gate)**.
3. Go to **Jobs** → Click **"Sync Live Feeds"** to watch live jobs stream in directly from LinkedIn and Shine.
4. Your Render background worker is now actively running in the cloud 24/7!
