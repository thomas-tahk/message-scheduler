# Simple Email Scheduler

A clean, minimal web app for scheduling recurring emails using your Gmail account.

## Features

✅ **Simple UI** - Single-page interface to manage all schedules
✅ **Recurring Emails** - Daily, weekly, monthly, or one-time
✅ **Gmail Integration** - Uses your own Gmail account (free, no extra costs)
✅ **JSON Storage** - No database setup required
✅ **Rich Text** - Format your email messages
✅ **Multiple Recipients** - Send to one or many people

## Setup (15 minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Gmail API

You need to create Gmail API credentials to allow this app to send emails from your Gmail account.

**Step-by-step:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable the Gmail API:
   - Search for "Gmail API" in the search bar
   - Click "Enable"
4. Create OAuth 2.0 credentials:
   - Go to "Credentials" in the left sidebar
   - Click "Create Credentials" → "OAuth client ID"
   - If prompted, configure the consent screen first:
     - User type: External
     - App name: "Email Scheduler" (or whatever you want)
     - Add your email as a test user
   - Application type: "Desktop app"
   - Name: "Email Scheduler"
   - Click "Create"
5. Download the credentials:
   - Click the download icon next to your newly created OAuth client
   - Save the file as `gmail-credentials.json` in this directory

### 3. Authorize the App

Run this command to authorize the app to use your Gmail:

```bash
npm run dev
```

The app will start at http://localhost:3000

**First-time Gmail setup:**
- The app will detect that you haven't authorized yet
- Follow the OAuth flow to grant permissions
- The token will be saved to `gmail-token.json`

### 4. Start the Scheduler

Open a **second terminal** and run:

```bash
npm run scheduler
```

This starts the scheduler daemon that checks every minute for emails to send.

**Keep both terminals running:**
- Terminal 1: `npm run dev` (web interface)
- Terminal 2: `npm run scheduler` (email sender)

## Usage

1. **Open the app**: http://localhost:3000

2. **Create a schedule**:
   - Click "+ New Schedule"
   - Fill in the form:
     - **Name**: Friendly name (e.g., "Weekly team update")
     - **Subject**: Email subject line
     - **Message Body**: Email content (supports plain text and HTML)
     - **Recipients**: Comma-separated emails
     - **Recurrence**: Choose when to send
     - **Time**: What time to send (HH:MM)
   - Click "Create Schedule"

3. **Manage schedules**:
   - View all schedules on the main page
   - Enable/disable schedules with the toggle button
   - Edit existing schedules
   - Delete schedules you don't need

4. **Monitor**:
   - Check the scheduler terminal to see when emails are sent
   - "Last sent" timestamp shows in the UI

## Recurrence Options

- **One Time**: Send once on a specific date
- **Daily**: Send every day at the specified time
- **Weekly**: Send on specific days of the week
- **Monthly**: Send on a specific day of the month (1-31)

## Tips

- **HTML emails**: You can use HTML in the body for formatting:
  ```html
  <h1>Hello!</h1>
  <p>This is <strong>bold</strong> text.</p>
  ```

- **Test first**: Create a one-time schedule to yourself to test

- **Edit anytime**: You can edit schedules even after creating them

- **Disable temporarily**: Use the "Enabled/Disabled" toggle instead of deleting

## File Structure

```
message-scheduler/
├── app/                    # Next.js app
│   ├── page.tsx           # Main UI
│   └── api/schedules/     # API routes
├── lib/
│   ├── storage.ts         # JSON file storage
│   ├── gmail.ts           # Gmail integration
│   └── scheduler.ts       # Scheduling logic
├── scheduler-daemon.js    # Background scheduler
├── data.json              # Your schedules (auto-created)
├── gmail-credentials.json # Your Gmail API credentials
└── gmail-token.json       # OAuth token (auto-created)
```

## Troubleshooting

**"Gmail credentials not found"**
- Make sure `gmail-credentials.json` exists in the root directory
- Download it from Google Cloud Console

**"Gmail not authorized"**
- Run the app (`npm run dev`) and follow the OAuth flow
- Make sure you grant all permissions

**Emails not sending**
- Check that the scheduler daemon is running (`npm run scheduler`)
- Check the scheduler terminal for error messages
- Verify the schedule time matches the current time
- Make sure the schedule is "Enabled"

**Gmail daily sending limit**
- Personal Gmail: 500 emails/day
- Google Workspace: 2,000 emails/day

## Security Notes

⚠️ **NEVER commit these files to git:**
- `gmail-credentials.json` - Your OAuth client credentials
- `gmail-token.json` - Your access token
- `data.json` - Your personal schedules

These are already in `.gitignore` to protect you.

## Deployment

To run this 24/7, you'll need:
1. A server that's always on (VPS, old computer, Raspberry Pi, etc.)
2. Or use a cloud service (Railway, Render, DigitalOcean)

For cloud deployment, you'll need to set up persistent storage for the JSON files.

## Future Enhancements

Want to add features? Easy areas to extend:
- Email templates with variables
- SMS support (via Twilio - requires API key + costs money)
- Email history/logs
- Calendar view of scheduled emails
- Email open tracking

---

**Made for personal use. Simple, free, and gets the job done.** 📧
