const cron = require('node-cron');

// Import the scheduler (we'll use dynamic import for ESM compatibility)
async function startScheduler() {
  const { processSchedules } = await import('./lib/scheduler.js');

  console.log('📧 Email Scheduler Daemon Started');
  console.log('Checking for schedules every minute...\n');

  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      await processSchedules();
    } catch (error) {
      console.error('Scheduler error:', error);
    }
  });

  // Also run immediately on start
  try {
    await processSchedules();
  } catch (error) {
    console.error('Initial run error:', error);
  }
}

startScheduler();
