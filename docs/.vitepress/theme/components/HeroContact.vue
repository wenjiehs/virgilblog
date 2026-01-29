<template>
  <div class="hero-contact-info">
    <p>
      📧 <a href="mailto:564369394@qq.com">564369394@qq.com</a> · 💬 微信: wenjiehs
    </p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  // 将联系方式插入到 tagline 后面
  const tagline = document.querySelector('.VPHero .tagline')
  const contact = document.querySelector('.hero-contact-info')
  
  if (tagline && contact && tagline.parentNode) {
    tagline.parentNode.insertBefore(contact, tagline.nextSibling)
  }
})
</script>

<style scoped>
.hero-contact-info {
  text-align: left;
  margin: 20px 0 0 0;
  padding: 0;
}

.hero-contact-info p {
  font-size: 15px;
  color: var(--vp-c-text-2);
  margin: 0;
  line-height: 1.5;
}

.hero-contact-info a {
  color: var(--vp-c-brand-1);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.hero-contact-info a:hover {
  color: var(--vp-c-brand-2);
  opacity: 0.8;
}
</style>
