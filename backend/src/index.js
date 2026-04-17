import 'dotenv/config';
import cors from 'cors';
import crypto from 'crypto';
import express from 'express';
import fs from 'fs';
import path from 'path';
import tencentcloud from 'tencentcloud-sdk-nodejs-hunyuan';
import { fileURLToPath } from 'url';

const PORT = Number(process.env.PORT || 3000);
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

const PROVIDER_MODE_RAW = (process.env.AI_PROVIDER || 'aliyun').toLowerCase();
const PROVIDER_MODE = ['aliyun', 'tencent', 'auto'].includes(PROVIDER_MODE_RAW) ? PROVIDER_MODE_RAW : 'auto';

const ALIYUN_API_KEY = process.env.ALIYUN_API_KEY || '';
const ALIYUN_MODEL = process.env.ALIYUN_MODEL || 'qwen-plus';
const ALIYUN_BASE_URL = (process.env.ALIYUN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1').replace(/\/$/, '');

const TENCENT_SECRET_ID = process.env.TENCENT_SECRET_ID || '';
const TENCENT_SECRET_KEY = process.env.TENCENT_SECRET_KEY || '';
const TENCENT_HUNYUAN_REGION = process.env.TENCENT_HUNYUAN_REGION || 'ap-guangzhou';
const TENCENT_HUNYUAN_MODEL = process.env.TENCENT_HUNYUAN_MODEL || 'hunyuan-turbos-latest';

const canUseAliyun = Boolean(ALIYUN_API_KEY);
const canUseHunyuan = Boolean(TENCENT_SECRET_ID && TENCENT_SECRET_KEY);

const { hunyuan } = tencentcloud;
const HunyuanClient = hunyuan.v20230901.Client;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.resolve(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const BLOG_FILE = path.join(DATA_DIR, 'blog-posts.json');
const VIDEO_PROFILE_FILE = path.join(DATA_DIR, 'video-profiles.json');
const GOV_TASK_FILE = path.join(DATA_DIR, 'governance-tasks.json');
const BLOCKCHAIN_FILE = path.join(DATA_DIR, 'blockchain-ledger.json');

const app = express();
app.use(cors({ origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN }));
app.use(express.json({ limit: '15mb' }));

const MOJIBAKE_FIX_RULES = [
  [/鏈缃[\?？]?/g, '未设置'],
  [/鏉窞/g, '杭州'],
  [/鎴愰兘/g, '成都'],
  [/闀挎矙/g, '长沙'],
  [/瑗垮畨/g, '西安'],
  [/姝︽眽/g, '武汉'],
  [/璺ㄥ煄/g, '跨城'],
  [/鍏ㄩ儴/g, '全部'],
  [/寰呮牳楠[\?？]?/g, '待核验'],
  [/澶勭悊涓[\?？]?/g, '处理中'],
  [/宸插綊妗[\?？]?/g, '已归档'],
  [/鏂囨梾娌荤悊閾惧垱涓栧尯鍧[\?？]?/g, '文旅治理链创世区块'],
];

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function readJsonFile(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, 'utf8');
    if (!raw.trim()) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJsonFile(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf8');
}

function nowISO() {
  return new Date().toISOString();
}

function clampText(value, max = 2000) {
  return String(value || '').trim().slice(0, max);
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function uniqueStringArray(values) {
  const seen = new Set();
  const list = [];
  for (const item of safeArray(values)) {
    const s = clampText(item, 64);
    if (!s) continue;
    if (seen.has(s)) continue;
    seen.add(s);
    list.push(s);
  }
  return list;
}

function buildId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function fixMojibake(text) {
  let value = String(text ?? '');
  for (const [pattern, replacement] of MOJIBAKE_FIX_RULES) {
    value = value.replace(pattern, replacement);
  }
  return value;
}

function sanitizeRegion(value) {
  const fixed = fixMojibake(clampText(value, 32));
  if (!fixed || fixed === '未设置地区') return '未设置';
  return fixed;
}

function sanitizeAvatarUrl(value) {
  const raw = clampText(value, 900000);
  if (!raw) return '';
  if (raw.startsWith('data:image/')) return raw;
  if (raw.startsWith('/')) return raw;
  if (/^https?:\/\//i.test(raw)) return raw;
  return '';
}

function sanitizeMessages(messages = []) {
  return safeArray(messages)
    .filter((m) => m && typeof m.content === 'string' && ['system', 'user', 'assistant'].includes(m.role))
    .map((m) => ({
      role: m.role,
      content: clampText(fixMojibake(m.content), 2200),
    }))
    .slice(-20);
}

function toHunyuanMessages(messages = []) {
  return sanitizeMessages(messages).map((m) => ({
    Role: m.role,
    Content: m.content,
  }));
}

function extractContentFromAliyunResponse(response) {
  const content = response?.choices?.[0]?.message?.content;
  if (typeof content === 'string' && content.trim()) return content.trim();
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') return part;
        return part?.text || '';
      })
      .join('')
      .trim();
  }
  return '';
}

function extractContentFromHunyuanResponse(response) {
  return (
    response?.Choices?.[0]?.Message?.Content?.trim?.() ||
    response?.choices?.[0]?.message?.content?.trim?.() ||
    ''
  );
}

function getProviderOrder() {
  if (PROVIDER_MODE === 'aliyun') return ['aliyun'];
  if (PROVIDER_MODE === 'tencent') return ['tencent'];
  return ['aliyun', 'tencent'];
}

function getRuntimeModel() {
  if (PROVIDER_MODE === 'aliyun') return canUseAliyun ? `aliyun:${ALIYUN_MODEL}` : 'mock-only';
  if (PROVIDER_MODE === 'tencent') return canUseHunyuan ? `tencent:${TENCENT_HUNYUAN_MODEL}` : 'mock-only';
  if (canUseAliyun) return `aliyun:${ALIYUN_MODEL}`;
  if (canUseHunyuan) return `tencent:${TENCENT_HUNYUAN_MODEL}`;
  return 'mock-only';
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(`chengji:${password}`).digest('hex');
}

function verifyPassword(user, inputPassword) {
  const safeInput = String(inputPassword || '');
  if (!safeInput) return false;
  return user.passwordHash === hashPassword(safeInput);
}

function generateResetCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function hashPayload(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function createGenesisBlock() {
  const block = {
    index: 0,
    timestamp: nowISO(),
    prevHash: '0'.repeat(64),
    payload: {
      system: 'chengji-chain',
      description: '文旅治理链创世区块',
    },
  };
  return { ...block, hash: hashPayload(block) };
}

function ensureBlockchainGenesis(ledger) {
  if (!Array.isArray(ledger) || ledger.length === 0) return [createGenesisBlock()];
  return ledger;
}

function validateChain(ledger) {
  if (!Array.isArray(ledger) || ledger.length === 0) return false;
  for (let i = 0; i < ledger.length; i += 1) {
    const current = ledger[i];
    const expectedHash = hashPayload({
      index: current.index,
      timestamp: current.timestamp,
      prevHash: current.prevHash,
      payload: current.payload,
    });
    if (expectedHash !== current.hash) return false;
    if (i > 0 && current.prevHash !== ledger[i - 1].hash) return false;
  }
  return true;
}

function appendBlock(ledger, payload) {
  const chain = ensureBlockchainGenesis(ledger);
  const prev = chain[chain.length - 1];
  const block = {
    index: Number(prev.index || 0) + 1,
    timestamp: nowISO(),
    prevHash: prev.hash,
    payload,
  };
  return [...chain, { ...block, hash: hashPayload(block) }];
}

function decodeDataUrlToBuffer(dataUrl) {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) return null;
  const commaIndex = dataUrl.indexOf(',');
  if (commaIndex < 0) return null;
  try {
    return Buffer.from(dataUrl.slice(commaIndex + 1), 'base64');
  } catch {
    return null;
  }
}

function pseudoScore(seed) {
  const hash = crypto.createHash('sha256').update(seed).digest('hex').slice(0, 8);
  const value = Number.parseInt(hash, 16);
  return Number((0.35 + ((value % 10000) / 10000) * 0.65).toFixed(4));
}

function fixCityText(value) {
  const fixed = fixMojibake(clampText(value, 20));
  if (!fixed) return '杭州';
  return fixed;
}

function normalizeTaskStatus(raw) {
  const fixed = fixMojibake(clampText(raw, 20));
  if (fixed.includes('待') || fixed.includes('核验')) return '待核验';
  if (fixed.includes('处理')) return '处理中';
  if (fixed.includes('归档')) return '已归档';
  if (['待核验', '处理中', '已归档'].includes(fixed)) return fixed;
  return '待核验';
}

function normalizeSeverity(raw) {
  const fixed = fixMojibake(clampText(raw, 8));
  if (['低', '中', '高'].includes(fixed)) return fixed;
  if (fixed.startsWith('浣')) return '低';
  if (fixed.startsWith('涓')) return '中';
  if (fixed.startsWith('楂')) return '高';
  return '中';
}

function toPublicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    role: user.role || 'user',
    avatarUrl: sanitizeAvatarUrl(user.avatarUrl),
    region: sanitizeRegion(user.region),
    createdAt: user.createdAt || nowISO(),
  };
}

