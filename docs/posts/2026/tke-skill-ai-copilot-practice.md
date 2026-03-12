---
title: 从想法到落地：用 CodeBuddy Skill 让 AI 直接管理我的 TKE 集群
date: 2026-03-12
tags: [AI编程, 云原生, TKE, 产品实践, 工具分享]
description: 记录如何用一个 Skill 让 AI Agent 直接查询腾讯云 TKE 集群——从调研到落地的真实过程
---

# 从想法到落地：用 CodeBuddy Skill 让 AI 直接管理我的 TKE 集群

上周写了篇《OpenClaw + Kubernetes：一个值得试试的方向》，聊了聊 AI Agent 和 K8s 结合的可能性。当时还在想着怎么用 OpenClaw 做 K8s Skill。

结果今天一看，其实我每天用的 CodeBuddy IDE 就有类似的能力——**Skill 机制**。

于是花了一个下午，做了一个 TKE Skill，让 AI 可以直接查询我的腾讯云 TKE 集群。这篇文章记录一下这个过程。

---

## 🤔 为什么想做这个？

### 背景

作为 TKE 的产品经理，我经常需要：
- 查看测试集群的状态
- 获取 kubeconfig 连接集群
- 检查节点池配置

每次都要：
1. 打开腾讯云控制台
2. 登录
- 找到 TKE 服务
4. 选择地域
5. 找到目标集群
6. 点击查看详情...

流程太长了。

### 想法

如果能在 IDE 里直接问 AI："帮我看下广州区域有哪些 TKE 集群"，然后 AI 直接调用 TKE API 返回结果，那该多爽？

这不就是《OpenClaw + K8s》那篇文章里说的"方向 1：K8s 运维 Skill 生态"吗？只不过换成了 CodeBuddy 的 Skill 机制。

---

## 🛠️ 实现过程

### 第一步：了解 Skill 机制

CodeBuddy 的 Skill 机制很简单：
- 一个 `SKILL.md` 文件定义 Skill 的能力和使用方式
- 一个或多个脚本文件实现具体功能
- AI 根据 `SKILL.md` 的描述决定何时调用、如何调用

目录结构大概是这样：

```
~/.codebuddy/skills/tke/
├── SKILL.md        # Skill 定义文件
├── tke_cli.py      # TKE CLI 脚本
└── README.md       # 说明文档
```

### 第二步：写 CLI 工具

先写一个轻量级的 TKE CLI 脚本 `tke_cli.py`：

```python
#!/usr/bin/env python3
"""
腾讯云 TKE CLI - 轻量级 TKE 集群管理命令行工具
"""

import argparse
import json
import os
import sys


def get_credentials(args):
    """获取腾讯云凭证（命令行参数优先，环境变量兜底）"""
    secret_id = getattr(args, 'secret_id', None) or os.getenv("TENCENTCLOUD_SECRET_ID")
    secret_key = getattr(args, 'secret_key', None) or os.getenv("TENCENTCLOUD_SECRET_KEY")
    if not secret_id or not secret_key:
        print("错误：未提供腾讯云凭证", file=sys.stderr)
        sys.exit(1)
    return secret_id, secret_key


def create_common_client(secret_id, secret_key, region):
    """创建腾讯云通用客户端"""
    from tencentcloud.common import credential
    from tencentcloud.common.common_client import CommonClient
    # ... 初始化客户端
    return client


# 子命令：查询集群列表
def cmd_clusters(args):
    secret_id, secret_key = get_credentials(args)
    client = create_common_client(secret_id, secret_key, args.region)
    result = call_api(client, "DescribeClusters", {})
    print_json(result)


# 子命令：获取 kubeconfig
def cmd_kubeconfig(args):
    # ...
```

关键设计点：
- **凭证灵活配置**：支持环境变量和命令行参数两种方式
- **只读操作**：MVP 阶段只做查询，不做写入，安全风险可控
- **JSON 输出**：方便 AI 解析结果

### 第三步：写 SKILL.md

这是核心部分——告诉 AI 这个 Skill 能做什么、怎么用：

```markdown
---
name: tke
description: 腾讯云 TKE 容器服务运维专家，支持集群巡检、状态查询、节点池管理、kubeconfig 获取等
allowed-tools: Read, Bash, Write
---

# TKE 集群运维专家

你是腾讯云容器服务 (TKE) 运维专家。通过 `tke_cli.py` 脚本管理和查询 TKE 集群。

## 可用命令

### 1. clusters - 查询集群列表
python {baseDirectory}/tke_cli.py clusters --region ap-guangzhou

### 2. kubeconfig - 获取集群 kubeconfig
python {baseDirectory}/tke_cli.py kubeconfig --region ap-guangzhou --cluster-id cls-xxx

## 标准操作流程

### 集群巡检
1. `clusters` 获取所有集群列表
2. `cluster-status` 检查每个集群的运行状态
3. 汇总输出：集群名称、状态、节点数、异常项
```

关键设计点：
- **角色定义**：告诉 AI "你是 TKE 运维专家"
- **命令说明**：清晰列出每个命令的用法和参数
- **标准流程**：提供常见场景的操作步骤，让 AI 知道先做什么后做什么

### 第四步：实际使用

配置好环境变量后，就可以直接和 AI 对话了：

**我**：看下我当前项目下有哪些 TKE 集群

**AI**：好的，我来使用 TKE skill 查看你的集群信息...

