@echo off
echo ==========================================================
echo  Starting UMKM Insight full-stack application...
echo ==========================================================

echo Starting Express backend on port 5000...
start "UMKM Insight Backend" cmd /k "cd backend && npm run dev"

echo Starting Next.js frontend on port 3001...
start "UMKM Insight Frontend" cmd /k "cd frontend && npm run dev"

echo Waiting for servers to initialize...
timeout /t 5 >nul

echo Opening browser...
start http://localhost:3001

echo ==========================================================
echo  Servers launched in separate windows! 
echo  Keep the windows open to maintain connections.
echo ==========================================================
pause
