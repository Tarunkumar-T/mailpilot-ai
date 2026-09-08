export const AI_TOOL_DEFINITIONS = [
  {
    name: 'searchEmails',
    description: 'Search and filter the main email list visible on screen using natural language queries.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'General keyword or text query' },
        sender: { type: 'string', description: 'Filter emails by sender name or email address (e.g., IBM, Rahul)' },
        keyword: { type: 'string', description: 'Specific keyword in subject or body (e.g., assessment, interview)' },
        unreadOnly: { type: 'boolean', description: 'If true, shows only unread emails' },
        relativeDays: { type: 'number', description: 'Filter emails from the last N days (e.g., 7 for last 7 days)' },
      },
    },
  },
  {
    name: 'openEmail',
    description: 'Open and display a specific email in full detail view. Can accept an email ID, index number (0 = latest), sender name, or subject keyword.',
    parameters: {
      type: 'object',
      properties: {
        identifier: {
          type: 'string',
          description: 'Email ID, position (0 for latest email), sender name, or subject keyword',
        },
      },
      required: ['identifier'],
    },
  },
  {
    name: 'navigateToFolder',
    description: 'Navigate to a specific mail folder in the UI (inbox or sent).',
    parameters: {
      type: 'object',
      properties: {
        folder: { type: 'string', enum: ['inbox', 'sent', 'drafts', 'trash'], description: 'Folder to navigate to' },
      },
      required: ['folder'],
    },
  },
  {
    name: 'openCompose',
    description: 'Open the Compose email interface and pre-fill the To, Subject, and Body fields.',
    parameters: {
      type: 'object',
      properties: {
        to: { type: 'string', description: 'Recipient email address or name' },
        subject: { type: 'string', description: 'Email subject line' },
        body: { type: 'string', description: 'Email message body text' },
      },
      required: ['to', 'subject', 'body'],
    },
  },
  {
    name: 'replyToEmail',
    description: 'Reply to the currently open/selected email. Automatically populates recipient and subject line using current context.',
    parameters: {
      type: 'object',
      properties: {
        body: { type: 'string', description: 'The reply message content generated for the email' },
      },
      required: ['body'],
    },
  },
  {
    name: 'applyFilters',
    description: 'Apply specific structured UI filter chips to the main email list.',
    parameters: {
      type: 'object',
      properties: {
        sender: { type: 'string', description: 'Sender filter' },
        unreadOnly: { type: 'boolean', description: 'Unread filter' },
        keyword: { type: 'string', description: 'Subject or content keyword' },
        relativeDays: { type: 'number', description: 'Date range in days (e.g., 7 for last week)' },
      },
    },
  },
  {
    name: 'resetFilters',
    description: 'Clear all active search queries and UI filter chips.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
];
