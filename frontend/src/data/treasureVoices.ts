export interface TreasureVideoSeries {
  id: string;
  title: string;
  subtitle: string;
  link: string;
  cover: string;
  note: string;
}

export interface TreasureStoryCard {
  id: string;
  city: string;
  artifact: string;
  hook: string;
  context: string;
  watchLink: string;
  image: string;
  sourceUrl: string;
}

export const treasureSeries: TreasureVideoSeries[] = [
  {
    id: 'series-1',
    title: '纪录片《如果国宝会说话》官方节目页',
    subtitle: '央视节目官网主入口（含选集列表）',
    link: 'https://tv.cctv.com/2017/12/29/VIDAMZlRMuEdLK4MFt2vlhmC171229.shtml',
    cover: '/assets/treasure/houmuwu-ding.jpg',
    note: '推荐先从官方主入口进入，再按国宝名称定位具体剧集。',
  },
  {
    id: 'series-2',
    title: '《如果国宝会说话》节目官网入口（备用）',
    subtitle: '央视节目官网第二入口',
    link: 'https://tv.cctv.com/2017/12/21/VIDAWE377ZDQH69msDk6KUle171221.shtml',
    cover: '/assets/treasure/changxin-palace-lamp.jpg',
    note: '当主入口访问不稳定时，可使用此入口继续浏览完整选集。',
  },
  {
    id: 'series-3',
    title: '《如果国宝会说话 第四季》 第1集',
    subtitle: '央视直达页示例（官方视频页面）',
    link: 'https://tv.cctv.com/2024/02/04/VIDEgA6oNLpJqR2PL5lyCFWD240204.shtml',
    cover: '/assets/treasure/lianhefanghu.jpg',
    note: '这是央视视频直达链接格式，可直接播放，不依赖搜索跳转。',
  },
  {
    id: 'series-4',
    title: '《如果国宝会说话 第四季》 第3集',
    subtitle: '央视直达页示例（官方视频页面）',
    link: 'https://tv.cctv.com/2024/02/06/VIDEYyA5eVTfbFENfW8ZSw0X240206.shtml',
    cover: '/assets/treasure/qianli-rivers-mountains.png',
    note: '用于示范“可长期访问的官方视频详情页”写法。',
  },
];

export const treasureStories: TreasureStoryCard[] = [
  {
    id: 'story-1',
    city: '浙江杭州',
    artifact: '良渚玉琮王',
    hook: '外方内圆的形制，保存了史前礼制与宇宙观的关键符号。',
    context: '节目以“神之徽章”为线索，解释良渚文明中权力、信仰与工艺的统一关系。',
    watchLink: 'https://tv.cctv.com/2018/02/07/VIDEHlHCBbyFMCohfDNiB6V5180207.shtml',
    image: '/assets/museum/hangzhou-jade-cong.jpg',
    sourceUrl: '/assets/museum/hangzhou-jade-cong.jpg',
  },
  {
    id: 'story-2',
    city: '四川成都',
    artifact: '太阳神鸟金箔',
    hook: '旋转的太阳意象，呈现了古蜀文明对光与秩序的理解。',
    context: '该集通过金箔纹样结构，解读三星堆-金沙文化系统中的象征符号。',
    watchLink: 'https://tv.cctv.com/2018/02/07/VIDEY4NfpwGGewg9GhOupMzj180207.shtml',
    image: '/assets/museum/chengdu-sanxingdui-mask.jpg',
    sourceUrl: '/assets/museum/chengdu-sanxingdui-mask.jpg',
  },
  {
    id: 'story-3',
    city: '湖南长沙',
    artifact: '素纱单衣',
    hook: '仅重49克的衣物，展现汉代丝织工艺的极致精度。',
    context: '节目从马王堆汉墓出发，串联材料技术、审美和生活方式。',
    watchLink: 'https://tv.cctv.com/2018/08/08/VIDEwSf5lvzZdzYVRcGtC8Yz180808.shtml',
    image: '/assets/museum/changsha-lacquer-box.jpg',
    sourceUrl: '/assets/museum/changsha-lacquer-box.jpg',
  },
  {
    id: 'story-4',
    city: '陕西西安',
    artifact: '跪射俑',
    hook: '俑像细节反映了秦军组织、工艺标准与帝国秩序。',
    context: '该集以“帝国的镜像”为主题，解释兵马俑背后的制度逻辑。',
    watchLink: 'https://tv.cctv.com/2018/07/28/VIDEnLNOpm0YwPJ2czPCn10Z180728.shtml',
    image: '/assets/museum/xian-terracotta-archer.jpg',
    sourceUrl: '/assets/museum/xian-terracotta-archer.jpg',
  },
  {
    id: 'story-5',
    city: '湖北随州',
    artifact: '曾侯乙尊盘',
    hook: '失蜡法工艺巅峰，展现楚文化礼乐体系的复杂表达。',
    context: '节目从铸造难度与纹饰结构切入，呈现战国青铜工艺高度。',
    watchLink: 'https://tv.cctv.com/2018/02/02/VIDEiNP0Nww5DfC1YrI3VOxt180202.shtml',
    image: '/assets/museum/wuhan-zeng-houyi-zunpan.jpg',
    sourceUrl: '/assets/museum/wuhan-zeng-houyi-zunpan.jpg',
  },
  {
    id: 'story-6',
    city: '河南安阳',
    artifact: '后母戊鼎',
    hook: '鼎不仅是青铜器巅峰，更是商代礼制与国家权力的实体化。',
    context: '通过铸造体量、纹饰系统和出土背景，可以看见早期王权秩序的组织能力。',
    watchLink: 'https://tv.cctv.com/2018/02/07/VIDED4Y7WGQh85IBlUMni7iP180207.shtml',
    image: '/assets/treasure/houmuwu-ding.jpg',
    sourceUrl: 'https://so1.360tres.com/t013efc412bc0385708.jpg',
  },
  {
    id: 'story-7',
    city: '湖北荆州',
    artifact: '越王勾践剑',
    hook: '两千多年不锈的剑锋，展示的是冶金技术与军事制度的双重高度。',
    context: '剑身铭文、合金工艺和纹饰语言共同构成春秋战国时代的技术叙事。',
    watchLink: 'https://tv.cctv.com/2018/02/02/VIDENejecwtSGuvUdTyO5Noq180202.shtml',
    image: '/assets/treasure/sword-of-goujian.jpg',
    sourceUrl: 'https://so1.360tres.com/t01fc377e50bbfa26c2.jpg',
  },
  {
    id: 'story-8',
    city: '陕西宝鸡',
    artifact: '何尊',
    hook: '“中国”二字的最早文字记载之一，让青铜器成为历史坐标。',
    context: '铭文、器形与礼器功能共同支持了周代政治文化秩序的研究。',
    watchLink: 'https://tv.cctv.com/2018/02/07/VIDEB9nqbqvUUtdScha51JEt180207.shtml',
    image: '/assets/treasure/hezun.jpg',
    sourceUrl: 'https://p1.ssl.qhimg.com/t0156e287677f9bec04.jpg',
  },
];
