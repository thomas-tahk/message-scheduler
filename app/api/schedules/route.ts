import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/middleware';
import { calculateNextRun, parseRecurrenceRule } from '@/lib/types';

// GET /api/schedules - List all schedules
export async function GET(request: Request) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const schedules = await db.schedule.findMany({
      where: {
        userId: auth.user.userId,
        ...(status && { status }),
        ...(type && { type }),
      },
      include: {
        contact: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        scheduledFor: 'asc',
      },
    });

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error('Get schedules error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    );
  }
}

// POST /api/schedules - Create a new schedule
export async function POST(request: Request) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const {
      contactId,
      type,
      subject,
      body: messageBody,
      recipientEmail,
      recipientPhone,
      recipientName,
      scheduledFor,
      timezone,
      recurrence,
      enabled = true,
    } = body;

    // Validation
    if (!type || !messageBody || !scheduledFor) {
      return NextResponse.json(
        { error: 'Type, body, and scheduledFor are required' },
        { status: 400 }
      );
    }

    if (type === 'EMAIL' && !subject) {
      return NextResponse.json(
        { error: 'Subject is required for emails' },
        { status: 400 }
      );
    }

    // Determine recipient from contact or direct input
    let finalRecipientEmail = recipientEmail;
    let finalRecipientPhone = recipientPhone;
    let finalRecipientName = recipientName;

    if (contactId) {
      const contact = await db.contact.findFirst({
        where: {
          id: contactId,
          userId: auth.user.userId,
        },
      });

      if (!contact) {
        return NextResponse.json(
          { error: 'Contact not found' },
          { status: 404 }
        );
      }

      finalRecipientEmail = contact.email || recipientEmail;
      finalRecipientPhone = contact.phone || recipientPhone;
      finalRecipientName = contact.name || recipientName;
    }

    // Validate recipient based on type
    if (type === 'EMAIL' && !finalRecipientEmail) {
      return NextResponse.json(
        { error: 'Recipient email is required for email messages' },
        { status: 400 }
      );
    }

    if (type === 'SMS' && !finalRecipientPhone) {
      return NextResponse.json(
        { error: 'Recipient phone is required for SMS messages' },
        { status: 400 }
      );
    }

    // Calculate nextRunAt for recurring schedules
    const scheduledDate = new Date(scheduledFor);
    let nextRunAt = scheduledDate;

    if (recurrence) {
      const rule = parseRecurrenceRule(recurrence);
      if (rule) {
        nextRunAt = calculateNextRun(scheduledDate, rule) || scheduledDate;
      }
    }

    // Create schedule
    const schedule = await db.schedule.create({
      data: {
        userId: auth.user.userId,
        contactId: contactId || null,
        type,
        subject: type === 'EMAIL' ? subject : null,
        body: messageBody,
        recipientEmail: finalRecipientEmail,
        recipientPhone: finalRecipientPhone,
        recipientName: finalRecipientName,
        scheduledFor: scheduledDate,
        timezone: timezone || 'America/New_York',
        recurrence: recurrence || null,
        enabled,
        status: 'PENDING',
        nextRunAt: recurrence ? nextRunAt : null,
      },
      include: {
        contact: true,
      },
    });

    return NextResponse.json({ schedule }, { status: 201 });
  } catch (error) {
    console.error('Create schedule error:', error);
    return NextResponse.json(
      { error: 'Failed to create schedule' },
      { status: 500 }
    );
  }
}
