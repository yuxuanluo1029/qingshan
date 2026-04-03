export interface CityGalleryItem {
  id: string;
  title: string;
  image: string;
  era: string;
  location: string;
  brief: string;
  story: string;
  culture: string;
  source: string;
}

export interface CityShowcase {
  id: string;
  name: string;
  subtitle: string;
  heroImage: string;
  heroText: string;
  items: CityGalleryItem[];
}

export const cityShowcases: CityShowcase[] = [
  {
    id: 'hangzhou',
    name: '杭州',
    subtitle: '山水入城与宋韵文脉并行的历史样本',
    heroImage: '/assets/panorama/hangzhou-westlake-cover.jpg',
    heroText: '杭州板块围绕西湖、灵隐、雷峰塔与良渚线索展开，呈现“景观-制度-记忆”的复合文脉。',
    items: [
      {
        id: 'hz-west-lake',
        title: '西湖景观体系',
        image: '/assets/panorama/hangzhou-westlake-cover.jpg',
        era: '唐宋至今',
        location: '西湖',
        brief: '西湖把自然山水、城市生活与文人叙事长期叠合成经典样式。',
        story:
          '南宋以后，西湖进入都城叙事中心，堤桥塔亭构成可游、可读、可讲解的公共景观系统。城市历史并不只存在于遗址点位，也沉积在湖岸尺度、视线关系与游览路径中。',
        culture:
          '西湖体现了“以景载史”的传统，是理解杭州城市性格与公共文化表达的第一入口。',
        source: 'https://schools.360cities.net/image/west-lake-hangzhou-zhejiang-china',
      },
      {
        id: 'hz-lingyin',
        title: '灵隐寺与飞来峰石刻',
        image: '/assets/panorama/hangzhou-lingyin-cover.jpg',
        era: '东晋起',
        location: '灵隐片区',
        brief: '山体石刻与佛寺空间共同构成杭州宗教艺术谱系。',
        story:
          '飞来峰石刻的分期与风格差异，为观察佛教传播与本土化提供了清晰线索。灵隐寺的空间组织则持续影响杭州“山水寺院共场”的城市想象。',
        culture:
          '这是“自然地理+宗教艺术+城市记忆”三线交叉的典型样本。',
        source: 'https://schools.360cities.net/image/china-hangzhou-lys',
      },
      {
        id: 'hz-leifeng',
        title: '雷峰塔叙事场',
        image: '/assets/panorama/hangzhou-leifeng-cover.jpg',
        era: '五代起源',
        location: '夕照山',
        brief: '雷峰塔连接历史建筑、民间叙事与城市视觉地标。',
        story:
          '雷峰塔在历史中屡毁屡建，建筑本体与《白蛇传》叙事共同推动了它的文化传播力。它在杭州城市记忆中既是遗迹，也是持续更新的文化符号。',
        culture:
          '适合用于讲解“建筑实体”与“文化想象”如何互相塑造。',
        source: 'https://schools.360cities.net/image/hangzhou-leifeng-pagoda-balkony',
      },
      {
        id: 'hz-liangzhu-yucong',
        title: '良渚玉琮',
        image: '/assets/museum/hangzhou-jade-cong.jpg',
        era: '新石器时代晚期',
        location: '良渚文明体系',
        brief: '玉琮是杭州史前文明线索中的关键礼器。',
        story:
          '玉琮“外方内圆”的结构常被用于讨论礼制秩序和宇宙观表达。与城址、水利、墓地共同阅读，能看到良渚文明的制度化水平。',
        culture:
          '良渚线索让杭州的历史纵深从宋韵向史前文明延展。',
        source: 'https://sketchfab.com/3d-models/jade-cong-tube-89d8be26f5524876b887e5509641e64b',
      },
      {
        id: 'hz-urban-memory',
        title: '运河与城北更新',
        image: '/assets/cities/hangzhou-side-1.jpg',
        era: '明清至当代',
        location: '大运河杭州段',
        brief: '运河遗产和当代社区更新共同构成杭州北部文脉界面。',
        story:
          '从仓储、桥梁到滨水公共空间，运河记忆仍在参与城市组织。今天的更新实践让历史交通轴重新转化为文化生活轴。',
        culture:
          '它展示了历史基础设施如何在当代继续生产城市价值。',
        source: 'https://www.pexels.com/photo/35508930/',
      },
    ],
  },
  {
    id: 'chengdu',
    name: '成都',
    subtitle: '古蜀遗存与市井传统并进的文明层积',
    heroImage: '/assets/panorama/chengdu-sanxingdui-mask-cover.jpg',
    heroText: '成都板块以三星堆、金沙、武侯祠与草堂线索展开，强调“古蜀根系+历史人物+当代街区”的组合叙事。',
    items: [
      {
        id: 'cd-sanxingdui-mask',
        title: '三星堆青铜面具',
        image: '/assets/museum/chengdu-sanxingdui-mask.jpg',
        era: '商周时期',
        location: '三星堆文明系统',
        brief: '面具造型的夸张比例体现古蜀文明独特视觉语言。',
        story:
          '三星堆青铜器群在造型、铸造和象征逻辑上都表现出强烈地方性。其“陌生感”恰恰来自成熟而独立的文明系统。',
        culture:
          '成都历史不是单线叙事，而是古蜀文明与中原互动的多线展开。',
        source: 'https://sketchfab.com/3d-models/sanxingdui-mask-01-b6d6b7c1f9624e278fec6c7a3f3caf20',
      },
      {
        id: 'cd-sanxingdui-exhibit',
        title: '三星堆展区空间',
        image: '/assets/panorama/chengdu-sanxingdui-mask-cover.jpg',
        era: '当代展陈',
        location: '三星堆博物馆',
        brief: '展区把文物尺度、灯光组织与叙事路径整合成沉浸场域。',
        story:
          '展陈设计通过“焦点文物+关联文物群”的方式建立观众理解路径，使古蜀文明从单件奇观进入系统叙事。',
        culture:
          '这是“文物解释学”在博物馆空间中的具体实现。',
        source: 'https://schools.360cities.net/image/bronze-masks-sanxingdui-museum-sichuan-cn-chengdu',
      },
      {
        id: 'cd-jinsha',
        title: '金沙遗址线索',
        image: '/assets/cities/chengdu-main.jpg',
        era: '商周时期',
        location: '金沙遗址片区',
        brief: '金沙遗址承接并扩展了古蜀文明研究框架。',
        story:
          '金沙出土的金器、玉器与象牙遗存，提示了古蜀社会在礼仪和权力表达上的复杂结构，也构成成都文明史的核心证据。',
        culture:
          '金沙与三星堆共同构成“成都古蜀双节点”。',
        source: 'https://www.jinshasitemuseum.com/',
      },
      {
        id: 'cd-wuhouci',
        title: '武侯祠人物叙事',
        image: '/assets/cities/chengdu-side-2.jpg',
        era: '三国记忆',
        location: '武侯祠',
        brief: '武侯祠通过祠庙空间组织蜀汉人物序列与价值表达。',
        story:
          '人物纪念并非简单复述史实，而是对地方价值观的持续建构。武侯祠在成都长期承担“历史叙事公共化”的角色。',
        culture:
          '它是观察“历史事实”与“历史记忆”差异的典型场景。',
        source: 'https://www.cdwhci.net/',
      },
      {
        id: 'cd-dufu',
        title: '杜甫草堂',
        image: '/assets/cities/chengdu-side-1.jpg',
        era: '唐代记忆',
        location: '草堂片区',
        brief: '草堂将诗史文本转化为可感知的城市文化现场。',
        story:
          '杜甫在成都时期的作品，记录了时代与个体处境。草堂空间让文学记忆与地方文化教育形成稳定连接。',
        culture:
          '成都的人文气质由考古与文学两条主线共同支撑。',
        source: 'http://www.cddfct.com/',
      },
    ],
  },
  {
    id: 'changsha',
    name: '长沙',
    subtitle: '书院传统、汉墓文物与城市精神并置',
    heroImage: '/assets/panorama/changsha-yuelu-academy-cover.jpg',
    heroText: '长沙板块聚焦岳麓书院、马王堆体系与城市记忆地标，构成“教育-文物-公共空间”三重结构。',
    items: [
      {
        id: 'cs-yuelu',
        title: '岳麓书院',
        image: '/assets/panorama/changsha-yuelu-academy-cover.jpg',
        era: '北宋起',
        location: '岳麓山',
        brief: '岳麓书院是中国书院传统的关键样本。',
        story:
          '从讲堂、院门到碑刻，书院空间持续表达“教学秩序与学术传承”。它把教育制度转化为可阅读的建筑语言。',
        culture:
          '长沙的文化叙事长期包含“教育型城市”这一核心主题。',
        source: 'https://schools.360cities.net/image/changsha-yuelu-academy-1-hunan',
      },
      {
        id: 'cs-mawangdui-lacquer',
        title: '马王堆漆奁',
        image: '/assets/museum/changsha-lacquer-box.jpg',
        era: '西汉',
        location: '马王堆文物系统',
        brief: '漆器展示了汉代材料技术与生活秩序。',
        story:
          '马王堆文物群常以“器物组合”方式讲述历史：漆器、帛书与帛画并读，能复原更完整的汉代生活图景。',
        culture:
          '长沙在中国汉代考古体系中占据关键位置。',
        source: 'https://sketchfab.com/3d-models/lacquer-box-for-combs-514c8a58620e4466b23d5d4b753e753c',
      },
      {
        id: 'cs-hunan-museum',
        title: '湖南博物院叙事结构',
        image: '/assets/cities/changsha-side-1.jpg',
        era: '当代展陈',
        location: '湖南博物院',
        brief: '展陈将文物研究转换为公众可理解的历史叙事。',
        story:
          '博物院通过分层解说与时间线组织，让不同受众都能建立“文物-时代-制度”的联系。',
        culture:
          '这是长沙文化传播从学术到公众的关键接口。',
        source: 'https://www.hnmuseum.com/',
      },
      {
        id: 'cs-city-memory',
        title: '橘子洲城市记忆',
        image: '/assets/cities/changsha-main.jpg',
        era: '近现代',
        location: '橘子洲',
        brief: '橘子洲是长沙城市精神表达的地标级场景。',
        story:
          '从自然地理到纪念空间，橘子洲将“地方景观”与“公共记忆”结合为城市身份的一部分。',
        culture:
          '它体现了长沙如何把历史叙事转化为公共文化。',
        source: 'https://www.pexels.com/photo/17687980/',
      },
      {
        id: 'cs-tianxin',
        title: '天心阁古城线索',
        image: '/assets/cities/changsha-side-2.jpg',
        era: '明清遗存',
        location: '天心阁片区',
        brief: '古城防遗存提示了长沙历史空间结构。',
        story:
          '天心阁所在区域兼具防御遗迹与城市景观价值，是理解古城边界与现代更新关系的重要节点。',
        culture:
          '为“历史空间当代转译”提供可视证据。',
        source: 'https://zh.wikipedia.org/wiki/%E5%A4%A9%E5%BF%83%E9%98%81',
      },
    ],
  },
  {
    id: 'xian',
    name: '西安',
    subtitle: '多朝都城遗产叠合的高密度文化场',
    heroImage: '/assets/panorama/xian-terracotta-warriors-cover.jpg',
    heroText: '西安板块从兵马俑、城墙、大雁塔到大明宫，展示“帝国制度空间”的多层证据。',
    items: [
      {
        id: 'xa-terracotta-archer',
        title: '秦兵马俑跪射俑',
        image: '/assets/museum/xian-terracotta-archer.jpg',
        era: '秦代',
        location: '秦始皇帝陵博物院',
        brief: '跪射俑体现秦军兵种编制与标准化工艺。',
        story:
          '兵马俑的形制并非“个体肖像展”，而是帝国军制逻辑的视觉化呈现。它把制度、工艺和政治组织浓缩为可观察实体。',
        culture:
          '西安都城叙事中，兵马俑是最具结构信息的核心节点。',
        source: 'https://sketchfab.com/3d-models/terracotta-archer-ca4082fc248641daa1c2b039e18ab8a3',
      },
      {
        id: 'xa-terracotta-space',
        title: '兵马俑俑坑空间',
        image: '/assets/panorama/xian-terracotta-warriors-cover.jpg',
        era: '当代展陈',
        location: '兵马俑展区',
        brief: '俑坑展示将军阵秩序转化为观众可见的空间结构。',
        story:
          '通过俑坑视角可清晰识别纵横排列、兵种分区与观展流线，形成“历史结构可视化”的典型案例。',
        culture:
          '这是历史教育中“从场景理解制度”的高效入口。',
        source: 'https://schools.360cities.net/image/terracotta-warriors-and-horses-lintong-xian',
      },
      {
        id: 'xa-city-wall',
        title: '西安城墙',
        image: '/assets/cities/xian-side-1.jpg',
        era: '明代形制',
        location: '古城墙片区',
        brief: '城墙是都城边界、交通与防御逻辑的实体化表达。',
        story:
          '从城门、角楼到护城河系统，城墙展示了都城空间治理能力。今天的活化使用也让遗产进入市民生活。',
        culture:
          '体现“保护与使用并重”的遗产管理方向。',
        source: 'https://www.xacitywall.com/',
      },
      {
        id: 'xa-dayanta',
        title: '大雁塔文化区',
        image: '/assets/cities/xian-side-2.jpg',
        era: '唐代起源',
        location: '大雁塔片区',
        brief: '大雁塔是佛教传播和长安国际交流的地标证据。',
        story:
          '塔院空间连接译经传统、宗教传播与城市文化记忆。它在现代城市中依旧保持高识别度与叙事功能。',
        culture:
          '可用于讲解“宗教建筑如何成为城市公共符号”。',
        source: 'https://www.dayanta.com/',
      },
      {
        id: 'xa-daminggong',
        title: '大明宫遗址',
        image: '/assets/cities/xian-main.jpg',
        era: '唐代宫城',
        location: '大明宫国家遗址公园',
        brief: '大明宫重建了对唐代宫城制度空间的公众认知。',
        story:
          '遗址公园把“宫城平面秩序”与“当代公共教育”结合，使不可见的制度结构可被再次阅读。',
        culture:
          '属于都城文明研究中的关键空间样本。',
        source: 'https://www.dmgpark.com/',
      },
    ],
  },
  {
    id: 'wuhan',
    name: '武汉',
    subtitle: '两江汇流中的礼乐遗产与近代转型',
    heroImage: '/assets/panorama/wuhan-huanghelou-cover.jpg',
    heroText: '武汉板块以黄鹤楼、曾侯乙文物群、长江大桥和城市更新线索形成“地标-礼乐-工业-街区”并读框架。',
    items: [
      {
        id: 'wh-huanghelou',
        title: '黄鹤楼',
        image: '/assets/panorama/wuhan-huanghelou-cover.jpg',
        era: '三国起源记忆',
        location: '蛇山',
        brief: '黄鹤楼是武汉最具代表性的历史地标和文学意象。',
        story:
          '黄鹤楼在诗词、城市景观和旅游叙事中持续被再生产，成为武汉城市识别系统的核心符号之一。',
        culture:
          '它呈现了“文学记忆如何落地为城市地标”。',
        source: 'https://schools.360cities.net/image/huanghelou-wuhan-hubei',
      },
      {
        id: 'wh-zunpan',
        title: '曾侯乙尊盘',
        image: '/assets/museum/wuhan-zeng-houyi-zunpan.jpg',
        era: '战国早期',
        location: '楚文化文物体系',
        brief: '尊盘是楚地礼乐文明中高复杂度青铜器代表。',
        story:
          '尊盘常与编钟等文物并列讨论，揭示了礼器系统在政治秩序和审美表达中的双重角色。',
        culture:
          '武汉线索中的“礼乐文明”由此获得坚实文物支撑。',
        source: 'https://sketchfab.com/3d-models/bronze-zeng-houyi-zun-plate-e130c7ee2c1f4eb8b95756832bbf9a3e',
      },
      {
        id: 'wh-museum',
        title: '湖北省博物馆叙事',
        image: '/assets/cities/wuhan-side-2.jpg',
        era: '当代展陈',
        location: '东湖片区',
        brief: '湖北省博物馆将楚文化、礼乐文明与公众教育系统化呈现。',
        story:
          '展陈通过器物组合、音视频演示和时间线组织，让“文物知识”转化为“文明叙事”。',
        culture:
          '是武汉文化传播的重要知识平台。',
        source: 'https://www.hbww.org/',
      },
      {
        id: 'wh-bridge',
        title: '武汉长江大桥',
        image: '/assets/cities/wuhan-side-1.jpg',
        era: '20世纪',
        location: '三镇跨江轴线',
        brief: '长江大桥是武汉城市整合与工业现代化的重要标志。',
        story:
          '桥梁改变了武汉空间结构和交通组织方式，也重塑了城市经济与社会联系。',
        culture:
          '它体现了近现代工程遗产在城市叙事中的核心地位。',
        source: 'https://zh.wikipedia.org/wiki/%E6%AD%A6%E6%B1%89%E9%95%BF%E6%B1%9F%E5%A4%A7%E6%A1%A5',
      },
      {
        id: 'wh-street-memory',
        title: '昙华林街区',
        image: '/assets/cities/wuhan-main.jpg',
        era: '近现代至当代',
        location: '武昌历史街区',
        brief: '昙华林是武汉历史街区更新与创意转化的典型样本。',
        story:
          '街区通过建筑修缮和业态导入，使历史空间维持生活活力，同时保留城市记忆层次。',
        culture:
          '可用于讨论“保护与更新”之间的平衡策略。',
        source: 'https://zh.wikipedia.org/wiki/%E6%98%99%E5%8D%8E%E6%9E%97',
      },
    ],
  },
];

export const cityShowcaseMap = cityShowcases.reduce<Record<string, CityShowcase>>((acc, city) => {
  acc[city.id] = city;
  return acc;
}, {});
