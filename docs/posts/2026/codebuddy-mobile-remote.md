---
title: 用 AI 设计一个手机控制工具：第一天的探索
date: 2026-02-25
tags: [AI编程, 产品实践, 项目复盘]
description: 用 AI 辅助设计一个手机远程控制工具的第一天尝试，记录想法、技术选型和实际进展
---

# 用 AI 设计一个手机控制工具：第一天的探索

## 🤔 为什么要做这件事

最近在用 CodeBuddy（一个 AI 编程助手）写代码时，突然有个想法：**能不能通过手机给 CodeBuddy 发指令？**

想象一下这些场景：
- 🚇 在地铁上突然想到一个 bug，掏出手机告诉 CodeBuddy："帮我看看登录页面的问题"
- 🏃 跑步时收到通知："你要的功能已经写好了，测试通过"
- 🛋️ 躺在沙发上用语音说："运行测试"，电脑上的 CodeBuddy 就开始工作

坦白说，这可能更像一个"好玩"的想法，而不是刚需。但我想**验证一下这个想法是否可行**，顺便学习一下完整的移动端+云端+桌面端三端协同的架构设计。

## 🎯 目标和技术背景

### 初始想法

最开始的想法很简单：
- 📱 手机端：能发送文字或语音指令
- 💻 电脑端：CodeBuddy 收到指令后执行
- 🔔 通知：完成任务后推送通知到手机

### 我的技术背景

说实话，我的移动开发经验几乎为零：
- ✅ 做过一些前端（React、Vue），但主要是 Web
- ✅ 了解基本的后端架构（用过 Node.js、Go）
- ❌ **从没写过原生 iOS App**
- ❌ 对 Firebase 只是听说过，没实际用过

所以这次更像是一个**学习项目** + **AI 辅助开发的实验**。

## 🛠️ 实际动手过程

### 第一步：用 Superpowers 做需求分析

