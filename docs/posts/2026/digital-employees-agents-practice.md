---
title: 我让三个 AI Agent 帮我做了一个大客户需求登记系统
date: 2026-03-04
tags: [AI编程, 产品实践, 工作流自动化, 学习笔记]
description: 用自己搭建的三个 AI Agent 完成大客户需求登记系统的真实开发记录——从一句需求到跑通的前后端
---

# 我让三个 AI Agent 帮我做了一个大客户需求登记系统

我平时做产品，需要跟踪大客户提的各种需求：哪个客户提的、要做什么、希望什么时候上线。之前用表格管理，乱得很。

正好在做一个叫 MyDigitalEmployees 的项目——想搭建一套自己的数字员工系统，其中有三个专门负责产品开发协作的 Agent 刚写好，就拿这个真实场景试了一下。

这篇文章是完整的过程记录，包括我说了什么、Agent 各自做了什么、最终交付了什么。

---

## 🤔 这三个 Agent 是干什么的？

先介绍一下主角。这三个 Agent 是我在 MyDigitalEmployees 项目里自己定义的，不是哪个工具自带的，分工明确：

### pm-requirements-analyst（产品需求分析师）

收到产品想法后，输出一份完整的需求文档。它的工作是把"一句话需求"变成结构化的需求稿——功能描述、验收标准、风险点、依赖关系。

**触发条件**：用户提出一个功能需求或产品想法，需要生成需求文档时。

### pm-task-dispatcher（任务调度员）

确保需求文档里的开发任务被持续分发给开发 Agent 执行。它监控需求队列，把任务拆解后分配出去，维持"任务不积压"的状态。

**触发条件**：产品经理 Agent 生成了需求，或有待分发的开发任务时——它的描述里提到会"持续 24/7 运行"。

### dev-task-executor（开发任务执行器）

拿到开发任务后，自主拆解成子任务，端到端执行——写代码、跑测试、处理问题、交付结果。

**触发条件**：有具体的开发任务需要执行时，不管是功能开发、bug 修复还是技术改进。

---

## 🎯 我的原始需求

就一句话：

> **"我需要一个大客户需求登记工具，我会给你说哪些大客户需求，期望什么时间上线，最终有一个看板。"**

没有说技术栈，没有说要不要后端，没有说看板长什么样。就这么一句话丢进去。

---

## 📋 pm-requirements-analyst：把一句话变成需求文档

Agent 收到需求后，先梳理了功能边界，输出了结构化的需求分析：

**核心数据模型**定义为：
- `client_name`：大客户名称
- `requirement_title`：需求标题
- `description`：需求详细描述
- `expected_online_date`：期望上线时间
- `priority`：优先级（P0/P1/P2/P3）
- `status`：当前状态（pending / in_progress / completed / cancelled）

**功能需求**拆解出三块：
1. **需求录入**：表单形式，填写上面各字段，支持新建和编辑
2. **需求列表**：表格视图，支持按客户名、优先级、状态过滤，支持分页
3. **看板视图**：按状态分四列展示，卡片显示关键信息，支持超期预警

**技术方案建议**：
- 后端：FastAPI + SQLAlchemy + SQLite（开发）
- 前端：Vite + React + TypeScript
- 接口风格：RESTful，支持 CRUD 和统计

**风险点**中提到了两个我没想到的：
1. 超期判断需要考虑时区问题（`expected_online_date` 与服务器时间对比）
2. 前后端分离后需要配置 CORS

这份文档比我自己随手写的需求要完整，特别是把超期逻辑单独提了出来，后来确实成了一个专门的功能点。

---

## 🔀 pm-task-dispatcher：把需求拆成可执行的开发任务

需求文档出来后，任务调度 Agent 把它拆解成了五个开发任务，按依赖关系排了顺序：

**Task-001：数据库层（最先执行）**
- 设计 `ClientRequirement` 表结构
- 用 SQLAlchemy ORM 实现 `api/models.py`
- 实现数据库连接层 `api/database.py`

**Task-002：API 接口层（依赖 Task-001）**
- 定义 Pydantic Schemas（`api/schemas.py`）
- 实现 CRUD 路由（`api/routes/client_requirements.py`）
- 额外增加 `/stats` 统计接口和 `/overdue` 超期列表接口

**Task-003：FastAPI 主入口（依赖 Task-002）**
- 注册路由
- 配置 CORS
- 生成 Swagger 文档

**Task-004：前端表单组件（依赖 Task-003）**
- `ClientRequirementForm.tsx`：新建/编辑双模式表单
- 必填校验 + 错误提示
- 对接后端 API

**Task-005：看板和列表视图（依赖 Task-004）**
- `KanbanBoard.tsx`：四列看板，按 status 分组
- `RequirementList.tsx`：表格视图，含搜索过滤和分页
- `App.tsx`：看板/列表 Tab 切换导航

调度 Agent 把 Task-001 分发给 dev-task-executor，并告知后续任务会在前一个完成后依次分发。

---

## 🛠️ dev-task-executor：实际写了什么代码

### 后端：CRUD API

数据模型设计得比较完整，`expected_online_date` 用了可为空的 `DateTime` 字段，状态和优先级都用了 Python Enum 确保枚举值合法：

