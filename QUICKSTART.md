# Quick Start Guide

Get your message scheduler running in 10 minutes.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or hosted)
- Twilio account (for SMS)
- Resend account (for email)

## Step 1: Install Dependencies

```bash
cd message-scheduler
npm install
```

## Step 2: Set Up Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```bash
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="run: openssl rand -base64 32"
TWILIO_ACCOUNT_SID="your_twilio_sid"
TWILIO_AUTH_TOKEN="your_twilio_token"
TWILIO_PHONE_NUMBER="+1234567890"
RESEND_API_KEY="your_resend_key"
EMAIL_FROM="noreply@yourdomain.com"
```

## Step 3: Set Up Database

```bash
npx prisma migrate dev --name init
```

## Step 4: Start the App

```bash
npm run dev
```

App runs at `http://localhost:3000`

## Step 5: Test the API

### Create a user:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

Save the `token` from the response.

### Create a schedule:
```bash
curl -X POST http://localhost:3000/api/schedules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "type": "EMAIL",
    "subject": "Test Message",
    "body": "This is a test!",
    "recipientEmail": "recipient@example.com",
    "scheduledFor": "2025-12-02T14:00:00Z"
  }'
```

### Manually trigger the scheduler:
```bash
curl http://localhost:3000/api/scheduler
```

## What's Next?

- Build the UI (see README.md)
- Set up automatic scheduler (cron job)
- Deploy to production

See README.md for complete documentation.
