# API 契约规则 v1

## 约定

- 基础路径：`/api/v1`；JSON 使用 `camelCase`。
- 响应成功：`{ "data": ..., "meta": ... }`。
- 响应失败：`{ "error": { "code": "...", "message": "...", "details": ... } }`。
- 写操作需要会话、CSRF/同源保护（按认证方案）、输入校验和 `Idempotency-Key`（适用时）。
- 状态写操作携带 `expectedVersion`；冲突返回 HTTP 409 和当前版本。
- 分页使用稳定游标，不以可变页码作为长期契约。

## 第一批稳定资源

| 方法与路径 | 用途 | 所属工作流 |
|---|---|---|
| `POST /auth/sessions` | 登录并创建会话 | WS-02 |
| `GET /me` | 当前用户 | WS-02 |
| `GET /tasks` | 搜索开放需求 | WS-03 |
| `POST /tasks` | 发布需求 | WS-03 |
| `GET /tasks/:id` | 需求详情 | WS-03 |
| `POST /tasks/:id/applications` | 创建初版报名 | WS-03 |
| `PATCH /applications/:id` | 修改/撤回报名 | WS-03 |
| `POST /tasks/:id/select-application` | 事务性选人 | WS-03 |
| `GET /orders/:id/messages` | 读取订单消息 | WS-04 |
| `POST /orders/:id/messages` | 发送订单消息 | WS-04 |
| `POST /orders/:id/deliveries` | 提交交付版本 | WS-06 |
| `POST /orders/:id/acceptance` | 验收或退回 | WS-06 |

## 禁止事项

- 不暴露连续数据库主键、密码散列、内部对象存储路径或其他用户私有资料。
- 不允许客户端提交任意 `status` 字段；使用动作型端点触发状态迁移。
- 不在同一路径静默改变金额单位、时间格式或错误结构。
- 支付相关端点在 ADR 批准前不得加入稳定 API。

## 契约变更

先修改 OpenAPI/共享类型草案并通过契约测试，再实现服务端和客户端。破坏性变化进入新版本或提供明确迁移期。
