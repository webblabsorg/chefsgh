# 📧 EMAIL CONFIGURATION GUIDE

## WHERE COMPLETED FORMS GO

### 📬 Email Address
**All completed registration forms are sent to:**
```
support@chefsghana.com
```

This is configured in your `.env` file:
```env
SUPPORT_EMAIL=support@chefsghana.com
```

---

## 📋 WHAT INFORMATION IS INCLUDED

When someone completes a registration, an email is sent with the following details:

### 1. **Membership Information**
- ✅ Membership ID (e.g., `GCA-2025-001234`)
- ✅ Membership Type (Professional, Student, Corporate, etc.)
- ✅ Payment Reference (e.g., `GCA-1730095800-123456`)
- ✅ Amount Paid (e.g., `GH₵500.00`)
- ✅ Payment Status (success)

### 2. **Applicant Personal Information**
- ✅ Full Name (First, Middle, Last)
- ✅ Email Address
- ✅ Phone Number
- ✅ Alternative Phone (if provided)
- ✅ Date of Birth
- ✅ Gender
- ✅ Nationality
- ✅ ID Type (Ghana Card, Passport, Voter ID, etc.)
- ✅ ID Number
- ✅ Physical Address (Street, City, Region)
- ✅ Digital Address (if provided)

### 3. **Emergency Contact**
- ✅ Emergency Contact Name
- ✅ Relationship to Applicant
- ✅ Emergency Contact Phone

### 4. **Professional / Additional Details**
*(Depends on membership type - may include)*
- ✅ Current Employer
- ✅ Job Title
- ✅ Years of Experience
- ✅ Culinary Qualifications
- ✅ Institution Name (for students)
- ✅ Expected Graduation Date
- ✅ Company Name (for corporate)
- ✅ Business Type (for vendors)
- ✅ Products/Services Offered
- ✅ And more depending on membership type

---

## 📧 EMAIL EXAMPLE

### Subject Line:
```
New Professional Membership registration - GCA-2025-001234
```

### Email Body:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

New Membership Registration

A new member registration has been submitted via the website.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MEMBERSHIP
• Membership ID: GCA-2025-001234
• Type: Professional Chef
• Reference: GCA-1730095800-123456
• Amount Paid: GH₵500.00
• Payment Status: success

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

APPLICANT
• Name: Kwame Asante Mensah
• Email: kwame.asante@example.com
• Phone: +233 24 123 4567
• Alternate Phone: +233 50 987 6543
• Date of Birth: 1990-05-15
• Gender: male
• Nationality: Ghanaian
• ID Type: ghana_card
• ID Number: GHA-123456789-0
• Address: 123 Independence Avenue, Accra, Greater Accra
• Digital Address: GA-123-4567

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EMERGENCY CONTACT
• Name: Ama Asante
• Relationship: Sister
• Phone: +233 24 888 9999

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROFESSIONAL / ADDITIONAL DETAILS
• current_employer: Royal Senchi Hotel
• job_title: Executive Chef
• years_of_experience: 10
• culinary_qualifications: Le Cordon Bleu Diploma, City & Guilds
• specializations: French Cuisine, Pastry
• professional_memberships: Ghana Chef Association

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please log into the admin dashboard to review and approve the 
registration.
```

---

## ⚙️ EMAIL SERVER CONFIGURATION

### Sender Configuration
The email is sent **FROM:**
```
info@chefsghana.com
```
(Configured in `.env` as `EMAIL_USER` and `EMAIL_FROM`)

### Recipient
The email is sent **TO:**
```
support@chefsghana.com
```
(Configured in `.env` as `SUPPORT_EMAIL`)

---

## 🔧 HOW TO CHANGE THE RECIPIENT EMAIL

### On Your Server

Edit your server's `.env` file:

```bash
# Change this line:
SUPPORT_EMAIL=support@chefsghana.com

