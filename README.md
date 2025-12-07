# Message Scheduler - Custom Web Application

A modern, full-featured web application for scheduling emails and SMS messages with support for recurring schedules.

## What's Built

### Backend (Complete ✅)

- **Authentication System**: Email/password with JWT tokens
- **Database Schema**: PostgreSQL with Prisma ORM
  - Users, Contacts, Schedules, Messages
  - Support for one-time and recurring schedules
- **API Endpoints**:
  - `/api/auth/register` - User registration
  - `/api/auth/login` - User login
  - `/api/auth/me` - Get current user
  - `/api/schedules` - CRUD operations for schedules
  - `/api/contacts` - Manage recipients
  - `/api/scheduler` - Manual trigger for job processing
- **Messaging Services**:
  - SMS via Twilio
  - Email via Resend
  - Unified messaging interface with status tracking
- **Job Scheduler**:
  - Processes due schedules every minute
  - Handles recurring schedules (daily, weekly, monthly, yearly)
  - Automatic status updates and logging

### Frontend (Pending 🚧)
- Dashboard UI - Next steps
- Schedule creation UI - Next steps
- Contact management UI - Next steps

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens with bcrypt
- **SMS**: Twilio
- **Email**: Resend
- **Styling**: Tailwind CSS (ready to use)

## Setup Instructions

### 1. Database Setup

You have several options for PostgreSQL:

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL locally
brew install postgresql  # macOS
# or use your OS package manager

# Create database
createdb message_scheduler
```

**Option B: Railway (Free tier)**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Create new PostgreSQL database
railway login
railway init
railway add postgresql

# Get connection string
railway variables
```

**Option C: Render, Supabase, or Neon**
All offer free PostgreSQL hosting - get your connection string from their dashboard.

### 2. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and configure:

```bash
# Database - Replace with your actual connection string
DATABASE_URL="postgresql://user:password@localhost:5432/message_scheduler"

# JWT Secret - Generate with: openssl rand -base64 32
JWT_SECRET="your-super-secret-jwt-key-change-this"

# Twilio (Get from https://console.twilio.com)
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_PHONE_NUMBER="+1234567890"

# Resend (Get from https://resend.com)
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxx"
EMAIL_FROM="noreply@yourdomain.com"
```

**Getting Twilio Credentials:**
1. Sign up at https://www.twilio.com/try-twilio
2. Get $15 free trial credit
3. Buy a phone number ($1/month)
4. Get Account SID and Auth Token from dashboard

**Getting Resend API Key:**
1. Sign up at https://resend.com
2. Free tier: 100 emails/day, 3,000/month
3. Create API key in dashboard
4. Add and verify your sending domain (or use onboarding domain for testing)

### 3. Database Migration

Run Prisma migrations to set up your database:

```bash
npx prisma migrate dev --name init
```

This creates all tables (users, contacts, schedules, messages).

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Application

Development mode:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## API Usage Examples

### Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "you@example.com",
    "password": "yourpassword123",
    "name": "Your Name",
    "timezone": "America/New_York"
  }'
```

Response:
```json
{
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Create a Contact

```bash
curl -X POST http://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+15551234567"
  }'
```

### Create a One-Time Email Schedule

```bash
curl -X POST http://localhost:3000/api/schedules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "type": "EMAIL",
    "subject": "Meeting Reminder",
    "body": "Don't forget our meeting tomorrow at 2pm!",
    "recipientEmail": "john@example.com",
    "recipientName": "John Doe",
    "scheduledFor": "2025-12-03T14:00:00Z",
    "timezone": "America/New_York",
    "enabled": true
  }'
```

### Create a Recurring SMS Schedule (Daily)

```bash
curl -X POST http://localhost:3000/api/schedules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "type": "SMS",
    "body": "Daily reminder: Take your medication!",
    "recipientPhone": "+15551234567",
    "scheduledFor": "2025-12-03T09:00:00Z",
    "timezone": "America/New_York",
    "recurrence": {
      "type": "daily",
      "interval": 1,
      "endDate": "2025-12-31T23:59:59Z"
    },
    "enabled": true
  }'
```

### Create a Weekly Recurring Schedule

```bash
{
  "recurrence": {
    "type": "weekly",
    "interval": 1,
    "daysOfWeek": [1, 3, 5],
    "count": 12
  }
}
```

### Get All Schedules

```bash
curl http://localhost:3000/api/schedules \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Scheduler Setup

The scheduler needs to run every minute to process due messages.

### Option 1: Built-in Interval (Development)

For development/testing, you can add this to your app:

Create `app/scheduler-init.ts`:
```typescript
import { startScheduler } from '@/lib/scheduler';

// Start scheduler when app loads
if (process.env.NODE_ENV !== 'production') {
  startScheduler();
}
```

Import in `app/layout.tsx`.

### Option 2: Cron Job (Production)

Use a cron service to hit your scheduler endpoint every minute:

**Vercel Cron:**
Create `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/scheduler",
    "schedule": "* * * * *"
  }]
}
```

**External Cron (cron-job.org, EasyCron):**
```bash
# Add to .env
CRON_SECRET="some-random-secret-key"

