# 城迹后端

## 启动

```bash
cd E:\青衫竞渡\backend
copy .env.example .env
npm install
npm run dev
```

默认地址：`http://localhost:3000`

## 核心接口

- `GET /health`
- `POST /api/ai/chat`
- `POST /api/ai/knowledge`
- `POST /api/ai/route`

## 模型供应商切换

通过 `AI_PROVIDER` 控制：

- `aliyun`：优先走阿里云 DashScope（Qwen）
- `tencent`：走腾讯混元
- `auto`：先尝试阿里云，再尝试腾讯云

## 环境变量

见 `.env.example`。

如果没有配置有效密钥，系统会自动回退 `mock`，便于演示和联调。
