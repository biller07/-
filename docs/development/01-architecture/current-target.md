# 当前架构与目标架构

## 当前原型

```text
index.html + styles.css + app.js
          │
          ├─ localStorage：账号、需求、报名、消息、订单和模拟资金
          ├─ Canvas：演示二维码
          └─ server.py：零依赖静态文件服务
```

优点是可立即演示，缺点是没有真实多用户、权限、并发控制、可靠数据和文件存储。`app.js` 同时承担领域、数据和界面，是当前并行开发的主要阻塞点。

## 目标：模块化单体优先

```text
src/client/  响应式 Web/PWA
      │ HTTPS REST + WebSocket
src/server/  Node.js TypeScript 模块化单体
      ├─ auth        账号、会话、实名认证状态
      ├─ tasks       需求、报名、选人、订单状态机
      ├─ chat        订单消息与通知事件
      ├─ delivery    文件、版本、验收
      ├─ moderation  内容审核与禁售规则
      └─ settlement  仅演示记录；真实支付保持关闭
      │
PostgreSQL/SQLite + S3 兼容对象存储 + 可选 Redis
```

先采用模块化单体而非微服务：当前团队和业务规模更需要一致事务、简单部署和快速验证。模块边界稳定、吞吐或组织规模确有需求后再拆服务。

## 迁移顺序

1. 从 `app.js` 提取共享类型、状态和纯函数测试，不改变现有体验。
2. 建立 `src/server/`、数据库迁移和健康检查。
3. 将账号、需求、报名/选人迁到服务端；前端保留演示适配器用于离线展示。
4. 迁移订单消息与交付。
5. 增加审核、通知、部署和运维能力。
6. 支付合规决策完成前，不实现真实资金账户。

## 环境

- `local-demo`：现有本地演示，无真实交易。
- `development`：SQLite、本地文件、测试账号。
- `staging`：PostgreSQL、对象存储沙箱、脱敏数据。
- `production`：只有通过安全、合规、备份和恢复验收后才能启用。
