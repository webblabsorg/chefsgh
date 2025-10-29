Proceeded: Users module (API + UI), plus login reset UX

   •  Admin credentials:
     •  Use ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD from your .env for initial login. You can reset via “Forgot password”.
   •  Added password reset:
     •  New env: AUTH_RESET_EXPIRES=15m. Routes: POST /api/auth/forgot (sends email), POST /api/auth/reset (token + new
        password). Login page now centered on white with visible fonts and “Forgot password?” link; added /admin/forgot and
        /admin/reset pages.

   •  Users API (protected):
     •  GET /api/users — paginate + search by name/email/phone, with latest membership_status/expiry.
     •  GET /api/users/:id — full user + membership history (type, status, expiry, payment).
     •  POST /api/users — create (validates required fields).
     •  PATCH /api/users/:id — update basic fields.
     •  DELETE /api/users/:id — deletes only if no registrations (else 409).

   •  Admin UI:
     •  Users list at /admin/users with search, paging, delete action, and clickable names.
     •  User detail at /admin/users/:id showing photo, IDs, contact, joined date, and membership history including renewal dates.

   Build updated (dist/). Ready to move on to Registrations/Payments pages and CSV export/import when you’re ready.