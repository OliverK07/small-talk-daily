import React from 'react';
import { CheckCircle } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl z-[110] flex items-center gap-2 transition-all duration-300 animate-slide-up">
      <CheckCircle className="w-4 h-4 text-emerald-400" />
      <span>{message}</span>
    </div>
  );
};