然后 AI 自动：
1. 加载了 TKE Skill
2. 执行 `python tke_cli.py clusters --region ap-guangzhou`
3. 发现广州没有集群，自动尝试了上海、北京、新加坡等其他地域
4. 返回结果告诉我目前各地域都没有集群

**整个过程我只说了一句话，AI 自动完成了多地域查询。**

---

## 💭 这个体验让我想到什么

### 和 OpenClaw + K8s 方向的对比

在《OpenClaw + K8s》那篇文章里，我提到的"方向 1：K8s 运维 Skill 生态"的核心是：

> 给 AI Agent 装上"kubectl 的手"

今天做的 TKE Skill，本质上就是这个思路的实现——只不过：
- 平台从 OpenClaw 换成了 CodeBuddy
- 操作对象从通用 K8s 换成了 TKE 云 API

两者的核心价值是一样的：**让 AI 能够直接执行运维操作，而不是只能生成命令让人复制粘贴。**

### 当前能力边界

需要诚实地说，这个 TKE Skill 目前还是比较初级的：

| 已实现 | 未实现 |
|--------|--------|
| ✅ 集群列表查询 | ❌ 集群创建/删除 |
| ✅ 集群状态查询 | ❌ 节点管理 |
| ✅ 节点池查询 | ❌ 工作负载部署 |
| ✅ kubeconfig 获取 | ❌ 告警集成 |
| ✅ 端点状态查询 | ❌ 自动修复 |

这只是一个**只读的运维查询助手**，还不是"会说人话的 K8s SRE"。

但作为 MVP，我觉得足够了。

### 安全考量

在《OpenClaw + K8s》那篇文章里，我特别提到了安全风险：

> 如果 Agent 获取过高权限，可能引发凭证泄露等问题

所以这个 TKE Skill 的设计原则是：
1. **只读操作**：所有命令都是查询，不会修改集群状态
2. **凭证隔离**：凭证通过环境变量传入，不会出现在日志或输出中
3. **本地运行**：Skill 在本地 IDE 环境运行，不涉及远程服务

如果未来要支持写入操作（比如扩缩容），需要增加：
- 操作确认机制
- 审计日志
- 权限范围限制

---

## 🎯 下一步可以做什么

### 短期（1-2 周）

1. **扩展查询能力**：
   - 工作负载查询（Deployment、StatefulSet）
   - 事件查询（排查问题用）
   - 监控数据查询（CPU、内存使用率）

2. **优化输出格式**：
   - AI 返回结构化表格而不是 JSON
   - 关键信息高亮（状态异常标红等）

### 中期（1-2 月）

3. **集成 kubectl**：
   - 除了云 API，也支持直接执行 kubectl 命令
   - 获取到 kubeconfig 后，自动配置 kubectl 上下文

4. **告警集成**：
   - 接收 Prometheus AlertManager 的告警
   - 自动分析告警并给出建议

### 长期（探索方向）

5. **写入操作（谨慎）**：
   - Pod 重启
   - 扩缩容
   - 需要严格的确认机制

---

## 🤷 一些思考

### Skill 机制 vs MCP

在调研过程中，我发现 CodeBuddy 还有另一种扩展方式：**MCP（Model Context Protocol）**。

简单对比：

| | Skill | MCP |
|------|-------|-----|
| **实现方式** | Markdown + 脚本 | 标准化协议 + Server |
| **复杂度** | 低，几个文件搞定 | 中，需要实现 MCP Server |
| **能力** | 依赖 Bash 调用 | 原生 Tool 调用 |
| **适用场景** | 快速原型、个人工具 | 生产级、跨平台 |

对于"TKE 集群查询"这种场景，Skill 机制已经够用了。如果未来要做更复杂的功能（比如跨平台支持、权限管理），可能需要考虑 MCP。

### AI 时代的"运维工具"长什么样？

传统运维工具的交互方式：
- **CLI**：命令行，需要记住语法
- **GUI**：Web 控制台，需要点击多层菜单
- **API**：编程接口，需要写代码

AI 时代的运维工具可能是：
- **自然语言**：直接说"查一下生产集群的 Pod 状态"
- **上下文感知**：AI 知道你在哪个项目、哪个环境
- **主动建议**：发现异常主动提醒，而不是被动等查询

今天做的 TKE Skill，只是一个很小的尝试。但我觉得方向是对的。

---

## 🎉 总结

花了一个下午，把《OpenClaw + K8s》那篇文章里的"方向 1"在 CodeBuddy 上跑通了：

**实现的**：
- ✅ TKE 集群查询 Skill
- ✅ 自然语言交互
- ✅ 多地域自动遍历

**还没做的**：
- ❌ kubectl 集成
- ❌ 写入操作
- ❌ 告警集成

**核心体验**：说一句"看下我有哪些集群"，AI 自动调 API、跨地域查询、返回结果。省去了打开控制台、登录、切换地域的流程。

这种"AI 直接执行运维操作"的体验，确实比"AI 生成命令让人复制粘贴"好很多。

---

## 📝 关于这篇文章

这篇文章记录了 2026-03-12 的真实开发过程。

TKE Skill 的代码在我的本地环境 `~/.codebuddy/skills/tke/` 目录下，暂时没有开源计划（主要是太简陋了 😅）。

如果你也想做类似的 Skill，可以参考 CodeBuddy 的官方文档，或者直接问 AI "怎么创建一个 CodeBuddy Skill"——它会告诉你的。
