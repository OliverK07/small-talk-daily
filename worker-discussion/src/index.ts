import { DurableObject } from "cloudflare:workers";

export interface Env {
  DISCUSSION_ROOM: DurableObjectNamespace<DiscussionRoom>;
}

interface Opinion {
  id: string;
  llmName: string;
  content: string;
  timestamp: number;
}

interface Discussion {
  id: string;
  topic: string;
  createdAt: number;
}

/**
 * DiscussionRoom Durable Object - 代表一个讨论主题
 * 每个讨论都有独立的状态和存储
 */
export class DiscussionRoom extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    
    // 初始化数据库结构
    ctx.blockConcurrencyWhile(async () => {
      this.ctx.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS discussions (
          id TEXT PRIMARY KEY,
          topic TEXT NOT NULL,
          created_at INTEGER NOT NULL
        )
      `);
      
      this.ctx.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS opinions (
          id TEXT PRIMARY KEY,
          llm_name TEXT NOT NULL,
          content TEXT NOT NULL,
          timestamp INTEGER NOT NULL
        )
      `);
    });
  }

  /**
   * 初始化讨论主题
   */
  async initDiscussion(topic: string, discussionId: string): Promise<Discussion> {
    const createdAt = Date.now();
    
    this.ctx.storage.sql.exec(
      "INSERT OR REPLACE INTO discussions (id, topic, created_at) VALUES (?, ?, ?)",
      discussionId,
      topic,
      createdAt
    );
    
    return { id: discussionId, topic, createdAt };
  }

  /**
   * 获取讨论信息
   */
  async getDiscussion(): Promise<Discussion | null> {
    const result = this.ctx.storage.sql.exec<Discussion>(
      "SELECT id, topic, created_at as createdAt FROM discussions LIMIT 1"
    );
    
    const row = result.one();
    return row || null;
  }

  /**
   * 发表意见
   */
  async postOpinion(llmName: string, content: string): Promise<Opinion> {
    const id = crypto.randomUUID();
    const timestamp = Date.now();
    
    this.ctx.storage.sql.exec(
      "INSERT INTO opinions (id, llm_name, content, timestamp) VALUES (?, ?, ?, ?)",
      id,
      llmName,
      content,
      timestamp
    );
    
    return { id, llmName, content, timestamp };
  }

  /**
   * 获取所有意见
   */
  async getOpinions(): Promise<Opinion[]> {
    const result = this.ctx.storage.sql.exec<{
      id: string;
      llm_name: string;
      content: string;
      timestamp: number;
    }>(
      "SELECT id, llm_name, content, timestamp FROM opinions ORDER BY timestamp ASC"
    );
    
    return result.toArray().map(row => ({
      id: row.id,
      llmName: row.llm_name,
      content: row.content,
      timestamp: row.timestamp
    }));
  }

  /**
   * 生成共识 - 汇总所有意见
   */
  async generateConsensus(): Promise<{
    topic: string;
    totalOpinions: number;
    opinions: Opinion[];
    summary: string;
  }> {
    const discussion = await this.getDiscussion();
    const opinions = await this.getOpinions();
    
    if (!discussion) {
      throw new Error("Discussion not found");
    }
    
    // 简单的共识总结
    const summary = this.summarizeOpinions(discussion.topic, opinions);
    
    return {
      topic: discussion.topic,
      totalOpinions: opinions.length,
      opinions,
      summary
    };
  }

  /**
   * 简单的意见总结算法
   */
  private summarizeOpinions(topic: string, opinions: Opinion[]): string {
    if (opinions.length === 0) {
      return "没有意见被发表。";
    }
    
    const llmNames = Array.from(new Set(opinions.map(o => o.llmName)));
    
    let summary = `关于主题"${topic}"，共有${opinions.length}个意见来自${llmNames.length}个LLM参与者：\n\n`;
    
    llmNames.forEach(name => {
      const llmOpinions = opinions.filter(o => o.llmName === name);
      summary += `【${name}】发表了${llmOpinions.length}个意见\n`;
    });
    
    summary += `\n各方观点已记录，建议人工或使用LLM进一步分析以达成最终共识。`;
    
    return summary;
  }
}

