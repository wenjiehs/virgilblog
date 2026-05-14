---
title: 竞品采集 → 自动研发：我用 Agent 流水线打通了从"发现"到"落地"
date: 2026-05-14
tags: [AI编程, 产品实践, 工作流自动化, 竞品分析]
description: 记录如何用 Multica Agent 搭建一条从竞品功能采集到自动创建 Issue、自动研发的全自动流水线，并拆解背后的项目实现。
---

# 竞品采集 → 自动研发：我用 Agent 流水线打通了从"发现"到"落地"

## 🤔 为什么要做这件事

做容器产品的人大概都有过这种焦虑：海外某个云厂商又发了个新 API、另一家悄悄多了个参数、第三家在 Release Notes 里塞了个大功能——等你刷到的时候，可能已经过去两周了。

之前我搞过一个[竞品雷达知识库](/posts/2026/competitive-researcher-agent-build)，能定期采集竞品信息并归档。但有个问题：**报告生成之后，还是靠人去看、去判断、去手动创建需求**。

信息到行动之间，断了一截。

我的想法很简单：**能不能让 Agent 采集完竞品变化后，自动把有价值的发现变成研发 Issue，然后自动流转到研发流水线？** 从"发现"到"动手"，中间不需要人工搬运。

---

## 🎯 现有的能力盘点

动手之前先盘了一下我工作区里已有的东西：

**已有的研发流水线**（同事搭好的）：

| Agent | 职责 |
|-------|------|
| PM Agent | 监控 `multica:auto` 标签，自动分配任务 |
| Plan Agent | 输出最小改动实现方案 |
| Coding Agent | 编码实现，提 MR |
| Review Agent | 审查代码，合并后推 done |

这条流水线的入口很清晰：**只要 Issue 打上 `multica:auto` 标签，PM Agent 就会自动接管**。

所以我要做的就是：让竞品采集的输出能"接上"这个入口。

---

## 🛠️ 实际动手过程

### 第一步：创建竞品采集 Agent

先用管家（我的工作区管理 Agent）创建了一个新 Agent：

- **名称**：竞品功能更新订阅
- **Runtime**：一台带完整工具链的机器
- **核心设计**："目标驱动自主采集"模式

Agent 的指令里我特别强调了几点：

```
重要原则：项目内脚本只是可选加速器；如果脚本缺失、运行失败、
环境不兼容或 Runtime 不允许执行脚本，不得因此停止任务。
应改用当前 Runtime 可用能力完成同样目标。
```

这是从之前踩坑学到的——你不能指望环境永远完美，Agent 得有"绕路走"的能力。

**采集目标**：六大主流容器服务（覆盖海外、国内主要厂商）。

**来源优先级**：API/OpenAPI > CLI Help > Release Notes > Terraform Provider > 产品介绍页。

### 第二步：设计标签和项目

为了让竞品发现能无缝对接研发流水线，需要想清楚"衔接机制"是什么。

答案其实很简单：**标签**。

已有的 `multica:auto` 就是研发流水线的开关。我只需要再加一个来源标记：

| 标签 | 作用 |
|------|------|
| `source:competitive` | 标记这个 Issue 来自竞品分析（追溯用） |
| `multica:auto` | 触发 PM Agent 自动流转（已有） |

同时建了一个专门的项目"**竞品跟踪**"，把相关 Issue 归在一起，方便看板管理。

### 第三步：让采集 Agent "会创建 Issue"

这是关键一步。在 Agent 的执行流程里加了第 10 步：

> 对报告中 P0/P1 级别的发现，逐条创建 Issue。
>
> - 标题格式：`[竞品][厂商] 功能简述`
> - 打上 `source:competitive` + `multica:auto` 两个标签
> - 优先级：P0 → urgent，P1 → high
> - 归入"竞品跟踪"项目

P2/P3 只记录在周报里，不创建 Issue——避免噪音把流水线淹没。

### 第四步：设置每周自动执行

最后挂了个 Autopilot，每周自动触发一次。它会：

1. 自动创建一个 Issue（标题带日期）
2. 分配给竞品采集 Agent 执行
3. Agent 跑完流程后，有价值的发现变成新 Issue 流入研发

---

## 🎉 最终的流程长这样

