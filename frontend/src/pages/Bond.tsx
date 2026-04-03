import { useNavigate } from 'react-router-dom';
import { FadeIn, Stagger, HoverLift, fadeUp, motion } from '@/components/MotionPrimitives';
import { Button } from '@/components/ui/button';
import { characters, bonds } from '@/data/mockData';
import { Heart, BookOpen, Shield, Link2, Sparkles } from 'lucide-react';

const bondIcons: Record<string, React.ReactNode> = {
  同道: <Link2 className="h-4 w-4" />,
  师友: <BookOpen className="h-4 w-4" />,
  文脉: <Sparkles className="h-4 w-4" />,
  守望: <Shield className="h-4 w-4" />,
  匠心: <Heart className="h-4 w-4" />,
};

function BondLevel({ level, color }: { level: number; color: string }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-1.5 w-6 rounded-full" style={{ background: index < level ? color : '#D8C8B4' }} />
      ))}
    </div>
  );
}

function CharacterCard({ char }: { char: (typeof characters)[0] }) {
  const charBonds = bonds.filter((bond) => bond.char1 === char.id || bond.char2 === char.id);
  const maxLevel = Math.max(...charBonds.map((bond) => bond.level), 0);

  return (
    <div className="rounded-xl p-4" style={{ background: '#FFFFFF', border: '1px solid #D8C8B4', boxShadow: '0 2px 12px rgba(36,67,80,0.06)' }}>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: `${char.color}22`, border: `2px solid ${char.color}` }}>
          <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '18px', fontWeight: 800, color: char.color }}>{char.name.charAt(0)}</span>
        </div>
        <div className="grow">
          <p style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '16px', fontWeight: 700, color: '#1C1C1C' }}>{char.name}</p>
          <p className="text-xs" style={{ color: char.color }}>
            {char.title}
          </p>
        </div>
      </div>
      <div className="mt-3">
        <BondLevel level={maxLevel} color={char.color} />
        <p className="mt-2 text-xs leading-relaxed" style={{ color: '#6B6B6B' }}>
          {char.spirit} · {char.personality}
        </p>
      </div>
    </div>
  );
}

function BondCard({ bond }: { bond: (typeof bonds)[0] }) {
  const char1 = characters.find((char) => char.id === bond.char1);
  const char2 = characters.find((char) => char.id === bond.char2);

  if (!char1 || !char2) {
    return null;
  }

  return (
    <div className="rounded-xl p-5" style={{ background: '#FFFFFF', border: '1px solid #D8C8B4', boxShadow: '0 2px 12px rgba(36,67,80,0.06)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: char1.color, boxShadow: `0 0 8px ${char1.color}44` }}>
            <span className="text-xs font-bold" style={{ color: '#F6F1E8' }}>
              {char1.name.charAt(0)}
            </span>
          </div>
          <div className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: '#F6F1E8', border: '1px solid #D8C8B4' }}>
            {bondIcons[bond.type]}
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: char2.color, boxShadow: `0 0 8px ${char2.color}44` }}>
            <span className="text-xs font-bold" style={{ color: '#F6F1E8' }}>
              {char2.name.charAt(0)}
            </span>
          </div>
        </div>
        <span className="rounded-full px-2 py-0.5 text-xs" style={{ background: '#24435022', color: '#244350' }}>
          {bond.type}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs" style={{ color: '#6B6B6B' }}>
          {char1.name} & {char2.name}
        </span>
        <BondLevel level={bond.level} color="#B66A44" />
      </div>

      <p className="mt-3 text-sm" style={{ color: '#6B6B6B' }}>
        {bond.desc}
      </p>

      <div className="mt-3 rounded-lg p-3" style={{ background: 'rgba(36,67,80,0.05)', borderLeft: '3px solid #244350' }}>
        <p className="text-sm italic leading-relaxed" style={{ color: '#2C2C2C', fontFamily: "'Noto Serif SC', serif" }}>
          {bond.dialogue}
        </p>
      </div>
    </div>
  );
}

export default function Bond() {
  const navigate = useNavigate();
  const safeCharacters = characters.filter((char) => char && typeof char.id === 'string');
  const safeBonds = bonds.filter((bond) => bond && typeof bond.id === 'string');

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #F6F1E8, #EEE6DB)' }}>
      <div className="relative overflow-hidden px-6 pb-8 pt-12" style={{ background: 'linear-gradient(180deg, #13243D 0%, #244350 100%)' }}>
        <FadeIn>
          <p className="text-center text-xs tracking-widest" style={{ color: '#80D7CC', fontFamily: "'Noto Serif SC', serif" }}>
            LEARNING GRAPH
          </p>
          <h1
            className="mt-3 text-center"
            style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '36px', color: '#F6F1E8', fontWeight: 900, textShadow: '0 0 30px rgba(128,215,204,0.2)' }}
          >
            学习画像
          </h1>
          <p className="mt-2 text-center text-sm" style={{ color: 'rgba(246,241,232,0.6)' }}>
            导师协同图谱与知识侧重点
          </p>
        </FadeIn>
      </div>

      <div className="mx-auto max-w-lg px-6 py-8">
        <FadeIn>
          <h2 className="mb-4" style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '20px', color: '#2D5A5A', fontWeight: 700 }}>
            导师团队
          </h2>
        </FadeIn>
        <Stagger className="grid grid-cols-2 gap-3" stagger={0.08}>
          {safeCharacters.map((char) => (
            <motion.div key={char.id} variants={fadeUp}>
              <HoverLift>
                <CharacterCard char={char} />
              </HoverLift>
            </motion.div>
          ))}
        </Stagger>

        <FadeIn className="mt-10">
          <h2 className="mb-4" style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '20px', color: '#2D5A5A', fontWeight: 700 }}>
            协同关系
          </h2>
        </FadeIn>
        <Stagger className="flex flex-col gap-4" stagger={0.1}>
          {safeBonds.map((bond) => (
            <motion.div key={bond.id} variants={fadeUp}>
              <HoverLift>
                <BondCard bond={bond} />
              </HoverLift>
            </motion.div>
          ))}
        </Stagger>

        <FadeIn className="mt-10 pb-12">
          <Button
            onClick={() => navigate('/guide/report')}
            className="w-full rounded-xl py-6 text-lg font-bold tracking-widest transition-all hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, #C4A35A, #B66A44)',
              color: '#F6F1E8',
              fontFamily: "'Noto Serif SC', serif",
              boxShadow: '0 4px 24px rgba(196,163,90,0.36)',
              border: 'none',
            }}
          >
            查看研学报告
          </Button>
        </FadeIn>
      </div>
    </div>
  );
}
