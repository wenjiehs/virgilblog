<template>
  <div class="post-layout">
    <!-- 评论组件 -->
    <Comment v-if="showComment" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRoute } from 'vitepress'
import Comment from './Comment.vue'

const { frontmatter } = useData()
const route = useRoute()

// 判断是否显示评论
// 1. 文章页面显示评论（posts/ 目录下）
// 2. frontmatter 中没有设置 comment: false
const showComment = computed(() => {
  const isPostPage = route.path.startsWith('/posts/') && route.path !== '/posts/'
  const commentEnabled = frontmatter.value.comment !== false
  return isPostPage && commentEnabled
})
</script>

<style scoped>
.post-layout {
  width: 100%;
}

.post-content {
  margin-bottom: 32px;
}
</style>
