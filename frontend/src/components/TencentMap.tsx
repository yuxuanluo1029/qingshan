import { useEffect, useRef, useState } from 'react';
import { addMarkerWithInfo, createMap, loadTMapGL, type Location } from '@/lib/tencent-lbs';

interface TencentMapProps {
  center: Location;
  markers?: Array<{ position: Location; title: string; id: string }>;
  zoom?: number;
  className?: string;
  height?: string;
}

export function TencentMap({ center, markers = [], zoom = 14, className = '', height = '240px' }: TencentMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<ReturnType<typeof createMap> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let destroyed = false;

    async function initMap() {
      setLoading(true);
      setError('');

      try {
        await loadTMapGL();
        if (destroyed || !containerRef.current) return;

        mapRef.current = createMap(containerRef.current, { center, zoom });

        if (markers.length > 0) {
          markers.forEach((marker) => {
            if (!mapRef.current) return;
            addMarkerWithInfo(
              mapRef.current,
              marker.position,
              marker.title,
              `<div style="padding:8px;font-family:'Noto Serif SC',serif;"><strong style="color:#244350;">${marker.title}</strong></div>`,
            );
          });
        } else if (mapRef.current) {
          addMarkerWithInfo(
            mapRef.current,
            center,
            '当前位置',
            `<div style="padding:8px;font-family:'Noto Serif SC',serif;"><strong style="color:#B66A44;">研学节点</strong></div>`,
          );
        }

        setLoading(false);
      } catch (err: unknown) {
        if (!destroyed) {
          setLoading(false);
          setError(err instanceof Error ? err.message : '地图加载失败');
        }
      }
    }

    initMap();

    return () => {
      destroyed = true;
      mapRef.current?.destroy();
      mapRef.current = null;
    };
  }, [center.lat, center.lng, zoom, JSON.stringify(markers)]);

  if (error) {
    return (
      <div className={`flex items-center justify-center rounded-xl ${className}`} style={{ height, background: '#EEE6DB', border: '1px solid #D8C8B4' }}>
        <p className="px-4 text-center text-xs" style={{ color: '#6B6B6B' }}>
          地图暂不可用：{error}
        </p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`} style={{ height, border: '1px solid #D8C8B4' }}>
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ background: '#EEE6DB' }}>
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="h-2 w-2 rounded-full"
                style={{ background: '#244350', animation: `mapLoad 1s ease-in-out infinite ${index * 0.2}s` }}
              />
            ))}
          </div>
          <style>{`@keyframes mapLoad { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }`}</style>
        </div>
      )}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