function ensureUserShape(user) {
  const username = clampText(fixMojibake(user?.username), 40);
  const legacyPassword = clampText(user?.password, 128);
  const passwordHash = /^[a-f0-9]{64}$/i.test(String(user?.passwordHash || ''))
    ? String(user.passwordHash).toLowerCase()
    : hashPassword(legacyPassword || '123456');
  const role = user?.role || (username.toLowerCase().includes('admin') ? 'admin' : 'user');

  return {
    id: clampText(user?.id, 64) || buildId('u'),
    username: username || `user_${Math.random().toString(36).slice(2, 6)}`,
    passwordHash,
    role,
    avatarUrl: sanitizeAvatarUrl(user?.avatarUrl),
    region: sanitizeRegion(user?.region),
    createdAt: clampText(user?.createdAt, 50) || nowISO(),
    resetCode: clampText(user?.resetCode, 16) || '',
    resetExpiresAt: clampText(user?.resetExpiresAt, 50) || '',
  };
}

function enrichBlogPost(post, usersList) {
  const author = safeArray(usersList).find((u) => u.id === post.authorId);
  const comments = safeArray(post.comments).map((c) => {
    const commenter = safeArray(usersList).find((u) => u.id === c.userId);
    return {
      id: clampText(c?.id, 64) || buildId('c'),
      userId: clampText(c?.userId, 64),
      username: clampText(fixMojibake(c?.username), 64) || commenter?.username || '匿名用户',
      userAvatar: sanitizeAvatarUrl(c?.userAvatar || commenter?.avatarUrl),
      userRegion: sanitizeRegion(c?.userRegion || commenter?.region),
      content: clampText(fixMojibake(c?.content), 400),
      createdAt: clampText(c?.createdAt, 50) || nowISO(),
    };
  });

  return {
    id: clampText(post?.id, 64) || buildId('blog'),
    title: clampText(fixMojibake(post?.title), 120) || '未命名帖子',
    content: clampText(fixMojibake(post?.content), 8000),
    cityTag: fixCityText(post?.cityTag),
    column: clampText(fixMojibake(post?.column), 20) || '城市随笔',
    authorId: clampText(post?.authorId, 64) || author?.id || '',
    authorName: clampText(fixMojibake(post?.authorName), 64) || author?.username || '匿名用户',
    authorAvatar: sanitizeAvatarUrl(post?.authorAvatar || author?.avatarUrl),
    authorRegion: sanitizeRegion(post?.authorRegion || author?.region),
    imageUrl: sanitizeAvatarUrl(post?.imageUrl),
    likedUserIds: uniqueStringArray(post?.likedUserIds),
    comments,
    createdAt: clampText(post?.createdAt, 50) || nowISO(),
    updatedAt: clampText(post?.updatedAt, 50) || nowISO(),
  };
}

