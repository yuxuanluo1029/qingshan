export type DurationOption = 'half' | 'full' | 'two';

export interface Character {
  id: string;
  name: string;
  title: string;
  spirit: string;
  personality: string;
  voiceStyle: string;
  avatar: string;
  color: string;
  desc: string;
}

export interface Bond {
  id: string;
  char1: string;
  char2: string;
  type: '同道' | '师友' | '文脉' | '守望' | '匠心';
  level: number;
  desc: string;
  dialogue: string;
}

export interface CityPoint {
  id: string;
  name: string;
  cityId: string;
  city: string;
  type: '历史遗址' | '博物馆' | '文化街区' | '纪念馆' | '城市地标' | '非遗空间';
  desc: string;
  spiritTags: string[];
  storySeed: string;
  taskTemplate: string;
  photoHint: string;
  duration: number;
  image: string;
  lat: number;
  lng: number;
  recommendReason: string;
  knowledgeHighlights: string[];
}

export interface Task {
  id: string;
  pointId: string;
  title: string;
  type: '观察任务' | '文化问答' | '田野记录';
  difficulty: 1 | 2 | 3 | 4 | 5;
  triggerCondition: string;
  bondEffect: string;
  successResult: string;
}

export interface RouteType {
  id: string;
  cityId: string;
  name: string;
  subtitle: string;
  desc: string;
  spiritFocus: string;
  duration: DurationOption;
  color: string;
  points: string[];
  learningGoal: string;
}

export interface BattleReport {
  id: string;
  cityId: string;
  spiritFocus: string;
  title: string;
  summary: string;
  keywords: string[];
  highlights: string[];
  bondResult: string;
  finalTitle: string;
  posterCopy: string;
  personality: string;
  nextSteps: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  characterId?: string;
}

export interface City {
  id: string;
  name: string;
  desc: string;
  available: boolean;
  lat: number;
  lng: number;
  zoom: number;
}

export const characters: Character[] = [
  {
    id: 'zhuge',
    name: '诸葛亮',
    title: '历史脉络导师',
    spirit: '城市文脉',
    personality: '善于从宏观视角梳理城市发展逻辑，讲解结构清晰。',
    voiceStyle: '沉稳克制，擅长将复杂问题拆成可理解的线索。',
    avatar: '/characters/zhuge.svg',
    color: '#2D5A5A',
    desc: '他更关注“为什么这座城会这样发展”，适合带你建立城市认知框架。',
  },
  {
    id: 'mulan',
    name: '花木兰',
    title: '人物故事导师',
    spirit: '历史人物',
    personality: '强调人物命运与时代背景的关联，叙事有感染力。',
    voiceStyle: '直接有力，善于提炼关键抉择与精神力量。',
    avatar: '/characters/mulan.svg',
    color: '#C04851',
    desc: '她会把历史人物放回真实时代，让故事从“知道”走向“理解”。',
  },
  {
    id: 'libai',
    name: '李白',
    title: '文化审美导师',
    spirit: '非遗与民俗',
    personality: '关注文化表达与审美体验，擅长发现场景中的诗意细节。',
    voiceStyle: '灵动生动，常用比喻帮助用户建立画面感。',
    avatar: '/characters/libai.svg',
    color: '#4FC3F7',
    desc: '他擅长把“看景”转化为“读文化”，让研学更有记忆点。',
  },
  {
    id: 'mozi',
    name: '墨子',
    title: '实践观察导师',
    spirit: '建筑与遗址',
    personality: '强调证据与观察，鼓励在现场完成可验证的学习任务。',
    voiceStyle: '务实简洁，偏方法论导向。',
    avatar: '/characters/mozi.svg',
    color: '#789B73',
    desc: '他会带你从建筑细部、空间布局与材料信息中读出历史线索。',
  },
  {
    id: 'jingke',
    name: '荆轲',
    title: '城市记忆导师',
    spirit: '城市记忆与更新',
    personality: '关注城市记忆、社会情感与当代更新之间的张力。',
    voiceStyle: '冷静内敛，提问犀利。',
    avatar: '/characters/jingke.svg',
    color: '#C4A35A',
    desc: '他更关心“旧城如何延续”，适合带你思考文化传承与现代生活的平衡。',
  },
];

export const bonds: Bond[] = [
  {
    id: 'b1',
    char1: 'zhuge',
    char2: 'mozi',
    type: '师友',
    level: 4,
    desc: '从宏观结构到现场观察，形成“框架+证据”的完整学习链条。',
    dialogue: '“看城市，先看结构。” “看结构，也要落到每一块砖石。”',
  },
  {
    id: 'b2',
    char1: 'mulan',
    char2: 'jingke',
    type: '守望',
    level: 3,
    desc: '人物故事与城市记忆互为注脚，强调个体与时代的互相塑造。',
    dialogue: '“一个人的选择，会改变一座城的叙事。” “而城市也会定义选择的重量。”',
  },
  {
    id: 'b3',
    char1: 'libai',
    char2: 'mulan',
    type: '同道',
    level: 3,
    desc: '兼顾审美体验与人物精神，帮助用户建立更立体的历史理解。',
    dialogue: '“故事应有温度。” “也应有骨气。”',
  },
  {
    id: 'b4',
    char1: 'zhuge',
    char2: 'jingke',
    type: '文脉',
    level: 5,
    desc: '聚焦城市脉络与更新逻辑，强调历史连续性。',
    dialogue: '“文脉不断，城市才有方向。” “守住记忆，更新才有根。”',
  },
  {
    id: 'b5',
    char1: 'libai',
    char2: 'mozi',
    type: '匠心',
    level: 2,
    desc: '连接审美与工艺，帮助识别非遗技艺中的方法价值。',
    dialogue: '“审美不是装饰，是方法。” “方法落实，文化才可传承。”',
  },
];

