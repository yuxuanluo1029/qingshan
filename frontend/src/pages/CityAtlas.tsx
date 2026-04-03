import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { AtlasMetric } from '@/data/cityAtlas';
import {
  atlasCityHeat,
  atlasDimensionCompare,
  atlasEdges,
  atlasGallery,
  atlasMetrics,
  atlasNodes,
  atlasRepresentativeCities,
  atlasTimelineMatrix,
} from '@/data/cityAtlas';

const cityColors: Record<string, string> = {
  杭州: '#8f9ca4',
  成都: '#9f8f84',
  长沙: '#a08d99',
  西安: '#8a7668',
  武汉: '#7f9092',
};

const metricKeys: Array<keyof Omit<AtlasMetric, 'city'>> = ['遗址密度', '博物馆承载', '文物热度', '文旅活力', '研究价值'];

const MAP_FRAME = {
  minLon: 73,
  maxLon: 136,
  minLat: 3,
  maxLat: 54.5,
  width: 1160,
  height: 720,
  pad: 28,
};

function mapLonLatToPercent(lon: number, lat: number) {
  const x =
    MAP_FRAME.pad + ((lon - MAP_FRAME.minLon) / (MAP_FRAME.maxLon - MAP_FRAME.minLon)) * (MAP_FRAME.width - MAP_FRAME.pad * 2);
  const y =
    MAP_FRAME.pad + ((MAP_FRAME.maxLat - lat) / (MAP_FRAME.maxLat - MAP_FRAME.minLat)) * (MAP_FRAME.height - MAP_FRAME.pad * 2);
  return {
    left: `${(x / MAP_FRAME.width) * 100}%`,
    top: `${(y / MAP_FRAME.height) * 100}%`,
  };
}

