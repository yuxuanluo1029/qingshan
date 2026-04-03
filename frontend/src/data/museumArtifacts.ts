export interface MuseumArtifact {
  id: string;
  name: string;
  city: string;
  era: string;
  preview: string;
  embedUrl: string;
  sourceName: string;
  sourceUrl: string;
  headline: string;
  detail: string;
  aiPrompt: string;
}

export const museumArtifacts: MuseumArtifact[] = [
  {
    id: 'artifact-hz-yucong',
    name: '杭州·良渚玉琮（五城文物）',
    city: '杭州',
    era: '新石器时代晚期',
    preview: '/assets/museum/hangzhou-jade-cong.jpg',
    embedUrl: 'https://sketchfab.com/models/89d8be26f5524876b887e5509641e64b/embed?preload=1&ui_theme=dark&ui_hint=2',
    sourceName: 'Sketchfab · Jade Cong (tube)',
    sourceUrl: 'https://sketchfab.com/3d-models/jade-cong-tube-89d8be26f5524876b887e5509641e64b',
    headline: '杭州良渚文化代表器物，聚焦“神权-礼制-玉礼器”脉络。',
    detail:
      '良渚玉琮是长江下游早期文明的重要礼仪器。建议观察外方内圆结构、纹饰节段与转角处理，再联系杭州良渚遗址所呈现的等级制度与祭祀空间。',
    aiPrompt: '请用“器物结构-礼制功能-文明意义”三段式讲解良渚玉琮。',
  },
  {
    id: 'artifact-cd-mask',
    name: '成都·三星堆青铜面具（五城文物）',
    city: '成都',
    era: '商周时期',
    preview: '/assets/museum/chengdu-sanxingdui-mask.jpg',
    embedUrl: 'https://sketchfab.com/models/b6d6b7c1f9624e278fec6c7a3f3caf20/embed?preload=1&ui_theme=dark&ui_hint=2',
    sourceName: 'Sketchfab · Sanxingdui Mask 01',
    sourceUrl: 'https://sketchfab.com/3d-models/sanxingdui-mask-01-b6d6b7c1f9624e278fec6c7a3f3caf20',
    headline: '成都三星堆核心文物类型，体现古蜀文明独特审美与宗教表达。',
    detail:
      '青铜面具以夸张五官和强烈造型著称。可重点观察眼部、鼻梁和耳部比例关系，思考其在祭祀、权力象征与古蜀神话叙事中的作用。',
    aiPrompt: '请从“造型语言-祭祀功能-古蜀文明”三方面讲解三星堆青铜面具。',
  },
  {
    id: 'artifact-cs-mawangdui',
    name: '长沙·马王堆漆奁（五城文物）',
    city: '长沙',
    era: '西汉时期',
    preview: '/assets/museum/changsha-lacquer-box.jpg',
    embedUrl: 'https://sketchfab.com/models/514c8a58620e4466b23d5d4b753e753c/embed?preload=1&ui_theme=dark&ui_hint=2',
    sourceName: 'Sketchfab · Lacquer Box for Combs',
    sourceUrl: 'https://sketchfab.com/3d-models/lacquer-box-for-combs-514c8a58620e4466b23d5d4b753e753c',
    headline: '长沙马王堆汉墓体系中的漆器代表，体现汉代生活与工艺高度。',
    detail:
      '马王堆漆器以胎体轻薄、漆层细腻和纹饰讲究见长。建议观察盖盒咬合、边缘转折和表面涂层，理解汉代手工业体系与贵族生活场景。',
    aiPrompt: '请用“材料工艺-墓葬文化-汉代生活”框架讲解马王堆漆器。',
  },
  {
    id: 'artifact-xa-archer',
    name: '西安·秦兵马俑跪射俑（五城文物）',
    city: '西安',
    era: '秦代',
    preview: '/assets/museum/xian-terracotta-archer.jpg',
    embedUrl: 'https://sketchfab.com/models/ca4082fc248641daa1c2b039e18ab8a3/embed?preload=1&ui_theme=dark&ui_hint=2',
    sourceName: 'Sketchfab · Terracotta Archer',
    sourceUrl: 'https://sketchfab.com/3d-models/terracotta-archer-ca4082fc248641daa1c2b039e18ab8a3',
    headline: '西安秦始皇帝陵兵马俑体系中的经典兵种形象。',
    detail:
      '跪射俑展现了秦军远程兵种的标准姿态与装备逻辑。可重点观察下肢重心、上身扭转与盔甲结构，理解秦军组织化训练与帝国军政体系。',
    aiPrompt: '请从“兵种战术-雕塑写实-帝国秩序”讲解秦兵马俑跪射俑。',
  },
  {
    id: 'artifact-wh-zunpan',
    name: '武汉·曾侯乙尊盘（五城文物）',
    city: '武汉',
    era: '战国早期',
    preview: '/assets/museum/wuhan-zeng-houyi-zunpan.jpg',
    embedUrl: 'https://sketchfab.com/models/e130c7ee2c1f4eb8b95756832bbf9a3e/embed?preload=1&ui_theme=dark&ui_hint=2',
    sourceName: 'Sketchfab · Bronze - Zeng Houyi Zun Plate',
    sourceUrl: 'https://sketchfab.com/3d-models/bronze-zeng-houyi-zun-plate-e130c7ee2c1f4eb8b95756832bbf9a3e',
    headline: '武汉（湖北）礼乐文明标志性青铜器组合，工艺复杂度极高。',
    detail:
      '尊盘为尊与盘的复合青铜礼器，纹饰繁缛且铸造难度高。建议观察镂空结构、附饰组织与整体重心，理解楚文化工艺审美和礼乐制度。',
    aiPrompt: '请按“器物结构-楚文化特征-礼乐制度”讲解曾侯乙尊盘。',
  },
];
