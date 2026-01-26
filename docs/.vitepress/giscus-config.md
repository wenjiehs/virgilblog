# Giscus 评论系统配置指南

本项目使用 [Giscus](https://giscus.app/) 作为评论系统，基于 GitHub Discussions。

## 📋 配置步骤

### 1. 准备 GitHub 仓库

确保你的 GitHub 仓库满足以下条件：

- ✅ 仓库是**公开的**（public）
- ✅ 已安装 [Giscus app](https://github.com/apps/giscus)
- ✅ 仓库已启用 **Discussions** 功能

#### 启用 Discussions

1. 进入仓库 Settings
2. 找到 Features 部分
3. 勾选 **Discussions**

### 2. 安装 Giscus App

访问 [https://github.com/apps/giscus](https://github.com/apps/giscus)，点击 Install，选择你的仓库。

### 3. 获取配置参数

访问 [https://giscus.app/zh-CN](https://giscus.app/zh-CN)，按照以下步骤操作：

#### 3.1 输入仓库信息

在"仓库"输入框中填写：
```
你的GitHub用户名/virgilblog
```
例如：`virgilliang/virgilblog`

#### 3.2 选择页面 ↔️ Discussion 映射关系

推荐选择：
- **路径名（pathname）** - 使用文章路径作为标识

#### 3.3 选择 Discussion 分类

推荐选择：
- **Announcements** - 只有维护者可以创建新讨论，但所有人都可以评论

#### 3.4 获取配置代码

网页会自动生成配置代码，找到以下两个重要参数：

```html
<script src="https://giscus.app/client.js"
        data-repo="用户名/仓库名"
        data-repo-id="R_kgDOxxxxxx"       <!-- 复制这个 -->
        data-category="Announcements"
        data-category-id="DIC_kwDOxxxxxx"  <!-- 复制这个 -->
        ...>
</script>
```

### 4. 更新配置文件

打开 `docs/.vitepress/theme/components/Comment.vue`，找到 `giscusConfig` 部分：

```typescript
const giscusConfig = {
  repo: 'virgilliang/virgilblog', // 修改为你的仓库
  repoId: 'R_kgDOxxxxxx',         // 从 giscus.app 获取
  category: 'Announcements',
  categoryId: 'DIC_kwDOxxxxxx',   // 从 giscus.app 获取
  // ... 其他配置保持不变
}
```

**必须修改的参数**：
- `repo`: 你的 GitHub 用户名/仓库名
- `repoId`: 从 giscus.app 获取的 data-repo-id
- `categoryId`: 从 giscus.app 获取的 data-category-id

### 5. 测试评论功能

1. 启动开发服务器：
   ```bash
   npm run docs:dev
   ```

2. 访问任意文章页面（如 `/posts/2026/welcome.html`）

3. 页面底部应该显示 Giscus 评论框

4. 尝试发表评论（需要 GitHub 账号登录）

## 🎨 自定义配置

### 禁用特定页面的评论

在文章的 frontmatter 中添加：

```yaml
---
title: 文章标题
comment: false  # 禁用评论
---
```

### 修改评论主题

评论主题会自动跟随博客的明暗模式切换。

### 修改语言

在 `Comment.vue` 中修改：

```typescript
lang: 'zh-CN', // 中文
// lang: 'en',  // 英文
```

### 修改评论框位置

```typescript
inputPosition: 'top',    // 评论框在顶部
// inputPosition: 'bottom', // 评论框在底部
```

## 🔧 常见问题

### 1. 评论框不显示

**原因**：
- 仓库不是公开的
- 未安装 Giscus app
- 未启用 Discussions
- repoId 或 categoryId 不正确

**解决**：
- 检查仓库设置
- 重新获取配置参数

### 2. 评论加载很慢

**原因**：Giscus 依赖 GitHub API，可能受网络影响

**解决**：
- 已设置 `loading: 'lazy'`（延迟加载）
- 可以考虑使用 CDN 加速

### 3. 主题不切换

**原因**：iframe 通信问题

**解决**：
- 检查控制台是否有错误
- 刷新页面重新加载

## 📚 相关资源

- [Giscus 官网](https://giscus.app/)
- [Giscus GitHub](https://github.com/giscus/giscus)
- [GitHub Discussions 文档](https://docs.github.com/en/discussions)

## ⚠️ 注意事项

1. **隐私**：评论内容存储在 GitHub Discussions，完全公开
2. **审核**：作为维护者，你可以在 Discussions 中管理评论
3. **备份**：定期导出 Discussions 数据作为备份
4. **速率限制**：GitHub API 有速率限制，高访问量可能受影响

---

配置完成后，记得删除本文件或移动到 `docs/` 外部！
