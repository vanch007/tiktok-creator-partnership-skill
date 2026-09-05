# TikTok Creator Partnership Skill

面向 TikTok Shop 达人合作的 Codex 技能，覆盖达人匹配分析、一对一建联、合作推进、样品邀请与合规边界。

## 当前能力

- 通过 TikTok Shop Affiliate 当前店铺后台按精确账号分析达人；
- 将 Kalodata 作为可选补充数据源，而非强制依赖；
- 保留数据来源、统计窗口、缺失值、显式零值及跨来源冲突；
- 输出匹配等级、分数、证据覆盖率、置信度、冲突和下一步动作；
- 提供 SHENTAI Malaysia 合作话术、权益、样品流程与回归评测。

## 使用

将本仓库目录放入 Codex 技能目录，并通过 `tiktok-creator-partnership` 调用。入口与路由规则见 [`SKILL.md`](SKILL.md)。

运行匹配分析回归：

```bash
node scripts/test_creator_fit.mjs
```

对 JSON 输入执行分析：

```bash
node scripts/analyze_creator_fit.mjs --input path/to/input.json
```

## 数据与权限

仓库包含真实达人字段测试样例与 SHENTAI 合作口径，现按仓库所有者要求公开。分析结果只是决策辅助，不代表已授权发送消息、发起邀请或批准样品；后续提交前仍需检查凭证与敏感信息。
