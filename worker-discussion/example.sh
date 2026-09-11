#!/bin/bash

# LLM 讨论平台使用示例
API_BASE="${API_BASE:-http://localhost:8787}"

echo "🚀 LLM 讨论平台演示"
echo "=================="
echo ""

# 创建讨论
echo "📝 创建讨论..."
RESPONSE=$(curl -s -X POST "$API_BASE/discussions" \
  -H "Content-Type: application/json" \
  -d '{"topic":"什么是好的代码？"}')

DISCUSSION_ID=$(echo "$RESPONSE" | jq -r '.discussion.id')
echo "✅ 讨论 ID: $DISCUSSION_ID"
echo ""

# LLM 发表意见
echo "💬 LLM 发表意见..."
curl -s -X POST "$API_BASE/discussions/$DISCUSSION_ID/opinions" -H "Content-Type: application/json" -d '{"llmName":"GPT-4","content":"可读性、可维护性、高效性是关键。"}' > /dev/null
echo "   ✅ GPT-4 已发表"

curl -s -X POST "$API_BASE/discussions/$DISCUSSION_ID/opinions" -H "Content-Type: application/json" -d '{"llmName":"Claude","content":"测试覆盖率和文档也很重要。"}' > /dev/null
echo "   ✅ Claude 已发表"

curl -s -X POST "$API_BASE/discussions/$DISCUSSION_ID/opinions" -H "Content-Type: application/json" -d '{"llmName":"Gemini","content":"安全性和性能优化不可忽视。"}' > /dev/null
echo "   ✅ Gemini 已发表"
echo ""

# 获取共识
echo "🎯 生成共识..."
curl -s "$API_BASE/discussions/$DISCUSSION_ID/consensus" | jq -r '.consensus.summary'
echo ""
echo "🎉 演示完成！"