function ensureVideoProfileShape(profile) {
  return {
    userId: clampText(profile?.userId, 64),
    preferredCategories: uniqueStringArray(profile?.preferredCategories).slice(0, 12),
    likedVideoIds: uniqueStringArray(profile?.likedVideoIds).slice(0, 1000),
    favoritedVideoIds: uniqueStringArray(profile?.favoritedVideoIds).slice(0, 1000),
    viewedVideoIds: uniqueStringArray(profile?.viewedVideoIds).slice(0, 2000),
    viewHistory: safeArray(profile?.viewHistory)
      .map((item) => ({
        videoId: clampText(item?.videoId, 80),
        city: fixCityText(item?.city || '跨城'),
        duration: Number(item?.duration || 0),
        viewedAt: clampText(item?.viewedAt, 50) || nowISO(),
      }))
      .filter((item) => item.videoId)
      .slice(-400),
    updatedAt: clampText(profile?.updatedAt, 50) || nowISO(),
  };
}

function ensureGovernanceTaskShape(task, usersList) {
  const reporter = safeArray(usersList).find((u) => u.id === task?.reporterId);
  return {
    id: clampText(task?.id, 64) || buildId('task'),
    title: clampText(fixMojibake(task?.title), 120),
    city: fixCityText(task?.city),
    location: clampText(fixMojibake(task?.location), 120),
    severity: normalizeSeverity(task?.severity),
    description: clampText(fixMojibake(task?.description), 2000),
    imageUrl: sanitizeAvatarUrl(task?.imageUrl),
    status: normalizeTaskStatus(task?.status),
    reporterId: clampText(task?.reporterId, 64) || reporter?.id || '',
    reporterName: clampText(fixMojibake(task?.reporterName), 64) || reporter?.username || '匿名用户',
    createdAt: clampText(task?.createdAt, 50) || nowISO(),
    updates: safeArray(task?.updates).map((update) => ({
      id: clampText(update?.id, 64) || buildId('task_update'),
      operator: clampText(fixMojibake(update?.operator), 64) || '系统',
      message: clampText(fixMojibake(update?.message), 200) || '状态更新',
      createdAt: clampText(update?.createdAt, 50) || nowISO(),
    })),
  };
}

