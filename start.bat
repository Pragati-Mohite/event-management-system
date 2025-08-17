@echo off
echo Starting Event Management System...
echo.

echo Starting Backend Server...
start "Backend" cmd /c "cd backend && npm start"

timeout /t 5 /nobreak > nul

echo Starting Frontend Server...
start "Frontend" cmd /c "cd frontend && npm run dev"

timeout /t 5 /nobreak > nul

echo.
echo Both servers are starting...
echo Backend should be available at: http://localhost:5000
echo Frontend should be available at: http://localhost:5173
echo.
echo Opening frontend in browser...
timeout /t 3 /nobreak > nul
start http://localhost:5173

pause
