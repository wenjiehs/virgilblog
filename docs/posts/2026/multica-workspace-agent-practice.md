---
title: 从零搭建一个 AI 文档处理流水线：我在 Multica 上的两天实践
date: 2026-05-13
tags: [Multica, AI Agent, 自动化, 工作流, 产品实践]
description: 记录在 Multica 平台上从零到一搭建产品文档自动化处理流水线的全过程：需求同步、草稿生成、Skill 导入、Autopilot 配置，以及踩过的那些坑。
---

# 从零搭建一个 AI 文档处理流水线：我在 Multica 上的两天实践

## 🤔 为什么要做这件事

我们团队有一个很具体的痛点：

产品文档的需求，散落在内部需求管理系统里。每隔一段时间，有人会创建一个需求说"要补充 XXX 功能的使用指南"，然后这条需求就沉默了。没有人认领，没有截止日期，最后被遗忘。

产品经理手头有几十条这样的文档需求，但真正产出文档的速度跟不上需求增长的速度。

这不是"懒"的问题，是流程断了：**需求管理系统里的需求，和文档系统里的文档，之间没有任何自动化的桥梁**。

我想用 Multica 搭一个这样的桥。

---

## 🧩 Multica 是什么

[Multica](https://multica.ai) 是一个 AI Agent 平台，核心概念是：

- **Issue**：任务单元，Agent 处理的对象
- **Agent**：自动化执行者，可以挂载 Skill、连接 MCP
- **Skill**：可复用的能力模块（本质是一组文件 + SKILL.md 描述）
- **Autopilot**：定时或触发式的自动任务调度器

类比 GitHub Actions 的话：Issue 是 trigger，Agent 是 workflow，Skill 是 action，Autopilot 是 schedule。

不同的是，Multica 的 Agent 是真正由 LLM 驱动的——它读 Issue 描述，自己决定怎么做，用什么工具。

---

## 🏗️ 我想搭的系统

目标很清晰，一条三段式流水线：

```
需求管理系统里的文档需求
    ↓ 定时同步（Autopilot）
Multica Issue（带 doc 标签）
    ↓ 批量处理（Autopilot）
文档系统草稿 → 人工审核发布
```

涉及三个 Agent：

1. **需求同步 Agent**：定时从需求管理系统拉取文档类需求，创建 Multica Issue
2. **文档 Issue 处理 Agent**：分析 Issue 合理性，找到对应文档节点，生成草稿
3. **Multica 管家**：管理其他 Agent 和工作区资源

---

## 🚀 第一步：同步需求

这一步相对顺利。openclaw runtime 原生支持需求管理系统的 MCP，Agent 可以直接调用相关 API。

设计了一个增量同步逻辑：

- 首次运行：全量拉取，不限日期
- 后续运行：只查最近 14 天有变更的需求

用 `story_id:{id}` 做 Issue 描述的去重标记，每次运行前先查 Multica 里有没有同 ID 的 Issue，有就跳过。

创建 Issue 后自动打 `doc` 标签，这样后续的处理 Agent 能快速筛选。

---

## 🔧 第二步：文档系统 Skill

处理 Issue 之前，需要一个能操作内部文档系统的 Skill。

手动导入到 Multica 的过程有点繁琐：

```bash
# 创建 skill
multica skill create --name "doc-writer" --description "..."

# 逐个上传文件（共 31 个）
multica skill files upsert <skill-id> --path "SKILL.md" --content "..."
# ... 重复 31 次
```

这个 Skill 提供两条路径：

- **路径 A**：按公司写作规范（26 条）生成标准 Markdown
- **路径 B**：通过文档系统 API 直接操作（AddNode → lockArticle → save → unLockArticle）

文档草稿链接的格式踩了一个坑：路径里 `/docs/{nodeId}` 和 `/document/{nodeId}` 是两个不同的端点，就差一个单词，测试时草稿链接全部 404，排查了一会儿才发现。

---

## 🤖 第三步：选 Runtime，验证全流程

这是整个过程中最有趣的部分。

最初的文档处理 Agent 运行在 openclaw runtime 上，直接读本地路径：

```
/Users/me/工作站/docs/05-knowledge-base/product-documentation-structure.md
```

这里面是文档系统完整的目录树和 nodeId 索引，Agent 靠它来决定在哪个节点下创建或更新文档。

后来想换到 Hermes runtime（`v0.11.0-post4`），因为它更适合云端运行，理论上团队其他人也能使用。

然后发现了一个根本性的问题：

> **Hermes runtime 是隔离的云端容器，根本不能访问 `/Users/...` 这种本地路径。**

这不是配置问题，是设计问题。openclaw 跑在本地，所以能读本地文件；Hermes 跑在云端容器里，本地文件对它来说根本不存在。

解决方案：把知识库的源文件放到 git 仓库里，Agent 运行时动态 clone：

```bash
multica repo checkout https://<your-git-host>/your-org/project-station.git
```

clone 完成后再读 `docs/05-knowledge-base/product-documentation-structure.md`，效果一样，但适配了云端环境。

**验证流程**：创建了一个测试 Issue（编号 100），内容是"添加节点池使用指南"，让 Hermes Agent 跑一遍。它成功完成了：

1. clone 仓库，找到文档目录结构
2. 定位到"节点管理"章节下的正确父节点
3. 生成符合规范的 Markdown
4. 调文档系统 API 创建草稿节点
5. 回复草稿链接，更新 Issue 状态为 `in_review`

验证通过后，把旧的 openclaw Agent 归档，Hermes Agent 设为主力，更新 Autopilot 指向。

---

## ⏰ 第四步：Autopilot 配置

创建了三个 Autopilot：

| Autopilot | 触发时间 | 职责 |
|-----------|---------|------|
| 文档需求拉取 | 待配置 | 定期同步需求管理系统 → Multica |
| 文档 Issue 批量处理 | 工作日 11-16 点，每小时 | 每小时处理 2-3 条 Issue |
| 文档处理日报 | 工作日 17:00 | 汇总当日处理结果 |

这里踩了一个坑：

> **CLI `multica autopilot create` 不支持设置 cron 时间，只能在 Multica UI 里手动配置。**

`multica autopilot --help` 里根本找不到 `--cron` 这样的参数。创建完 Autopilot 之后，要去 Web 界面点进去配置触发时间。

这个"最后一公里"设计让自动化脚本没法完全 end-to-end，有点遗憾。

---

## 🛠️ 第五步：附件工具 Skill

处理文档 Issue 时，有时候需求里会附上设计稿、截图这类文件。

需求管理系统的 MCP 原生不支持把本地文件上传，于是去找了团队内部维护的一个 toolkit Skill 项目，里面有：

- **图片上传**：`upload-image.py`，上传本地图片，返回 `<img>` 标签，可嵌入需求描述
- **附件上传**：`upload-attachment.py`，上传任意文件到需求/缺陷/任务（最大 250MB）
- **附件查询/下载**：直接用原生 MCP 工具，不需要本地脚本

同样是手动 clone 文件，逐个上传到 Multica Skill。

这里有一个重要的注意事项：

> **MCP 配置中必须加 `X-Keep-Links: true`，否则 Skill 生成的图片链接会被平台过滤掉，数据丢失。**

认证凭证文件 `~/.{tool}/credentials` 需要包含访问令牌：

```ini
access_token=<你的访问令牌>
env=<环境标识>
```

在 Hermes 这种隔离环境里，每次运行容器都是新的，所以 Agent 要在启动时检查文件是否存在，不存在就从环境变量重建。

---

## 📦 第六步：建一个项目沉淀

过程中创建了 `pm-multica` 这个 git 仓库，专门记录 Multica 工作站的运营内容：

```
pm-multica/
├── docs/01-insights/          # 使用心得
├── docs/02-pitfalls/          # 踩坑记录
└── docs/03-resources/
    ├── agents/                # 每个 Agent 的完整 Instructions
    └── skills/                # SKILL.md + 源码
```

所有 Agent 的 Instructions 都存进去，下次想调整或者复用，直接查文件，不用去 Multica 控制台翻。

---

## 🪤 踩过的坑汇总

做完整个流程，回头看最影响进度的是这几个：

**1. Hermes runtime 的隔离性**  
设计 Agent 时没意识到 Hermes 是云端容器，把本地路径写死了，测试时才发现。本质上要提前想清楚：这个 Agent 是跑在我的机器上，还是跑在云端？

**2. @mention 循环**  
在 Issue 评论里加了 `mention://agent/<id>` 的链接想通知另一个 Agent，结果那个 Agent 被触发后又回复了一条，里面又有 mention，陷入无限循环。教训：**收尾评论绝对不能用 agent mention，plain text 就好**。

**3. CLI 覆盖 Agent Instructions**  
执行 `multica agent update --instructions "..."` 时，如果是直接写新内容，会把原来的 Instructions 全部覆盖。要先 `multica agent get <id>` 看清楚现有内容，再决定怎么改。



---

## 💡 几点感受

**Agent 的设计本质是 prompt engineering，但测试成本很高。** 每次修改 Instructions 后，要新建 Issue、触发 Agent、等待运行、看结果，一个循环可能要 5-10 分钟。所以改指令之前要想清楚，不要小改频繁迭代。

**Skill 是复用的关键。** 一旦把文档系统操作、需求管理操作封装成 Skill，所有 Agent 都能共用，不用重复写 prompt 描述怎么调 API。

**自动化的边界在哪里？** 这套系统生成的是"草稿"，不是最终文档。人工审核这一步不可省略——AI 对业务的理解深度有限，文档里的技术细节、措辞规范、发布时机都需要人把关。系统的价值是**把"从无到有"的成本降到几乎为零**，而不是消除人工。

---

## 🔮 下一步

- 把 Autopilot 的 cron 配置搞定，跑起来常态化运行
- 探索迁移到 Web 版本——本地 App 适合个人使用，但团队协作需要 Web 环境，同时要解决多用户凭证隔离的问题
- 积累更多 Issue 处理样本，看草稿质量，持续迭代 Agent Instructions

---

用两天时间，把一个"文档需求一直堆在需求管理系统没人处理"的问题，变成了一个"每天定时自动拉取需求、批量生成草稿"的半自动化流水线。

不是魔法，是一堆工程细节的堆砌。但这正是 AI Agent 让人着迷的地方——**它能干的事，比你想象的多；需要你操心的细节，也比你想象的多。**
