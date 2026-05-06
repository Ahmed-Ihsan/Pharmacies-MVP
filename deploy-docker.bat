@echo off
REM Docker Deployment Script for Pharmacy Management System
REM This script builds and starts the application using Docker Compose

echo ========================================
echo Pharmacy Management System - Docker Setup
echo ========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not installed or not in PATH
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo Docker is installed.
echo.

REM Check if Docker Compose is available
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker Compose is not available
    echo Please ensure Docker Desktop is running
    pause
    exit /b 1
)

echo Docker Compose is available.
echo.

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file with default settings...
    echo SECRET_KEY=pharmacy-management-secret-key-2024 > .env
    echo DATABASE_URL=sqlite:///./data/pharmacy.db >> .env
    echo DEBUG=True >> .env
    echo .env file created.
    echo.
) else (
    echo .env file already exists.
    echo.
)

REM Create data directory if it doesn't exist
if not exist data (
    echo Creating data directory...
    mkdir data
    echo Data directory created.
    echo.
)

REM Build and start services
echo Building and starting Docker containers...
echo This may take a few minutes on first run...
echo.
docker-compose up --build -d

if errorlevel 1 (
    echo.
    echo ERROR: Failed to build/start containers
    echo Check the error messages above for details
    pause
    exit /b 1
)

echo.
echo ========================================
echo Deployment Successful!
echo ========================================
echo.
echo Application is now running:
echo   - Frontend:  http://localhost
echo   - Backend:   http://localhost:8000
echo   - API Docs:  http://localhost:8000/docs
echo.
echo To view logs: docker-compose logs -f
echo To stop:      docker-compose down
echo.
pause
