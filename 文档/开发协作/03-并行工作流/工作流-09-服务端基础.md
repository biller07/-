# WS-09 服务端基础

- 目标：建立 TypeScript Node.js 服务骨架、配置、健康检查、数据库连接和迁移机制。
- 拥有：`package.json`、`tsconfig.json`、`src/server/core/**`、`src/server/database/**`。
- 依赖：WS-00 契约；可与前端模块化和 QA 基线并行。
- 不拥有：具体账号、订单、聊天、文件或支付业务。
- 交付：开发/测试启动命令、配置校验、结构化日志、SQLite 开发数据库、PostgreSQL 兼容迁移约定。
- 验收：全新目录可启动；迁移可重复；健康检查和优雅关闭测试通过；无密钥进入仓库。