CodeBuddy 安装了 [Superpowers](https://github.com/obra/superpowers) 插件，它强制要求在写代码前先做头脑风暴（brainstorming）。

我说："帮我规划一个功能，设计一个手机连接 CodeBuddy 的工具。"

CodeBuddy 自动触发了 `brainstorming` skill，开始问我问题：

**核心使用场景？**
- 我选了：发送指令 + 接收通知

**连接方式？**
- 我选了：云中继服务（这样在任何地方都能用）

**手机端形态？**
- 我选了：原生 iOS App（我只有 iPhone，先做 iOS 就够了）

**交互方式？**
- 我选了：文本 + 语音（文字更精确，语音更方便）

**安全认证？**
- 我选了：OAuth 账号系统（用 GitHub 登录，简单安全）

### 第二步：AI 提出的三个技术方案

CodeBuddy 分析完需求后，给了我 3 个方案：

#### 方案 A：轻量级 - Firebase + 无服务器架构 ⭐

**架构**：
- 云服务：Firebase Realtime Database + Cloud Functions
- iOS App：Swift + SwiftUI + Firebase SDK
- CodeBuddy 插件：Node.js WebSocket 客户端
- 认证：Firebase Auth（GitHub OAuth）

**优点**：
- 成本低（小规模几乎免费）
- 快速开发（Firebase 提供开箱即用的服务）
- 无需管理服务器

#### 方案 B：自建后端 + 消息队列

**架构**：
- 后端：Express.js + PostgreSQL + Redis
- WebSocket：Socket.io
- 推送：APNs

**优点**：完全自主控制  
**缺点**：需要运维，开发周期长

#### 方案 C：企业级微服务 + gRPC

**架构**：
- 微服务：gRPC
- 消息队列：Kafka

**优点**：高性能、高可用  
**缺点**：过于复杂，个人项目 overkill

### 第三步：选择方案 A

我毫不犹豫选了 **方案 A（Firebase）**，原因：
1. **我想快速验证想法**，不想花时间搞运维
2. **成本可控**，Firebase 的免费额度足够个人使用
3. **学习新技术**，之前没用过 Firebase，正好学习

CodeBuddy 立即为我生成了完整的设计文档，包括：
- 整体架构图
- Firebase 数据模型设计
- iOS App 设计
- CodeBuddy 插件设计
- Cloud Functions 设计
- 错误处理和安全考虑

### 第四步：创建新项目

我说："请重新创建一个项目，不要在本 superpowers 上新建。"

CodeBuddy 理解了我的意思，帮我创建了一个独立项目：

```bash
codebuddy-mobile-remote/
├── README.md
├── docs/
│   ├── design.md              # 完整的设计文档
│   └── implementation-plan.md # 详细的实施计划
├── ios-app/                   # iOS App 目录
├── codebuddy-plugin/          # 插件目录
├── firebase/                  # Firebase 配置
└── .gitignore
```

并初始化了 Git 仓库。

### 第五步：配置 Firebase

这是最繁琐的一步，因为需要在网页上手动操作。主要步骤：

#### 1. 创建 Firebase 项目

- 访问 https://console.firebase.google.com/
- 创建项目：`codebuddy-mobile-remote`
- 选择数据库位置：`asia-southeast1`（新加坡）

#### 2. 启用 Realtime Database

- 配置安全规则（只允许用户访问自己的数据）

#### 3. 配置 GitHub OAuth

这里遇到了第一个坑：需要先在 GitHub 创建 OAuth App。

**步骤**：
1. GitHub → Settings → Developer settings → OAuth Apps
2. 创建新应用，设置 Callback URL
3. 获取 Client ID 和 Client Secret
4. 回到 Firebase Console 填入凭证

#### 4. 下载 Service Account

用于 CodeBuddy 插件连接 Firebase：
- Firebase Console → Project Settings → Service Accounts
- Generate new private key
- 下载 JSON 文件

#### 5. 添加 iOS 应用

一开始我找不到 Web API Key，CodeBuddy 提醒我要先添加 iOS 应用。

**步骤**：
1. Firebase Console → Add iOS app
2. Bundle ID: `com.codebuddy.remote`
3. 下载 `GoogleService-Info.plist`

### 第六步：准备 Xcode 项目

这里又遇到问题：**我没安装 Xcode**。

CodeBuddy 帮我打开了 App Store 的 Xcode 页面，并告诉我：
- Xcode 大约 7-8GB
- 下载和安装需要 15-30 分钟

在等待 Xcode 安装的过程中，CodeBuddy 先帮我生成了：
- iOS App 开发指南（`ios-app/README.md`）
- Xcode 设置指南（`ios-app/XCODE_SETUP.md`）
- 详细的实施计划（`docs/implementation-plan.md`）

## 💭 真实感受和反思

### AI 的作用

这次开发过程中，CodeBuddy（AI）起到了**架构师 + 导师**的作用：

✅ **做得好的地方**：
- **系统化提问**：通过 brainstorming skill 强制我思考清楚需求
- **多方案对比**：给出 3 个不同复杂度的方案，而不是直接给答案
- **细节完善**：数据模型设计、安全规则、错误处理都考虑到了
- **文档生成**：自动生成了设计文档、实施计划、开发指南

❌ **需要改进的地方**：
- **手动操作多**：Firebase 配置都要手动在网页上操作，AI 无法自动完成
- **步骤分散**：有些步骤需要反复确认，没法一气呵成
- **缺少可视化**：架构图是文字描述，没有生成 diagrams

### 我的感受

**好的方面**：
- 🎯 **思路清晰**：Superpowers 的 brainstorming 强制我把需求想清楚
- 📚 **学到东西**：之前不懂 Firebase，现在至少知道它的数据模型和安全规则
- ⚡ **效率提升**：如果自己从零研究，可能要花好几天

**困难的地方**：
- ⏰ **等待时间长**：Xcode 安装、Firebase 配置都要等
- 🔄 **上下文切换**：在命令行、浏览器、IDE 之间来回切换
- 🤷 **不确定性**：不知道后面会不会遇到更大的坑

## 🤔 一些建议

### 给想做类似项目的人

如果你也想做一个 AI 辅助的三端协同项目，建议：

1. **先用 AI 做需求分析**
   - 不要直接开干，花 30 分钟和 AI 聊清楚
   - 用 Superpowers 之类的工具强制自己系统化思考

2. **选择合适的技术栈**
   - 新手：优先选无服务器架构（Firebase、Supabase）
   - 有经验：可以自建后端，更灵活
   - 企业级：考虑微服务

3. **分阶段验证**
   - 不要一次性做完整的 MVP
   - 先做最简单的"发消息-收消息"验证可行性

4. **做好等待的准备**
   - Xcode 安装很慢
   - Firebase 配置手动操作多
   - 第一次接触新技术会遇到各种坑

### 踩过的坑

- **找不到 Web API Key**：需要先添加 iOS 应用，才能看到 API Key
- **OAuth 回调 URL**：一定要精确匹配 Firebase 要求的格式
- **Service Account 文件**：只显示一次，下载后要妥善保管

## 📊 第一天的进度

### 时间投入

| 阶段 | 时间 |
|------|------|
| 需求分析（Brainstorming） | 30 分钟 |
| 方案设计（AI 生成） | 10 分钟 |
| Firebase 配置（手动操作） | 40 分钟 |
| 文档和代码准备 | 20 分钟 |
| **总计** | **约 1.5 小时** |

### 当前进度

✅ **已完成**：
- 需求分析和技术选型
- 完整的设计文档
- Firebase 项目配置（Database、Auth、iOS App）
- 项目结构搭建
- 开发指南文档

⏳ **进行中**：
- Xcode 安装（等待中）

📝 **待完成**：
- 创建 Xcode 项目
- 编写 iOS App 代码
- 开发 CodeBuddy 插件
- 编写 Firebase Cloud Functions
- 端到端测试

### 技术栈

**前端（iOS App）**：
- Swift + SwiftUI
- Firebase iOS SDK
- Speech Framework（语音识别）

**后端（Firebase）**：
- Realtime Database（实时数据库）
- Cloud Functions（云函数）
- Authentication（GitHub OAuth）
- Cloud Messaging（推送通知）

**插件（CodeBuddy）**：
- Node.js
- Firebase Admin SDK

## 🎉 小结

这是一个典型的**想法 → 设计 → 实施**的第一天记录。

### 核心收获

1. **AI 确实有用，但不是万能的**
   - 它能帮你快速生成设计方案和文档
   - 但具体配置和踩坑还是要自己来

2. **Superpowers 的工作流很有价值**
   - 强制头脑风暴，避免想到哪写到哪
   - 先设计后实现，代码质量更高

3. **Firebase 确实简化了很多工作**
   - 不用自己搭服务器、配置数据库
   - 但学习曲线也不低，要理解它的数据模型和规则

### 对他人的启发

如果你也想尝试 AI 辅助开发：
- ✅ 选择支持结构化工作流的工具（如 CodeBuddy + Superpowers）
- ✅ 不要急于写代码，花时间做好设计
- ✅ 选择成熟的无服务器平台，降低运维成本
- ✅ 记录过程，反思经验

### 下一步

等 Xcode 安装完成后：
1. 创建 Xcode 项目
2. 编写 iOS App 基础框架（登录、设备列表、对话界面）
3. 开发 CodeBuddy 插件（监听消息、执行命令）
4. 实现端到端通信

---

## 📝 关于这篇文章

这篇文章记录了用 AI 辅助开发一个三端协同工具的第一天。

**AI 的贡献**：
- 生成了设计文档和实施计划
- 提供了技术选型建议
- 帮助撰写了这篇博客的初稿

**我的贡献**：
- 需求思考和决策
- 手动完成 Firebase 配置
- 审查和修改 AI 生成的内容

项目还在进行中，后续会继续更新。

*写于 2026-02-10，等待 Xcode 安装的间隙* ⏳
