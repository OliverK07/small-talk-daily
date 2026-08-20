import React, { useState } from 'react';
import { BookmarkCheck } from 'lucide-react';
import { TopicItem } from '../types/topic';

interface SavedDrawerProps {
  savedItems: TopicItem[];
  onCopyText: (text: string) => void;
}

export const SavedDrawer: React.FC<SavedDrawerProps> = ({ savedItems, onCopyText }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="pt-2">
      <div className="bg-slate-50 dark:bg-slate-850 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <BookmarkCheck className="w-3.5 h-3.5 text-orange-500" />
            <span>口袋收藏庫 ({savedItems.length})</span>
          </span>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-[11px] text-orange-600 dark:text-orange-400 hover:underline"
          >
            {isOpen ? '收起' : '展開查看'}
          </button>
        </div>

        {isOpen && (
          <div className="space-y-1.5 pt-1 text-[11px]">
            {savedItems.length === 0 ? (
              <div className="text-slate-400 py-1">
                尚無收藏話題，點擊卡片右上角 ⭐ 即可加入口袋錦囊！
              </div>
            ) : (
              savedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700"
                >
                  <div className="truncate pr-2">
                    <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {item.categoryName} · {item.titleZh}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{item.titleEn}</div>
                  </div>
                  <button
                    onClick={() => onCopyText(`${item.openingZh}\n${item.openingEn}`)}
                    className="text-[10px] font-bold text-orange-600 dark:text-orange-400 hover:underline flex-shrink-0"
                  >
                    複製中英
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
