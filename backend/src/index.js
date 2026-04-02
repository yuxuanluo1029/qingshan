import 'dotenv/config';
import cors from 'cors';
import express from 'express';

const PORT = Number(process.env.PORT || 3000);
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const PROVIDER_MODE_RAW = (process.env.AI_PROVIDER || 'aliyun').toLowerCase();
const PROVIDER_MODE = ['aliyun', 'tencent', 'auto'].includes(PROVIDER_MODE_RAW) ? PROVIDER_MODE_RAW : 'auto';

const ALIYUN_API_KEY = process.env.ALIYUN_API_KEY || '';
const ALIYUN_MODEL = process.env.ALIYUN_MODEL || 'qwen-plus';
const ALIYUN_BASE_URL = (process.env.ALIYUN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1').replace(/\/$/, '');
const canUseAliyun = Boolean(ALIYUN_API_KEY);

const HUNYUAN_REGION = process.env.TENCENT_HUNYUAN_REGION || 'ap-guangzhou';
const HUNYUAN_MODEL = process.env.TENCENT_HUNYUAN_MODEL || 'hunyuan-turbos-latest';
const TENCENT_SECRET_ID = process.env.TENCENT_SECRET_ID || '';
const TENCENT_SECRET_KEY = process.env.TENCENT_SECRET_KEY || '';
const canUseHunyuan = Boolean(TENCENT_SECRET_ID && TENCENT_SECRET_KEY);

const app = express();
app.use(cors({ origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN }));
app.use(express.json({ limit: '1mb' }));

let hunyuanClientPromise = null;

function sanitizeMessages(messages = []) {
  return messages
    .filter((msg) => msg && typeof msg.content === 'string' && ['system', 'user', 'assistant'].includes(msg.role))
    .map((msg) => ({
      role: msg.role,
      content: msg.content.slice(0, 2000),
    }))
    .slice(-20);
}

function toHunyuanMessages(messages) {
  return sanitizeMessages(messages).map((msg) => ({
    Role: msg.role,
    Content: msg.content,
  }));
}

function extractContentFromHunyuanResponse(response) {
  if (!response) return '';

  const direct = response?.Choices?.[0]?.Message?.Content;
  if (typeof direct === 'string' && direct.trim()) return direct.trim();

  const alt = response?.Choices?.[0]?.Delta?.Content;
  if (typeof alt === 'string' && alt.trim()) return alt.trim();

  const nested = response?.choices?.[0]?.message?.content;
  if (typeof nested === 'string' && nested.trim()) return nested.trim();

  return '';
}

function extractContentFromAliyunResponse(response) {
  if (!response) return '';

  const content = response?.choices?.[0]?.message?.content;

  if (typeof content === 'string' && content.trim()) {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') return part;
        if (typeof part?.text === 'string') return part.text;
        return '';
      })
      .join('')
      .trim();
  }

  return '';
}

function getProviderOrder() {
  if (PROVIDER_MODE === 'aliyun') return ['aliyun'];
  if (PROVIDER_MODE === 'tencent') return ['tencent'];
  return ['aliyun', 'tencent'];
}

function getRuntimeModel() {
  if (PROVIDER_MODE === 'aliyun') {
    return canUseAliyun ? `aliyun:${ALIYUN_MODEL}` : 'mock-only';
  }
  if (PROVIDER_MODE === 'tencent') {
    return canUseHunyuan ? `tencent:${HUNYUAN_MODEL}` : 'mock-only';
  }
  if (canUseAliyun) return `aliyun:${ALIYUN_MODEL}`;
  if (canUseHunyuan) return `tencent:${HUNYUAN_MODEL}`;
  return 'mock-only';
}

async function getHunyuanClient() {
  if (!canUseHunyuan) {
    return null;
  }

  if (!hunyuanClientPromise) {
    hunyuanClientPromise = (async () => {
      const sdkModule = await import('tencentcloud-sdk-nodejs-hunyuan');
      const sdk = sdkModule.default || sdkModule;
      const Client = sdk?.hunyuan?.v20230901?.Client;

      if (!Client) {
        throw new Error('Failed to init tencentcloud-sdk-nodejs-hunyuan client');
      }

      return new Client({
        credential: {
          secretId: TENCENT_SECRET_ID,
          secretKey: TENCENT_SECRET_KEY,
        },
        region: HUNYUAN_REGION,
        profile: {
          httpProfile: {
            endpoint: 'hunyuan.tencentcloudapi.com',
          },
        },
      });
    })();
  }

  return hunyuanClientPromise;
}

async function runHunyuanChat(messages, temperature = 0.7) {
  if (!canUseHunyuan) return '';

  try {
    const client = await getHunyuanClient();
    if (!client) return '';

    const req = {
      Model: HUNYUAN_MODEL,
      Messages: toHunyuanMessages(messages),
      Temperature: temperature,
      TopP: 0.8,
      Stream: false,
    };

    const response = await client.ChatCompletions(req);
    return extractContentFromHunyuanResponse(response);
  } catch (error) {
    console.error('[Tencent Hunyuan] call failed:', error?.message || error);
    return '';
  }
}

async function runAliyunChat(messages, temperature = 0.7) {
  if (!canUseAliyun) return '';

  try {
    if (typeof fetch !== 'function') {
      throw new Error('fetch is not available. Please use Node.js 18+');
    }

    const response = await fetch(`${ALIYUN_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ALIYUN_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: ALIYUN_MODEL,
        messages: sanitizeMessages(messages),
        temperature,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status}: ${errText.slice(0, 300)}`);
    }

    const data = await response.json();
    return extractContentFromAliyunResponse(data);
  } catch (error) {
    console.error('[Aliyun DashScope] call failed:', error?.message || error);
    return '';
  }
}

