# AutoApply AI — Setup & Developer Guide

## Prerequisites
- **Node.js**: v18.0.0+ (Tested with v22.20.0)
- **Python**: 3.8+ (Tested with 3.8.10)
- **Supabase Project**: Free tier or self-hosted Supabase project

---

## 1. Supabase Database & Storage Setup
1. Open your Supabase project dashboard.
2. Navigate to the **SQL Editor**.
3. Run the migrations in order:
   - First, run [`supabase/migrations/00001_initial_schema.sql`](../supabase/migrations/00001_initial_schema.sql) to create all domain tables and constraints.
   - Second, run [`supabase/migrations/00002_rls_and_storage.sql`](../supabase/migrations/00002_rls_and_storage.sql) to enable Row-Level Security and initialize the private `resumes` storage bucket with access policies.
4. (Optional) Run [`supabase/seed.sql`](../supabase/seed.sql) if you want sample job records for testing.

---

## 2. Backend Setup (FastAPI)
1. Open a terminal in `backend/`:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the environment template and populate with your Supabase credentials:
   ```powershell
   cp .env.example .env
   ```
5. Run automated tests:
   ```bash
   pytest
   ```
6. Start the development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   Interactive OpenAPI documentation is accessible at `http://localhost:8000/docs`.

---

## 3. Frontend Setup (Next.js)
1. Open a terminal in `frontend/`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment template:
   ```powershell
   cp .env.example .env.local
   ```
   Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000` in your browser.
