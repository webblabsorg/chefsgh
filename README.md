# Ghana Chef Association - Membership Registration System

A full-stack membership registration system for the Ghana Chef Association with integrated payment processing and admin dashboard.

## 🎯 Features

### Public Registration System
- **Multi-step Form**: 4-step registration process with progress tracking
- **5 Membership Types**: Professional, Corporate, Associate, Vendor, and Student
- **Dynamic Forms**: Customized forms based on membership type
- **File Uploads**: Profile photos, certificates, student IDs, business logos
- **Payment Integration**: Seamless Paystack payment processing
- **Email Notifications**: Automated notifications to admins

### Admin Dashboard
- **Dashboard**: Statistics and analytics overview
- **User Management**: View, create, edit user accounts
- **Registration Management**: Track and manage all registrations
- **Payment Tracking**: Monitor payment status and transactions
- **Membership Types**: Configure membership categories
- **Email Logs**: View all email notifications sent
- **Renewals**: Track membership renewals
- **Export/Import**: CSV data export and import functionality

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- Neon Postgres account (free tier available)
- Paystack account (for payments)
- Email server (SMTP)
- GitHub account (for Vercel deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd chefs
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd api && npm install && cd ..
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

4. **Set up database**
   - Create account at https://console.neon.tech
   - Create new Postgres project
   - Import `database-postgres.sql` in SQL Editor
   - Copy DATABASE_URL to `.env`
   - See [NEON_SETUP.md](./NEON_SETUP.md) for details

5. **Run development server**
   ```bash
   # Terminal 1: Frontend
   npm run dev
   
   # Terminal 2: Backend API
   npm run server
   ```

## 📦 Deployment to Vercel

### Complete Setup (3 Steps)

#### Step 1: Setup Database
See [NEON_SETUP.md](./NEON_SETUP.md)
- Create Neon Postgres account
- Import schema
- Get connection string

#### Step 2: Push to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

#### Step 3: Deploy to Vercel
See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
- Import from GitHub
- Add environment variables
- Deploy!

**Your app runs ENTIRELY on Vercel** (frontend + backend serverless functions)

## 🔧 Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Radix UI
- **Backend**: Express.js, Node.js
- **Database**: Neon Postgres (serverless)
- **Payment**: Paystack
- **Authentication**: JWT + HTTP-only cookies
- **Email**: Nodemailer
- **Deployment**: Vercel (frontend + backend)

## 📝 Git Setup (Manual)

Droid Shield detected some example keys in documentation. To commit manually:

```bash
# Review files to ensure no real secrets
git diff --cached

# Commit
git commit -m "Initial commit: Ghana Chef Association system

- Fixed webhook.js database import issue
- Added Vercel deployment configuration
- Comprehensive admin dashboard
- Multi-step registration with Paystack

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>"

# Push to GitHub
git remote add origin <your-github-repo-url>
git push -u origin main
```

## 📚 Documentation

- **[NEON_SETUP.md](./NEON_SETUP.md)** ⭐ Start here - Database setup
- **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** - Complete Vercel guide
- **[POSTGRES_CONVERSION_SUMMARY.md](./POSTGRES_CONVERSION_SUMMARY.md)** - What changed from MySQL
- **[database-postgres.sql](./database-postgres.sql)** - Postgres schema
- **[SETUP.md](./SETUP.md)** - Initial setup instructions

## 🔑 Environment Variables

Key variables needed (see `.env.example` for complete list):

```env
# Database (Neon Postgres)
DATABASE_URL=postgresql://user:pass@host.neon.tech/db?sslmode=require

# Paystack
VITE_PAYSTACK_PUBLIC_KEY=pk_live_xxx
PAYSTACK_SECRET_KEY=sk_live_xxx

# JWT
JWT_SECRET=your-secret-min-32-chars

# Email
EMAIL_HOST=mail.example.com
EMAIL_USER=info@example.com
EMAIL_PASSWORD=your-password
ADMIN_EMAIL=admin@example.com

# Admin Seed
ADMIN_SEED_EMAIL=admin@example.com
ADMIN_SEED_PASSWORD=your-admin-password

# App
NODE_ENV=production
CLIENT_ORIGIN=https://your-app.vercel.app
```

## 🧪 Testing

```bash
# Run linter
npm run lint

# Type check
npm run typecheck

# Build
npm run build
```

## 📊 Project Structure

```
chefs/
├── src/                    # Frontend React application
│   ├── admin/             # Admin dashboard pages
│   ├── components/        # React components
│   ├── contexts/          # React contexts
│   ├── lib/              # Utilities and API clients
│   └── types/            # TypeScript types
├── api/                   # Backend Express API
│   └── server/           # Server code
│       ├── routes/       # API routes
│       ├── middleware/   # Express middleware
│       └── services/     # Business logic
├── dist/                  # Production build
├── database.sql          # Database schema
└── vercel.json           # Vercel configuration
```

## 🔐 Security

- JWT authentication for admin area
- HTTP-only cookies
- Rate limiting on auth endpoints
- SQL injection prevention
- XSS protection headers
- CORS configuration

## 📞 Support

- **Email**: info@chefsghana.com
- **Phone**: +233 24 493 5185 / +233 24 277 7111
- **Website**: https://chefsghana.com

## 📄 License

Private - Ghana Chef Association

---

**Built with ❤️ for Ghana Chef Association**
