import React, { useRef, useState } from 'react';
import {
  TrendingUp,
  Volume2,
  Bookmark,
  Sparkles,
  MessageSquare,
  Copy,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { TopicItem, LanguageMode } from '../types/topic';

interface CardDeckProps {
  item: TopicItem;
  currentIndex: number;
  totalCount: number;
  langMode: LanguageMode;
  isSaved: boolean;
  onToggleBookmark: () => void;
  onNext: () => void;
  onPrev: () => void;
  onCopy: () => void;
  onSpeak: (lang: 'zh' | 'en') => void;
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
  onCopy,
  onSpeak,
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
    <div className="space-y-4">
      {/* Main Card */}
      <div
        ref={cardRef}
        key={item.id}
        className="animate-card-in bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/90 dark:border-slate-700/80 p-5 shadow-sm space-y-4 relative select-none cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseMove={(e) => {
          if (e.buttons === 1) handleTouchMove(e); // Only track if mouse button is pressed
        }}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
      >
        {/* Header Badges & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-extrabold flex items-center gap-1 ${item.badgeClass}`}
            >
              {item.categoryName}
            </span>
            {/* Google Trends Badge */}
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center gap-1 border border-slate-200 dark:border-slate-600">
              <TrendingUp className="w-3 h-3 text-sky-500" />
              <span>{item.trendSource}</span>
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* TTS Chinese */}
            <button
              onClick={() => onSpeak('zh')}
              className="p-1.5 rounded-lg text-slate-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors text-[10px] font-bold flex items-center gap-0.5"
              title="朗讀繁體中文"
            >
              <Volume2 className="w-3.5 h-3.5" /> 🇹🇼 中
            </button>
            {/* TTS English */}
            <button
              onClick={() => onSpeak('en')}
              className="p-1.5 rounded-lg text-slate-500 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-slate-700 transition-colors text-[10px] font-bold flex items-center gap-0.5"
              title="Play English Speech"
            >
              <Volume2 className="w-3.5 h-3.5" /> 🇺🇸 EN
            </button>
            {/* Bookmark */}
            <button
              onClick={onToggleBookmark}
              className={`p-2 rounded-full transition-colors ${
                isSaved
                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/60'
                  : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-slate-700'
              }`}
              title="收藏"
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bilingual Title */}
        <div className="space-y-1.5">
          {langMode !== 'en' && (
            <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug">
              {item.titleZh}
            </h3>
          )}
          {langMode !== 'zh' && (
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {item.titleEn}
            </p>
          )}
        </div>

        {/* The Content Brief */}
        <div className="bg-slate-50 dark:bg-slate-900/70 rounded-2xl p-3.5 border border-slate-100 dark:border-slate-800 text-sm leading-relaxed space-y-2">
          <div className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>話題背景與梗概 (Story Brief)：</span>
          </div>

          {langMode !== 'en' && (
            <p className="text-slate-700 dark:text-slate-200">{item.contentZh}</p>
          )}

          {langMode !== 'zh' && (
            <p
              className={`text-slate-500 dark:text-slate-400 text-xs ${
                langMode === 'bilingual' ? 'pt-1 border-t border-slate-200/60 dark:border-slate-800' : ''
              }`}
            >
              {item.contentEn}
            </p>
          )}
        </div>

        {/* How to Drop in a Conversation (Bilingual) */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-orange-500" />
              <span>🗣️ 開場怎麼聊 (How to Start)：</span>
            </span>
            <button
              onClick={onCopy}
              className="text-[10px] text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-0.5 font-bold"
            >
              <Copy className="w-3 h-3" /> 複製開場句
            </button>
          </div>

          {/* Chinese Opening */}
          {langMode !== 'en' && (
            <div className="p-3.5 rounded-2xl bg-orange-50/80 dark:bg-orange-950/30 border border-orange-200/70 dark:border-orange-900/50 space-y-1.5">
              <div className="text-[10px] font-extrabold text-orange-600 dark:text-orange-400 uppercase tracking-wider flex items-center gap-1">
                <span>🇹🇼 自然中文開場</span>
              </div>
              <p className="text-sm font-bold text-orange-950 dark:text-orange-100 leading-relaxed">
                {item.openingZh}
              </p>
            </div>
          )}

          {/* English Opening */}
          {langMode !== 'zh' && (
            <div className="p-3.5 rounded-2xl bg-sky-50/80 dark:bg-sky-950/30 border border-sky-200/70 dark:border-sky-900/50 space-y-1.5">
              <div className="text-[10px] font-extrabold text-sky-600 dark:text-sky-400 uppercase tracking-wider flex items-center justify-between">
                <span>🇺🇸 Natural English Line</span>
                <span className="text-[10px] text-slate-400 font-normal">點擊上方 🇺🇸 可試聽</span>
              </div>
              <p className="text-sm font-bold text-sky-950 dark:text-sky-100 leading-relaxed">
                {item.openingEn}
              </p>
              {item.notesEn && (
                <p className="text-[10px] text-sky-700/80 dark:text-sky-300/80">{item.notesEn}</p>
              )}
            </div>
          )}
        </div>

        {/* Follow-up Questions */}
        <div className="bg-slate-50 dark:bg-slate-850 rounded-2xl p-3.5 border border-slate-200/60 dark:border-slate-750 space-y-1.5 text-sm">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>延續話題追問 (Follow-up Question)：</span>
          </div>

          {langMode !== 'en' && (
            <p className="text-slate-800 dark:text-slate-200 font-medium">🇹🇼 {item.followUpZh}</p>
          )}

          {langMode !== 'zh' && (
            <p className="text-slate-500 dark:text-slate-400 text-xs">🇺🇸 {item.followUpEn}</p>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={onPrev}
          className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> 上一個
        </button>

        <span className="text-xs font-semibold text-slate-400">
          {currentIndex + 1} / {totalCount}
        </span>

        <button
          onClick={onNext}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-600/20 transition-all flex items-center gap-1 active:scale-95"
        >
          下一個 <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