```
┌────────────────────────────────────────────────┐
│  竞品功能更新订阅 Agent（每周自动）              │
│                                                │
│  1. git pull 最新仓库                           │
│  2. 采集 6 家竞品的 API/CLI/Release 变化         │
│  3. 生成 reports/YYYY-MM-DD.md                  │
│  4. P0/P1 发现 → 自动创建 Issue                  │
│     标签: source:competitive + multica:auto     │
└───────────────────────┬────────────────────────┘
                        ▼
┌────────────────────────────────────────────────┐
│  PM Agent（监控 multica:auto 标签）              │
│  自动分配给 Plan Agent                          │
└───────────────────────┬────────────────────────┘
                        ▼
┌────────────────────────────────────────────────┐
│  Plan Agent → Coding Agent → Review Agent       │
│  方案 → 编码 → MR → 审查 → 合并                  │
└────────────────────────────────────────────────┘
```

从竞品发布一个新功能，到我们这边的 Issue 被创建、方案被输出、代码被提交——整个链路都是 Agent 在跑。

---

## 🔬 竞品采集到底是怎么实现的

上面讲完了"流水线怎么搭"，但还没讲"竞品采集那一段"具体是怎么做的。这段其实有个完整的项目支撑——只是我没让 Agent 严格依赖它，而是当成一组"可选的加速器"。

整个项目的目录是这样的：

```
.
├── README.md
├── config/
│   └── vendors.yaml                 # 竞品源机器可读配置
├── docs/
│   ├── design.md                    # 总体设计
│   ├── source-registry.md           # 信息源清单
│   ├── taxonomy.md                  # 功能分类体系
│   ├── workflow.md                  # 订阅工作流
│   ├── report-template.md           # 报告模板
│   ├── evidence-template.md         # 证据链模板
│   ├── multica-agent-prompt.md      # Agent Prompt 单一可信源
│   └── ...
├── reports/                         # 周度报告
├── data/
│   └── snapshots/                   # API/CLI/Release 历史快照
└── scripts/                         # 6 个可选辅助脚本
```

这套结构的关键设计是：**配置、规则、报告完全分离，让 Agent 和人都能各取所需**。

### 核心一：vendors.yaml 是竞品的"机读配置"

每个竞品都被结构化成一份配置，包括 API 文档、CLI 工具和命令、Release Notes、Terraform Provider 四个来源：

```yaml
- id: gke
  name: Google Kubernetes Engine
  short_name: GKE
  provider: Google Cloud
  priority: 1
  sources:
    api:
      - name: GKE REST API
        url: https://cloud.google.com/.../docs/reference/rest
    cli:
      tool: gcloud
      commands:
        - gcloud container clusters create --help
        - gcloud container clusters update --help
        - gcloud container node-pools create --help
        ...
    release_notes:
      - name: GKE Release Notes
        url: https://cloud.google.com/.../release-notes
    terraform:
      - name: google_container_cluster
        url: https://registry.terraform.io/.../container_cluster
```

为什么选这四个来源？因为每个来源解决一个不同的问题：

| 来源 | 解决什么问题 |
|------|-------------|
| API/OpenAPI | 这个能力**真的存在**吗 |
| CLI Help | 用户**能用上**吗 |
| Release Notes | **什么时候**发布的、什么阶段（preview/GA） |
| Terraform Provider | 企业能不能**自动化**接入 |

只看一个来源容易被误导——比如某些功能在 API 里有，但还没暴露给 CLI；或者 Release Notes 写了，但 Terraform Provider 还没跟进。**多源交叉验证**才能判断"这个能力到底用户能不能用"。

### 核心二：Snapshot + Diff 的变化检测

每次采集会把所有 CLI Help 输出、API 文档原文存成快照：

```
data/snapshots/
└── <vendor>/<source_type>/<date>/<command_or_url>/
    ├── raw.txt          # 原始输出
    ├── raw.html         # 原始网页
    └── metadata.yaml    # 来源、采集时间、命令
```

下一周采集完，跑个 diff 脚本，就能拿到"本周相对上周的变化"：

```bash
python3 scripts/diff_snapshots.py \
    --previous-date 2026-05-07 \
    --current-date 2026-05-14
```

脚本干的事很简单——逐行 set 比较，分类成几种变化类型：

```python
def infer_change_type(line: str, removed: bool = False) -> str:
    if line.startswith("--"):
        return "removed_parameter" if removed else "new_parameter"
    if line.endswith(":"):
        return "removed_command" if removed else "new_command"
    if line.startswith("{") or line.startswith("["):
        return "enum_changed"
    return "removed_line" if removed else "new_line"
```

