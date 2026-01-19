import { getSchedules, updateSchedule, Schedule } from './storage';
import { sendEmail } from './gmail';

export async function processSchedules(): Promise<void> {
  console.log('Checking for due schedules...');
  const schedules = getSchedules();
  const now = new Date();

  for (const schedule of schedules) {
    if (!schedule.enabled) continue;

    if (shouldSendNow(schedule, now)) {
      try {
        console.log(`Sending: ${schedule.name}`);
        await sendEmail(schedule.recipients, schedule.subject, schedule.body);

        updateSchedule(schedule.id, {
          lastSent: now.toISOString(),
        });

        console.log(`✓ Sent: ${schedule.name}`);
      } catch (error) {
        console.error(`✗ Failed to send ${schedule.name}:`, error);
      }
    }
  }
}

function shouldSendNow(schedule: Schedule, now: Date): boolean {
  const { recurrence, lastSent } = schedule;

  // Parse schedule time
  const [hours, minutes] = recurrence.time.split(':').map(Number);
  const nowHours = now.getHours();
  const nowMinutes = now.getMinutes();

  // Check if we're in the right minute
  const isRightTime = nowHours === hours && nowMinutes === minutes;
  if (!isRightTime) return false;

  // If already sent in the last 2 minutes, skip (prevent duplicates)
  if (lastSent) {
    const lastSentDate = new Date(lastSent);
    const diffMinutes = (now.getTime() - lastSentDate.getTime()) / (1000 * 60);
    if (diffMinutes < 2) return false;
  }

  // Check recurrence type
  switch (recurrence.type) {
    case 'once':
      if (!recurrence.startDate) return false;
      const startDate = new Date(recurrence.startDate);
      const isSameDay =
        startDate.getFullYear() === now.getFullYear() &&
        startDate.getMonth() === now.getMonth() &&
        startDate.getDate() === now.getDate();
      return isSameDay && !lastSent;

    case 'daily':
      return true;

    case 'weekly':
      const dayOfWeek = now.getDay();
      return recurrence.daysOfWeek?.includes(dayOfWeek) || false;

    case 'monthly':
      const dayOfMonth = now.getDate();
      return dayOfMonth === recurrence.dayOfMonth;

    default:
      return false;
  }
}
