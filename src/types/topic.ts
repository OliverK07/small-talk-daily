export type CategoryType = 'trend' | 'classic' | 'joke';

export type LanguageMode = 'bilingual' | 'zh' | 'en';

export interface TopicItem {
  id: string;
  category: CategoryType;
  categoryName: string;
  badgeClass: string;
  trendSource: string; // e.g. "Google Trends: 吉伊卡哇 熱氣球 (+500% 飆升)"
  titleZh: string;
  titleEn: string;
  contentZh: string;
  contentEn: string;
  openingZh: string;
  openingEn: string;
  notesEn?: string;
  followUpZh: string;
  followUpEn: string;
}
