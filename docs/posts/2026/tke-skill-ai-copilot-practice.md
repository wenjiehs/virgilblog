---
title: 从想法到落地：用 AI Agent 一句话部署项目到 TKE
date: 2026-03-12
tags: [AI编程, 云原生, TKE, 产品实践, 工具分享]
description: 记录使用 TKE Skill + kubernetes-mcp 实现"一句话部署到 TKE"的真实过程，包括遇到的坑和反思
---

# 从想法到落地：用 AI Agent 一句话部署项目到 TKE

上周写了篇《OpenClaw + Kubernetes：一个值得试试的方向》，聊了聊 AI Agent 和 K8s 结合的可能性。当时还在想着怎么用 OpenClaw 做 K8s Skill。

结果今天一看，其实我每天用的 CodeBuddy IDE 就有类似的能力——**Skill 机制**和 **MCP 机制**。

于是花了一个下午，做了一个 TKE Skill，让 AI 可以直接查询我的腾讯云 TKE 集群。**更重要的是，我想验证一个场景：能不能用一句话把项目部署到 TKE？**

这篇文章记录一下整个过程——包括成功的部分，也包括踩的坑。

---

## 🤔 为什么想做这个？

### 背景

作为 TKE 的产品经理，我经常需要：
- 查看测试集群的状态
- 获取 kubeconfig 连接集群
- **把本地项目快速部署到测试集群验证**

每次部署流程是这样的：
1. 写 Dockerfile，构建镜像
2. 登录 TCR（容器镜像仓库），推送镜像
3. 打开腾讯云控制台，找到 TKE 集群
4. 下载 kubeconfig
5. 写 deployment.yaml
6. `kubectl apply -f deployment.yaml`
7. 检查 Pod 状态...

**一套流程下来，至少 20 分钟。**

### 想法

如果能在 IDE 里直接说一句："帮我把这个项目部署到 TKE 集群"，然后 AI 自动完成：镜像构建 → 推送 TCR → 获取 kubeconfig → 生成 K8s 配置 → 部署 → 验证

**整个过程预期 5 分钟搞定**，那该多爽？

这不就是《OpenClaw + K8s》那篇文章里说的"方向 2：K8s 智能部署"吗？

### 工具组合

要实现这个场景，我需要两个能力：

1. **TKE Skill**：让 AI 能调用 TKE API（查集群、获取 kubeconfig）
2. **kubernetes-mcp**：让 AI 能执行 kubectl 命令（部署应用、检查状态）

理论上，这两个能力组合起来，就能实现"一句话部署到 TKE"。

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

## 🚀 实际部署体验：把 tke-workshop 部署到 TKE

有了 TKE Skill 和 kubernetes-mcp，我决定验证那个"一句话部署"的场景。

### 部署目标

我手头正好有个项目：**tke-workshop.github.io**——一个用 MkDocs 构建的技术文档站点。

目标：用一句话把它部署到我的 TKE 测试集群。

### 第一步：获取集群信息（TKE Skill）

**我**：帮我看下我有哪些 TKE 集群

**AI** 自动执行了 `tke_cli.py clusters`，遍历多个地域，找到了我在新加坡的测试集群：

```
集群名称: workshop-test-cls
集群ID: cls-8ch26th8
地域: ap-singapore
状态: Running
节点数: 1
K8s版本: 1.28.3
```

✅ 这一步很顺利，TKE Skill 完美工作。

### 第二步：获取 kubeconfig（TKE Skill）

**我**：获取这个集群的 kubeconfig

**AI** 执行了 `tke_cli.py kubeconfig --cluster-id cls-8ch26th8 --region ap-singapore`，kubeconfig 自动保存到了本地。

✅ 这一步也很顺利。

### 第三步：构建和推送镜像（手动）

这里遇到了**第一个断点**：TKE Skill 只有集群管理能力，没有镜像构建和推送能力。

我不得不手动执行：

```bash
# 构建镜像
docker build -t ccr.ccs.tencentyun.com/virgil-test/tke-workshop:latest .

# 登录 TCR
docker login ccr.ccs.tencentyun.com

# 推送镜像
docker push ccr.ccs.tencentyun.com/virgil-test/tke-workshop:latest
```

😅 理想中的"一句话部署"在这里断了。

