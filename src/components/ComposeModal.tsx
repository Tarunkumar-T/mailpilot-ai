'use client';

import React from 'react';
import { useMailStore } from '@/state/useMailStore';
import { X, Send, Sparkles, AlertCircle, Check, Edit3 } from 'lucide-react';

export const ComposeModal: React.FC = () => {
  const { composeState, closeCompose, updateComposeState, sendComposeEmail, isLoading } = useMailStore();

  if (!composeState.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#e0e4ec] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-[#f2f6fc] px-6 py-3.5 border-b border-[#e0e4ec] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-[#0b57d0]" />
            <h3 className="font-bold text-[#1f1f1f] text-sm">New Message</h3>
            {composeState.isAiGenerated ? (
              <span className="bg-[#c2e7ff] text-[#001d35] text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ml-2">
                <Sparkles className="w-3 h-3 text-[#0b57d0]" />
                AI Generated
              </span>
            ) : null}
          </div>
          <button
            onClick={closeCompose}
            className="text-[#5f6368] hover:text-[#1f1f1f] p-1 rounded-full hover:bg-gray-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Send Confirmation Gate Banner (Requirement 7) */}
        {composeState.pendingConfirmation ? (
          <div className="bg-[#fef7e0] border-b border-[#f6e5a6] px-6 py-3 flex items-center justify-between text-xs text-[#7c4a03]">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold text-amber-900">Send Confirmation Required: </span>
                AI populated this email. Please review fields before sending.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateComposeState({ pendingConfirmation: false })}
                className="text-amber-900 hover:text-black underline font-bold"
              >
                Edit Content
              </button>
            </div>
          </div>
        ) : null}

        {/* Compose Form Fields */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-sm bg-white">
          <div>
            <label className="block text-xs font-bold text-[#5f6368] mb-1">To:</label>
            <input
              type="email"
              value={composeState.to}
              onChange={e => updateComposeState({ to: e.target.value })}
              placeholder="recipient@example.com"
              className="w-full bg-[#f6f8fc] border border-[#e0e4ec] rounded-xl px-3.5 py-2 text-[#1f1f1f] placeholder-[#5f6368] focus:outline-none focus:border-[#0b57d0] transition font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5f6368] mb-1">Subject:</label>
            <input
              type="text"
              value={composeState.subject}
              onChange={e => updateComposeState({ subject: e.target.value })}
              placeholder="Subject title"
              className="w-full bg-[#f6f8fc] border border-[#e0e4ec] rounded-xl px-3.5 py-2 text-[#1f1f1f] placeholder-[#5f6368] focus:outline-none focus:border-[#0b57d0] transition font-bold"
            />
          </div>

          <div className="flex-1 flex flex-col">
            <label className="block text-xs font-bold text-[#5f6368] mb-1">Message Body:</label>
            <textarea
              rows={9}
              value={composeState.body}
              onChange={e => updateComposeState({ body: e.target.value })}
              placeholder="Write your email here..."
              className="w-full bg-[#f6f8fc] border border-[#e0e4ec] rounded-2xl p-4 text-[#1f1f1f] placeholder-[#5f6368] focus:outline-none focus:border-[#0b57d0] transition leading-relaxed resize-none font-sans"
            />
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-[#f6f8fc] px-6 py-3.5 border-t border-[#e0e4ec] flex items-center justify-between">
          <button
            type="button"
            onClick={closeCompose}
            className="px-4 py-2 rounded-full text-[#5f6368] hover:text-[#1f1f1f] text-xs font-bold transition"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            {composeState.pendingConfirmation ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-900 font-bold mr-2">Ready to send?</span>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => sendComposeEmail()}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-sm transition active:scale-95 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isLoading ? 'Sending...' : 'Confirm & Send'}</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={isLoading}
                onClick={() => sendComposeEmail()}
                className="flex items-center gap-2 bg-[#0b57d0] hover:bg-[#0945a5] text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-sm transition active:scale-95 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isLoading ? 'Sending...' : 'Send Message'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
