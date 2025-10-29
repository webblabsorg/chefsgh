#!/bin/bash

# Ghana Chef Association - Deployment Check Script
# Run this on your server to diagnose deployment issues

echo "========================================="
echo "Ghana Chef Association - Deployment Check"
echo "========================================="
echo ""

# Check Node.js
echo "1. Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "   ✓ Node.js installed: $NODE_VERSION"
    if [[ ${NODE_VERSION:1:2} -ge 18 ]]; then
        echo "   ✓ Version is 18 or higher"
    else
        echo "   ✗ Warning: Node.js 18+ recommended"
    fi
else
    echo "   ✗ Node.js not found"
    echo "   → Install Node.js 18+ to run the API server"
fi
echo ""

# Check NPM
echo "2. Checking NPM..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "   ✓ NPM installed: $NPM_VERSION"
else
    echo "   ✗ NPM not found"
fi
echo ""

# Check if we're in the project directory
echo "3. Checking project structure..."
if [ -d "api/server" ]; then
    echo "   ✓ api/server directory found"
else
    echo "   ✗ api/server directory not found"
    echo "   → Make sure you're in the project root directory"
fi

if [ -f "api/server/index.js" ]; then
    echo "   ✓ api/server/index.js found"
else
    echo "   ✗ api/server/index.js not found"
fi

if [ -f "package.json" ]; then
    echo "   ✓ package.json found"
else
    echo "   ✗ package.json not found"
fi

if [ -d "dist" ]; then
    echo "   ✓ dist directory found (frontend built)"
else
    echo "   ✗ dist directory not found"
    echo "   → Run 'npm run build' to build the frontend"
fi
echo ""

# Check .env file
echo "4. Checking environment configuration..."
if [ -f ".env" ]; then
    echo "   ✓ .env file found"
    
    # Check critical variables
    if grep -q "MYSQL_DATABASE" .env; then
        echo "   ✓ MYSQL_DATABASE configured"
    else
        echo "   ✗ MYSQL_DATABASE not set in .env"
    fi
    
    if grep -q "JWT_SECRET" .env; then
        echo "   ✓ JWT_SECRET configured"
    else
        echo "   ✗ JWT_SECRET not set in .env"
    fi
    
    if grep -q "ADMIN_SEED_EMAIL" .env; then
        ADMIN_EMAIL=$(grep "ADMIN_SEED_EMAIL" .env | cut -d '=' -f2)
        echo "   ✓ ADMIN_SEED_EMAIL: $ADMIN_EMAIL"
    else
        echo "   ✗ ADMIN_SEED_EMAIL not set in .env"
    fi
    
    if grep -q "NODE_ENV" .env; then
        NODE_ENV=$(grep "NODE_ENV" .env | cut -d '=' -f2)
        echo "   ✓ NODE_ENV: $NODE_ENV"
    else
        echo "   ⚠ NODE_ENV not set (will default to development)"
    fi
else
    echo "   ✗ .env file not found"
    echo "   → Copy .env.example to .env and fill in values"
fi
echo ""

# Check node_modules
echo "5. Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "   ✓ node_modules directory found"
    
    # Check critical packages
    if [ -d "node_modules/express" ]; then
        echo "   ✓ express installed"
    else
        echo "   ✗ express not found"
    fi
    
    if [ -d "node_modules/mysql2" ]; then
        echo "   ✓ mysql2 installed"
    else
        echo "   ✗ mysql2 not found"
    fi
    
    if [ -d "node_modules/bcryptjs" ]; then
        echo "   ✓ bcryptjs installed"
    else
        echo "   ✗ bcryptjs not found"
    fi
else
    echo "   ✗ node_modules not found"
    echo "   → Run 'npm install' to install dependencies"
fi
echo ""

# Check if server is running
echo "6. Checking if API server is running..."
if command -v curl &> /dev/null; then
    if curl -s http://localhost:4000/api/health > /dev/null 2>&1; then
        echo "   ✓ API server is running on port 4000"
        HEALTH_RESPONSE=$(curl -s http://localhost:4000/api/health)
        echo "   Response: $HEALTH_RESPONSE"
    else
        echo "   ✗ API server not responding on port 4000"
        echo "   → Start server with: npm start"
    fi
else
    echo "   ⚠ curl not available, can't test server"
fi
echo ""

# Check PM2 if installed
echo "7. Checking PM2 process manager..."
if command -v pm2 &> /dev/null; then
    echo "   ✓ PM2 installed"
    PM2_STATUS=$(pm2 list | grep "chefs-api" || echo "not running")
    echo "   Status: $PM2_STATUS"
else
    echo "   ⚠ PM2 not installed (optional but recommended)"
    echo "   → Install with: npm install -g pm2"
fi
echo ""

# Check MySQL connection (basic)
echo "8. Checking MySQL..."
if command -v mysql &> /dev/null; then
    echo "   ✓ MySQL client installed"
    echo "   → Test connection manually in phpMyAdmin"
else
    echo "   ⚠ MySQL client not found in PATH"
    echo "   → Use phpMyAdmin to verify database"
fi
echo ""

# Check Apache/web server
echo "9. Checking web server..."
if [ -f ".htaccess" ]; then
    echo "   ✓ .htaccess file found"
else
    echo "   ✗ .htaccess not found"
    echo "   → Create .htaccess with SPA rewrite rules"
fi

if [ -f "public_html/index.html" ] || [ -f "index.html" ]; then
    echo "   ✓ index.html found"
else
    echo "   ✗ index.html not found"
    echo "   → Make sure dist/ contents are in public_html/"
fi
echo ""

# Summary
echo "========================================="
echo "SUMMARY"
echo "========================================="
echo ""

# Count issues
ISSUES=0

if ! command -v node &> /dev/null; then
    echo "❌ CRITICAL: Node.js not installed"
    ((ISSUES++))
fi

if [ ! -f ".env" ]; then
    echo "❌ CRITICAL: .env file missing"
    ((ISSUES++))
fi

if [ ! -d "node_modules" ]; then
    echo "❌ CRITICAL: Dependencies not installed"
    ((ISSUES++))
fi

if ! curl -s http://localhost:4000/api/health > /dev/null 2>&1; then
    echo "❌ CRITICAL: API server not running"
    ((ISSUES++))
fi

if [ ! -d "dist" ]; then
    echo "⚠️  WARNING: Frontend not built"
fi

if [ $ISSUES -eq 0 ]; then
    echo "✅ All critical checks passed!"
    echo ""
    echo "Next steps:"
    echo "1. Visit https://chefsghana.com/api/health"
    echo "2. Visit https://chefsghana.com/admin"
    echo "3. Login with credentials from .env"
else
    echo ""
    echo "❌ Found $ISSUES critical issue(s)"
    echo ""
    echo "Quick fixes:"
    echo "1. Install dependencies: npm install"
    echo "2. Create .env file: cp .env.example .env"
    echo "3. Start server: npm start"
    echo "   OR with PM2: npm run pm2:start"
fi

echo ""
echo "========================================="
echo "For detailed troubleshooting, see:"
echo "  - DIRECTADMIN_NODE_SETUP.md"
echo "  - DEPLOYMENT_CHECKLIST.md"
echo "========================================="
