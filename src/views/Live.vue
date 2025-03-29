<template>
  <div class="live-container">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <div class="nav-left">
        <i class="material-icons" @click="router.back()">arrow_back</i>
        <h1>直播</h1>
      </div>
      <div class="nav-right">
        <i class="material-icons">search</i>
        <i class="material-icons">notifications</i>
      </div>
    </div>

    <!-- 直播列表 -->
    <div class="live-list">
      <div class="live-item" v-for="live in liveList" :key="live.id">
        <div class="live-cover">
          <img :src="live.cover" :alt="live.title">
          <div class="live-status" :class="{ 'online': live.isOnline }">
            {{ live.isOnline ? '直播中' : '未开播' }}
          </div>
        </div>
        <div class="live-info">
          <div class="live-title">{{ live.title }}</div>
          <div class="live-author">
            <img :src="live.authorAvatar" :alt="live.authorName" class="author-avatar">
            <span class="author-name">{{ live.authorName }}</span>
            <span class="viewer-count">{{ live.viewerCount }}观看</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 示例直播数据
const liveList = ref([
  {
    id: 1,
    title: '性感舞蹈直播',
    authorName: '小美',
    authorAvatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    cover: 'https://picsum.photos/400/600',
    viewerCount: 1234,
    isOnline: true
  },
  {
    id: 2,
    title: '深夜聊天室',
    authorName: '阿狸',
    authorAvatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    cover: 'https://picsum.photos/400/601',
    viewerCount: 856,
    isOnline: true
  },
  {
    id: 3,
    title: '才艺表演',
    authorName: '小甜',
    authorAvatar: 'https://randomuser.me/api/portraits/women/3.jpg',
    cover: 'https://picsum.photos/400/602',
    viewerCount: 0,
    isOnline: false
  }
])
</script>

<style scoped>
.live-container {
  min-height: 100vh;
  background: #1a1a1a;
  color: #ffffff;
  padding-bottom: 72px;
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

.nav-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-left h1 {
  font-size: 20px;
  font-weight: 600;
  color: #d4af37;
  margin: 0;
}

.nav-right {
  display: flex;
  gap: 20px;
}

.nav-right i {
  color: #d4af37;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-right i:hover {
  transform: scale(1.1);
}

.live-list {
  padding: 72px 16px 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.live-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.live-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.live-cover {
  position: relative;
  width: 100%;
  padding-top: 150%;
}

.live-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.live-status {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.6);
  font-size: 12px;
  color: #fff;
}

.live-status.online {
  background: rgba(255, 77, 77, 0.8);
}

.live-info {
  padding: 12px;
}

.live-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #fff;
}

.live-author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.author-name {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.viewer-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-left: auto;
}
</style> 