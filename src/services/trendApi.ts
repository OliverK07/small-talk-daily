import { TopicItem } from '../types/topic';

/**
 * API Card schema from Worker (snake_case + nested zh/en)
 */
interface ApiCard {
  topic_id: string;
  category: 'TaiwanTrends' | 'GlobalTrends' | 'Classic' | 'Joke';
  region: 'TW' | 'GLOBAL';
  category_name: string;
  badge_class: string;
  trend_source: string;
  title: {
    zh: string;
    en: string;
  };
  background: {
    zh: string;
    en: string;
  };
  icebreaker_question: {
    zh: string;
    en: string;
  };
  follow_up_suggestions: Array<{
    zh: string;
    en: string;
  }>;
  notes: {
    zh: string;
    en: string;
  };
  trivia?: {
    zh: string;
    en: string;
  };
}

/**
 * Expand stub cards with natural icebreaker templates
 */
function expandStubCard(card: ApiCard): { openingZh: string; openingEn: string } {
  const titleZh = card.title.zh;
  const titleEn = card.title.en;
  
  // Check if it looks like a stub (very short title, no real icebreaker)
  const isStub = card.icebreaker_question.zh.length < 15 || 
                 titleZh.includes('熱搜話題') ||
                 titleZh.includes('buffalo bills');
  
  if (!isStub) {
    return {
      openingZh: card.icebreaker_question.zh,
      openingEn: card.icebreaker_question.en,
    };
  }

  // Extract keyword from title
  const keyword = titleZh.replace(/^熱門熱搜話題[：:]\s*/, '').trim();
  
  // Generate natural icebreaker
  const templates = [
    {
      zh: `「你有看到最近 ${keyword} 的新聞嗎？好像蠻多人在討論的耶！」`,
      en: `Have you seen the news about ${titleEn}? Seems like a lot of people are talking about it!`,
    },
    {
      zh: `「最近大家都在搜尋 ${keyword}，你有關注嗎？」`,
      en: `Everyone's been searching for ${titleEn} lately. Have you been following it?`,
    },
    {
      zh: `「話說你知道 ${keyword} 嗎？我看好多人在討論！」`,
      en: `Have you heard about ${titleEn}? I've seen so many people discussing it!`,
    },
  ];
  
  const template = templates[Math.floor(Math.random() * templates.length)];
  return {
    openingZh: template.zh,
    openingEn: template.en,
  };
}

/**
 * Map API card to TopicItem schema
 */
function mapApiCardToTopicItem(card: ApiCard): TopicItem {
  const { openingZh, openingEn } = expandStubCard(card);
  
  return {
    id: card.topic_id,
    category: 'trend',
    categoryName: card.category_name,
    badgeClass: card.badge_class,
    trendSource: card.trend_source,
    titleZh: card.title.zh,
    titleEn: card.title.en,
    contentZh: card.background.zh,
    contentEn: card.background.en,
    openingZh,
    openingEn,
    notesEn: card.notes.en,
    followUpZh: card.follow_up_suggestions[0]?.zh || '「你對這個話題有什麼看法？」',
    followUpEn: card.follow_up_suggestions[0]?.en || 'What do you think about this topic?',
  };
}

/**
 * Fetch live trend cards from API
 */
export async function fetchLiveTrendCards(): Promise<{
  cards: TopicItem[];
  isLive: boolean;
}> {
  try {
    // Fetch Taiwan + Global trends
    const [twResponse, globalResponse] = await Promise.allSettled([
      fetch('/api/cards/draw?category=TaiwanTrends&limit=10'),
      fetch('/api/cards/draw?category=GlobalTrends&limit=10'),
    ]);

    const cards: TopicItem[] = [];

    // Process Taiwan trends
    if (twResponse.status === 'fulfilled' && twResponse.value.ok) {
      const twData: ApiCard[] = await twResponse.value.json();
      cards.push(...twData.map(mapApiCardToTopicItem));
    }

    // Process Global trends
    if (globalResponse.status === 'fulfilled' && globalResponse.value.ok) {
      const globalData: ApiCard[] = await globalResponse.value.json();
      cards.push(...globalData.map(mapApiCardToTopicItem));
    }

    // Return live cards if we got any
    if (cards.length > 0) {
      return { cards, isLive: true };
    }

    // No cards fetched, will fall back
    return { cards: [], isLive: false };
  } catch (error) {
    console.error('Failed to fetch live trend cards:', error);
    return { cards: [], isLive: false };
  }
}
