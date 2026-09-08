import { create } from 'zustand';
import { EmailMessage, MailFolder, MailView, ActiveFilters, ComposeState, ApplicationContext } from '@/types';
import { getMockEmails, addMockSentEmail } from '@/services/mockMail';

interface MailState {
  // Navigation & View
  currentView: MailView;
  currentFolder: MailFolder;
  selectedEmail: EmailMessage | null;
  
  // Data
  emails: EmailMessage[];
  isLoading: boolean;
  error: string | null;
  
  // Search & Filter
  searchQuery: string;
  activeFilters: ActiveFilters;
  
  // Compose & Reply
  composeState: ComposeState;
  
  // Notifications / Feedback
  notification: { message: string; type: 'info' | 'success' | 'error' } | null;
  
  // Auth state
  isAuthenticated: boolean;
  userEmail: string;

  // Actions
  fetchEmails: () => Promise<void>;
  setCurrentFolder: (folder: MailFolder) => void;
  setSelectedEmail: (email: EmailMessage | null) => void;
  setSearchQuery: (query: string) => void;
  setActiveFilters: (filters: Partial<ActiveFilters>) => void;
  resetFilters: () => void;
  
  // Compose Actions
  openCompose: (fields?: Partial<ComposeState>) => void;
  updateComposeState: (fields: Partial<ComposeState>) => void;
  closeCompose: () => void;
  sendComposeEmail: () => Promise<boolean>;
  
  // High-level UI Helper Actions (used directly or by AI tools)
  replyToCurrentEmail: (replyBody: string) => void;
  openEmailByIdOrPosition: (identifier: string | number) => boolean;
  markEmailAsRead: (emailId: string) => void;
  showNotification: (message: string, type?: 'info' | 'success' | 'error') => void;
  
  // Context snapshot generator for AI Agent
  getCurrentContext: () => ApplicationContext;
}

