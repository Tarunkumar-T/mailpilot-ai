'use client';

import React from 'react';
import { useMailStore } from '@/state/useMailStore';
import { Reply, ArrowLeft, Calendar, Mail, Sparkles } from 'lucide-react';

export const EmailDetail: React.FC = () => {
  const { selectedEmail, setSelectedEmail, openCompose } = useMailStore();

  if (!selectedEmail) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#5f6368] bg-white rounded-2xl m-2 border border-[#e0e4ec] shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-[#f6f8fc] border border-[#e0e4ec] flex items-center justify-center text-[#0b57d0] mb-4">
          <Mail className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-[#1f1f1f]">No message selected</h3>
        <p className="text-xs text-[#5f6368] max-w-sm mt-1">
          Select an email from the list or tell the AI assistant <span className="text-[#0b57d0] font-semibold">"Open latest email from TechCorp"</span>
        </p>
      </div>
    );
  }

  const formattedDate = new Date(selectedEmail.date).toLocaleString([], {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-white rounded-2xl m-2 border border-[#e0e4ec] shadow-sm overflow-hidden">
      {/* Detail Header Toolbar */}
      <div className="bg-[#f6f8fc] border-b border-[#e0e4ec] px-6 py-3 flex items-center justify-between gap-4">
        <button
          onClick={() => setSelectedEmail(null)}
          className="flex items-center gap-2 text-[#444746] hover:text-[#1f1f1f] text-xs font-semibold bg-white hover:bg-gray-50 border border-[#e0e4ec] px-3.5 py-1.5 rounded-full transition shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              openCompose({
                to: selectedEmail.sender.email,
                subject: selectedEmail.subject.startsWith('Re:')
                  ? selectedEmail.subject
                  : `Re: ${selectedEmail.subject}`,
                body: `\n\n--- On ${formattedDate}, ${selectedEmail.sender.name} wrote ---\n> ${selectedEmail.body}`,
              })
            }
            className="flex items-center gap-2 bg-[#0b57d0] hover:bg-[#0945a5] text-white px-4 py-1.5 rounded-full text-xs font-semibold transition shadow-sm"
          >
            <Reply className="w-3.5 h-3.5" />
            <span>Reply</span>
          </button>
        </div>
      </div>

      {/* Main Email Content */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Email Title & Subject */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#c2e7ff] text-[#001d35] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              ID: {selectedEmail.id}
            </span>
            {selectedEmail.isUnread ? (
              <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                Unread
              </span>
            ) : null}
          </div>
          <h2 className="text-2xl font-bold text-[#1f1f1f] tracking-tight leading-snug">
            {selectedEmail.subject}
          </h2>
        </div>

        {/* Sender & Recipient Metadata Box */}
        <div className="bg-[#f6f8fc] border border-[#e0e4ec] rounded-2xl p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0b57d0] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {(selectedEmail.sender.name || selectedEmail.sender.email)[0].toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-[#1f1f1f] text-sm">
                  {selectedEmail.sender.name}
                </div>
                <div className="text-[#5f6368] text-xs">{selectedEmail.sender.email}</div>
              </div>
            </div>
            <div className="text-[#5f6368] text-xs flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-[#5f6368]" />
              {formattedDate}
            </div>
          </div>

          <div className="pt-2 border-t border-[#e0e4ec] text-[#5f6368] flex items-center gap-2">
            <span className="font-semibold text-[#444746]">To:</span>
            <span>{selectedEmail.recipients.map(r => r.name || r.email).join(', ')}</span>
          </div>
        </div>

        {/* Email Body */}
        <div className="bg-[#f6f8fc]/40 border border-[#e0e4ec] rounded-2xl p-6 text-[#1f1f1f] text-sm leading-relaxed whitespace-pre-line font-sans min-h-[220px]">
          {selectedEmail.body}
        </div>

        {/* Context Banner */}
        <div className="bg-[#c2e7ff]/40 border border-[#0b57d0]/30 rounded-2xl p-4 text-xs text-[#001d35] flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-[#0b57d0] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[#041e49] block mb-0.5">Context Active for AI</span>
            Try commanding the AI bar: <span className="font-semibold text-[#0b57d0]">"Reply to this saying I'll complete it tomorrow"</span>. The AI will automatically resolve this open message as context!
          </div>
        </div>
      </div>
    </div>
  );
};
