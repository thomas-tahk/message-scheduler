import { NextRequest, NextResponse } from 'next/server';
import { getSchedules, addSchedule } from '@/lib/storage';

export async function GET() {
  try {
    const schedules = getSchedules();
    return NextResponse.json(schedules);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newSchedule = addSchedule(body);
    return NextResponse.json(newSchedule, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 });
  }
}
