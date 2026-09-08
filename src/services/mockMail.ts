import { EmailMessage, MailFolder, ActiveFilters } from '@/types';

// Initial seed emails covering assessment examples (IBM, Rahul, HR, Interview, Assessment)
let mockEmailsStore: EmailMessage[] = [
  {
    id: 'msg-techcorp-101',
    threadId: 'thread-techcorp-101',
    sender: { name: 'TechCorp Talent Acquisition', email: 'recruitment@techcorp.com' },
    recipients: [{ name: 'Candidate', email: 'user@mailpilot.dev' }],
    subject: 'TechCorp Software Developer Assessment Instructions',
    snippet: 'Dear Candidate, Please complete the online technical assessment by the end of this week...',
    body: `Dear Candidate,

Thank you for applying for the Senior Software Engineer position at TechCorp.

We are pleased to invite you to the online technical assessment phase. Please find your unique access link below. You have 7 days to complete the assessment.

Assessment Module: Fullstack Architecture & AI Systems
Time Limit: 90 Minutes

Let us know if you have any questions or require special accommodations.

Best regards,
TechCorp Talent Acquisition Team`,
    date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    isUnread: true,
    folder: 'inbox',
    labels: ['INBOX', 'UNREAD', 'IMPORTANT'],
  },
  {
    id: 'msg-rahul-102',
    threadId: 'thread-rahul-102',
    sender: { name: 'Rahul Sharma', email: 'rahul.sharma@techcorp.com' },
    recipients: [{ name: 'You', email: 'user@mailpilot.dev' }],
    subject: 'MailPilot Project Review Status',
    snippet: 'Hi, just checking in on the progress of the MailPilot AI mail application review...',
    body: `Hi,

I hope you are doing well!

Just wanted to check in on the progress of the MailPilot AI application. The team is eager to review the functional build and test the AI UI control features.

Could you send over an update on when it will be ready for final code review?

Thanks,
Rahul Sharma
Engineering Lead`,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    isUnread: false,
    folder: 'inbox',
    labels: ['INBOX'],
  },
  {
    id: 'msg-hr-103',
    threadId: 'thread-hr-103',
    sender: { name: 'HR Recruitment', email: 'hr@techhub.org' },
    recipients: [{ name: 'You', email: 'user@mailpilot.dev' }],
    subject: 'Upcoming Technical Interview Schedule',
    snippet: 'Congratulations! Your application has been shortlisted for the final interview round...',
    body: `Hello,

We are delighted to inform you that your application has passed the initial screening!

Your final technical interview has been scheduled for Friday at 3:00 PM IST. The session will cover system design, AI tool integrations, and real-time state architecture.

Please confirm if this schedule works for you.

Warm regards,
HR Operations Team`,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), // 4 days ago
    isUnread: true,
    folder: 'inbox',
    labels: ['INBOX', 'UNREAD'],
  },
  {
    id: 'msg-cloud-104',
    threadId: 'thread-cloud-104',
    sender: { name: 'Cloud Services Platform', email: 'no-reply@cloudprovider.com' },
    recipients: [{ name: 'You', email: 'user@mailpilot.dev' }],
    subject: 'Cloud Pub/Sub Webhook Subscription Confirmed',
    snippet: 'Your Cloud Pub/Sub subscription for real-time mailbox events has been activated successfully...',
    body: `Hello Developer,

Your Cloud Pub/Sub notification pipeline has been established. Real-time push webhooks are now active for user@mailpilot.dev.

Project ID: mailpilot-ai-prod
Topic: projects/mailpilot-ai-prod/topics/gmail-push-topic

You will receive push notifications whenever new mail arrives.

Regards,
Cloud Infrastructure Team`,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(), // 6 days ago
    isUnread: false,
    folder: 'inbox',
    labels: ['INBOX'],
  },
  {
    id: 'msg-sent-201',
    threadId: 'thread-sent-201',
    sender: { name: 'You', email: 'user@mailpilot.dev' },
    recipients: [{ name: 'Rahul Sharma', email: 'rahul.sharma@techcorp.com' }],
    subject: 'Re: MailPilot Project Review Status',
    snippet: 'Hi Rahul, The core architecture is complete and AI tool control is fully integrated...',
    body: `Hi Rahul,

The core architecture is complete! The AI assistant actively controls the application UI, handles search/filters, and manages compose & reply state seamlessly.

I will send over the final demo link shortly.

Best regards,
Lead Software Engineer`,
    date: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    isUnread: false,
    folder: 'sent',
    labels: ['SENT'],
  },
  {
    id: 'msg-sent-202',
    threadId: 'thread-sent-202',
    sender: { name: 'You', email: 'user@mailpilot.dev' },
    recipients: [{ name: 'TechCorp Recruitment', email: 'recruitment@techcorp.com' }],
    subject: 'Re: TechCorp Software Developer Assessment Instructions',
    snippet: 'Hi TechCorp Team, Thank you for the assessment invitation. I will complete it by tomorrow...',
    body: `Hi TechCorp Team,

Thank you for sending over the technical assessment details. I have received the access link and will complete the assessment module by tomorrow.

Best regards,
Candidate`,
    date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    isUnread: false,
    folder: 'sent',
    labels: ['SENT'],
  },
];

