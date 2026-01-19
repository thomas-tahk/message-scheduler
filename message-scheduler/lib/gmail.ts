import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
const TOKEN_PATH = path.join(process.cwd(), 'gmail-token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'gmail-credentials.json');

export async function sendEmail(
  to: string[],
  subject: string,
  body: string
): Promise<void> {
  try {
    const auth = await authorize();
    const gmail = google.gmail({ version: 'v1', auth });

    const message = createMessage(to, subject, body);

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: message,
      },
    });

    console.log(`Email sent to: ${to.join(', ')}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

async function authorize() {
  // Check if we have previously stored a token
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials(token);
    return oauth2Client;
  }

  // If no token, we need credentials
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error(
      'Gmail credentials not found. Please set up Gmail API credentials first.'
    );
  }

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;

  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // This will need to be set up via a setup flow
  throw new Error('Gmail not authorized. Please run the setup flow.');
}

function createMessage(to: string[], subject: string, body: string): string {
  const messageParts = [
    `To: ${to.join(', ')}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${subject}`,
    '',
    body,
  ];

  const message = messageParts.join('\n');
  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return encodedMessage;
}

export async function getAuthUrl(): Promise<string> {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error('Gmail credentials not found');
  }

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;

  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  return authUrl;
}

export async function saveToken(code: string): Promise<void> {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;

  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  const { tokens } = await oauth2Client.getToken(code);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
}
