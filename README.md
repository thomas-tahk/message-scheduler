# Email Scheduler

A simple, clean web app for scheduling recurring emails using your Gmail account.

## What This Does

Send emails automatically on a schedule - daily reminders, weekly updates, monthly reports, or one-time messages. No complicated setup, no extra costs, just your Gmail account.

## Quick Start

```bash
cd message-scheduler
npm install
```

Follow the [QUICKSTART.md](message-scheduler/QUICKSTART.md) guide (15 minutes setup).

## Features

- ✅ Clean, minimal UI
- ✅ Recurring schedules (daily, weekly, monthly)
- ✅ Uses your Gmail account (free)
- ✅ Simple JSON file storage (no database needed)
- ✅ Multiple recipients per message
- ✅ HTML email support

## How It Works

1. **Web interface** - Create and manage schedules at http://localhost:3000
2. **Scheduler daemon** - Checks every minute and sends due emails
3. **Gmail API** - Sends from your actual Gmail account

## Requirements

- Node.js 18+
- Gmail account
- 5 minutes to set up Gmail API credentials (one-time)

## Full Documentation

See [message-scheduler/README.md](message-scheduler/README.md) for complete details.

---

**Simple, free, and effective.** 📧
