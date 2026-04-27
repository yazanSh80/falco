@echo off
REM MySQL Setup and Migration Script for Falco Electrec
REM This script helps set up MySQL database and create backups

echo.
echo ====================================
echo Falco Electrec MySQL Setup
echo ====================================
echo.

REM Check if MySQL is installed
mysql --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: MySQL is not installed or not in PATH
    echo Please install MySQL or add it to your system PATH
    pause
    exit /b 1
)

echo [1/3] Creating MySQL Database...
echo.

REM Create the database
mysql -u root -pYy@102030 < setup_mysql.sql
if errorlevel 1 (
    echo ERROR: Failed to create database
    echo Make sure MySQL is running and credentials are correct
    pause
    exit /b 1
)

echo.
echo [2/3] Backup Information
echo ========================
echo Previous database backups should be stored in the /backups directory
echo To export current database manually, use:
echo   mysqldump -u root -pYy@102030 Graduation > backups/graduation_backup_^%date:~-4,4^^%^%date:~-10,2^^%^%date:~-7,2^%.sql
echo.

echo [3/3] Next Steps
echo ================
echo 1. Make sure MySQL server is running
echo 2. Run from backend directory: python run.py
echo 3. The Flask app will create all tables automatically on first run
echo.

echo Setup complete! Press any key to continue...
pause
