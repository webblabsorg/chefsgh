# Quick Start Guide - Ghana Chef Association

## 🚀 Get Started in 5 Minutes

This guide will help you quickly set up and deploy the Ghana Chef Association registration system.

---

## Prerequisites Checklist

Before you begin, make sure you have:

- [ ] DirectAdmin hosting account
- [ ] Supabase account (free tier works)
- [ ] Paystack account (test mode for development)
- [ ] FTP client (FileZilla recommended)
- [ ] Text editor (VS Code recommended)

---

## Step 1: Configure Environment (2 minutes)

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in the essential values:**
   ```env
   # Supabase (from https://app.supabase.com)
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key

   # Paystack (from https://dashboard.paystack.com)
   VITE_PAYSTACK_PUBLIC_KEY=pk_test_your-key

   # Email
   EMAIL_USER=info@chefsghana.com
   EMAIL_PASSWORD=your-email-password
   ADMIN_EMAIL=admin@chefsghana.com
   ```

---

## Step 2: Set Up Database (2 minutes)

1. **Create database in DirectAdmin:**
   - Go to MySQL Management
   - Create database: `chefs_db`
   - Create user and set password

2. **Import schema:**
   - Open phpMyAdmin
   - Select `chefs_db`
   - Import `database.sql`
   - Verify 6 tables created

---

## Step 3: Configure Email (1 minute)

1. **Create email accounts in DirectAdmin:**
   - `info@chefsghana.com`
   - `admin@chefsghana.com`

2. **Test email:**
   ```bash
   # Upload api/send-email.php first
   curl -X POST https://chefsghana.com/api/send-email.php \
     -H "Content-Type: application/json" \
     -d '{"to":"your-email@test.com","subject":"Test","html":"<p>Test</p>"}'
   ```

---

## Step 4: Deploy Files (5 minutes)

### Option A: Using FTP

1. **Connect to your server:**
   - Host: ftp.chefsghana.com
   - Username: Your DirectAdmin username
   - Password: Your DirectAdmin password

2. **Upload files:**
   - Upload `dist/` contents to `public_html/`
   - Upload `api/` folder to root

### Option B: Using DirectAdmin File Manager

1. Go to File Manager
2. Navigate to `public_html`
3. Upload `dist/` contents
4. Upload `api/` folder

---

## Step 5: Test Everything (5 minutes)

### Test 1: Website Loads
Visit: `https://chefsghana.com`
- [ ] Page loads without errors
- [ ] Form displays correctly

### Test 2: Date Pickers
- [ ] Click Date of Birth field
- [ ] Verify year dropdown shows 1940-2025
- [ ] Select a date successfully

### Test 3: Terms Modal
- [ ] Click "Terms and Conditions" link
- [ ] Modal opens with scrollable content
- [ ] Close button works
- [ ] ESC key closes modal

### Test 4: Complete Registration
- [ ] Fill out entire form
- [ ] Upload profile photo
- [ ] Accept terms
- [ ] Process test payment
- [ ] Verify success message

### Test 5: Email Notification
- [ ] Check admin email inbox
- [ ] Verify registration notification received
- [ ] Confirm all details are correct

---

## Common Issues & Quick Fixes

### Issue: Database Connection Failed
**Fix:**
```env
# Update .env with correct credentials
DATABASE_HOST=localhost
DATABASE_NAME=chefs_db
DATABASE_USER=your_actual_user
DATABASE_PASSWORD=your_actual_password
```

### Issue: Email Not Sending
**Fix:**
1. Verify email account exists in DirectAdmin
2. Check credentials in `.env`
3. View PHP error log: `tail -f /path/to/error.log`

### Issue: Payment Not Working
**Fix:**
1. Verify Paystack public key in `.env`
2. Check browser console for errors
3. Ensure Paystack script is loaded

### Issue: Date Picker Not Showing
**Fix:**
1. Clear browser cache
2. Check browser console for errors
3. Verify all JavaScript files loaded

---

## Production Checklist

Before going live:

- [ ] Switch to Paystack live keys
- [ ] Set `NODE_ENV=production`
- [ ] Enable SSL (HTTPS)
- [ ] Test all form fields
- [ ] Test payment processing
- [ ] Test email notifications
- [ ] Set up database backups
- [ ] Configure error logging
- [ ] Test on mobile devices
- [ ] Test in different browsers

---

## Useful Commands

### Build for Production
```bash
npm install
npm run build
```

### Test Email API
```bash
curl -X POST https://chefsghana.com/api/send-email.php \
  -H "Content-Type: application/json" \
  -d @test-email.json
```

### Check Database
```sql
-- Count registrations
SELECT COUNT(*) FROM registrations;

-- View latest registration
SELECT * FROM registrations ORDER BY created_at DESC LIMIT 1;

-- Check email logs
SELECT * FROM email_notifications ORDER BY created_at DESC LIMIT 5;
```

### View Logs
```bash
# PHP error log
tail -f /path/to/error.log

# Access log
tail -f /path/to/access.log
```

---

## Quick Reference

### Important URLs
- **Website:** https://chefsghana.com
- **Admin Panel:** https://chefsghana.com:2222 (DirectAdmin)
- **phpMyAdmin:** https://chefsghana.com:2222/phpMyAdmin
- **Supabase:** https://app.supabase.com
- **Paystack:** https://dashboard.paystack.com

### Important Files
- **Environment:** `.env`
- **Database Schema:** `database.sql`
- **Email API:** `api/send-email.php`
- **Deployment Guide:** `DEPLOYMENT.md`

### Support Contacts
- **Email:** info@chefsghana.com
- **Phone:** +233 24 493 5185 / +233 24 277 7111

---

## Next Steps

1. **Read Full Documentation:**
   - `DEPLOYMENT.md` - Complete deployment guide
   - `IMPLEMENTATION_SUMMARY.md` - Feature details
   - `database.sql` - Database structure

2. **Customize:**
   - Update branding/colors
   - Modify membership types
   - Adjust pricing

3. **Monitor:**
   - Check registrations daily
   - Review email logs
   - Monitor payment success rate

4. **Maintain:**
   - Weekly database backups
   - Monthly dependency updates
   - Regular security reviews

---

## Success! 🎉

If you've completed all steps, your Ghana Chef Association registration system is now live and ready to accept members!

**Test it now:** Visit https://chefsghana.com and complete a test registration.

---

**Need Help?**

If you encounter any issues:
1. Check the troubleshooting section above
2. Review `DEPLOYMENT.md` for detailed instructions
3. Contact support at info@chefsghana.com

---

**Last Updated:** October 2024
