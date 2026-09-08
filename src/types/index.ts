export type MailFolder = 'inbox' | 'sent' | 'drafts' | 'trash';

export type MailView = 'list' | 'detail' | 'compose';

export interface EmailAddress {
  name: string;
  email: string;
}

export interface EmailMessage {
  id: string;
  threadId: string;
  sender: EmailAddress;
  recipients: EmailAddress[];
  subject: string;
  snippet: string;
  body: string;
  date: string; // ISO string
  isUnread: boolean;
  folder: MailFolder;
  labels: string[];
}

export interface ActiveFilters {
  sender?: string;
  unreadOnly?: boolean;
  keyword?: string;
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string;   // YYYY-MM-DD
  relativeDays?: number;
}

export interface ComposeState {
  isOpen: boolean;
  to: string;
  subject: string;
  body: string;
  replyToMessageId?: string;
  isAiGenerated?: boolean;
  pendingConfirmation?: boolean;
}

export interface ApplicationContext {
  currentView: MailView;
  currentFolder: MailFolder;
  currentEmailId: string | null;
  currentEmail: {
    id: string;
    sender: string;
    subject: string;
    snippet: string;
    date: string;
  } | null;
  searchQuery: string;
  activeFilters: ActiveFilters;
  composeState: {
    isOpen: boolean;
    to: string;
    subject: string;
    hasContent: boolean;
    pendingConfirmation: boolean;
  };
  totalEmailsInView: number;
}

export type ToolName = 
  | 'searchEmails'
  | 'openEmail'
  | 'navigateToFolder'
  | 'openCompose'
  | 'populateCompose'
  | 'replyToEmail'
  | 'applyFilters'
  | 'resetFilters'
  | 'sendEmail';

export interface ToolAction {
  name: ToolName;
  args: Record<string, any>;
  explanation: string;
}

export interface AiCommandResult {
  message: string;
  actionsPerformed: ToolAction[];
}
