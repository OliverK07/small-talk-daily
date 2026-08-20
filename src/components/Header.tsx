import React from 'react';
import { Smartphone, Monitor, Moon, Sun } from 'lucide-react';
import { LanguageMode } from '../types/topic';

interface HeaderProps {
  langMode: LanguageMode;
  onLangChange: (mode: LanguageMode) => void;
  viewMode: 'mobile' | 'full';
  onViewChange: (mode: 'mobile' | 'full') => void;
  isDark: boolean;
  onThemeToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  langMode,
  onLangChange,
  viewMode,
  onViewChange,
  isDark,
  onThemeToggle,
}) => {
  return (
    <header className="bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 backdrop-blur-md px-4 py-2.5">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 via-amber-500 to-sky-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 text-base">
            🌐
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Small Talk Daily{' '}
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-semibold">
                Bilingual · Google Trends
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              中英雙語對照 · 每日 Google 熱搜趨勢 · 經典破冰 · 幽默笑話
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex items-center text-xs font-semibold border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => onLangChange('bilingual')}
              className={`px-2 py-1 rounded-md text-[11px] transition-all ${
                langMode === 'bilingual'
                  ? 'bg-white dark:bg-slate-700 shadow-xs text-orange-600 dark:text-orange-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              中英對照
            </button>
            <button
              onClick={() => onLangChange('zh')}
              className={`px-2 py-1 rounded-md text-[11px] transition-all ${
                langMode === 'zh'
                  ? 'bg-white dark:bg-slate-700 shadow-xs text-orange-600 dark:text-orange-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              中文
            </button>
            <button
              onClick={() => onLangChange('en')}
              className={`px-2 py-1 rounded-md text-[11px] transition-all ${
                langMode === 'en'
                  ? 'bg-white dark:bg-slate-700 shadow-xs text-orange-600 dark:text-orange-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              English
            </button>
          </div>

          {/* View Mode Switch (Desktop/Mobile) */}
          <div className="hidden sm:flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg items-center text-xs font-medium border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => onViewChange('mobile')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all ${
                viewMode === 'mobile'
                  ? 'bg-white dark:bg-slate-700 shadow-xs text-orange-600 dark:text-orange-400 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" /> 手機
            </button>
            <button
              onClick={() => onViewChange('full')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all ${
                viewMode === 'full'
                  ? 'bg-white dark:bg-slate-700 shadow-xs text-orange-600 dark:text-orange-400 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" /> 寬螢幕
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={onThemeToggle}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="切換深色/淺色主題"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
