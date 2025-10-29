 ==========

# Admin Dashboard – Phased Implementation Plan

 Admin URL: https://chefsghana.com/admin (SPA mounted at /admin using React Router basename="/admin"). Server must rewrite /admin/* to index.html in production.

 ## Environment variables (new or updates)
 Add/update these in .env for admin auth, CORS and cookies:
 - CLIENT_ORIGIN=https://chefsghana.com
 - VITE_API_BASE_URL=https://chefsghana.com (or your API origin)
 - ADMIN_BASE_PATH=/admin
 - JWT_SECRET=your-super-secret-jwt-key-min-32-chars (already present)
 - AUTH_JWT_EXPIRES=1d
 - AUTH_COOKIE_NAME=chefs_admin_token
 - COOKIE_DOMAIN=chefsghana.com
 - COOKIE_SECURE=true
 - ADMIN_SEED_EMAIL=admin@chefsghana.com
 - ADMIN_SEED_PASSWORD=change-this-strong-password
 Optional (CSV and limits):
 - EXPORT_CSV_CHUNK_SIZE=5000
 - IMPORT_CSV_MAX_ROWS=20000

 Ensure CLIENT_ORIGIN includes your public origin(s) if multiple (comma‑separated).

 ## Database migrations (high level)
 - admins: id PK, email (unique), password_hash, role ENUM('viewer','editor','admin') DEFAULT 'admin', is_active BOOL, last_login_at, created_at, updated_at.
 - Indexes for registrations.created_at, registrations.membership_expiry, payments.paid_at.

 ---
 
 ## Phase 0 – Foundations (env, rewrites, migrations)
 - Add env keys above; set CLIENT_ORIGIN to production origin.
 - Add admins table and seed first admin using ADMIN_SEED_*.
 - Configure production rewrite so /admin/* serves index.html.

 ## Phase 1 – Auth backend (JWT in HttpOnly cookie)
 - POST /api/auth/login (bcrypt compare, sets HttpOnly cookie).
 - GET /api/auth/me (returns admin and role).
 - POST /api/auth/logout (clears cookie).
 - requireAdmin middleware + optional role gates.

 ## Phase 2 – Admin shell (frontend)
 - Introduce React Router with basename "/admin".
 - AdminLayout: left sidebar (Dashboard, Registrations, Users, Payments, Membership Types, Email Logs, Renewals, Settings, Logout).
 - Login page + route guard using /api/auth/me.

 ## Phase 3 – Stats API + Dashboard
 - Endpoints: 
   - GET /api/admin/stats/summary (today/week/month counts, revenue, pending approvals, renewals due 7/30/60).
   - GET /api/admin/stats/membership-types?period=week|month (breakdown).
   - GET /api/admin/stats/registrations-trend?days=30.
 - UI: KPI cards, bar/pie charts (recharts), trend lines.

 ## Phase 4 – Users module
 - API: GET/POST/PATCH/DELETE /api/users (soft‑delete with audit), GET /api/users/:id, /:id/registrations, /:id/payments.
 - UI: list (search/filter/pagination), Add User, Delete, Edit basics.
 - Detail page: photo, IDs, contact, joined date, membership history, payments, renewal badge.

 ## Phase 5 – Registrations module
 - API: GET /api/registrations (filters), GET /api/registrations/:id, PATCH /api/registrations/:id (status/notes), POST /api/registrations/:id/resend-email.
 - UI: list + detail drawer; approve/reject; view profile photo and payment.

 ## Phase 6 – Payments module (read‑only)
 - API: GET /api/payments, GET /api/payments/:id.
 - UI: list + detail, link to user/registration.

 ## Phase 7 – Membership Types
 - API: POST/PATCH/DELETE /api/membership-types; toggle is_active.
 - UI: CRUD form, validation.

 ## Phase 8 – Email Logs
 - API: GET /api/email-notifications, POST /api/email-notifications/:id/resend.
 - UI: list, view body (modal), resend.

 ## Phase 9 – Renewals tracking
 - Use registrations.membership_expiry for status (Active, Due soon, Overdue).
 - API: GET /api/renewals?status=due|overdue&windowDays=30.
 - UI: Renewals view, badges on users/regs; optional export.

 ## Phase 10 – CSV export & import
 - Export endpoints: GET /api/admin/exports/users.csv, /exports/payments.csv (date range, streamed CSV).
 - Import endpoints: POST /api/admin/import/users, /import/payments; validate + dry‑run; report errors; profile_photo_url is path only.
 - UI: Export buttons; Import modal with progress and error report download.

 ## Phase 11 – Hardening, QA, deploy
 - Rate‑limit login, audit logs, input validation (zod/express‑validator), pagination caps.
 - E2E smoke for login and protected pages; build & deploy; verify /admin deep‑linking.

 ## Acceptance criteria (summary)
 - Admin can log in/out; all admin pages protected.
 - Dashboard shows accurate KPIs and charts for today/week/month.
 - Users/Registrations/Payments/Membership Types functional as described.
 - Renewals view highlights due/overdue; dates are correct.
 - CSV export/import works with validation and clear reporting.
