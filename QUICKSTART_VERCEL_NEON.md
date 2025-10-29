# Quick Start: Deploy to Vercel with Neon Postgres

**Time to deploy: ~15 minutes** ⏱️

## ✅ What You Need

- GitHub account
- Vercel account (free) - https://vercel.com
- Neon account (free) - https://neon.tech

## 🚀 Step-by-Step Deployment

### Step 1: Setup Neon Database (5 min)

1. **Create Neon Account**
   - Go to https://console.neon.tech
   - Sign up with GitHub (easiest)

2. **Create Project**
   - Click "New Project"
   - Name: `ghana-chefs`
   - Region: Choose closest to users (e.g., US East)
   - Click "Create Project"

3. **Import Schema**
   - In Neon Console, click "SQL Editor"
   - Open `database-postgres.sql` on your computer
   - Copy ENTIRE content (Ctrl+A, Ctrl+C)
   - Paste into SQL Editor (Ctrl+V)
   - Click "Run" button
   - Wait for "Query executed successfully"

4. **Get Connection String**
   - Click "Connection Details"
   - Copy the connection string (looks like):
   ```
   postgresql://username:password@ep-name-123.region.aws.neon.tech/neondb?sslmode=require
   ```
   - **Save this** - you'll need it!

### Step 2: Push to GitHub (2 min)

```bash
# Navigate to project
cd "C:\Users\Pieter\Downloads\chefs"

# Add all files
git add .

# Commit
git commit -m "Ready for Vercel deployment with Neon Postgres"

# Push to your GitHub repo
git push origin main
```

### Step 3: Deploy to Vercel (5 min)

1. **Import Project**
   - Go to https://vercel.com/new
   - Click "Import Git Repository"
   - Select: `webblabsorg/chefsgh`
   - Click "Import"

2. **Configure Build**
   - Framework Preset: **Vite** (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run vercel-build`
   - Output Directory: `dist`
   - Leave as defaults, click "Continue"

3. **Add Environment Variables**
   
   Click "Environment Variables", add these:

   ```env
   DATABASE_URL=your-neon-connection-string-from-step1
   JWT_SECRET=put-a-long-random-string-here-min-32-chars
   ADMIN_SEED_EMAIL=admin@chefsghana.com
   ADMIN_SEED_PASSWORD=your-secure-admin-password
   ADMIN_SEED_NAME=Administrator
   EMAIL_HOST=mail.chefsghana.com
   EMAIL_PORT=587
   EMAIL_USER=info@chefsghana.com
   EMAIL_PASSWORD=your-email-password
   EMAIL_FROM=info@chefsghana.com
   ADMIN_EMAIL=admin@chefsghana.com
   VITE_PAYSTACK_PUBLIC_KEY=your-paystack-public-key
   PAYSTACK_SECRET_KEY=your-paystack-secret-key
   PAYSTACK_WEBHOOK_SECRET=your-webhook-secret
   NODE_ENV=production
   ```

   **For CLIENT_ORIGIN**: Leave empty for now, we'll update after first deploy

4. **Deploy!**
   - Click "Deploy"
   - Wait 2-3 minutes
   - You'll get a URL like: `https://chefsgh.vercel.app`

### Step 4: Update CLIENT_ORIGIN (1 min)

1. Copy your Vercel URL
2. Go to Project Settings → Environment Variables
3. Add/Update:
   ```env
   CLIENT_ORIGIN=https://your-app.vercel.app
   ```
4. Go to Deployments → Click "..." → "Redeploy"

### Step 5: Configure Paystack Webhook (2 min)

1. Go to https://dashboard.paystack.com
2. Settings → Webhooks
3. Add webhook URL:
   ```
   https://your-app.vercel.app/api/webhook/paystack
   ```
4. Copy webhook secret
5. Add to Vercel env vars as `PAYSTACK_WEBHOOK_SECRET`
6. Redeploy

### Step 6: Test Your Deployment ✅

**Test API:**
```bash
curl https://your-app.vercel.app/api/health
# Should return: {"status":"ok"}

curl https://your-app.vercel.app/api/membership-types
# Should return 5 membership types
```

**Test Frontend:**
- Visit: `https://your-app.vercel.app`
- Should see registration form

**Test Admin:**
- Visit: `https://your-app.vercel.app/admin/login`
- Login with:
  - Email: `admin@chefsghana.com`
  - Password: (your `ADMIN_SEED_PASSWORD`)

## ✅ Success Checklist

- [ ] Neon database created and schema imported
- [ ] 5 membership types visible in Neon SQL Editor
- [ ] Code pushed to GitHub
- [ ] Vercel project created and deployed
- [ ] All environment variables added
- [ ] API health endpoint returns OK
- [ ] Membership types endpoint returns data
- [ ] Frontend loads correctly
- [ ] Admin login works
- [ ] Paystack webhook configured

## 🎉 You're Live!

Your Ghana Chef Association platform is now deployed and running on:
- **Frontend + Backend**: Vercel serverless
- **Database**: Neon Postgres
- **Payments**: Paystack

## 📊 Monitor Your App

### Vercel Dashboard
- View deployments
- Check function logs
- Monitor bandwidth usage

### Neon Console
- View database queries
- Check storage usage
- Monitor connections

## 🔧 Make Changes

To update your app:

```bash
# Make changes to code
# ...

# Commit and push
git add .
git commit -m "Your changes"
git push origin main

# Vercel automatically redeploys!
```

## 💰 Cost Breakdown

| Service | Free Tier | Upgrade |
|---------|-----------|---------|
| **Vercel** | 100GB bandwidth, unlimited deployments | $20/mo Pro |
| **Neon** | 0.5GB storage, always-on compute | $19/mo Pro |
| **Total** | **$0/month** | $39/mo for more resources |

## 🆘 Troubleshooting

### "Database error" in Vercel logs
- Check `DATABASE_URL` is correct
- Ensure `?sslmode=require` is at the end

### "Membership types not loading"
- Check database schema was imported
- Run in Neon SQL Editor: `SELECT * FROM membership_types;`

### "Admin login failed"
- Check `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD`
- Check `JWT_SECRET` is set (min 32 chars)

### "Payment webhook not working"
- Verify webhook URL in Paystack dashboard
- Check `PAYSTACK_WEBHOOK_SECRET` matches

### Still stuck?
- Check Vercel function logs
- Check Neon query logs
- Review `VERCEL_DEPLOYMENT.md` for detailed troubleshooting

## 📚 Next Steps

1. ✅ Deployed successfully
2. 🔜 Test complete registration flow
3. 🔜 Configure custom domain (optional)
4. 🔜 Set up file storage (Vercel Blob for uploads)
5. 🔜 Configure email templates
6. 🔜 Add team members to admin panel

---

**Congratulations! Your platform is live! 🚀**

Share your URL: `https://your-app.vercel.app`
