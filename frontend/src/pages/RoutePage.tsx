import { Link, useNavigate } from 'react-router-dom';
import { FadeIn, Stagger, HoverLift, fadeUp, motion } from '@/components/MotionPrimitives';
import { Button } from '@/components/ui/button';
import { characters, tasks, cities } from '@/data/mockData';
import { Clock, ChevronRight, Map, BookOpen } from 'lucide-react';
import { TencentMap } from '@/components/TencentMap';
import { useSetupData, useMatchedRoute } from '@/hooks/useSetupData';

export default function RoutePage() {
  const navigate = useNavigate();
  const setup = useSetupData();
  const { matchedRoute, routePoints, cityName, spiritLabels } = useMatchedRoute(setup);
  const safeRoutePoints = routePoints.filter((point) => point && typeof point.id === 'string');

  const city = cities.find((item) => item.id === setup.city);

  const center =
    safeRoutePoints.length > 0
      ? {
          lat: safeRoutePoints.reduce((sum, point) => sum + point.lat, 0) / safeRoutePoints.length,
          lng: safeRoutePoints.reduce((sum, point) => sum + point.lng, 0) / safeRoutePoints.length,
        }
      : {
          lat: city?.lat ?? 30.2741,
          lng: city?.lng ?? 120.1551,
        };

  const markers = safeRoutePoints.map((point, index) => ({
    position: { lat: point.lat, lng: point.lng },
    title: `${index + 1}. ${point.name}`,
    id: point.id,
  }));

  const totalDuration = safeRoutePoints.reduce((sum, point) => sum + point.duration, 0);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #F6F1E8, #EEE6DB)' }}>
      <div
        className="relative overflow-hidden px-6 pb-8 pt-12"
        style={{ background: `linear-gradient(180deg, #13243D 0%, ${matchedRoute.color}44 100%)` }}
      >
        <div className="absolute inset-0 opacity-15" style={{ background: 'radial-gradient(circle at 82% 20%, #80D7CC, transparent 48%)' }} />
        <FadeIn>
          <p className="text-center text-xs tracking-widest" style={{ color: '#80D7CC', fontFamily: "'Noto Serif SC', serif" }}>
            CITY STUDY ROUTE · {cityName}
          </p>
          <h1
            className="mt-3 text-center"
            style={{
              fontFamily: "'Noto Serif SC', serif",
              fontSize: '35px',
              color: '#F6F1E8',
              fontWeight: 900,
              textShadow: `0 0 26px ${matchedRoute.color}66`,
            }}
          >
            {matchedRoute.name}
          </h1>
          <p className="mt-2 text-center" style={{ color: 'rgba(246,241,232,0.68)', fontFamily: "'Noto Serif SC', serif", fontSize: '14px' }}>
            {matchedRoute.subtitle}
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <span
              className="rounded-full px-3 py-1 text-xs"
              style={{ background: `${matchedRoute.color}33`, color: matchedRoute.color, border: `1px solid ${matchedRoute.color}66` }}
            >
              {matchedRoute.spiritFocus}
            </span>
            <span className="text-xs" style={{ color: 'rgba(246,241,232,0.55)' }}>
              {safeRoutePoints.length} 个节点
            </span>
            <span className="text-xs" style={{ color: 'rgba(246,241,232,0.55)' }}>
              约 {totalDuration} 分钟
            </span>
          </div>
          {spiritLabels.length > 1 && (
            <div className="mt-3 flex items-center justify-center gap-2">
              {spiritLabels.map((label) => (
                <span
                  key={label}
                  className="rounded-full px-2 py-0.5 text-xs"
                  style={{ background: 'rgba(246,241,232,0.12)', color: 'rgba(246,241,232,0.65)' }}
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </FadeIn>
      </div>

      <div className="mx-auto max-w-lg px-6 py-8">
        <FadeIn>
          <p className="mb-3 text-sm leading-relaxed" style={{ color: '#6B6B6B' }}>
            {matchedRoute.desc}
          </p>
          <div className="mb-6 rounded-xl p-4" style={{ background: '#FFFFFF', border: '1px solid #D8C8B4' }}>
            <p className="text-xs tracking-widest" style={{ color: '#2D5A5A', fontFamily: "'Noto Serif SC', serif" }}>
              学习目标
            </p>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: '#2C2C2C' }}>
              {matchedRoute.learningGoal}
            </p>
          </div>
        </FadeIn>

        <FadeIn>
          <div className="mb-3 flex items-center gap-2">
            <Map className="h-4 w-4" style={{ color: '#2D5A5A' }} />
            <h2 style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '18px', color: '#2D5A5A', fontWeight: 700 }}>路线地图</h2>
          </div>
          <TencentMap center={center} markers={markers} zoom={13} height="228px" />
        </FadeIn>

        <div className="my-6 h-px" style={{ background: 'linear-gradient(90deg, transparent, #D8C8B4, transparent)' }} />

        <Stagger stagger={0.14}>
          {safeRoutePoints.map((point, index) => {
            const task = tasks.find((item) => item.pointId === point.id);
            const mentor = characters.find((char) => point.spiritTags.some((tag) => char.spirit.includes(tag)));
            const isLast = index === safeRoutePoints.length - 1;

            return (
              <motion.div key={point.id} variants={fadeUp}>
                <div className="relative flex gap-4">
                  <div className="flex w-8 shrink-0 flex-col items-center">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full"
                      style={{ background: matchedRoute.color, boxShadow: `0 0 12px ${matchedRoute.color}66` }}
                    >
                      <span className="text-xs font-bold" style={{ color: '#F6F1E8' }}>
                        {index + 1}
                      </span>
                    </div>
                    {!isLast && (
                      <div
                        className="w-px grow"
                        style={{
                          background: `repeating-linear-gradient(180deg, ${matchedRoute.color}44, ${matchedRoute.color}44 4px, transparent 4px, transparent 8px)`,
                        }}
                      />
                    )}
                  </div>

                  <HoverLift className="mb-6 grow">
                    <Link to={`/node/${point.id}`}>
                      <div
                        className="rounded-xl p-5 transition-all duration-200"
                        style={{ background: '#FFFFFF', border: '1px solid #D8C8B4', boxShadow: '0 4px 16px rgba(36,67,80,0.08)' }}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="rounded-full px-2 py-0.5 text-xs" style={{ background: '#24435022', color: '#244350' }}>
                              {point.type}
                            </span>
                            <h3
                              className="mt-2"
                              style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '20px', color: '#1C1C1C', fontWeight: 700 }}
                            >
                              {point.name}
                            </h3>
                          </div>
                          <ChevronRight className="h-5 w-5 opacity-30" style={{ color: '#2C2C2C' }} />
                        </div>

                        <p className="mt-2 text-sm leading-relaxed" style={{ color: '#6B6B6B' }}>
                          {point.recommendReason}
                        </p>

                        <div className="mt-3 flex items-center gap-4">
                          <div className="flex items-center gap-1 text-xs" style={{ color: '#789B73' }}>
                            <Clock className="h-3 w-3" />
                            {point.duration} 分钟
                          </div>
                          {task && (
                            <div className="flex items-center gap-1 text-xs" style={{ color: '#B66A44' }}>
                              <BookOpen className="h-3 w-3" />
                              {task.type}
                            </div>
                          )}
                        </div>

                        <p className="mt-3 text-xs" style={{ color: '#2D5A5A' }}>
                          学习要点：{point.knowledgeHighlights[0]}
                        </p>

                        {mentor && (
                          <div
                            className="mt-3 flex items-center gap-2 rounded-lg p-2"
                            style={{ background: `${mentor.color}11`, border: `1px solid ${mentor.color}22` }}
                          >
                            <div className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: mentor.color }}>
                              <span className="text-xs font-bold" style={{ color: '#F6F1E8' }}>
                                {mentor.name.charAt(0)}
                              </span>
                            </div>
                            <span className="text-xs" style={{ color: mentor.color, fontFamily: "'Noto Serif SC', serif" }}>
                              {mentor.name} 导师建议在此停留
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>
                  </HoverLift>
                </div>
              </motion.div>
            );
          })}
        </Stagger>

        <FadeIn className="mt-8 pb-12">
          <Button
            onClick={() => safeRoutePoints[0] && navigate(`/node/${safeRoutePoints[0].id}`)}
            className="w-full rounded-xl py-6 text-lg font-bold tracking-widest transition-all hover:scale-[1.02]"
            style={{
              background: `linear-gradient(135deg, ${matchedRoute.color}, ${matchedRoute.color}cc)`,
              color: '#F6F1E8',
              fontFamily: "'Noto Serif SC', serif",
              boxShadow: `0 4px 24px ${matchedRoute.color}66`,
              border: 'none',
            }}
          >
            进入第一个研学节点
          </Button>
        </FadeIn>
      </div>
    </div>
  );
}
