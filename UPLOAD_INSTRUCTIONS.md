# Upload Instructions - CRITICAL

## ⚠️ THE ERROR PERSISTS BECAUSE YOU HAVEN'T UPLOADED THE NEW FILES YET ⚠️

Your **local** build has the correct key, but your **server** at https://chefsghana.com is still serving old files.

---

## Files to Upload

### 1. Upload the entire `dist/` folder
**Location:** `C:\Users\Pieter\Downloads\chefs\dist\`

**Upload to your web server:**
- The `dist/` folder should replace the existing one on your server
- Make sure these files are uploaded:
  - `dist/index.html` (contains the meta tag with live key)
  - `dist/assets/index-DkeF7Izz.js` (contains embedded live key)
  - `dist/assets/index-n2KG4E_m.css` (stylesheets)

**Via FTP/SFTP:**
1. Connect to your server
2. Navigate to your web root (usually `public_html/` or `www/`)
3. **Delete the old dist/ folder completely**
4. Upload the new `dist/` folder from your computer

**Via cPanel File Manager:**
1. Log into cPanel
2. Go to File Manager
3. Navigate to your web root
4. Select and delete the old `dist/` folder
5. Upload the new `dist/` folder (use the Upload button)
6. Extract if it was uploaded as a zip

---

### 2. Upload Backend Files (if not already done)
**New/Updated files:**
- `api/server/routes/webhook.js` (NEW)
- `api/server/index.js` (UPDATED)
- All other backend files

---

### 3. Update Environment Variables on Server
**Location on your computer:** `C:\Users\Pieter\Downloads\env`

**Copy these settings to your server's `.env` file:**
```env
VITE_PAYSTACK_PUBLIC_KEY=pk_live_0e1e3adc4fc35662eb13e2f73d9cf9c770535143
PAYSTACK_SECRET_KEY=YOUR_LIVE_SECRET_KEY_HERE
```

---

## After Upload - Verification Steps

### Step 1: Verify the Upload
Check that the new files are on the server:
```bash
# Via SSH (if you have access):
cat public_html/dist/index.html | grep "pk_live_0e1e3adc"
# Should show the new key in the meta tag
```

Or visit: `https://chefsghana.com/index.html` and view the page source (Right-click → View Page Source), look for:
```html
<meta name="paystack-public-key" content="pk_live_0e1e3adc4fc35662eb13e2f73d9cf9c770535143" />
```

### Step 2: Clear Browser Cache
After uploading, clear cache in ALL browsers:
- **Chrome:** Ctrl+Shift+Delete → Clear browsing data → Cached images and files
- **Firefox:** Ctrl+Shift+Delete → Cached Web Content
- Or just open an **Incognito/Private window**

### Step 3: Test Payment
1. Go to https://chefsghana.com
2. Fill out the registration form
3. Click "Proceed to Payment"
4. **The error should be GONE!**
5. Paystack popup should appear

---

## Troubleshooting

### Error STILL appears after upload?

**Check 1: Verify files uploaded correctly**
- View page source at https://chefsghana.com
- Search for "paystack-public-key"
- Verify it shows: `pk_live_0e1e3adc4fc35662eb13e2f73d9cf9c770535143`

**Check 2: Server caching**
If your server has caching enabled:
- Clear server cache (via cPanel or control panel)
- Wait 5-10 minutes for CDN cache to clear
- Or add `?v=2` to the URL: `https://chefsghana.com/?v=2`

**Check 3: Check the JavaScript file**
- View source, find the script tag: `/assets/index-DkeF7Izz.js`
- Click on it to open
- Search for "pk_live" in the file
- You should see the key

---

## Quick Upload via Command Line (if you have SSH access)

```bash
# Zip the dist folder locally
cd C:\Users\Pieter\Downloads\chefs
tar -czf dist.tar.gz dist/

# Upload to server via SCP
scp dist.tar.gz user@chefsghana.com:/path/to/webroot/

# SSH into server
ssh user@chefsghana.com

# Extract
cd /path/to/webroot/
rm -rf dist/  # Remove old dist folder
tar -xzf dist.tar.gz
rm dist.tar.gz

# Restart web server if needed
sudo systemctl restart nginx  # or apache2
```

---

## Contact Support

If you're unsure how to upload files to your server:
1. Contact your hosting provider's support
2. Ask them how to upload files via FTP or cPanel File Manager
3. Or provide them with the `dist.zip` file to upload for you

---

## Summary

✅ Local files are correct (key embedded)  
❌ Server files are OLD (still has old key)  
🎯 **ACTION NEEDED: Upload `dist/` folder to server NOW**

Once uploaded, the error will disappear!
