# Neon Postgres Setup for Vercel Deployment

## Why Neon Postgres?

✅ **Serverless** - Scales to zero when not in use (free tier never sleeps)  
✅ **Perfect for Vercel** - Designed for serverless deployments  
✅ **Free Tier** - 0.5GB storage, 1 database, enough for most projects  
✅ **Instant** - No server setup or management needed  
✅ **Branching** - Database branching for development/testing  

## Step 1: Create Neon Account

1. Go to https://console.neon.tech
2. Sign up (can use GitHub)
3. Create a new project:
   - **Project Name**: `ghana-chefs`
   - **Region**: Choose closest to your users (e.g., US East)
   - **Postgres Version**: 16 (latest)

## Step 2: Get Database Connection String

After creating your project, you'll see a connection string like:

```
postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Copy this entire string** - you'll need it for Vercel.

## Step 3: Import Database Schema

### Option A: Using Neon Console (Easy)

1. In Neon Console, click **SQL Editor**
2. Copy the entire contents of `database-postgres.sql`
3. Paste into SQL Editor
4. Click **Run** (or press Ctrl+Enter)
5. Wait for "Query executed successfully"

### Option B: Using psql (Advanced)

```bash
# Install psql if needed (comes with Postgres)
# Then connect:
psql "postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Import schema:
\i database-postgres.sql

# Check tables were created:
\dt

# Exit:
\q
```

## Step 4: Verify Database Setup

In Neon SQL Editor, run:

```sql
-- Check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check membership types were seeded
SELECT name, price FROM membership_types;

-- Should show 5 membership types:
-- Professional: 350.00
-- Corporate: 450.00
-- Associate: 250.00
-- Vendor: 150.00
-- Student: 50.00
```

## Step 5: Add to Vercel

1. Go to your Vercel project
2. **Settings → Environment Variables**
3. Add:

```env
DATABASE_URL=postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Important**: Add for all environments (Production, Preview, Development)

4. **Redeploy** your project

## Step 6: Test Connection

After deployment, test your API:

```bash
# Health check
curl https://your-app.vercel.app/api/health

# Membership types (should return 5 types)
curl https://your-app.vercel.app/api/membership-types
```

## Environment Variables Summary

Your `.env` file should have:

```env
# Database (Neon Postgres)
DATABASE_URL=postgresql://user:pass@host.neon.tech/dbname?sslmode=require

# JWT & Security
JWT_SECRET=your-super-secret-min-32-chars

# Email
EMAIL_HOST=mail.chefsghana.com
EMAIL_PORT=587
EMAIL_USER=info@chefsghana.com
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=info@chefsghana.com
ADMIN_EMAIL=admin@chefsghana.com

# Paystack
VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_key
PAYSTACK_SECRET_KEY=sk_live_your_key
PAYSTACK_WEBHOOK_SECRET=whsec_your_secret

# Admin Seed
ADMIN_SEED_EMAIL=admin@chefsghana.com
ADMIN_SEED_PASSWORD=your-secure-password
ADMIN_SEED_NAME=Administrator

# App
NODE_ENV=production
CLIENT_ORIGIN=https://your-app.vercel.app
API_PORT=4000
```

## Neon Free Tier Limits

| Resource | Free Tier |
|----------|-----------|
| Storage | 0.5 GB |
| Databases | 1 |
| Branches | 1 |
| Compute Time | Always available (serverless) |
| Data Transfer | Unlimited |
| Connections | Pooled (no limit) |

**Upgrade if needed**: $19/month for 10GB storage

## Managing Your Database

### Using Neon Console

- **SQL Editor**: Run queries directly in browser
- **Tables**: View table structure and data
- **Monitoring**: Check query performance
- **Branching**: Create dev/test branches

### Connecting Locally

Update your local `.env`:

```env
DATABASE_URL=postgresql://username:password@ep-cool-name.neon.tech/neondb?sslmode=require
```

Then run your API:

```bash
cd api
npm install  # Install pg package
node server/index.js
```

## Common Issues

### Issue: Connection timeout

**Solution**: 
- Check connection string is correct
- Ensure `?sslmode=require` is at the end
- Verify Neon project is active (not suspended)

### Issue: "relation does not exist"

**Solution**:
- Database schema not imported
- Run `database-postgres.sql` in SQL Editor

### Issue: Permission denied

**Solution**:
- Check connection string user has correct permissions
- In Neon, database owner has all permissions by default

### Issue: Too many connections

**Solution**:
- Neon uses connection pooling automatically
- But in code, ensure you're not creating new pools unnecessarily
- Use the single `pool` instance from `db.js`

## Differences from MySQL

| Feature | MySQL | Postgres |
|---------|-------|----------|
| Placeholders | `?` | `$1, $2, $3` |
| UUID | `UUID()` | `gen_random_uuid()` |
| JSON | `JSON` | `JSONB` (better) |
| Boolean | `BOOLEAN` | `BOOLEAN` |
| Auto Increment | `AUTO_INCREMENT` | `SERIAL` or `UUID` |
| Enums | Inline | Separate `CREATE TYPE` |
| Triggers | MySQL syntax | Postgres syntax |

**All conversions done!** Your code now uses Postgres syntax.

## Monitoring & Maintenance

### Check Database Size

```sql
SELECT pg_size_pretty(pg_database_size(current_database()));
```

### Check Active Connections

```sql
SELECT count(*) FROM pg_stat_activity;
```

### View Recent Queries

```sql
SELECT query, state, query_start 
FROM pg_stat_activity 
WHERE state != 'idle' 
ORDER BY query_start DESC;
```

## Backup Strategy

Neon provides automatic backups:
- **Point-in-time restore**: Last 7 days (free tier)
- **Branches**: Create database branches for testing

### Manual Backup

```bash
# Export database
pg_dump "postgresql://user:pass@host.neon.tech/db" > backup.sql

# Import to new database
psql "postgresql://user:pass@host.neon.tech/newdb" < backup.sql
```

## Cost Management

Free tier is sufficient for:
- Development projects
- Small production apps
- MVP launches
- Testing

Upgrade when you need:
- More storage (>0.5GB)
- Multiple databases
- Team collaboration
- Extended backup retention

## Next Steps

1. ✅ Created Neon account
2. ✅ Imported schema
3. ✅ Added DATABASE_URL to Vercel
4. ✅ Deployed and tested
5. 🔜 Monitor usage in Neon Console
6. 🔜 Set up staging database (using branches)

## Support

- **Neon Docs**: https://neon.tech/docs
- **Neon Community**: https://community.neon.tech
- **Neon Status**: https://status.neon.tech

---

**Your database is ready for production! 🚀**

Everything is now configured to use Neon Postgres with Vercel serverless deployment.
