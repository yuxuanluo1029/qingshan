export interface ImmersiveScene {
  id: string;
  city: string;
  title: string;
  image: string;
  panorama: string;
  summary: string;
  guide: string;
  source: string;
  sourceUrl: string;
}

export const immersiveScenes: ImmersiveScene[] = [
  {
    id: 'scene-hz',
    city: '杭州',
    title: '西湖360实景',
    image: '/assets/panorama/hangzhou-westlake-cover.jpg',
    panorama: '/assets/panorama/hangzhou-westlake-360.jpg',
    summary: '以西湖主景面为核心，连续呈现湖岸、亭桥与远山层次。',
    guide: '先看湖面开阔关系，再看岸线建筑与植被边界，最后总结“山水入城”的空间特征。',
    source: '360schools: West Lake, Hangzhou, Zhejiang, China',
    sourceUrl: 'https://schools.360cities.net/image/west-lake-hangzhou-zhejiang-china',
  },
  {
    id: 'scene-cd',
    city: '成都',
    title: '三星堆青铜面具展区360实景',
    image: '/assets/panorama/chengdu-sanxingdui-mask-cover.jpg',
    panorama: '/assets/panorama/chengdu-sanxingdui-mask-360.jpg',
    summary: '实景对准三星堆博物馆青铜面具展区，可观察展柜与观众视线组织。',
    guide: '先识别主文物位置，再看观展流线，最后记录“单件文物如何形成空间焦点”。',
    source: '360schools: Bronze Masks, Sanxingdui Museum, Chengdu',
    sourceUrl: 'https://schools.360cities.net/image/bronze-masks-sanxingdui-museum-sichuan-cn-chengdu',
  },
  {
    id: 'scene-cs',
    city: '长沙',
    title: '岳麓书院360实景',
    image: '/assets/panorama/changsha-yuelu-academy-cover.jpg',
    panorama: '/assets/panorama/changsha-yuelu-academy-360.jpg',
    summary: '以岳麓书院院落空间为主，能够连续观察讲学建筑与庭院秩序。',
    guide: '建议先识别中轴，再看廊道与院落关系，最后提炼书院空间如何服务教育活动。',
    source: '360schools: Changsha Yuelu Academy',
    sourceUrl: 'https://schools.360cities.net/image/changsha-yuelu-academy-1-hunan',
  },
  {
    id: 'scene-xa',
    city: '西安',
    title: '兵马俑展区360实景',
    image: '/assets/panorama/xian-terracotta-warriors-cover.jpg',
    panorama: '/assets/panorama/xian-terracotta-warriors-360.jpg',
    summary: '围绕兵马俑坑主体空间展开，适合观察军阵布局与观展尺度。',
    guide: '先看俑坑整体网格，再看不同兵俑分布，最后总结“军阵秩序”如何被展陈强化。',
    source: "360schools: Terracotta Warriors and Horses, Lintong, Xi'an",
    sourceUrl: 'https://schools.360cities.net/image/terracotta-warriors-and-horses-lintong-xian',
  },
  {
    id: 'scene-wh',
    city: '武汉',
    title: '黄鹤楼360实景',
    image: '/assets/panorama/wuhan-huanghelou-cover.jpg',
    panorama: '/assets/panorama/wuhan-huanghelou-360.jpg',
    summary: '以黄鹤楼高点视角为主，展现古建体量与城市江景关系。',
    guide: '先看楼体主轮廓，再观察周边城市界面，最后提炼“地标-城市认同”关系。',
    source: '360schools: Yellow Crane Tower, Wuhan',
    sourceUrl: 'https://schools.360cities.net/image/huanghelou-wuhan-hubei',
  },
];
