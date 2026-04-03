import { PlayCircle } from 'lucide-react';
import { treasureSeries, treasureStories } from '@/data/treasureVoices';

export default function TreasureVoices() {
  return (
    <div className="space-y-6">
      <section
        className="rounded-3xl p-6 md:p-8"
        style={{
          background:
            'radial-gradient(circle at 80% 14%, rgba(214,170,119,0.24), transparent 36%), linear-gradient(130deg, #261913 0%, #412b1f 52%, #6e4631 100%)',
        }}
      >
        <p className="text-xs tracking-[0.35em]" style={{ color: 'rgba(255,229,200,0.8)' }}>
          TREASURE VOICES
        </p>
        <h2 className="mt-3 text-3xl font-black md:text-5xl" style={{ color: '#fff0dd', fontFamily: "'ZCOOL XiaoWei', 'Noto Serif SC', serif" }}>
          宝物说话
        </h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 md:text-base" style={{ color: 'rgba(255,234,210,0.82)' }}>
          本页以《如果国宝会说话》为主线，精选节目涉及的代表国宝，结合真实国宝图像封面与对应剧集入口，形成可直接浏览的影像索引。
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {treasureSeries.map((series) => (
          <article
            key={series.id}
            className="overflow-hidden rounded-2xl"
            style={{ background: '#fff8ef', border: '1px solid rgba(127,83,49,0.2)', boxShadow: '0 10px 20px rgba(58,35,21,0.08)' }}
          >
            <img src={series.cover} alt={series.title} className="h-44 w-full object-cover" loading="lazy" />
            <div className="p-4">
              <p className="text-xs" style={{ color: '#8e613f' }}>
                视频专题索引
              </p>
              <h3 className="mt-1 text-base font-bold" style={{ color: '#5f3920', fontFamily: "'Noto Serif SC', serif" }}>
                {series.title}
              </h3>
              <p className="mt-1 text-xs" style={{ color: '#8a6042' }}>
                {series.subtitle}
              </p>
              <p className="mt-2 text-sm leading-6" style={{ color: '#7a5b46' }}>
                {series.note}
              </p>
              <a
                href={series.link}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold"
                style={{ color: '#8f5a35' }}
              >
                <PlayCircle className="h-4 w-4" />
                打开视频合集
              </a>
            </div>
          </article>
        ))}
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-black" style={{ color: '#5f3920', fontFamily: "'Noto Serif SC', serif" }}>
          国宝故事卡
        </h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {treasureStories.map((story) => (
            <article
              key={story.id}
              className="overflow-hidden rounded-2xl"
              style={{ background: '#fff8ef', border: '1px solid rgba(127,83,49,0.2)' }}
            >
              <img src={story.image} alt={story.artifact} className="h-44 w-full object-cover" loading="lazy" />
              <div className="p-4">
                <p className="text-xs" style={{ color: '#8e613f' }}>
                  {story.city}
                </p>
                <h4 className="mt-1 text-lg font-bold" style={{ color: '#5f3920', fontFamily: "'Noto Serif SC', serif" }}>
                  {story.artifact}
                </h4>
                <p className="mt-2 text-sm leading-6" style={{ color: '#6f4428' }}>
                  {story.hook}
                </p>
                <p className="mt-2 text-sm leading-6" style={{ color: '#7a5b46' }}>
                  {story.context}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <a
                    href={story.watchLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-semibold"
                    style={{ color: '#8f5a35' }}
                  >
                    <PlayCircle className="h-4 w-4" />
                    查看对应剧集
                  </a>
                  <a href={story.sourceUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold" style={{ color: '#9a6d4b' }}>
                    国宝封面来源
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}


