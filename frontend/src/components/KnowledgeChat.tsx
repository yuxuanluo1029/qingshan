import { useEffect, useRef, useState } from 'react';
import { motion } from '@/components/MotionPrimitives';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, X } from 'lucide-react';
import { aiService, type AIMessage } from '@/services/ai-service';

interface KnowledgeChatProps {
  pointName: string;
  city: string;
  characterName: string;
  characterColor: string;
}

interface ChatMsg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const quickQuestions = ['这里的历史背景是什么？', '有哪些关键知识点适合讲解？', '现场观察应该重点看什么？', '这个点位如何与城市发展联系起来？'];

export function KnowledgeChat({ pointName, city, characterName, characterColor }: KnowledgeChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `你好，我是 ${characterName}。你现在位于「${pointName}」，可以问我历史背景、知识亮点或现场观察方法。`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (text?: string) => {
    const question = text || input.trim();
    if (!question) return;

    const userMsg: ChatMsg = { id: `u-${Date.now()}`, role: 'user', content: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history: AIMessage[] = messages.map((msg) => ({ role: msg.role, content: msg.content }));
      const answer = await aiService.askKnowledge({
        pointName,
        city,
        question,
        chatHistory: history,
      });
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: 'assistant', content: '我先记下这个问题。你可以再换个角度问，我会继续补充。' },
      ]);
    }

    setIsTyping(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 hover:scale-110"
        style={{
          background: `linear-gradient(135deg, ${characterColor}, #13243D)`,
          boxShadow: `0 4px 20px ${characterColor}66, 0 0 40px ${characterColor}22`,
          border: `2px solid ${characterColor}44`,
        }}
      >
        <MessageCircle className="h-6 w-6" style={{ color: '#F6F1E8' }} />
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 100, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md overflow-hidden rounded-2xl md:bottom-6 md:left-auto md:right-6 md:w-96"
      style={{
        background: 'linear-gradient(180deg, #13243D, #0E1A2B)',
        border: '1px solid rgba(128,215,204,0.15)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 30px rgba(128,215,204,0.08)',
        maxHeight: '70vh',
      }}
    >
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(128,215,204,0.1)' }}>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: `linear-gradient(135deg, ${characterColor}, #2D5A5A)` }}>
            <span className="text-xs font-bold" style={{ color: '#F6F1E8' }}>
              迹
            </span>
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: '#F6F1E8', fontFamily: "'Noto Serif SC', serif" }}>
              导师问答
            </p>
            <p className="text-[10px]" style={{ color: '#80D7CC', opacity: 0.7 }}>
              {pointName}
            </p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="rounded-full p-1 transition-all hover:bg-white/10">
          <X className="h-4 w-4" style={{ color: 'rgba(246,241,232,0.6)' }} />
        </button>
      </div>

      <div ref={scrollRef} className="overflow-y-auto px-4 py-3" style={{ maxHeight: 'calc(70vh - 140px)' }}>
        {messages
          .filter((msg): msg is ChatMsg => Boolean(msg && typeof msg.id === 'string'))
          .map((msg) => (
            <div key={msg.id} className={`mb-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className="max-w-[85%] rounded-xl px-3 py-2"
                style={{
                  background: msg.role === 'user' ? `linear-gradient(135deg, ${characterColor}cc, ${characterColor})` : 'rgba(246,241,232,0.08)',
                  border: msg.role === 'user' ? 'none' : '1px solid rgba(246,241,232,0.08)',
                  color: msg.role === 'user' ? '#F6F1E8' : 'rgba(246,241,232,0.84)',
                }}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}

        {isTyping && (
          <div className="mb-3 flex justify-start">
            <div className="flex items-center gap-1 rounded-xl px-3 py-2" style={{ background: 'rgba(246,241,232,0.08)' }}>
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: '#80D7CC', animation: `typeDot 1s ease-in-out infinite ${index * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {messages.length <= 2 && (
        <div className="flex gap-2 overflow-x-auto px-4 pb-2" style={{ scrollbarWidth: 'none' }}>
          {quickQuestions.map((question) => (
            <button
              key={question}
              onClick={() => handleSend(question)}
              className="shrink-0 rounded-full px-3 py-1 text-xs transition-all hover:scale-105"
              style={{ background: 'rgba(128,215,204,0.1)', color: '#80D7CC', border: '1px solid rgba(128,215,204,0.2)', whiteSpace: 'nowrap' }}
            >
              {question}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 px-4 py-3" style={{ borderTop: '1px solid rgba(128,215,204,0.1)' }}>
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && handleSend()}
          placeholder="问一个与你当前位置相关的问题…"
          className="grow rounded-lg border-0 px-3 py-2 text-sm"
          style={{ background: 'rgba(246,241,232,0.08)', color: '#F6F1E8' }}
        />
        <Button onClick={() => handleSend()} className="rounded-lg px-3" style={{ background: characterColor, border: 'none' }}>
          <Send className="h-4 w-4" style={{ color: '#F6F1E8' }} />
        </Button>
      </div>

      <style>{`@keyframes typeDot { 0%,100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.3); } }`}</style>
    </motion.div>
  );
}