# To any email you want:
SUPPORT_EMAIL=admin@chefsghana.com
# or
SUPPORT_EMAIL=registrations@chefsghana.com
# or even multiple (comma-separated):
SUPPORT_EMAIL=admin@chefsghana.com,info@chefsghana.com
```

Then **restart your backend server:**
```bash
npm run server
# or if using PM2:
pm2 restart chefs-api
```

---

## 🗄️ EMAIL LOGGING

All sent emails are logged in the database in the `email_notifications` table:

```sql
SELECT * FROM email_notifications
ORDER BY sent_at DESC
LIMIT 10;
```

This shows:
- ✅ Registration ID
- ✅ Recipient email
- ✅ Subject
- ✅ Email body (HTML)
- ✅ Status (sent/failed)
- ✅ Timestamp
- ✅ Error message (if failed)

---

## 📧 EMAIL SMTP SETTINGS

Your email server is configured in `.env`:

```env
EMAIL_HOST=mail.chefsghana.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=info@chefsghana.com
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=info@chefsghana.com
EMAIL_FROM_NAME=Ghana Chef Association
SUPPORT_EMAIL=support@chefsghana.com
```

### Important Notes:

1. **EMAIL_USER & EMAIL_PASSWORD**
   - Must be valid email credentials on your server
   - Usually the same as your cPanel email account

2. **EMAIL_HOST**
   - Usually: `mail.yourdomain.com`
   - Or: `smtp.yourdomain.com`

3. **EMAIL_PORT**
   - `587` - For TLS (recommended)
   - `465` - For SSL
   - `25` - For plain (not recommended)

4. **EMAIL_SECURE**
   - `false` for port 587 (TLS)
   - `true` for port 465 (SSL)

---

## ✅ WHAT HAPPENS AFTER FORM SUBMISSION

### Step 1: User Fills Form
User completes all registration steps and pays via Paystack

### Step 2: Data Saved
Registration data is saved to MySQL database:
- `users` table - Personal information
- `registrations` table - Registration details
- `payments` table - Payment information

### Step 3: Email Sent
Email is automatically sent to `support@chefsghana.com` with all details

### Step 4: Confirmation
- User sees "Registration Successful" message on screen
- User receives their Membership ID
- Admin receives email notification

---

## 🚨 TROUBLESHOOTING EMAIL ISSUES

### Emails Not Sending?

**Check 1: Server .env File**
```bash
# SSH into server
cd /path/to/your/app
cat .env | grep EMAIL
# Verify all EMAIL_* settings are correct
```

**Check 2: Email Credentials**
```bash
# Test email settings
node -e "require('./api/server/services/email.js').sendTestEmail()"
```

**Check 3: Database Logs**
```sql
SELECT * FROM email_notifications 
WHERE status = 'failed' 
ORDER BY created_at DESC 
LIMIT 10;
```

**Check 4: Server Logs**
```bash
# If using PM2:
pm2 logs chefs-api

# Or check application logs:
tail -f /var/log/nodejs/app.log
```

---

## 📝 TO SUMMARIZE

**Question:** Where do completed forms go?  
**Answer:** `support@chefsghana.com`

**Question:** What details are included?  
**Answer:** Everything:
- Membership info (ID, type, payment)
- Personal info (name, contact, ID, address)
- Emergency contact
- Professional details (depends on membership type)

**Question:** How do I change the recipient?  
**Answer:** Update `SUPPORT_EMAIL` in server's `.env` file and restart server

---

## 🔐 SECURITY NOTE

The email contains sensitive personal information including:
- ID numbers
- Phone numbers
- Addresses
- Payment details

**Ensure:**
- ✅ Email account is secured with strong password
- ✅ Only authorized staff have access
- ✅ Email is not forwarded to insecure accounts
- ✅ SSL/TLS is enabled for email transmission

---

## 📞 NEED TO TEST EMAILS?

1. Submit a test registration
2. Check `support@chefsghana.com` inbox
3. If not received, check spam folder
4. Check database `email_notifications` table for status
5. Check server logs for errors

If emails still not working, verify your hosting provider allows outgoing SMTP connections on port 587.
