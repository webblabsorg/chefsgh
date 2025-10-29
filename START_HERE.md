# START HERE - Admin Login Fix

## 🚨 DirectAdmin Has No Node.js? 

**SOLUTION:** Deploy API to Render.com (free, 15 minutes)

👉 **Read: [SOLUTION_NO_NODEJS.md](./SOLUTION_NO_NODEJS.md)**  
👉 **Full Guide: [DEPLOY_API_TO_RENDER.md](./DEPLOY_API_TO_RENDER.md)**

This is the **easiest and recommended solution**!

---

## Quick Diagnostic Test

Visit: **https://chefsghana.com/api/health**

- If you see `{"status":"ok"}` → Server running, go to login fix
- If you see 404 error → Server NOT running, see solution above

---

## Files to Read

### If DirectAdmin Has NO Node.js (Your Situation)
1. **SOLUTION_NO_NODEJS.md** ⭐ START HERE - Quick overview
2. **DEPLOY_API_TO_RENDER.md** - Detailed step-by-step guide

### If DirectAdmin HAS Node.js
3. **QUICK_REFERENCE.txt** - One page quick fixes
4. **DIRECTADMIN_NODE_SETUP.md** - How to start Node.js server
5. **URGENT_FIX_ADMIN_LOGIN.md** - Step-by-step login troubleshooting

### Other Resources
6. **test-deployment.html** - Open in browser to test visually
7. **README_DEPLOYMENT.md** - Complete overview

---

## Default Admin Credentials

- Email: admin@chefsghana.com
- Password: your-admin-password (check .env for ADMIN_SEED_PASSWORD)

---

## Recommended Solution

Since DirectAdmin has no Node.js:

1. ✅ Sign up at https://render.com (FREE)
2. ✅ Deploy your API there (15 minutes)
3. ✅ Update frontend to use new API URL
4. ✅ Done! Everything works!

**Full guide:** [DEPLOY_API_TO_RENDER.md](./DEPLOY_API_TO_RENDER.md)
