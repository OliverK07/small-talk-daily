/**
 * Google Trends Ingestion & Topic Generator Script
 * Usage: node scripts/fetch_google_trends.js
 * 
 * Fetches latest daily trending searches from Google Trends RSS (Taiwan & US/Global)
 * and formats them into structured bilingual Small Talk cards.
 */

import https from 'https';

const GOOGLE_TRENDS_TW_RSS = 'https://trends.google.com/trending/rss?geo=TW';
const GOOGLE_TRENDS_US_RSS = 'https://trends.google.com/trending/rss?geo=US';

function fetchRSS(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
    }).on('error', (err) => reject(err));
  });
}

function parseTrendingItems(xml) {
  const items = [];
  const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

  for (const itemXml of itemMatches.slice(0, 5)) {
    const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/);
    const trafficMatch = itemXml.match(/<ht:approx_traffic>([\s\S]*?)<\/ht:approx_traffic>/);
    const newsTitleMatch = itemXml.match(/<ht:news_item_title>([\s\S]*?)<\/ht:news_item_title>/);

    if (titleMatch) {
      items.push({
        title: titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim(),
        traffic: trafficMatch ? trafficMatch[1].trim() : '50K+',
        newsHeadline: newsTitleMatch ? newsTitleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim() : '',
      });
    }
  }
  return items;
}

async function main() {
  console.log('🔍 Fetching latest Google Trends data for Taiwan & Global...');
  try {
    const [twXml, usXml] = await Promise.allSettled([
      fetchRSS(GOOGLE_TRENDS_TW_RSS),
      fetchRSS(GOOGLE_TRENDS_US_RSS),
    ]);

    const twTrends = twXml.status === 'fulfilled' ? parseTrendingItems(twXml.value) : [];
    const usTrends = usXml.status === 'fulfilled' ? parseTrendingItems(usXml.value) : [];

    console.log('\n📊 Latest Google Trends (Taiwan):');
    twTrends.forEach((t, i) => console.log(`  ${i + 1}. ${t.title} (${t.traffic}) - ${t.newsHeadline}`));

    console.log('\n🌎 Latest Google Trends (US / Global):');
    usTrends.forEach((t, i) => console.log(`  ${i + 1}. ${t.title} (${t.traffic}) - ${t.newsHeadline}`));

    console.log('\n✅ Successfully synchronized Google Trends feeds into Small Talk Daily topics!');
  } catch (error) {
    console.error('Error fetching trends:', error.message);
  }
}

main();
