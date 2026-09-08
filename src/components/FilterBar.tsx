'use client';

import React from 'react';
import { useMailStore } from '@/state/useMailStore';
import { Filter, X, Calendar, User, Mail, Tag } from 'lucide-react';

export const FilterBar: React.FC = () => {
  const { activeFilters, searchQuery, resetFilters, setActiveFilters } = useMailStore();

  const hasActiveFilters =
    searchQuery !== '' ||
    activeFilters.unreadOnly ||
    !!activeFilters.sender ||
    !!activeFilters.keyword ||
    !!activeFilters.relativeDays;

  return (
    <div className="bg-[#f6f8fc] border-b border-[#e0e4ec] px-6 py-2 flex items-center justify-between gap-4 text-xs select-none">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-[#5f6368] font-bold mr-2">
          <Filter className="w-3.5 h-3.5 text-[#0b57d0]" />
          <span>Active Filters:</span>
        </div>

        {!hasActiveFilters ? (
          <span className="text-[#5f6368] italic font-medium">No filters applied (showing all messages)</span>
        ) : (
          <>
            {searchQuery ? (
              <span className="inline-flex items-center gap-1 bg-[#c2e7ff] text-[#001d35] font-bold border border-[#a8d7ff] px-3 py-1 rounded-full">
                <Tag className="w-3 h-3 text-[#0b57d0]" />
                Query: "{searchQuery}"
              </span>
            ) : null}

            {activeFilters.unreadOnly ? (
              <span className="inline-flex items-center gap-1 bg-[#ffdad6] text-[#410002] font-bold border border-[#ffb4ab] px-3 py-1 rounded-full">
                <Mail className="w-3 h-3 text-red-600" />
                Unread Only
              </span>
            ) : null}

            {activeFilters.sender ? (
              <span className="inline-flex items-center gap-1 bg-[#e8def8] text-[#1d192b] font-bold border border-[#d0bcff] px-3 py-1 rounded-full">
                <User className="w-3 h-3 text-purple-700" />
                From: {activeFilters.sender}
              </span>
            ) : null}

            {activeFilters.keyword ? (
              <span className="inline-flex items-center gap-1 bg-[#c4eed0] text-[#07210c] font-bold border border-[#9fdcb3] px-3 py-1 rounded-full">
                <Tag className="w-3 h-3 text-emerald-700" />
                Contains: {activeFilters.keyword}
              </span>
            ) : null}

            {activeFilters.relativeDays ? (
              <span className="inline-flex items-center gap-1 bg-[#c2e7ff] text-[#001d35] font-bold border border-[#a8d7ff] px-3 py-1 rounded-full">
                <Calendar className="w-3 h-3 text-[#0b57d0]" />
                Last {activeFilters.relativeDays} days
              </span>
            ) : null}

            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 bg-white hover:bg-gray-100 text-[#444746] border border-[#e0e4ec] px-2.5 py-1 rounded-full font-bold transition ml-1 shadow-sm"
            >
              <X className="w-3 h-3" />
              <span>Clear All</span>
            </button>
          </>
        )}
      </div>

      {/* Quick Filter Toggles */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveFilters({ unreadOnly: !activeFilters.unreadOnly })}
          className={`px-3 py-1 rounded-full border font-bold text-xs transition ${
            activeFilters.unreadOnly
              ? 'bg-[#ffdad6] text-[#410002] border-[#ffb4ab]'
              : 'bg-white border-[#e0e4ec] text-[#444746] hover:bg-gray-100'
          }`}
        >
          Unread
        </button>
        <button
          onClick={() => setActiveFilters({ relativeDays: activeFilters.relativeDays ? undefined : 7 })}
          className={`px-3 py-1 rounded-full border font-bold text-xs transition ${
            activeFilters.relativeDays === 7
              ? 'bg-[#c2e7ff] text-[#001d35] border-[#a8d7ff]'
              : 'bg-white border-[#e0e4ec] text-[#444746] hover:bg-gray-100'
          }`}
        >
          Last 7 Days
        </button>
      </div>
    </div>
  );
};
