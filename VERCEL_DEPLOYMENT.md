# Deploying Ghana Chef Association to Vercel

This guide will help you deploy both the frontend and backend to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at https://vercel.com (free)
2. **GitHub Repository**: Your code should be in a GitHub repo
3. **MySQL Database**: Have your MySQL database ready (can use PlanetScale, Railway, or your existing DirectAdmin MySQL)

## Step 1: Prepare Environment Variables

Before deploying, gather these values:

### Required Environment Variables

```env
# Database (MySQL)
MYSQL_HOST=your-mysql-host.com
MYSQL_PORT=3306
MYSQL_DATABASE=chefs_db
MYSQL_USER=your_db_user
MYSQL_PASSWORD=your_db_password
MYSQL_CONNECTION_LIMIT=10

# JWT & Security
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long

# Email (DirectAdmin or SMTP)
EMAIL_HOST=mail.chefsghana.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=info@chefsghana.com
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=info@chefsghana.com
EMAIL_FROM_NAME=Ghana Chef Association
ADMIN_EMAIL=admin@chefsghana.com

# Paystack
PAYSTACK_SECRET_KEY=sk_live_your_secret_key
PAYSTACK_WEBHOOK_SECRET=whsec_your_webhook_secret

# Admin Seed (for first-time setup)
ADMIN_SEED_EMAIL=admin@chefsghana.com
ADMIN_SEED_PASSWORD=your-admin-password
ADMIN_SEED_NAME=Administrator

# Application
NODE_ENV=production
CLIENT_ORIGIN=https://your-vercel-app.vercel.app
API_PORT=4000
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Click "Add New Project"

2. **Import Your Repository**
   - Select "Import Git Repository"
   - Choose your GitHub repository
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Select "Vite"
   - **Root Directory**: Leave as `./` (root)
   - **Build Command**: `npm run vercel-build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install`

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add ALL the variables from Step 1
   - Make sure to add them for "Production", "Preview", and "Development"

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for deployment to complete
   - You'll get a URL like `https://your-app.vercel.app`

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? chefs-ghana
# - Directory? ./
# - Override settings? No

# After successful deployment, set environment variables:
vercel env add MYSQL_HOST
vercel env add MYSQL_USER
# ... add all other variables

# Deploy to production
vercel --prod
```

## Step 3: Configure Custom Domain (Optional)

1. Go to your Vercel project settings
2. Click "Domains"
3. Add your custom domain: `chefsghana.com`
4. Follow DNS configuration instructions
5. Add these DNS records to your domain:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

## Step 4: Update Frontend Environment Variable

After deployment, you'll have a Vercel URL. Update your frontend to use it:

1. In Vercel Dashboard, go to your project
2. Settings → Environment Variables
3. Add/Update:
   ```
   VITE_API_BASE_URL=https://your-app.vercel.app
   ```
4. Redeploy (Vercel will auto-redeploy after env variable changes)

## Step 5: Configure Paystack Webhook

1. Go to Paystack Dashboard: https://dashboard.paystack.com
2. Navigate to Settings → Webhooks
3. Add webhook URL:
   ```
   https://your-app.vercel.app/api/webhook/paystack
   ```
4. Copy the webhook secret
5. Add it to Vercel env variables as `PAYSTACK_WEBHOOK_SECRET`

## Step 6: Test Your Deployment

### Test API Health
```bash
curl https://your-app.vercel.app/api/health
# Should return: {"status":"ok"}
```

### Test Frontend
Visit: `https://your-app.vercel.app`
- Should see the registration form

### Test Admin Login
Visit: `https://your-app.vercel.app/admin/login`
- Login with your admin credentials
- Email: admin@chefsghana.com
- Password: (your ADMIN_SEED_PASSWORD)

### Test Registration
1. Fill out registration form
2. Complete payment (use Paystack test card in test mode)
3. Check if email notification is sent
4. Check admin dashboard for new registration

## Step 7: Monitor and Debug

### View Logs
```bash
# Using CLI
vercel logs your-app.vercel.app

# Or in Dashboard
# Go to your project → Deployments → Click deployment → View Function Logs
```

### Common Issues

**Issue: Database connection fails**
- ✅ Check if MySQL host is accessible from external IPs
- ✅ Verify MySQL user has remote access permissions
- ✅ Check firewall rules allow connections from Vercel IPs
- ✅ Verify environment variables are correctly set

**Issue: API routes return 404**
- ✅ Check `vercel.json` configuration
- ✅ Verify API routes are defined correctly
- ✅ Check deployment logs for errors

