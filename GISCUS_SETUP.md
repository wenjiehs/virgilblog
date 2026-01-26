# 🚀 Giscus 评论系统快速配置

## 第一步：准备仓库

1. 确保仓库是 **public**（公开的）
2. 进入仓库 **Settings** → **General** → **Features**
3. 勾选 ✅ **Discussions**

## 第二步：安装 Giscus App

访问 [https://github.com/apps/giscus](https://github.com/apps/giscus)

点击 **Install**，选择 `virgilblog` 仓库

## 第三步：获取配置参数

访问 [https://giscus.app/zh-CN](https://giscus.app/zh-CN)

### 1. 输入仓库
```
wenjiehs/virgilblog
```

### 2. 选择配置
- **页面 ↔️ Discussion 映射关系**: pathname
- **Discussion 分类**: Announcements

### 3. 复制参数

从生成的代码中复制这两个值：
- `data-repo-id="R_kgDO..."`
- `data-category-id="DIC_kwDO..."`

## 第四步：更新配置

打开 `docs/.vitepress/theme/components/Comment.vue`

修改第 22-27 行：

```typescript
const giscusConfig = {
  repo: 'wenjiehs/virgilblog',      // 👈 修改这里
  repoId: 'R_kgDO...',              // 👈 粘贴 repo-id
  category: 'Announcements',
  categoryId: 'DIC_kwDO...',        // 👈 粘贴 category-id
  // ... 其他保持不变
}
```

## 第五步：测试

```bash
npm run docs:dev
```

访问任意文章页面（如 http://localhost:5173/posts/2026/welcome），底部应该显示评论框。

## ✅ 完成！

评论系统已配置完成。推送到 GitHub 后，评论会自动显示在所有文章页面底部。

---

**提示**：配置完成后可以删除 `GISCUS_SETUP.md` 和 `docs/.vitepress/giscus-config.md` 这两个文件。
