import { NextRequest, NextResponse } from 'next/server';
import { getAuthUrl } from '@/services/gmail';

export async function GET(req: NextRequest) {
  try {
    const authUrl = getAuthUrl();
    if (!authUrl) {
      // Redirect back to home with user-friendly notice instead of raw JSON error
      return NextResponse.redirect(new URL('/?oauth_notice=missing_credentials', req.url));
    }
    return NextResponse.redirect(authUrl);
  } catch (err: any) {
    return NextResponse.redirect(new URL(`/?oauth_notice=${encodeURIComponent(err.message)}`, req.url));
  }
}
