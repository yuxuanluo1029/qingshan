import { useEffect, useMemo, useState } from 'react';
import { BookOpenText, CheckCircle2, ClipboardCheck, Database, RotateCcw, Search, Send, Sparkles } from 'lucide-react';
import { cities, cityPoints } from '@/data/mockData';
import { aiService } from '@/services/ai-service';
import { knowledgeCategories, knowledgeCities, knowledgeEntries } from '@/data/knowledgeBase';

interface QARecord {
  id: string;
  question: string;
  answer: string;
  city: string;
  pointName: string;
}

interface QuizQuestion {
  id: string;
  city: string;
  stem: string;
  options: Array<{ id: string; label: string }>;
  answerId: string;
  explanation: string;
}

type KnowledgeTab = 'encyclopedia' | 'challenge' | 'database';

const QUIZ_PAPER: QuizQuestion[] = [
  {
    id: 'q1',
    city: '杭州',
    stem: '良渚古城遗址能够证明早期国家形态的重要实物证据，最核心的一组是？',
    options: [
      { id: 'A', label: '大型石窟与佛像群' },
      { id: 'B', label: '城墙、水利系统与高等级玉器' },
      { id: 'C', label: '海上丝路港口遗址' },
      { id: 'D', label: '明清皇家园林建筑群' },
    ],
    answerId: 'B',
    explanation: '良渚以城址格局、水利工程和玉礼器体系著称，构成“早期国家文明”的关键证据链。',
  },
  {
    id: 'q2',
    city: '成都',
    stem: '成都金沙遗址中最具代表性的金器文物之一是？',
    options: [
      { id: 'A', label: '太阳神鸟金饰' },
      { id: 'B', label: '后母戊鼎' },
      { id: 'C', label: '四羊方尊' },
      { id: 'D', label: '金缕玉衣' },
    ],
    answerId: 'A',
    explanation: '太阳神鸟金饰是古蜀文明的重要符号，也常被用于介绍成都古代文明的核心意象。',
  },
  {
    id: 'q3',
    city: '长沙',
    stem: '马王堆汉墓最常用于展示西汉生活与信仰图景的文物类型是？',
    options: [
      { id: 'A', label: '甲骨卜辞' },
      { id: 'B', label: '彩绘陶俑群' },
      { id: 'C', label: 'T形帛画与漆器' },
      { id: 'D', label: '龙门石窟造像' },
    ],
    answerId: 'C',
    explanation: '马王堆出土的T形帛画和大量漆器，为研究汉代礼制、观念与日常生活提供了直观证据。',
  },
  {
    id: 'q4',
    city: '西安',
    stem: '理解隋唐长安城城市规划时，最常提到的核心制度是？',
    options: [
      { id: 'A', label: '水乡圩田制度' },
      { id: 'B', label: '里坊制度与中轴秩序' },
      { id: 'C', label: '海港关税制度' },
      { id: 'D', label: '近代租界制度' },
    ],
    answerId: 'B',
    explanation: '隋唐长安城以里坊划分和中轴组织著称，是中国古代都城规划研究的重要样本。',
  },
  {
    id: 'q5',
    city: '武汉',
    stem: '盘龙城遗址在中国文明版图中的价值，最准确的表述是？',
    options: [
      { id: 'A', label: '证明长江中游与中原商文明存在密切联系' },
      { id: 'B', label: '是最早的海上对外贸易口岸' },
      { id: 'C', label: '是明清皇家陵寝核心区' },
      { id: 'D', label: '完整保存了唐宋园林体系' },
    ],
    answerId: 'A',
    explanation: '盘龙城遗址显示了商代文化向长江中游的扩展与互动，是区域文明交流的重要证据。',
  },
];

const KNOWLEDGE_TABS: Array<{
  id: KnowledgeTab;
  label: string;
  description: string;
  icon: typeof BookOpenText;
}> = [
  { id: 'encyclopedia', label: '百科全书', description: '城市文化问答', icon: BookOpenText },
  { id: 'challenge', label: '问答挑战', description: '五题文化试卷', icon: ClipboardCheck },
  { id: 'database', label: '一览无余', description: '跨城知识检索', icon: Database },
];

