import { NextResponse } from 'next/server';
import { processDueSchedules } from '@/lib/scheduler';

/**
 * Manual trigger for the scheduler
 * This can be called via cron job or manually
 */
export async function POST(request: Request) {
  try {
    // Optional: Add authentication/API key check here
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await processDueSchedules();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Scheduler trigger error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// Also allow GET for easy testing
export async function GET(request: Request) {
  return POST(request);
}