export const useMailStore = create<MailState>((set, get) => ({
  currentView: 'list',
  currentFolder: 'inbox',
  selectedEmail: null,
  
  emails: [],
  isLoading: false,
  error: null,
  
  searchQuery: '',
  activeFilters: {},
  
  composeState: {
    isOpen: false,
    to: '',
    subject: '',
    body: '',
    isAiGenerated: false,
    pendingConfirmation: false,
  },
  
  notification: null,
  isAuthenticated: false,
  userEmail: 'user@mailpilot.dev',

  fetchEmails: async () => {
    set({ isLoading: true, error: null });
    try {
      const { currentFolder, activeFilters, searchQuery } = get();
      
      // Attempt backend API call first
      const res = await fetch(
        `/api/mail?folder=${currentFolder}&search=${encodeURIComponent(searchQuery)}&filters=${encodeURIComponent(JSON.stringify(activeFilters))}`
      ).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        set({ emails: data.emails, isLoading: false });
      } else {
        // Dynamic fallback to mockMail store
        const emails = await getMockEmails(currentFolder, activeFilters, searchQuery);
        set({ emails, isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch emails', isLoading: false });
    }
  },

  setCurrentFolder: (folder: MailFolder) => {
    set({ currentFolder: folder, currentView: 'list', selectedEmail: null, activeFilters: {}, searchQuery: '' });
    get().fetchEmails();
  },

  setSelectedEmail: (email: EmailMessage | null) => {
    if (email) {
      set({ selectedEmail: email, currentView: 'detail' });
      if (email.isUnread) {
        get().markEmailAsRead(email.id);
      }
    } else {
      set({ selectedEmail: null, currentView: 'list' });
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    get().fetchEmails();
  },

  setActiveFilters: (filters: Partial<ActiveFilters>) => {
    set(state => ({
      activeFilters: { ...state.activeFilters, ...filters },
    }));
    get().fetchEmails();
  },

  resetFilters: () => {
    set({ activeFilters: {}, searchQuery: '' });
    get().fetchEmails();
  },

  openCompose: (fields?: Partial<ComposeState>) => {
    set({
      composeState: {
        isOpen: true,
        to: fields?.to || '',
        subject: fields?.subject || '',
        body: fields?.body || '',
        replyToMessageId: fields?.replyToMessageId,
        isAiGenerated: fields?.isAiGenerated || false,
        pendingConfirmation: fields?.pendingConfirmation || false,
      },
    });
  },

  updateComposeState: (fields: Partial<ComposeState>) => {
    set(state => ({
      composeState: { ...state.composeState, ...fields },
    }));
  },

  closeCompose: () => {
    set({
      composeState: {
        isOpen: false,
        to: '',
        subject: '',
        body: '',
        isAiGenerated: false,
        pendingConfirmation: false,
      },
    });
  },

  sendComposeEmail: async () => {
    const { composeState } = get();
    if (!composeState.to || !composeState.subject) {
      get().showNotification('Please fill in To and Subject fields', 'error');
      return false;
    }

    set({ isLoading: true });
    try {
      const res = await fetch('/api/mail/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: composeState.to,
          subject: composeState.subject,
          body: composeState.body,
        }),
      }).catch(() => null);

      if (res && res.ok) {
        get().showNotification('Email sent successfully via Gmail API!', 'success');
      } else {
        // Fallback to local sent store
        await addMockSentEmail(composeState.to, composeState.subject, composeState.body);
        get().showNotification(`Email sent to ${composeState.to}!`, 'success');
      }

      get().closeCompose();
      get().fetchEmails();
      return true;
    } catch (err: any) {
      get().showNotification(err.message || 'Failed to send email', 'error');
      set({ isLoading: false });
      return false;
    }
  },

  replyToCurrentEmail: (replyBody: string) => {
    const { selectedEmail } = get();
    if (!selectedEmail) {
      get().showNotification('No email currently open to reply to', 'error');
      return;
    }

    const replyTo = selectedEmail.sender.email;
    const subject = selectedEmail.subject.startsWith('Re:')
      ? selectedEmail.subject
      : `Re: ${selectedEmail.subject}`;

    get().openCompose({
      to: replyTo,
      subject,
      body: replyBody,
      replyToMessageId: selectedEmail.id,
      isAiGenerated: true,
      pendingConfirmation: true, // Requires explicit user click on "Send" button!
    });

    get().showNotification('AI generated reply. Please confirm before sending.', 'info');
  },

  openEmailByIdOrPosition: (identifier: string | number): boolean => {
    const { emails } = get();
    if (typeof identifier === 'number' || !isNaN(Number(identifier))) {
      const index = typeof identifier === 'number' ? identifier : Number(identifier);
      if (index >= 0 && index < emails.length) {
        get().setSelectedEmail(emails[index]);
        return true;
      }
    }

    // Try finding by ID or sender/subject match
    const found = emails.find(
      e =>
        e.id === identifier ||
        e.sender.name.toLowerCase().includes(String(identifier).toLowerCase()) ||
        e.subject.toLowerCase().includes(String(identifier).toLowerCase())
    );

    if (found) {
      get().setSelectedEmail(found);
      return true;
    }

    return false;
  },

  markEmailAsRead: (emailId: string) => {
    set(state => ({
      emails: state.emails.map(e => (e.id === emailId ? { ...e, isUnread: false } : e)),
    }));
  },

  showNotification: (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    set({ notification: { message, type } });
    setTimeout(() => {
      set({ notification: null });
    }, 4000);
  },

  getCurrentContext: (): ApplicationContext => {
    const state = get();
    return {
      currentView: state.currentView,
      currentFolder: state.currentFolder,
      currentEmailId: state.selectedEmail ? state.selectedEmail.id : null,
      currentEmail: state.selectedEmail
        ? {
            id: state.selectedEmail.id,
            sender: `${state.selectedEmail.sender.name} <${state.selectedEmail.sender.email}>`,
            subject: state.selectedEmail.subject,
            snippet: state.selectedEmail.snippet,
            date: state.selectedEmail.date,
          }
        : null,
      searchQuery: state.searchQuery,
      activeFilters: state.activeFilters,
      composeState: {
        isOpen: state.composeState.isOpen,
        to: state.composeState.to,
        subject: state.composeState.subject,
        hasContent: !!state.composeState.body,
        pendingConfirmation: state.composeState.pendingConfirmation || false,
      },
      totalEmailsInView: state.emails.length,
    };
  },
}));
