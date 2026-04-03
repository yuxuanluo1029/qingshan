import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { museumArtifacts, type MuseumArtifact } from '@/data/museumArtifacts';
import { StoryAssistant } from '@/components/StoryAssistant';
import { museumArchiveItems, museumCities } from '@/data/museumArchive';

export default function MuseumTour() {
  const [selected, setSelected] = useState<MuseumArtifact | null>(null);
  const [archiveCity, setArchiveCity] = useState<(typeof museumCities)[number]>('全部');

  const filteredArchive = useMemo(() => {
    if (archiveCity === '全部') return museumArchiveItems;
    return museumArchiveItems.filter((item) => item.city === archiveCity);
  }, [archiveCity]);

  return (
    <div className="space-y-6">
      <section
        className="overflow-hidden rounded-3xl p-6 md:p-8"
        style={{
          background:
            'radial-gradient(circle at 20% 10%, rgba(217,169,116,0.3), transparent 32%), radial-gradient(circle at 80% 20%, rgba(82,54,32,0.24), transparent 34%), linear-gradient(130deg, #20140f 0%, #3b261a 50%, #5a3929 100%)',
        }}
      >
        <p className="text-xs tracking-[0.35em]" style={{ color: 'rgba(255,227,195,0.82)' }}>
          MUSEUM HERITAGE
        </p>
        <h2 className="mt-3 text-3xl font-black md:text-5xl" style={{ color: '#fff1dd', fontFamily: "'ZCOOL XiaoWei', 'Noto Serif SC', serif" }}>
          博物馆游览
        </h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 md:text-base" style={{ color: 'rgba(255,233,206,0.82)' }}>
          本区以五城代表文物为核心，结合扩展馆藏档案，构建“核心文物-同城线索-跨城比较”的项目化叙事结构。
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <Link
            to="/atlas"
            className="rounded-2xl px-4 py-3 text-sm font-semibold"
            style={{ background: 'rgba(255,244,225,0.14)', color: '#fff5e8', border: '1px solid rgba(255,243,226,0.3)' }}
          >
            进入城迹图谱：查看地域文化可视化脉络
          </Link>
          <Link
            to="/treasure"
            className="rounded-2xl px-4 py-3 text-sm font-semibold"
            style={{ background: 'rgba(255,244,225,0.14)', color: '#fff5e8', border: '1px solid rgba(255,243,226,0.3)' }}
          >
            进入宝物说话：连接国宝叙事视频与文物故事
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {museumArtifacts.map((artifact) => (
          <button
            key={artifact.id}
            onClick={() => setSelected(artifact)}
            className="group overflow-hidden rounded-2xl text-left"
            style={{
              background: '#fff8ef',
              border: '1px solid rgba(127,83,49,0.2)',
              boxShadow: '0 12px 24px rgba(58,35,21,0.1)',
            }}
          >
            <div className="relative h-56 overflow-hidden">
              <img
                src={artifact.preview}
                alt={artifact.name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(20,13,10,0.1), rgba(20,13,10,0.45))' }} />
              <div className="absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'rgba(255,245,232,0.86)', color: '#7a4e2f' }}>
                核心文物
              </div>
            </div>
            <div className="p-4">
              <p className="text-xs" style={{ color: '#8e613f' }}>
                {artifact.city} · {artifact.era}
              </p>
              <h3 className="mt-1 text-lg font-bold" style={{ color: '#5f3920', fontFamily: "'Noto Serif SC', serif" }}>
                {artifact.name}
              </h3>
              <p className="mt-2 text-sm leading-6" style={{ color: '#7a5b46' }}>
                {artifact.headline}
              </p>
            </div>
          </button>
        ))}
      </section>

      <section className="space-y-4 rounded-2xl p-5" style={{ background: '#fff8ef', border: '1px solid rgba(127,83,49,0.2)' }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-black" style={{ color: '#5f3920', fontFamily: "'Noto Serif SC', serif" }}>
            五城馆藏档案
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

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredArchive.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-2xl"
              style={{ background: '#fffef9', border: '1px solid rgba(127,83,49,0.2)', boxShadow: '0 8px 18px rgba(56,35,21,0.08)' }}
            >
              <img src={item.image} alt={item.title} className="h-44 w-full object-cover" loading="lazy" />
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
                <a
                  href={item.source}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-xs font-semibold"
                  style={{ color: '#8f5a35' }}
                >
                  查看档案来源
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto border-0 p-0 sm:max-w-5xl" style={{ background: '#fff7ec' }}>
          {selected && (
            <div>
              <div className="h-[58vh] min-h-[420px] overflow-hidden" style={{ background: 'linear-gradient(180deg, #1f140f, #3f2a1d)' }}>
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
                  <p className="text-xs tracking-[0.2em]" style={{ color: '#8f5a35' }}>
                    {selected.city} · {selected.era}
                  </p>
                  <DialogTitle style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '30px', color: '#5f3920' }}>{selected.name}</DialogTitle>
                  <DialogDescription style={{ color: '#7f5d48' }}>{selected.headline}</DialogDescription>
                </DialogHeader>

                <div className="mt-5 rounded-2xl p-4 text-sm leading-7" style={{ background: 'rgba(143,90,53,0.08)', color: '#5f4a3d' }}>
                  {selected.detail}
                </div>

                <div className="mt-5 rounded-xl p-4" style={{ background: '#fff3e2', border: '1px solid rgba(143,90,53,0.2)' }}>
                  <p className="text-xs font-bold" style={{ color: '#8f5a35' }}>
                    模型来源
                  </p>
                  <p className="mt-2 text-sm" style={{ color: '#6b4d38' }}>
                    {selected.sourceName}
                  </p>
                  <a
                    href={selected.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-sm font-semibold"
                    style={{ color: '#8f5a35' }}
                  >
                    打开模型原始页面
                  </a>
                </div>

                <div className="mt-5 rounded-xl p-4" style={{ background: '#fff3e2', border: '1px solid rgba(143,90,53,0.2)' }}>
                  <p className="text-xs font-bold" style={{ color: '#8f5a35' }}>
                    研究提示
                  </p>
                  <p className="mt-2 text-sm" style={{ color: '#6b4d38' }}>
                    {selected.aiPrompt}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <StoryAssistant
        moduleTitle="博物馆游览"
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
