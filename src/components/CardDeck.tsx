import React, { useRef, useState } from 'react';
import {
  Volume2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { TopicItem, LanguageMode, CategoryType } from '../types/topic';

interface CardDeckProps {
  item: TopicItem;
  currentIndex: number;
  totalCount: number;
  langMode: LanguageMode;
  isSaved: boolean;
  onToggleBookmark: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSpeak: (lang: 'zh' | 'en') => void;
  onLangChange: (mode: LanguageMode) => void;
  activeCategory: CategoryType;
  onSelectCategory: (cat: CategoryType) => void;
}

export const CardDeck: React.FC<CardDeckProps> = ({
  item,
  currentIndex,
  totalCount,
  langMode,
  isSaved,
  onToggleBookmark,
  onNext,
  onPrev,
  onSpeak,
  onLangChange,
  activeCategory,
  onSelectCategory,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchCurrent, setTouchCurrent] = useState<number | null>(null);

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setTouchStart(clientX);
    setTouchCurrent(clientX);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (touchStart === null) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setTouchCurrent(clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart === null || touchCurrent === null) return;
    
    const delta = touchCurrent - touchStart;
    const minSwipeDistance = 50; // Minimum distance to trigger swipe
    
    // Left swipe (negative delta) = next
    if (delta < -minSwipeDistance) {
      onNext();
    }
    // Right swipe (positive delta) = previous
    else if (delta > minSwipeDistance) {
      onPrev();
    }
    
    setTouchStart(null);
    setTouchCurrent(null);
  };

  return (
    <div className="space-y-6">
      {/* Minimal top controls */}
      <div className="flex items-center justify-between px-2">
        {/* Category pills - tiny and subtle */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onSelectCategory('trend')}
            className={`text-[10px] px-2 py-1 rounded-full transition-colors ${
              activeCategory === 'trend'
                ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            🔥 趨勢
          </button>
          <button
            onClick={() => onSelectCategory('classic')}
            className={`text-[10px] px-2 py-1 rounded-full transition-colors ${
              activeCategory === 'classic'
                ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            ☕ 經典
          </button>
          <button
            onClick={() => onSelectCategory('joke')}
            className={`text-[10px] px-2 py-1 rounded-full transition-colors ${
              activeCategory === 'joke'
                ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            😂 笑話
          </button>
        </div>

        {/* Language toggle - tiny */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onLangChange('zh')}
            className={`text-[10px] px-2 py-1 rounded-full transition-colors ${
              langMode === 'zh'
                ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            中
          </button>
          <button
            onClick={() => onLangChange('bilingual')}
            className={`text-[10px] px-2 py-1 rounded-full transition-colors ${
              langMode === 'bilingual'
                ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            雙語
          </button>
          <button
            onClick={() => onLangChange('en')}
            className={`text-[10px] px-2 py-1 rounded-full transition-colors ${
              langMode === 'en'
                ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            EN
          </button>
        </div>
      </div>

      {/* Main Card - focus on content */}
      <div
        ref={cardRef}
        key={item.id}
        className="animate-card-in bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 space-y-8 shadow-lg select-none cursor-grab active:cursor-grabbing min-h-[600px] flex flex-col"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseMove={(e) => {
          if (e.buttons === 1) handleTouchMove(e);
        }}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
      >
        {/* Title - large and prominent */}
        <div className="space-y-3">
          {langMode !== 'en' && (
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white leading-tight">
              {item.titleZh}
            </h1>
          )}
          {langMode !== 'zh' && (
            <p className="text-xl sm:text-2xl font-semibold text-slate-500 dark:text-slate-400">
              {item.titleEn}
            </p>
          )}
        </div>

        {/* Content brief */}
        <div className="space-y-4 flex-1">
          {langMode !== 'en' && (
            <p className="text-lg sm:text-xl text-slate-700 dark:text-slate-300 leading-relaxed">
              {item.contentZh}
            </p>
          )}
          {langMode !== 'zh' && (
            <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
              {item.contentEn}
            </p>
          )}
        </div>

        {/* Opening lines */}
        <div className="space-y-4">
          {langMode !== 'en' && (
            <div className="space-y-2">
              <p className="text-sm text-slate-400">開場白</p>
              <p className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400 leading-relaxed">
                {item.openingZh}
              </p>
            </div>
          )}
          {langMode !== 'zh' && (
            <div className="space-y-2">
              <p className="text-sm text-slate-400">Opening</p>
              <p className="text-xl sm:text-2xl font-bold text-sky-600 dark:text-sky-400 leading-relaxed">
                {item.openingEn}
              </p>
            </div>
          )}
        </div>

        {/* Follow-up */}
        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          {langMode !== 'en' && (
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
              {item.followUpZh}
            </p>
          )}
          {langMode !== 'zh' && (
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-500">
              {item.followUpEn}
            </p>
          )}
        </div>

        {/* Discreet controls at bottom */}
        <div className="flex items-center justify-between pt-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSpeak('zh')}
              className="p-2 rounded-full text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-slate-800 transition-colors"
              title="朗讀中文"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSpeak('en')}
              className="p-2 rounded-full text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors"
              title="Play English"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={onToggleBookmark}
            className={`p-2 rounded-full transition-colors ${
              isSaved
                ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/60'
                : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-slate-800'
            }`}
            title="收藏"
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-2">
        <button
          onClick={onPrev}
          className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <span className="text-sm text-slate-400">
          {currentIndex + 1} / {totalCount}
        </span>

        <button
          onClick={onNext}
          className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
