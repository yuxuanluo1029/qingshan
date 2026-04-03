import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FadeIn, Stagger, fadeUp, motion } from '@/components/MotionPrimitives';
import { Button } from '@/components/ui/button';
import { sampleReports } from '@/data/mockData';
import { Share2, RotateCcw, Trophy, Sparkles, ScrollText, Tag, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSetupData, useMatchedRoute } from '@/hooks/useSetupData';

function GlowTag({ text, color }: { text: string; color: string }) {
  return (
    <span
      className="inline-block rounded-full px-3 py-1.5 text-xs font-bold"
      style={{ background: `${color}22`, color, border: `1px solid ${color}44`, boxShadow: `0 0 12px ${color}22` }}
    >
      {text}
    </span>
  );
}

function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl p-5 ${className}`} style={{ background: 'rgba(246,241,232,0.07)', border: '1px solid rgba(216,200,180,0.15)', backdropFilter: 'blur(8px)' }}>
      {children}
    </div>
  );
}

function ScrollDecor() {
  return (
    <svg className="mx-auto mb-4 opacity-30" width="200" height="20" viewBox="0 0 200 20" fill="none">
      <line x1="0" y1="10" x2="80" y2="10" stroke="#D8C8B4" strokeWidth="1" strokeDasharray="4 4" />
      <circle cx="100" cy="10" r="3" fill="#C4A35A" />
      <line x1="120" y1="10" x2="200" y2="10" stroke="#D8C8B4" strokeWidth="1" strokeDasharray="4 4" />
    </svg>
  );
}

export default function Report() {
  const navigate = useNavigate();
  const setup = useSetupData();
  const { cityName, matchedRoute } = useMatchedRoute(setup);

  const report = useMemo(() => {
    const cityReports = sampleReports.filter((item) => item.cityId === setup.city);
    if (cityReports.length === 0) {
      return sampleReports[0];
    }

    const exact = cityReports.find((item) => item.spiritFocus === matchedRoute.spiritFocus);
    return exact ?? cityReports[0];
  }, [setup.city, matchedRoute.spiritFocus]);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0E1A2B 0%, #13243D 40%, #12203A 70%, #0E1A2B 100%)' }}>
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-15%] top-[25%] h-[350px] w-[350px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(182,106,68,0.12), transparent 70%)' }} />
        <div className="absolute right-[-10%] top-[55%] h-[300px] w-[300px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(128,215,204,0.10), transparent 70%)' }} />
        <div className="absolute bottom-[10%] left-[20%] h-[250px] w-[250px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(196,163,90,0.12), transparent 70%)' }} />
      </div>

      <div className="relative z-10 mx-auto max-w-lg px-6 py-12">
        <FadeIn>
          <ScrollDecor />
          <p className="text-center text-xs tracking-[0.35em]" style={{ color: '#80D7CC', fontFamily: "'Noto Serif SC', serif" }}>
            STUDY REPORT · {cityName}
          </p>
          <h1
            className="mt-4 text-center"
            style={{
              fontFamily: "'ZCOOL XiaoWei', 'Noto Serif SC', serif",
              fontSize: '40px',
              color: '#F6F1E8',
              fontWeight: 900,
              textShadow: '0 0 40px rgba(182,106,68,0.35), 0 0 80px rgba(36,67,80,0.2)',
            }}
          >
            研学报告
          </h1>
          <div className="mx-auto mt-3 h-px w-24" style={{ background: 'linear-gradient(90deg, transparent, #C4A35A, transparent)' }} />
        </FadeIn>

        <FadeIn delay={0.3} className="mt-8">
          <SectionCard>
            <div className="mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4" style={{ color: '#C4A35A' }} />
              <span className="text-xs tracking-widest" style={{ color: '#C4A35A', fontFamily: "'Noto Serif SC', serif" }}>
                报告标题
              </span>
            </div>
            <h2 style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '24px', color: '#F6F1E8', fontWeight: 800 }}>{report.title}</h2>
          </SectionCard>
        </FadeIn>

        <FadeIn delay={0.5} className="mt-4">
          <SectionCard>
            <div className="mb-3 flex items-center gap-2">
              <ScrollText className="h-4 w-4" style={{ color: '#789B73' }} />
              <span className="text-xs tracking-widest" style={{ color: '#789B73', fontFamily: "'Noto Serif SC', serif" }}>
                学习收获
              </span>
            </div>
            <p className="text-sm leading-[1.9]" style={{ color: 'rgba(246,241,232,0.8)', fontFamily: "'Noto Serif SC', serif" }}>
              {report.summary}
            </p>
          </SectionCard>
        </FadeIn>

        <FadeIn delay={0.7} className="mt-4">
          <SectionCard>
            <div className="mb-3 flex items-center gap-2">
              <Tag className="h-4 w-4" style={{ color: '#4FC3F7' }} />
              <span className="text-xs tracking-widest" style={{ color: '#4FC3F7', fontFamily: "'Noto Serif SC', serif" }}>
                关键词
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {report.keywords.map((keyword, index) => (
                <GlowTag key={keyword} text={keyword} color={['#80D7CC', '#B66A44', '#4FC3F7', '#C4A35A'][index % 4]} />
              ))}
            </div>
          </SectionCard>
        </FadeIn>

        <FadeIn delay={0.9} className="mt-4">
          <SectionCard>
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4" style={{ color: '#B66A44' }} />
              <span className="text-xs tracking-widest" style={{ color: '#B66A44', fontFamily: "'Noto Serif SC', serif" }}>
                关键亮点
              </span>
            </div>
            <Stagger className="flex flex-col gap-4" stagger={0.12}>
              {report.highlights.map((highlight, index) => (
                <motion.div key={highlight} variants={fadeUp} className="flex items-start gap-3">
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                    style={{ background: `${['#B66A44', '#80D7CC', '#C4A35A'][index % 3]}22`, border: `1px solid ${['#B66A44', '#80D7CC', '#C4A35A'][index % 3]}44` }}
                  >
                    <span className="text-xs font-bold" style={{ color: ['#B66A44', '#80D7CC', '#C4A35A'][index % 3] }}>
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(246,241,232,0.75)', fontFamily: "'Noto Serif SC', serif" }}>
                    {highlight}
                  </p>
                </motion.div>
              ))}
            </Stagger>
          </SectionCard>
        </FadeIn>

        <FadeIn delay={1.1} className="mt-4">
          <SectionCard>
            <p className="mb-2 text-xs tracking-widest" style={{ color: '#C4A35A', fontFamily: "'Noto Serif SC', serif" }}>
              学习画像判定
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(246,241,232,0.75)' }}>
              {report.bondResult}
            </p>
          </SectionCard>
        </FadeIn>

        <FadeIn delay={1.3} className="mt-8">
          <div
            className="relative overflow-hidden rounded-2xl p-8"
            style={{
              background: 'linear-gradient(135deg, rgba(182,106,68,0.2), rgba(196,163,90,0.08))',
              border: '2px solid rgba(182,106,68,0.3)',
              boxShadow: '0 8px 40px rgba(182,106,68,0.2), 0 0 80px rgba(182,106,68,0.08)',
            }}
          >
            <div className="pointer-events-none absolute right-[-30px] top-[-30px] h-[120px] w-[120px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(182,106,68,0.2), transparent)' }} />
            <p className="text-center text-xs tracking-[0.4em]" style={{ color: '#C4A35A', fontFamily: "'Noto Serif SC', serif" }}>
              城市文化探索画像
            </p>
            <h3
              className="mt-4 text-center"
              style={{
                fontFamily: "'ZCOOL XiaoWei', 'Noto Serif SC', serif",
                fontSize: '32px',
                color: '#F6F1E8',
                fontWeight: 900,
                textShadow: '0 0 24px rgba(182,106,68,0.4), 0 0 60px rgba(182,106,68,0.15)',
              }}
            >
              {report.finalTitle}
            </h3>
            <div className="mx-auto mb-5 mt-3 h-px w-16" style={{ background: 'linear-gradient(90deg, transparent, #B66A44, transparent)' }} />
            <p className="text-center text-sm leading-[2]" style={{ color: 'rgba(246,241,232,0.68)', fontFamily: "'Noto Serif SC', serif" }}>
              {report.personality}
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={1.55} className="mt-4">
          <SectionCard>
            <div className="mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" style={{ color: '#80D7CC' }} />
              <span className="text-xs tracking-widest" style={{ color: '#80D7CC', fontFamily: "'Noto Serif SC', serif" }}>
                推荐下一步
              </span>
            </div>
            <div className="space-y-2">
              {report.nextSteps.map((step) => (
                <p key={step} className="text-sm" style={{ color: 'rgba(246,241,232,0.75)' }}>
                  · {step}
                </p>
              ))}
            </div>
          </SectionCard>
        </FadeIn>

        <FadeIn delay={1.75} className="mt-6">
          <div className="relative rounded-2xl p-10 text-center" style={{ background: 'linear-gradient(180deg, rgba(19,36,61,0.9), rgba(14,26,43,0.95))', border: '2px solid #D8C8B4', boxShadow: '0 0 40px rgba(216,200,180,0.1)' }}>
            <div className="absolute left-6 top-4 opacity-15" style={{ fontFamily: "'ZCOOL XiaoWei', serif", fontSize: '60px', color: '#D8C8B4', lineHeight: 1 }}>
              “
            </div>
            <div className="absolute bottom-4 right-6 opacity-15" style={{ fontFamily: "'ZCOOL XiaoWei', serif", fontSize: '60px', color: '#D8C8B4', lineHeight: 1 }}>
              ”
            </div>
            <p className="relative z-10 leading-[1.8]" style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '20px', color: '#F6F1E8', fontWeight: 700 }}>
              {report.posterCopy}
            </p>
            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="h-px w-8" style={{ background: '#C4A35A' }} />
              <span className="text-xs tracking-widest" style={{ color: '#C4A35A', fontFamily: "'Noto Serif SC', serif" }}>
                城迹 · {cityName}研学结项
              </span>
              <div className="h-px w-8" style={{ background: '#C4A35A' }} />
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={1.9} className="mt-10 flex gap-3 pb-12">
          <Button
            onClick={() => {
              toast('分享功能已预留', { description: '可接入图片导出或海报生成服务。' });
            }}
            className="grow rounded-xl py-5 font-bold tracking-widest transition-all hover:scale-[1.01]"
            style={{ background: 'rgba(246,241,232,0.08)', color: '#F6F1E8', border: '1px solid rgba(246,241,232,0.16)', fontFamily: "'Noto Serif SC', serif" }}
          >
            <Share2 className="mr-2 h-4 w-4" />
            分享报告
          </Button>
          <Button
            onClick={() => navigate('/home')}
            className="grow rounded-xl py-5 font-bold tracking-widest transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #B66A44, #D38A5C)', color: '#FFF8EF', border: 'none', boxShadow: '0 4px 24px rgba(182,106,68,0.45)', fontFamily: "'Noto Serif SC', serif" }}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            重新开始
          </Button>
        </FadeIn>
      </div>
    </div>
  );
}
