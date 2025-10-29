@echo off
echo ========================================
echo Pushing Ghana Chefs Project to GitHub
echo ========================================
echo.

cd /d "%~dp0"

echo Step 1: Committing all files...
git commit -m "Initial commit: Ghana Chef Association system - Fixed webhook.js for Vercel deployment - Complete admin dashboard - Multi-step registration with Paystack"
if errorlevel 1 (
    echo ERROR: Commit failed!
    pause
    exit /b 1
)
echo ✓ Commit successful!
echo.

echo Step 2: Adding remote repository...
git remote add origin https://github.com/webblabsorg/chefsgh.git
echo ✓ Remote added!
echo.

echo Step 3: Pushing to GitHub...
git push -u origin main
if errorlevel 1 (
    echo ERROR: Push failed!
    echo If remote already exists, try: git remote set-url origin https://github.com/webblabsorg/chefsgh.git
    pause
    exit /b 1
)
echo.
echo ========================================
echo ✓ SUCCESS! Project pushed to GitHub
echo ========================================
echo.
echo Next steps:
echo 1. Go to your Vercel project
echo 2. Connect it to: https://github.com/webblabsorg/chefsgh
echo 3. Add environment variables (see VERCEL_DEPLOYMENT.md)
echo 4. Deploy!
echo.
pause
