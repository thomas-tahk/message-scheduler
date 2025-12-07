import { db } from './db';
import { sendMessage } from './messaging';
import { calculateNextRun, parseRecurrenceRule } from './types';

/**
 * Process all due schedules and send messages
 */
export async function processDueSchedules() {
  const now = new Date();

  console.log(`[Scheduler] Checking for due schedules at ${now.toISOString()}`);

  try {
    // Find all enabled schedules that are due
    const dueSchedules = await db.schedule.findMany({
      where: {
        enabled: true,
        status: {
          in: ['PENDING', 'ACTIVE'],
        },
        OR: [
          // One-time schedules
          {
            recurrence: null,
            scheduledFor: {
              lte: now,
            },
            lastSentAt: null,
          },
          // Recurring schedules
          {
            NOT: {
              recurrence: null,
            },
            nextRunAt: {
              lte: now,
            },
          },
        ],
      },
      include: {
        contact: true,
      },
    });

    console.log(`[Scheduler] Found ${dueSchedules.length} due schedule(s)`);

    for (const schedule of dueSchedules) {
      try {
        console.log(`[Scheduler] Processing schedule ${schedule.id} (${schedule.type})`);

        // Send the message
        const result = await sendMessage({
          scheduleId: schedule.id,
          userId: schedule.userId,
          type: schedule.type,
          subject: schedule.subject || undefined,
          body: schedule.body,
          recipientEmail: schedule.recipientEmail || undefined,
          recipientPhone: schedule.recipientPhone || undefined,
          recipientName: schedule.recipientName || undefined,
        });

        if (result.success) {
          console.log(`[Scheduler] Successfully sent message for schedule ${schedule.id}`);

          // Handle recurring vs one-time schedules
          if (schedule.recurrence) {
            const rule = parseRecurrenceRule(schedule.recurrence);
            if (rule) {
              const nextRun = calculateNextRun(now, rule);

              if (nextRun) {
                // Update schedule for next occurrence
                await db.schedule.update({
                  where: { id: schedule.id },
                  data: {
                    lastSentAt: now,
                    nextRunAt: nextRun,
                    status: 'ACTIVE',
                  },
                });
                console.log(`[Scheduler] Next run for ${schedule.id}: ${nextRun.toISOString()}`);
              } else {
                // No more occurrences - mark as completed
                await db.schedule.update({
                  where: { id: schedule.id },
                  data: {
                    lastSentAt: now,
                    status: 'COMPLETED',
                    enabled: false,
                  },
                });
                console.log(`[Scheduler] Schedule ${schedule.id} completed (no more occurrences)`);
              }
            }
          } else {
            // One-time schedule - mark as completed
            await db.schedule.update({
              where: { id: schedule.id },
              data: {
                lastSentAt: now,
                status: 'COMPLETED',
                enabled: false,
              },
            });
            console.log(`[Scheduler] One-time schedule ${schedule.id} completed`);
          }
        } else {
          // Mark as failed
          await db.schedule.update({
            where: { id: schedule.id },
            data: {
              status: 'FAILED',
            },
          });
          console.error(`[Scheduler] Failed to send message for schedule ${schedule.id}: ${result.error}`);
        }
      } catch (error) {
        console.error(`[Scheduler] Error processing schedule ${schedule.id}:`, error);
        await db.schedule.update({
          where: { id: schedule.id },
          data: {
            status: 'FAILED',
          },
        });
      }
    }

    console.log(`[Scheduler] Finished processing ${dueSchedules.length} schedule(s)`);

    return {
      processed: dueSchedules.length,
      timestamp: now,
    };
  } catch (error) {
    console.error('[Scheduler] Error in processDueSchedules:', error);
    throw error;
  }
}

/**
 * Start the scheduler (runs every minute)
 */
export function startScheduler() {
  console.log('[Scheduler] Starting scheduler...');

  // Run immediately
  processDueSchedules().catch(console.error);

  // Then run every minute
  const interval = setInterval(() => {
    processDueSchedules().catch(console.error);
  }, 60 * 1000); // Every 60 seconds

  // Return cleanup function
  return () => {
    console.log('[Scheduler] Stopping scheduler...');
    clearInterval(interval);
  };
}
