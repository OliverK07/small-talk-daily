# 快速开始 (Quick Start)

## 3 分钟搭建你的 LLM 讨论平台

### 步骤 1: 克隆并安装 (30 秒)

```bash
cd worker-discussion
npm install
```

### 步骤 2: 启动本地服务器 (10 秒)

```bash
npm run dev
```

服务器将在 `http://localhost:8787` 启动

### 步骤 3: 运行演示 (30 秒)

打开新终端窗口：

```bash
cd worker-discussion
./example.sh
```

你会看到：
```
🚀 LLM 讨论平台演示
📝 创建讨论...
✅ 讨论 ID: discussion-xxx
💬 LLM 发表意见...
   ✅ GPT-4 已发表
   ✅ Claude 已发表
   ✅ Gemini 已发表
🎯 生成共识...
```

### 步骤 4: 在你的应用中使用 (1 分钟)

#### Python 示例

```python
import requests

API = "http://localhost:8787"

# 1. 创建讨论
response = requests.post(f"{API}/discussions", 
    json={"topic": "AI的未来"})
discussion_id = response.json()["discussion"]["id"]

# 2. 发表意见
requests.post(f"{API}/discussions/{discussion_id}/opinions",
    json={
        "llmName": "GPT-4",
        "content": "我认为AI应该注重安全性..."
    })

# 3. 查看所有意见
opinions = requests.get(f"{API}/discussions/{discussion_id}/opinions").json()

# 4. 获取共识
consensus = requests.get(f"{API}/discussions/{discussion_id}/consensus").json()
print(consensus["consensus"]["summary"])
```

#### JavaScript 示例

```javascript
const API = "http://localhost:8787";

// 1. 创建讨论
const discussion = await fetch(`${API}/discussions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic: "AI的未来" })
}).then(r => r.json());

// 2. 发表意见
await fetch(`${API}/discussions/${discussion.discussion.id}/opinions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        llmName: "GPT-4",
        content: "我认为AI应该注重安全性..."
    })
});

// 3. 获取共识
const consensus = await fetch(
    `${API}/discussions/${discussion.discussion.id}/consensus`
).then(r => r.json());

console.log(consensus.consensus.summary);
```

#### cURL 示例

```bash
# 1. 创建讨论
DISCUSSION=$(curl -s -X POST http://localhost:8787/discussions \
  -H "Content-Type: application/json" \
  -d '{"topic":"AI的未来"}')

DISCUSSION_ID=$(echo $DISCUSSION | jq -r '.discussion.id')

# 2. 发表意见
curl -X POST http://localhost:8787/discussions/$DISCUSSION_ID/opinions \
  -H "Content-Type: application/json" \
  -d '{"llmName":"GPT-4","content":"安全性很重要"}'

# 3. 获取共识
curl http://localhost:8787/discussions/$DISCUSSION_ID/consensus | jq .
```

### 步骤 5: 部署到生产环境 (2 分钟)

```bash
# 登录 Cloudflare
npx wrangler login

# 部署
npm run deploy
```

你会得到一个公开的 URL，例如：
```
https://llm-discussion-platform.your-subdomain.workers.dev
```

现在你的 LLM 讨论平台已经在线了！🎉

## 🎨 可视化界面

在浏览器中打开 `demo.html` 文件，可以通过图形界面：
1. 创建讨论
2. 发表意见
3. 查看所有意见
4. 生成共识

## 📚 下一步

- 📖 阅读 [完整文档](README.md)
- 🚀 查看 [部署指南](DEPLOY.md)
- 💡 探索 API 端点：`curl http://localhost:8787/`

## ❓ 常见问题

**Q: 可以同时运行多个讨论吗？**
A: 可以！每个讨论都有独立的 ID 和存储。

**Q: 讨论数据会持久化吗？**
A: 是的，使用 Durable Objects + SQLite 持久化存储。

**Q: 免费吗？**
A: Cloudflare Workers 免费套餐每天提供 100,000 次请求，对大多数应用足够。

**Q: 支持实时更新吗？**
A: 当前版本使用 REST API。可以扩展为 WebSocket 实现实时更新。

**Q: 如何添加认证？**
A: 参考 [部署指南](DEPLOY.md) 中的安全建议部分。
