# 任务认领文件

开始开发前新增 `CLAIM-<taskId>-<actor>.json`，示例：

```json
{
  "schemaVersion": 1,
  "taskId": "T-101",
  "actor": "conversation-frontend-a",
  "status": "in_progress",
  "startedAt": "2026-08-21T12:00:00Z",
  "expiresAt": "2026-08-22T12:00:00Z",
  "ownedPaths": ["app.js", "index.html", "styles.css", "src/client/**"],
  "notes": "保持现有E2E流程不变"
}
```

规则：

- `taskId` 必须存在且状态为 `ready`；
- `ownedPaths` 必须是任务卡路径的子集；
- 同一任务只能有一个未过期的 `in_progress` 认领；
- 默认有效期不超过 24 小时；
- 完成交接后由协调者删除认领并更新任务板；
- 不要修改别人的认领文件。
