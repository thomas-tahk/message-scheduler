import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

let twilioClient: ReturnType<typeof twilio> | null = null;

function getTwilioClient() {
  if (!accountSid || !authToken || !twilioPhone) {
    throw new Error('Twilio credentials not configured');
  }

  if (!twilioClient) {
    twilioClient = twilio(accountSid, authToken);
  }

  return twilioClient;
}

export interface SendSMSParams {
  to: string;
  message: string;
}

export interface SendSMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an SMS message via Twilio
 */
export async function sendSMS(params: SendSMSParams): Promise<SendSMSResult> {
  try {
    const client = getTwilioClient();

    // Format phone number (ensure it starts with +)
    let toPhone = params.to.replace(/\D/g, ''); // Remove non-digits
    if (!toPhone.startsWith('1') && toPhone.length === 10) {
      toPhone = '1' + toPhone; // Add country code for US
    }
    toPhone = '+' + toPhone;

    const message = await client.messages.create({
      body: params.message,
      from: twilioPhone,
      to: toPhone,
    });

    return {
      success: true,
      messageId: message.sid,
    };
  } catch (error: any) {
    console.error('SMS send error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send SMS',
    };
  }
}

/**
 * Check if Twilio is configured
 */
export function isTwilioConfigured(): boolean {
  return !!(accountSid && authToken && twilioPhone);
}
