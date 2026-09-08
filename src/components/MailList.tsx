'use client';

import React from 'react';
import { useMailStore } from '@/state/useMailStore';
import { EmailMessage } from '@/types';
import { Clock, Inbox } from 'lucide-react';

export const MailList: React.FC = () => {
  const { emails, selectedEmail, setSelectedEmail, currentFolder, isLoading } = useMailStore();

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    
    if (isToday) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="animate-pulse bg-white border border-[#e0e4ec] rounded-xl p-4 space-y-3 shadow-sm">
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/6"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-100 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#5f6368] space-y-3 bg-white rounded-2xl m-2 border border-[#e0e4ec]">
        <div className="w-12 h-12 rounded-full bg-[#f6f8fc] border border-[#e0e4ec] flex items-center justify-center text-[#0b57d0]">
          <Inbox className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-[#1f1f1f] text-sm">No messages in {currentFolder.toUpperCase()}</h3>
          <p className="text-xs text-[#5f6368] mt-1 max-w-xs">
            There are no messages matching your criteria in this folder.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white rounded-2xl m-2 border border-[#e0e4ec] divide-y divide-[#f2f6fc] shadow-sm">
      {emails.map((email: EmailMessage) => {
        const isSelected = selectedEmail?.id === email.id;

        return (
          <div
            key={email.id}
            onClick={() => setSelectedEmail(email)}
            className={`p-3.5 cursor-pointer transition duration-150 relative group ${
              isSelected
                ? 'bg-[#c2e7ff] border-l-4 border-l-[#0b57d0]'
                : email.isUnread
                ? 'bg-white hover:bg-[#f2f6fc] font-bold'
                : 'bg-[#f6f8fc]/60 hover:bg-[#f2f6fc]'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-1">
              <div className="flex items-center gap-2.5 min-w-0">
                {email.isUnread ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0b57d0] shrink-0 shadow-sm"></span>
                ) : (
                  <span className="w-2.5 h-2.5 shrink-0"></span>
                )}
                <span
                  className={`text-sm truncate ${
                    email.isUnread ? 'font-bold text-[#1f1f1f]' : 'font-medium text-[#444746]'
                  }`}
                >
                  {email.sender.name || email.sender.email}
                </span>
              </div>
              <span className="text-[11px] text-[#5f6368] shrink-0 flex items-center gap-1 font-medium">
                <Clock className="w-3 h-3 text-[#5f6368]" />
                {formatDate(email.date)}
              </span>
            </div>

            <h4
              className={`text-xs mb-1 truncate pl-5 ${
                email.isUnread ? 'font-semibold text-[#1f1f1f]' : 'text-[#444746]'
              }`}
            >
              {email.subject}
            </h4>

            <p className="text-xs text-[#5f6368] line-clamp-1 leading-relaxed pl-5">
              {email.snippet}
            </p>
          </div>
        );
      })}
    </div>
  );
};
