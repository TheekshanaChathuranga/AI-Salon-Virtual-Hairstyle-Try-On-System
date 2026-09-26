Write-Host "=========================================================================" -ForegroundColor Gold
Write-Host "      STARTING AI SALON VIRTUAL HAIRSTYLE TRY-ON SYSTEM (LOCAL)          " -ForegroundColor Gold
Write-Host "=========================================================================" -ForegroundColor Gold

Write-Host "`n[1/3] Starting ML Inference Microservice on Port 8001..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ml-service; python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload"

Start-Sleep -Seconds 3

Write-Host "[2/3] Starting Backend API Gateway on Port 8000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

Start-Sleep -Seconds 3

Write-Host "[3/3] Starting React 19 Frontend Studio on Port 3000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "`n=========================================================================" -ForegroundColor Green
Write-Host "All services launched successfully!" -ForegroundColor Green
Write-Host "  -> Frontend Studio:     http://localhost:3000" -ForegroundColor White
Write-Host "  -> Backend API Docs:    http://localhost:8000/docs" -ForegroundColor White
Write-Host "  -> ML Microservice:     http://localhost:8001/health" -ForegroundColor White
Write-Host "=========================================================================" -ForegroundColor Green