export default function KnowledgeQA() {
  const [activeTab, setActiveTab] = useState<KnowledgeTab>('encyclopedia');

  const [cityId, setCityId] = useState(cities[0]?.id ?? 'hangzhou');
  const [pointId, setPointId] = useState('');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<QARecord[]>([]);

  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizNotice, setQuizNotice] = useState('');

  const [dbQuery, setDbQuery] = useState('');
  const [dbCity, setDbCity] = useState<(typeof knowledgeCities)[number]>('全部');
  const [dbCategory, setDbCategory] = useState<(typeof knowledgeCategories)[number]>('全部');

  const points = useMemo(() => cityPoints.filter((point) => point.cityId === cityId), [cityId]);

  useEffect(() => {
    if (points.length === 0) {
      setPointId('');
      return;
    }

    if (!pointId || !points.some((point) => point.id === pointId)) {
      setPointId(points[0]?.id ?? '');
    }
  }, [pointId, points]);

  const answeredCount = useMemo(() => Object.values(quizAnswers).filter(Boolean).length, [quizAnswers]);
  const quizScore = useMemo(() => QUIZ_PAPER.reduce((sum, item) => (quizAnswers[item.id] === item.answerId ? sum + 1 : sum), 0), [quizAnswers]);

  const filteredKnowledge = useMemo(() => {
    const keyword = dbQuery.trim().toLowerCase();

    return knowledgeEntries.filter((item) => {
      const cityMatch = dbCity === '全部' || item.city === dbCity;
      const categoryMatch = dbCategory === '全部' || item.category === dbCategory;
      const keywordMatch =
        keyword.length === 0 ||
        item.title.toLowerCase().includes(keyword) ||
        item.summary.toLowerCase().includes(keyword) ||
        item.keywords.some((k) => k.toLowerCase().includes(keyword));

      return cityMatch && categoryMatch && keywordMatch;
    });
  }, [dbCategory, dbCity, dbQuery]);

  const submitQuestion = async () => {
    const chosenPoint = points.find((point) => point.id === pointId) ?? points[0];
    const cityName = cities.find((city) => city.id === cityId)?.name ?? '杭州';

    const text = question.trim();
    if (!text || !chosenPoint) return;

    setLoading(true);
    try {
      const answer = await aiService.askKnowledge({
        pointName: chosenPoint.name,
        city: cityName,
        question: text,
        chatHistory: records
          .flatMap((item) => [
            { role: 'user' as const, content: item.question },
            { role: 'assistant' as const, content: item.answer },
          ])
          .slice(-8),
      });

      setRecords((prev) => [
        {
          id: `qa_${Date.now()}`,
          question: text,
          answer,
          city: cityName,
          pointName: chosenPoint.name,
        },
        ...prev,
      ]);
      setQuestion('');
    } finally {
      setLoading(false);
    }
  };

  const chooseAnswer = (questionId: string, optionId: string) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    setQuizNotice('');
    if (quizSubmitted) {
      setQuizSubmitted(false);
    }
  };

  const submitPaper = () => {
    if (answeredCount < QUIZ_PAPER.length) {
      setQuizNotice(`还有 ${QUIZ_PAPER.length - answeredCount} 题未作答，请先完成全部5题。`);
      return;
    }

    setQuizNotice('');
    setQuizSubmitted(true);
  };

  const resetPaper = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizNotice('');
  };

  return (
    <div className="space-y-6">
      <section
        className="rounded-3xl p-6 md:p-8"
        style={{
          background:
            'radial-gradient(circle at 82% 12%, rgba(216,170,116,0.28), transparent 36%), linear-gradient(130deg, #261913 0%, #402b20 52%, #69432f 100%)',
        }}
      >
        <p className="text-xs tracking-[0.35em]" style={{ color: 'rgba(255,229,200,0.8)' }}>
          KNOWLEDGE CENTER
        </p>
        <h2 className="mt-3 text-3xl font-black md:text-5xl" style={{ color: '#fff0dd', fontFamily: "'ZCOOL XiaoWei', 'Noto Serif SC', serif" }}>
          知识问答
        </h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 md:text-base" style={{ color: 'rgba(255,234,210,0.82)' }}>
          以五城文化知识为核心，分为百科全书、问答挑战、一览无余三个独立栏目，支持分栏浏览与深度探索。
        </p>
      </section>

      <section className="rounded-2xl p-4 md:p-5" style={{ background: '#fff8ef', border: '1px solid rgba(127,83,49,0.2)' }}>
        <p className="text-xs tracking-[0.2em]" style={{ color: '#8f5a35' }}>
          子栏目导航
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {KNOWLEDGE_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all"
                style={
                  active
                    ? {
                        background: 'linear-gradient(135deg, #8f5a35, #bd8054)',
                        color: '#fff7eb',
                        boxShadow: '0 8px 20px rgba(98,58,31,0.22)',
                      }
                    : {
                        background: '#fffef9',
                        color: '#6f3f1f',
                        border: '1px solid rgba(127,83,49,0.25)',
                      }
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                <div>
                  <p className="text-sm font-bold">{tab.label}</p>
                  <p className={`text-xs ${active ? 'text-[#ffe8cf]' : ''}`} style={active ? undefined : { color: '#8f5a35' }}>
                    {tab.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {activeTab === 'encyclopedia' && (
        <section className="space-y-4">
          <h3 className="text-2xl font-black" style={{ color: '#5f3920', fontFamily: "'Noto Serif SC', serif" }}>
            百科全书
          </h3>

          <section className="grid gap-4 rounded-2xl p-5 md:grid-cols-[1fr_1fr_2fr_auto] md:items-end" style={{ background: '#fff8ef', border: '1px solid rgba(127,83,49,0.2)' }}>
            <label className="text-sm">
              <span className="mb-2 block font-semibold" style={{ color: '#6f3f1f' }}>
                城市
              </span>
              <select
                value={cityId}
                onChange={(event) => {
                  setCityId(event.target.value);
                  setPointId('');
                }}
                className="w-full rounded-xl px-3 py-3"
                style={{ background: '#fffef9', border: '1px solid rgba(127,83,49,0.28)' }}
              >
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm">
              <span className="mb-2 block font-semibold" style={{ color: '#6f3f1f' }}>
                点位
              </span>
              <select
                value={pointId}
                onChange={(event) => setPointId(event.target.value)}
                className="w-full rounded-xl px-3 py-3"
                style={{ background: '#fffef9', border: '1px solid rgba(127,83,49,0.28)' }}
              >
                {points.map((point) => (
                  <option key={point.id} value={point.id}>
                    {point.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm">
              <span className="mb-2 block font-semibold" style={{ color: '#6f3f1f' }}>
                提问
              </span>
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && submitQuestion()}
                placeholder="例如：这个点位如何放入五城比较框架？"
                className="w-full rounded-xl px-4 py-3"
                style={{ background: '#fffef9', border: '1px solid rgba(127,83,49,0.28)' }}
              />
            </label>

            <button
              onClick={submitQuestion}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #8f5a35, #bd8054)', color: '#fff8ef' }}
            >
              {loading ? '生成中' : '提问'}
              <Send className="h-4 w-4" />
            </button>
          </section>

          <section className="space-y-4">
            {records.length === 0 && (
              <div className="rounded-2xl p-6" style={{ background: '#fff8ef', border: '1px solid rgba(127,83,49,0.2)' }}>
                <p className="text-sm" style={{ color: '#7b5b45' }}>
                  可围绕历史背景、遗址结构、文物关联、城市比较四个角度提问，形成更完整的文化认知路径。
                </p>
              </div>
            )}

            {records.map((record) => (
              <article key={record.id} className="rounded-2xl p-5" style={{ background: '#fff8ef', border: '1px solid rgba(127,83,49,0.2)' }}>
                <p className="text-xs" style={{ color: '#8e613f' }}>
                  {record.city} · {record.pointName}
                </p>
                <h4 className="mt-2 text-base font-bold" style={{ color: '#5f3920' }}>
                  Q：{record.question}
                </h4>
                <div className="mt-3 rounded-xl p-4 text-sm leading-7" style={{ background: '#fff2e1', color: '#5f4a3d' }}>
                  <Sparkles className="mr-1 inline h-4 w-4" style={{ color: '#8f5a35' }} />
                  {record.answer}
                </div>
              </article>
            ))}
          </section>
        </section>
      )}

      {activeTab === 'challenge' && (
        <section className="space-y-4 rounded-2xl p-5" style={{ background: '#fff8ef', border: '1px solid rgba(127,83,49,0.2)' }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.2em]" style={{ color: '#9a6f4b' }}>
                Q&A CHALLENGE
              </p>
              <h3 className="mt-2 text-2xl font-black" style={{ color: '#60381f', fontFamily: "'ZCOOL XiaoWei', 'Noto Serif SC', serif" }}>
                问答挑战
              </h3>
              <p className="mt-2 text-sm leading-6" style={{ color: '#7a5740' }}>
                以五城代表问题构成标准化试卷，用于建立跨城市的文化知识比较能力。
              </p>
            </div>
            <div className="rounded-xl p-3" style={{ background: 'rgba(143,90,53,0.12)' }}>
              <ClipboardCheck className="h-5 w-5" style={{ color: '#8f5a35' }} />
            </div>
          </div>

          <div className="rounded-xl p-3" style={{ background: '#fff2e1' }}>
            <div className="flex items-center justify-between text-sm" style={{ color: '#6f3f1f' }}>
              <span>作答进度</span>
              <span>{answeredCount}/5</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full" style={{ background: 'rgba(143,90,53,0.18)' }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${(answeredCount / QUIZ_PAPER.length) * 100}%`,
                  background: 'linear-gradient(90deg, #8f5a35, #bd8054)',
                }}
              />
            </div>
            {quizSubmitted && (
              <div className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm" style={{ background: 'rgba(61,130,88,0.12)', color: '#2f6f45' }}>
                <CheckCircle2 className="h-4 w-4" />
                得分：{quizScore} / 5
              </div>
            )}
            {quizNotice && (
              <p className="mt-3 rounded-lg px-3 py-2 text-sm" style={{ background: 'rgba(173,84,53,0.12)', color: '#8a3f26' }}>
                {quizNotice}
              </p>
            )}
          </div>

          <div className="grid gap-3 xl:grid-cols-2">
            {QUIZ_PAPER.map((item, index) => (
              <article key={item.id} className="rounded-xl p-4" style={{ background: '#fffef9', border: '1px solid rgba(127,83,49,0.2)' }}>
                <p className="text-xs" style={{ color: '#9b714d' }}>
                  第 {index + 1} 题 · {item.city}
                </p>
                <h4 className="mt-2 text-sm font-semibold leading-6" style={{ color: '#5f3920' }}>
                  {item.stem}
                </h4>

                <div className="mt-3 grid gap-2">
                  {item.options.map((option) => {
                    const isSelected = quizAnswers[item.id] === option.id;
                    const isCorrect = item.answerId === option.id;

                    let buttonStyle = {
                      background: '#fff8ef',
                      border: '1px solid rgba(127,83,49,0.28)',
                      color: '#6c462e',
                    };

                    if (!quizSubmitted && isSelected) {
                      buttonStyle = {
                        background: 'rgba(143,90,53,0.16)',
                        border: '1px solid rgba(143,90,53,0.55)',
                        color: '#6f3f1f',
                      };
                    }

                    if (quizSubmitted && isCorrect) {
                      buttonStyle = {
                        background: 'rgba(61,130,88,0.12)',
                        border: '1px solid rgba(61,130,88,0.45)',
                        color: '#2f6f45',
                      };
                    } else if (quizSubmitted && isSelected && !isCorrect) {
                      buttonStyle = {
                        background: 'rgba(173,84,53,0.12)',
                        border: '1px solid rgba(173,84,53,0.45)',
                        color: '#8a3f26',
                      };
                    }

                    return (
                      <button
                        key={option.id}
                        onClick={() => chooseAnswer(item.id, option.id)}
                        className="rounded-lg px-3 py-2 text-left text-sm transition-all"
                        style={buttonStyle}
                      >
                        {option.id}. {option.label}
                      </button>
                    );
                  })}
                </div>

                {quizSubmitted && (
                  <p className="mt-3 rounded-lg px-3 py-2 text-xs leading-6" style={{ background: '#fff2e1', color: '#6f4d38' }}>
                    解析：{item.explanation}
                  </p>
                )}
              </article>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={submitPaper}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #8f5a35, #bd8054)', color: '#fff8ef' }}
            >
              提交试卷
              <CheckCircle2 className="h-4 w-4" />
            </button>
            <button
              onClick={resetPaper}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
              style={{ background: '#fff2e1', border: '1px solid rgba(127,83,49,0.25)', color: '#6f3f1f' }}
            >
              重置
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      {activeTab === 'database' && (
        <section className="space-y-4 rounded-2xl p-5" style={{ background: '#fff8ef', border: '1px solid rgba(127,83,49,0.2)' }}>
          <h3 className="text-2xl font-black" style={{ color: '#5f3920', fontFamily: "'Noto Serif SC', serif" }}>
            一览无余
          </h3>
          <p className="text-sm" style={{ color: '#7a5b46' }}>
            汇集五城建筑、文物、博物馆与城市记忆条目，可按城市、类别与关键词组合检索。
          </p>

          <div className="grid gap-3 lg:grid-cols-[2fr_1fr_1fr]">
            <label className="text-sm">
              <span className="mb-1 block" style={{ color: '#6f3f1f' }}>
                关键词
              </span>
              <div className="flex items-center rounded-xl px-3" style={{ background: '#fffef9', border: '1px solid rgba(127,83,49,0.28)' }}>
                <Search className="h-4 w-4" style={{ color: '#8f5a35' }} />
                <input
                  value={dbQuery}
                  onChange={(event) => setDbQuery(event.target.value)}
                  placeholder="输入地标、文物或时代关键词"
                  className="w-full bg-transparent px-2 py-3 outline-none"
                />
              </div>
            </label>

            <label className="text-sm">
              <span className="mb-1 block" style={{ color: '#6f3f1f' }}>
                城市
              </span>
              <select
                value={dbCity}
                onChange={(event) => setDbCity(event.target.value as (typeof knowledgeCities)[number])}
                className="w-full rounded-xl px-3 py-3"
                style={{ background: '#fffef9', border: '1px solid rgba(127,83,49,0.28)' }}
              >
                {knowledgeCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm">
              <span className="mb-1 block" style={{ color: '#6f3f1f' }}>
                类别
              </span>
              <select
                value={dbCategory}
                onChange={(event) => setDbCategory(event.target.value as (typeof knowledgeCategories)[number])}
                className="w-full rounded-xl px-3 py-3"
                style={{ background: '#fffef9', border: '1px solid rgba(127,83,49,0.28)' }}
              >
                {knowledgeCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <p className="text-xs" style={{ color: '#8f5a35' }}>
            共检索到 {filteredKnowledge.length} 条记录
          </p>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredKnowledge.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl"
                style={{ background: '#fffef9', border: '1px solid rgba(127,83,49,0.2)', boxShadow: '0 8px 18px rgba(56,35,21,0.08)' }}
              >
                <img src={item.image} alt={item.title} className="h-40 w-full object-cover" loading="lazy" />
                <div className="p-4">
                  <p className="text-xs" style={{ color: '#8e613f' }}>
                    {item.city} · {item.category} · {item.era}
                  </p>
                  <h4 className="mt-1 text-base font-bold" style={{ color: '#5f3920', fontFamily: "'Noto Serif SC', serif" }}>
                    {item.title}
                  </h4>
                  <p className="mt-2 text-sm leading-6" style={{ color: '#7a5b46' }}>
                    {item.summary}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.keywords.slice(0, 4).map((keyword) => (
                      <span key={keyword} className="rounded-full px-2 py-0.5 text-[11px]" style={{ background: 'rgba(143,90,53,0.1)', color: '#8f5a35' }}>
                        {keyword}
                      </span>
                    ))}
                  </div>
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-xs font-semibold"
                    style={{ color: '#8f5a35' }}
                  >
                    查看资料来源
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