export async function getMockEmails(
  folder: MailFolder = 'inbox',
  filters?: ActiveFilters,
  searchQuery?: string
): Promise<EmailMessage[]> {
  let result = mockEmailsStore.filter(email => email.folder === folder);

  if (searchQuery && searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase();
    result = result.filter(
      e =>
        e.subject.toLowerCase().includes(q) ||
        e.snippet.toLowerCase().includes(q) ||
        e.body.toLowerCase().includes(q) ||
        e.sender.name.toLowerCase().includes(q) ||
        e.sender.email.toLowerCase().includes(q) ||
        e.recipients.some(r => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q))
    );
  }

  if (filters) {
    if (filters.unreadOnly) {
      result = result.filter(e => e.isUnread);
    }
    if (filters.sender && filters.sender.trim() !== '') {
      const s = filters.sender.toLowerCase();
      result = result.filter(
        e =>
          e.sender.name.toLowerCase().includes(s) ||
          e.sender.email.toLowerCase().includes(s) ||
          e.recipients.some(r => r.name.toLowerCase().includes(s) || r.email.toLowerCase().includes(s))
      );
    }
    if (filters.keyword && filters.keyword.trim() !== '') {
      const k = filters.keyword.toLowerCase();
      result = result.filter(
        e => e.subject.toLowerCase().includes(k) || e.body.toLowerCase().includes(k)
      );
    }
    if (filters.relativeDays && filters.relativeDays > 0) {
      const cutoff = Date.now() - filters.relativeDays * 24 * 60 * 60 * 1000;
      result = result.filter(e => new Date(e.date).getTime() >= cutoff);
    }
  }

  // Sort descending by date
  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function addMockSentEmail(to: string, subject: string, body: string): Promise<EmailMessage> {
  const newEmail: EmailMessage = {
    id: `msg-sent-${Date.now()}`,
    threadId: `thread-sent-${Date.now()}`,
    sender: { name: 'You', email: 'user@mailpilot.dev' },
    recipients: [{ name: to, email: to }],
    subject,
    snippet: body.substring(0, 100) + '...',
    body,
    date: new Date().toISOString(),
    isUnread: false,
    folder: 'sent',
    labels: ['SENT'],
  };

  mockEmailsStore.unshift(newEmail);
  return newEmail;
}

export async function addMockIncomingEmail(fromName: string, fromEmail: string, subject: string, body: string): Promise<EmailMessage> {
  const newEmail: EmailMessage = {
    id: `msg-in-${Date.now()}`,
    threadId: `thread-in-${Date.now()}`,
    sender: { name: fromName, email: fromEmail },
    recipients: [{ name: 'You', email: 'user@mailpilot.dev' }],
    subject,
    snippet: body.substring(0, 100) + '...',
    body,
    date: new Date().toISOString(),
    isUnread: true,
    folder: 'inbox',
    labels: ['INBOX', 'UNREAD'],
  };

  mockEmailsStore.unshift(newEmail);
  return newEmail;
}
