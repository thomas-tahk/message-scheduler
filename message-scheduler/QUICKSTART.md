# Quick Start Guide

Get your email scheduler running in 15 minutes.

## Step 1: Install (1 min)

```bash
cd message-scheduler
npm install
```

## Step 2: Gmail API Setup (10 min)

### Create Gmail API Credentials

1. **Go to**: https://console.cloud.google.com/
2. **Create a new project**: Click the project dropdown → "New Project"
   - Name it "Email Scheduler" or anything you want
3. **Enable Gmail API**:
   - Search for "Gmail API" in the search bar at the top
   - Click "Gmail API" → Click "Enable"
4. **Create OAuth credentials**:
   - Click "Credentials" in the left sidebar
   - Click "+ CREATE CREDENTIALS" → "OAuth client ID"
   - If prompted to configure consent screen:
     - Choose "External"
     - App name: "Email Scheduler"
     - User support email: your email
     - Developer email: your email
     - Click "Save and Continue" through all steps
     - Add yourself as a test user
   - Back to creating OAuth client:
     - Application type: **"Desktop app"**
     - Name: "Email Scheduler"
     - Click "Create"
5. **Download the credentials**:
   - Click the ⬇️ download icon next to your OAuth client
   - Rename the downloaded file to: `gmail-credentials.json`
   - Move it to the `message-scheduler/` folder

## Step 3: Start the App (2 min)

Open **Terminal 1**:
```bash
npm run dev
```

This starts the web interface at http://localhost:3000

**First time only:** You'll need to authorize Gmail access:
- The app will show a link to authorize
- Click it, sign in with your Gmail account
- Grant permissions
- The token will be saved automatically

## Step 4: Start the Scheduler (1 min)

Open **Terminal 2** (keep Terminal 1 running):
```bash
npm run scheduler
```

This checks every minute for emails to send.

## Step 5: Create Your First Schedule (1 min)

1. Go to http://localhost:3000
2. Click "+ New Schedule"
3. Fill in:
   - **Name**: "Test Email"
   - **Subject**: "Testing Email Scheduler"
   - **Message**: "Hello! This is a test."
   - **Recipients**: your.email@gmail.com
   - **Recurrence**: One Time
   - **Date**: Today
   - **Time**: 2 minutes from now
4. Click "Create Schedule"

Watch Terminal 2 - you'll see it send the email in ~2 minutes!

## You're Done! 🎉

Now you can:
- Create recurring schedules (daily, weekly, monthly)
- Add multiple recipients
- Edit or disable schedules anytime
- Use HTML for formatted emails

## Daily Use

Every time you want to use the scheduler:
1. Open Terminal 1: `npm run dev`
2. Open Terminal 2: `npm run scheduler`
3. Go to http://localhost:3000
4. Manage your schedules

---

**Need help?** Check the full README.md