function parseJsonObjectFromText(text) {
  if (!text || typeof text !== 'string') return null;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

function stripWordCountSuffix(text) {
  return String(text || '')
    .replace(/\s*[（(]\s*(?:约|共|总计)?\s*\d+\s*字\s*[)）]\s*$/u, '')
    .trim();
}

function mockKnowledgeReply({ city, pointName, question }) {
  const q = clampText(question, 80);
  return `围绕${city}的“${pointName}”，建议先看历史背景，再看可观察证据，最后联系当代价值。你可以重点追问：${q}涉及的时间、空间与文化关系。`;
}

function mockChatReply(messages, context) {
  const latest = sanitizeMessages(messages).slice(-1)[0]?.content || '';
  if (latest.includes('讲解')) return '讲解建议：先一句背景，再两条证据，最后一句价值总结，控制在60秒内。';
  return `已收到问题。你当前可优先围绕“${context?.focus || '城市文脉'}”提问，我会给出可执行的观察与表达建议。`;
}

function mockRouteReply(input) {
  const city = fixCityText(input?.city || '杭州');
  const focus = safeArray(input?.spiritTags)[0] || '城市文脉';
  const presets = {
    杭州: ['良渚博物院', '西湖孤山文脉区', '中国丝绸博物馆'],
    成都: ['金沙遗址博物馆', '三星堆主题展区', '武侯祠'],
    长沙: ['马王堆汉墓陈列', '岳麓书院', '长沙简牍博物馆'],
    西安: ['秦始皇帝陵博物院', '大明宫国家遗址公园', '西安碑林博物馆'],
    武汉: ['盘龙城遗址博物院', '湖北省博物馆', '黄鹤楼历史展陈'],
  };
  const points = presets[city] || presets['杭州'];

  return {
    routeName: `${city}文化深描线`,
    routeSubtitle: '导入-观察-归纳',
    routeDesc: `路线围绕“${focus}”组织，兼顾历史证据、空间观察与讲解表达。`,
    spiritFocus: focus,
    points,
  };
}

async function callAliyunChat(messages, options = {}) {
  const payload = {
    model: ALIYUN_MODEL,
    messages: sanitizeMessages(messages),
    temperature: Number(options.temperature ?? 0.4),
    max_tokens: Number(options.maxTokens ?? 900),
  };

  const res = await fetch(`${ALIYUN_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ALIYUN_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message || data?.message || `Aliyun API error: ${res.status}`);
  }

  const content = extractContentFromAliyunResponse(data);
  if (!content) throw new Error('Aliyun empty response');
  return { provider: 'aliyun', content };
}

let hunyuanClient = null;
function getHunyuanClient() {
  if (hunyuanClient) return hunyuanClient;
  hunyuanClient = new HunyuanClient({
    credential: {
      secretId: TENCENT_SECRET_ID,
      secretKey: TENCENT_SECRET_KEY,
    },
    region: TENCENT_HUNYUAN_REGION,
    profile: {
      httpProfile: {
        endpoint: 'hunyuan.tencentcloudapi.com',
      },
    },
  });
  return hunyuanClient;
}

async function callHunyuanChat(messages, options = {}) {
  const client = getHunyuanClient();
  const result = await client.ChatCompletions({
    Model: TENCENT_HUNYUAN_MODEL,
    Messages: toHunyuanMessages(messages),
    Stream: false,
    Temperature: Number(options.temperature ?? 0.4),
    TopP: 0.8,
  });
  const content = extractContentFromHunyuanResponse(result);
  if (!content) throw new Error('Hunyuan empty response');
  return { provider: 'tencent', content };
}

async function runLLM(messages, options = {}) {
  const errors = [];
  for (const provider of getProviderOrder()) {
    try {
      if (provider === 'aliyun' && canUseAliyun) {
        return await callAliyunChat(messages, options);
      }
      if (provider === 'tencent' && canUseHunyuan) {
        return await callHunyuanChat(messages, options);
      }
    } catch (error) {
      errors.push(`${provider}:${error?.message || 'unknown'}`);
    }
  }
  throw new Error(errors.join('; ') || 'No provider available');
}

ensureDir(DATA_DIR);
if (!fs.existsSync(USERS_FILE)) writeJsonFile(USERS_FILE, []);
if (!fs.existsSync(BLOG_FILE)) writeJsonFile(BLOG_FILE, []);
if (!fs.existsSync(VIDEO_PROFILE_FILE)) writeJsonFile(VIDEO_PROFILE_FILE, []);
if (!fs.existsSync(GOV_TASK_FILE)) writeJsonFile(GOV_TASK_FILE, []);
if (!fs.existsSync(BLOCKCHAIN_FILE)) writeJsonFile(BLOCKCHAIN_FILE, []);

let users = safeArray(readJsonFile(USERS_FILE, [])).map(ensureUserShape);
let blogPosts = safeArray(readJsonFile(BLOG_FILE, [])).map((post) => enrichBlogPost(post, users));
let videoProfiles = safeArray(readJsonFile(VIDEO_PROFILE_FILE, [])).map(ensureVideoProfileShape);
let governanceTasks = safeArray(readJsonFile(GOV_TASK_FILE, [])).map((task) => ensureGovernanceTaskShape(task, users));
let blockchainLedger = ensureBlockchainGenesis(readJsonFile(BLOCKCHAIN_FILE, []));
if (!validateChain(blockchainLedger)) blockchainLedger = [createGenesisBlock()];

function persistUsers() {
  writeJsonFile(USERS_FILE, users);
}
function persistBlog() {
  writeJsonFile(BLOG_FILE, blogPosts);
}
function persistVideoProfiles() {
  writeJsonFile(VIDEO_PROFILE_FILE, videoProfiles);
}
function persistGovernanceTasks() {
  writeJsonFile(GOV_TASK_FILE, governanceTasks);
}
function persistBlockchainLedger() {
  writeJsonFile(BLOCKCHAIN_FILE, blockchainLedger);
}

function getUserById(userId) {
  const safeUserId = clampText(userId, 64);
  return users.find((u) => u.id === safeUserId);
}

function getUserByUsername(username) {
  const safeName = clampText(username, 40).toLowerCase();
  return users.find((u) => u.username.toLowerCase() === safeName);
}

function getOrCreateVideoProfile(userId) {
  const safeUserId = clampText(userId, 64);
  let profile = videoProfiles.find((item) => item.userId === safeUserId);
  if (!profile) {
    profile = ensureVideoProfileShape({
      userId: safeUserId,
      preferredCategories: [],
      likedVideoIds: [],
      favoritedVideoIds: [],
      viewedVideoIds: [],
      viewHistory: [],
      updatedAt: nowISO(),
    });
    videoProfiles = [profile, ...videoProfiles];
    persistVideoProfiles();
  }
  return profile;
}

function updateVideoProfile(userId, updater) {
  const safeUserId = clampText(userId, 64);
  const next = [...videoProfiles];
  const index = next.findIndex((item) => item.userId === safeUserId);
  const current = index >= 0 ? next[index] : getOrCreateVideoProfile(safeUserId);
  const updated = ensureVideoProfileShape({
    ...updater(current),
    userId: safeUserId,
    updatedAt: nowISO(),
  });
  if (index >= 0) next[index] = updated;
  else next.unshift(updated);
  videoProfiles = next;
  persistVideoProfiles();
  return updated;
}

function appendLedger(payload) {
  blockchainLedger = appendBlock(blockchainLedger, payload);
  persistBlockchainLedger();
}

function requireUser(res, userId) {
  const user = getUserById(userId);
  if (!user) {
    res.status(404).json({ success: false, error: '用户不存在' });
    return null;
  }
  return user;
}

writeJsonFile(USERS_FILE, users);
writeJsonFile(BLOG_FILE, blogPosts);
writeJsonFile(VIDEO_PROFILE_FILE, videoProfiles);
writeJsonFile(GOV_TASK_FILE, governanceTasks);
writeJsonFile(BLOCKCHAIN_FILE, blockchainLedger);

app.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      providerMode: PROVIDER_MODE,
      runtimeModel: getRuntimeModel(),
      providers: {
        aliyun: canUseAliyun ? 'ready' : 'missing_key',
        tencent: canUseHunyuan ? 'ready' : 'missing_key',
      },
      time: nowISO(),
    },
  });
});

app.post('/api/auth/register', (req, res) => {
  const username = clampText(fixMojibake(req.body?.username), 40);
  const password = String(req.body?.password || '');

  if (username.length < 3) {
    return res.status(400).json({ success: false, error: '用户名至少 3 个字符' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, error: '密码至少 6 位' });
  }
  if (getUserByUsername(username)) {
    return res.status(409).json({ success: false, error: '用户名已存在' });
  }

  const nextUser = ensureUserShape({
    id: buildId('u'),
    username,
    passwordHash: hashPassword(password),
    role: username.toLowerCase().includes('admin') ? 'admin' : 'user',
    avatarUrl: '',
    region: '未设置',
    createdAt: nowISO(),
    resetCode: '',
    resetExpiresAt: '',
  });

  users = [nextUser, ...users];
  persistUsers();
  getOrCreateVideoProfile(nextUser.id);
  appendLedger({
    type: 'auth_register',
    userId: nextUser.id,
    username: nextUser.username,
    role: nextUser.role,
  });

  return res.json({
    success: true,
    data: {
      user: toPublicUser(nextUser),
    },
  });
});

app.post('/api/auth/login', (req, res) => {
  const username = clampText(fixMojibake(req.body?.username), 40);
  const password = String(req.body?.password || '');
  const user = getUserByUsername(username);

  if (!user || !verifyPassword(user, password)) {
    return res.status(401).json({ success: false, error: '用户名或密码错误' });
  }

  return res.json({
    success: true,
    data: {
      user: toPublicUser(user),
    },
  });
});

app.post('/api/auth/forgot-password', (req, res) => {
  const username = clampText(fixMojibake(req.body?.username), 40);
  const user = getUserByUsername(username);
  if (!user) {
    return res.status(404).json({ success: false, error: '用户名不存在' });
  }

  user.resetCode = generateResetCode();
  user.resetExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  users = users.map((item) => (item.id === user.id ? user : item));
  persistUsers();

  return res.json({
    success: true,
    data: {
      message: '验证码已生成（演示环境直接返回）',
      resetCode: user.resetCode,
      expiresInSeconds: 600,
    },
  });
});

app.post('/api/auth/reset-password', (req, res) => {
  const username = clampText(fixMojibake(req.body?.username), 40);
  const resetCode = clampText(req.body?.resetCode, 16);
  const newPassword = String(req.body?.newPassword || '');
  const user = getUserByUsername(username);

  if (!user) return res.status(404).json({ success: false, error: '用户名不存在' });
  if (!resetCode) return res.status(400).json({ success: false, error: '验证码不能为空' });
  if (newPassword.length < 6) return res.status(400).json({ success: false, error: '新密码至少 6 位' });
  if (!user.resetCode || user.resetCode !== resetCode) {
    return res.status(400).json({ success: false, error: '验证码错误' });
  }
  if (!user.resetExpiresAt || new Date(user.resetExpiresAt).getTime() < Date.now()) {
    return res.status(400).json({ success: false, error: '验证码已过期' });
  }

  user.passwordHash = hashPassword(newPassword);
  user.resetCode = '';
  user.resetExpiresAt = '';
  users = users.map((item) => (item.id === user.id ? user : item));
  persistUsers();
  appendLedger({
    type: 'auth_reset_password',
    userId: user.id,
    username: user.username,
  });

  return res.json({
    success: true,
    data: {
      message: '密码重置成功，请重新登录',
    },
  });
});

app.get('/api/user/profile/:userId', (req, res) => {
  const user = requireUser(res, req.params.userId);
  if (!user) return;

  const profile = getOrCreateVideoProfile(user.id);
  const myPosts = blogPosts.filter((post) => post.authorId === user.id);
  const blogLikesReceived = myPosts.reduce((sum, post) => sum + safeArray(post.likedUserIds).length, 0);
  const reportedTasks = governanceTasks.filter((task) => task.reporterId === user.id).length;
  const onChainRecords = safeArray(blockchainLedger).filter((block) => {
    const payload = block?.payload || {};
    return payload.userId === user.id || payload.reporterId === user.id || payload.operatorId === user.id;
  }).length;

  return res.json({
    success: true,
    data: {
      user: toPublicUser(user),
      stats: {
        blogPosts: myPosts.length,
        blogLikesReceived,
        favoriteVideos: profile.favoritedVideoIds.length,
        likedVideos: profile.likedVideoIds.length,
        reportedTasks,
        onChainRecords,
      },
      videoProfile: profile,
    },
  });
});

app.get('/api/user/profile/:userId/video', (req, res) => {
  const user = requireUser(res, req.params.userId);
  if (!user) return;
  const profile = getOrCreateVideoProfile(user.id);
  return res.json({ success: true, data: { profile } });
});

app.put('/api/user/profile/:userId/base', (req, res) => {
  const userId = clampText(req.params.userId, 64);
  const requesterId = clampText(req.body?.requesterId, 64);
  if (requesterId && requesterId !== userId) {
    return res.status(403).json({ success: false, error: '无权修改他人资料' });
  }

  const user = requireUser(res, userId);
  if (!user) return;

  user.avatarUrl = sanitizeAvatarUrl(req.body?.avatarUrl);
  user.region = sanitizeRegion(req.body?.region);
  users = users.map((item) => (item.id === user.id ? user : item));
  persistUsers();

  blogPosts = blogPosts.map((post) => {
    const nextPost = { ...post };
    if (nextPost.authorId === user.id) {
      nextPost.authorName = user.username;
      nextPost.authorAvatar = user.avatarUrl;
      nextPost.authorRegion = user.region;
      nextPost.updatedAt = nowISO();
    }
    nextPost.comments = safeArray(nextPost.comments).map((comment) => {
      if (comment.userId !== user.id) return comment;
      return {
        ...comment,
        username: user.username,
        userAvatar: user.avatarUrl,
        userRegion: user.region,
      };
    });
    return nextPost;
  });
  persistBlog();

  appendLedger({
    type: 'profile_update',
    userId: user.id,
    username: user.username,
    region: user.region,
  });

  return res.json({
    success: true,
    data: {
      user: toPublicUser(user),
    },
  });
});

app.put('/api/user/profile/:userId/preferences', (req, res) => {
  const user = requireUser(res, req.params.userId);
  if (!user) return;
  const preferredCategories = uniqueStringArray(req.body?.preferredCategories).slice(0, 12);
  const profile = updateVideoProfile(user.id, (old) => ({
    ...old,
    preferredCategories,
  }));

  appendLedger({
    type: 'video_preferences_update',
    userId: user.id,
    preferredCategories,
  });

  return res.json({
    success: true,
    data: { profile },
  });
});

app.post('/api/videos/:videoId/like', (req, res) => {
  const videoId = clampText(req.params.videoId, 80);
  const user = requireUser(res, req.body?.userId);
  if (!user) return;

  const profile = updateVideoProfile(user.id, (old) => {
    const liked = new Set(old.likedVideoIds);
    if (liked.has(videoId)) liked.delete(videoId);
    else liked.add(videoId);
    return { ...old, likedVideoIds: Array.from(liked) };
  });

  appendLedger({
    type: 'video_like_toggle',
    userId: user.id,
    videoId,
    liked: profile.likedVideoIds.includes(videoId),
  });

  return res.json({ success: true, data: { profile } });
});

app.post('/api/videos/:videoId/favorite', (req, res) => {
  const videoId = clampText(req.params.videoId, 80);
  const user = requireUser(res, req.body?.userId);
  if (!user) return;

  const profile = updateVideoProfile(user.id, (old) => {
    const favored = new Set(old.favoritedVideoIds);
    if (favored.has(videoId)) favored.delete(videoId);
    else favored.add(videoId);
    return { ...old, favoritedVideoIds: Array.from(favored) };
  });

  appendLedger({
    type: 'video_favorite_toggle',
    userId: user.id,
    videoId,
    favorited: profile.favoritedVideoIds.includes(videoId),
  });

  return res.json({ success: true, data: { profile } });
});

app.post('/api/videos/:videoId/view', (req, res) => {
  const videoId = clampText(req.params.videoId, 80);
  const user = requireUser(res, req.body?.userId);
  if (!user) return;

  const city = fixCityText(req.body?.city || '跨城');
  const duration = Number(req.body?.duration || 0);
  const profile = updateVideoProfile(user.id, (old) => {
    const viewed = new Set(old.viewedVideoIds);
    viewed.add(videoId);
    const history = [
      ...safeArray(old.viewHistory),
      {
        videoId,
        city,
        duration: Number.isFinite(duration) ? duration : 0,
        viewedAt: nowISO(),
      },
    ].slice(-300);
    return {
      ...old,
      viewedVideoIds: Array.from(viewed).slice(-1200),
      viewHistory: history,
    };
  });

  return res.json({ success: true, data: { profile } });
});

app.get('/api/blog/posts', (_req, res) => {
  const posts = blogPosts
    .map((post) => enrichBlogPost(post, users))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return res.json({ success: true, data: { posts } });
});

app.post('/api/blog/posts', (req, res) => {
  const author = requireUser(res, req.body?.authorId);
  if (!author) return;

  const title = clampText(fixMojibake(req.body?.title), 120);
  const content = clampText(fixMojibake(req.body?.content), 8000);
  const cityTag = fixCityText(req.body?.cityTag || '杭州');
  const column = clampText(fixMojibake(req.body?.column), 20) || '城市随笔';
  const imageUrl = sanitizeAvatarUrl(req.body?.imageUrl);

  if (!title) return res.status(400).json({ success: false, error: '标题不能为空' });
  if (content.length < 10) return res.status(400).json({ success: false, error: '正文至少 10 个字' });

  const post = enrichBlogPost(
    {
      id: buildId('blog'),
      title,
      content,
      cityTag,
      column,
      authorId: author.id,
      authorName: author.username,
      authorAvatar: author.avatarUrl,
      authorRegion: author.region,
      imageUrl,
      likedUserIds: [],
      comments: [],
      createdAt: nowISO(),
      updatedAt: nowISO(),
    },
    users,
  );

  blogPosts = [post, ...blogPosts];
  persistBlog();

  appendLedger({
    type: 'blog_publish',
    userId: author.id,
    postId: post.id,
    city: cityTag,
    column,
  });

  return res.json({ success: true, data: { post } });
});

app.delete('/api/blog/posts/:id', (req, res) => {
  const postId = clampText(req.params.id, 64);
  const requesterId = clampText(req.body?.requesterId, 64);
  const requester = requireUser(res, requesterId);
  if (!requester) return;

  const target = blogPosts.find((post) => post.id === postId);
  if (!target) return res.status(404).json({ success: false, error: '帖子不存在' });
  if (target.authorId !== requester.id && requester.role !== 'admin') {
    return res.status(403).json({ success: false, error: '无权删除该帖子' });
  }

  blogPosts = blogPosts.filter((post) => post.id !== postId);
  persistBlog();
  appendLedger({
    type: 'blog_delete',
    userId: requester.id,
    postId,
  });

  return res.json({ success: true, data: { id: postId } });
});

app.post('/api/blog/posts/:id/like', (req, res) => {
  const postId = clampText(req.params.id, 64);
  const user = requireUser(res, req.body?.userId);
  if (!user) return;

  const index = blogPosts.findIndex((post) => post.id === postId);
  if (index < 0) return res.status(404).json({ success: false, error: '帖子不存在' });

  const target = { ...blogPosts[index] };
  const likedSet = new Set(safeArray(target.likedUserIds));
  if (likedSet.has(user.id)) likedSet.delete(user.id);
  else likedSet.add(user.id);
  target.likedUserIds = Array.from(likedSet);
  target.updatedAt = nowISO();

  blogPosts[index] = enrichBlogPost(target, users);
  persistBlog();

  return res.json({
    success: true,
    data: {
      post: blogPosts[index],
    },
  });
});

app.post('/api/blog/posts/:id/comments', (req, res) => {
  const postId = clampText(req.params.id, 64);
  const user = requireUser(res, req.body?.userId);
  if (!user) return;

  const content = clampText(fixMojibake(req.body?.content), 400);
  if (!content) return res.status(400).json({ success: false, error: '评论不能为空' });

  const index = blogPosts.findIndex((post) => post.id === postId);
  if (index < 0) return res.status(404).json({ success: false, error: '帖子不存在' });

  const target = { ...blogPosts[index] };
  const comment = {
    id: buildId('c'),
    userId: user.id,
    username: user.username,
    userAvatar: user.avatarUrl,
    userRegion: user.region,
    content,
    createdAt: nowISO(),
  };
  target.comments = [...safeArray(target.comments), comment];
  target.updatedAt = nowISO();
  blogPosts[index] = enrichBlogPost(target, users);
  persistBlog();

  appendLedger({
    type: 'blog_comment',
    userId: user.id,
    postId,
    commentId: comment.id,
  });

  return res.json({
    success: true,
    data: {
      post: blogPosts[index],
    },
  });
});

app.get('/api/governance/tasks', (req, res) => {
  const statusRaw = clampText(req.query?.status, 20);
  const status = normalizeTaskStatus(statusRaw);
  const showAll = !statusRaw || fixMojibake(statusRaw) === '全部';
  const tasks = governanceTasks
    .filter((task) => (showAll ? true : task.status === status))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return res.json({ success: true, data: { tasks } });
});

app.post('/api/governance/tasks', (req, res) => {
  const reporter = requireUser(res, req.body?.reporterId);
  if (!reporter) return;

  const title = clampText(fixMojibake(req.body?.title), 120);
  const description = clampText(fixMojibake(req.body?.description), 2000);
  if (!title || !description) {
    return res.status(400).json({ success: false, error: '请填写标题和问题描述' });
  }

  const task = ensureGovernanceTaskShape(
    {
      id: buildId('task'),
      title,
      city: req.body?.city || '杭州',
      location: req.body?.location || '',
      severity: req.body?.severity || '中',
      description,
      imageUrl: req.body?.imageUrl || '',
      status: '待核验',
      reporterId: reporter.id,
      reporterName: reporter.username,
      createdAt: nowISO(),
      updates: [
        {
          id: buildId('task_update'),
          operator: reporter.username,
          message: '用户提交工单',
          createdAt: nowISO(),
        },
      ],
    },
    users,
  );

  governanceTasks = [task, ...governanceTasks];
  persistGovernanceTasks();

  appendLedger({
    type: 'governance_task_create',
    reporterId: reporter.id,
    taskId: task.id,
    city: task.city,
    severity: task.severity,
  });

  return res.json({ success: true, data: { task } });
});

app.patch('/api/governance/tasks/:id/status', (req, res) => {
  const taskId = clampText(req.params.id, 64);
  const operator = requireUser(res, req.body?.operatorId);
  if (!operator) return;

  const index = governanceTasks.findIndex((task) => task.id === taskId);
  if (index < 0) return res.status(404).json({ success: false, error: '工单不存在' });

  const status = normalizeTaskStatus(req.body?.status);
  const task = { ...governanceTasks[index] };
  task.status = status;
  task.updates = [
    ...safeArray(task.updates),
    {
      id: buildId('task_update'),
      operator: clampText(fixMojibake(req.body?.operatorName), 64) || operator.username,
      message: `状态更新为：${status}`,
      createdAt: nowISO(),
    },
  ];

  governanceTasks[index] = ensureGovernanceTaskShape(task, users);
  persistGovernanceTasks();

  appendLedger({
    type: 'governance_task_status_update',
    operatorId: operator.id,
    taskId,
    status,
  });

  return res.json({ success: true, data: { task: governanceTasks[index] } });
});

app.get('/api/blockchain/records', (req, res) => {
  if (!validateChain(blockchainLedger)) {
    blockchainLedger = [createGenesisBlock()];
    persistBlockchainLedger();
  }

  const userId = clampText(req.query?.userId, 64);
  const limitRaw = Number(req.query?.limit || 20);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 200) : 20;

  let records = [...blockchainLedger];
  if (userId) {
    records = records.filter((record) => {
      const payload = record?.payload || {};
      return payload.userId === userId || payload.reporterId === userId || payload.operatorId === userId;
    });
  }
  records = records.slice(-limit).reverse();

  return res.json({
    success: true,
    data: {
      valid: true,
      records,
    },
  });
});

app.post('/api/blockchain/record', (req, res) => {
  const user = requireUser(res, req.body?.userId);
  if (!user) return;

  const actionType = clampText(req.body?.actionType, 40) || 'custom_record';
  const city = fixCityText(req.body?.city || '跨城');
  const artifact = clampText(fixMojibake(req.body?.artifact), 80);
  const note = clampText(fixMojibake(req.body?.note), 300);
  if (!note) return res.status(400).json({ success: false, error: '链上说明不能为空' });

  appendLedger({
    type: actionType,
    userId: user.id,
    username: user.username,
    city,
    artifact,
    note,
  });

  return res.json({
    success: true,
    data: {
      block: blockchainLedger[blockchainLedger.length - 1],
    },
  });
});

app.post('/api/ai/chat', async (req, res, next) => {
  try {
    const systemPrompt = clampText(fixMojibake(req.body?.systemPrompt), 1200);
    const messages = sanitizeMessages(req.body?.messages);
    const context = req.body?.context || {};
    const contextHint = `上下文：城市=${fixCityText(context.city || '未知')}，路线=${clampText(fixMojibake(context.routeName), 80) || '未设置'}，重点=${clampText(fixMojibake(context.focus), 80) || '城市文脉'}。`;

    const finalMessages = [
      {
        role: 'system',
        content:
          systemPrompt ||
          '你是“城迹”文化导师。回答时先给结论，再给依据，给出可执行观察建议，尽量在220字内，不要附加“多少字”说明。',
      },
      {
        role: 'system',
        content: contextHint,
      },
      ...messages,
    ];

    try {
      const { provider, content } = await runLLM(finalMessages, { temperature: 0.45, maxTokens: 1000 });
      return res.json({
        success: true,
        data: {
          content: stripWordCountSuffix(content),
          provider,
          runtimeModel: getRuntimeModel(),
          fromMock: false,
        },
      });
    } catch {
      return res.json({
        success: true,
        data: {
          content: stripWordCountSuffix(mockChatReply(messages, context)),
          provider: 'mock',
          runtimeModel: 'mock-only',
          fromMock: true,
        },
      });
    }
  } catch (error) {
    next(error);
  }
});

app.post('/api/ai/knowledge', async (req, res, next) => {
  try {
    const pointName = clampText(fixMojibake(req.body?.pointName), 80) || '文化点位';
    const city = fixCityText(req.body?.city || '杭州');
    const question = clampText(fixMojibake(req.body?.question), 600);
    const chatHistory = sanitizeMessages(req.body?.chatHistory).slice(-8);

    if (!question) return res.status(400).json({ success: false, error: '问题不能为空' });

    const prompt = `请基于${city}的“${pointName}”回答：${question}。输出格式：先结论，再证据，再学习价值；不超过220字；不要附加字数统计。`;

    try {
      const { provider, content } = await runLLM(
        [
          {
            role: 'system',
            content: '你是城市历史文化讲解员，回答准确、简洁、可验证。',
          },
          ...chatHistory,
          {
            role: 'user',
            content: prompt,
          },
        ],
        { temperature: 0.35, maxTokens: 900 },
      );

      return res.json({
        success: true,
        data: {
          answer: stripWordCountSuffix(content),
          provider,
          fromMock: false,
        },
      });
    } catch {
      return res.json({
        success: true,
        data: {
          answer: stripWordCountSuffix(mockKnowledgeReply({ city, pointName, question })),
          provider: 'mock',
          fromMock: true,
        },
      });
    }
  } catch (error) {
    next(error);
  }
});

app.post('/api/ai/route', async (req, res, next) => {
  try {
    const input = {
      city: fixCityText(req.body?.city || '杭州'),
      duration: clampText(req.body?.duration, 30) || '半日',
      mood: clampText(fixMojibake(req.body?.mood), 40) || '文化探索',
      spiritTags: uniqueStringArray(req.body?.spiritTags).slice(0, 5),
    };

    const fallback = mockRouteReply(input);
    if (!canUseAliyun && !canUseHunyuan) {
      return res.json({ success: true, data: fallback });
    }

    const ask = `请为城市${input.city}生成研学路线。时长=${input.duration}，偏好=${input.mood}，标签=${input.spiritTags.join('、') || '城市文脉'}。必须返回JSON对象，字段：routeName,routeSubtitle,routeDesc,spiritFocus,points(数组3-5项)。禁止额外解释。`;

    try {
      const { content } = await runLLM(
        [
          { role: 'system', content: '你是研学路线规划助手，只输出严格JSON。' },
          { role: 'user', content: ask },
        ],
        { temperature: 0.3, maxTokens: 900 },
      );
      const parsed = parseJsonObjectFromText(content);
      if (!parsed) return res.json({ success: true, data: fallback });

      const data = {
        routeName: clampText(fixMojibake(parsed.routeName), 80) || fallback.routeName,
        routeSubtitle: clampText(fixMojibake(parsed.routeSubtitle), 120) || fallback.routeSubtitle,
        routeDesc: clampText(fixMojibake(parsed.routeDesc), 600) || fallback.routeDesc,
        spiritFocus: clampText(fixMojibake(parsed.spiritFocus), 40) || fallback.spiritFocus,
        points: uniqueStringArray(parsed.points).slice(0, 6),
      };
      if (!data.points.length) data.points = fallback.points;

      return res.json({ success: true, data });
    } catch {
      return res.json({ success: true, data: fallback });
    }
  } catch (error) {
    next(error);
  }
});

app.post('/api/ai/identify', (req, res) => {
  const imageDataUrl = req.body?.imageDataUrl;
  const cityScope = fixCityText(req.body?.cityScope || '全部');
  const categoryScope = clampText(fixMojibake(req.body?.categoryScope), 40) || '全部';
  const candidatesRaw = safeArray(req.body?.candidates);
  const imageBuffer = decodeDataUrlToBuffer(imageDataUrl);

  if (!imageBuffer) {
    return res.status(400).json({ success: false, error: '请上传有效图片' });
  }
  if (!candidatesRaw.length) {
    return res.status(400).json({ success: false, error: '候选库为空' });
  }

  const candidates = candidatesRaw
    .map((item) => ({
      id: clampText(item?.id, 64),
      title: clampText(fixMojibake(item?.title), 120),
      city: fixCityText(item?.city),
      category: clampText(fixMojibake(item?.category), 40),
      summary: clampText(fixMojibake(item?.summary), 300),
      sourceUrl: clampText(item?.sourceUrl, 500),
      image: clampText(item?.image, 500),
    }))
    .filter((item) => item.id && item.title);

  const scopedCandidates = candidates.filter((item) => {
    const cityMatch = cityScope === '全部' || item.city === cityScope;
    const categoryMatch = categoryScope === '全部' || item.category === categoryScope;
    return cityMatch && categoryMatch;
  });
  const finalCandidates = scopedCandidates.length ? scopedCandidates : candidates;

  const imageHash = crypto.createHash('sha256').update(imageBuffer).digest('hex');
  const scored = finalCandidates
    .map((candidate) => {
      const score = pseudoScore(`${imageHash}|${candidate.id}|${candidate.title}|${candidate.city}|${candidate.category}`);
      return { ...candidate, score };
    })
    .sort((a, b) => b.score - a.score);

  const top = scored.slice(0, 5);
  const bestMatch = top[0] || null;
  const uncertain = Boolean(
    !bestMatch || bestMatch.score < 0.58 || (top[1] && bestMatch.score - top[1].score < 0.04),
  );

  const hasMambaEnv = Boolean(process.env.MAMBA_CODE_DIR && process.env.MAMBA_WEIGHTS_PATH);
  const hasMambaFiles =
    hasMambaEnv &&
    fs.existsSync(String(process.env.MAMBA_CODE_DIR)) &&
    fs.existsSync(String(process.env.MAMBA_WEIGHTS_PATH));

  return res.json({
    success: true,
    data: {
      usedSaliency: Boolean(hasMambaFiles),
      usedDeepFeature: true,
      uncertain,
      bestMatch,
      matches: top,
    },
  });
});

app.use((err, _req, res, _next) => {
  const message = err?.message || '服务器内部错误';
  res.status(500).json({
    success: false,
    error: message,
  });
});

app.listen(PORT, () => {
  console.log(`[chengji-backend] http://localhost:${PORT}`);
  console.log(`[chengji-backend] provider=${PROVIDER_MODE}, runtime=${getRuntimeModel()}`);
});

