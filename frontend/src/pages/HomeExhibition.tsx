import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { cityShowcases, type CityGalleryItem } from '@/data/cityExhibits';

interface MasonryItem extends CityGalleryItem {
  cityId: string;
  cityName: string;
  citySubtitle: string;
}

const MODULE_LINKS = [
  { to: '/atlas', title: '城迹图谱', desc: '地域文化脉络可视化' },
  { to: '/recommend', title: '个性推荐', desc: '国宝影像与兴趣推荐' },
  { to: '/qa', title: '知识问答', desc: '百科全书与问答挑战' },
  { to: '/blog', title: '城市博客', desc: '发布观点与互动交流' },
  { to: '/governance', title: '治理中台', desc: '文旅工单与链上存证' },
];

export default function HomeExhibition() {
  const [activeCityId, setActiveCityId] = useState(cityShowcases[0]?.id ?? 'hangzhou');
  const [activeItem, setActiveItem] = useState<CityGalleryItem | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);

  const activeCity = useMemo(() => cityShowcases.find((city) => city.id === activeCityId) ?? cityShowcases[0], [activeCityId]);

  useEffect(() => {
    if (!activeCity) return;
    const index = cityShowcases.findIndex((city) => city.id === activeCity.id);
    if (index >= 0) {
      setHeroIndex(index);
    }
  }, [activeCity]);

  useEffect(() => {
    if (cityShowcases.length <= 1) return;

    const timer = window.setInterval(() => {
      setHeroIndex((prev) => {
        const next = (prev + 1) % cityShowcases.length;
        setActiveCityId(cityShowcases[next].id);
        return next;
      });
    }, 7000);

    return () => window.clearInterval(timer);
  }, []);

  const heroCity = cityShowcases[heroIndex] ?? activeCity;
  const prevCity = cityShowcases[(heroIndex - 1 + cityShowcases.length) % cityShowcases.length];
  const nextCity = cityShowcases[(heroIndex + 1) % cityShowcases.length];

  const masonryItems = useMemo<MasonryItem[]>(() => {
    return cityShowcases.flatMap((city) =>
      city.items.map((item) => ({
        ...item,
        cityId: city.id,
        cityName: city.name,
        citySubtitle: city.subtitle,
      })),
    );
  }, []);

  if (!activeCity || !heroCity) {
    return null;
  }

  return (
    <div className="space-y-8 heritage-fade-in">
      <section className="relative min-h-[560px] overflow-hidden rounded-[32px] border border-[#8b735f66] bg-[#0f141c] shadow-[0_30px_60px_rgba(10,12,20,0.5)] md:min-h-[650px]">
        <img src={heroCity.heroImage} alt={heroCity.name} className="home-hero-bg absolute inset-0 h-full w-full object-cover" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(197,147,99,0.32),transparent_40%),radial-gradient(circle_at_85%_18%,rgba(112,77,47,0.30),transparent_40%),linear-gradient(115deg,rgba(9,14,21,0.82),rgba(13,18,30,0.62)_46%,rgba(17,23,33,0.82))]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:34px_34px] opacity-40" />

        <img src="/assets/treasure/qianli-rivers-mountains.png" alt="纹理" className="pointer-events-none absolute -left-20 top-10 h-56 w-56 rounded-full object-cover opacity-20 blur-[1px] home-float-slow" />
        <img src="/assets/treasure/hezun.jpg" alt="文物" className="pointer-events-none absolute bottom-8 right-8 h-32 w-32 rounded-full object-cover opacity-35 ring-2 ring-[#e7d0b09a] home-float-fast" />

        <div className="relative flex min-h-[560px] flex-col p-6 md:min-h-[650px] md:p-10">
          <div className="flex flex-wrap items-center gap-2">
            {cityShowcases.map((city, index) => (
              <button
                key={city.id}
                onClick={() => {
                  setActiveCityId(city.id);
                  setHeroIndex(index);
                }}
                className="rounded-full px-3 py-1.5 text-xs font-semibold transition"
                style={{
                  background: activeCityId === city.id ? 'rgba(243,221,193,0.3)' : 'rgba(248,234,216,0.12)',
                  border: activeCityId === city.id ? '1px solid rgba(247,225,198,0.65)' : '1px solid rgba(247,225,198,0.28)',
                  color: activeCityId === city.id ? '#fff7ed' : 'rgba(255,236,214,0.84)',
                }}
              >
                {city.name}
              </button>
            ))}
          </div>

          <div className="mt-8 max-w-3xl">
            <p className="text-xs tracking-[0.36em] text-[#f1ddc2cc]">城迹主展 · 沉浸首页</p>
            <h2 className="mt-3 text-4xl font-black leading-tight text-[#fff3e2] md:text-6xl" style={{ fontFamily: "'ZCOOL XiaoWei', 'Noto Serif SC', serif" }}>
              {heroCity.name} · {heroCity.subtitle}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#f6e7d4d1] md:text-base">{heroCity.heroText}</p>
          </div>

          <div className="mt-6 grid gap-2 md:grid-cols-5">
            {MODULE_LINKS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="group rounded-2xl border px-3 py-3 transition hover:-translate-y-0.5"
                style={{
                  borderColor: 'rgba(248,230,204,0.28)',
                  background: 'rgba(255,244,226,0.13)',
                  color: '#fff3df',
                }}
              >
                <p className="text-sm font-bold">{item.title}</p>
                <p className="mt-1 text-xs text-[#f2dfc3bf]">{item.desc}</p>
              </Link>
            ))}
          </div>

          <div className="mt-auto pt-8">
            <div className="flex items-center gap-2">
              {cityShowcases.map((city, index) => (
                <button
                  key={`dot_${city.id}`}
                  onClick={() => {
                    setActiveCityId(city.id);
                    setHeroIndex(index);
                  }}
                  className="h-2.5 rounded-full transition-all"
                  style={{
                    width: heroIndex === index ? '34px' : '12px',
                    background: heroIndex === index ? '#f4d3ae' : 'rgba(244,211,174,0.35)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[30px] border border-[#9c7e6536] bg-[linear-gradient(130deg,#121924_0%,#141e2c_45%,#1f1b2a_100%)] p-5 shadow-[0_16px_32px_rgba(11,13,20,0.34)] md:p-8">
        <div className="absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-[linear-gradient(180deg,transparent,#e5c9a684,transparent)] xl:block" />

        <div className="grid items-center gap-5 xl:grid-cols-[1fr_1.45fr_1fr]">
          {[prevCity, heroCity, nextCity].map((city, idx) => {
            const isCenter = idx === 1;
            return (
              <button
                key={`circle_${city.id}`}
                onClick={() => {
                  setActiveCityId(city.id);
                  setHeroIndex(cityShowcases.findIndex((item) => item.id === city.id));
                }}
                className="group text-left"
              >
                <div className="mx-auto flex items-center justify-center">
                  <div
                    className={`relative overflow-hidden rounded-full border-2 ${isCenter ? 'h-[320px] w-[320px]' : 'h-[220px] w-[220px]'}`}
                    style={{
                      borderColor: isCenter ? 'rgba(243,213,178,0.75)' : 'rgba(243,213,178,0.35)',
                      boxShadow: isCenter ? '0 14px 34px rgba(17,11,7,0.45)' : '0 10px 24px rgba(17,11,7,0.3)',
                    }}
                  >
                    <img src={city.heroImage} alt={city.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,18,24,0.02),rgba(10,12,19,0.68))]" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-[11px] tracking-[0.18em] text-[#f6e0c3d5]">展区单元</p>
                      <p className="mt-1 text-xl font-black text-[#fff2df]" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                        {city.name}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="mx-auto mt-3 max-w-[320px] text-center text-sm leading-6 text-[#e8d7c0c4]">{city.subtitle}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-[30px] border border-[#8a715f42] bg-[linear-gradient(130deg,#111720_0%,#141b26_52%,#0e1420_100%)] p-5 shadow-[0_18px_36px_rgba(6,10,18,0.38)] md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs tracking-[0.3em] text-[#f0dcc1b3]">展陈瀑布流</p>
            <h3 className="mt-2 text-2xl font-black text-[#fff1de] md:text-3xl" style={{ fontFamily: "'Noto Serif SC', serif" }}>
              城市文物与建筑互动内容墙
            </h3>
          </div>
          <p className="text-sm text-[#ead9c2be]">点击任意卡片查看详细历史故事与文化解读</p>
        </div>

        <div className="mt-5 columns-1 gap-4 md:columns-2 xl:columns-3">
          {masonryItems.map((item, index) => {
            const blockHeight = index % 5 === 0 ? 300 : index % 3 === 0 ? 250 : 220;

            return (
              <article
                key={item.id}
                className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border transition duration-300 hover:-translate-y-1"
                style={{
                  borderColor: 'rgba(239,209,175,0.25)',
                  background: 'linear-gradient(180deg, rgba(37,47,60,0.85), rgba(22,30,42,0.92))',
                  boxShadow: '0 12px 24px rgba(5,8,16,0.34)',
                }}
              >
                <button className="w-full text-left" onClick={() => setActiveItem(item)}>
                  <div className="relative" style={{ height: `${blockHeight}px` }}>
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_32%,rgba(7,10,18,0.82)_100%)]" />
                    <div className="absolute left-3 top-3 rounded-full border px-2 py-1 text-[11px] font-semibold text-[#fff2df]" style={{ borderColor: 'rgba(250,228,200,0.5)', background: 'rgba(43,32,24,0.45)' }}>
                      {item.cityName} · {item.era}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h4 className="text-lg font-black text-[#fff2df]" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                        {item.title}
                      </h4>
                      <p className="mt-1 text-xs leading-5 text-[#ead8c0d0]">{item.brief}</p>
                    </div>
                  </div>
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <Dialog open={Boolean(activeItem)} onOpenChange={(open) => !open && setActiveItem(null)}>
        <DialogContent className="max-h-[88vh] overflow-y-auto border-0 p-0 sm:max-w-3xl" style={{ background: '#151b25' }}>
          {activeItem && (
            <div>
              <img src={activeItem.image} alt={activeItem.title} className="h-64 w-full object-cover md:h-80" />
              <div className="p-6 md:p-8">
                <DialogHeader>
                  <p className="text-xs tracking-[0.2em]" style={{ color: '#d8be9e' }}>
                    {activeItem.location} · {activeItem.era}
                  </p>
                  <DialogTitle style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '30px', color: '#fff2df' }}>{activeItem.title}</DialogTitle>
                  <DialogDescription style={{ color: '#dfc7ad' }}>{activeItem.brief}</DialogDescription>
                </DialogHeader>

                <div className="mt-5 space-y-4 text-sm leading-7" style={{ color: '#e8d7c2' }}>
                  <div>
                    <p className="mb-1 font-bold" style={{ color: '#f2d3af' }}>
                      历史脉络
                    </p>
                    <p>{activeItem.story}</p>
                  </div>
                  <div>
                    <p className="mb-1 font-bold" style={{ color: '#f2d3af' }}>
                      文化坐标
                    </p>
                    <p>{activeItem.culture}</p>
                  </div>
                </div>

                <a
                  href={activeItem.source}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex rounded-full px-4 py-2 text-xs font-semibold"
                  style={{ background: 'rgba(242, 211, 175, 0.2)', color: '#f3d6b5', border: '1px solid rgba(242, 211, 175, 0.35)' }}
                >
                  查看来源
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
