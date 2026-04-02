import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FadeIn, motion } from '@/components/MotionPrimitives';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MapPin } from 'lucide-react';
import { type ChatMessage } from '@/data/mockData';
import { aiService } from '@/services/ai-service';
import { useSetupData, useMatchedRoute } from '@/hooks/useSetupData';

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-2 w-2 rounded-full"
          style={{ background: '#2D5A5A', animation: `inkDrop 1.2s ease-in-out infinite ${i * 0.2}s` }}
        />
      ))}
    </div>
  );
}

function ChatBubble({ msg, isNew }: { msg: ChatMessage; isNew: boolean }) {
  const isUser = msg.role === 'user';

  return (
    <motion.div
      initial={isNew ? { opacity: 0, y: 18 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`mb-4 flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div
          className="mr-3 mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{
            background: 'linear-gradient(135deg, #244350, #13243D)',
            boxShadow: '0 0 12px rgba(128,215,204,0.22)',
          }}
        >
          <span style={{ color: '#80D7CC', fontFamily: "'Noto Serif SC', serif", fontSize: '13px', fontWeight: 700 }}>迹</span>
        </div>
      )}

      <div
        className="max-w-[76%] rounded-2xl px-4 py-3"
        style={{
          background: isUser ? 'linear-gradient(135deg, #244350, #13243D)' : 'rgba(246,241,232,0.95)',
          border: isUser ? '1px solid rgba(128,215,204,0.32)' : '1px solid #D8C8B4',
          boxShadow: isUser ? '0 4px 16px rgba(36,67,80,0.2)' : '0 2px 10px rgba(0,0,0,0.05)',
          color: isUser ? '#F6F1E8' : '#2C2C2C',
        }}
      >
        <p className="text-sm leading-relaxed" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
          {msg.content}
        </p>
      </div>
    </motion.div>
  );
}

export default function Chat() {
  const navigate = useNavigate();
  const setup = useSetupData();
  const { matchedRoute, cityName, spiritLabels, primarySpirit } = useMatchedRoute(setup);
  const spiritLabelsText = spiritLabels.join(' / ');
  const spiritLabelsKey = spiritLabels.join('|');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showRouteCard, setShowRouteCard] = useState(false);
  const [routeInsight, setRouteInsight] = useState('');

  const initialized = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timers: Array<ReturnType<typeof setTimeout>> = [];
    const schedule = (fn: () => void, delay: number) => {
      const id = setTimeout(fn, delay);
      timers.push(id);
      return id;
    };

    if (initialized.current) return;
    initialized.current = true;

    const durationTextMap = { half: '半日', full: '一日', two: '两日' } as const;
    const durationText = durationTextMap[setup.duration] ?? '半日';

    const script: ChatMessage[] = [
      {
        id: 'welcome-1',
        role: 'assistant',
        content: `你好，我是“城迹”城市文化讲解导师。已收到你的设置：城市 ${cityName}、时长 ${durationText}、兴趣方向 ${spiritLabelsText}。`,
      },
      {
        id: 'welcome-2',
        role: 'assistant',
        content: `我建议你从「${matchedRoute.name}」开始。这条路线覆盖 ${matchedRoute.points.length} 个研学节点，核心目标是：${matchedRoute.learningGoal}`,
      },
      {
        id: 'welcome-3',
        role: 'assistant',
        content: '如果你愿意，我还可以根据你的提问实时补充背景知识、观察方法和讲解提纲。',
      },
    ];

    let index = 0;
    const appendScript = () => {
      if (index >= script.length) {
        schedule(() => setShowRouteCard(true), 700);
        return;
      }

      setIsTyping(true);
      schedule(() => {
        const nextMessage = script[index];
        setIsTyping(false);
        if (nextMessage && typeof nextMessage.id === 'string') {
          setMessages((prev) => [...prev, nextMessage]);
        } else {
          schedule(() => setShowRouteCard(true), 300);
          return;
        }
        index += 1;
        schedule(appendScript, 450);
      }, 950);
    };

    schedule(appendScript, 450);

    aiService
      .generateJourneyPlan({
        city: cityName,
        duration: setup.duration,
        mood: setup.mood,
        spiritTags: spiritLabels,
      })
      .then((result) => {
        const safeRouteDesc =
          result && typeof result.routeDesc === 'string' && result.routeDesc.trim()
            ? result.routeDesc
            : '这条路线将优先保证知识完整性，再兼顾行走效率与现场体验。';
        setRouteInsight(safeRouteDesc);
      })
      .catch(() => {
        setRouteInsight('这条路线将优先保证知识完整性，再兼顾行走效率与现场体验。');
      });

    return () => {
      timers.forEach((id) => clearTimeout(id));
    };
  }, [
    setup.duration,
    setup.mood,
    cityName,
    spiritLabelsKey,
    spiritLabelsText,
    matchedRoute.name,
    matchedRoute.learningGoal,
    matchedRoute.points.length,
  ]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping, showRouteCard, routeInsight]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: `user-${Date.now()}`, role: 'user', content: input };
    const nextMessages = [...messages, userMsg];

    setMessages(nextMessages);
    setInput('');
    setIsTyping(true);

    try {
      const reply = await aiService.chat(
        nextMessages.map((msg) => ({ role: msg.role, content: msg.content })),
        {
          city: cityName,
          routeName: matchedRoute.name,
          focus: primarySpirit,
        },
      );

      setMessages((prev) => [...prev, { id: `ai-${Date.now()}`, role: 'assistant', content: reply }]);
      if (!showRouteCard) {
        setShowRouteCard(true);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `fallback-${Date.now()}`,
          role: 'assistant',
          content: '我先记录下你的问题。稍后你可以继续提问，或先查看路线后再回来做深度问答。',
        },
      ]);
    }

    setIsTyping(false);
  };

  return (
    <div className="flex h-screen flex-col" style={{ background: 'linear-gradient(180deg, #13243D 0%, #0E1A2B 100%)' }}>
      <div className="shrink-0 px-4 py-3" style={{ background: 'rgba(19,36,61,0.94)', borderBottom: '1px solid rgba(128,215,204,0.15)' }}>
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{ background: 'linear-gradient(135deg, #80D7CC, #244350)', boxShadow: '0 0 12px rgba(128,215,204,0.28)' }}
          >
            <span style={{ color: '#0E1A2B', fontFamily: "'Noto Serif SC', serif", fontSize: '12px', fontWeight: 800 }}>迹</span>
          </div>
          <div>
            <p style={{ color: '#F6F1E8', fontFamily: "'Noto Serif SC', serif", fontSize: '16px', fontWeight: 700 }}>城迹导师</p>
            <p className="text-xs" style={{ color: '#80D7CC', opacity: 0.7 }}>
              历史文化讲解 / 研学路线建议 / 现场问答
            </p>
          </div>
          <div className="ml-auto h-2 w-2 rounded-full" style={{ background: '#80D7CC', boxShadow: '0 0 7px #80D7CC' }} />
        </div>
      </div>

      <div ref={scrollRef} className="grow overflow-y-auto px-4 py-6">
        {messages
          .filter((msg): msg is ChatMessage => Boolean(msg && typeof msg.id === 'string'))
          .map((msg) => (
            <ChatBubble key={msg.id} msg={msg} isNew={msg.id.startsWith('user-') || msg.id.startsWith('ai-') || msg.id.startsWith('fallback-')} />
          ))}

        {isTyping && <TypingIndicator />}

        {routeInsight && (
          <FadeIn>
            <div
              className="mx-auto mt-3 max-w-sm rounded-xl p-4"
              style={{ background: 'rgba(246,241,232,0.08)', border: '1px solid rgba(128,215,204,0.25)' }}
            >
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(246,241,232,0.8)' }}>
                路线说明：{routeInsight}
              </p>
            </div>
          </FadeIn>
        )}

        {showRouteCard && (
          <FadeIn>
            <div
              className="mx-auto mt-4 max-w-sm cursor-pointer rounded-xl p-5 transition-all duration-300 hover:scale-[1.02]"
              onClick={() => navigate('/route')}
              style={{
                background: 'linear-gradient(135deg, rgba(36,67,80,0.45), rgba(128,215,204,0.14))',
                border: '1px solid rgba(128,215,204,0.35)',
                boxShadow: '0 4px 20px rgba(128,215,204,0.14)',
              }}
            >
              <div className="flex items-center gap-2 text-xs" style={{ color: '#80D7CC' }}>
                <MapPin className="h-4 w-4" />
                研学路线已生成
              </div>
              <p className="mt-2" style={{ fontFamily: "'Noto Serif SC', serif", color: '#F6F1E8', fontSize: '18px', fontWeight: 700 }}>
                {matchedRoute.name}
              </p>
              <p className="mt-1 text-xs" style={{ color: 'rgba(246,241,232,0.6)' }}>
                {matchedRoute.points.length} 个点位 · 腾讯地图导航 · 点击查看详情
              </p>
            </div>
          </FadeIn>
        )}
      </div>

      <div className="shrink-0 px-4 py-3" style={{ background: 'rgba(19,36,61,0.94)', borderTop: '1px solid rgba(128,215,204,0.14)' }}>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && handleSend()}
            placeholder="例如：这个点位最适合讲什么历史问题？"
            className="grow rounded-xl border-0 px-4 py-3"
            style={{ background: 'rgba(246,241,232,0.12)', color: '#F6F1E8' }}
          />
          <Button onClick={handleSend} className="rounded-xl px-4" style={{ background: 'linear-gradient(135deg, #B66A44, #D38A5C)', border: 'none' }}>
            <Send className="h-5 w-5" style={{ color: '#FFF8EF' }} />
          </Button>
        </div>
      </div>

      <style>{`@keyframes inkDrop { 0%, 100% { transform: scale(1); opacity: 0.4; } 50% { transform: scale(1.5); opacity: 1; } }`}</style>
    </div>
  );
}
