import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { cityShowcases, type CityGalleryItem } from '@/data/cityExhibits';

export default function HomeExhibition() {
  const [activeCityId, setActiveCityId] = useState(cityShowcases[0]?.id ?? 'hangzhou');
  const [activeItem, setActiveItem] = useState<CityGalleryItem | null>(null);

  const activeCity = useMemo(
    () => cityShowcases.find((city) => city.id === activeCityId) ?? cityShowcases[0],
    [activeCityId],
  );

  if (!activeCity) {
    return null;
  }

  const [heroItem, ...otherItems] = activeCity.items;

  return (
    <div className="space-y-6 md:space-y-8">
      <section
        className="overflow-hidden rounded-3xl p-5 md:p-8"
        style={{
          background:
            'radial-gradient(circle at 18% 20%, rgba(179,111,60,0.25), transparent 36%), radial-gradient(circle at 80% 10%, rgba(93,58,34,0.24), transparent 34%), linear-gradient(120deg, #2f1e16 0%, #4e3123 55%, #6f4631 100%)',
        }}
      >
        <p className="text-xs tracking-[0.35em]" style={{ color: 'rgba(255,236,213,0.8)' }}>
          CITY HERITAGE PROJECT
        </p>
        <h2 className="mt-3 text-3xl font-black md:text-5xl" style={{ color: '#fff2df', fontFamily: "'ZCOOL XiaoWei', 'Noto Serif SC', serif" }}>
          城市文明图鉴
        </h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 md:text-base" style={{ color: 'rgba(255,236,213,0.82)' }}>
          “城迹”以杭州、成都、长沙、西安、武汉为研究样本，围绕建筑、文物、遗址和城市记忆组织内容，形成可持续扩展的城市历史文化线上档案。
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <Link
            to="/atlas"
            className="rounded-2xl px-4 py-3 text-sm font-semibold"
            style={{ background: 'rgba(255,244,225,0.14)', color: '#fff5e8', border: '1px solid rgba(255,243,226,0.3)' }}
          >
            城迹图谱：地域文化脉络可视化
          </Link>
          <Link
            to="/treasure"
            className="rounded-2xl px-4 py-3 text-sm font-semibold"
            style={{ background: 'rgba(255,244,225,0.14)', color: '#fff5e8', border: '1px solid rgba(255,243,226,0.3)' }}
          >
            宝物说话：国宝叙事与视频导读
          </Link>
          <Link
            to="/qa"
            className="rounded-2xl px-4 py-3 text-sm font-semibold"
            style={{ background: 'rgba(255,244,225,0.14)', color: '#fff5e8', border: '1px solid rgba(255,243,226,0.3)' }}
          >
            一览无余：跨城知识数据库检索
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {cityShowcases.map((city) => (
            <button
              key={city.id}
              onClick={() => setActiveCityId(city.id)}
              className="rounded-full px-4 py-2 text-sm font-semibold transition"
              style={{
                background: activeCityId === city.id ? 'rgba(255,244,225,0.28)' : 'rgba(255,244,225,0.12)',
                color: activeCityId === city.id ? '#fff8ee' : 'rgba(255,238,217,0.82)',
                border: activeCityId === city.id ? '1px solid rgba(255,243,226,0.65)' : '1px solid rgba(255,243,226,0.28)',
              }}
            >
              {city.name}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-[1.45fr_1fr]">
        <button
          onClick={() => heroItem && setActiveItem(heroItem)}
          className="group overflow-hidden rounded-3xl text-left"
          style={{
            border: '1px solid rgba(122,79,46,0.2)',
            boxShadow: '0 14px 30px rgba(56,35,23,0.12)',
            background: '#fff8ee',
          }}
        >
          <div className="relative h-[320px] overflow-hidden md:h-[450px]">
            <img src={heroItem?.image || activeCity.heroImage} alt={heroItem?.title || activeCity.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 38%, rgba(27,18,13,0.7) 100%)' }} />
            <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
              <p className="text-xs tracking-[0.2em]" style={{ color: 'rgba(255,238,213,0.85)' }}>
                {activeCity.name} · 核心线索
              </p>
              <h3 className="mt-2 text-2xl font-extrabold md:text-3xl" style={{ color: '#fff3e3', fontFamily: "'Noto Serif SC', serif" }}>
                {heroItem?.title || activeCity.name}
              </h3>
              <p className="mt-2 text-sm leading-6" style={{ color: 'rgba(255,238,215,0.85)' }}>
                {heroItem?.brief || activeCity.heroText}
              </p>
            </div>
          </div>
        </button>

        <div className="space-y-4 max-h-[450px] overflow-auto pr-1">
          {otherItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveItem(item)}
              className="group flex w-full gap-3 overflow-hidden rounded-2xl p-3 text-left transition hover:-translate-y-0.5"
              style={{
                background: '#fff9f0',
                border: '1px solid rgba(127,83,49,0.2)',
                boxShadow: '0 10px 20px rgba(56,35,23,0.08)',
              }}
            >
              <img src={item.image} alt={item.title} className="h-24 w-24 shrink-0 rounded-xl object-cover transition duration-500 group-hover:scale-105" />
              <div>
                <p className="text-xs" style={{ color: '#8e613f' }}>
                  {item.era}
                </p>
                <h4 className="mt-1 text-base font-bold" style={{ color: '#5f3920', fontFamily: "'Noto Serif SC', serif" }}>
                  {item.title}
                </h4>
                <p className="mt-1 text-sm leading-6" style={{ color: '#7d5b45' }}>
                  {item.brief}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-5">
        {cityShowcases.map((city) => (
          <button
            key={city.id}
            onClick={() => setActiveCityId(city.id)}
            className="overflow-hidden rounded-2xl text-left"
            style={{
              background: '#fff8ee',
              border: city.id === activeCityId ? '2px solid rgba(148,95,58,0.58)' : '1px solid rgba(127,83,49,0.18)',
              boxShadow: city.id === activeCityId ? '0 12px 26px rgba(85,51,29,0.16)' : '0 8px 18px rgba(85,51,29,0.08)',
            }}
          >
            <img src={city.heroImage} alt={city.name} className="h-28 w-full object-cover" />
            <div className="p-3">
              <p className="text-sm font-bold" style={{ color: '#5f3920', fontFamily: "'Noto Serif SC', serif" }}>
                {city.name}
              </p>
              <p className="mt-1 text-xs leading-5" style={{ color: '#7f5f49' }}>
                {city.subtitle}
              </p>
            </div>
          </button>
        ))}
      </section>

      <Dialog open={Boolean(activeItem)} onOpenChange={(open) => !open && setActiveItem(null)}>
        <DialogContent className="max-h-[88vh] overflow-y-auto border-0 p-0 sm:max-w-3xl" style={{ background: '#fff7ec' }}>
          {activeItem && (
            <div>
              <img src={activeItem.image} alt={activeItem.title} className="h-64 w-full object-cover md:h-80" />
              <div className="p-6 md:p-8">
                <DialogHeader>
                  <p className="text-xs tracking-[0.2em]" style={{ color: '#8f5a35' }}>
                    {activeItem.location} · {activeItem.era}
                  </p>
                  <DialogTitle style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '30px', color: '#5f3920' }}>{activeItem.title}</DialogTitle>
                  <DialogDescription style={{ color: '#7f5d48' }}>{activeItem.brief}</DialogDescription>
                </DialogHeader>

                <div className="mt-5 space-y-4 text-sm leading-7" style={{ color: '#5f4a3d' }}>
                  <div>
                    <p className="mb-1 font-bold" style={{ color: '#6f3f1f' }}>
                      历史脉络
                    </p>
                    <p>{activeItem.story}</p>
                  </div>
                  <div>
                    <p className="mb-1 font-bold" style={{ color: '#6f3f1f' }}>
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
                  style={{ background: 'rgba(143,90,53,0.14)', color: '#8f5a35' }}
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
