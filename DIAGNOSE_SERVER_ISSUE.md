# 🔍 SERVER UPLOAD ISSUE DIAGNOSIS

## THE PROBLEM

You upload: `index-CGT38ikO.js`  
Server shows: `index-BDNO4ydo.js`

**This means something on your server is changing/overwriting the files!**

---

## POSSIBLE CAUSES & SOLUTIONS

### 1. ⚠️ CDN/Caching Layer (MOST LIKELY)

Your hosting provider might have a CDN or caching enabled.

**Check:**
- Cloudflare enabled?
- Server caching (Varnish, Redis)?
- Browser caching?

**Solution:**
```bash
# After uploading, clear ALL caches:
1. Cloudflare: Purge Everything
2. cPanel: Clear Cache (if available)
3. Browser: Hard refresh (Ctrl+F5)
4. Add cache-busting: https://chefsghana.com/?v=123456
```

---

### 2. ⚠️ Git Auto-Deployment

Do you have GitHub/GitLab connected to your server?

**Check in cPanel:**
- Look for "Git Version Control"
- Check for deployment hooks
- Check `.git` folder in your web root

**If YES:**
Your server is auto-pulling from git, overwriting your uploads!

**Solution:**
Instead of uploading to server, push to your git repo:
```bash
cd C:\Users\Pieter\Downloads\chefs
git add dist/
git commit -m "Update dist with correct build"
git push origin main
# Server will auto-deploy the correct files
```

---

### 3. ⚠️ Wrong Upload Directory

You might be uploading to a staging/backup directory.

**Check:**
- Are you uploading to the ACTUAL web root?
- Common paths:
  - `/public_html/`
  - `/public_html/chefsghana.com/`
  - `/www/`
  - `/htdocs/`

**Verify:**
After uploading, SSH into server and check:
```bash
ssh user@chefsghana.com
cd public_html  # or your web root
ls -la dist/assets/
# Should show: index-CGT38ikO.js
```

---

### 4. ⚠️ Server-Side Build Process

Some servers run `npm build` automatically after detecting changes.

**Check:**
- Do you have a `.cpanel.yml` file?
- Any PM2/deploy scripts?
- Webhooks configured?

**If YES:**
Your server is rebuilding from source code with old `.env` values!

**Solution:**
Update `.env` on the SERVER (not just locally):
```bash
# SSH into server
cd /path/to/app
nano .env

# Update these lines:
VITE_PAYSTACK_PUBLIC_KEY=pk_live_0e1e3adc4fc35662eb13e2f73d9cf9c770535143
VITE_API_BASE_URL=https://chefsghana.com

# Save and rebuild:
npm run build
```

---

### 5. ⚠️ Multiple dist Folders

You might have multiple dist folders and uploading to the wrong one.

**Check:**
```bash
# SSH into server
find /home -name "dist" -type d
# This shows ALL dist folders
```

---

## 🔧 DIAGNOSTIC STEPS

### Step 1: Check Server Files
After uploading, SSH into your server:
```bash
ssh user@chefsghana.com
cd public_html  # or wherever your site is
cat dist/index.html | grep "index-"
# Should show: index-CGT38ikO.js

ls -la dist/assets/
# Should show: index-CGT38ikO.js, NOT index-BDNO4ydo.js
```

**If it shows the WRONG file:**
→ Files are being overwritten by something on the server

**If it shows the CORRECT file:**
→ It's a caching issue

---

### Step 2: Check for Git Repository
```bash
ls -la | grep .git
# If you see .git folder, auto-deployment is likely enabled
```

---

### Step 3: Check for Build Scripts
```bash
# Check for these files:
cat .cpanel.yml
cat package.json | grep scripts
ls -la .github/workflows/
```

---

### Step 4: Bypass Cache
Try accessing with cache-busting:
```
https://chefsghana.com/?nocache=123456789
```

Or check the file directly:
```
https://chefsghana.com/dist/index.html?v=999
```

---

## 🎯 QUICK FIXES TO TRY

### Option 1: Direct File Upload (Bypass Everything)
Instead of uploading the whole dist folder:

1. Upload ONLY `index.html` first
2. Check if it changes
3. If not, upload the assets folder
4. Check again

### Option 2: Clear ALL Caches
In cPanel:
1. **Cloudflare** (if enabled): Purge Cache
2. **Optimize Website**: Disable caching temporarily
3. **File Manager**: Delete `.htaccess` (backup first!)
4. **Browser**: Incognito mode + Hard refresh

### Option 3: Upload with Timestamp
Rename the file before uploading to force new version:
```bash
# On your computer, rename:
index-CGT38ikO.js → index-CGT38ikO-v2.js

# Update index.html to reference:
<script src="/assets/index-CGT38ikO-v2.js"></script>

# Upload both files
```

### Option 4: Use Direct Server Build
Upload the SOURCE CODE instead of dist:
```bash
# Upload entire chefs/ folder to server
# SSH into server
cd /path/to/chefs
npm install
VITE_PAYSTACK_PUBLIC_KEY=pk_live_0e1e3adc4fc35662eb13e2f73d9cf9c770535143 npm run build
# This builds directly on the server
```

---

## 🚨 URGENT CHECKS

### Check 1: View the ACTUAL file on server
Visit: `https://chefsghana.com/dist/assets/index-CGT38ikO.js`

**If you get 404:**
→ File was never uploaded or was deleted

**If you get the file:**
→ But site still loads `index-BDNO4ydo.js`
→ Then it's definitely a caching issue

### Check 2: Check .htaccess
Your `.htaccess` might have rewrite rules:
```bash
cat .htaccess
# Look for RewriteRule or redirect rules
```

---

## 📞 NEED TO CONTACT YOUR HOST?

Ask them:

1. "Is there a CDN or caching layer on my account?"
2. "Is auto-deployment from Git enabled?"
3. "Why are my uploaded files being changed/overwritten?"
4. "How do I clear all server-side caches?"
5. "Where is my actual web root directory?"

---

## ✅ TEMPORARY WORKAROUND

While diagnosing, you can bypass the dist folder entirely:

1. Upload to a NEW folder: `dist-new/`
2. Update your domain to point to `dist-new/` instead of `dist/`
3. Or create a subdomain: `new.chefsghana.com` → `dist-new/`

This ensures nothing overwrites your files.

---

## 🎯 MOST LIKELY SOLUTION

Based on your description, it's either:

1. **Git auto-deployment** - Push to git instead of uploading
2. **Cloudflare/CDN cache** - Purge cache after upload
3. **Server caching** - Disable caching in cPanel

Try these IN ORDER until one works!