### 第四步：部署到集群（kubernetes-mcp）

镜像推送完成后，我继续让 AI 部署：

**我**：把这个项目部署到集群，镜像地址是 ccr.ccs.tencentyun.com/virgil-test/tke-workshop:latest

**AI** 使用 kubernetes-mcp 自动完成了：

1. 生成 Deployment YAML
2. 执行 `kubectl apply`
3. 创建 Service（ClusterIP）
4. 检查 Pod 状态

```yaml
# AI 生成的 deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tke-workshop
spec:
  replicas: 1
  selector:
    matchLabels:
      app: tke-workshop
  template:
    spec:
      containers:
      - name: tke-workshop
        image: ccr.ccs.tencentyun.com/virgil-test/tke-workshop:latest
        ports:
        - containerPort: 8000
```

✅ 部署成功！Pod Running！

### 第五步：暴露服务（kubernetes-mcp）

**我**：创建一个 LoadBalancer Service 让我能外网访问

**AI** 自动创建了 LoadBalancer Service，几分钟后拿到了外网 IP：

```
服务名称: tke-workshop-lb
类型: LoadBalancer
外网IP: 43.xxx.xxx.xxx
端口: 80 -> 8000
```

✅ 打开浏览器，访问 `http://43.xxx.xxx.xxx`，文档站点成功显示！

---

## 😕 真实遇到的问题

虽然最终部署成功了，但过程并不像预期那么顺畅。

### 问题 1：能力割裂

我需要两个独立的工具：
- **TKE Skill**：负责集群管理（查集群、获取 kubeconfig）
- **kubernetes-mcp**：负责 K8s 操作（kubectl）

问题是：**它们之间没有自动衔接**。

TKE Skill 获取的 kubeconfig，需要我手动告诉 kubernetes-mcp 去哪里找。理想情况下，TKE Skill 获取 kubeconfig 后，应该自动配置好 kubectl 上下文。

### 问题 2：镜像构建是断点

"一句话部署"的完整链路应该是：

```
源码 → 镜像构建 → 镜像推送 → 部署 → 验证
```

但现在的能力只覆盖了后两步。镜像构建和推送需要手动完成。

这是因为：
- TKE Skill 专注于 TKE API
- kubernetes-mcp 专注于 kubectl
- **没有一个工具负责 Docker 和 TCR**

### 问题 3：kubeconfig 流转

kubernetes-mcp 需要知道 kubeconfig 的位置。但 TKE Skill 获取 kubeconfig 后，默认保存在 `~/.kube/config-{cluster-id}`。

我需要手动告诉 AI：

**我**：kubeconfig 在 /tmp/kubeconfig-cls-8ch26th8.yaml，用这个文件

**AI**：好的，我会使用这个 kubeconfig...

这个"中转"步骤很别扭。

### 问题 4：上下文丢失

因为 TKE Skill 和 kubernetes-mcp 是两个独立的对话，AI 在使用 kubernetes-mcp 时，不知道之前 TKE Skill 做了什么。

理想情况下：
1. TKE Skill 获取 kubeconfig
2. 自动设置为当前 kubectl 上下文
3. kubernetes-mcp 直接使用，无需额外配置

现实情况下：每一步都需要我手动"传递"信息。

---

## 📊 时间投入对比

| 步骤 | 预期时间 | 实际时间 | 说明 |
|------|----------|----------|------|
| 获取集群信息 | 30秒 | 30秒 | ✅ TKE Skill 很好用 |
| 获取 kubeconfig | 30秒 | 1分钟 | ✅ 基本符合预期 |
| 构建镜像 | - | 10分钟 | ⚠️ 手动完成，断点 |
| 推送镜像 | - | 5分钟 | ⚠️ 手动完成，断点 |
| 部署应用 | 1分钟 | 3分钟 | ✅ kubernetes-mcp 好用 |
| 创建 Service | 1分钟 | 2分钟 | ✅ kubernetes-mcp 好用 |
| 等待 LB 生效 | 2分钟 | 2分钟 | ✅ 符合预期 |
| **总计** | **~6分钟** | **~24分钟** | 😅 差了 4 倍 |

**如果算上中间调试和排错的时间，实际花了大约 65 分钟。**

主要耗时在：
1. 镜像构建和推送（15分钟）
2. 调试 kubeconfig 路径问题（10分钟）
3. 等待服务生效（5分钟）

