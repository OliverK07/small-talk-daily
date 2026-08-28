import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CardDeck } from './components/CardDeck';
import { Toast } from './components/Toast';
import { initialTopics } from './data/topics';
import { CategoryType, LanguageMode, TopicItem } from './types/topic';
import { fetchLiveTrendCards } from './services/trendApi';

export const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('trend');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [langMode, setLangMode] = useState<LanguageMode>('bilingual');
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    const stored = localStorage.getItem('std_saved_ids');
    return stored ? JSON.parse(stored) : ['tr1'];
  });
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [trendCards, setTrendCards] = useState<TopicItem[]>(initialTopics.trend);

  // Fetch live trend cards on mount
  useEffect(() => {
    const loadTrends = async () => {
      const result = await fetchLiveTrendCards();
      
      if (result.isLive && result.cards.length > 0) {
        setTrendCards(result.cards);
      } else {
        // Fallback to static trends
        setTrendCards(initialTopics.trend);
      }
    };
    
    loadTrends();
  }, []);

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
    showToast(
      cat === 'trend' ? '🔥 Google 趨勢' : 
      cat === 'classic' ? '☕ 經典閒聊' : 
      '😂 幽默笑話'
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % currentList.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + currentList.length) % currentList.length);
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

  return (
    <div className="min-h-screen flex flex-col antialiased bg-slate-50 dark:bg-slate-950">
      {/* Full viewport card container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-2xl">
          <CardDeck
            item={currentItem}
            currentIndex={currentIndex}
            totalCount={currentList.length}
            langMode={langMode}
            isSaved={savedIds.includes(currentItem.id)}
            onToggleBookmark={handleToggleBookmark}
            onNext={handleNext}
            onPrev={handlePrev}
            onSpeak={handleSpeak}
            onLangChange={setLangMode}
            activeCategory={activeCategory}
            onSelectCategory={handleSelectCategory}
          />
        </div>
      </main>

      {/* Toast Feedback */}
      <Toast message={toastMsg} />
    </div>
  );
};
export default App;
