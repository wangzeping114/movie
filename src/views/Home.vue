<template>
  <div class="home-container">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <h1>首页</h1>
      <div class="nav-actions">
        <span class="material-icons">search</span>
        <span class="material-icons">notifications</span>
      </div>
    </div>

    <!-- 视频列表 -->
    <div class="video-list">
      <div v-for="video in videos" :key="video.id" class="video-item">
        <div class="video-cover">
          <img :src="video.cover" :alt="video.title">
          <div class="video-duration">{{ video.duration }}</div>
        </div>
        <div class="video-info">
          <h3 class="video-title">{{ video.title }}</h3>
          <div class="video-stats">
            <span>{{ video.views }}次观看</span>
            <span>{{ video.likes }}点赞</span>
          </div>
          <div class="video-author">
            <img :src="video.author.avatar" :alt="video.author.name" class="author-avatar">
            <span>{{ video.author.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 模拟视频数据
const videos = ref([
  {
    id: 1,
    title: '精彩舞蹈视频',
    cover: 'https://picsum.photos/400/600',
    duration: '03:45',
    views: '1.2万',
    likes: '2.3万',
    author: {
      name: '舞蹈达人',
      avatar: 'https://picsum.photos/50/50'
    }
  },
  {
    id: 2,
    title: '搞笑短视频合集',
    cover: 'https://picsum.photos/400/601',
    duration: '02:30',
    views: '3.4万',
    likes: '5.6万',
    author: {
      name: '搞笑王',
      avatar: 'https://picsum.photos/50/51'
    }
  },
  {
    id: 3,
    title: '美食制作教程',
    cover: 'https://picsum.photos/400/602',
    duration: '05:20',
    views: '4.5万',
    likes: '6.7万',
    author: {
      name: '美食家',
      avatar: 'https://picsum.photos/50/52'
    }
  }
])
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background-color: #0f0f0f;
  color: #ffffff;
  padding-bottom: 24px;
}

.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background-color: rgba(15, 15, 15, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 100;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-bar h1 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  background: linear-gradient(45deg, #00ff87, #60efff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-actions {
  display: flex;
  gap: 16px;
}

.nav-actions .material-icons {
  font-size: 24px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s;
}

.nav-actions .material-icons:hover {
  color: #00ff87;
}

.video-list {
  padding: 72px 16px 24px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.video-item {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
}

.video-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.video-cover {
  position: relative;
  width: 100%;
  padding-top: 150%;
}

.video-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.8);
  color: #ffffff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.video-info {
  padding: 12px;
}

.video-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-stats {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.video-author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.video-author span {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}
</style> 