@echo off
echo ===================================================
echo Starting AutoApply AI (FastAPI Backend + Next.js)
echo ===================================================

echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "AutoApply AI - Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --port 8000 --reload"

echo [2/2] Starting Next.js Frontend on http://localhost:3000 ...
start "AutoApply AI - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both servers are launching!
echo Backend Swagger Docs: http://127.0.0.1:8000/docs
echo Frontend Dashboard:   http://localhost:3000
echo.
pause