export default function CityAtlas() {
  const [selectedCity, setSelectedCity] = useState('西安');
  const primaryMapUrl = `${import.meta.env.BASE_URL}assets/atlas/china-map-province-style.svg`;
  const fallbackMapUrl = `${import.meta.env.BASE_URL}assets/atlas/china-map.svg`;
  const [mapSrc, setMapSrc] = useState(primaryMapUrl);
  const atlasOverview = useMemo(() => {
    const relics = atlasCityHeat.reduce((sum, item) => sum + item.relics, 0);
    const museums = atlasCityHeat.reduce((sum, item) => sum + item.museums, 0);
    const avgScore = Math.round(atlasCityHeat.reduce((sum, item) => sum + item.score, 0) / atlasCityHeat.length);
    return { relics, museums, avgScore };
  }, []);

  const selectedMetric = useMemo(() => atlasMetrics.find((item) => item.city === selectedCity) ?? atlasMetrics[0], [selectedCity]);

  const radarData = useMemo(
    () =>
      metricKeys.map((key) => ({
        metric: key,
        当前城市: selectedMetric[key],
        五城均值: Math.round(atlasMetrics.reduce((sum, item) => sum + item[key], 0) / atlasMetrics.length),
      })),
    [selectedMetric],
  );

  const cityHeatRanking = useMemo(() => [...atlasCityHeat].sort((a, b) => b.score - a.score), []);
  const activeHeat = useMemo(() => atlasCityHeat.find((item) => item.city === selectedCity) ?? atlasCityHeat[0], [selectedCity]);
  const handleMapError = () => {
    if (mapSrc !== fallbackMapUrl) {
      setMapSrc(fallbackMapUrl);
    }
  };

  return (
    <div className="space-y-6 heritage-fade-in">
      <section
        className="heritage-hero rounded-3xl p-6 md:p-8"
        style={{
          background:
            'radial-gradient(circle at 85% 12%, rgba(194, 166, 146, 0.34), transparent 35%), linear-gradient(135deg, #2e2722 0%, #4c3f37 45%, #6f6158 100%)',
        }}
      >
        <p className="text-xs tracking-[0.35em]" style={{ color: 'rgba(241,226,206,0.88)' }}>
          城迹图谱可视化中心
        </p>
        <h2 className="mt-3 text-3xl font-black md:text-5xl" style={{ color: '#f3e6d7', fontFamily: "'ZCOOL XiaoWei', 'Noto Serif SC', serif" }}>
          城迹图谱
        </h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 md:text-base" style={{ color: 'rgba(243,232,219,0.82)' }}>
          以五城为轴，整合历史阶段、地域坐标和文化指标，构建可视化的城市文明谱系。图表采用莫迪卡系色彩统一呈现，强调层次、可读性与叙事质感。
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <article className="rounded-2xl p-4" style={{ background: '#f4eee7', border: '1px solid rgba(123,103,89,0.28)' }}>
          <p className="text-xs tracking-[0.22em]" style={{ color: '#8a7568' }}>
            核心遗址样本
          </p>
          <p className="mt-1 text-2xl font-black" style={{ color: '#5d4c42' }}>
            {atlasOverview.relics}
          </p>
          <p className="text-sm" style={{ color: '#7c6a5f' }}>
            五城累计统计
          </p>
        </article>
        <article className="rounded-2xl p-4" style={{ background: '#f4eee7', border: '1px solid rgba(123,103,89,0.28)' }}>
          <p className="text-xs tracking-[0.22em]" style={{ color: '#8a7568' }}>
            博物馆/展馆样本
          </p>
          <p className="mt-1 text-2xl font-black" style={{ color: '#5d4c42' }}>
            {atlasOverview.museums}
          </p>
          <p className="text-sm" style={{ color: '#7c6a5f' }}>
            五城累计统计
          </p>
        </article>
        <article className="rounded-2xl p-4" style={{ background: '#f4eee7', border: '1px solid rgba(123,103,89,0.28)' }}>
          <p className="text-xs tracking-[0.22em]" style={{ color: '#8a7568' }}>
            地域文化均值
          </p>
          <p className="mt-1 text-2xl font-black" style={{ color: '#5d4c42' }}>
            {atlasOverview.avgScore}
          </p>
          <p className="text-sm" style={{ color: '#7c6a5f' }}>
            综合评分基线
          </p>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className="heritage-surface rounded-3xl p-5" style={{ background: '#f4eee7', border: '1px solid rgba(123,103,89,0.28)', boxShadow: '0 14px 30px rgba(80,64,52,0.08)' }}>
          <h3 className="text-xl font-black" style={{ color: '#5d4c42', fontFamily: "'Noto Serif SC', serif" }}>
            城市时间曲线
          </h3>
          <p className="mt-2 text-sm" style={{ color: '#7c6a5f' }}>
            同一时间轴下展示五城文化关注度，支持横向比较与时间切片分析。
          </p>
          <div className="mt-4 h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={atlasTimelineMatrix} margin={{ top: 8, right: 12, left: -8, bottom: 2 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(126,109,98,0.25)" />
                <XAxis dataKey="period" tick={{ fill: '#6c594f', fontSize: 12 }} />
                <YAxis domain={[50, 100]} tick={{ fill: '#6c594f', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#fffaf4', border: '1px solid rgba(122,100,86,0.34)', borderRadius: 12, color: '#5d4c42' }}
                  labelStyle={{ color: '#5d4c42', fontWeight: 700 }}
                />
                <Legend />
                <Line type="monotone" dataKey="杭州" stroke={cityColors['杭州']} strokeWidth={2.6} dot={{ r: 3.2 }} />
                <Line type="monotone" dataKey="成都" stroke={cityColors['成都']} strokeWidth={2.6} dot={{ r: 3.2 }} />
                <Line type="monotone" dataKey="长沙" stroke={cityColors['长沙']} strokeWidth={2.6} dot={{ r: 3.2 }} />
                <Line type="monotone" dataKey="西安" stroke={cityColors['西安']} strokeWidth={2.8} dot={{ r: 3.3 }} />
                <Line type="monotone" dataKey="武汉" stroke={cityColors['武汉']} strokeWidth={2.6} dot={{ r: 3.2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="heritage-surface rounded-3xl p-5" style={{ background: '#f4eee7', border: '1px solid rgba(123,103,89,0.28)', boxShadow: '0 14px 30px rgba(80,64,52,0.08)' }}>
          <h3 className="text-xl font-black" style={{ color: '#5d4c42', fontFamily: "'Noto Serif SC', serif" }}>
            多维评价矩阵
          </h3>
          <p className="mt-2 text-sm" style={{ color: '#7c6a5f' }}>
            从遗址密度、博物馆承载、文物热度、文旅活力、研究价值五个维度观察城市画像。
          </p>
          <div className="mt-4 h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={atlasDimensionCompare} margin={{ top: 8, right: 12, left: -8, bottom: 2 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(126,109,98,0.22)" />
                <XAxis dataKey="dimension" tick={{ fill: '#6c594f', fontSize: 12 }} />
                <YAxis domain={[60, 100]} tick={{ fill: '#6c594f', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#fffaf4', border: '1px solid rgba(122,100,86,0.34)', borderRadius: 12, color: '#5d4c42' }}
                  labelStyle={{ color: '#5d4c42', fontWeight: 700 }}
                />
                <Legend />
                <Bar dataKey="杭州" fill={cityColors['杭州']} radius={[6, 6, 0, 0]} />
                <Bar dataKey="成都" fill={cityColors['成都']} radius={[6, 6, 0, 0]} />
                <Bar dataKey="长沙" fill={cityColors['长沙']} radius={[6, 6, 0, 0]} />
                <Bar dataKey="西安" fill={cityColors['西安']} radius={[6, 6, 0, 0]} />
                <Bar dataKey="武汉" fill={cityColors['武汉']} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <article className="heritage-surface rounded-3xl p-5" style={{ background: '#f4eee7', border: '1px solid rgba(123,103,89,0.28)', boxShadow: '0 14px 30px rgba(80,64,52,0.08)' }}>
          <h3 className="text-xl font-black" style={{ color: '#5d4c42', fontFamily: "'Noto Serif SC', serif" }}>
            中国地域文化热力图
          </h3>
          <p className="mt-2 text-sm" style={{ color: '#7c6a5f' }}>
            采用省级分块底图呈现全国文化肌理，再叠加五城锚点，形成更清晰的地域认知视图。
          </p>

          <div className="mt-4 rounded-2xl p-4" style={{ background: 'linear-gradient(140deg, #f9f4ed 0%, #ece3d7 100%)' }}>
            <div className="relative mx-auto max-w-[760px]">
              <img
                src={mapSrc}
                alt="中国地图文化可视化底图"
                className="w-full select-none"
                style={{ filter: 'contrast(0.98) saturate(1.04)' }}
                draggable={false}
                onError={handleMapError}
              />

              {atlasCityHeat.map((item) => {
                const active = selectedCity === item.city;
                const pos = mapLonLatToPercent(item.lon, item.lat);
                return (
                  <button
                    key={item.city}
                    type="button"
                    onMouseEnter={() => setSelectedCity(item.city)}
                    onClick={() => setSelectedCity(item.city)}
                    className="group absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: pos.left, top: pos.top }}
                  >
                    <span
                      className="absolute inset-0 rounded-full opacity-45 blur-[1px]"
                      style={{
                        width: `${Math.max(14, item.score / 3.8)}px`,
                        height: `${Math.max(14, item.score / 3.8)}px`,
                        background: cityColors[item.city],
                        transform: 'translate(-50%, -50%)',
                        left: '50%',
                        top: '50%',
                      }}
                    />
                    <span
                      className="relative block rounded-full border-2 px-2 py-1 text-[11px] font-semibold transition-all"
                      style={{
                        background: active ? cityColors[item.city] : '#fefaf4',
                        borderColor: cityColors[item.city],
                        color: active ? '#fffaf4' : '#6c594f',
                        boxShadow: active ? '0 10px 20px rgba(92,75,62,0.3)' : '0 6px 14px rgba(92,75,62,0.16)',
                      }}
                    >
                      {item.city}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {atlasCityHeat.map((item) => (
                <button
                  key={`legend_${item.city}`}
                  type="button"
                  onClick={() => setSelectedCity(item.city)}
                  className="rounded-full px-3 py-1 text-xs font-semibold transition"
                  style={{
                    background: selectedCity === item.city ? cityColors[item.city] : '#fff8ef',
                    color: selectedCity === item.city ? '#fffaf4' : '#6c594f',
                    border: `1px solid ${cityColors[item.city]}`,
                  }}
                >
                  {item.city}
                </button>
              ))}
            </div>

            <p className="mt-2 text-[11px]" style={{ color: '#8a7568' }}>
              底图采用省级分区样式，若网络环境导致主图加载失败，系统将自动切换到备用底图。
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl p-3" style={{ background: '#fff8ee', border: '1px solid rgba(123,103,89,0.22)' }}>
                <p className="text-xs" style={{ color: '#8a7568' }}>
                  当前城市
                </p>
                <p className="mt-1 text-xl font-black" style={{ color: '#5d4c42' }}>
                  {activeHeat.city}
                </p>
                <p className="mt-2 text-sm" style={{ color: '#7c6a5f' }}>
                  {activeHeat.highlight}
                </p>
              </div>
              <div className="rounded-xl p-3" style={{ background: '#fff8ee', border: '1px solid rgba(123,103,89,0.22)' }}>
                <p className="text-xs" style={{ color: '#8a7568' }}>
                  地域文化指数
                </p>
                <p className="mt-1 text-2xl font-black" style={{ color: '#5d4c42' }}>
                  {activeHeat.score}
                </p>
                <p className="mt-1 text-xs" style={{ color: '#8a7568' }}>
                  综合遗址密度 / 文物热度 / 研究价值
                </p>
              </div>
              <div className="rounded-xl p-3" style={{ background: '#fff8ee', border: '1px solid rgba(123,103,89,0.22)' }}>
                <p className="text-xs" style={{ color: '#8a7568' }}>
                  馆藏与机构
                </p>
                <p className="mt-1 text-sm font-semibold" style={{ color: '#5d4c42' }}>
                  核心遗址 {activeHeat.relics} 处
                </p>
                <p className="text-sm font-semibold" style={{ color: '#5d4c42' }}>
                  博物馆/展馆 {activeHeat.museums} 处
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              {cityHeatRanking.map((item) => (
                <div key={item.city} className="grid grid-cols-[56px_1fr_40px] items-center gap-2 text-sm">
                  <span style={{ color: '#6c594f' }}>{item.city}</span>
                  <div className="h-2.5 overflow-hidden rounded-full" style={{ background: 'rgba(124,106,95,0.18)' }}>
                    <div className="h-full rounded-full" style={{ width: `${item.score}%`, background: cityColors[item.city] }} />
                  </div>
                  <span style={{ color: '#6c594f' }}>{item.score}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl p-3" style={{ background: '#fff8ee', border: '1px solid rgba(123,103,89,0.22)' }}>
              <p className="text-xs font-semibold" style={{ color: '#6c594f' }}>
                代表性扩展城市
              </p>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                {atlasRepresentativeCities.map((city) => (
                  <div key={city.city} className="rounded-lg px-2 py-1.5 text-xs" style={{ background: 'rgba(124,106,95,0.09)', color: '#6c594f' }}>
                    {city.city} · {city.region} · 指数 {city.score}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>

        <article className="heritage-surface rounded-3xl p-5" style={{ background: '#f4eee7', border: '1px solid rgba(123,103,89,0.28)', boxShadow: '0 14px 30px rgba(80,64,52,0.08)' }}>
          <div className="flex flex-wrap gap-2">
            {atlasMetrics.map((item) => (
              <button
                key={item.city}
                type="button"
                onClick={() => setSelectedCity(item.city)}
                className="rounded-full px-3 py-1.5 text-sm font-semibold transition-all"
                style={
                  selectedCity === item.city
                    ? { background: cityColors[item.city], color: '#fffaf4', boxShadow: '0 8px 16px rgba(92,75,62,0.2)' }
                    : { background: '#fffaf4', color: '#6c594f', border: '1px solid rgba(123,103,89,0.25)' }
                }
              >
                {item.city}
              </button>
            ))}
          </div>

          <h3 className="mt-4 text-xl font-black" style={{ color: '#5d4c42', fontFamily: "'Noto Serif SC', serif" }}>
            城市多维画像
          </h3>
          <p className="mt-2 text-sm" style={{ color: '#7c6a5f' }}>
            当前聚焦：{selectedCity}。雷达图用于查看该城市与五城均值的维度差异。
          </p>

          <div className="mt-4 h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius={118}>
                <PolarGrid stroke="rgba(126,109,98,0.3)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#6c594f', fontSize: 12 }} />
                <Radar name={`${selectedCity}指数`} dataKey="当前城市" stroke={cityColors[selectedCity]} fill={cityColors[selectedCity]} fillOpacity={0.28} />
                <Radar name="五城均值" dataKey="五城均值" stroke="#8a7568" fill="#8a7568" fillOpacity={0.12} />
                <Legend />
                <Tooltip
                  contentStyle={{ background: '#fffaf4', border: '1px solid rgba(122,100,86,0.34)', borderRadius: 12, color: '#5d4c42' }}
                  labelStyle={{ color: '#5d4c42', fontWeight: 700 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_1fr]">
        <article className="heritage-surface rounded-3xl p-5" style={{ background: '#f4eee7', border: '1px solid rgba(123,103,89,0.28)', boxShadow: '0 14px 30px rgba(80,64,52,0.08)' }}>
          <h3 className="text-xl font-black" style={{ color: '#5d4c42', fontFamily: "'Noto Serif SC', serif" }}>
            地域文化脉络图
          </h3>
          <p className="mt-2 text-sm" style={{ color: '#7c6a5f' }}>
            以“地点-文物-制度-城市记忆”为线索，串联五城之间的文化关联路径。
          </p>

          <div className="mt-4 overflow-hidden rounded-2xl" style={{ background: 'linear-gradient(145deg, #f6efe5, #eee4d8)' }}>
            <svg viewBox="0 0 820 320" className="h-[360px] w-full">
              {atlasEdges.map((edge) => {
                const from = atlasNodes.find((node) => node.id === edge.from);
                const to = atlasNodes.find((node) => node.id === edge.to);
                if (!from || !to) return null;

                return (
                  <g key={`${edge.from}-${edge.to}`}>
                    <path
                      d={`M ${from.x} ${from.y} C ${(from.x + to.x) / 2} ${from.y - 42}, ${(from.x + to.x) / 2} ${to.y - 42}, ${to.x} ${to.y}`}
                      fill="none"
                      stroke="rgba(112,92,79,0.34)"
                      strokeWidth={2}
                    />
                    <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 22} textAnchor="middle" fill="#7a6456" fontSize="11">
                      {edge.relation}
                    </text>
                  </g>
                );
              })}

              {atlasNodes.map((node) => (
                <g key={node.id}>
                  <circle cx={node.x} cy={node.y} r={node.type === '文物' ? 10 : 8} fill={cityColors[node.city]} />
                  <text x={node.x + 12} y={node.y + 4} fill="#5d4c42" fontSize="12" fontWeight="600">
                    {node.label}
                  </text>
                  <text x={node.x + 12} y={node.y + 19} fill="#8a7568" fontSize="10">
                    {node.city} · {node.type}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </article>

        <article className="heritage-surface rounded-3xl p-5" style={{ background: '#f4eee7', border: '1px solid rgba(123,103,89,0.28)', boxShadow: '0 14px 30px rgba(80,64,52,0.08)' }}>
          <h3 className="text-xl font-black" style={{ color: '#5d4c42', fontFamily: "'Noto Serif SC', serif" }}>
            图像证据索引
          </h3>
          <p className="mt-2 text-sm" style={{ color: '#7c6a5f' }}>
            选取五城实景与国宝图像，辅助理解地域文化分布。
          </p>
          <div className="mt-4 space-y-3">
            {atlasGallery.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl"
                style={{ background: '#fff9f1', border: '1px solid rgba(123,103,89,0.22)' }}
              >
                <img src={item.image} alt={item.title} className="h-36 w-full object-cover" loading="lazy" />
                <div className="p-3">
                  <p className="text-xs" style={{ color: '#8a7568' }}>
                    {item.city}
                  </p>
                  <h4 className="mt-1 text-sm font-bold" style={{ color: '#5d4c42' }}>
                    {item.title}
                  </h4>
                  <p className="mt-1 text-xs leading-5" style={{ color: '#7c6a5f' }}>
                    {item.caption}
                  </p>
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-xs font-semibold"
                    style={{ color: '#8a6d5d' }}
                  >
                    查看来源
                  </a>
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