export const cities: City[] = [
  { id: 'hangzhou', name: '杭州', desc: '宋韵文脉与当代城市更新并行的历史文化名城', available: true, lat: 30.2741, lng: 120.1551, zoom: 13 },
  { id: 'chengdu', name: '成都', desc: '从古蜀文明到市井文化，历史层积清晰可见', available: true, lat: 30.5728, lng: 104.0668, zoom: 13 },
  { id: 'changsha', name: '长沙', desc: '书院传统与近现代记忆交织的教育文化城市', available: true, lat: 28.2282, lng: 112.9388, zoom: 13 },
  { id: 'xian', name: '西安', desc: '多朝都城叠加形成的中华文明重要样本', available: true, lat: 34.3416, lng: 108.9398, zoom: 13 },
  { id: 'wuhan', name: '武汉', desc: '两江汇流下的近代工业与城市文化实验场', available: true, lat: 30.5928, lng: 114.3055, zoom: 13 },
];

export const spiritTags = [
  { id: 'urban_context', label: '城市文脉', icon: 'compass', desc: '理解城市形成逻辑与空间演化', color: '#2D5A5A' },
  { id: 'historical_figures', label: '历史人物', icon: 'book', desc: '通过人物命运理解时代变化', color: '#C04851' },
  { id: 'intangible_heritage', label: '非遗与民俗', icon: 'sparkles', desc: '关注传统技艺与日常文化实践', color: '#4FC3F7' },
  { id: 'architecture_relics', label: '建筑与遗址', icon: 'landmark', desc: '从建筑细节解读历史线索', color: '#789B73' },
  { id: 'museum_exhibition', label: '博物馆与展陈', icon: 'archive', desc: '通过展陈体系建立系统认知', color: '#C4A35A' },
  { id: 'city_memory', label: '城市记忆与更新', icon: 'layers', desc: '观察旧城记忆与现代更新关系', color: '#8A6AF0' },
];

export const moods = [
  { id: 'focused', label: '目标清晰', emoji: 'target' },
  { id: 'immersive', label: '深度沉浸', emoji: 'eye' },
  { id: 'relaxed', label: '轻松漫游', emoji: 'wind' },
  { id: 'research', label: '探究导向', emoji: 'compass' },
];

