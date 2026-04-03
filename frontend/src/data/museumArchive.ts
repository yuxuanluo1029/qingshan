export interface MuseumArchiveItem {
  id: string;
  city: string;
  title: string;
  era: string;
  image: string;
  summary: string;
  source: string;
}

export const museumArchiveItems: MuseumArchiveItem[] = [
  {
    id: 'arc-hz-yucong',
    city: '杭州',
    title: '良渚玉琮',
    era: '新石器时代晚期',
    image: '/assets/museum/hangzhou-jade-cong.jpg',
    summary: '礼器结构体现史前礼制与信仰秩序。',
    source: 'https://sketchfab.com/3d-models/jade-cong-tube-89d8be26f5524876b887e5509641e64b',
  },
  {
    id: 'arc-hz-westlake',
    city: '杭州',
    title: '西湖文化景观',
    era: '唐宋至今',
    image: '/assets/panorama/hangzhou-westlake-cover.jpg',
    summary: '山水城市关系的经典样本。',
    source: 'https://schools.360cities.net/image/west-lake-hangzhou-zhejiang-china',
  },
  {
    id: 'arc-hz-lingyin',
    city: '杭州',
    title: '灵隐石刻线索',
    era: '东晋至清',
    image: '/assets/panorama/hangzhou-lingyin-cover.jpg',
    summary: '山体石刻与佛寺空间共同构成宗教艺术系统。',
    source: 'https://schools.360cities.net/image/china-hangzhou-lys',
  },

  {
    id: 'arc-cd-mask',
    city: '成都',
    title: '三星堆青铜面具',
    era: '商周时期',
    image: '/assets/museum/chengdu-sanxingdui-mask.jpg',
    summary: '古蜀文明代表器物，造型语言高度独特。',
    source: 'https://sketchfab.com/3d-models/sanxingdui-mask-01-b6d6b7c1f9624e278fec6c7a3f3caf20',
  },
  {
    id: 'arc-cd-jinsha',
    city: '成都',
    title: '金沙遗址体系',
    era: '商周时期',
    image: '/assets/cities/chengdu-main.jpg',
    summary: '与三星堆共同构成古蜀文明双核心。',
    source: 'https://www.jinshasitemuseum.com/',
  },
  {
    id: 'arc-cd-dufu',
    city: '成都',
    title: '杜甫草堂文脉',
    era: '唐代记忆',
    image: '/assets/cities/chengdu-side-1.jpg',
    summary: '文学史叙事与城市空间记忆叠合。',
    source: 'http://www.cddfct.com/',
  },

  {
    id: 'arc-cs-yuelu',
    city: '长沙',
    title: '岳麓书院',
    era: '北宋至今',
    image: '/assets/panorama/changsha-yuelu-academy-cover.jpg',
    summary: '书院制度与湖湘教育传统的持续现场。',
    source: 'https://schools.360cities.net/image/changsha-yuelu-academy-1-hunan',
  },
  {
    id: 'arc-cs-lacquer',
    city: '长沙',
    title: '马王堆漆奁',
    era: '西汉',
    image: '/assets/museum/changsha-lacquer-box.jpg',
    summary: '汉代材料工艺与生活秩序的重要证据。',
    source: 'https://sketchfab.com/3d-models/lacquer-box-for-combs-514c8a58620e4466b23d5d4b753e753c',
  },
  {
    id: 'arc-cs-hunan',
    city: '长沙',
    title: '湖南博物院叙事',
    era: '当代展陈',
    image: '/assets/cities/changsha-side-1.jpg',
    summary: '以马王堆为核心构建汉代文明阐释路径。',
    source: 'https://www.hnmuseum.com/',
  },

  {
    id: 'arc-xa-archer',
    city: '西安',
    title: '秦兵马俑跪射俑',
    era: '秦代',
    image: '/assets/museum/xian-terracotta-archer.jpg',
    summary: '兵种姿态与工艺标准化的典型样本。',
    source: 'https://sketchfab.com/3d-models/terracotta-archer-ca4082fc248641daa1c2b039e18ab8a3',
  },
  {
    id: 'arc-xa-pit',
    city: '西安',
    title: '兵马俑俑坑空间',
    era: '秦代遗址展示',
    image: '/assets/panorama/xian-terracotta-warriors-cover.jpg',
    summary: '俑坑网格展现帝国军阵组织逻辑。',
    source: 'https://schools.360cities.net/image/terracotta-warriors-and-horses-lintong-xian',
  },
  {
    id: 'arc-xa-wall',
    city: '西安',
    title: '西安城墙体系',
    era: '明代形制',
    image: '/assets/cities/xian-side-1.jpg',
    summary: '都城边界、防御与交通组织的实体证据。',
    source: 'https://www.xacitywall.com/',
  },

  {
    id: 'arc-wh-huanghelou',
    city: '武汉',
    title: '黄鹤楼地标',
    era: '三国起源记忆',
    image: '/assets/panorama/wuhan-huanghelou-cover.jpg',
    summary: '文学意象与城市天际线共同构成的文化符号。',
    source: 'https://schools.360cities.net/image/huanghelou-wuhan-hubei',
  },
  {
    id: 'arc-wh-zunpan',
    city: '武汉',
    title: '曾侯乙尊盘',
    era: '战国早期',
    image: '/assets/museum/wuhan-zeng-houyi-zunpan.jpg',
    summary: '楚地礼乐文明高复杂度青铜器代表。',
    source: 'https://sketchfab.com/3d-models/bronze-zeng-houyi-zun-plate-e130c7ee2c1f4eb8b95756832bbf9a3e',
  },
  {
    id: 'arc-wh-bridge',
    city: '武汉',
    title: '武汉长江大桥',
    era: '20世纪城市工程',
    image: '/assets/cities/wuhan-side-1.jpg',
    summary: '三镇联动与现代城市整合的标志性基础设施。',
    source: 'https://zh.wikipedia.org/wiki/%E6%AD%A6%E6%B1%89%E9%95%BF%E6%B1%9F%E5%A4%A7%E6%A1%A5',
  },
];

export const museumCities = ['全部', '杭州', '成都', '长沙', '西安', '武汉'] as const;
