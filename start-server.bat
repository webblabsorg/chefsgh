@echo off
REM Ghana Chef Association - Start API Server (Windows)

echo ========================================
echo Ghana Chef Association - Starting API Server
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from: https://nodejs.org
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    echo.
)

REM Check if .env exists
if not exist ".env" (
    echo WARNING: .env file not found!
    echo Please copy .env.example to .env and fill in your values.
    echo.
    pause
)

REM Check if dist folder exists
if not exist "dist\" (
    echo WARNING: dist folder not found!
    echo Building frontend...
    call npm run build
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Build failed
        pause
        exit /b 1
    )
    echo.
)

REM Start the server
echo Starting API server...
echo Server will run on http://localhost:4000
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

call npm start
