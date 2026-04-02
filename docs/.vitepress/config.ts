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
            { text: 'Human-on-the-Loop：工作站的下一步', link: '/posts/2026/workstation-human-on-the-loop' },
            { text: '工作站大升级：3 个场景到 6 个', link: '/posts/2026/workstation-major-upgrade' },
            { text: '给工作站装上竞品雷达', link: '/posts/2026/competitive-researcher-agent-build' },
            { text: 'AI 策划工作站实战', link: '/posts/2026/ai-product-planning-tcr-skills-part2' },
            { text: '让 AI 学产品写策划稿', link: '/posts/2026/ai-product-planning-tcr-skills' },
            { text: '用 Skill 让 AI 管理 TKE', link: '/posts/2026/tke-skill-ai-copilot-practice' },
            { text: '搭建产品策划工作站', link: '/posts/2026/codebuddy-product-workstation' },
            { text: 'TKE 在 AI 时代的可能性', link: '/posts/2026/cli-for-ai-agents-tke-opportunity' },
            { text: '从调研到Demo落地', link: '/posts/2026/openclaw-k8s-from-research-to-demo' },
            { text: 'OpenClaw + K8s 结合机会', link: '/posts/2026/openclaw-kubernetes-opportunity' },
            { text: '三个 AI Agent 跑完整开发流程', link: '/posts/2026/digital-employees-agents-practice' },
            { text: '当"智能溢价"归零', link: '/posts/2026/intelligence-premium-crisis' },
            { text: 'OpenClaw 协作实践', link: '/posts/2026/openclaw-collaboration-practice' },
            { text: '用 AI 设计手机控制工具', link: '/posts/2026/codebuddy-mobile-remote' },
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