输出是一份 normalized changes 列表：哪个竞品、哪个来源、什么类型、新增/移除了什么字段，附带快照文件路径作为证据链。

### 核心三：自动分类 + 影响等级判定

光知道"变化"不够，还得告诉产品经理"这个变化属于什么、要不要紧"。

我把容器服务的能力拆成 15 个分类，每个分类配一组关键词：

```python
CATEGORY_KEYWORDS = {
    "lifecycle":     ["cluster", "upgrade", "version", "autopilot", "auto mode"],
    "nodepool":      ["nodepool", "node group", "kubelet", "runtime"],
    "autoscaling":   ["autoscaler", "karpenter", "serverless", "keda"],
    "ai-gpu":        ["gpu", "nvidia", "rdma", "tpu", "trainium"],
    "networking":    ["cni", "vpc", "ingress", "gateway", "ipv6"],
    "storage":       ["csi", "disk", "volume", "snapshot"],
    "security":      ["oidc", "kms", "secret", "policy", "rbac"],
    "observability": ["logging", "metrics", "tracing", "prometheus"],
    "finops":        ["spot", "cost", "rightsize", "saving"],
    "operations-ai": ["copilot", "agent", "auto repair", "insight"],
    # ... 更多
}
```

影响等级靠优先关键词判定：

```python
def infer_impact(text: str, categories: list[str]) -> str:
    if any(kw in text.lower() for kw in ["auto mode", "autopilot", "copilot"]):
        return "P1"  # 涉及核心新形态，重点关注
    if any(kw in text.lower() for kw in IMPORTANT_KEYWORDS):
        return "P2"
    if categories and categories[0] != "unknown":
        return "P2"
    return "P3"
```

> 这套分类不是"AI 智能判断"，是**显式的关键词规则**。好处是结果可解释、可调优。坏处是新概念出现时要手动补关键词——但这恰好是产品经理该做的事，不是 AI 该做的事。

匹配不上的会自动标 `needs_review`，留给人审核，不强行下结论。

### 核心四：报告模板 + 证据链强制约束

每条进入报告的变化必须满足七个字段：

- 官方来源 URL 或 CLI 命令
- 采集日期
- 变化类型（new_parameter / new_command / enum_changed ...）
- 功能分类（lifecycle / autoscaling / ...）
- 影响等级（P0/P1/P2/P3）
- 可信度判断
- 对自家产品的启发或建议动作

任何一项缺失就标 `needs_review`，不允许"靠感觉写一句"。这条规则是为了**让 AI 没法偷懒糊弄**——之前在文档净化和 PPT 工厂的项目里都吃过 AI 偷懒的亏，约束工程要做在前面。

### 核心五：脚本是"可选加速器"，不是"必选路径"

这是整个项目最重要的设计决策。

`scripts/` 下确实有 6 个 Python 脚本：

```
check_cli_tools.py      # 检测 CLI 工具是否安装
collect_web_sources.py  # 抓官方网页
collect_cli.py          # 跑 CLI Help
diff_snapshots.py       # 算差异
classify_changes.py     # 分类打标
render_report.py        # 生成报告
```

但 Agent 的指令里写得很清楚：

> 项目内脚本只是可选加速器。如果脚本缺失、运行失败、环境不兼容或 Runtime 不允许执行脚本，**不得因此停止任务**。应改用当前 Runtime 可用能力完成同样目标。

为什么这么设计？因为 Multica 的 Hermes Runtime 是云端隔离容器，**根本不一定装了 gcloud / az / aws / kubectl 这些 CLI**。如果硬要求"必须跑脚本采集 CLI Help"，Agent 启动就会卡住。

所以采集策略是分层降级的：

```
理想路径：CLI 工具能跑 → 直接拿 raw output（最权威）
       ↓ 不可用
次优路径：网页能访问 → HTTP 抓官方 API/CLI 文档页面
       ↓ 不可用
兜底路径：用 web_search → 至少把 Release Notes 找到
```

不管走哪条，最终产出都是同一份 `reports/YYYY-MM-DD.md` —— **接口稳定，实现自适应**。

### 单一可信源：multica-agent-prompt.md

最后一个细节：Agent 的所有指令都集中在 `docs/multica-agent-prompt.md` 里，作为**单一可信源**。

我在 Multica 控制台里只配了一句话：

```
你的完整指令请阅读 docs/multica-agent-prompt.md
```

