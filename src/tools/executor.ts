import { useMailStore } from '@/state/useMailStore';
import { ToolAction } from '@/types';

export async function executeAiTool(name: string, args: Record<string, any>): Promise<{ success: boolean; message: string }> {
  const store = useMailStore.getState();

  switch (name) {
    case 'searchEmails': {
      const { query, sender, keyword, unreadOnly, relativeDays } = args;

      if (query !== undefined) store.setSearchQuery(query);

      const filtersToApply: Record<string, any> = {};
      if (sender !== undefined) filtersToApply.sender = sender;
      if (keyword !== undefined) filtersToApply.keyword = keyword;
      if (unreadOnly !== undefined) filtersToApply.unreadOnly = unreadOnly;
      if (relativeDays !== undefined) filtersToApply.relativeDays = Number(relativeDays);

      store.setActiveFilters(filtersToApply);
      
      const filterSummary = Object.entries(filtersToApply)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');

      return {
        success: true,
        message: `Searched email list${filterSummary ? ` with filters (${filterSummary})` : ''}.`,
      };
    }

    case 'openEmail': {
      const { identifier } = args;
      const opened = store.openEmailByIdOrPosition(identifier);

      if (opened) {
        const current = useMailStore.getState().selectedEmail;
        return {
          success: true,
          message: `Opened email: "${current?.subject}" from ${current?.sender.name}.`,
        };
      } else {
        return {
          success: false,
          message: `Could not find email matching "${identifier}".`,
        };
      }
    }

    case 'navigateToFolder': {
      const { folder } = args;
      if (['inbox', 'sent', 'drafts', 'trash'].includes(folder)) {
        store.setCurrentFolder(folder as any);
        return {
          success: true,
          message: `Navigated to ${folder.toUpperCase()} folder.`,
        };
      }
      return { success: false, message: `Invalid folder: ${folder}` };
    }

    case 'openCompose': {
      const { to, subject, body } = args;
      store.openCompose({
        to: to || '',
        subject: subject || '',
        body: body || '',
        isAiGenerated: true,
        pendingConfirmation: true, // Send confirmation gate!
      });

      return {
        success: true,
        message: `Opened Compose UI and populated recipient (${to}), subject (${subject}), and message body. Ready for review.`,
      };
    }

    case 'replyToEmail': {
      const { body } = args;
      const currentEmail = store.selectedEmail;

      if (!currentEmail) {
        // Try fallback: open latest email first
        const latestOpened = store.openEmailByIdOrPosition(0);
        if (!latestOpened) {
          return {
            success: false,
            message: 'No email is currently selected to reply to.',
          };
        }
      }

      store.replyToCurrentEmail(body);

      const activeCompose = useMailStore.getState().composeState;
      return {
        success: true,
        message: `Opened Reply interface to ${activeCompose.to} with generated body. User confirmation required before sending.`,
      };
    }

    case 'applyFilters': {
      store.setActiveFilters({
        sender: args.sender,
        unreadOnly: args.unreadOnly,
        keyword: args.keyword,
        relativeDays: args.relativeDays ? Number(args.relativeDays) : undefined,
      });

      return {
        success: true,
        message: `Applied filters to visible email list.`,
      };
    }

    case 'resetFilters': {
      store.resetFilters();
      return {
        success: true,
        message: `Cleared all search filters and reset inbox view.`,
      };
    }

    default:
      return {
        success: false,
        message: `Unknown tool name: ${name}`,
      };
  }
}