**Issue: Environment variables not working**
- ✅ Make sure variables are added for "Production" environment
- ✅ Redeploy after adding new variables
- ✅ Check variable names match exactly (case-sensitive)

**Issue: Email not sending**
- ✅ Verify SMTP credentials
- ✅ Check if email host allows external connections
- ✅ Check spam folder
- ✅ Review email logs in admin dashboard

## Database Hosting Options

If you need a cloud MySQL database:

### Option 1: PlanetScale (Recommended)
- Free tier: 5GB storage
- Serverless MySQL compatible with Vercel
- https://planetscale.com
- Connection string format: `mysql://user:pass@host/database?ssl={"rejectUnauthorized":true}`

### Option 2: Railway
- $5/month for 8GB storage
- Easy MySQL setup
- https://railway.app

### Option 3: Keep DirectAdmin MySQL
- Ensure remote access is enabled
- Add Vercel IPs to allowlist (if restricted)
- Use SSH tunnel if needed

## File Uploads on Vercel

⚠️ **Important**: Vercel's serverless functions are stateless. Files uploaded to `/uploads` will be lost after function execution.

**Solutions:**

### Option A: Use Cloud Storage (Recommended)
Integrate with:
- **AWS S3**: https://aws.amazon.com/s3/
- **Cloudinary**: https://cloudinary.com (free tier available)
- **Vercel Blob**: https://vercel.com/docs/storage/vercel-blob

### Option B: Store in Database
- Convert files to base64
- Store in MySQL BLOB/LONGBLOB columns
- Not recommended for large files

### Option C: External File Server
- Keep files on DirectAdmin
- Create separate upload endpoint
- Serve files from DirectAdmin

## Continuous Deployment

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Vercel automatically detects push and deploys
# Visit Vercel dashboard to see deployment progress
```

## Environment Variables Reference

Here's a complete list organized by category:

```env
# === DATABASE ===
MYSQL_HOST=
MYSQL_PORT=3306
MYSQL_DATABASE=
MYSQL_USER=
MYSQL_PASSWORD=
MYSQL_CONNECTION_LIMIT=10

# === SECURITY ===
JWT_SECRET=
SESSION_SECRET=
ENCRYPTION_KEY=

# === EMAIL ===
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=
EMAIL_FROM_NAME=Ghana Chef Association
ADMIN_EMAIL=

# === PAYSTACK ===
VITE_PAYSTACK_PUBLIC_KEY=pk_live_
PAYSTACK_SECRET_KEY=sk_live_
PAYSTACK_WEBHOOK_SECRET=whsec_

# === ADMIN ===
ADMIN_SEED_EMAIL=
ADMIN_SEED_PASSWORD=
ADMIN_SEED_NAME=

# === APPLICATION ===
NODE_ENV=production
CLIENT_ORIGIN=
API_PORT=4000
APP_URL=
APP_NAME=Ghana Chef Association
```

## Cost Estimation

### Vercel (Hobby Plan - Free)
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth per month
- ✅ Serverless functions
- ✅ Automatic SSL
- ✅ Custom domains

**Upgrade to Pro ($20/month) if you need:**
- More bandwidth
- Advanced analytics
- Team collaboration
- Password protection

### Database Options
- **DirectAdmin MySQL**: Already included
- **PlanetScale**: Free (5GB) → $29/month (10GB)
- **Railway**: $5/month (8GB)

## Support & Troubleshooting

### Vercel Support
- Documentation: https://vercel.com/docs
- Community: https://github.com/vercel/vercel/discussions
- Support: support@vercel.com

### Ghana Chef Association
- Email: info@chefsghana.com
- Phone: +233 24 493 5185

---

## Quick Deployment Checklist

- [ ] Create Vercel account
- [ ] Push code to GitHub
- [ ] Import project to Vercel
- [ ] Add all environment variables
- [ ] Deploy to production
- [ ] Test API health endpoint
- [ ] Test frontend loads
- [ ] Test admin login
- [ ] Test registration flow
- [ ] Configure Paystack webhook
- [ ] Test payment processing
- [ ] Configure custom domain (optional)
- [ ] Set up file storage solution
- [ ] Monitor logs for errors

---

**Deployment Date**: _________________  
**Deployed By**: _________________  
**Vercel URL**: _________________  
**Custom Domain**: _________________  

---

## Next Steps After Deployment

1. **Test Everything**: Complete a full registration test
2. **Monitor**: Check logs daily for first week
3. **Backup**: Set up database backups
4. **Security**: Review security settings
5. **Performance**: Monitor response times
6. **Documentation**: Update team on new URLs

Good luck with your deployment! 🚀
