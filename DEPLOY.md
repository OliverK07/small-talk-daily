# 部署設定指南 | Deployment Setup

## Cloudflare Pages 自動預覽部署

### 需要的 GitHub Secrets

前往 GitHub repo → Settings → Secrets and variables → Actions，新增以下 secrets：

1. **CLOUDFLARE_API_TOKEN**
   - 在 Cloudflare Dashboard → My Profile → API Tokens → Create Token
   - 使用模板："Edit Cloudflare Workers"
   - 或建立 custom token with permissions:
     - Account: Cloudflare Pages - Edit
     - Zone: (not needed for Pages-only)
   
2. **CLOUDFLARE_ACCOUNT_ID**
   - 在 Cloudflare Dashboard → 右側邊欄找到 Account ID
   - 格式：32 位英數字（例：`a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`）

### 設定完成後

1. 推送到 `cursor/*` 分支會自動觸發預覽部署
2. PR 會自動收到包含預覽 URL 的留言
3. 預覽 URL 格式：`https://<branch>.<project>.pages.dev`
4. Pages Function (`functions/api/[[path]].ts`) 會自動包含在部署中

### 手動部署（如果需要）

```bash
# 安裝 wrangler（已在 package.json）
npm install

# 建置前端
npm run build

# 登入 Cloudflare
npx wrangler login

# 部署到 Pages（預覽分支）
npx wrangler pages deploy dist \
  --project-name=small-talk-daily \
  --branch=cursor/enrich-content-ec16
```

## 正式環境保護

GitHub Action 配置為：
- 只部署 PR 和 `cursor/*` 分支作為**預覽**
- 使用 `branch` 參數確保不會覆蓋 production
- production (https://small-talk-daily.pages.dev) 維持不變

## 檢查部署狀態

1. GitHub Actions tab → "Deploy Pages Preview" workflow
2. Cloudflare Dashboard → Pages → small-talk-daily → Deployments
3. 找到對應的分支預覽（branch name 會顯示）
