import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Virgil Blog',
  description: 'A tech-style personal blog powered by VitePress',
  lang: 'zh-CN',
  
  // GitHub Pages base path (change if using custom domain)
  base: '/virgilblog/',
  
  // Clean URLs
  cleanUrls: true,
  
  // Theme configuration
  themeConfig: {
    // Navigation
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Blog', link: '/posts/' },
      { text: 'About', link: '/about' }
    ],
    
    // Sidebar for blog posts
    sidebar: {
      '/posts/': [
        {
          text: 'Blog Posts',
          items: [
            { text: 'All Posts', link: '/posts/' }
          ]
        },
        {
          text: '2026',
          collapsed: false,
          items: [
            { text: '用 AI 搭建工作流自动化工具', link: '/posts/2026/openclaw-skills-practice' },
            { text: '用 AI 分析 2800 条需求', link: '/posts/2026/ai-requirements-analysis' },
            { text: '重构 TKE Workshop', link: '/posts/2026/tke-workshop-refactor' },
            { text: '欢迎来到我的博客', link: '/posts/2026/welcome' }
          ]
        }
      ]
    },
    
    // Social links
    socialLinks: [
      { icon: 'github', link: 'https://github.com/wenjiehs' }
    ],
    
    // Footer
    footer: {
      message: 'Built with VitePress',
      copyright: 'Copyright © 2026 Wenjie'
    },
    
    // Search
    search: {
      provider: 'local',
      options: {
        placeholder: 'Search...',
        translations: {
          button: {
            buttonText: 'Search',
            buttonAriaLabel: 'Search'
          },
          modal: {
            displayDetails: 'Display details',
            resetButtonTitle: 'Reset search',
            backButtonTitle: 'Close search',
            noResultsText: 'No results for',
            footer: {
              selectText: 'to select',
              selectKeyAriaLabel: 'enter',
              navigateText: 'to navigate',
              navigateUpKeyAriaLabel: 'up arrow',
              navigateDownKeyAriaLabel: 'down arrow',
              closeText: 'to close',
              closeKeyAriaLabel: 'escape'
            }
          }
        }
      }
    },
    
    // Edit link
    editLink: {
      pattern: 'https://github.com/wenjiehs/virgilblog/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },
    
    // Last updated
    lastUpdated: {
      text: 'Last updated',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    }
  },
  
  // Markdown configuration
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true
  },
  
  // Head tags
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#646cff' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'zh-CN' }],
    ['meta', { name: 'og:site_name', content: 'Virgil Blog' }]
  ]
})
