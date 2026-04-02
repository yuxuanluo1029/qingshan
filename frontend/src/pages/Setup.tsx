import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FadeIn, Stagger, HoverLift, fadeUp, motion } from '@/components/MotionPrimitives';
import { Button } from '@/components/ui/button';
import { cities, spiritTags, moods } from '@/data/mockData';
import { Compass, BookOpen, Sparkles, Landmark, Archive, Layers, Target, Wind, Eye } from 'lucide-react';

const interestIcons: Record<string, React.ReactNode> = {
  compass: <Compass className="h-5 w-5" />,
  book: <BookOpen className="h-5 w-5" />,
  sparkles: <Sparkles className="h-5 w-5" />,
  landmark: <Landmark className="h-5 w-5" />,
  archive: <Archive className="h-5 w-5" />,
  layers: <Layers className="h-5 w-5" />,
};

const moodIcons: Record<string, React.ReactNode> = {
  target: <Target className="h-5 w-5" />,
  eye: <Eye className="h-5 w-5" />,
  wind: <Wind className="h-5 w-5" />,
  compass: <Compass className="h-5 w-5" />,
};

const durations = [
  { id: 'half', label: '半日', desc: '3-4小时快速研学' },
  { id: 'full', label: '一日', desc: '6-8小时深度体验' },
  { id: 'two', label: '两日', desc: '完整路线系统学习' },
] as const;

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="h-px grow" style={{ background: 'linear-gradient(90deg, #D8C8B4, transparent)' }} />
      <h2 style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '22px', color: '#26454B', fontWeight: 700 }}>{children}</h2>
      <div className="h-px grow" style={{ background: 'linear-gradient(270deg, #D8C8B4, transparent)' }} />
    </div>
  );
}

