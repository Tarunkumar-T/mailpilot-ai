'use client';

import React from 'react';
import { useMailStore } from '@/state/useMailStore';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const Toast: React.FC = () => {
  const { notification } = useMailStore();

  if (!notification) return null;

  const icons = {
    info: <Info className="w-4 h-4 text-sky-400" />,
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400" />,
  };

  const bgStyles = {
    info: 'bg-slate-900 border-sky-500/50 text-slate-100',
    success: 'bg-slate-900 border-emerald-500/50 text-slate-100',
    error: 'bg-slate-900 border-rose-500/50 text-slate-100',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div className={`border rounded-xl px-4 py-3 shadow-2xl flex items-center gap-3 text-xs font-medium ${bgStyles[notification.type]}`}>
        {icons[notification.type]}
        <span>{notification.message}</span>
      </div>
    </div>
  );
};