export const cityPoints: CityPoint[] = [
  {
    id: 'hz_1',
    name: '良渚博物院',
    cityId: 'hangzhou',
    city: '杭州',
    type: '博物馆',
    desc: '系统展示良渚文明与中华早期国家形态，是理解“何以中国”的关键节点。',
    spiritTags: ['博物馆与展陈', '城市文脉'],
    storySeed: '从玉器纹饰与礼制线索出发，理解早期文明秩序。',
    taskTemplate: '观察一件良渚玉器，记录其图案、用途与社会意义推测。',
    photoHint: '拍摄展陈总览+一件细节，形成“宏观-微观”对照图。',
    duration: 80,
    image: '/points/liangzhu.jpg',
    lat: 30.3792,
    lng: 119.9993,
    recommendReason: '适合作为杭州研学的知识起点，先搭建历史框架。',
    knowledgeHighlights: ['良渚文明年代与区域范围', '玉礼器与权力结构', '博物馆叙事路径设计'],
  },
  {
    id: 'hz_2',
    name: '灵隐寺与飞来峰石刻',
    cityId: 'hangzhou',
    city: '杭州',
    type: '历史遗址',
    desc: '佛教传播与江南文化融合的重要见证，石刻层次清晰。',
    spiritTags: ['建筑与遗址', '城市文脉'],
    storySeed: '通过石刻年代差异观察宗教艺术的本土化过程。',
    taskTemplate: '选择两处石刻，比较风格差异并标注时代信息。',
    photoHint: '同一取景框内包含自然岩体与人工雕刻。',
    duration: 70,
    image: '/points/lingyin.jpg',
    lat: 30.2414,
    lng: 120.1005,
    recommendReason: '现场材料丰富，适合“观察-比对-解释”式学习。',
    knowledgeHighlights: ['石刻分期与风格', '宗教空间与城市关系', '遗址保护与游客管理'],
  },
  {
    id: 'hz_3',
    name: '河坊街历史文化街区',
    cityId: 'hangzhou',
    city: '杭州',
    type: '文化街区',
    desc: '南宋临安城市生活缩影，兼具商业与传统工艺展示。',
    spiritTags: ['非遗与民俗', '城市记忆与更新'],
    storySeed: '在老街的店铺类型变化中观察城市消费文化演进。',
    taskTemplate: '记录3类店铺，判断其“传统延续”或“文旅再造”属性。',
    photoHint: '拍摄一处老字号门头与街道整体空间关系。',
    duration: 55,
    image: '/points/hefang.jpg',
    lat: 30.2475,
    lng: 120.1696,
    recommendReason: '便于把历史知识转化为可感知的生活文化体验。',
    knowledgeHighlights: ['南宋都城商业传统', '非遗展示的当代转译', '历史街区治理'],
  },
  {
    id: 'hz_4',
    name: '岳王庙',
    cityId: 'hangzhou',
    city: '杭州',
    type: '纪念馆',
    desc: '围绕岳飞记忆形成的公共历史教育场域。',
    spiritTags: ['历史人物', '城市记忆与更新'],
    storySeed: '比较“史实人物”与“民间记忆人物”的差异。',
    taskTemplate: '整理一条你在现场看到的“人物记忆建构线索”。',
    photoHint: '拍摄题刻或碑文，配一句你自己的历史注释。',
    duration: 45,
    image: '/points/yuewang.jpg',
    lat: 30.2535,
    lng: 120.1331,
    recommendReason: '适合做人物史观教育与价值讨论。',
    knowledgeHighlights: ['岳飞历史形象演变', '纪念空间叙事', '公共记忆形成机制'],
  },
  {
    id: 'hz_5',
    name: '拱宸桥与大运河历史街区',
    cityId: 'hangzhou',
    city: '杭州',
    type: '城市地标',
    desc: '连接大运河航运记忆与当代城市更新的重要节点。',
    spiritTags: ['城市文脉', '城市记忆与更新'],
    storySeed: '从桥梁、仓储与滨水空间看杭州的城市经济转型。',
    taskTemplate: '完成一份“历史功能—当代功能”对照表。',
    photoHint: '在桥上拍摄运河轴线，体现空间纵深。',
    duration: 60,
    image: '/points/gongchen.jpg',
    lat: 30.3357,
    lng: 120.1518,
    recommendReason: '非常适合讲“遗产活化”与城市更新的关系。',
    knowledgeHighlights: ['运河经济网络', '工业遗产再利用', '滨水公共空间更新'],
  },

  {
    id: 'cd_1',
    name: '武侯祠',
    cityId: 'chengdu',
    city: '成都',
    type: '纪念馆',
    desc: '三国历史文化的重要纪念空间，人物叙事线完整。',
    spiritTags: ['历史人物', '城市文脉'],
    storySeed: '从祠庙空间布局理解三国人物记忆排序。',
    taskTemplate: '选择一处匾额，解读其核心价值表达。',
    photoHint: '拍摄中轴线，体现纪念空间秩序。',
    duration: 60,
    image: '/points/wuhou.jpg',
    lat: 30.6464,
    lng: 104.0479,
    recommendReason: '人物教育场景成熟，适合讲“历史如何被记住”。',
    knowledgeHighlights: ['三国人物记忆谱系', '祠庙礼制空间', '地方文化认同'],
  },
  {
    id: 'cd_2',
    name: '杜甫草堂',
    cityId: 'chengdu',
    city: '成都',
    type: '纪念馆',
    desc: '诗人杜甫在成都生活遗址，文学与社会史关联密切。',
    spiritTags: ['历史人物', '非遗与民俗'],
    storySeed: '通过诗句与场景对应，理解“文学中的城市”。',
    taskTemplate: '摘录一联诗句，解释它与当下城市生活的联系。',
    photoHint: '拍摄草堂竹影与诗碑同框。',
    duration: 55,
    image: '/points/dufu.jpg',
    lat: 30.6598,
    lng: 104.0343,
    recommendReason: '便于将文学教育与城市现场结合。',
    knowledgeHighlights: ['杜甫成都时期创作', '诗史价值', '文人纪念空间'],
  },
  {
    id: 'cd_3',
    name: '四川博物院',
    cityId: 'chengdu',
    city: '成都',
    type: '博物馆',
    desc: '从巴蜀文明到近现代四川，展陈系统完整。',
    spiritTags: ['博物馆与展陈', '城市文脉'],
    storySeed: '通过展厅结构观察“地域文明”如何被讲述。',
    taskTemplate: '选择一个展厅，绘制该展厅的叙事结构图。',
    photoHint: '拍摄展厅导览图与重点展品形成学习记录。',
    duration: 70,
    image: '/points/scmuseum.jpg',
    lat: 30.6511,
    lng: 104.0422,
    recommendReason: '可作为成都线路的知识整合站。',
    knowledgeHighlights: ['巴蜀文明脉络', '展陈叙事方法', '文物保护与教育'],
  },
  {
    id: 'cd_4',
    name: '锦里古街',
    cityId: 'chengdu',
    city: '成都',
    type: '文化街区',
    desc: '传统街区空间与消费文化融合，适合观察民俗转译。',
    spiritTags: ['非遗与民俗', '城市记忆与更新'],
    storySeed: '比较街区中“非遗展示”与“文旅消费”之间的边界。',
    taskTemplate: '记录一种传统技艺的展示方式并判断其教育价值。',
    photoHint: '拍摄一处非遗展示店铺的操作过程。',
    duration: 45,
    image: '/points/jinli.jpg',
    lat: 30.6456,
    lng: 104.0461,
    recommendReason: '适合做“传统文化当代表达”案例分析。',
    knowledgeHighlights: ['成都民俗符号', '街区更新策略', '文旅场景化表达'],
  },
  {
    id: 'cd_5',
    name: '金沙遗址博物馆',
    cityId: 'chengdu',
    city: '成都',
    type: '历史遗址',
    desc: '古蜀文明核心遗址，出土文物丰富，文明连续性强。',
    spiritTags: ['建筑与遗址', '博物馆与展陈'],
    storySeed: '从遗址发掘与馆陈关系理解“发现历史”的过程。',
    taskTemplate: '列出一件金器和一件陶器，比较其功能与象征意义。',
    photoHint: '拍摄遗址保护展示区与文物陈列区对照。',
    duration: 75,
    image: '/points/jinsha.jpg',
    lat: 30.6897,
    lng: 104.0106,
    recommendReason: '可显著提升古蜀文明专题学习深度。',
    knowledgeHighlights: ['古蜀文明特征', '考古发掘流程', '遗址博物馆教育功能'],
  },

  {
    id: 'cs_1',
    name: '岳麓书院',
    cityId: 'changsha',
    city: '长沙',
    type: '历史遗址',
    desc: '中国古代书院教育的重要代表，教育传统延续至今。',
    spiritTags: ['城市文脉', '历史人物'],
    storySeed: '从书院制度看古代教育与地方社会关系。',
    taskTemplate: '提炼一条书院精神并写出你的当代表达。',
    photoHint: '拍摄讲堂空间，突出“教学场域”特征。',
    duration: 65,
    image: '/points/yuelu.jpg',
    lat: 28.1845,
    lng: 112.9450,
    recommendReason: '非常适合“教育文化”赛道展示。',
    knowledgeHighlights: ['书院制度', '湖湘学术传统', '教育空间演变'],
  },
  {
    id: 'cs_2',
    name: '湖南博物院',
    cityId: 'changsha',
    city: '长沙',
    type: '博物馆',
    desc: '马王堆汉墓等核心展陈，兼具学术与公众教育价值。',
    spiritTags: ['博物馆与展陈', '历史人物'],
    storySeed: '透过马王堆文物观察汉代生活世界。',
    taskTemplate: '选取一件文物，补充“它能说明什么历史问题”。',
    photoHint: '拍摄文物说明牌与展品同框，便于后续复盘。',
    duration: 80,
    image: '/points/hnmuseum.jpg',
    lat: 28.2018,
    lng: 112.9997,
    recommendReason: '展陈体系成熟，利于形成可答辩的知识证据。',
    knowledgeHighlights: ['马王堆文物体系', '展陈叙事与公众理解', '历史证据链'],
  },
  {
    id: 'cs_3',
    name: '橘子洲',
    cityId: 'changsha',
    city: '长沙',
    type: '城市地标',
    desc: '近现代城市记忆的重要象征空间。',
    spiritTags: ['城市记忆与更新', '历史人物'],
    storySeed: '从公共纪念空间看城市精神表达。',
    taskTemplate: '记录你看到的三处公共记忆符号并解释其作用。',
    photoHint: '拍摄洲头轴线，表现城市空间尺度。',
    duration: 50,
    image: '/points/juzizhou.jpg',
    lat: 28.1909,
    lng: 112.9614,
    recommendReason: '适合展示“城市精神如何被空间化”。',
    knowledgeHighlights: ['城市地标符号学', '近现代记忆建构', '公共空间教育作用'],
  },
  {
    id: 'cs_4',
    name: '天心阁',
    cityId: 'changsha',
    city: '长沙',
    type: '历史遗址',
    desc: '古城防与城市历史景观的重要节点。',
    spiritTags: ['建筑与遗址', '城市文脉'],
    storySeed: '比较古城防功能与现代城市空间功能变化。',
    taskTemplate: '绘制“城防遗址-现代街区”关系草图。',
    photoHint: '拍摄城墙遗构与现代建筑同框。',
    duration: 45,
    image: '/points/tianxin.jpg',
    lat: 28.1827,
    lng: 113.0034,
    recommendReason: '适合“历史空间的当代阅读”主题。',
    knowledgeHighlights: ['古城防体系', '遗址景观化', '历史空间更新策略'],
  },
  {
    id: 'cs_5',
    name: '坡子街火宫殿片区',
    cityId: 'changsha',
    city: '长沙',
    type: '非遗空间',
    desc: '长沙地方饮食与民俗展示的重要区域。',
    spiritTags: ['非遗与民俗', '城市记忆与更新'],
    storySeed: '从饮食非遗看城市身份构建。',
    taskTemplate: '访谈或观察一种地方小吃背后的技艺流程。',
    photoHint: '拍摄一处现场制作环节，保留操作细节。',
    duration: 50,
    image: '/points/huogongdian.jpg',
    lat: 28.1913,
    lng: 112.9744,
    recommendReason: '帮助把“文化”落到可感知的生活层面。',
    knowledgeHighlights: ['饮食民俗', '非遗活态传承', '城市日常文化'],
  },

  {
    id: 'xa_1',
    name: '秦始皇帝陵博物院（兵马俑）',
    cityId: 'xian',
    city: '西安',
    type: '历史遗址',
    desc: '中国古代国家组织能力与礼制观念的代表性遗址。',
    spiritTags: ['建筑与遗址', '博物馆与展陈'],
    storySeed: '从兵马俑编制与工艺差异理解秦代治理结构。',
    taskTemplate: '比较两尊陶俑造型差异，推测其角色分工。',
    photoHint: '拍摄俑坑全景与局部细节构成对照组。',
    duration: 90,
    image: '/points/bingmayong.jpg',
    lat: 34.3841,
    lng: 109.2785,
    recommendReason: '西安路线的核心历史证据点。',
    knowledgeHighlights: ['秦代组织系统', '工艺标准化', '考古展示逻辑'],
  },
  {
    id: 'xa_2',
    name: '西安碑林博物馆',
    cityId: 'xian',
    city: '西安',
    type: '博物馆',
    desc: '碑刻文献与书法传统高度集中，适合文献型研学。',
    spiritTags: ['博物馆与展陈', '城市文脉'],
    storySeed: '从碑刻内容看制度、教育与文化传播。',
    taskTemplate: '选择一块碑刻，写下其可用于课堂教学的知识点。',
    photoHint: '拍摄碑刻拓片展示区与原碑。',
    duration: 65,
    image: '/points/beilin.jpg',
    lat: 34.2586,
    lng: 108.9540,
    recommendReason: '适合展示“文献证据”与文化传承。',
    knowledgeHighlights: ['碑刻文献价值', '书法史线索', '文物数字化'],
  },
  {
    id: 'xa_3',
    name: '大雁塔与大唐不夜城片区',
    cityId: 'xian',
    city: '西安',
    type: '城市地标',
    desc: '历史地标与当代文旅更新结合的典型案例。',
    spiritTags: ['城市记忆与更新', '建筑与遗址'],
    storySeed: '观察“古塔核心+现代街区”如何共存。',
    taskTemplate: '列出三条你观察到的“历史元素再设计”策略。',
    photoHint: '拍摄塔体与现代街区夜景同框。',
    duration: 55,
    image: '/points/dayanta.jpg',
    lat: 34.2254,
    lng: 108.9640,
    recommendReason: '适合答辩中展示城市更新实践。',
    knowledgeHighlights: ['唐代佛教传播', '地标再叙事', '夜间经济与文化表达'],
  },
  {
    id: 'xa_4',
    name: '回民街历史街区',
    cityId: 'xian',
    city: '西安',
    type: '文化街区',
    desc: '多民族生活文化长期共存形成的街区样本。',
    spiritTags: ['非遗与民俗', '城市文脉'],
    storySeed: '从饮食、语言、空间组织观察文化交融。',
    taskTemplate: '记录两种不同文化符号在街区中的共存方式。',
    photoHint: '拍摄街巷标识与生活场景，避免仅拍美食。',
    duration: 45,
    image: '/points/huiminjie.jpg',
    lat: 34.2648,
    lng: 108.9461,
    recommendReason: '非常适合“文化融合”主题。',
    knowledgeHighlights: ['城市多元文化', '街区空间组织', '民俗日常化表达'],
  },
  {
    id: 'xa_5',
    name: '大明宫国家遗址公园',
    cityId: 'xian',
    city: '西安',
    type: '历史遗址',
    desc: '唐代宫城遗址与现代遗址公园保护利用并行。',
    spiritTags: ['建筑与遗址', '城市记忆与更新'],
    storySeed: '比较宫城原貌想象与当代遗址公园呈现方式。',
    taskTemplate: '做一页“遗址保护与公众体验”优缺点分析。',
    photoHint: '拍摄遗址标识、开放空间与解说系统。',
    duration: 65,
    image: '/points/daminggong.jpg',
    lat: 34.2935,
    lng: 108.9660,
    recommendReason: '可用于展示遗址保护与城市公共教育结合。',
    knowledgeHighlights: ['宫城制度空间', '遗址保护策略', '公共教育设计'],
  },

  {
    id: 'wh_1',
    name: '黄鹤楼',
    cityId: 'wuhan',
    city: '武汉',
    type: '城市地标',
    desc: '武汉城市文化象征之一，文学记忆与城市认同高度绑定。',
    spiritTags: ['城市文脉', '历史人物'],
    storySeed: '从“黄鹤楼意象”看城市文化传播。',
    taskTemplate: '记录一个你在现场感受到的“城市精神关键词”。',
    photoHint: '拍摄楼体与两江景观关系。',
    duration: 50,
    image: '/points/huanghelou.jpg',
    lat: 30.5446,
    lng: 114.3024,
    recommendReason: '作为武汉叙事入口，辨识度高。',
    knowledgeHighlights: ['黄鹤楼文学传统', '地标与城市品牌', '景区教育表达'],
  },
  {
    id: 'wh_2',
    name: '湖北省博物馆',
    cityId: 'wuhan',
    city: '武汉',
    type: '博物馆',
    desc: '曾侯乙编钟等重磅展品集中，适合系统化研学。',
    spiritTags: ['博物馆与展陈', '非遗与民俗'],
    storySeed: '从乐器文物切入礼乐文明与制度秩序。',
    taskTemplate: '围绕“编钟”构建一个3分钟讲解提纲。',
    photoHint: '拍摄展厅导引与重点展品说明牌。',
    duration: 80,
    image: '/points/hubeimuseum.jpg',
    lat: 30.5564,
    lng: 114.3629,
    recommendReason: '知识密度高，适合作为课堂展示素材。',
    knowledgeHighlights: ['曾侯乙编钟', '楚文化体系', '展陈教育方法'],
  },
  {
    id: 'wh_3',
    name: '辛亥革命武昌起义纪念馆',
    cityId: 'wuhan',
    city: '武汉',
    type: '纪念馆',
    desc: '近代中国转型关键事件的重要纪念空间。',
    spiritTags: ['历史人物', '城市记忆与更新'],
    storySeed: '从纪念馆叙事看近代国家与公民意识形成。',
    taskTemplate: '选取一处展陈，说明其如何塑造公共记忆。',
    photoHint: '拍摄展厅时间轴，标注关键节点。',
    duration: 60,
    image: '/points/xinhai.jpg',
    lat: 30.5453,
    lng: 114.3079,
    recommendReason: '适合进行历史事件与当代价值讨论。',
    knowledgeHighlights: ['辛亥革命节点', '纪念叙事', '近代城市史'],
  },
  {
    id: 'wh_4',
    name: '昙华林历史文化街区',
    cityId: 'wuhan',
    city: '武汉',
    type: '文化街区',
    desc: '近代建筑与当代创意业态并存的街区更新样本。',
    spiritTags: ['城市记忆与更新', '非遗与民俗'],
    storySeed: '观察“老建筑保护”与“新业态植入”的平衡。',
    taskTemplate: '记录两处更新案例并分析其文化表达成效。',
    photoHint: '拍摄老建筑立面与街道活力场景。',
    duration: 50,
    image: '/points/tanhualin.jpg',
    lat: 30.5542,
    lng: 114.3072,
    recommendReason: '适合展示城市更新的可视化证据。',
    knowledgeHighlights: ['历史街区更新机制', '城市文化创意', '保护与利用平衡'],
  },
  {
    id: 'wh_5',
    name: '汉绣传习空间（江汉路片区）',
    cityId: 'wuhan',
    city: '武汉',
    type: '非遗空间',
    desc: '以汉绣等地方技艺为核心的活态传承展示场景。',
    spiritTags: ['非遗与民俗', '城市文脉'],
    storySeed: '从工艺流程理解非遗传承中的“人-技-场”关系。',
    taskTemplate: '记录一项技艺步骤，并写出其教学可行性。',
    photoHint: '拍摄工艺材料与操作动作细节。',
    duration: 45,
    image: '/points/hanxiu.jpg',
    lat: 30.5859,
    lng: 114.2910,
    recommendReason: '补足“活态非遗”维度，适合赛道展示。',
    knowledgeHighlights: ['汉绣工艺流程', '非遗传承机制', '公众参与式教育'],
  },
];

