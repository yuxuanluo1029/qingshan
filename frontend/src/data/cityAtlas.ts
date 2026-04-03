export interface AtlasMetric {
  city: string;
  遗址密度: number;
  博物馆承载: number;
  文物热度: number;
  文旅活力: number;
  研究价值: number;
}

export interface AtlasTimeline {
  city: string;
  period: string;
  value: number;
}

export interface AtlasTimelineMatrix {
  period: string;
  杭州: number;
  成都: number;
  长沙: number;
  西安: number;
  武汉: number;
}

export interface AtlasDimensionCompare {
  dimension: string;
  杭州: number;
  成都: number;
  长沙: number;
  西安: number;
  武汉: number;
}

export interface AtlasCityHeat {
  city: string;
  x: number;
  y: number;
  score: number;
  relics: number;
  museums: number;
  highlight: string;
}

export interface AtlasNode {
  id: string;
  city: string;
  label: string;
  type: '遗址' | '文物' | '博物馆' | '地标';
  x: number;
  y: number;
}

export interface AtlasEdge {
  from: string;
  to: string;
  relation: string;
}

export interface AtlasGallery {
  id: string;
  city: string;
  title: string;
  image: string;
  caption: string;
  sourceUrl: string;
}

export const atlasMetrics: AtlasMetric[] = [
  { city: '杭州', 遗址密度: 85, 博物馆承载: 78, 文物热度: 82, 文旅活力: 90, 研究价值: 88 },
  { city: '成都', 遗址密度: 87, 博物馆承载: 86, 文物热度: 92, 文旅活力: 84, 研究价值: 91 },
  { city: '长沙', 遗址密度: 80, 博物馆承载: 83, 文物热度: 85, 文旅活力: 82, 研究价值: 86 },
  { city: '西安', 遗址密度: 95, 博物馆承载: 90, 文物热度: 93, 文旅活力: 88, 研究价值: 96 },
  { city: '武汉', 遗址密度: 78, 博物馆承载: 88, 文物热度: 86, 文旅活力: 84, 研究价值: 89 },
];

export const atlasTimeline: AtlasTimeline[] = [
  { city: '杭州', period: '史前文明', value: 78 },
  { city: '杭州', period: '秦汉六朝', value: 64 },
  { city: '杭州', period: '唐宋元', value: 92 },
  { city: '杭州', period: '明清近现代', value: 86 },

  { city: '成都', period: '史前文明', value: 88 },
  { city: '成都', period: '秦汉六朝', value: 76 },
  { city: '成都', period: '唐宋元', value: 83 },
  { city: '成都', period: '明清近现代', value: 79 },

  { city: '长沙', period: '史前文明', value: 72 },
  { city: '长沙', period: '秦汉六朝', value: 86 },
  { city: '长沙', period: '唐宋元', value: 74 },
  { city: '长沙', period: '明清近现代', value: 81 },

  { city: '西安', period: '史前文明', value: 70 },
  { city: '西安', period: '秦汉六朝', value: 95 },
  { city: '西安', period: '唐宋元', value: 98 },
  { city: '西安', period: '明清近现代', value: 84 },

  { city: '武汉', period: '史前文明', value: 68 },
  { city: '武汉', period: '秦汉六朝', value: 74 },
  { city: '武汉', period: '唐宋元', value: 77 },
  { city: '武汉', period: '明清近现代', value: 90 },
];

export const atlasTimelineMatrix: AtlasTimelineMatrix[] = [
  { period: '史前文明', 杭州: 78, 成都: 88, 长沙: 72, 西安: 70, 武汉: 68 },
  { period: '秦汉六朝', 杭州: 64, 成都: 76, 长沙: 86, 西安: 95, 武汉: 74 },
  { period: '唐宋元', 杭州: 92, 成都: 83, 长沙: 74, 西安: 98, 武汉: 77 },
  { period: '明清近现代', 杭州: 86, 成都: 79, 长沙: 81, 西安: 84, 武汉: 90 },
];

export const atlasDimensionCompare: AtlasDimensionCompare[] = [
  { dimension: '遗址密度', 杭州: 85, 成都: 87, 长沙: 80, 西安: 95, 武汉: 78 },
  { dimension: '博物馆承载', 杭州: 78, 成都: 86, 长沙: 83, 西安: 90, 武汉: 88 },
  { dimension: '文物热度', 杭州: 82, 成都: 92, 长沙: 85, 西安: 93, 武汉: 86 },
  { dimension: '文旅活力', 杭州: 90, 成都: 84, 长沙: 82, 西安: 88, 武汉: 84 },
  { dimension: '研究价值', 杭州: 88, 成都: 91, 长沙: 86, 西安: 96, 武汉: 89 },
];

