'use client';

import React, { useEffect } from 'react';
import { useMailStore } from '@/state/useMailStore';
import { Sidebar } from '@/components/Sidebar';
import { FilterBar } from '@/components/FilterBar';
import { MailList } from '@/components/MailList';
import { EmailDetail } from '@/components/EmailDetail';
import { ComposeModal } from '@/components/ComposeModal';
import { AiCommandBar } from '@/components/AiCommandBar';
import { Toast } from '@/components/Toast';
import { LogIn, RefreshCw, Search } from 'lucide-react';

export default function Home() {
  const {
    fetchEmails,
    currentFolder,
    selectedEmail,
    searchQuery,
    setSearchQuery,
    showNotification,
  } = useMailStore();

  useEffect(() => {
    // Initial fetch on mount
    fetchEmails();

    // Check if redirected from OAuth with credentials notice
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('oauth_notice') === 'missing_credentials') {
        showNotification(
          'OAuth Notice: To connect a live Gmail account, add GOOGLE_CLIENT_ID to .env.local. Running in Demo Mode.',
          'info'
        );
      } else if (urlParams.get('auth_success')) {
        showNotification('Successfully connected to Gmail account!', 'success');
      }
    }

    // Setup Real-Time Server-Sent Events (SSE) Push Subscription (Requirement 8)
    const eventSource = new EventSource('/api/mail/stream');

    eventSource.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'new_mail') {
          showNotification(`New email received: "${data.subject}"`, 'info');
          fetchEmails();
        }
      } catch (e) {}
    };

    eventSource.addEventListener('connected', () => {
      console.log('Real-Time push stream active.');
    });

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f6f8fc] text-[#1f1f1f]">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Gmail Top Header Bar */}
        <header className="bg-[#f6f8fc] border-b border-[#e0e4ec] px-6 py-3 flex items-center justify-between gap-4 shrink-0">
          {/* Gmail Style Search Bar */}
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 text-[#5f6368] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search in mail (sender, subject or keyword)..."
              className="w-full bg-[#eaeeef]/80 hover:bg-[#e4e9ea] focus:bg-white border border-[#e0e4ec] rounded-full pl-11 pr-4 py-2.5 text-xs text-[#1f1f1f] placeholder-[#5f6368] focus:outline-none focus:border-[#0b57d0] transition shadow-xs font-medium"
            />
          </div>

          {/* Top Actions & Auth Link */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchEmails()}
              title="Refresh Folder"
              className="p-2.5 text-[#5f6368] hover:text-[#1f1f1f] bg-white hover:bg-gray-100 rounded-full border border-[#e0e4ec] transition shadow-xs active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <a
              href="/api/auth/google"
              className="flex items-center gap-2 bg-[#0b57d0] hover:bg-[#0945a5] text-white font-bold px-4 py-2 rounded-full text-xs transition shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5 text-white" />
              <span>Connect Gmail Account</span>
            </a>
          </div>
        </header>

        {/* 2. Integrated AI Assistant Command Interface */}
        <AiCommandBar />

        {/* 3. Visible Filter Status Bar */}
        <FilterBar />

        {/* 4. Split View Content (Mail List + Detail View) */}
        <div className="flex-1 flex overflow-hidden p-1">
          
          {/* Mail List Panel */}
          <div
            className={`flex-col border-r border-[#e0e4ec] bg-[#f6f8fc] overflow-hidden ${
              selectedEmail ? 'hidden md:flex w-full md:w-5/12 lg:w-4/12' : 'flex w-full'
            }`}
          >
            <div className="bg-[#f6f8fc] px-6 py-2 text-xs font-bold text-[#5f6368] flex items-center justify-between">
              <span className="uppercase tracking-wider text-[#0b57d0]">
                {currentFolder} Folder
              </span>
            </div>

            <MailList />
          </div>

          {/* Email Detail Panel */}
          <div
            className={`flex-1 flex-col overflow-hidden bg-[#f6f8fc] ${
              selectedEmail ? 'flex w-full' : 'hidden md:flex'
            }`}
          >
            <EmailDetail />
          </div>
        </div>
      </div>

      {/* 5. Modals & Notifications */}
      <ComposeModal />
      <Toast />
    </div>
  );
}
