import { NextRequest, NextResponse } from 'next/server';
import { getOAuth2Client, setupGmailWatch } from '@/services/gmail';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/?auth_error=no_code', req.url));
  }

  try {
    const oauth2Client = getOAuth2Client();
    if (!oauth2Client) {
      return NextResponse.redirect(new URL('/?auth_error=not_configured', req.url));
    }

    const { tokens } = await oauth2Client.getToken(code);

    const response = NextResponse.redirect(new URL('/?auth_success=1', req.url));

    // Store tokens securely in HTTP-only cookies
    if (tokens.access_token) {
      // Register Google Pub/Sub Watch push notification subscription
      setupGmailWatch(tokens.access_token, tokens.refresh_token || undefined);

      response.cookies.set('gmail_access_token', tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 3600,
      });
    }

    if (tokens.refresh_token) {
      response.cookies.set('gmail_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 3600,
      });
    }

    return response;
  } catch (err: any) {
    console.error('OAuth callback error:', err);
    return NextResponse.redirect(new URL('/?auth_error=token_exchange_failed', req.url));
  }
}
