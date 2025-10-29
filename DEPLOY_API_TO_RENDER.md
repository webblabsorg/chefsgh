# Deploy API to Render.com (DirectAdmin Has No Node.js)

## The Solution

Since your DirectAdmin hosting doesn't have Node.js:
- **Frontend (dist/)** stays on DirectAdmin → https://chefsghana.com
- **Backend (api/)** moves to Render.com → https://chefs-api.onrender.com

This is actually a **better setup** - separates concerns and uses each platform's strengths!

---

## Step 1: Prepare Your API for Render.com

### 1.1. Create a GitHub Repository (Easiest Method)

**Option A: Using GitHub Desktop (Recommended for Non-Developers)**

1. Download and install [GitHub Desktop](https://desktop.github.com/)
2. Create a new repository:
   - Click "Create New Repository"
   - Name: `chefs-api`
   - Local Path: Choose a folder
   - Click "Create Repository"
3. Copy your `api/` folder contents into this repository
4. Also copy these files to the root:
   - `package.json`
   - `.env.example` (NOT .env - never commit .env!)
   - `ecosystem.config.cjs`
5. In GitHub Desktop:
   - Add commit message: "Initial commit"
   - Click "Commit to main"
   - Click "Publish repository"
   - Make it **Private** (important!)
   - Click "Publish Repository"

**Option B: Manual Upload (If You Don't Want to Use Git)**

Skip to Step 1.2 for manual upload method.

### 1.2. Create `render.yaml` Configuration

Create this file in your `api/` folder:

**File:** `api/render.yaml`

```yaml
services:
  - type: web
    name: chefs-api
    env: node
    region: oregon
    plan: free
    buildCommand: cd .. && npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: API_PORT
        value: 10000
      - key: CLIENT_ORIGIN
        value: https://chefsghana.com
      - key: MYSQL_HOST
        sync: false
      - key: MYSQL_DATABASE
        sync: false
      - key: MYSQL_USER
        sync: false
      - key: MYSQL_PASSWORD
        sync: false
      - key: EMAIL_HOST
        sync: false
      - key: EMAIL_PORT
        value: 587
      - key: EMAIL_USER
        sync: false
      - key: EMAIL_PASSWORD
        sync: false
      - key: EMAIL_FROM
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: ADMIN_SEED_EMAIL
        sync: false
      - key: ADMIN_SEED_PASSWORD
        sync: false
```

---

## Step 2: Deploy to Render.com

### 2.1. Create Render Account

1. Go to https://render.com
2. Click "Get Started"
3. Sign up with GitHub (recommended) or email
4. Verify your email

### 2.2. Create New Web Service

1. Click "**New +**" → "**Web Service**"

2. **Connect Repository:**
   - If using GitHub: Click "Connect GitHub" → Select `chefs-api` repository
   - If manual upload: Click "**Public Git repository**" → Paste URL or use manual deploy

3. **Configure Service:**
   - **Name:** `chefs-api`
   - **Region:** Oregon (Free) or closest to Ghana
   - **Branch:** `main`
   - **Root Directory:** Leave blank (or `./` if it doesn't work)
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

4. **Select Plan:**
   - Choose "**Free**" (spins down after inactivity, but fine for testing)
   - Or "**Starter**" ($7/month - stays always on, better for production)

5. Click "**Advanced**" → Add Environment Variables

---

## Step 3: Add Environment Variables

Click "**Add Environment Variable**" for each of these:

```
NODE_ENV = production
API_PORT = 10000
CLIENT_ORIGIN = https://chefsghana.com

MYSQL_HOST = [Your DirectAdmin MySQL host - usually localhost or IP]
MYSQL_DATABASE = chefs_db
MYSQL_USER = [Your database username from DirectAdmin]
MYSQL_PASSWORD = [Your database password]

EMAIL_HOST = mail.chefsghana.com
EMAIL_PORT = 587
EMAIL_USER = info@chefsghana.com
EMAIL_PASSWORD = [Your email password]
EMAIL_FROM = info@chefsghana.com

JWT_SECRET = [Generate strong random string - min 32 chars]
ADMIN_SEED_EMAIL = admin@chefsghana.com
ADMIN_SEED_PASSWORD = chefsgh8195

VITE_PAYSTACK_PUBLIC_KEY = pk_live_YOUR_PUBLIC_KEY_HERE
PAYSTACK_SECRET_KEY = [Your Paystack secret key]
```

**IMPORTANT:** For MYSQL_HOST, you need to allow remote connections from Render.com to your DirectAdmin MySQL database. See Step 4.

---

## Step 4: Allow Remote Database Access

Your DirectAdmin MySQL needs to accept connections from Render.com.

### 4.1. Get Render IP Address

After deployment, Render will show you the outbound IP addresses. Note them down.

### 4.2. Add Remote Database User in DirectAdmin

1. Log in to **DirectAdmin**
2. Go to **MySQL Management**
3. Click on your database `chefs_db`
4. Click "**Modify User Privileges**"
5. Add access from Render IP:
   - Or create new user: `chefs_remote`
   - Host: `%` (allows from anywhere - easier but less secure)
   - Or Host: `[Render IP]` (more secure)
   - Grant ALL privileges
   - Click Save

**Alternative (More Secure):** Ask your hosting provider to whitelist Render's IP addresses.

### 4.3. Update MYSQL_HOST

In Render.com environment variables, update:
```
MYSQL_HOST = [Your server's public IP or domain]
```

NOT `localhost` - Render can't access DirectAdmin's localhost!

---

## Step 5: Deploy

1. Click "**Create Web Service**"
2. Render will start deploying
3. Watch the logs - it will:
   - Install dependencies (`npm install`)
   - Start server (`npm start`)
4. Wait 3-5 minutes for first deployment

### 5.1. Check Deployment Status

Once deployed, you'll see:
- ✅ **Live** badge
- A URL like: `https://chefs-api.onrender.com`

### 5.2. Test API

Visit: **https://chefs-api.onrender.com/api/health**

Should return: `{"status":"ok"}`

If you see errors in logs, check:
- Database connection (MYSQL_HOST might need to be your public IP)
- Environment variables are all set
- JWT_SECRET is set

---

## Step 6: Update Frontend to Use New API

Now update your frontend on DirectAdmin to use the new API URL.

### 6.1. Update Environment Variables

On your local machine, edit `.env`:

```env
# Change this:
VITE_API_BASE_URL=https://chefsghana.com

# To this:
VITE_API_BASE_URL=https://chefs-api.onrender.com
```

### 6.2. Rebuild Frontend

```bash
npm run build
```

This creates a new `dist/` folder with the updated API URL.

### 6.3. Upload New dist/ to DirectAdmin

1. Log in to DirectAdmin
2. Go to **File Manager**
3. Navigate to `public_html`
4. **Delete old files** (or backup first)
5. **Upload new `dist/` contents**

---

## Step 7: Update CORS Settings on Render

Your API needs to allow requests from your DirectAdmin domain.

This is already set in your environment variables:
```
CLIENT_ORIGIN = https://chefsghana.com
```

If you have multiple domains, set:
```
CLIENT_ORIGIN = https://chefsghana.com,https://www.chefsghana.com
```

---

## Step 8: Test Everything

### 8.1. Test API
```
https://chefs-api.onrender.com/api/health
→ Should return: {"status":"ok"}
```

### 8.2. Test Frontend
```
https://chefsghana.com
→ Registration form should load
```

### 8.3. Test Admin Login
```
https://chefsghana.com/admin
→ Login page should load
→ Login with: admin@chefsghana.com / chefsgh8195
```

### 8.4. Check Browser Console
- Press F12
- Go to Console tab
- Should see NO CORS errors
- API calls should go to `chefs-api.onrender.com`

---

## Troubleshooting

### Error: "Cannot connect to database"

**Cause:** Render can't reach your DirectAdmin MySQL

**Solutions:**

**Option 1: Use External Database (RECOMMENDED)**
- Create free MySQL database at:
  - [PlanetScale](https://planetscale.com) (Free tier)
  - [Railway](https://railway.app) (Free tier)
  - [Render.com](https://render.com) (PostgreSQL free)

**Option 2: Allow Remote Access**
- In DirectAdmin, allow remote access to MySQL
- Update MYSQL_HOST to your server's public IP
- Ensure port 3306 is open (ask hosting provider)

**Option 3: Keep Using DirectAdmin MySQL**
- Ask your hosting provider: "Can you allow remote MySQL access from Render.com IPs?"
- Provide Render's outbound IP addresses

---

### Error: "CORS policy: No 'Access-Control-Allow-Origin'"

**Cause:** CLIENT_ORIGIN mismatch

**Fix:** Ensure in Render environment variables:
```
CLIENT_ORIGIN = https://chefsghana.com
```

Restart the service after updating.

---

### Error: Free tier spins down (slow on first request)

**Cause:** Render free tier stops after 15 min inactivity

**Solutions:**
- Upgrade to Starter plan ($7/month) - stays always on
- Use a ping service to keep it awake:
  - [Uptime Robot](https://uptimerobot.com) - ping every 5 min
  - [Cron-job.org](https://cron-job.org) - scheduled pings

---

### Error: "Login failed: Network error"

**Cause:** API not reachable from frontend

**Check:**
1. API is deployed and shows "Live" on Render
2. `https://chefs-api.onrender.com/api/health` works
3. Frontend built with correct VITE_API_BASE_URL
4. No CORS errors in browser console (F12)

---

## Database Options (Since Remote MySQL May Not Work)

If you can't connect to DirectAdmin MySQL remotely, migrate database to external service:

### Option A: PlanetScale (MySQL - FREE)

1. Sign up at https://planetscale.com
2. Create database
3. Get connection string
4. Update Render environment variables:
   ```
   MYSQL_HOST = [from PlanetScale]
   MYSQL_DATABASE = [from PlanetScale]
   MYSQL_USER = [from PlanetScale]
   MYSQL_PASSWORD = [from PlanetScale]
   ```
5. Import your data:
   - Export from DirectAdmin phpMyAdmin
   - Import to PlanetScale

### Option B: Render PostgreSQL (FREE)

1. In Render dashboard, click "New +" → "PostgreSQL"
2. Create database
3. Get connection string
4. **Update your code** to use PostgreSQL instead of MySQL
5. Update environment variables

---

## Costs

### Free Option (Recommended for Testing)
- **Render Web Service:** FREE (spins down after inactivity)
- **PlanetScale Database:** FREE (5GB storage, 1 billion row reads/month)
- **DirectAdmin:** Your existing hosting
- **Total:** $0/month

### Production Option (Recommended for Live Site)
- **Render Web Service:** $7/month (Starter - always on)
- **PlanetScale Database:** FREE tier sufficient
- **DirectAdmin:** Your existing hosting
- **Total:** $7/month

---

## Advantages of This Setup

✅ **Frontend on DirectAdmin:** Fast static file serving  
✅ **Backend on Render:** Proper Node.js support  
✅ **Separate scaling:** Can upgrade each independently  
✅ **Better security:** API and frontend isolated  
✅ **Easy updates:** Push to GitHub → auto-deploys  
✅ **Free tier available:** Test before paying  

---

## Final Architecture

```
┌─────────────────────────────────────────┐
│  DirectAdmin (chefsghana.com)           │
│  - Serves frontend (HTML/CSS/JS)        │
│  - Registration form                    │
│  - Admin panel UI                       │
└─────────────────────────────────────────┘
              ↓ API Calls
┌─────────────────────────────────────────┐
│  Render.com (chefs-api.onrender.com)    │
│  - Node.js API server                   │
│  - Authentication                       │
│  - Admin operations                     │
│  - Email sending                        │
└─────────────────────────────────────────┘
              ↓ Database Queries
┌─────────────────────────────────────────┐
│  Database (Choose One)                  │
│  Option A: DirectAdmin MySQL (if remote │
│            access allowed)              │
│  Option B: PlanetScale MySQL (free)     │
│  Option C: Render PostgreSQL (free)     │
└─────────────────────────────────────────┘
```

---

## Next Steps

1. ✅ Sign up for Render.com
2. ✅ Push code to GitHub (or use manual upload)
3. ✅ Create Web Service on Render
4. ✅ Add environment variables
5. ✅ Deploy and test API: `https://your-app.onrender.com/api/health`
6. ✅ Update frontend .env with new API URL
7. ✅ Rebuild frontend: `npm run build`
8. ✅ Upload new dist/ to DirectAdmin
9. ✅ Test admin login at https://chefsghana.com/admin

---

**This is the BEST solution for your situation. Render.com is designed for Node.js apps and makes deployment much easier than trying to get DirectAdmin to support Node.js.**

Let me know when you're ready to start and I can help with any step!