export const atlasCityHeat: AtlasCityHeat[] = [
  { city: '成都', x: 34, y: 59, score: 88, relics: 119, museums: 62, highlight: '三星堆-金沙双遗址体系' },
  { city: '西安', x: 49, y: 52, score: 96, relics: 138, museums: 79, highlight: '秦汉隋唐都城文明核心带' },
  { city: '武汉', x: 60, y: 58, score: 84, relics: 93, museums: 68, highlight: '长江中游文明交流枢纽' },
  { city: '长沙', x: 57, y: 66, score: 86, relics: 101, museums: 64, highlight: '楚汉文化与近代城市记忆' },
  { city: '杭州', x: 68, y: 60, score: 90, relics: 111, museums: 73, highlight: '良渚文明与江南都城景观' },
];

export const atlasNodes: AtlasNode[] = [
  { id: 'hz1', city: '杭州', label: '西湖', type: '地标', x: 110, y: 118 },
  { id: 'hz2', city: '杭州', label: '良渚玉琮', type: '文物', x: 182, y: 82 },
  { id: 'hz3', city: '杭州', label: '灵隐寺', type: '遗址', x: 212, y: 142 },

  { id: 'cd1', city: '成都', label: '三星堆青铜面具', type: '文物', x: 300, y: 212 },
  { id: 'cd2', city: '成都', label: '金沙遗址', type: '遗址', x: 353, y: 170 },

  { id: 'cs1', city: '长沙', label: '岳麓书院', type: '地标', x: 462, y: 215 },
  { id: 'cs2', city: '长沙', label: '马王堆帛画', type: '文物', x: 510, y: 170 },

  { id: 'xa1', city: '西安', label: '兵马俑', type: '文物', x: 568, y: 104 },
  { id: 'xa2', city: '西安', label: '大明宫遗址', type: '遗址', x: 630, y: 82 },

  { id: 'wh1', city: '武汉', label: '黄鹤楼', type: '地标', x: 664, y: 226 },
  { id: 'wh2', city: '武汉', label: '盘龙城青铜器', type: '文物', x: 722, y: 195 },
];

export const atlasEdges: AtlasEdge[] = [
  { from: 'hz2', to: 'cd1', relation: '礼器系统对比' },
  { from: 'cd1', to: 'cs2', relation: '青铜纹样与地域交流' },
  { from: 'cs2', to: 'wh2', relation: '楚地礼乐谱系' },
  { from: 'wh2', to: 'xa1', relation: '制度与军事组织演化' },
  { from: 'hz1', to: 'xa2', relation: '都城景观比较' },
  { from: 'cs1', to: 'wh1', relation: '书院文化与城市精神' },
];

export const atlasGallery: AtlasGallery[] = [
  {
    id: 'g1',
    city: '杭州',
    title: '西湖景观视域',
    image: '/assets/panorama/hangzhou-westlake-cover.jpg',
    caption: '山、水、城同框的典型空间结构。',
    sourceUrl: 'https://schools.360cities.net/image/west-lake-hangzhou-zhejiang-china',
  },
  {
    id: 'g2',
    city: '成都',
    title: '三星堆展区视域',
    image: '/assets/panorama/chengdu-sanxingdui-mask-cover.jpg',
    caption: '古蜀青铜文物在展陈中的尺度关系。',
    sourceUrl: 'https://schools.360cities.net/image/bronze-masks-sanxingdui-museum-sichuan-cn-chengdu',
  },
  {
    id: 'g3',
    city: '长沙',
    title: '岳麓书院院落',
    image: '/assets/panorama/changsha-yuelu-academy-cover.jpg',
    caption: '书院礼序空间与教学动线。',
    sourceUrl: 'https://schools.360cities.net/image/changsha-yuelu-academy-1-hunan',
  },
  {
    id: 'g4',
    city: '西安',
    title: '兵马俑俑坑',
    image: '/assets/panorama/xian-terracotta-warriors-cover.jpg',
    caption: '军阵网格与观展路径的双重秩序。',
    sourceUrl: 'https://schools.360cities.net/image/terracotta-warriors-and-horses-lintong-xian',
  },
  {
    id: 'g5',
    city: '武汉',
    title: '黄鹤楼高点',
    image: '/assets/panorama/wuhan-huanghelou-cover.jpg',
    caption: '古建地标与城市天际线共场。',
    sourceUrl: 'https://schools.360cities.net/image/huanghelou-wuhan-hubei',
  },
  {
    id: 'g6',
    city: '跨城国宝',
    title: '莲鹤方壶纹样',
    image: '/assets/treasure/lianhefanghu.jpg',
    caption: '礼制器物在不同区域之间的审美传播。',
    sourceUrl: 'https://x0.ifengimg.com/ucms/2023_16/B5F3350D44FCCAF5CF5A4DA988C9D28049446DC3_size76_w1920_h1080.jpg',
  },
];

