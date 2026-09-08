import { google } from 'googleapis';
import { EmailMessage, MailFolder, ActiveFilters } from '@/types';

export function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/google';

  if (!clientId || !clientSecret) {
    return null;
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getAuthUrl() {
  const oauth2Client = getOAuth2Client();
  if (!oauth2Client) return null;

  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/userinfo.email',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
  });
}

export async function fetchGmailMessages(
  accessToken: string,
  refreshToken?: string,
  folder: MailFolder = 'inbox',
  filters?: ActiveFilters,
  searchQuery?: string
): Promise<EmailMessage[]> {
  const oauth2Client = getOAuth2Client();
  if (!oauth2Client) throw new Error('OAuth2 client not configured');

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  // Build query string
  const queryParts: string[] = [];
  if (folder === 'inbox') queryParts.push('in:inbox');
  if (folder === 'sent') queryParts.push('in:sent');

  if (filters?.unreadOnly) queryParts.push('is:unread');
  if (filters?.sender) queryParts.push(`from:${filters.sender}`);
  if (filters?.keyword) queryParts.push(filters.keyword);
  if (filters?.dateFrom) queryParts.push(`after:${filters.dateFrom}`);
  if (filters?.dateTo) queryParts.push(`before:${filters.dateTo}`);
  if (searchQuery) queryParts.push(searchQuery);

  const q = queryParts.join(' ');

  const res = await gmail.users.messages.list({
    userId: 'me',
    q,
    maxResults: 25,
  });

  const messages = res.data.messages || [];
  const parsedEmails: EmailMessage[] = [];

  for (const msg of messages) {
    if (!msg.id) continue;
    const detail = await gmail.users.messages.get({
      userId: 'me',
      id: msg.id,
      format: 'full',
    });

    const headers = detail.data.payload?.headers || [];
    const getHeader = (name: string) => headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

    const subject = getHeader('Subject') || '(No Subject)';
    const fromStr = getHeader('From');
    const toStr = getHeader('To');
    const dateStr = getHeader('Date');

    // Parse sender
    const senderName = fromStr.replace(/<.*>/, '').trim() || fromStr;
    const senderEmail = fromStr.match(/<(.*)>/)?.[1] || fromStr;

    // Body parsing
    let body = detail.data.snippet || '';
    if (detail.data.payload?.body?.data) {
      body = Buffer.from(detail.data.payload.body.data, 'base64').toString('utf-8');
    } else if (detail.data.payload?.parts) {
      const textPart = detail.data.payload.parts.find(p => p.mimeType === 'text/plain');
      if (textPart?.body?.data) {
        body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
      }
    }

    const labels = detail.data.labelIds || [];
    const isUnread = labels.includes('UNREAD');

    parsedEmails.push({
      id: msg.id,
      threadId: detail.data.threadId || msg.id,
      sender: { name: senderName, email: senderEmail },
      recipients: [{ name: toStr, email: toStr }],
      subject,
      snippet: detail.data.snippet || '',
      body,
      date: new Date(dateStr || Date.now()).toISOString(),
      isUnread,
      folder: labels.includes('SENT') ? 'sent' : 'inbox',
      labels,
    });
  }

  return parsedEmails;
}

export async function sendGmailMessage(
  accessToken: string,
  refreshToken: string | undefined,
  to: string,
  subject: string,
  body: string
): Promise<string> {
  const oauth2Client = getOAuth2Client();
  if (!oauth2Client) throw new Error('OAuth2 client not configured');

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  const messageParts = [
    `To: ${to}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${subject}`,
    '',
    body,
  ];

  const rawMessage = Buffer.from(messageParts.join('\n'))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: rawMessage,
    },
  });

  return res.data.id || 'sent-success';
}

export async function setupGmailWatch(accessToken: string, refreshToken?: string): Promise<any> {
  const oauth2Client = getOAuth2Client();
  if (!oauth2Client) return null;

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  const topicName = process.env.GMAIL_PUBSUB_TOPIC || 'projects/mailpilot-ai-prod/topics/gmail-push-topic';

  try {
    const res = await gmail.users.watch({
      userId: 'me',
      requestBody: {
        topicName,
        labelIds: ['INBOX'],
      },
    });
    return res.data;
  } catch (err: any) {
    console.warn('Gmail watch subscription warning:', err.message);
    return null;
  }
}
