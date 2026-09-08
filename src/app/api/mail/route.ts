import { NextRequest, NextResponse } from 'next/server';
import { fetchGmailMessages } from '@/services/gmail';
import { getMockEmails } from '@/services/mockMail';
import { ActiveFilters, MailFolder } from '@/types';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const folder = (url.searchParams.get('folder') || 'inbox') as MailFolder;
  const searchQuery = url.searchParams.get('search') || '';
  const filtersRaw = url.searchParams.get('filters') || '{}';

  let filters: ActiveFilters = {};
  try {
    filters = JSON.parse(filtersRaw);
  } catch (e) {}

  const accessToken = req.cookies.get('gmail_access_token')?.value;
  const refreshToken = req.cookies.get('gmail_refresh_token')?.value;

  if (accessToken) {
    try {
      const realEmails = await fetchGmailMessages(accessToken, refreshToken, folder, filters, searchQuery);
      return NextResponse.json({ emails: realEmails, provider: 'gmail' });
    } catch (err: any) {
      console.warn('Gmail API error, returning fallback store:', err.message);
    }
  }

  // Fallback to internal seed emails
  const mockEmails = await getMockEmails(folder, filters, searchQuery);
  return NextResponse.json({ emails: mockEmails, provider: 'mock' });
}