export const tasks: Task[] = cityPoints.map((point, index) => ({
  id: `task_${point.id}`,
  pointId: point.id,
  title: point.taskTemplate,
  type: index % 3 === 0 ? '观察任务' : index % 3 === 1 ? '文化问答' : '田野记录',
  difficulty: ((index % 5) + 1) as 1 | 2 | 3 | 4 | 5,
  triggerCondition: `到达${point.name}并完成至少1次现场观察记录`,
  bondEffect: `“${point.spiritTags[0]}”相关学习画像提升`,
  successResult: `你已完成“${point.name}”节点研学任务，系统已记录你的观察要点。`,
}));

export const routeTypes: RouteType[] = [
  {
    id: 'route_hz_half',
    cityId: 'hangzhou',
    name: '宋韵入门线',
    subtitle: '半日研学：从文明起源到城市街区',
    desc: '适合首次体验，快速建立杭州历史文化认知框架。',
    spiritFocus: '城市文脉',
    duration: 'half',
    color: '#2D5A5A',
    points: ['hz_1', 'hz_2', 'hz_3'],
    learningGoal: '理解杭州从史前文明到宋韵街区的基本演化脉络。',
  },
  {
    id: 'route_hz_full',
    cityId: 'hangzhou',
    name: '人物与城市线',
    subtitle: '一日研学：人物记忆与空间叙事',
    desc: '兼顾历史人物教育与城市公共记忆。',
    spiritFocus: '历史人物',
    duration: 'full',
    color: '#C04851',
    points: ['hz_4', 'hz_1', 'hz_2', 'hz_5'],
    learningGoal: '掌握人物记忆如何在城市空间中被持续建构。',
  },
  {
    id: 'route_hz_two',
    cityId: 'hangzhou',
    name: '杭州文脉深描线',
    subtitle: '两日研学：遗产保护与城市更新',
    desc: '覆盖5个节点，适合比赛演示完整学习闭环。',
    spiritFocus: '城市记忆与更新',
    duration: 'two',
    color: '#789B73',
    points: ['hz_1', 'hz_2', 'hz_4', 'hz_3', 'hz_5'],
    learningGoal: '形成“历史证据-文化理解-更新思考”的完整能力链。',
  },

  {
    id: 'route_cd_half',
    cityId: 'chengdu',
    name: '古蜀速览线',
    subtitle: '半日研学：人物与遗址双线并读',
    desc: '聚焦成都核心历史符号，效率高。',
    spiritFocus: '历史人物',
    duration: 'half',
    color: '#C4A35A',
    points: ['cd_1', 'cd_2', 'cd_3'],
    learningGoal: '在短时间内理解成都历史叙事主轴。',
  },
  {
    id: 'route_cd_full',
    cityId: 'chengdu',
    name: '巴蜀文化线',
    subtitle: '一日研学：博物馆到街区的文化转译',
    desc: '适合展示“知识讲解+场景体验”组合能力。',
    spiritFocus: '非遗与民俗',
    duration: 'full',
    color: '#4FC3F7',
    points: ['cd_3', 'cd_5', 'cd_4', 'cd_2'],
    learningGoal: '理解巴蜀文明如何在当代城市中被继续讲述。',
  },
  {
    id: 'route_cd_two',
    cityId: 'chengdu',
    name: '成都文脉全景线',
    subtitle: '两日研学：从古蜀遗址到当代街区',
    desc: '覆盖成都典型研学点位，答辩可展示完整样板。',
    spiritFocus: '城市文脉',
    duration: 'two',
    color: '#2D5A5A',
    points: ['cd_5', 'cd_3', 'cd_1', 'cd_2', 'cd_4'],
    learningGoal: '建立成都历史文化系统认知并完成案例输出。',
  },

  {
    id: 'route_cs_half',
    cityId: 'changsha',
    name: '书院城市线',
    subtitle: '半日研学：教育传统与城市精神',
    desc: '以岳麓书院为核心，串联城市记忆点。',
    spiritFocus: '城市文脉',
    duration: 'half',
    color: '#2D5A5A',
    points: ['cs_1', 'cs_3', 'cs_4'],
    learningGoal: '理解长沙教育传统与城市精神之间的关系。',
  },
  {
    id: 'route_cs_full',
    cityId: 'changsha',
    name: '湖湘文化线',
    subtitle: '一日研学：文物证据与生活民俗并行',
    desc: '强调“博物馆知识”与“街区民俗”的结合。',
    spiritFocus: '博物馆与展陈',
    duration: 'full',
    color: '#C4A35A',
    points: ['cs_2', 'cs_1', 'cs_5', 'cs_3'],
    learningGoal: '完成一份兼具文献证据与生活观察的研学记录。',
  },
  {
    id: 'route_cs_two',
    cityId: 'changsha',
    name: '长沙深度研学线',
    subtitle: '两日研学：教育、记忆与更新三维联动',
    desc: '适合比赛展示“问题意识+证据链”。',
    spiritFocus: '城市记忆与更新',
    duration: 'two',
    color: '#789B73',
    points: ['cs_1', 'cs_2', 'cs_4', 'cs_3', 'cs_5'],
    learningGoal: '形成长沙历史文化“深描式”理解框架。',
  },

  {
    id: 'route_xa_half',
    cityId: 'xian',
    name: '长安遗址线',
    subtitle: '半日研学：遗址与文献双证',
    desc: '聚焦西安最具辨识度的历史证据。',
    spiritFocus: '建筑与遗址',
    duration: 'half',
    color: '#789B73',
    points: ['xa_1', 'xa_2', 'xa_3'],
    learningGoal: '掌握西安历史研究中的“遗址+文献”方法。',
  },
  {
    id: 'route_xa_full',
    cityId: 'xian',
    name: '多元长安线',
    subtitle: '一日研学：都城记忆与民俗融合',
    desc: '从宫城到街区，理解长安的多元文化。',
    spiritFocus: '非遗与民俗',
    duration: 'full',
    color: '#4FC3F7',
    points: ['xa_5', 'xa_3', 'xa_4', 'xa_2'],
    learningGoal: '理解古都叙事如何在当代城市中多元展开。',
  },
  {
    id: 'route_xa_two',
    cityId: 'xian',
    name: '西安全景文脉线',
    subtitle: '两日研学：都城体系与城市更新',
    desc: '覆盖西安关键点位，适合作为比赛完整样例。',
    spiritFocus: '城市文脉',
    duration: 'two',
    color: '#C04851',
    points: ['xa_1', 'xa_2', 'xa_5', 'xa_3', 'xa_4'],
    learningGoal: '形成可用于课堂讲解的西安城市文化知识图谱。',
  },

  {
    id: 'route_wh_half',
    cityId: 'wuhan',
    name: '两江记忆线',
    subtitle: '半日研学：地标与近代记忆',
    desc: '快速认识武汉城市历史关键节点。',
    spiritFocus: '历史人物',
    duration: 'half',
    color: '#C04851',
    points: ['wh_1', 'wh_3', 'wh_2'],
    learningGoal: '掌握武汉近代历史与城市认同的核心线索。',
  },
  {
    id: 'route_wh_full',
    cityId: 'wuhan',
    name: '城市更新观察线',
    subtitle: '一日研学：街区更新与非遗活化',
    desc: '以现场观察为主，适合项目演示互动环节。',
    spiritFocus: '城市记忆与更新',
    duration: 'full',
    color: '#789B73',
    points: ['wh_4', 'wh_1', 'wh_5', 'wh_2'],
    learningGoal: '建立“更新策略-文化传承-公众参与”分析框架。',
  },
  {
    id: 'route_wh_two',
    cityId: 'wuhan',
    name: '武汉文脉纵深线',
    subtitle: '两日研学：近代转型与文化教育实践',
    desc: '兼顾历史事件、博物馆与活态非遗，完成完整学习闭环。',
    spiritFocus: '博物馆与展陈',
    duration: 'two',
    color: '#C4A35A',
    points: ['wh_3', 'wh_1', 'wh_2', 'wh_4', 'wh_5'],
    learningGoal: '输出一份可用于课堂展示的武汉文化研学报告。',
  },
];

