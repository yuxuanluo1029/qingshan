# 城迹前端

## 启动

```bash
cd E:\青衫竞渡\frontend
cp .env.example .env
npm install
npm run dev
```

默认地址：`http://localhost:5173`

## 环境变量

- `VITE_TENCENT_MAP_KEY`：腾讯地图前端 Key
- `VITE_API_PROXY_TARGET`：本地开发代理目标（默认 `http://localhost:3000`）
- `VITE_API_BASE_URL`：前后端分域部署时使用（可选）

## 构建

```bash
npm run build
```

## 说明

前端负责：
- 城市研学设置
- AI 导师对话
- 腾讯地图点位展示
- 节点任务与学习报告
