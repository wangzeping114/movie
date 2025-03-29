<template>
  <div class="home-view">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <div class="nav-left">
        <h1>首页</h1>
      </div>
      <div class="nav-right">
        <button class="action-btn">
          <i class="material-icons">search</i>
        </button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content">
      <div class="welcome-section">
        <h2>欢迎回来</h2>
        <p>发现更多精彩内容</p>
      </div>

      <!-- 推荐内容 -->
      <div class="recommended-section">
        <h3>推荐内容</h3>
        <div class="content-grid">
          <div v-for="i in 6" :key="i" class="content-card">
            <img :src="`https://picsum.photos/300/200?random=${i}`" alt="推荐内容">
            <div class="card-info">
              <h4>推荐标题 {{ i }}</h4>
              <p>这是一段推荐内容的描述文字...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 这里可以添加需要的逻辑
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  background: #1a1f2a;
  color: #fff;
}

.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  z-index: 100;
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
}

.nav-left h1 {
  font-size: 18px;
  font-weight: 600;
  color: #d4af37;
  margin: 0;
}

.action-btn {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.content {
  padding: 72px 16px 16px;
}

.welcome-section {
  margin-bottom: 32px;
}

.welcome-section h2 {
  font-size: 24px;
  font-weight: 600;
  color: #d4af37;
  margin-bottom: 8px;
}

.welcome-section p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
}

.recommended-section h3 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.content-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.content-card:hover {
  transform: translateY(-4px);
}

.content-card img {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.card-info {
  padding: 12px;
}

.card-info h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.card-info p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}
</style> 