---

## 💭 这个体验让我想到什么

### 和 OpenClaw + K8s 方向的对比

在《OpenClaw + K8s》那篇文章里，我提到的"方向 1：K8s 运维 Skill 生态"的核心是：

> 给 AI Agent 装上"kubectl 的手"

今天做的 TKE Skill + kubernetes-mcp，本质上就是这个思路的实现——只不过：
- 平台从 OpenClaw 换成了 CodeBuddy
- **发现了"能力割裂"的问题**

两者的核心价值是一样的：**让 AI 能够直接执行运维操作，而不是只能生成命令让人复制粘贴。**

### 理想 vs 现实

**理想中的"一句话部署"**：

```
用户：把这个项目部署到我的 TKE 集群
AI：好的，我来处理...
    1. ✅ 发现这是一个 MkDocs 项目
    2. ✅ 生成 Dockerfile
    3. ✅ 构建镜像
    4. ✅ 推送到 TCR
    5. ✅ 获取目标集群 kubeconfig
    6. ✅ 生成 K8s 部署配置
    7. ✅ 部署应用
    8. ✅ 创建 LoadBalancer
    9. ✅ 返回访问地址
完成！访问地址：http://43.xxx.xxx.xxx
```

**现实中的体验**：

```
用户：把这个项目部署到我的 TKE 集群
AI：好的，让我先查一下你有哪些集群...（TKE Skill）
    找到了 cls-8ch26th8 集群
用户：获取这个集群的 kubeconfig
AI：kubeconfig 已保存到 /tmp/kubeconfig-xxx.yaml
用户：（手动构建和推送镜像）
用户：镜像在 ccr.xxx/tke-workshop:latest，kubeconfig 在 /tmp/xxx，帮我部署
AI：好的，我来部署...（kubernetes-mcp）
```

差距还是挺大的。

### 当前能力边界

| 已实现 | 未实现 |
|--------|--------|
| ✅ 集群列表查询 | ❌ 镜像构建 |
| ✅ 集群状态查询 | ❌ 镜像推送 |
| ✅ 节点池查询 | ❌ TCR 集成 |
| ✅ kubeconfig 获取 | ❌ 自动配置 kubectl 上下文 |
| ✅ kubectl 操作（via MCP） | ❌ Skill 和 MCP 自动衔接 |

这还是一个**需要人工串联的半自动化流程**，而不是端到端的自动化。

### 改进建议

如果要让 TKE Skill 真正好用，我觉得需要：

**1. 成为"TKE 全能助手"而不是"API 调用工具"**

目前 TKE Skill 只是 TKE API 的封装，用户还需要知道：
- 要调哪个 API
- 参数怎么填
- 结果怎么解读

理想情况下，TKE Skill 应该支持自然语言：
- "帮我创建一个测试集群" → 自动选择合适的参数
- "看下集群有什么问题" → 自动检查多个维度

**2. 打通镜像构建和推送**

加入 TCR 能力：
- `tke_cli.py build` - 构建镜像
- `tke_cli.py push` - 推送到 TCR
- 或者直接集成 Docker SDK

**3. 自动配置 kubectl 上下文**

获取 kubeconfig 后，自动执行：
```bash
export KUBECONFIG=/path/to/kubeconfig
kubectl config use-context xxx
```

让后续的 kubectl 操作无缝衔接。

**4. 支持端到端场景**

```python
# 理想的命令
tke_cli.py deploy --project . --cluster cls-xxx --registry ccr.xxx

# 自动完成：
# 1. 检测项目类型
# 2. 生成/使用 Dockerfile
# 3. 构建镜像
# 4. 推送到指定 Registry
# 5. 生成 K8s 配置
# 6. 部署到目标集群
# 7. 返回访问方式
```

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

基于这次实践，我觉得优先级应该是：

### P0：打通镜像链路

这是当前最大的断点。需要：
- 集成 Docker SDK 或调用本地 Docker CLI
- 支持 TCR 登录和推送
- 自动检测项目类型，生成 Dockerfile

### P1：Skill + MCP 自动衔接

让 TKE Skill 获取的 kubeconfig 自动被 kubernetes-mcp 使用，而不需要手动传递路径。

