import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import './style.css'
import PostLayout from './components/PostLayout.vue'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'doc-after': () => h(PostLayout)
    })
  },
  enhanceApp({ app, router, siteData }) {
    // Register custom components if needed
  }
}
