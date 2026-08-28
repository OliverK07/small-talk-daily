# 🌐 Small Talk Daily (雙語閒聊日報)

> **告別冷場與社交焦慮的隨身話題錦囊 · 中英雙語對照 · Google Trends 即時熱搜趨勢**
>
> _Your bilingual small-talk companion for Taiwan office life, powered by Google Trends and natural conversation starters_

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ✨ 核心特色 (Key Features)

1. **🔥 Google Trends 即時熱搜趨勢 (Google Trends Buzz)**
   * 每天自動串接台灣與全球 Google Trends 搜尋飆升榜。
   * 將時事、文化、科技話題轉化為 30 秒安全、有趣的聊天破冰切入點。

2. **🌐 全面中英雙語對照 (Bilingual Chinese & English)**
   * **🇹🇼 自然中文開場** ＋ **🇺🇸 Natural English Line**。
   * 附地道口語短語與俚語解析（如 `blowing up with`, `spot shooting stars`, `binge-watching`）。
   * 支援「中英對照」、「僅中文」或「English Only」一鍵切換。

3. **🔊 雙語獨立語音朗讀 (Native Web Speech TTS)**
   * 提供 🇹🇼 中文 與 🇺🇸 美式英語 獨立語音試聽按鈕，隨時隨地練習自然發音與語調。

4. **☕ 經典閒聊素材 (Classic Icebreakers)**
   * 咖啡茶水間、週末放鬆、隱藏版美食、通勤影集等不敗百搭主題。

5. **😂 幽默笑話與雙語梗 (Jokes & Dad Jokes)**
   * 3 秒防冷場的工程師雙關梗、打工族生活自嘲與互動破冰題。

6. **📱 極簡直覺互動**
   * **🎲 隨機抽一張**：選擇障礙時一鍵即抽。
   * **📋 一鍵複製**：快速複製開場句。
   * **⭐ 口袋收藏庫**：點擊星號離線收藏常用話題。
   * **📱/💻 雙視圖切換**：iPhone 16 手機框模式與全寬模式自由切換。

---

## 🛠️ 技術棧 (Tech Stack)

* **前端框架**：React 19 + TypeScript + Vite
* **樣式庫**：Tailwind CSS v4 + Lucide React Icons
* **語音能力**：Web Speech Synthesis API
* **互動特效**：Canvas Confetti
* **趨勢管線**：Google Trends RSS Ingestion Engine (Node.js)

---

## 📚 話題卡牌結構 (Topic Deck Structure)

專案內建三大類話題卡牌，存放於 `src/data/topics.ts`：

### 🔥 Google 趨勢 (Trends) — 約 7 張卡片
* 追蹤台灣與全球即時熱搜話題（世足賽、科技新聞、颱風天氣、國防議題等）
* **注意**：趨勢話題時效性強，建議每 1-2 週檢查更新
* 更新方式：
  1. 執行 `npm run fetch:trends` 查看最新 Google Trends 熱搜
  2. 手動編輯 `src/data/topics.ts` 將過時卡片替換為新趨勢
  3. 保持 `trendSource` 標註來源與真實性（避免編造假數據）

### ☕ 經典閒聊 (Classic) — 約 12 張卡片
* 不敗百搭的台灣日常話題（咖啡、午餐、通勤、夜市、手搖飲、颱風假、週末計畫等）
* 適用於任何時間、任何場合的辦公室 / 電梯 / 茶水間破冰
* 這些卡片長青不過時，可隨時依在地文化新增更多主題

### 😂 幽默笑話 (Jokes) — 約 10 張卡片
* 3 秒防冷場的雙語冷笑話、工程師梗、上班族自嘲梗
* 乾淨、安全、適合職場的幽默內容
* 中英雙語雙關梗，既練口語又能輕鬆開場

所有卡片遵循 `TopicItem` schema（定義於 `src/types/topic.ts`），包含標題、內容、開場白、延伸提問及英語用法筆記。

---

## 🚀 快速開始 (Quick Start)

### 1. 安裝依賴 (Install Dependencies)
```bash
npm install
```

### 2. 本地開發伺服器 (Start Dev Server)
```bash
npm run dev
```
瀏覽器開啟：`http://localhost:3000`

### 3. 構建生產版本 (Production Build)
```bash
npm run build
npm run preview
```

### 4. （選用）刷新 Google Trends 熱搜話題
```bash
npm run fetch:trends
```
此腳本會自動擷取台灣與全球 Google Trends RSS，顯示最新熱搜關鍵字與流量數據。

**重要提醒**：腳本僅顯示趨勢數據，不會自動更新 `src/data/topics.ts`。你需要：
1. 查看腳本輸出的熱搜關鍵字
2. 手動編輯 `src/data/topics.ts` 替換過時的趨勢卡片
3. 撰寫自然、可用的中英雙語開場白與延伸話題
4. 保持 `trendSource` 欄位的真實性（不要編造假的 "+500% 飆升" 數據）

---

## 📄 License
MIT License.