async function runPreferredChat(messages, temperature = 0.7) {
  for (const provider of getProviderOrder()) {
    const content = provider === 'aliyun'
      ? await runAliyunChat(messages, temperature)
      : await runHunyuanChat(messages, temperature);

    if (content) {
      return { content, provider };
    }
  }

  return { content: '', provider: 'mock' };
}

function mockKnowledgeAnswer({ pointName, city, question }) {
  return `For "${pointName}" in ${city}, use this structure: background, on-site evidence, present-day value. Your question was: ${question}`;
}

function mockChatAnswer({ city, routeName, focus, lastQuestion }) {
  if ((lastQuestion || '').includes('time')) {
    return 'Keep at least 20 minutes per point: 5 min overview, 10 min observation, 5 min notes.';
  }

  return `You are currently in ${city || 'this city'}. Route "${routeName || 'study route'}" is ready. Focus on "${focus || 'urban context'}".`;
}

async function buildRouteDescription({ city, duration, mood, spiritTags }) {
  const prompt = [
    'You are a city history and culture tutor.',
    'Respond in Simplified Chinese within 120 Chinese characters.',
    'Do not use any esports terms.',
    `City: ${city}`,
    `Duration: ${duration}`,
    `Learning style: ${mood}`,
    `Topics: ${(spiritTags || []).join(' / ') || 'urban context'}`,
    'Emphasize actionable observation tasks and safe pacing.',
  ].join('\n');

  const llmResult = await runPreferredChat([{ role: 'user', content: prompt }], 0.6);
  if (llmResult.content) return llmResult.content;

  return `Study route for ${city}: use "intro -> observe -> summarize", with one observation note per point.`;
}

app.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      providerMode: PROVIDER_MODE,
      model: getRuntimeModel(),
      providers: {
        aliyun: canUseAliyun ? 'ready' : 'missing_key',
        tencent: canUseHunyuan ? 'ready' : 'missing_key',
      },
      timestamp: new Date().toISOString(),
    },
  });
});

app.post('/api/ai/chat', async (req, res) => {
  const { systemPrompt, messages = [], context = {} } = req.body || {};
  const normalized = sanitizeMessages(messages);
  const lastQuestion = normalized.filter((msg) => msg.role === 'user').at(-1)?.content || '';

  const merged = [
    {
      role: 'system',
      content:
        (systemPrompt || 'You are a city history and culture tutor. Answer briefly and clearly.') +
        `\nContext: city=${context.city || 'unknown'}; route=${context.routeName || 'unset'}; focus=${context.focus || 'unset'}.` +
        '\nRespond in Simplified Chinese.',
    },
    ...normalized,
  ];

  const llmResult = await runPreferredChat(merged, 0.7);
  const content = llmResult.content || mockChatAnswer({
    city: context.city,
    routeName: context.routeName,
    focus: context.focus,
    lastQuestion,
  });

  res.json({
    success: true,
    data: {
      content,
      source: llmResult.provider === 'mock' ? 'mock' : `${llmResult.provider}_or_mock_fallback`,
    },
  });
});

app.post('/api/ai/knowledge', async (req, res) => {
  const { pointName = '', city = '', question = '', chatHistory = [] } = req.body || {};

  const history = Array.isArray(chatHistory)
    ? sanitizeMessages(chatHistory)
        .filter((msg) => ['user', 'assistant'].includes(msg.role))
        .slice(-6)
    : [];

  const prompt = [
    'You are a city history and culture tutor.',
    'Respond in Simplified Chinese within about 180 Chinese characters.',
    'Include: background, observable evidence, learning value.',
    `City: ${city}`,
    `Site: ${pointName}`,
    `Question: ${question}`,
  ].join('\n');

  const llmResult = await runPreferredChat(
    [{ role: 'system', content: 'Provide accurate and verifiable points. Respond in Simplified Chinese.' }, ...history, { role: 'user', content: prompt }],
    0.7,
  );

  const content = llmResult.content || mockKnowledgeAnswer({ pointName, city, question });

  res.json({
    success: true,
    data: {
      answer: content,
      source: llmResult.provider === 'mock' ? 'mock' : `${llmResult.provider}_or_mock_fallback`,
    },
  });
});

app.post('/api/ai/route', async (req, res) => {
  const { city = 'city', duration = 'half', mood = 'focused', spiritTags = [] } = req.body || {};

  const durationLabel = duration === 'two' ? 'two-day' : duration === 'full' ? 'one-day' : 'half-day';
  const focus = Array.isArray(spiritTags) && spiritTags.length ? spiritTags[0] : 'urban context';
  const routeName = `${city} ${durationLabel} study route`;
  const routeDesc = await buildRouteDescription({ city, duration: durationLabel, mood, spiritTags });

  res.json({
    success: true,
    data: {
      routeName,
      routeSubtitle: 'AI generated learning route',
      routeDesc,
      spiritFocus: focus,
      points: [],
    },
  });
});

app.use((error, _req, res, _next) => {
  console.error('[Server] unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`[chengji-backend] running at http://localhost:${PORT}`);
  console.log(`[chengji-backend] provider mode: ${PROVIDER_MODE}`);
  console.log(`[chengji-backend] runtime model: ${getRuntimeModel()}`);
});
