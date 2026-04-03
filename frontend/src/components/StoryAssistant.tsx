import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { aiService } from '@/services/ai-service';

interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface StoryAssistantProps {
  moduleTitle: string;
  quickPrompts: string[];
  contextHint: string;
  accentColor?: string;
}

export function StoryAssistant({ moduleTitle, quickPrompts, contextHint, accentColor = '#8f5a35' }: StoryAssistantProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `我是城迹AI讲解助手。你当前位于“${moduleTitle}”，可以问我历史故事、文化背景或讲解词。`,
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const send = async (question?: string) => {
    const text = (question ?? input).trim();
    if (!text) return;

    const userMessage: AssistantMessage = { id: `u_${Date.now()}`, role: 'user', content: text };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput('');
    setTyping(true);

    try {
      const answer = await aiService.chat(
        nextMessages.map((item) => ({ role: item.role, content: item.content })),
        {
          city: '中国五城联展',
          routeName: moduleTitle,
          focus: contextHint,
        },
      );

      setMessages((prev) => [...prev, { id: `a_${Date.now()}`, role: 'assistant', content: answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `fallback_${Date.now()}`,
          role: 'assistant',
          content: '我先记录这个问题。你可以换一种问法，我会继续补充更清晰的讲解。',
        },
      ]);
    }

    setTyping(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition hover:scale-105"
        style={{ background: `linear-gradient(135deg, ${accentColor}, #3d2a1d)`, color: '#fff8ef' }}
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto flex max-h-[72vh] max-w-md flex-col overflow-hidden rounded-2xl md:bottom-6 md:left-auto md:right-6"
      style={{
        background: 'linear-gradient(180deg, #2d1c14 0%, #3b261a 100%)',
        border: '1px solid rgba(255,235,214,0.2)',
        boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
      }}
    >
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,235,214,0.15)' }}>
        <div>
          <p className="text-sm font-bold" style={{ color: '#fff4e4' }}>
            AI讲解助手
          </p>
          <p className="text-xs" style={{ color: 'rgba(255,235,214,0.7)' }}>
            {moduleTitle}
          </p>
        </div>
        <button onClick={() => setOpen(false)}>
          <X className="h-4 w-4" style={{ color: '#f0dcc4' }} />
        </button>
      </div>

      <div ref={scrollRef} className="grow overflow-y-auto px-4 py-3">
        {messages.map((message) => (
          <div key={message.id} className={`mb-3 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className="max-w-[85%] rounded-xl px-3 py-2 text-sm leading-6"
              style={{
                background: message.role === 'user' ? `linear-gradient(135deg, ${accentColor}, #b07a52)` : 'rgba(255,247,238,0.12)',
                color: message.role === 'user' ? '#fff9ef' : '#ffe9d2',
                border: message.role === 'assistant' ? '1px solid rgba(255,238,220,0.18)' : 'none',
              }}
            >
              {message.content}
            </div>
          </div>
        ))}

        {typing && (
          <div className="mb-3 inline-flex rounded-xl px-3 py-2" style={{ background: 'rgba(255,247,238,0.12)', color: '#ffe9d2' }}>
            思考中...
          </div>
        )}
      </div>

      {messages.length <= 2 && (
        <div className="flex gap-2 overflow-x-auto px-4 pb-2" style={{ scrollbarWidth: 'none' }}>
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => send(prompt)}
              className="shrink-0 rounded-full px-3 py-1 text-xs"
              style={{ color: '#ffe7cf', background: 'rgba(255,241,223,0.12)', border: '1px solid rgba(255,241,223,0.24)' }}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 px-4 py-3" style={{ borderTop: '1px solid rgba(255,235,214,0.15)' }}>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && send()}
          placeholder="问我一个历史故事问题..."
          className="grow rounded-lg px-3 py-2 text-sm outline-none"
          style={{ background: 'rgba(255,247,238,0.12)', color: '#fff1de', border: '1px solid rgba(255,241,223,0.18)' }}
        />
        <button
          onClick={() => send()}
          className="rounded-lg px-3"
          style={{ background: `linear-gradient(135deg, ${accentColor}, #b07a52)`, color: '#fff8ef' }}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
