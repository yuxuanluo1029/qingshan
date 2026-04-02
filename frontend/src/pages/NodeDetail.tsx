import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FadeIn, Stagger, fadeUp, motion } from '@/components/MotionPrimitives';
import { Button } from '@/components/ui/button';
import { cityPoints, tasks, characters } from '@/data/mockData';
import { Clock, Star, Camera, BookOpen, ArrowLeft, MessageCircle, MapPinned, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { TencentMap } from '@/components/TencentMap';
import { KnowledgeChat } from '@/components/KnowledgeChat';
import { useSetupData, useMatchedRoute } from '@/hooks/useSetupData';

function DifficultyStars({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className="h-3 w-3" style={{ color: index < level ? '#C4A35A' : '#D8C8B4', fill: index < level ? '#C4A35A' : 'none' }} />
      ))}
    </div>
  );
}

function InkDivider() {
  return (
    <div className="my-6 flex items-center gap-4">
      <div className="h-px grow" style={{ background: 'linear-gradient(90deg, transparent, #D8C8B4, transparent)' }} />
      <div className="h-1.5 w-1.5 rounded-full" style={{ background: '#2D5A5A' }} />
      <div className="h-px grow" style={{ background: 'linear-gradient(90deg, transparent, #D8C8B4, transparent)' }} />
    </div>
  );
}

