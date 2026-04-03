import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { StoryAssistant } from '@/components/StoryAssistant';
import { museumArchiveItems, museumCities } from '@/data/museumArchive';
import { museumArtifacts, type MuseumArtifact } from '@/data/museumArtifacts';

export default function MuseumTour() {
  const [selected, setSelected] = useState<MuseumArtifact | null>(null);
  const [activeCity, setActiveCity] = useState<(typeof museumCities)[number]>('全部');
  const [archiveCity, setArchiveCity] = useState<(typeof museumCities)[number]>('全部');

  const filteredArtifacts = useMemo(() => {
    if (activeCity === '全部') return museumArtifacts;
    return museumArtifacts.filter((item) => item.city === activeCity);
  }, [activeCity]);

  const featuredArtifact = filteredArtifacts[0] ?? museumArtifacts[0];

  const filteredArchive = useMemo(() => {
    if (archiveCity === '全部') return museumArchiveItems;
    return museumArchiveItems.filter((item) => item.city === archiveCity);
  }, [archiveCity]);

  return (
    <div className="space-y-8 heritage-fade-in">
      <section className="relative overflow-hidden rounded-[30px] border border-[#7d664f55] bg-[#101720] shadow-[0_20px_46px_rgba(9,10,18,0.46)]">
        <img src={featuredArtifact.preview} alt={featuredArtifact.name} className="home-hero-bg absolute inset-0 h-full w-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(210,161,106,0.30),transparent_38%),linear-gradient(120deg,rgba(11,16,25,0.9),rgba(16,24,36,0.75)_46%,rgba(20,16,27,0.9))]" />

        <div className="relative p-6 md:p-8">
          <p className="text-xs tracking-[0.35em] text-[#efd9bcbb]">3D MUSEUM EXHIBITION</p>
          <h2 className="mt-3 text-3xl font-black text-[#fff2df] md:text-5xl" style={{ fontFamily: "'ZCOOL XiaoWei', 'Noto Serif SC', serif" }}>
            3D博物馆
          </h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-[#f2dec5d1] md:text-base">
            以五城核心文物构建可旋转可观察的数字展柜，结合扩展馆藏档案形成“核心文物-同城线索-跨城比较”的立体叙事。
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {museumCities.map((city) => (
              <button
                key={city}
                onClick={() => setActiveCity(city)}
                className="rounded-full px-3 py-1.5 text-xs font-semibold transition"
                style={{
                  background: activeCity === city ? 'rgba(245,219,186,0.3)' : 'rgba(255,245,232,0.12)',
                  color: activeCity === city ? '#fff6ec' : '#f0dec7',
                  border: activeCity === city ? '1px solid rgba(248,226,197,0.65)' : '1px solid rgba(248,226,197,0.25)',
                }}
              >
                {city}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <Link
              to="/scene3d"
              className="rounded-2xl px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
              style={{ background: 'rgba(255,244,225,0.14)', color: '#fff5e8', border: '1px solid rgba(255,243,226,0.3)' }}
            >
              进入3D实景：查看360°沉浸场景
            </Link>
            <Link
              to="/atlas"
              className="rounded-2xl px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
              style={{ background: 'rgba(255,244,225,0.14)', color: '#fff5e8', border: '1px solid rgba(255,243,226,0.3)' }}
            >
              进入城迹图谱：查看地域文化脉络
            </Link>
            <Link
              to="/recommend"
              className="rounded-2xl px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
              style={{ background: 'rgba(255,244,225,0.14)', color: '#fff5e8', border: '1px solid rgba(255,243,226,0.3)' }}
            >
              进入个性推荐：联动国宝视频导览
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <article className="overflow-hidden rounded-[26px] border border-[#8a715841] bg-[linear-gradient(135deg,#0f1824_0%,#152335_100%)] shadow-[0_18px_34px_rgba(8,10,18,0.38)]">
          <img src={featuredArtifact.preview} alt={featuredArtifact.name} className="h-[300px] w-full object-cover" loading="lazy" />
          <div className="p-5 md:p-6">
            <p className="text-xs text-[#e9d5bbb8]">主展文物 · {featuredArtifact.city} · {featuredArtifact.era}</p>
            <h3 className="mt-2 text-2xl font-black text-[#fff1de]" style={{ fontFamily: "'Noto Serif SC', serif" }}>
              {featuredArtifact.name}
            </h3>
            <p className="mt-3 text-sm leading-7 text-[#ebd8c1cf]">{featuredArtifact.headline}</p>
            <p className="mt-3 text-sm leading-7 text-[#dcc6abca]">{featuredArtifact.detail}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setSelected(featuredArtifact)}
                className="rounded-full px-4 py-2 text-sm font-semibold"
                style={{ background: 'rgba(243,210,173,0.2)', color: '#ffe9cf', border: '1px solid rgba(243,210,173,0.36)' }}
              >
                打开3D展柜
              </button>
              <a
                href={featuredArtifact.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full px-4 py-2 text-sm font-semibold"
                style={{ background: 'rgba(243,210,173,0.12)', color: '#ffe9cf', border: '1px solid rgba(243,210,173,0.24)' }}
              >
                模型来源
              </a>
            </div>
          </div>
        </article>

        <article className="heritage-surface rounded-[26px] p-4 md:p-5">
          <h3 className="text-xl font-black" style={{ color: '#5f3920', fontFamily: "'Noto Serif SC', serif" }}>
            侧厅展柜
          </h3>
          <p className="mt-1 text-xs" style={{ color: '#8b6548' }}>
            点击任意卡片可打开对应3D模型
          </p>

          <div className="mt-3 space-y-3">
            {filteredArtifacts.map((artifact) => (
              <button
                key={artifact.id}
                onClick={() => setSelected(artifact)}
                className="group flex w-full gap-3 rounded-xl border p-2 text-left transition hover:-translate-y-0.5"
                style={{ background: '#fff9f0', borderColor: 'rgba(127,83,49,0.2)' }}
              >
                <img src={artifact.preview} alt={artifact.name} className="h-20 w-20 shrink-0 rounded-lg object-cover transition group-hover:scale-105" loading="lazy" />
                <div>
                  <p className="text-xs" style={{ color: '#8e613f' }}>
                    {artifact.city} · {artifact.era}
                  </p>
                  <p className="mt-1 text-sm font-bold" style={{ color: '#5f3920', fontFamily: "'Noto Serif SC', serif" }}>
                    {artifact.name}
                  </p>
                  <p className="mt-1 text-xs leading-5" style={{ color: '#7a5b46' }}>
                    {artifact.headline}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </article>
      </section>

      <section className="heritage-surface rounded-[26px] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-black" style={{ color: '#5f3920', fontFamily: "'Noto Serif SC', serif" }}>
            五城馆藏档案墙
          </h3>
          <div className="flex flex-wrap gap-2">
            {museumCities.map((city) => (
              <button
                key={city}
                onClick={() => setArchiveCity(city)}
                className="rounded-full px-3 py-1.5 text-xs font-semibold"
                style={{
                  background: archiveCity === city ? 'rgba(143,90,53,0.18)' : 'rgba(143,90,53,0.08)',
                  color: archiveCity === city ? '#6f3f1f' : '#8f5a35',
                }}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 columns-1 gap-4 md:columns-2 xl:columns-3">
          {filteredArchive.map((item, index) => {
            const h = index % 4 === 0 ? 260 : index % 3 === 0 ? 210 : 230;
            return (
              <article
                key={item.id}
                className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border"
                style={{ background: '#fffef9', borderColor: 'rgba(127,83,49,0.2)', boxShadow: '0 8px 18px rgba(56,35,21,0.08)' }}
              >
                <img src={item.image} alt={item.title} className="w-full object-cover" loading="lazy" style={{ height: `${h}px` }} />
                <div className="p-4">
                  <p className="text-xs" style={{ color: '#8e613f' }}>
                    {item.city} · {item.era}
                  </p>
                  <h4 className="mt-1 text-base font-bold" style={{ color: '#5f3920', fontFamily: "'Noto Serif SC', serif" }}>
                    {item.title}
                  </h4>
                  <p className="mt-2 text-sm leading-6" style={{ color: '#7a5b46' }}>
                    {item.summary}
                  </p>
                  <a href={item.source} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs font-semibold" style={{ color: '#8f5a35' }}>
                    查看档案来源
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto border-0 p-0 sm:max-w-5xl" style={{ background: '#151b25' }}>
          {selected && (
            <div>
              <div className="h-[58vh] min-h-[420px] overflow-hidden" style={{ background: 'linear-gradient(180deg, #0f1621, #1c2b3d)' }}>
                <iframe
                  src={selected.embedUrl}
                  title={selected.name}
                  className="h-full w-full border-0"
                  loading="lazy"
                  allow="autoplay; fullscreen; xr-spatial-tracking"
                  allowFullScreen
                  referrerPolicy="origin-when-cross-origin"
                />
              </div>
              <div className="p-6 md:p-8">
                <DialogHeader>
                  <p className="text-xs tracking-[0.2em]" style={{ color: '#d8be9e' }}>
                    {selected.city} · {selected.era}
                  </p>
                  <DialogTitle style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '30px', color: '#fff2df' }}>{selected.name}</DialogTitle>
                  <DialogDescription style={{ color: '#dfc7ad' }}>{selected.headline}</DialogDescription>
                </DialogHeader>

                <div className="mt-5 rounded-2xl p-4 text-sm leading-7" style={{ background: 'rgba(242, 211, 175, 0.08)', color: '#e8d7c2' }}>
                  {selected.detail}
                </div>

                <div className="mt-5 rounded-xl p-4" style={{ background: 'rgba(242, 211, 175, 0.08)', border: '1px solid rgba(242, 211, 175, 0.2)' }}>
                  <p className="text-xs font-bold" style={{ color: '#f2d3af' }}>
                    模型来源
                  </p>
                  <p className="mt-2 text-sm" style={{ color: '#e9d7c1' }}>
                    {selected.sourceName}
                  </p>
                  <a href={selected.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-semibold" style={{ color: '#f2d3af' }}>
                    打开模型原始页面
                  </a>
                </div>

                <div className="mt-5 rounded-xl p-4" style={{ background: 'rgba(242, 211, 175, 0.08)', border: '1px solid rgba(242, 211, 175, 0.2)' }}>
                  <p className="text-xs font-bold" style={{ color: '#f2d3af' }}>
                    研究提示
                  </p>
                  <p className="mt-2 text-sm" style={{ color: '#e9d7c1' }}>
                    {selected.aiPrompt}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <StoryAssistant
        moduleTitle="3D博物馆"
        contextHint="文物讲解与博物馆教育"
        quickPrompts={[
          '请从历史背景、工艺特征、文化意义三方面讲解这件文物。',
          '这件文物在五城比较中处于什么位置？',
          '请给我一段适合展厅导览的60秒讲解词。',
        ]}
      />
    </div>
  );
}
