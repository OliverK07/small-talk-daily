import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { CategoryNav } from './components/CategoryNav';
import { CardDeck } from './components/CardDeck';
import { SavedDrawer } from './components/SavedDrawer';
import { Toast } from './components/Toast';
import { initialTopics } from './data/topics';
import { CategoryType, LanguageMode, TopicItem } from './types/topic';
import { fetchLiveTrendCards } from './services/trendApi';

export const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('trend');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [langMode, setLangMode] = useState<LanguageMode>('bilingual');
  const [viewMode, setViewMode] = useState<'mobile' | 'full'>('mobile');
  const [isDark, setIsDark] = useState<boolean>(false);
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    const stored = localStorage.getItem('std_saved_ids');
    return stored ? JSON.parse(stored) : ['tr1'];
  });
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('09:41');
  const [trendCards, setTrendCards] = useState<TopicItem[]>(initialTopics.trend);
  const [isTrendsLive, setIsTrendsLive] = useState<boolean>(false);
  const [isLoadingTrends, setIsLoadingTrends] = useState<boolean>(true);

  // Fetch live trend cards on mount
  useEffect(() => {
    const loadTrends = async () => {
      setIsLoadingTrends(true);
      const result = await fetchLiveTrendCards();
      
      if (result.isLive && result.cards.length > 0) {
        setTrendCards(result.cards);
        setIsTrendsLive(true);
      } else {
        // Fallback to static trends
        setTrendCards(initialTopics.trend);
        setIsTrendsLive(false);
      }
      setIsLoadingTrends(false);
    };
    
    loadTrends();
  }, []);

  // Clock in status bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${h}:${m}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Persist Bookmarks
  useEffect(() => {
    localStorage.setItem('std_saved_ids', JSON.stringify(savedIds));
  }, [savedIds]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2400);
  };

  // Use live trends for 'trend' category, static for classic/joke
  const topics = {
    trend: trendCards,
    classic: initialTopics.classic,
    joke: initialTopics.joke,
  };

  const currentList = topics[activeCategory];
  const currentItem: TopicItem = currentList[currentIndex] || currentList[0];

  const handleSelectCategory = (cat: CategoryType) => {
    setActiveCategory(cat);
    setCurrentIndex(0);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % currentList.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + currentList.length) % currentList.length);
  };

  const handleRandomPick = () => {
    const cats: CategoryType[] = ['trend', 'classic', 'joke'];
    const randomCat = cats[Math.floor(Math.random() * cats.length)];
    const list = topics[randomCat];
    const randomIdx = Math.floor(Math.random() * list.length);

    setActiveCategory(randomCat);
    setCurrentIndex(randomIdx);
    showToast('🎲 已隨機為您抽取一則雙語素材！');
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
  };

  const handleToggleBookmark = () => {
    if (savedIds.includes(currentItem.id)) {
      setSavedIds((prev) => prev.filter((id) => id !== currentItem.id));
      showToast('已從口袋收藏移除');
    } else {
      setSavedIds((prev) => [...prev, currentItem.id]);
      showToast('已收藏至口袋錦囊 ⭐');
      confetti({ particleCount: 45, spread: 45, origin: { y: 0.8 } });
    }
  };

  const handleCopy = () => {
    let textToCopy = '';
    if (langMode === 'zh') {
      textToCopy = currentItem.openingZh;
    } else if (langMode === 'en') {
      textToCopy = currentItem.openingEn;
    } else {
      textToCopy = `${currentItem.openingZh}\n${currentItem.openingEn}`;
    }
    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast('已複製開場白到剪貼簿 📋');
    });
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast('已複製到剪貼簿 📋');
    });
  };

  const handleSpeak = (lang: 'zh' | 'en') => {
    const textToSpeak = lang === 'en' ? currentItem.openingEn : currentItem.openingZh;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const clean = textToSpeak.replace(/^[“"「]|[”"」]$/g, '');
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = lang === 'en' ? 'en-US' : 'zh-TW';
      utterance.rate = lang === 'en' ? 0.95 : 1.0;
      window.speechSynthesis.speak(utterance);
      showToast(lang === 'en' ? '正在播放美式英語示範發音 🔊' : '正在播放繁體中文示範發音 🔊');
    } else {
      showToast('瀏覽器暫不支援語音播放');
    }
  };

  // Collect all saved items
  const allItems = [
    ...topics.trend,
    ...topics.classic,
    ...topics.joke,
  ];
  const savedItems = allItems.filter((item) => savedIds.includes(item.id));

  return (
    <div className="min-h-screen flex flex-col antialiased">
      {/* Top Controller Bar */}
      <Header
        langMode={langMode}
        onLangChange={setLangMode}
        viewMode={viewMode}
        onViewChange={setViewMode}
        isDark={isDark}
        onThemeToggle={() => setIsDark(!isDark)}
      />

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden">
        <div
          className={`bg-white dark:bg-slate-900 relative flex flex-col overflow-hidden device-screen ${
            viewMode === 'full'
              ? 'w-full max-w-2xl h-[820px] rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800'
              : 'w-full max-w-[440px] h-[820px] rounded-[40px] shadow-2xl border-[8px] border-slate-800 dark:border-slate-700'
          }`}
        >
          {/* Top Dynamic Island / Status Bar */}
          <div className="h-10 pt-2 px-6 flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 z-30 select-none">
            <span className="text-[12px] tracking-tight">{currentTime}</span>
            <div className="w-20 h-4 bg-black rounded-full flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-orange-500/40"></div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span>5G</span>
              <span>100%</span>
            </div>
          </div>

          {/* Navigation Category Tabs */}
          <CategoryNav
            activeCategory={activeCategory}
            onSelectCategory={handleSelectCategory}
            onRandomPick={handleRandomPick}
          />

          {/* Main Card Viewport */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            <CardDeck
              item={currentItem}
              currentIndex={currentIndex}
              totalCount={currentList.length}
              langMode={langMode}
              isSaved={savedIds.includes(currentItem.id)}
              onToggleBookmark={handleToggleBookmark}
              onNext={handleNext}
              onPrev={handlePrev}
              onCopy={handleCopy}
              onSpeak={handleSpeak}
            />

            {/* Saved Bookmarks Drawer */}
            <SavedDrawer savedItems={savedItems} onCopyText={handleCopyText} />
          </div>

          {/* Bottom Minimal Info Bar */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 px-6">
            <span className="flex items-center gap-1">
              {isLoadingTrends ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-slate-400 inline-block animate-pulse"></span>
                  載入中...
                </>
              ) : isTrendsLive && activeCategory === 'trend' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse"></span>
                  即時趨勢
                </>
              ) : activeCategory === 'trend' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                  靜態備援
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-sky-500 inline-block"></span>
                  精選話題
                </>
              )}
            </span>
            <span className="font-medium text-slate-500 dark:text-slate-400">
              雙語對照 · 輕鬆開聊
            </span>
          </div>
        </div>
      </main>

      {/* Toast Feedback */}
      <Toast message={toastMsg} />
    </div>
  );
};
export default App;
