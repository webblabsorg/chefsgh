import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import membershipRouter from './routes/membership.js';
import registrationRouter from './routes/registrations.js';
import webhookRouter from './routes/webhook.js';
import { seedInitialAdmin } from './services/adminSeed.js';
import authRouter from './routes/auth.js';
import adminStatsRouter from './routes/adminStats.js';
import adminRegistrationsRouter from './routes/adminRegistrations.js';
import adminPaymentsRouter from './routes/adminPayments.js';
import adminMembershipTypesRouter from './routes/adminMembershipTypes.js';
import adminEmailNotificationsRouter from './routes/adminEmailNotifications.js';
import adminRenewalsRouter from './routes/adminRenewals.js';
import adminExportsRouter from './routes/adminExports.js';
import adminImportsRouter from './routes/adminImports.js';
import { securityHeaders } from './middleware/securityHeaders.js';
import usersRouter from './routes/users.js';

dotenv.config();

const app = express();
app.set('trust proxy', 1);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const corsOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map((origin) => origin.trim())
  : '*';

app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(securityHeaders());

// Webhook route must come BEFORE express.json() to receive raw body for signature verification
app.use('/api', webhookRouter);

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(uploadDir));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/admin/stats', adminStatsRouter);
app.use('/api/admin/registrations', adminRegistrationsRouter);
app.use('/api/admin/payments', adminPaymentsRouter);
app.use('/api/admin/membership-types', adminMembershipTypesRouter);
app.use('/api/admin/email-notifications', adminEmailNotificationsRouter);
app.use('/api/admin/renewals', adminRenewalsRouter);
app.use('/api/admin/exports', adminExportsRouter);
app.use('/api/admin/import', adminImportsRouter);
app.use('/api/users', usersRouter);
app.use('/api/membership-types', membershipRouter);
app.use('/api/registrations', registrationRouter);

// Serve Admin SPA under /admin (production)
try {
  const distDir = path.resolve(__dirname, '../../dist');
  if (fs.existsSync(distDir)) {
    // Serve built assets for Admin SPA absolute paths
    app.use('/assets', express.static(path.join(distDir, 'assets')));
    app.use('/admin', express.static(distDir));
    app.get(['/admin', '/admin/*'], (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }
} catch (e) {
  console.warn('Admin SPA not found; skipping /admin static serve');
}

const port = process.env.API_PORT ? Number(process.env.API_PORT) : 4000;

// Seed initial admin if configured
seedInitialAdmin().catch(() => {});

// Only start server if not in serverless environment (Vercel)
if (process.env.VERCEL !== '1') {
  app.listen(port, () => {
    console.log(`API server listening on port ${port}`);
  });
}

// Export for Vercel serverless
export default app;
