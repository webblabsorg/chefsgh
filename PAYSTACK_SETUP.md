# Paystack Configuration Guide

## Updated Build Status
✅ **Live Public Key Embedded**: `pk_live_0e1e3adc4fc35662eb13e2f73d9cf9c770535143`
✅ **Dist folder rebuilt** - Ready for upload

---

## Paystack Dashboard Configuration

### 1. Live Callback URL
**NOT REQUIRED** - We're using Paystack Inline (popup), which handles callbacks via JavaScript. No redirect URL is needed.

### 2. Live Webhook URL
Configure this in your Paystack Dashboard (Settings → Webhook):

```
https://chefsghana.com/api/webhook/paystack
```

**What it does:**
- Receives real-time payment notifications from Paystack
- Updates payment status in the database
- Activates member registration after successful payment
- Handles failed payment tracking

### 3. Webhook Secret
**YES, you need this!**

When you add the webhook URL in your Paystack dashboard, Paystack will generate a webhook secret. Copy it and add to your server's `.env` file:

```env
PAYSTACK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx
```

**Important:** The webhook currently validates using your `PAYSTACK_SECRET_KEY`. If Paystack provides a separate webhook secret, update the validation in `api/server/routes/webhook.js`.

---

## Server Configuration

### Required Environment Variables
Update your server's `.env` file with:

```env
# Paystack Live Keys
VITE_PAYSTACK_PUBLIC_KEY=pk_live_0e1e3adc4fc35662eb13e2f73d9cf9c770535143
PAYSTACK_SECRET_KEY=sk_live_your_secret_key_here
PAYSTACK_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# API Configuration
CLIENT_ORIGIN=https://chefsghana.com
VITE_API_BASE_URL=https://chefsghana.com
```

---

## Deployment Steps

### 1. Upload Frontend
Upload the entire `dist/` folder to your web server:
- Replace existing `dist/` folder completely
- The new build has the correct live public key embedded

### 2. Upload Backend
Ensure these files are on your server:
- `api/server/routes/webhook.js` (NEW - webhook handler)
- `api/server/index.js` (UPDATED - includes webhook route)
- All other backend files

### 3. Update Environment Variables
Copy the configuration from `C:\Users\Pieter\Downloads\env` to your server's `.env` file.

### 4. Restart Backend Server
```bash
npm run server
# or
pm2 restart chefs-api
```

### 5. Configure Paystack Dashboard
1. Go to https://dashboard.paystack.com/#/settings/developer
2. Under "Webhook", add: `https://chefsghana.com/api/webhook/paystack`
3. Copy the generated webhook secret
4. Add it to your server's `.env` file as `PAYSTACK_WEBHOOK_SECRET`
5. Restart your server

---

## Testing the Payment Flow

### 1. Test the Payment
1. Go to https://chefsghana.com
2. Complete the registration form
3. Click "Proceed to Payment"
4. Paystack popup should appear (no "invalid key" error)
5. Complete test payment with Paystack test card:
   - Card: 4084 0840 8408 4081
   - CVV: 408
   - Expiry: 04/30
   - PIN: 0000

### 2. Verify Database
Check that:
- Registration record created in `registrations` table
- Payment record created in `payments` table with `status = 'completed'`
- Registration `status = 'active'`

### 3. Verify Email
- Confirmation email sent to `support@chefsghana.com`

---

## Troubleshooting

### "Please enter a valid Key" Error
**Cause:** Browser cached old JavaScript with old key.

**Solutions:**
1. Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache
3. Open in incognito/private window
4. Verify the uploaded `dist/index.html` contains the new key in the meta tag

### Webhook Not Working
1. Check server logs for webhook events
2. Verify webhook URL is accessible: `curl https://chefsghana.com/api/webhook/paystack`
3. Check Paystack dashboard → Webhooks → Logs
4. Ensure `PAYSTACK_SECRET_KEY` is correct in server's `.env`

### Payment Successful but Registration Not Activated
1. Check webhook logs on server
2. Verify database connection is working
3. Check `payments` table for payment records
4. Manually run the webhook handler logic if needed

---

## Important Notes

1. **Never commit** `.env` files to version control
2. **Keep backup** of your secret keys
3. **Test thoroughly** before going live with real payments
4. **Monitor webhook** logs in Paystack dashboard for first few transactions
5. The public key is embedded in the frontend build, but secret keys stay server-side only

---

## Need Help?
Check the following files for implementation:
- Frontend payment: `src/lib/paystack.ts`
- Payment review: `src/components/steps/ReviewAndPayment.tsx`
- Backend webhook: `api/server/routes/webhook.js`
- Server setup: `api/server/index.js`