可能的方案：
- TKE Skill 获取 kubeconfig 后，自动设置环境变量
- 或者写入一个约定位置，MCP 自动读取

### P2：端到端部署命令

实现 `tke_cli.py deploy`，一个命令完成全流程：
```bash
tke_cli.py deploy --project . --cluster cls-xxx --expose
```

### P3：智能诊断

当部署失败时，自动分析原因：
- Pod 启动失败 → 检查镜像拉取、资源配额
- Service 不通 → 检查端口、网络策略
- 给出修复建议

---

## 🤷 一些思考

### Skill 机制 vs MCP

这次实践同时用了 Skill（TKE Skill）和 MCP（kubernetes-mcp），体验对比：

| | Skill | MCP |
|------|-------|-----|
| **实现方式** | Markdown + 脚本 | 标准化协议 + Server |
| **开发成本** | 低，几个文件搞定 | 中，需要实现 MCP Server |
| **调用方式** | AI 执行 Bash 脚本 | 原生 Tool 调用 |
| **稳定性** | 依赖脚本执行环境 | 更稳定，协议标准化 |
| **适用场景** | 快速原型、个人工具 | 生产级、跨平台 |

实际体验：
- **TKE Skill** 开发很快，一个下午搞定。但输出解析依赖 AI 理解 JSON。
- **kubernetes-mcp** 用起来更丝滑，因为是标准 Tool 调用，参数和返回值都很清晰。

如果要做生产级的 TKE 工具，可能 MCP 是更好的选择。

### 为什么"一句话部署"这么难？

因为涉及的环节太多了：

```
源码 → Dockerfile → 镜像构建 → Registry 认证 → 镜像推送 
    → 集群认证 → kubeconfig → K8s 配置 → 部署 → 验证
```

每个环节都是独立的系统：
- Docker（本地）
- TCR（腾讯云）
- TKE API（腾讯云）
- kubectl（本地 + 远程）

要打通这些环节，需要一个"超级 Agent"同时具备所有能力。目前的 Skill + MCP 还做不到。

### AI 时代的"运维工具"长什么样？

传统运维工具的交互方式：
- **CLI**：命令行，需要记住语法
- **GUI**：Web 控制台，需要点击多层菜单
- **API**：编程接口，需要写代码

AI 时代的运维工具可能是：
- **自然语言**：直接说"把这个项目部署到生产环境"
- **上下文感知**：AI 知道你在哪个项目、哪个集群、用什么镜像仓库
- **端到端执行**：不是生成命令让你复制，而是直接执行并返回结果

今天的实践证明：**方向是对的，但离真正好用还有距离。**

---

## 🎉 总结

花了一个下午 + 一个晚上，验证了"一句话部署到 TKE"的场景：

**✅ 成功的部分**：
- TKE Skill 可以查询集群、获取 kubeconfig
- kubernetes-mcp 可以执行 kubectl 操作
- 最终确实把项目部署到了 TKE，拿到了外网访问地址

**❌ 没达到预期的部分**：
- 不是真正的"一句话"，而是"十句话"
- 镜像构建和推送需要手动完成
- 工具之间缺乏自动衔接
- 预期 6 分钟，实际 65 分钟

**🤔 核心发现**：
- Skill + MCP 的组合有潜力，但目前是"能力碎片"
- 端到端的场景需要更深度的集成
- TKE Skill 应该进化为"TKE 全能助手"

这次实践让我更清楚地看到了"AI 运维"的理想与现实的差距。差距不小，但方向确实是对的。

---

## 📝 关于这篇文章

这篇文章记录了 2026-03-12 的真实开发和部署过程。

**相关资源**：
- TKE Skill 代码：`~/.codebuddy/skills/tke/`（本地环境，暂未开源）
- kubernetes-mcp：开源项目，可以在 GitHub 上找到
- 部署的项目：tke-workshop.github.io

**时间统计**：
- TKE Skill 开发：~3 小时
- 部署验证：~1 小时
- 总共折腾：~4-5 小时

如果你也想做类似的 Skill，可以参考 CodeBuddy 的官方文档，或者直接问 AI "怎么创建一个 CodeBuddy Skill"——它会告诉你的。

**最后**：虽然过程比预期曲折，但看到文档站点跑在自己的 TKE 集群上，还是挺有成就感的 🎉
