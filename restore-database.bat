@echo off
REM Database Restore Script for Pharmacy Management System
REM This script restores a backup of the SQLite database

echo ========================================
echo Pharmacy Management System - Database Restore
echo ========================================
echo.

REM Check if backups directory exists
if not exist backups (
    echo ERROR: No backups directory found
    echo Make sure to run backup-database.bat first
    pause
    exit /b 1
)

REM List available backups
echo Available backups:
echo.
dir /B /O-D backups\pharmacy_backup_*.db
echo.

REM Ask user which backup to restore
set /p backup_file="Enter backup filename (or full path): "

REM Check if file exists
if not exist "%backup_file%" (
    if exist "backups\%backup_file%" (
        set backup_file=backups\%backup_file%
    ) else (
        echo ERROR: Backup file not found: %backup_file%
        pause
        exit /b 1
    )
)

echo.
echo You are about to restore: %backup_file%
echo WARNING: This will replace the current database!
echo.
set /p confirm="Are you sure you want to continue? (Y/N): "

if /i not "%confirm%"=="Y" (
    echo Restore cancelled.
    pause
    exit /b 0
)

echo.
echo Stopping containers...
docker-compose down

echo.
echo Restoring database...
copy "%backup_file%" data\pharmacy.db

if errorlevel 1 (
    echo ERROR: Failed to restore database
    pause
    exit /b 1
)

echo.
echo Starting containers...
docker-compose up -d

echo.
echo ========================================
echo Restore Successful!
echo ========================================
echo.
pause
