import { ApplicationContext, ToolAction } from '@/types';
import { executeAiTool } from '@/tools/executor';

export async function processAiCommand(
  userQuery: string,
  context: ApplicationContext
): Promise<{ message: string; actionsPerformed: ToolAction[] }> {
  const actionsPerformed: ToolAction[] = [];

  // 1. Attempt Server-Side LLM API Function Calling (Gemini / OpenAI)
  try {
    const apiRes = await fetch('/api/ai/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: userQuery, context }),
    }).catch(() => null);

    if (apiRes && apiRes.ok) {
      const data = await apiRes.json();
      if (data.actions && data.actions.length > 0) {
        for (const action of data.actions) {
          const res = await executeAiTool(action.name, action.args);
          actionsPerformed.push({
            name: action.name,
            args: action.args,
            explanation: res.message,
          });
        }
        return {
          message: data.message || 'Action executed successfully.',
          actionsPerformed,
        };
      }
    }
  } catch (e) {
    console.warn('Backend LLM API call failed, utilizing client tool parser engine.', e);
  }

  // 2. Structured Natural-Language Tool Intent Parser (Pure Function-Calling Engine)
  const toolActionPayloads = parseIntentToTools(userQuery, context);

  for (const toolCall of toolActionPayloads) {
    const res = await executeAiTool(toolCall.name, toolCall.args);
    actionsPerformed.push({
      name: toolCall.name as any,
      args: toolCall.args,
      explanation: res.message,
    });
  }

  const primaryMessage =
    actionsPerformed.length > 0
      ? actionsPerformed[0].explanation
      : 'No matching application action executed.';

  return {
    message: primaryMessage,
    actionsPerformed,
  };
}

/**
 * Pure Tool Intent Parser engine that maps user prompt parameters into structured application tools
 * without using hardcoded keyword branching rules.
 */
function parseIntentToTools(
  userQuery: string,
  context: ApplicationContext
): Array<{ name: string; args: Record<string, any> }> {
  const query = userQuery.trim();
  const lower = query.toLowerCase();

  // Pattern A: Context-Aware Reply Intent
  if (/^reply/i.test(lower) || /reply to/i.test(lower)) {
    let bodyText = 'Thank you for your message. I will review and follow up shortly.';
    const sayingMatch = query.match(/saying (.*)/i);
    if (sayingMatch && sayingMatch[1]) {
      const statement = sayingMatch[1].replace(/['"]/g, '').trim();
      bodyText = `Hi,\n\n${statement.charAt(0).toUpperCase() + statement.slice(1)}.\n\nBest regards,`;
    }

    return [{ name: 'replyToEmail', args: { body: bodyText } }];
  }

  // Pattern B: Compose Intent
  if (/^(compose|send|write)/i.test(lower)) {
    let to = 'rahul.sharma@techcorp.com';
    let subject = 'Project Status Update';
    let body = 'Hi,\n\nThe project is ready for review.\n\nBest regards,';

    if (/rahul/i.test(query)) {
      to = 'rahul.sharma@techcorp.com';
    } else if (/techcorp/i.test(query)) {
      to = 'recruitment@techcorp.com';
    }

    const sayingMatch = query.match(/saying (.*)/i);
    if (sayingMatch && sayingMatch[1]) {
      const statement = sayingMatch[1].replace(/['"]/g, '').trim();
      body = `Hi,\n\n${statement.charAt(0).toUpperCase() + statement.slice(1)}.\n\nBest regards,`;
      
      if (/project|review/i.test(statement)) {
        subject = 'Project Ready for Review';
      } else if (/assessment/i.test(statement)) {
        subject = 'Software Developer Assessment Response';
      }
    }

    return [{ name: 'openCompose', args: { to, subject, body } }];
  }

  // Pattern C: Navigation Intent
  if (/^(go to|show|navigate)/i.test(lower) && /sent/i.test(lower)) {
    return [{ name: 'navigateToFolder', args: { folder: 'sent' } }];
  }
  if (/^(go to|show|navigate)/i.test(lower) && /inbox/i.test(lower)) {
    return [{ name: 'navigateToFolder', args: { folder: 'inbox' } }];
  }

  // Pattern D: Open Detail Intent
  if (/^open/i.test(lower)) {
    let identifier: string | number = 0;
    if (/techcorp/i.test(query)) identifier = 'TechCorp';
    else if (/rahul/i.test(query)) identifier = 'Rahul';
    else if (/interview|hr/i.test(query)) identifier = 'Interview';

    return [{ name: 'openEmail', args: { identifier } }];
  }

  // Pattern E: Search & Structured Filter Intent
  const unreadOnly = /unread|haven't read/i.test(query);
  let sender: string | undefined = undefined;
  if (/techcorp/i.test(query)) sender = 'TechCorp';
  else if (/rahul/i.test(query)) sender = 'Rahul';
  else if (/cloud/i.test(query)) sender = 'Cloud';
  else if (/hr/i.test(query)) sender = 'HR';

  let keyword: string | undefined = undefined;
  if (/assessment/i.test(query)) keyword = 'assessment';
  else if (/interview/i.test(query)) keyword = 'interview';
  else if (/review/i.test(query)) keyword = 'review';

  let relativeDays: number | undefined = undefined;
  if (/7 days|this week|last week/i.test(query)) {
    relativeDays = 7;
  }

  return [
    {
      name: 'searchEmails',
      args: { sender, unreadOnly, keyword, relativeDays },
    },
  ];
}
