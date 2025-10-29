# Ghana Chef Association - API Server

Backend API server for the Ghana Chef Association registration system.

## Tech Stack

- **Node.js** 18+
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **Nodemailer** - Email notifications

## Environment Variables

Create a `.env` file with these variables:

```env
# Database
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=chefs_db
MYSQL_USER=your_db_user
MYSQL_PASSWORD=your_db_password

# Email
EMAIL_HOST=mail.chefsghana.com
EMAIL_PORT=587
EMAIL_USER=info@chefsghana.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=info@chefsghana.com

# Security
JWT_SECRET=your-super-secret-min-32-chars

# Admin
ADMIN_SEED_EMAIL=admin@chefsghana.com
ADMIN_SEED_PASSWORD=your-admin-password

# App
CLIENT_ORIGIN=https://chefsghana.com
NODE_ENV=production
API_PORT=4000
```

## Installation

```bash
npm install
```

## Running Locally

```bash
npm start
```

Server will run on `http://localhost:4000`

## Deployment

See main project documentation for deployment instructions.

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/auth/login` - Admin login
- `GET /api/admin/stats` - Admin dashboard stats
- `GET /api/admin/users` - List users
- `GET /api/admin/registrations` - List registrations
- `GET /api/admin/payments` - List payments
- And more...

## License

Private - Ghana Chef Association
