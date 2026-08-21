# 机器协作目录

- `project.json`：项目事实、必读文件和验证命令。
- `workstreams.json`：工作流、文档和路径所有权。
- `task-board.json`：协调者维护的任务状态与依赖。
- `claims/`：参与者开始任务前创建的短期认领文件。

普通开发者不要直接修改任务板来宣称完成；提交交接文件后由协调者更新，避免不同对话同时写同一个 JSON。

运行 `powershell -ExecutionPolicy Bypass -File scripts/validate-development-governance.ps1` 检查这套治理文件。