export default function NodeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [taskAccepted, setTaskAccepted] = useState(false);
  const [taskDone, setTaskDone] = useState(false);

  const setup = useSetupData();
  const { routePoints } = useMatchedRoute(setup);
  const safeRoutePoints = routePoints.filter((item) => item && typeof item.id === 'string');

  const point = cityPoints.find((item) => item.id === id) || safeRoutePoints[0] || cityPoints[0];
  if (!point) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center" style={{ background: '#F6F1E8' }}>
        <div className="rounded-xl p-5" style={{ background: '#FFFFFF', border: '1px solid #D8C8B4' }}>
          <p style={{ color: '#2C2C2C', fontFamily: "'Noto Serif SC', serif" }}>未找到可展示的研学节点，请返回路线页重新选择。</p>
          <Button className="mt-4" onClick={() => navigate('/route')} style={{ background: '#244350', color: '#F6F1E8', border: 'none' }}>
            返回路线页
          </Button>
        </div>
      </div>
    );
  }
  const task = tasks.find((item) => item.pointId === point.id);
  const mentor = characters.find((char) => point.spiritTags.some((tag) => char.spirit.includes(tag)));

  const indexInRoute = safeRoutePoints.findIndex((item) => item.id === point.id);
  const displayIndex = indexInRoute >= 0 ? indexInRoute : 0;
  const nextPoint = indexInRoute >= 0 && indexInRoute < safeRoutePoints.length - 1 ? safeRoutePoints[indexInRoute + 1] : null;
  const isLastInRoute = indexInRoute === safeRoutePoints.length - 1;

  const handleComplete = () => {
    setTaskDone(true);
    toast('任务已完成', { description: task?.bondEffect });
  };

  return (
    <div className="min-h-screen pb-20" style={{ background: '#F6F1E8' }}>
      <div className="relative overflow-hidden px-6 pb-8 pt-12" style={{ background: `linear-gradient(180deg, #13243D 0%, ${mentor?.color || '#244350'}44 100%)` }}>
        <button onClick={() => navigate(-1)} className="absolute left-4 top-4 flex items-center gap-1 text-xs" style={{ color: 'rgba(246,241,232,0.72)' }}>
          <ArrowLeft className="h-4 w-4" />
          返回
        </button>
        <FadeIn>
          <span className="block text-center text-xs tracking-[0.18em]" style={{ color: '#80D7CC' }}>
            NODE {displayIndex + 1}
          </span>
          <h1 className="mt-3 text-center" style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '32px', color: '#F6F1E8', fontWeight: 900 }}>
            {point.name}
          </h1>
          <div className="mt-3 flex items-center justify-center gap-3">
            <span className="rounded-full px-2 py-0.5 text-xs" style={{ background: 'rgba(246,241,232,0.15)', color: '#F6F1E8' }}>
              {point.type}
            </span>
            <span className="flex items-center gap-1 text-xs" style={{ color: 'rgba(246,241,232,0.68)' }}>
              <Clock className="h-3 w-3" />
              {point.duration} 分钟
            </span>
          </div>
        </FadeIn>
      </div>

      <div className="mx-auto max-w-lg px-6 py-6">
        <Stagger stagger={0.1}>
          <motion.div variants={fadeUp}>
            <div className="mb-3 flex items-center gap-2">
              <MapPinned className="h-4 w-4" style={{ color: '#2D5A5A' }} />
              <h2 style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '18px', color: '#2D5A5A', fontWeight: 700 }}>地图定位</h2>
            </div>
            <TencentMap
              center={{ lat: point.lat, lng: point.lng }}
              markers={[{ position: { lat: point.lat, lng: point.lng }, title: point.name, id: point.id }]}
              zoom={15}
              height="200px"
            />
          </motion.div>

          <motion.div variants={fadeUp}>
            <InkDivider />
            <div className="mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4" style={{ color: '#2D5A5A' }} />
              <h2 style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '18px', color: '#2D5A5A', fontWeight: 700 }}>历史文化简介</h2>
            </div>
            <div className="rounded-xl p-5" style={{ background: '#FFFFFF', border: '1px solid #D8C8B4', boxShadow: '0 2px 12px rgba(36,67,80,0.08)' }}>
              <p className="text-sm leading-relaxed" style={{ color: '#2C2C2C' }}>
                {point.desc}
              </p>
              <p className="mt-3 text-sm italic leading-relaxed" style={{ color: '#6B6B6B', fontFamily: "'Noto Serif SC', serif" }}>
                “{point.storySeed}”
              </p>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <InkDivider />
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4" style={{ color: '#244350' }} />
              <h2 style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '18px', color: '#244350', fontWeight: 700 }}>知识亮点</h2>
            </div>
            <div className="rounded-xl p-4" style={{ background: '#FFFFFF', border: '1px solid #D8C8B4' }}>
              <ul className="space-y-2">
                {point.knowledgeHighlights.map((highlight) => (
                  <li key={highlight} className="text-sm leading-relaxed" style={{ color: '#4A4A4A' }}>
                    · {highlight}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {task && (
            <motion.div variants={fadeUp}>
              <InkDivider />
              <div className="mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4" style={{ color: '#B66A44' }} />
                <h2 style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '18px', color: '#B66A44', fontWeight: 700 }}>现场研学任务</h2>
              </div>
              <div className="rounded-xl p-5" style={{ background: 'linear-gradient(135deg, #B66A4410, #D38A5C10)', border: '1px solid #B66A4444' }}>
                <div className="flex items-center justify-between">
                  <h3 style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '16px', fontWeight: 700, color: '#B66A44' }}>{task.title}</h3>
                  <DifficultyStars level={task.difficulty} />
                </div>
                <div className="mt-2 flex gap-2">
                  <span className="rounded-full px-2 py-0.5 text-xs" style={{ background: '#B66A4422', color: '#B66A44' }}>
                    {task.type}
                  </span>
                </div>
                <p className="mt-3 text-sm" style={{ color: '#6B6B6B' }}>
                  触发条件：{task.triggerCondition}
                </p>

                <div className="mt-3 rounded-lg p-3" style={{ background: 'rgba(128,215,204,0.08)', border: '1px solid rgba(128,215,204,0.2)' }}>
                  <p className="text-xs" style={{ color: '#2D5A5A' }}>
                    <MessageCircle className="mr-1 inline h-3 w-3" />
                    可以点击右下角向 AI 导师提问，补充背景知识后再完成任务。
                  </p>
                </div>

                {!taskAccepted ? (
                  <div className="mt-4 flex gap-3">
                    <Button onClick={() => setTaskAccepted(true)} className="grow rounded-lg py-2" style={{ background: '#B66A44', color: '#FFF8EF', border: 'none' }}>
                      接受任务
                    </Button>
                    <Button variant="outline" onClick={() => setTaskDone(true)} className="rounded-lg py-2" style={{ borderColor: '#D8C8B4' }}>
                      略过
                    </Button>
                  </div>
                ) : !taskDone ? (
                  <div className="mt-4">
                    <p className="mb-3 text-sm" style={{ color: '#789B73' }}>
                      任务进行中…
                    </p>
                    <Button onClick={handleComplete} className="w-full rounded-lg py-2" style={{ background: '#789B73', color: '#F6F1E8', border: 'none' }}>
                      标记完成
                    </Button>
                  </div>
                ) : (
                  <div className="mt-4 rounded-lg p-3" style={{ background: '#789B7322' }}>
                    <p className="text-sm font-bold" style={{ color: '#789B73' }}>
                      {task.successResult}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {mentor && (
            <motion.div variants={fadeUp}>
              <InkDivider />
              <div className="mb-3 flex items-center gap-2">
                <MessageCircle className="h-4 w-4" style={{ color: mentor.color }} />
                <h2 style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '18px', color: mentor.color, fontWeight: 700 }}>导师提示</h2>
              </div>
              <div className="flex gap-3 rounded-xl p-4" style={{ background: `${mentor.color}11`, border: `1px solid ${mentor.color}33` }}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: mentor.color }}>
                  <span style={{ color: '#F6F1E8', fontFamily: "'Noto Serif SC', serif", fontWeight: 700, fontSize: '14px' }}>{mentor.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: mentor.color, fontFamily: "'Noto Serif SC', serif" }}>
                    {mentor.name}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed" style={{ color: '#2C2C2C' }}>
                    {mentor.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div variants={fadeUp}>
            <InkDivider />
            <div className="mb-3 flex items-center gap-2">
              <Camera className="h-4 w-4" style={{ color: '#C4A35A' }} />
              <h2 style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '18px', color: '#C4A35A', fontWeight: 700 }}>拍照记录建议</h2>
            </div>
            <div className="rounded-xl p-4" style={{ background: '#C4A35A11', border: '1px solid #C4A35A33' }}>
              <p className="text-sm" style={{ color: '#6B6B6B' }}>
                {point.photoHint}
              </p>
            </div>
          </motion.div>
        </Stagger>

        <FadeIn className="mt-8">
          <Button
            onClick={() => (nextPoint ? navigate(`/node/${nextPoint.id}`) : navigate('/bond'))}
            className="w-full rounded-xl py-5 text-base font-bold tracking-widest transition-all hover:scale-[1.02]"
            style={{
              background: !isLastInRoute ? 'linear-gradient(135deg, #244350, #13243D)' : 'linear-gradient(135deg, #C4A35A, #B66A44)',
              color: '#F6F1E8',
              fontFamily: "'Noto Serif SC', serif",
              boxShadow: '0 4px 20px rgba(36,67,80,0.32)',
              border: 'none',
            }}
          >
            {!isLastInRoute ? '前往下一个节点' : '查看学习画像'}
          </Button>
        </FadeIn>
      </div>

      <KnowledgeChat pointName={point.name} city={point.city} characterName={mentor?.name || '城迹导师'} characterColor={mentor?.color || '#2D5A5A'} />
    </div>
  );
}
