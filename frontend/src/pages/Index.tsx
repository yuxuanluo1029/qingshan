import { useNavigate } from 'react-router-dom';
import { FadeIn, Stagger, fadeUp, motion } from '@/components/MotionPrimitives';
import { Button } from '@/components/ui/button';
import { characters } from '@/data/mockData';

function InkBackdrop() {
  return (
    <svg
      className="pointer-events-none absolute bottom-0 left-0 w-full opacity-25"
      viewBox="0 0 1440 420"
      fill="none"
      preserveAspectRatio="none"
      style={{ height: '48%' }}
    >
      <path
        d="M0 420 L0 290 Q120 190 240 250 Q360 180 480 240 Q600 160 720 220 Q840 140 960 200 Q1080 130 1200 180 Q1320 150 1440 190 L1440 420 Z"
        fill="url(#ink1)"
      />
      <path
        d="M0 420 L0 340 Q180 270 360 320 Q540 250 720 300 Q900 240 1080 290 Q1260 260 1440 300 L1440 420 Z"
        fill="url(#ink2)"
      />
      <defs>
        <linearGradient id="ink1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#214046" stopOpacity="0.48" />
          <stop offset="100%" stopColor="#214046" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="ink2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8E5A3A" stopOpacity="0.30" />
          <stop offset="100%" stopColor="#8E5A3A" stopOpacity="0.06" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function MentorRow() {
  const mentorList = characters.filter((mentor) => mentor && typeof mentor.id === 'string');

  return (
    <Stagger className="flex justify-center gap-4 md:gap-7" stagger={0.1}>
      {mentorList.map((mentor) => (
        <motion.div key={mentor.id} variants={fadeUp} className="group flex flex-col items-center gap-2">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 md:h-16 md:w-16"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${mentor.color}33, rgba(13, 24, 39, 0.8))`,
              border: `1px solid ${mentor.color}AA`,
              boxShadow: `0 0 22px ${mentor.color}33`,
            }}
          >
            <span style={{ color: mentor.color, fontSize: '22px', fontWeight: 800, fontFamily: "'Noto Serif SC', serif" }}>
              {mentor.name.charAt(0)}
            </span>
          </div>
          <span className="text-xs opacity-70" style={{ color: '#EEE7DA', fontFamily: "'Noto Serif SC', serif" }}>
            {mentor.name}
          </span>
        </motion.div>
      ))}
    </Stagger>
  );
}

export default function Index() {
  const navigate = useNavigate();

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background:
          'radial-gradient(circle at 12% 18%, rgba(45,90,90,0.35), transparent 45%), radial-gradient(circle at 88% 10%, rgba(196,163,90,0.25), transparent 42%), linear-gradient(180deg, #0C1627 0%, #12203B 35%, #1B2946 65%, #202A35 100%)',
      }}
    >
      <InkBackdrop />

      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-[-10%] top-[20%] h-[320px] w-[320px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(79,195,247,0.12), transparent 72%)' }}
        />
        <div
          className="absolute right-[-8%] top-[38%] h-[360px] w-[360px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(196,163,90,0.16), transparent 72%)' }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
        <FadeIn delay={0.1}>
          <p
            className="mb-3 tracking-[0.35em]"
            style={{ color: '#7BD2C8', fontFamily: "'Noto Serif SC', serif", fontSize: '12px' }}
          >
            AI EDUCATION + CULTURE
          </p>
        </FadeIn>

        <FadeIn delay={0.25}>
          <h1
            className="mb-4"
            style={{
              fontFamily: "'ZCOOL XiaoWei', 'Noto Serif SC', serif",
              fontSize: 'clamp(54px, 13vw, 84px)',
              color: '#F7F1E7',
              letterSpacing: '0.08em',
              fontWeight: 900,
              textShadow: '0 0 50px rgba(123,210,200,0.22), 0 2px 8px rgba(0,0,0,0.5)',
              lineHeight: 1.08,
            }}
          >
            城迹
          </h1>
        </FadeIn>

        <FadeIn delay={0.45}>
          <p
            className="mb-2"
            style={{ color: '#E4D7C0', fontFamily: "'Noto Serif SC', serif", fontSize: '16px', letterSpacing: '0.18em' }}
          >
            城市历史文化研学智能体
          </p>
        </FadeIn>

        <FadeIn delay={0.6}>
          <p
            className="mb-7 max-w-2xl leading-8"
            style={{ color: 'rgba(247,241,231,0.72)', fontSize: '14px' }}
          >
            面向人工智能实践赛“智能教育与文化”方向，聚焦“历史 + 文化 + 城市”。
            通过 AI 导师对话、腾讯地图点位导航、现场观察任务与学习反馈报告，
            把一次城市出行转化为可复盘、可讲解、可展示的研学过程。
          </p>
        </FadeIn>

        <FadeIn delay={0.78}>
          <div className="mb-8 flex flex-wrap justify-center gap-3 text-xs">
            {['应用场景：城市研学', '技术亮点：AI + 腾讯地图', '交付形态：路线 + 报告 + 演示'].map((item) => (
              <span
                key={item}
                className="rounded-full px-3 py-1.5"
                style={{ background: 'rgba(247,241,231,0.08)', border: '1px solid rgba(247,241,231,0.2)', color: '#F7F1E7' }}
              >
                {item}
              </span>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={1.0}>
          <Button
            onClick={() => navigate('/setup')}
            className="group relative overflow-hidden rounded-full px-12 py-6 text-lg font-bold tracking-[0.25em] transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #B66A44 0%, #D38A5C 100%)',
              color: '#FFF7EB',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 28px rgba(182,106,68,0.42)',
              fontFamily: "'Noto Serif SC', serif",
            }}
          >
            <span className="relative z-10">开始研学</span>
            <div
              className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: 'linear-gradient(135deg, #D38A5C 0%, #B66A44 100%)' }}
            />
          </Button>
        </FadeIn>

        <FadeIn delay={1.2} className="mt-16">
          <p className="mb-4 text-xs tracking-[0.25em]" style={{ color: 'rgba(247,241,231,0.45)' }}>
            历史文化导师团
          </p>
          <MentorRow />
        </FadeIn>
      </div>
    </div>
  );
}
