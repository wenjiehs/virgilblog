<template>
  <div class="comment-container">
    <div class="comment-wrapper">
      <div v-if="!isLoaded" class="loading">
        <div class="loading-spinner"></div>
        <p>加载评论中...</p>
      </div>
      <div ref="commentEl" class="giscus-container"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useData, useRoute } from 'vitepress'

const { isDark } = useData()
const route = useRoute()
const commentEl = ref<HTMLElement>()
const isLoaded = ref(false)

// Giscus 配置
const giscusConfig = {
  repo: 'wenjiehs/virgilblog', // 修改为你的仓库
  repoId: 'R_kgDOxxxxxx', // 需要替换为真实的 repo ID
  category: 'Announcements',
  categoryId: 'DIC_kwDOxxxxxx', // 需要替换为真实的 category ID
  mapping: 'pathname',
  strict: '0',
  reactionsEnabled: '1',
  emitMetadata: '0',
  inputPosition: 'top',
  lang: 'zh-CN',
  loading: 'lazy',
}

const loadGiscus = () => {
  if (!commentEl.value) return

  // 清空现有内容
  commentEl.value.innerHTML = ''
  isLoaded.value = false

  const script = document.createElement('script')
  script.src = 'https://giscus.app/client.js'
  script.setAttribute('data-repo', giscusConfig.repo)
  script.setAttribute('data-repo-id', giscusConfig.repoId)
  script.setAttribute('data-category', giscusConfig.category)
  script.setAttribute('data-category-id', giscusConfig.categoryId)
  script.setAttribute('data-mapping', giscusConfig.mapping)
  script.setAttribute('data-strict', giscusConfig.strict)
  script.setAttribute('data-reactions-enabled', giscusConfig.reactionsEnabled)
  script.setAttribute('data-emit-metadata', giscusConfig.emitMetadata)
  script.setAttribute('data-input-position', giscusConfig.inputPosition)
  script.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  script.setAttribute('data-lang', giscusConfig.lang)
  script.setAttribute('data-loading', giscusConfig.loading)
  script.crossOrigin = 'anonymous'
  script.async = true

  script.onload = () => {
    isLoaded.value = true
  }

  commentEl.value.appendChild(script)
}

// 监听主题变化
watch(isDark, () => {
  const iframe = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame')
  if (iframe?.contentWindow) {
    iframe.contentWindow.postMessage(
      {
        giscus: {
          setConfig: {
            theme: isDark.value ? 'dark' : 'light',
          },
        },
      },
      'https://giscus.app'
    )
  }
})

// 监听路由变化，重新加载评论
watch(() => route.path, loadGiscus)

onMounted(() => {
  loadGiscus()
})
</script>

<style scoped>
.comment-container {
  margin-top: 64px;
  padding-top: 48px;
  border-top: 1px solid var(--vp-c-divider);
}

.comment-wrapper {
  max-width: 1152px;
  margin: 0 auto;
  padding: 0 24px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  color: var(--vp-c-text-2);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--vp-c-divider);
  border-top-color: var(--vp-c-brand-1);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading p {
  font-size: 14px;
  margin: 0;
}

.giscus-container {
  min-height: 200px;
}

/* 响应式 */
@media (max-width: 768px) {
  .comment-container {
    margin-top: 48px;
    padding-top: 32px;
  }

  .comment-wrapper {
    padding: 0 16px;
  }
}
</style>