为什么这么做？因为之前踩过一个坑：在 Multica UI 里改 Agent 指令，会把仓库里的版本和实际运行的版本搞分裂——你以为你改了，实际跑的是另一份。

把指令放进 git 仓库后，每次 Agent 启动先 git pull，就能保证"运行的指令永远等于仓库里 commit 过的版本"，并且变更记录可追溯。

---

## 💭 一些设计决策和思考

### 为什么 P2/P3 不自动建 Issue？

一开始想过全自动，后来觉得不行。竞品的功能变化有大有小，如果每个小改动都进流水线，PM Agent 和 Coding Agent 会被淹没。

P0/P1 才是真正需要快速响应的——比如竞品新增了一个我们没有的核心 API、或者上了一个可能影响客户决策的功能。P2/P3 更多是"知道就好"，有空再看。

### 为什么用标签而不是直接指定 Assignee？

标签是**解耦的**。竞品 Agent 不需要知道研发流水线里谁是谁，它只需要打上 `multica:auto`，PM Agent 自然会接管分配逻辑。

这样如果以后研发流程改了（比如换了 Coding Agent、加了 Design Agent），竞品 Agent 完全不用动。

### 为什么要 `source:competitive` 这个来源标签？

追溯用。当一个 Issue 在看板上流转到最后，你能一眼看出它是从竞品分析来的，还是从客户反馈来的，还是从其他需求系统迁移来的。不同来源的 Issue 可能需要不同的验收标准。

### "目标驱动"而非"脚本驱动"

这个设计理念是从之前的教训来的。竞品采集仓库里有 Python 脚本，但 Runtime 环境不一定装了所有依赖。与其让 Agent 因为一个 `pip install` 失败就停下来，不如让它明白：**脚本只是加速器，目标才是核心**。

网页能搜就搜，API 能调就调，CLI 能跑就跑。总之，别停。

---

## 📊 实际搭建耗时

整个过程大概 10 分钟：

| 步骤 | 耗时 |
|------|------|
| 创建竞品采集 Agent | 2 分钟 |
| 分析现有流水线、设计衔接方案 | 3 分钟 |
| 创建标签和项目 | 1 分钟 |
| 更新 Agent 指令 | 2 分钟 |
| 设置 Autopilot | 2 分钟 |

真正耗时的不是操作，是前面想清楚"怎么接"。

---

## 🤔 还能怎么改进

几个后续想做的事：

1. **人工审批环节**：目前 P0/P1 是全自动进流水线的。考虑加一个中间态——Agent 创建 Issue 但不打 `multica:auto`，等人确认后再打标签触发。适合对变化可信度不太确定的场景。

2. **重复检测**：如果连续两周采集到同一个变化（比如某功能 preview 变 GA），应该更新已有 Issue 而不是再建一个。

3. **反向联动**：当研发 Issue 完成后，自动更新竞品报告里的"跟进状态"。形成闭环。

4. **告警升级**：如果某个 P0 发现超过两周没人跟进，自动 @ 产品负责人。

---

## 🎉 小结

回头看，整个流水线分两层：

**底层是一个有 6 个脚本、4 套配置、十几篇规范的项目**——它定义了"什么是合格的竞品采集"。这部分有代码，但代码量不大，主要价值在于**约束**：让数据采集、分类、报告都有标准。

**上层是一条用 Agent + 标签 + Autopilot 串起来的协作流水线**——这层完全没写代码。每个 Agent 各司其职，通过标签和 Issue 状态互相触发。加一个新的"来源"进流水线，就是加一个标签 + 更新一下上游 Agent 指令的事。

这两层的分工挺有意思：

- **底层负责"做对"**——配置、规则、模板，确保每条采集的数据都有据可查
- **上层负责"做通"**——让"做对"的数据自动流入研发流水线

如果只有底层没有上层，竞品报告还是会躺在仓库里没人看；如果只有上层没有底层，Agent 创建的 Issue 会全是没证据链的"我觉得"。

这大概就是"Agent 协作"真正该有的样子——**用代码定义标准，用 Agent 完成执行，用标签实现解耦**。不是一个巨大的 Agent 干所有事，而是一群专注的 Agent 通过简单的协议自组织起来。

---

## 📝 关于这篇文章

本文记录了一次真实的 Multica 工作区配置过程。文中的 Agent 和 Autopilot 均为实际创建并在运行的资源。涉及的具体产品名、内部链接和团队信息已做脱敏处理。
