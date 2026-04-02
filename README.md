# 城迹（Chengji）

“城迹”是一个面向**人工智能实践赛（智能教育与文化方向）**的城市历史文化研学智能体。

项目以“历史 + 文化 + 城市”为主线，提供：
- AI 导师对话与知识问答
- 城市研学路线生成
- 腾讯地图点位展示与导航辅助
- 现场观察任务与学习反馈报告

## 1. 项目定位

- 作品类型：人工智能实践赛完整作品（方案 + 代码 + 文档 + 演示）
- 应用场景：城市历史文化研学、课程实践、文博教育活动
- 核心目标：把城市出行转化为可讲解、可复盘、可展示的学习过程

## 2. 技术架构

- 前端：React + TypeScript + Vite + Tailwind + Framer Motion
- 地图：腾讯地图 JavaScript GL + WebService 封装
- 后端：Node.js + Express
- 大模型：腾讯混元（服务端调用，支持无密钥 mock 回退）

目录结构：

```text
E:\青衫竞渡
├─ frontend                # 前端应用
│  ├─ src
│  ├─ .env.example
│  └─ vercel.json
├─ backend                 # 后端服务
│  ├─ src/index.js
│  ├─ .env.example
│  └─ render.yaml
└─ docs                    # 比赛文档
```

## 3. 主要能力

1. 城市与研学参数设置：城市、时长、兴趣标签、学习偏好
2. AI 导师对话：路线建议、讲解提纲、现场问题解答
3. 研学路线页面：点位顺序、时长、学习目标、推荐理由
4. 节点详情页面：历史简介、知识亮点、观察任务、拍照建议、地图定位
5. 学习画像与研学报告：学习收获、关键词、后续建议

## 4. 本地运行

前置要求：
- Node.js 18+
- npm 9+

### 4.1 启动后端

```bash
cd E:\青衫竞渡\backend
cp .env.example .env
npm install
npm run dev
```

默认端口：`http://localhost:3000`

### 4.2 启动前端

```bash
cd E:\青衫竞渡\frontend
cp .env.example .env
npm install
npm run dev
```

默认端口：`http://localhost:5173`

### 4.3 前端环境变量说明

- `VITE_TENCENT_MAP_KEY`：腾讯地图前端 Key（需配置域名白名单）
- `VITE_API_PROXY_TARGET`：本地开发代理目标，默认 `http://localhost:3000`
- `VITE_API_BASE_URL`：前后端分域部署时填写后端域名（可选）

## 5. 后端环境变量说明

在 `backend/.env` 中配置：

- `PORT`：后端端口（默认 3000）
- `CORS_ORIGIN`：允许访问的前端域名
- `TENCENT_SECRET_ID`：腾讯云密钥 ID
- `TENCENT_SECRET_KEY`：腾讯云密钥 Key
- `TENCENT_HUNYUAN_REGION`：混元区域（默认 `ap-guangzhou`）
- `TENCENT_HUNYUAN_MODEL`：混元模型名（默认 `hunyuan-turbos-latest`）

说明：未配置混元密钥时，系统自动走 mock 回退，确保演示可运行。

## 6. API 列表

- `GET /health`
- `POST /api/ai/chat`
- `POST /api/ai/knowledge`
- `POST /api/ai/route`

## 7. 部署

推荐：
- 前端部署到 Vercel（`frontend/vercel.json`）
- 后端部署到 Render（`backend/render.yaml`）

详细步骤见：[docs/部署说明.md](./docs/部署说明.md)

## 8. 比赛文档

- [方案设计](./docs/方案设计.md)
- [用户手册](./docs/用户手册.md)
- [部署说明](./docs/部署说明.md)
- [演示脚本](./docs/演示脚本.md)
- [答辩Q&A](./docs/答辩Q&A.md)
