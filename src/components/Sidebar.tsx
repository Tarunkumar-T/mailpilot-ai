'use client';

import React from 'react';
import { useMailStore } from '@/state/useMailStore';
import { MailFolder } from '@/types';
import { Inbox, Send, Edit3, Trash2, FileText, Sparkles, ShieldCheck } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentFolder, setCurrentFolder, openCompose, emails } = useMailStore();

  const unreadInboxCount = emails.filter(e => e.folder === 'inbox' && e.isUnread).length;

  const folderItems: { id: MailFolder; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'inbox', label: 'Inbox', icon: <Inbox className="w-4 h-4" />, count: unreadInboxCount },
    { id: 'sent', label: 'Sent', icon: <Send className="w-4 h-4" /> },
    { id: 'drafts', label: 'Drafts', icon: <FileText className="w-4 h-4" /> },
    { id: 'trash', label: 'Trash', icon: <Trash2 className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-[#f6f8fc] text-[#444746] flex flex-col justify-between p-4 h-full shrink-0 select-none">
      <div>
        {/* Gmail Logo Header */}
        <div className="flex items-center gap-3 px-3 py-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-red-500 to-amber-500 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-[#1f1f1f] tracking-tight leading-none flex items-center gap-1">
              <span>Mail</span>
              <span className="text-[#0b57d0]">Pilot</span>
            </h1>
            <p className="text-[11px] text-[#0b57d0] font-semibold mt-0.5">Gmail AI Workspace</p>
          </div>
        </div>

        {/* Gmail Floating Compose Button */}
        <button
          onClick={() => openCompose()}
          className="flex items-center gap-3 bg-[#c2e7ff] hover:bg-[#b3dcff] text-[#001d35] font-semibold py-3.5 px-6 rounded-2xl shadow-sm hover:shadow-md transition duration-200 active:scale-95 mb-6 text-sm"
        >
          <Edit3 className="w-5 h-5 text-[#0b57d0]" />
          <span>Compose</span>
        </button>

        {/* Navigation Folder Pills */}
        <nav className="space-y-1">
          {folderItems.map(item => {
            const isActive = currentFolder === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentFolder(item.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-full text-sm font-medium transition ${
                  isActive
                    ? 'bg-[#c2e7ff] text-[#001d35] font-bold'
                    : 'text-[#444746] hover:bg-[#eaeeed] hover:text-[#1f1f1f]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={isActive ? 'text-[#0b57d0]' : 'text-[#5f6368]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.count && item.count > 0 ? (
                  <span className="bg-[#0b57d0] text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    {item.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Gmail API Status Badge */}
      <div className="bg-white rounded-2xl p-3.5 border border-[#e0e4ec] text-xs shadow-sm">
        <div className="flex items-center gap-2 text-[#0b57d0] font-bold mb-1">
          <ShieldCheck className="w-4 h-4 text-[#0b57d0]" />
          <span>Gmail API Connected</span>
        </div>
        <p className="text-[#5f6368] text-[11px] leading-relaxed">
          OAuth 2.0 PKCE & Cloud Pub/Sub real-time push webhooks active.
        </p>
      </div>
    </aside>
  );
};
