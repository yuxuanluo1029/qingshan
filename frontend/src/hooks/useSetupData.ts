import { useMemo } from 'react';
import { cities, routeTypes, cityPoints, spiritTags, type DurationOption } from '@/data/mockData';

export const cityNameMap: Record<string, string> = cities.reduce((acc, city) => {
  acc[city.id] = city.name;
  return acc;
}, {} as Record<string, string>);

export const spiritLabelMap: Record<string, string> = spiritTags.reduce((acc, tag) => {
  acc[tag.id] = tag.label;
  return acc;
}, {} as Record<string, string>);

export interface SetupData {
  city: string;
  duration: DurationOption;
  mood: string;
  spirits: string[];
}

export function useSetupData() {
  return useMemo<SetupData>(() => {
    try {
      const raw = sessionStorage.getItem('setupData');
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SetupData>;
        return {
          city: parsed.city ?? 'hangzhou',
          duration: (parsed.duration as DurationOption) ?? 'half',
          mood: parsed.mood ?? 'focused',
          spirits: parsed.spirits?.length ? parsed.spirits : ['urban_context'],
        };
      }
    } catch {
      // ignore corrupted storage and fall back to default
    }

    return {
      city: 'hangzhou',
      duration: 'half',
      mood: 'focused',
      spirits: ['urban_context'],
    };
  }, []);
}

export function useMatchedRoute(setup: SetupData) {
  const cityName = cityNameMap[setup.city] || '杭州';
  const spiritLabels = setup.spirits.map((id) => spiritLabelMap[id]).filter(Boolean);
  const primarySpirit = spiritLabels[0] || '城市文脉';
  const fallbackRoute = routeTypes[0];

  const matchedRoute = useMemo(() => {
    if (!fallbackRoute) {
      return {
        id: 'fallback_route',
        cityId: setup.city,
        name: '基础研学路线',
        subtitle: '系统兜底路线',
        desc: '当前未匹配到对应路线，已启用基础路线。',
        spiritFocus: primarySpirit,
        duration: setup.duration,
        color: '#2D5A5A',
        points: [],
        learningGoal: '先完成基础城市观察，再补充专题深挖。',
      };
    }

    const cityRoutes = routeTypes.filter((route) => route.cityId === setup.city);

    if (cityRoutes.length === 0) {
      return fallbackRoute;
    }

    const exact = cityRoutes.find(
      (route) => route.duration === setup.duration && route.spiritFocus === primarySpirit,
    );
    if (exact) {
      return exact;
    }

    const durationMatch = cityRoutes.find((route) => route.duration === setup.duration);
    if (durationMatch) {
      return durationMatch;
    }

    return cityRoutes[0] ?? fallbackRoute;
  }, [setup.city, setup.duration, primarySpirit, fallbackRoute]);

  const routePoints = (Array.isArray(matchedRoute.points) ? matchedRoute.points : [])
    .map((pointId) => cityPoints.find((point) => point.id === pointId))
    .filter(Boolean) as typeof cityPoints;

  return {
    matchedRoute,
    routePoints,
    routePointIds: Array.isArray(matchedRoute.points) ? matchedRoute.points : [],
    cityName,
    spiritLabels,
    primarySpirit,
  };
}
