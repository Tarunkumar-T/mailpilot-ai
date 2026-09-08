'use client';

import React, { useState } from 'react';
import { useMailStore } from '@/state/useMailStore';
import { processAiCommand } from '@/agent/runner';
import { Sparkles, Send, Terminal, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { ToolAction } from '@/types';

export const AiCommandBar: React.FC = () => {
  const [inputQuery, setInputQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentActions, setRecentActions] = useState<ToolAction[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showLogDrawer, setShowLogDrawer] = useState(false);

  const { getCurrentContext, showNotification } = useMailStore();

  const handleCommandSubmit = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q || !q.trim()) return;

    setIsProcessing(true);
    setStatusMessage(null);

    const context = getCurrentContext();
    const result = await processAiCommand(q, context);

    setIsProcessing(false);
    setStatusMessage(result.message);
    setRecentActions(result.actionsPerformed);

    if (result.actionsPerformed.length > 0) {
      setShowLogDrawer(true);
      showNotification(`AI executed ${result.actionsPerformed.length} UI tool action(s)`, 'success');
    }

    if (!queryText) {
      setInputQuery('');
    }
  };

  const examplePrompts = [
    'Find emails from TechCorp',
    'Show unread emails from the last 7 days',
    'Open the latest email from TechCorp',
    'Reply to this saying I will complete the assessment tomorrow',
    'Compose an email to Rahul saying the project is ready for review',
    'Go to Sent',
  ];

  return (
    <div className="bg-[#f6f8fc] border-b border-[#e0e4ec] p-4 shrink-0 shadow-sm select-none">
      {/* AI Command Input */}
      <div className="max-w-5xl mx-auto space-y-2.5">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleCommandSubmit();
          }}
          className="relative flex items-center"
        >
          <div className="absolute left-4 text-[#0b57d0] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#0b57d0] animate-pulse" />
          </div>

          <input
            type="text"
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            disabled={isProcessing}
            placeholder="Tell MailPilot AI what to do (e.g. 'Find unread emails from TechCorp', 'Reply to this saying...')"
            className="w-full bg-white border border-[#e0e4ec] rounded-full pl-12 pr-28 py-3 text-sm text-[#1f1f1f] placeholder-[#5f6368] focus:outline-none focus:border-[#0b57d0] focus:ring-2 focus:ring-[#0b57d0]/20 transition shadow-sm font-medium"
          />

          <div className="absolute right-2 flex items-center gap-2">
            <button
              type="submit"
              disabled={isProcessing || !inputQuery.trim()}
              className="bg-[#0b57d0] hover:bg-[#0945a5] text-white font-bold px-4 py-2 rounded-full text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 disabled:opacity-40"
            >
              {isProcessing ? (
                <span>Executing...</span>
              ) : (
                <>
                  <span>Run</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Example Command Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[#5f6368] font-bold shrink-0 text-[11px]">DEMO PROMPTS:</span>
          {examplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputQuery(prompt);
                handleCommandSubmit(prompt);
              }}
              className="bg-white hover:bg-[#eaf1fb] text-[#1f1f1f] border border-[#e0e4ec] px-3.5 py-1 rounded-full text-xs font-semibold shrink-0 transition shadow-sm"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* AI Tool Action Logs Drawer */}
        {recentActions.length > 0 ? (
          <div className="bg-white border border-[#e0e4ec] rounded-2xl overflow-hidden text-xs shadow-sm">
            <button
              onClick={() => setShowLogDrawer(!showLogDrawer)}
              className="w-full bg-[#f6f8fc] px-4 py-2 flex items-center justify-between text-[#1f1f1f] hover:bg-[#eaf1fb] transition"
            >
              <div className="flex items-center gap-2 font-mono text-[#0b57d0] font-bold">
                <Terminal className="w-4 h-4" />
                <span>AI Action Execution Engine ({recentActions.length} Tool Executed)</span>
              </div>
              {showLogDrawer ? <ChevronUp className="w-4 h-4 text-[#5f6368]" /> : <ChevronDown className="w-4 h-4 text-[#5f6368]" />}
            </button>

            {showLogDrawer ? (
              <div className="p-3 space-y-2 font-mono text-[11px] bg-white">
                {recentActions.map((act, i) => (
                  <div key={i} className="flex items-start gap-2 text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#0b57d0]">{act.name}</span>(
                      <span className="text-[#5f6368]">{JSON.stringify(act.args)}</span>)
                      <div className="text-[#444746] font-sans text-xs mt-0.5 font-medium">{act.explanation}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
};
