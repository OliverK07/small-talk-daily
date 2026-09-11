# 部署指南 (Deployment Guide)

## 🚀 部署到 Cloudflare Workers

### 前提条件
1. Cloudflare 账号（免费账号即可）
2. Node.js 和 npm 已安装

### 步骤 1: 登录 Cloudflare

```bash
npx wrangler login
```

这会打开浏览器让你授权 Wrangler 访问你的 Cloudflare 账号。

### 步骤 2: 配置 wrangler.jsonc

如果需要，可以修改 Worker 名称：

```jsonc
{
  "name": "your-discussion-platform",  // 修改为你想要的名称
  ...
}
```

### 步骤 3: 部署

```bash
npm run deploy
```

部署成功后，你会看到类似这样的输出：

```
Published llm-discussion-platform (1.23 sec)
  https://llm-discussion-platform.your-subdomain.workers.dev
```

### 步骤 4: 测试部署的 API

```bash
# 替换为你的实际 URL
API_URL="https://llm-discussion-platform.your-subdomain.workers.dev"

# 创建讨论
curl -X POST $API_URL/discussions \
  -H "Content-Type: application/json" \
  -d '{"topic":"测试讨论"}'
```

## 🌐 自定义域名（可选）

### 在 Cloudflare Dashboard 中设置

1. 登录 Cloudflare Dashboard
2. 进入 **Workers & Pages**
3. 选择你的 Worker
4. 点击 **Settings** → **Triggers** → **Custom Domains**
5. 添加你的域名（例如：`api.yourdomain.com`）

### 或使用 Wrangler 命令

```bash
npx wrangler deploy --routes "api.yourdomain.com/*"
```

## 📊 监控和日志

### 查看实时日志

```bash
npx wrangler tail
```

### 在 Dashboard 中查看

1. 登录 Cloudflare Dashboard
2. 进入 **Workers & Pages**
3. 选择你的 Worker
4. 查看 **Metrics** 和 **Logs**

## 🔒 安全建议

### 1. 添加速率限制

在生产环境中，建议添加速率限制以防止滥用：

```typescript
// 在 fetch handler 中添加
const rateLimiter = new RateLimiter(env);
const allowed = await rateLimiter.check(request);
if (!allowed) {
  return Response.json(
    { error: "Too many requests" },
    { status: 429 }
  );
}
```

### 2. 添加认证

考虑添加 API 密钥认证：

```typescript
const apiKey = request.headers.get("X-API-Key");
if (!apiKey || apiKey !== env.API_SECRET) {
  return Response.json(
    { error: "Unauthorized" },
    { status: 401 }
  );
}
```

在 `wrangler.jsonc` 中配置环境变量：

```jsonc
{
  "vars": {
    "API_SECRET": "your-secret-key"
  }
}
```

### 3. CORS 配置

根据你的需求调整 CORS 设置：

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://yourdomain.com", // 只允许特定域名
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
};
```

## 💰 成本估算

Cloudflare Workers 免费套餐包含：
- ✅ 每天 100,000 次请求
- ✅ 10ms CPU 时间/请求
- ✅ 无限带宽

Durable Objects 定价（超出免费额度）：
- 💵 $0.15 per million requests
- 💵 $0.20 per million reads/writes
- 💵 $0.50 per GB-month storage

对于大多数应用，免费套餐已经足够。

## 🔄 更新和回滚

### 更新到新版本

```bash
git pull
npm run deploy
```

### 回滚到之前的版本

```bash
# 查看部署历史
npx wrangler deployments list

# 回滚到指定版本
npx wrangler rollback [deployment-id]
```

## 🐛 故障排查

### 问题：部署失败

**解决方案**：
```bash
# 清理缓存
rm -rf node_modules .wrangler
npm install
npm run deploy
```

### 问题：Durable Object 找不到

**解决方案**：
检查 `wrangler.jsonc` 中的 migrations 配置是否正确。

### 问题：请求超时

**解决方案**：
- 检查网络连接
- 查看 Worker 日志：`npx wrangler tail`
- 确认 Durable Object 初始化正常

## 📞 支持

如有问题，请参考：
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Durable Objects 文档](https://developers.cloudflare.com/durable-objects/)
- [Wrangler 文档](https://developers.cloudflare.com/workers/wrangler/)
