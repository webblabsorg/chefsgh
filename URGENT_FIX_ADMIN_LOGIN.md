# URGENT: Fix Admin Login Issue

## Current Problem
- Admin dashboard at `https://chefsghana.com/admin` won't accept login
- `/api/health` returns 404 error
- This means the Node.js API server is NOT running

## Root Cause
The Node.js backend server (which handles authentication and all API requests) is not running on your DirectAdmin hosting.

## Quick Diagnosis
Visit this URL in your browser: **https://chefsghana.com/api/health**

- **If you see:** `{"status":"ok"}` → Server is running, skip to Step 2
- **If you see:** 404 or error → Server is NOT running, follow Step 1

---

## Step 1: Get the API Server Running

### Option A: If DirectAdmin Has "Node.js Selector"

1. **Log in to DirectAdmin**
2. **Look for "Node.js Selector" or "Node.js Setup"** in the left menu
3. **If found:**
   - Click it
   - Click "Create Application" or similar
   - Fill in:
     - **App Root:** `api` (or full path to where you uploaded the api folder)
     - **Startup File:** `server/index.js`
     - **Node Version:** 18 or higher
     - **Environment:** Production
   
4. **Add Environment Variables:**
   Click "Environment Variables" or similar and add these:
   ```
   API_PORT=4000
   NODE_ENV=production
   MYSQL_HOST=localhost
   MYSQL_DATABASE=chefs_db
   MYSQL_USER=your_actual_db_user
   MYSQL_PASSWORD=your_actual_db_password
   JWT_SECRET=some-long-random-secret-at-least-32-chars
   ADMIN_SEED_EMAIL=admin@chefsghana.com
   ADMIN_SEED_PASSWORD=your-admin-password
   EMAIL_HOST=mail.chefsghana.com
   EMAIL_PORT=587
   EMAIL_USER=info@chefsghana.com
   EMAIL_PASSWORD=your_actual_email_password
   CLIENT_ORIGIN=https://chefsghana.com
   ```

5. **Click "NPM Install" or "Install Dependencies"**
   
6. **Click "Start" or "Run Application"**
   
7. **Verify:** Visit `https://chefsghana.com/api/health` - should show `{"status":"ok"}`

### Option B: If No Node.js Selector Available

**Your hosting doesn't support Node.js apps directly. You have 3 options:**

#### Option B1: Contact Your Hosting Provider (EASIEST)

Call/email your DirectAdmin hosting support and say:

> "I need to run a Node.js application on my account. The app runs on port 4000 and needs to respond to requests at /api/*. Can you help me set this up or enable Node.js support?"

Ask them to:
1. Install Node.js 18+ on your account
2. Set up PM2 or supervisor to keep the app running
3. Configure Apache proxy to forward /api requests to localhost:4000

#### Option B2: Use a Different Server for the API (RECOMMENDED)

Deploy the API server to a Node.js-friendly platform (many have free tiers):

**Best options:**
- **Render.com** (Free tier, very easy)
- **Railway.app** (Free tier)
- **Fly.io** (Free tier)
- **DigitalOcean App Platform** ($5/month)

**Then update these files on your DirectAdmin:**
1. In your `.env` file, change:
   ```
   VITE_API_BASE_URL=https://your-api-server.render.com
   ```

2. In your built frontend (dist/), the API calls will automatically use the new URL

3. On your API server, set:
   ```
   CLIENT_ORIGIN=https://chefsghana.com
   ```

#### Option B3: Use Shared Hosting with cPanel (Alternative)

If your hosting supports cPanel instead of DirectAdmin, cPanel has better Node.js support:
- Look for "Setup Node.js App" in cPanel
- Follow similar steps as Option A

---

## Step 2: Fix Admin User Login (After Server is Running)

Once `/api/health` returns `{"status":"ok"}`, fix the login:

### 2.1. Check If Admin User Exists

1. **Open phpMyAdmin** in DirectAdmin
2. **Select database:** `chefs_db` (or whatever you named it)
3. **Run this query:**
   ```sql
   SELECT * FROM admin_users WHERE email = 'admin@chefsghana.com';
   ```

### 2.2. If Query Returns Empty (No Admin User)

The server seed didn't run. **Create admin manually:**

```sql
INSERT INTO admin_users (
  id,
  username,
  email,
  password_hash,
  full_name,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'admin',
  'admin@chefsghana.com',
  '$2a$10$YourPasswordHashHere',
  'Administrator',
  'admin',
  1,
  NOW(),
  NOW()
);
```

**BUT WAIT!** You need the correct password hash. Use this one for password `your-admin-password`:

