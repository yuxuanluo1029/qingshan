/**
 * 城迹 AI 服务层
 * 前端通过统一接口调用后端 AI 能力；当后端不可用时自动回退到本地 mock。
 */

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface JourneyPlanInput {
  city: string;
  duration: string;
  mood: string;
  spiritTags: string[];
}

export interface JourneyPlanOutput {
  routeName: string;
  routeSubtitle: string;
  routeDesc: string;
  spiritFocus: string;
  points: string[];
}

export interface KnowledgeQAInput {
  pointName: string;
  city: string;
  question: string;
  chatHistory: AIMessage[];
}

export interface BattleReportInput {
  completedPoints: string[];
  completedTasks: string[];
  spiritTags: string[];
  bondLevels: Record<string, number>;
}

export interface BattleReportOutput {
  title: string;
  summary: string;
  keywords: string[];
  highlights: string[];
  bondResult: string;
  finalTitle: string;
  posterCopy: string;
  personality: string;
}

const SYSTEM_PROMPT = `你是“城迹”城市历史文化导师。
你的目标是帮助用户完成城市研学，不使用游戏化对战语汇，不夸张、不空泛。
回答要求：
1. 先给结论，再给依据。
2. 优先提供可验证信息（时间、地点、对象、关系）。
3. 当用户在现场时，给出可执行观察建议。
4. 语气亲切、专业、简明，避免过度文艺化。
5. 每次回答尽量控制在220字以内，除非用户要求展开。`;

const API_BASE = ((import.meta as { env?: Record<string, string | undefined> }).env?.VITE_API_BASE_URL || '').replace(/\/$/, '');
const withBase = (path: string) => (API_BASE ? `${API_BASE}${path}` : path);

class AIService {
  private useRealAPI = true;

  async askKnowledge(input: KnowledgeQAInput): Promise<string> {
    if (this.useRealAPI) {
      try {
        return await this.callKnowledgeAPI(input);
      } catch {
        return this.mockKnowledge(input);
      }
    }

    return this.mockKnowledge(input);
  }

  async chat(messages: AIMessage[], context?: { city?: string; routeName?: string; focus?: string }): Promise<string> {
    if (this.useRealAPI) {
      try {
        return await this.callChatAPI(messages, context);
      } catch {
        return this.mockChat(messages, context);
      }
    }

    return this.mockChat(messages, context);
  }

  async generateJourneyPlan(input: JourneyPlanInput): Promise<JourneyPlanOutput> {
    if (this.useRealAPI) {
      try {
        return await this.callRouteAPI(input);
      } catch {
        return this.mockRoute(input);
      }
    }

    return this.mockRoute(input);
  }

  async generateBattleReport(_input: BattleReportInput): Promise<BattleReportOutput> {
    return {
      title: '城市文化探索报告',
      summary: '你完成了从点位观察到知识归纳的研学闭环，具备将现场体验转化为结构化表达的能力。',
      keywords: ['历史证据', '现场观察', '城市叙事', '文化理解'],
      highlights: ['形成了点位间的逻辑连接', '具备基础讲解提纲能力', '完成了可复盘学习记录'],
      bondResult: '你的“知识整合能力”表现突出。',
      finalTitle: '城市文化观察者',
      posterCopy: '把路走成课堂，把城市读成文本。',
      personality: '你擅长在真实场景中发现知识线索，适合做研学讲解与内容策划。',
    };
  }

  private mockRoute(input: JourneyPlanInput): JourneyPlanOutput {
    const focus = input.spiritTags[0] || '城市文脉';
    return {
      routeName: `${input.city}研学推荐线`,
      routeSubtitle: '按“导入-观察-归纳”组织的可执行路线',
      routeDesc: `本路线优先围绕“${focus}”构建学习主线，同时兼顾点位距离与时长控制。建议每个节点完成1条观察记录。`,
      spiritFocus: focus,
      points: [],
    };
  }

  private mockKnowledge(input: KnowledgeQAInput): string {
    return `关于“${input.pointName}”，建议你先抓三点：历史背景、空间特征、当代价值。你可以先观察“它为什么在这里”，再记录“它现在如何被使用”，最后总结“它对这座城市意味着什么”。`;
  }

  private mockChat(messages: AIMessage[], context?: { city?: string; routeName?: string; focus?: string }): string {
    const last = messages[messages.length - 1]?.content || '';

    if (last.includes('怎么讲') || last.includes('讲解')) {
      return '你可以按“背景一句话—现场证据两条—价值总结一句话”来讲，这样最适合比赛答辩。';
    }

    if (last.includes('时间') || last.includes('来不及')) {
      return '建议保留每个节点至少20分钟：5分钟看总体、10分钟做观察、5分钟做记录。这样信息质量会明显更高。';
    }

    if (context?.routeName) {
      return `你当前的路线是「${context.routeName}」。如果你愿意，我可以继续帮你把每个点位拆成“可讲解要点+现场任务”。`;
    }

    return `我已记录你的问题。基于${context?.city || '当前城市'}研学场景，我建议你优先围绕“${context?.focus || '城市文脉'}”组织观察，这样最容易形成高质量报告。`;
  }

  private async callKnowledgeAPI(input: KnowledgeQAInput): Promise<string> {
    const res = await fetch(withBase('/api/ai/knowledge'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || data?.message || 'Knowledge API failed');
    }

    return data?.data?.answer || data?.answer || '当前暂无可用回答，请稍后再试。';
  }

  private async callChatAPI(messages: AIMessage[], context?: { city?: string; routeName?: string; focus?: string }): Promise<string> {
    const res = await fetch(withBase('/api/ai/chat'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemPrompt: SYSTEM_PROMPT,
        messages,
        context,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || data?.message || 'Chat API failed');
    }

    return data?.data?.content || data?.content || '导师暂时没有生成内容，请稍后再试。';
  }

  private async callRouteAPI(input: JourneyPlanInput): Promise<JourneyPlanOutput> {
    const res = await fetch(withBase('/api/ai/route'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || data?.message || 'Route API failed');
    }

    return (
      data?.data || {
        routeName: `${input.city}研学推荐线`,
        routeSubtitle: '智能推荐结果',
        routeDesc: '系统已根据你的兴趣方向生成路线建议。',
        spiritFocus: input.spiritTags[0] || '城市文脉',
        points: [],
      }
    );
  }
}

export const aiService = new AIService();