export default function Setup() {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState('hangzhou');
  const [selectedDuration, setSelectedDuration] = useState<'half' | 'full' | 'two'>('half');
  const [selectedMood, setSelectedMood] = useState('focused');
  const [selectedSpirits, setSelectedSpirits] = useState<string[]>(['urban_context']);

  const toggleSpirit = (id: string) => {
    setSelectedSpirits((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) {
          return prev;
        }
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 2) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleStart = () => {
    const setupData = {
      city: selectedCity,
      duration: selectedDuration,
      mood: selectedMood,
      spirits: selectedSpirits,
    };

    sessionStorage.setItem('setupData', JSON.stringify(setupData));
    navigate('/chat');
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #F6F1E8 0%, #EEE6DB 100%)' }}>
      <div
        className="relative overflow-hidden px-6 pb-6 pt-12"
        style={{ background: 'linear-gradient(180deg, #13243D 0%, #244350 100%)' }}
      >
        <FadeIn>
          <p className="text-center tracking-widest" style={{ color: '#80D7CC', fontSize: '12px', fontFamily: "'Noto Serif SC', serif" }}>
            CHAPTER 01
          </p>
          <h1 className="mt-2 text-center" style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '32px', color: '#F6F1E8', fontWeight: 800 }}>
            研学参数设置
          </h1>
          <p className="mt-2 text-center text-xs opacity-70" style={{ color: '#F6F1E8' }}>
            选择城市、时长、兴趣方向与学习偏好
          </p>
        </FadeIn>
        <div className="absolute bottom-0 left-0 right-0 h-8" style={{ background: 'linear-gradient(180deg, transparent, #F6F1E8)' }} />
      </div>

      <div className="mx-auto max-w-lg px-6 py-8">
        <FadeIn>
          <SectionTitle>选择城市</SectionTitle>
          <Stagger className="grid grid-cols-2 gap-3" stagger={0.06}>
            {cities.map((city) => (
              <motion.div key={city.id} variants={fadeUp}>
                <HoverLift>
                  <button
                    onClick={() => setSelectedCity(city.id)}
                    className="w-full rounded-lg p-4 text-left transition-all duration-200"
                    style={{
                      background: selectedCity === city.id ? 'linear-gradient(135deg, #244350, #13243D)' : '#FFFFFF',
                      border: selectedCity === city.id ? '2px solid #80D7CC' : '2px solid #D8C8B4',
                      boxShadow: selectedCity === city.id ? '0 6px 24px rgba(36,67,80,0.25)' : '0 2px 8px rgba(0,0,0,0.05)',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Noto Serif SC', serif",
                        fontSize: '18px',
                        fontWeight: 700,
                        color: selectedCity === city.id ? '#F6F1E8' : '#2C2C2C',
                      }}
                    >
                      {city.name}
                    </span>
                    <p className="mt-1 text-xs" style={{ color: selectedCity === city.id ? 'rgba(246,241,232,0.72)' : '#6B6B6B' }}>
                      {city.desc}
                    </p>
                  </button>
                </HoverLift>
              </motion.div>
            ))}
          </Stagger>
        </FadeIn>

        <FadeIn className="mt-10">
          <SectionTitle>研学时长</SectionTitle>
          <div className="flex gap-3">
            {durations.map((duration) => (
              <button
                key={duration.id}
                onClick={() => setSelectedDuration(duration.id)}
                className="grow rounded-lg p-3 text-center transition-all duration-200"
                style={{
                  background: selectedDuration === duration.id ? '#244350' : '#FFFFFF',
                  border: selectedDuration === duration.id ? '2px solid #80D7CC' : '2px solid #D8C8B4',
                  color: selectedDuration === duration.id ? '#F6F1E8' : '#2C2C2C',
                }}
              >
                <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '16px', fontWeight: 600 }}>{duration.label}</span>
                <p className="mt-1 text-xs opacity-70">{duration.desc}</p>
              </button>
            ))}
          </div>
        </FadeIn>

        <FadeIn className="mt-10">
          <SectionTitle>学习偏好</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            {moods.map((mood) => (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                className="flex items-center gap-2 rounded-lg p-3 transition-all duration-200"
                style={{
                  background: selectedMood === mood.id ? 'linear-gradient(135deg, #B66A44, #D38A5C)' : '#FFFFFF',
                  border: selectedMood === mood.id ? '2px solid #B66A44' : '2px solid #D8C8B4',
                  color: selectedMood === mood.id ? '#FFF8EF' : '#2C2C2C',
                }}
              >
                {moodIcons[mood.emoji] ?? <Target className="h-5 w-5" />}
                <span style={{ fontFamily: "'Noto Serif SC', serif", fontWeight: 600 }}>{mood.label}</span>
              </button>
            ))}
          </div>
        </FadeIn>

        <FadeIn className="mt-10">
          <SectionTitle>文化主题标签</SectionTitle>
          <p className="mb-4 text-center text-xs" style={{ color: '#6B6B6B' }}>
            最多选择2个标签，用于生成个性化研学路线
          </p>
          <Stagger className="flex flex-col gap-3" stagger={0.08}>
            {spiritTags.map((tag) => (
              <motion.div key={tag.id} variants={fadeUp}>
                <button
                  onClick={() => toggleSpirit(tag.id)}
                  className="flex w-full items-center gap-4 rounded-xl p-4 transition-all duration-200"
                  style={{
                    background: selectedSpirits.includes(tag.id) ? `linear-gradient(135deg, ${tag.color}22, ${tag.color}10)` : '#FFFFFF',
                    border: selectedSpirits.includes(tag.id) ? `2px solid ${tag.color}` : '2px solid #D8C8B4',
                    boxShadow: selectedSpirits.includes(tag.id) ? `0 4px 16px ${tag.color}33` : '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: `${tag.color}22`, color: tag.color }}>
                    {interestIcons[tag.icon] ?? <Compass className="h-5 w-5" />}
                  </div>
                  <div className="text-left">
                    <span style={{ fontFamily: "'Noto Serif SC', serif", fontWeight: 700, color: selectedSpirits.includes(tag.id) ? tag.color : '#2C2C2C' }}>
                      {tag.label}
                    </span>
                    <p className="text-xs" style={{ color: '#6B6B6B' }}>
                      {tag.desc}
                    </p>
                  </div>
                  {selectedSpirits.includes(tag.id) && (
                    <div className="ml-auto h-3 w-3 rounded-full" style={{ background: tag.color, boxShadow: `0 0 8px ${tag.color}` }} />
                  )}
                </button>
              </motion.div>
            ))}
          </Stagger>
        </FadeIn>

        <FadeIn className="mt-12 pb-12">
          <Button
            onClick={handleStart}
            className="w-full rounded-xl py-6 text-lg font-bold tracking-widest transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, #B66A44, #D38A5C)',
              color: '#FFF8EF',
              fontFamily: "'Noto Serif SC', serif",
              boxShadow: '0 4px 24px rgba(182,106,68,0.36)',
              border: 'none',
            }}
          >
            生成研学方案
          </Button>
        </FadeIn>
      </div>
    </div>
  );
}
