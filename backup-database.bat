@echo off
REM Database Backup Script for Pharmacy Management System
REM This script creates a backup of the SQLite database

echo ========================================
echo Pharmacy Management System - Database Backup
echo ========================================
echo.

REM Create backups directory if it doesn't exist
if not exist backups mkdir backups

REM Generate timestamp
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set timestamp=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%_%datetime:~8,2%-%datetime:~10,2%-%datetime:~12,2%

REM Check if Docker is running
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not running
    pause
    exit /b 1
)

echo Creating backup: pharmacy_backup_%timestamp%.db
echo.

REM Copy database file from Docker container
docker cp pharmacy-backend:/app/data/pharmacy.db backups/pharmacy_backup_%timestamp%.db

if errorlevel 1 (
    echo ERROR: Failed to create backup
    echo Make sure the backend container is running
    pause
    exit /b 1
)

echo.
echo ========================================
echo Backup Successful!
echo ========================================
echo.
echo Backup file: backups\pharmacy_backup_%timestamp%.db
echo.

REM List recent backups
echo Recent backups:
dir /B /O-D backups\pharmacy_backup_*.db | more
echo.

pause
