import { NextRequest, NextResponse } from 'next/server';
import { sendGmailMessage } from '@/services/gmail';
import { addMockSentEmail } from '@/services/mockMail';

export async function POST(req: NextRequest) {
  try {
    const { to, subject, body } = await req.json();

    if (!to || !subject) {
      return NextResponse.json({ error: 'Missing required fields (to, subject)' }, { status: 400 });
    }

    const accessToken = req.cookies.get('gmail_access_token')?.value;
    const refreshToken = req.cookies.get('gmail_refresh_token')?.value;

    if (accessToken) {
      try {
        const messageId = await sendGmailMessage(accessToken, refreshToken, to, subject, body);
        return NextResponse.json({ success: true, messageId, provider: 'gmail' });
      } catch (err: any) {
        console.warn('Gmail API send failed, utilizing fallback store:', err.message);
      }
    }

    // Fallback store dispatch
    const sentItem = await addMockSentEmail(to, subject, body);
    return NextResponse.json({ success: true, email: sentItem, provider: 'mock' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
