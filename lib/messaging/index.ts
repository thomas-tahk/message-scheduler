import { MessageType } from '@prisma/client';
import { sendEmail, SendEmailParams } from './email';
import { sendSMS, SendSMSParams } from './sms';
import { db } from '../db';

export interface SendMessageParams {
  scheduleId?: string;
  userId: string;
  type: MessageType;
  subject?: string;
  body: string;
  recipientEmail?: string;
  recipientPhone?: string;
  recipientName?: string;
}

export interface SendMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Unified message sending function
 * Handles both email and SMS, logs to database
 */
export async function sendMessage(params: SendMessageParams): Promise<SendMessageResult> {
  // Create message record in database
  const message = await db.message.create({
    data: {
      userId: params.userId,
      scheduleId: params.scheduleId || null,
      type: params.type,
      subject: params.subject || null,
      body: params.body,
      recipientEmail: params.recipientEmail || null,
      recipientPhone: params.recipientPhone || null,
      recipientName: params.recipientName || null,
      status: 'QUEUED',
    },
  });

  try {
    // Update status to SENDING
    await db.message.update({
      where: { id: message.id },
      data: { status: 'SENDING' },
    });

    let result: SendMessageResult;

    if (params.type === 'EMAIL') {
      if (!params.recipientEmail || !params.subject) {
        throw new Error('Email requires recipient email and subject');
      }

      result = await sendEmail({
        to: params.recipientEmail,
        subject: params.subject,
        body: params.body,
      });
    } else if (params.type === 'SMS') {
      if (!params.recipientPhone) {
        throw new Error('SMS requires recipient phone number');
      }

      result = await sendSMS({
        to: params.recipientPhone,
        message: params.body,
      });
    } else {
      throw new Error(`Unsupported message type: ${params.type}`);
    }

    // Update message status
    if (result.success) {
      await db.message.update({
        where: { id: message.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
          externalId: result.messageId || null,
        },
      });
    } else {
      await db.message.update({
        where: { id: message.id },
        data: {
          status: 'FAILED',
          errorMessage: result.error || 'Unknown error',
        },
      });
    }

    return result;
  } catch (error: any) {
    console.error('Send message error:', error);

    // Update message status to failed
    await db.message.update({
      where: { id: message.id },
      data: {
        status: 'FAILED',
        errorMessage: error.message,
      },
    });

    return {
      success: false,
      error: error.message,
    };
  }
}

export { sendEmail, sendSMS };
export * from './email';
export * from './sms';
