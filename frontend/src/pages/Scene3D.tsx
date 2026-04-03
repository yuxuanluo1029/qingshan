import { useMemo, useState } from 'react';
import { immersiveScenes } from '@/data/immersiveScenes';
import { museumArtifacts } from '@/data/museumArtifacts';

function buildPanoramaDoc(panoramaUrl: string) {
  const safeUrl = encodeURI(panoramaUrl);

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <link rel="stylesheet" href="/vendor/pannellum/pannellum.css" />
    <style>
      html, body, #pano { width: 100%; height: 100%; margin: 0; background: #140f0c; overflow: hidden; }
      .pnlm-controls-container { top: 10px !important; left: 10px !important; }
    </style>
  </head>
  <body>
    <div id="pano"></div>
    <script src="/vendor/pannellum/pannellum.js"><\/script>
    <script>
      window.addEventListener('load', function () {
        if (!window.pannellum) return;
        window.pannellum.viewer('pano', {
          type: 'equirectangular',
          panorama: '${safeUrl}',
          autoLoad: true,
          showControls: true,
          showZoomCtrl: true,
          showFullscreenCtrl: true,
          mouseZoom: true,
          draggable: true,
          doubleClickZoom: true,
          compass: false,
          hfov: 105,
          yaw: 0,
          pitch: 0
        });
      });
    <\/script>
  </body>
</html>`;
}

export default function Scene3D() {
  const [activeId, setActiveId] = useState(immersiveScenes[0]?.id ?? 'scene-hz');

  const activeScene = useMemo(
    () => immersiveScenes.find((scene) => scene.id === activeId) ?? immersiveScenes[0],
    [activeId],
  );

  if (!activeScene) return null;

  const activeArtifact = museumArtifacts.find((artifact) => artifact.city === activeScene.city) ?? null;
  const panoDoc = buildPanoramaDoc(activeScene.panorama);

  return (
    <div className="space-y-6">
      <section
        className="rounded-3xl p-6 md:p-8"
        style={{
          background:
            'radial-gradient(circle at 84% 16%, rgba(194,139,92,0.24), transparent 34%), linear-gradient(130deg, #20140f 0%, #3f291c 52%, #654130 100%)',
        }}
      >
        <p className="text-xs tracking-[0.35em]" style={{ color: 'rgba(255,233,206,0.82)' }}>
          IMMERSIVE PANORAMA
        </p>
        <h2 className="mt-3 text-3xl font-black md:text-5xl" style={{ color: '#fff0dc', fontFamily: "'ZCOOL XiaoWei', 'Noto Serif SC', serif" }}>
          3D实景
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 md:text-base" style={{ color: 'rgba(255,234,210,0.82)' }}>
          本区以五城代表地点的360实景作为空间证据，强调“地点真实对应、叙事可追溯、跨城可比较”的项目展示逻辑。
        </p>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <div
          className="relative h-[62vh] min-h-[520px] overflow-hidden rounded-3xl md:h-[70vh] md:min-h-[620px] xl:h-[76vh]"
          style={{ border: '1px solid rgba(127,83,49,0.2)', boxShadow: '0 18px 30px rgba(56,35,23,0.14)' }}
        >
          <iframe key={activeScene.id} title={`${activeScene.city} 360全景`} srcDoc={panoDoc} className="absolute inset-0 h-full w-full border-0" />

          <div className="pointer-events-none absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'rgba(255,241,222,0.26)', color: '#fff2de' }}>
            {activeScene.city} · 360全景观察窗
          </div>

          <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-5 md:p-6" style={{ background: 'linear-gradient(180deg, rgba(12,8,6,0) 0%, rgba(12,8,6,0.68) 84%)' }}>
            <h3 className="text-2xl font-black" style={{ color: '#fff3e3', fontFamily: "'Noto Serif SC', serif" }}>
              {activeScene.title}
            </h3>
            <p className="mt-2 text-sm leading-6" style={{ color: 'rgba(255,236,214,0.88)' }}>
              {activeScene.summary}
            </p>
            <p className="mt-2 text-xs leading-6" style={{ color: 'rgba(255,236,214,0.78)' }}>
              观察建议：{activeScene.guide}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl p-4" style={{ background: '#fff8ef', border: '1px solid rgba(127,83,49,0.2)' }}>
            <p className="text-sm font-bold" style={{ color: '#5f3920' }}>
              观看说明
            </p>
            <p className="mt-3 text-xs leading-6" style={{ color: '#7a5b46' }}>
              左键拖动：环视
            </p>
            <p className="text-xs leading-6" style={{ color: '#7a5b46' }}>
              滚轮缩放：远近切换
            </p>
            <p className="text-xs leading-6" style={{ color: '#7a5b46' }}>
              全屏按钮：沉浸查看
            </p>
          </div>

          <div className="rounded-2xl p-4" style={{ background: '#fff8ef', border: '1px solid rgba(127,83,49,0.2)' }}>
            <p className="text-sm font-bold" style={{ color: '#5f3920' }}>
              全景来源
            </p>
            <p className="mt-2 text-xs leading-6" style={{ color: '#7a5b46' }}>
              {activeScene.source}
            </p>
            <a
              href={activeScene.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-xs font-semibold"
              style={{ color: '#8f5a35' }}
            >
              打开原始全景页面
            </a>
          </div>

          <div className="grid gap-3">
            {immersiveScenes.map((scene) => (
              <button
                key={scene.id}
                onClick={() => setActiveId(scene.id)}
                className="overflow-hidden rounded-2xl text-left"
                style={{
                  border: scene.id === activeId ? '2px solid rgba(148,95,58,0.6)' : '1px solid rgba(127,83,49,0.2)',
                  background: '#fff8ef',
                }}
              >
                <img src={scene.image} alt={scene.title} className="h-24 w-full object-cover" />
                <div className="p-3">
                  <p className="text-xs" style={{ color: '#8e613f' }}>
                    {scene.city}
                  </p>
                  <p className="mt-1 text-sm font-bold" style={{ color: '#5f3920' }}>
                    {scene.title}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl p-5 md:p-6" style={{ background: '#fff8ef', border: '1px solid rgba(127,83,49,0.2)' }}>
        <p className="text-sm font-bold" style={{ color: '#5f3920' }}>
          实景关联文物3D
        </p>
        <p className="mt-2 text-sm leading-7" style={{ color: '#7a5b46' }}>
          当前城市对应文物来自公开文物3D平台，以上方地点实景与下方核心文物形成同城双证，便于构建完整讲解链条。
        </p>
        {activeArtifact ? (
          <div className="mt-4 overflow-hidden rounded-2xl" style={{ background: 'linear-gradient(180deg, #1f140f, #3f2a1d)' }}>
            <div className="h-[440px] md:h-[500px]">
              <iframe
                src={activeArtifact.embedUrl}
                title={`${activeArtifact.city}文物模型`}
                className="h-full w-full border-0"
                loading="lazy"
                allow="autoplay; fullscreen; xr-spatial-tracking"
                allowFullScreen
                referrerPolicy="origin-when-cross-origin"
              />
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl p-4 text-sm" style={{ background: 'rgba(143,90,53,0.08)', color: '#6b4d38' }}>
            暂未找到该城市对应文物模型，请在“3D博物馆”中查看完整文物列表。
          </div>
        )}
      </section>
    </div>
  );
}
