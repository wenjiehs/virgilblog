---
layout: home

hero:
  name: "文杰的技术空间"
  text: "云原生 · AI Infra · 产品商业化"
  tagline: "TKE首个产品经理 | 云原生技术探索者 | 持续学习者"
  image:
    src: /avatar.png
    alt: 文杰
  actions:
    - theme: brand
      text: 阅读博客
      link: /posts/
    - theme: alt
      text: 关于我
      link: /about
---

<div class="insight-quote">
  <span class="quote-icon">💡</span>
  <p>「当信息变得唾手可得，行动力和判断力才是真正的稀缺资源」</p>
</div>

## Features

<div class="features-wrapper">
  <div class="feature-item">
    <div class="feature-icon">🚀</div>
    <h3>云原生实践</h3>
    <p>近10年容器服务产品经验，深度参与TKE从0到1的构建过程</p>
  </div>
  <div class="feature-item">
    <div class="feature-icon">🤖</div>
    <h3>AI基础设施</h3>
    <p>参与TKE向AI方向转型，探索Agent沙箱、弹性推理等技术</p>
  </div>
  <div class="feature-item">
    <div class="feature-icon">💰</div>
    <h3>商业化探索</h3>
    <p>深度参与TKE Housekeeper商业化实践，见证产品规模化增长</p>
  </div>
  <div class="feature-item">
    <div class="feature-icon">🧠</div>
    <h3>产品思维</h3>
    <p>注重客户价值创造，追求产品体验与业务价值的平衡</p>
  </div>
  <div class="feature-item">
    <div class="feature-icon">📚</div>
    <h3>技术沉淀</h3>
    <p>关注容器技术、调度算法、混部优化等云原生核心领域</p>
  </div>
  <div class="feature-item">
    <div class="feature-icon">🎯</div>
    <h3>持续成长</h3>
    <p>保持学习心态，不断探索新技术，拥抱变化与创新</p>
  </div>
</div>

<style>
.VPHome {
  padding-bottom: 48px;
}

/* 感悟语录样式 */
.insight-quote {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  max-width: 800px;
  margin: 0 auto 32px;
  padding: 16px 32px;
  background: linear-gradient(135deg, var(--vp-c-brand-soft) 0%, transparent 100%);
  border-left: 4px solid var(--vp-c-brand-1);
  border-radius: 8px;
}

.insight-quote .quote-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.insight-quote p {
  font-size: 16px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  margin: 0;
  line-height: 1.6;
  font-style: italic;
}

/* Features 样式 */
.features-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  max-width: 1200px;
  margin: 48px auto;
  padding: 0 24px;
}

.feature-item {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s;
}

.feature-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: var(--vp-c-brand-1);
}

.feature-icon {
  font-size: 40px;
  margin-bottom: 16px;
}

.feature-item h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: var(--vp-c-text-1);
}

.feature-item p {
  font-size: 14px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  margin: 0;
}

@media (max-width: 768px) {
  .hero-contact p {
    font-size: 14px;
  }
  
  .features-wrapper {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