/**
 * Worker 主入口 - 处理HTTP请求
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    
    // 处理 OPTIONS 请求
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    
    try {
      // POST /discussions - 创建新讨论
      if (path === "/discussions" && request.method === "POST") {
        const body = await request.json() as { topic: string };
        
        if (!body.topic) {
          return Response.json(
            { error: "topic is required" },
            { status: 400, headers: corsHeaders }
          );
        }
        
        // 使用主题作为唯一标识符
        const discussionId = `discussion-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const stub = env.DISCUSSION_ROOM.idFromName(discussionId);
        const room = env.DISCUSSION_ROOM.get(stub);
        
        const discussion = await room.initDiscussion(body.topic, discussionId);
        
        return Response.json(
          { success: true, discussion },
          { headers: corsHeaders }
        );
      }
      
      // POST /discussions/:id/opinions - 发表意见
      const postOpinionMatch = path.match(/^\/discussions\/([^\/]+)\/opinions$/);
      if (postOpinionMatch && request.method === "POST") {
        const discussionId = postOpinionMatch[1];
        const body = await request.json() as { llmName: string; content: string };
        
        if (!body.llmName || !body.content) {
          return Response.json(
            { error: "llmName and content are required" },
            { status: 400, headers: corsHeaders }
          );
        }
        
        const stub = env.DISCUSSION_ROOM.idFromName(discussionId);
        const room = env.DISCUSSION_ROOM.get(stub);
        
        const opinion = await room.postOpinion(body.llmName, body.content);
        
        return Response.json(
          { success: true, opinion },
          { headers: corsHeaders }
        );
      }
      
      // GET /discussions/:id/opinions - 获取所有意见
      const getOpinionsMatch = path.match(/^\/discussions\/([^\/]+)\/opinions$/);
      if (getOpinionsMatch && request.method === "GET") {
        const discussionId = getOpinionsMatch[1];
        
        const stub = env.DISCUSSION_ROOM.idFromName(discussionId);
        const room = env.DISCUSSION_ROOM.get(stub);
        
        const discussion = await room.getDiscussion();
        const opinions = await room.getOpinions();
        
        return Response.json(
          { success: true, discussion, opinions },
          { headers: corsHeaders }
        );
      }
      
      // GET /discussions/:id/consensus - 获取共识
      const getConsensusMatch = path.match(/^\/discussions\/([^\/]+)\/consensus$/);
      if (getConsensusMatch && request.method === "GET") {
        const discussionId = getConsensusMatch[1];
        
        const stub = env.DISCUSSION_ROOM.idFromName(discussionId);
        const room = env.DISCUSSION_ROOM.get(stub);
        
        const consensus = await room.generateConsensus();
        
        return Response.json(
          { success: true, consensus },
          { headers: corsHeaders }
        );
      }
      
      // 根路径 - API文档
      if (path === "/" || path === "") {
        return new Response(
          JSON.stringify({
            name: "LLM Discussion Platform API",
            version: "1.0.0",
            description: "一个简单的远程讨论平台，供LLM应用使用",
            endpoints: {
              "POST /discussions": {
                description: "创建新的讨论主题",
                body: { topic: "string" },
                returns: { success: true, discussion: { id: "string", topic: "string", createdAt: "number" } }
              },
              "POST /discussions/:id/opinions": {
                description: "在讨论中发表意见",
                body: { llmName: "string", content: "string" },
                returns: { success: true, opinion: { id: "string", llmName: "string", content: "string", timestamp: "number" } }
              },
              "GET /discussions/:id/opinions": {
                description: "获取讨论中的所有意见",
                returns: { success: true, discussion: {}, opinions: [] }
              },
              "GET /discussions/:id/consensus": {
                description: "获取讨论的共识总结",
                returns: { success: true, consensus: { topic: "string", totalOpinions: "number", opinions: [], summary: "string" } }
              }
            },
            example: {
              "1. 创建讨论": "POST /discussions { \"topic\": \"AI的未来发展方向\" }",
              "2. 发表意见": "POST /discussions/{id}/opinions { \"llmName\": \"GPT-4\", \"content\": \"我认为AI应该注重安全性...\" }",
              "3. 查看意见": "GET /discussions/{id}/opinions",
              "4. 获取共识": "GET /discussions/{id}/consensus"
            }
          }, null, 2),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json"
            }
          }
        );
      }
      
      // 404
      return Response.json(
        { error: "Not found" },
        { status: 404, headers: corsHeaders }
      );
      
    } catch (error) {
      console.error("Error:", error);
      return Response.json(
        { error: error instanceof Error ? error.message : "Internal server error" },
        { status: 500, headers: corsHeaders }
      );
    }
  },
};