export const sampleReports: BattleReport[] = [
  {
    id: 'report_hz',
    cityId: 'hangzhou',
    spiritFocus: '城市文脉',
    title: '杭州城市文脉研学报告',
    summary: '你从良渚文明出发，经过灵隐遗址与河坊街，最终在运河历史街区完成了“历史证据到城市更新”的连续观察。',
    keywords: ['良渚文明', '宋韵', '遗产活化', '城市更新'],
    highlights: ['构建了杭州历史演化时间线', '完成至少3处现场观察记录', '形成了“保护与利用”对照分析'],
    bondResult: '你在“城市文脉”与“建筑遗址”维度表现突出。',
    finalTitle: '文脉观察者',
    posterCopy: '看见一座城，不止看见风景，更看见时间。',
    personality: '你擅长从空间结构读历史，适合做城市文化讲解与课程设计。',
    nextSteps: ['补充一份运河更新案例对比', '将观察笔记整理为课堂讲义', '加入一段3分钟口头讲解视频'],
  },
  {
    id: 'report_cd',
    cityId: 'chengdu',
    spiritFocus: '历史人物',
    title: '成都人物文化研学报告',
    summary: '你在武侯祠与杜甫草堂建立人物叙事主线，并用金沙遗址与四川博物院完成历史证据支撑。',
    keywords: ['三国人物', '诗史', '古蜀文明', '展陈叙事'],
    highlights: ['完成了人物记忆与时代背景关联图', '在博物馆节点建立证据链', '输出了可复述的城市讲解提纲'],
    bondResult: '你在“历史人物”与“博物馆展陈”维度表现均衡。',
    finalTitle: '人物叙事者',
    posterCopy: '理解人物，才能真正理解时代。',
    personality: '你擅长把历史故事讲得清楚又有温度，适合做公众讲解。',
    nextSteps: ['补充一页“人物记忆的地方性表达”', '增加街区观察照片注释', '准备一段答辩问答示例'],
  },
  {
    id: 'report_cs',
    cityId: 'changsha',
    spiritFocus: '博物馆与展陈',
    title: '长沙教育文化研学报告',
    summary: '你以岳麓书院为教育主轴，结合湖南博物院与城市地标，完成了“教育传统—公共文化—城市记忆”的三维分析。',
    keywords: ['书院传统', '湖湘文化', '公共记忆', '在地教育'],
    highlights: ['完成书院精神当代表达', '形成文物讲解提纲', '建立教育场景化应用建议'],
    bondResult: '你在“教育文化”主题上具备较强整合能力。',
    finalTitle: '教育文化策划者',
    posterCopy: '把知识带到现场，让现场成为课堂。',
    personality: '你善于把历史内容转化为教学活动，适合教育赛道。',
    nextSteps: ['完善学生任务单模板', '补充课堂活动设计', '形成可复制的线路标准化方案'],
  },
  {
    id: 'report_xa',
    cityId: 'xian',
    spiritFocus: '建筑与遗址',
    title: '西安遗址研学报告',
    summary: '你通过兵马俑、碑林、大明宫等节点构建了“都城制度—文化文献—遗址保护”的完整学习链。',
    keywords: ['都城体系', '遗址保护', '碑刻文献', '城市更新'],
    highlights: ['完成遗址观察与文献互证', '识别多处历史元素再设计', '输出保护与利用评估'],
    bondResult: '你在“遗址解读”与“城市更新思考”维度得分较高。',
    finalTitle: '遗址研究员',
    posterCopy: '遗址不是过去的终点，而是理解当下的起点。',
    personality: '你重视证据与结构，适合做高质量学术型展示。',
    nextSteps: ['补充一份保护策略国际对比', '完善点位坐标与路线时长说明', '准备答辩中的方法论阐释'],
  },
  {
    id: 'report_wh',
    cityId: 'wuhan',
    spiritFocus: '城市记忆与更新',
    title: '武汉城市记忆研学报告',
    summary: '你在黄鹤楼、辛亥纪念馆、昙华林等场景中，完成了“地标记忆—历史事件—更新实践”的综合分析。',
    keywords: ['两江文化', '近代转型', '街区更新', '活态非遗'],
    highlights: ['完成城市记忆关键词提炼', '完成更新案例观察记录', '形成非遗教育应用建议'],
    bondResult: '你在“城市记忆与更新”维度形成了清晰的问题意识。',
    finalTitle: '城市记忆梳理者',
    posterCopy: '记忆被看见，城市就有了面向未来的方向。',
    personality: '你擅长从历史与现实交界处提出问题，适合做创新型答辩。',
    nextSteps: ['补充社区访谈证据', '完善非遗活态传承案例', '制作答辩用数据可视化页'],
  },
];

export const sampleChat: ChatMessage[] = [
  {
    id: 'm1',
    role: 'assistant',
    content: '你好，我是城迹研学助手。告诉我你的城市、时长和兴趣方向，我会为你生成可执行的历史文化研学路线。',
  },
  {
    id: 'm2',
    role: 'user',
    content: '我在杭州，今天有一天时间，想重点看城市文脉。',
  },
  {
    id: 'm3',
    role: 'assistant',
    content: '明白了。我建议你采用“一日研学线”，从良渚博物院建立历史框架，再进入灵隐与运河片区做现场观察，最后回到街区完成文化转译记录。',
  },
];