# Configure cron service to hit:
# POST https://yourapp.com/api/scheduler
# Header: Authorization: Bearer YOUR_CRON_SECRET
```

**Railway/Render Cron:**
Both platforms support scheduled jobs - set up to run every minute.

## Recurrence Rules Reference

Recurrence rules are JSON objects in schedules:

**Daily (every 2 days):**
```json
{
  "type": "daily",
  "interval": 2,
  "endDate": "2025-12-31T23:59:59Z"
}
```

**Weekly (every Monday, Wednesday, Friday):**
```json
{
  "type": "weekly",
  "interval": 1,
  "daysOfWeek": [1, 3, 5],
  "count": 20
}
```

**Monthly (every 2 months on the 15th):**
```json
{
  "type": "monthly",
  "interval": 2,
  "dayOfMonth": 15,
  "endDate": "2026-06-01T00:00:00Z"
}
```

**Yearly (anniversary reminders):**
```json
{
  "type": "yearly",
  "interval": 1
}
```

## Database Schema

### User
- id, email (unique), password (hashed), name, timezone, timestamps

### Contact
- id, userId, name, email, phone, notes, timestamps

### Schedule
- id, userId, contactId (optional)
- type (EMAIL/SMS), subject, body
- recipientEmail, recipientPhone, recipientName
- scheduledFor, timezone, recurrence (JSON)
- enabled, status, lastSentAt, nextRunAt, timestamps

### Message
- id, userId, scheduleId (optional)
- type, subject, body, recipient details
- status, sentAt, deliveredAt, errorMessage, externalId
- timestamps

## Next Steps: Build the UI

The backend is complete. Now you need to build the frontend:

1. **Login/Register Pages**
2. **Dashboard** - Show upcoming schedules, quick stats
3. **Schedule Creation Form** - With recurrence options
4. **Contact Management** - List, add, edit contacts
5. **Message History** - View sent messages and status

Use Shadcn UI for components:
```bash
npx shadcn@latest init
npx shadcn@latest add button
npx shadcn@latest add form
npx shadcn@latest add calendar
npx shadcn@latest add select
```

## Development Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run Prisma Studio (database GUI)
npx prisma studio

# Generate Prisma client after schema changes
npx prisma generate

# Create new migration
npx prisma migrate dev --name your_migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## Troubleshooting

**Database connection issues:**
- Check DATABASE_URL in .env
- Ensure PostgreSQL is running
- Test connection: `npx prisma db pull`

**Twilio errors:**
- Verify Account SID and Auth Token
- Check phone number format (+1XXXXXXXXXX)
- Ensure you have credits (trial or paid)

**Resend errors:**
- Verify API key
- Check sending domain is verified
- Check free tier limits (100/day)

**Scheduler not running:**
- Check logs for errors
- Manually trigger: `curl http://localhost:3000/api/scheduler`
- Verify cron job is configured

## Security Notes

- JWT tokens expire after 7 days (configurable)
- Passwords are hashed with bcrypt (12 rounds)
- All API routes are protected with authentication
- Environment variables should never be committed
- Add CRON_SECRET for production scheduler endpoint

## Deployment

Ready to deploy? Recommended platforms:

1. **Vercel** (Frontend/API) + **Railway** (Database)
2. **Render** (All-in-one)
3. **DigitalOcean App Platform**

See DEPLOYMENT.md (to be created) for detailed deployment guides.

## License

Personal project - use as needed.

---

**Built with:** Next.js • TypeScript • Prisma • PostgreSQL • Twilio • Resend
