@echo off
title Pharmacy Management System - Backend & Frontend
color 0A

echo.
echo ========================================
echo   Pharmacy Management System
echo   Starting Backend and Frontend
echo ========================================
echo.

:: Check if venv exists
if not exist "venv\Scripts\activate.bat" (
    echo [ERROR] Virtual environment not found!
    echo Please run: python -m venv venv
    pause
    exit /b 1
)

:: Check if frontend dependencies are installed
if not exist "frontend\node_modules" (
    echo [WARNING] Frontend dependencies not found!
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

echo.
echo [INFO] Starting Backend Server (Port 8000)...
echo [INFO] Starting Frontend Dev Server (Port 5173)...
echo.

:: Start Backend in new window
start "Pharmacy Backend" cmd /k "title Pharmacy Backend Server && color 0B && echo Starting Backend... && call venv\Scripts\activate.bat && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

:: Wait a moment for backend to initialize
timeout /t 2 /nobreak >nul

:: Start Frontend in new window
start "Pharmacy Frontend" cmd /k "title Pharmacy Frontend Server && color 0C && echo Starting Frontend... && cd frontend && npm run dev"

echo.
echo ========================================
echo   Servers Started Successfully!
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:8000/docs
echo.
echo Press any key to close this window (servers will continue running)...
pause >nul
