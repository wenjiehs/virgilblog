# Virgil Blog

> A modern tech-style personal blog powered by VitePress

## 🚀 Features

- ⚡️ **Fast & Modern** - Built with VitePress and Vue 3
- 🎨 **Tech-Style Design** - Futuristic and responsive UI
- 📝 **Markdown Support** - Write posts in Markdown with code highlighting
- 🔍 **Local Search** - Built-in search functionality
- 💬 **Comments** - Integrated with Giscus (GitHub Discussions)
- 📱 **Responsive** - Optimized for mobile and desktop
- 🌙 **Dark Mode** - Auto dark/light theme switching
- 🚀 **GitHub Pages** - Easy deployment with GitHub Actions

## 📦 Tech Stack

- [VitePress](https://vitepress.dev/) - Static site generator
- [Vue 3](https://vuejs.org/) - Progressive JavaScript framework
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [Giscus](https://giscus.app/) - Comments system

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm / yarn / pnpm

### Installation

```bash
# Install dependencies
npm install

# Start dev server
npm run docs:dev

# Build for production
npm run docs:build

# Preview production build
npm run docs:preview
```

## 📁 Project Structure

```
virgilblog/
├── .github/workflows/    # GitHub Actions
├── docs/
│   ├── .vitepress/      # VitePress config
│   │   ├── config.ts    # Site configuration
│   │   └── theme/       # Custom theme
│   ├── posts/           # Blog posts
│   ├── public/          # Static assets
│   ├── about.md         # About page
│   └── index.md         # Home page
├── .gitignore
├── package.json
├── README.md
└── TODO.md
```

## 💬 Setup Comments (Giscus)

This blog uses [Giscus](https://giscus.app/) for comments. To enable:

1. Enable **Discussions** in repository settings
2. Install [Giscus app](https://github.com/apps/giscus)
3. Get configuration from [giscus.app](https://giscus.app/)
4. Update `docs/.vitepress/theme/components/Comment.vue`

See `GISCUS_SETUP.md` for detailed instructions.

## 🚀 Deployment

This blog is automatically deployed to GitHub Pages via GitHub Actions.

### Setup GitHub Pages

1. Go to repository Settings → Pages
2. Set Source to "GitHub Actions"
3. Push to `main` branch to trigger deployment

### Important: Update base path

In `docs/.vitepress/config.ts`:

```typescript
// For GitHub Pages (username.github.io/repo-name)
base: '/virgilblog/',

// For custom domain (yourdomain.com)
base: '/',
```

## 📝 Writing Posts

Create a new markdown file in `docs/posts/`:

```markdown
---
title: Your Post Title
date: 2026-01-26
tags: [tech, vue, blog]
description: Post description
---

# Your Post Title

Your content here...
```

## 📄 License

MIT License

## 👤 Author

Wenjie

---

Built with ❤️ using VitePress