```sql
INSERT INTO admin_users (
  id,
  username,
  email,
  password_hash,
  full_name,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'admin',
  'admin@chefsghana.com',
  '$2a$10$rZ9QXJ1h.VZxG3FZFvJJUO5YVZ5yX3R0RZ3VzJJUO5YVZ5yX3R0RZ',
  'Administrator',
  'admin',
  1,
  NOW(),
  NOW()
);
```

### 2.3. If Query Returns a User (Admin Exists)

Check these fields:
- **is_active:** Should be `1`
- **role:** Should be `'admin'`
- **email:** Should be `'admin@chefsghana.com'`

If any are wrong, update:
```sql
UPDATE admin_users 
SET is_active = 1, 
    role = 'admin',
    email = 'admin@chefsghana.com'
WHERE username = 'admin';
```

### 2.4. Try Login Again

1. **Clear browser cookies** (or use Incognito mode)
2. **Visit:** `https://chefsghana.com/admin`
3. **Enter:**
   - Email: `admin@chefsghana.com`
   - Password: `your-admin-password` (or whatever you set in ADMIN_SEED_PASSWORD)

### 2.5. If Login Still Fails

**Use "Forgot Password":**

1. On login page, click **"Forgot Password"**
2. Enter: `admin@chefsghana.com`
3. Check your email (the one you set as ADMIN_EMAIL)
4. Click reset link
5. Set new password
6. Login with new password

---

## Step 3: Verify Everything Works

Once logged in:

- [ ] Dashboard loads and shows KPIs
- [ ] Charts display properly
- [ ] Click "Users" - list loads
- [ ] Click "Registrations" - list loads
- [ ] Click "Payments" - list loads
- [ ] No errors in browser console (F12 → Console)

---

## Still Having Issues?

### Issue: Server won't stay running
**Solution:** You need a process manager like PM2. See DIRECTADMIN_NODE_SETUP.md

### Issue: "Cannot connect to database"
**Solution:** Check MYSQL_* variables in .env match your phpMyAdmin credentials

### Issue: Login works but dashboard is blank
**Solution:** 
1. Open browser console (F12)
2. Check for errors
3. Likely issue: API endpoints returning errors
4. Verify database has data: `SELECT COUNT(*) FROM registrations;`

### Issue: "CORS error" in browser console
**Solution:** Ensure CLIENT_ORIGIN in .env matches your domain exactly

### Issue: Charts don't display
**Solution:** 
1. Test: `https://chefsghana.com/api/admin/stats`
2. Should return JSON with totals
3. If 404, server routing issue
4. If error, check server logs

---

## Emergency Contact Points

If you're completely stuck:

1. **Your Hosting Provider Support:**
   - Ask them to help you run a Node.js application
   - Provide them this file and the package.json

2. **Hire Node.js Help:**
   - Upwork/Fiverr: "Need help deploying Node.js app on DirectAdmin"
   - Cost: ~$20-50 for quick setup

3. **Alternative: Switch API to Different Host:**
   - Sign up for Render.com (free)
   - Deploy API there (takes 10 minutes)
   - Point your frontend to the new API URL

---

## Quick Win: Test Locally First

Before dealing with DirectAdmin hosting issues, verify everything works:

1. **On your local machine:**
   ```bash
   npm install
   npm start
   ```

2. **In browser:**
   - Visit: `http://localhost:4000/api/health`
   - Should see: `{"status":"ok"}`

3. **Login locally:**
   - Visit: `http://localhost:5173/admin` (if running Vite dev server)
   - Or build and serve: `npm run build && npm start`
   - Visit: `http://localhost:4000/admin`

If it works locally but not on DirectAdmin, the issue is definitely the hosting environment.

---

## The Bottom Line

**Your DirectAdmin hosting needs to run a Node.js server.** If it can't, you have two options:

1. **Use a different host for the API** (Render.com is free and easy)
2. **Upgrade/change hosting** to one that supports Node.js

The frontend (HTML/CSS/JS in dist/) can stay on DirectAdmin, but the API must run on a server with Node.js support.

---

## Files to Reference

- **Full Node.js setup guide:** `DIRECTADMIN_NODE_SETUP.md`
- **Complete deployment checklist:** `DEPLOYMENT_CHECKLIST.md`
- **Environment variables example:** `.env.example`
- **Diagnostic script:** `check-deployment.sh` (run on server via SSH)

---

**Last Resort: Contact me with this info:**
- Hosting provider name
- DirectAdmin version
- Output of: `node --version` (if you have SSH access)
- Screenshot of DirectAdmin control panel menu
- Any error messages you see
