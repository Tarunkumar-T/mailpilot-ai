import { NextRequest, NextResponse } from 'next/server';
import { addMockIncomingEmail } from '@/services/mockMail';
import { mailEventBus } from '@/services/eventBus';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.message && body.message.data) {
      const decodedData = Buffer.from(body.message.data, 'base64').toString('utf-8');
      const pushPayload = JSON.parse(decodedData);

      console.log('Real-time push event received via Webhook:', pushPayload);

      const emailAddress = pushPayload.emailAddress || 'user@mailpilot.dev';
      const historyId = pushPayload.historyId || Date.now().toString();

      // Create new message entry in mailbox store
      const newEmail = await addMockIncomingEmail(
        'TechCorp Real-Time Delivery',
        'notifications@techcorp.com',
        'New Priority Message via Push Notification',
        `Real-time message delivered via Cloud Pub/Sub webhook pipeline. History ID: ${historyId}`
      );

      // Broadcast live event to all connected browser SSE streams!
      mailEventBus.emit('new_mail', {
        type: 'new_mail',
        email: newEmail,
        subject: newEmail.subject,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({ status: 'success', received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
