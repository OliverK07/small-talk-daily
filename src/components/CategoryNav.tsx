import React from 'react';
import { Shuffle } from 'lucide-react';
import { CategoryType } from '../types/topic';

interface CategoryNavProps {
  activeCategory: CategoryType;
  onSelectCategory: (cat: CategoryType) => void;
  onRandomPick: () => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  activeCategory,
  onSelectCategory,
  onRandomPick,
}) => {
  return (
    <div className="px-5 pt-3 pb-2 bg-white/95 dark:bg-slate-900/95 border-b border-slate-100 dark:border-slate-800 z-20 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>今日話題</span>
            <span className="text-xs font-normal text-slate-400">8月20日 · Daily Picks</span>
          </h2>
        </div>
        {/* Random Surprise Button */}
        <button
          onClick={onRandomPick}
          className="flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800/80 px-2.5 py-1.5 rounded-full hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-all active:scale-95 shadow-xs"
          title="隨機抽一個素材"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>隨機抽</span>
        </button>
      </div>

      {/* 3 Main Category Tabs */}
      <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl text-xs font-bold">
        <button
          onClick={() => onSelectCategory('trend')}
          className={`py-2 rounded-xl flex items-center justify-center gap-1 transition-all ${
            activeCategory === 'trend'
              ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <span>🔥 Google 趨勢</span>
        </button>
        <button
          onClick={() => onSelectCategory('classic')}
          className={`py-2 rounded-xl flex items-center justify-center gap-1 transition-all ${
            activeCategory === 'classic'
              ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <span>☕ 經典閒聊</span>
        </button>
        <button
          onClick={() => onSelectCategory('joke')}
          className={`py-2 rounded-xl flex items-center justify-center gap-1 transition-all ${
            activeCategory === 'joke'
              ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-300 shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <span>😂 幽默笑話</span>
        </button>
      </div>
    </div>
  );
};