```python
# api/models.py（核心字段）
class ClientRequirement(Base):
    __tablename__ = "client_requirements"

    id = Column(Integer, primary_key=True, index=True)
    client_name = Column(String(200), nullable=False, index=True)
    requirement_title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    expected_online_date = Column(DateTime, nullable=True)
    priority = Column(Enum(PriorityEnum), nullable=False, default=PriorityEnum.p2)
    status = Column(Enum(StatusEnum), nullable=False, default=StatusEnum.pending)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

CRUD 路由之外，还额外实现了两个我没有明确要求的接口：

- `GET /api/client-requirements/stats`：返回总数、超期数、各状态计数、各优先级计数
- `GET /api/client-requirements/overdue`：返回所有超期未完成的需求，按超期程度排序

这两个接口是 Agent 从"需要看板"这个需求里推断出来的——看板要显示统计信息和超期警告，自然需要这些数据。

所有 5 个接口（含这两个额外的）加起来，8 项功能测试全部通过。

### 前端：看板组件

看板按四个状态分列展示，卡片上显示客户名、需求标题、优先级色标和期望上线时间：

```tsx
// KanbanBoard.tsx 核心逻辑（简化）
const COLUMNS = [
  { status: 'pending',     label: '待处理'  },
  { status: 'in_progress', label: '进行中'  },
  { status: 'completed',   label: '已完成'  },
  { status: 'cancelled',   label: '已取消'  },
];

// 超期判断
function isOverdue(item: ClientRequirement): boolean {
  if (!item.expected_online_date) return false;
  if (item.status === 'completed' || item.status === 'cancelled') return false;
  return new Date(item.expected_online_date) < new Date();
}
```

超期的卡片会显示红色边框和 ⚠️ 标签，这个细节是 Agent 自己加的，来自需求文档里的风险点描述。

### 前端：列表视图

表格列：ID、大客户名称、需求标题、优先级、状态、期望上线日期、操作。

搜索栏支持：
- 客户名称模糊搜索（防抖 400ms）
- 优先级下拉过滤
- 状态下拉过滤

删除操作有二次确认弹窗，这个也是 Agent 主动加的，没有在需求里说。

### 最终交付的文件清单

```
api/
├── models.py          # SQLAlchemy 数据模型
├── database.py        # 数据库连接层
├── schemas.py         # Pydantic 请求/响应 Schema
├── main.py            # FastAPI 入口 + CORS 配置
└── routes/
    └── client_requirements.py  # CRUD + stats + overdue 路由

web/src/
├── api/clientRequirements.ts       # API 客户端封装
├── types/clientRequirement.ts      # TypeScript 类型定义
├── components/
│   ├── ClientRequirementForm.tsx   # 新建/编辑表单
│   ├── ClientRequirementForm.module.css
│   ├── KanbanBoard.tsx             # 看板视图
│   ├── KanbanBoard.module.css
│   ├── RequirementList.tsx         # 列表视图
│   └── RequirementList.module.css
└── App.tsx                         # 主页面 + Tab 导航
```

TypeScript 类型检查 0 errors，生产构建 160KB bundle，全部通过。

---

## 💭 真实感受

### 让我觉得有价值的地方

**需求文档帮我想清楚了边界**。我说的是"有一个看板"，但 pm-requirements-analyst 把它拆成了"看板视图"+"列表视图"+"录入表单"三个独立功能，还想到了超期预警这个细节。如果直接让工程师 Agent 上，这些细节很可能会缺。

**任务之间的依赖顺序处理得对**。数据库 → API → 前端表单 → 看板/列表，这个顺序很清楚。调度 Agent 没有让前端和后端同时开跑——因为前端依赖后端的 API 类型定义。

**主动推断出没说的功能**。`/stats` 统计接口、`/overdue` 超期列表、删除二次确认——这些都是 Agent 从需求语义里推断出来的，不是我明确要求的。能做到这一步，说明它确实在理解需求，不是纯粹的模板填充。

### 让我有点保留的地方

**前后端没有真正联调**。代码都生成了，构建也通过了，但 Agent 没有拉起服务验证前端能不能真正调通后端接口。这部分还是需要我自己来。

**三个 Agent 的边界在实际操作中比较模糊**。它们更像是同一个执行过程里的三种思维模式——先分析需求、再拆分任务、再执行——而不是三个独立的程序在互相传消息。"pm-task-dispatcher 持续 24/7 运行"这个描述，实际体验里更像是一次性的任务分发，而不是真正的持续调度。

**对技术选型没有争议**。Agent 直接选了 FastAPI + React，没有问我"是不是需要持久化后端"或者"有没有现成的低代码工具更合适"。对于一个产品经理来说，这个决策其实值得讨论一下。

---

## 🤔 什么时候用这个工作流比较合适？

跑完这一次，我觉得这三个 Agent 的分层设计，在以下情况下最有价值：

- **需求不是一句话能说清楚的**，需要先做功能拆解和边界界定
- **有前后端协作**，任务之间有依赖顺序，不能乱
- **你知道自己想要什么，但不确定技术上要怎么拆**

如果需求很明确（"帮我改一个 bug"、"加一个字段"），直接找工程师 Agent 更快，绕这一圈反而多余。

---

## 📝 关于这篇文章

这篇文章基于 2026-03-03 的真实对话记录撰写。代码示例是实际生成的版本（略有简化）。TODO.md 里记录的任务完成情况、工时和测试通过数均为真实数据。

文章由人工整理撰写，代码由 AI 生成，数据均已确认。

---

*这应该是目前我用 AI 做出来最接近"能跑的东西"的一次——虽然最后联调还是需要自己动手。*
