@echo off
echo =========================================================================
echo       STARTING AI SALON VIRTUAL HAIRSTYLE TRY-ON SYSTEM (LOCAL)
echo =========================================================================

echo [1/3] Starting ML Inference Microservice on Port 8001...
start "AI Salon ML Service (Port 8001)" cmd /k "cd ml-service && python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Backend API Gateway on Port 8000...
start "AI Salon Backend API (Port 8000)" cmd /k "cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo [3/3] Starting React 19 Frontend Studio on Port 3000...
start "AI Salon Frontend Studio (Port 3000)" cmd /k "cd frontend && npm run dev"

echo =========================================================================
echo All services launched!
echo Access the application at: http://localhost:3000
echo Backend API Docs at:       http://localhost:8000/docs
echo ML Microservice at:        http://localhost:8001/health
echo =========================================================================
pause
