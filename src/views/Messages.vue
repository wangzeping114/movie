<template>
  <div class="messages-container">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <div class="nav-left">
        <i class="material-icons" @click="router.back()">arrow_back</i>
        <h1>消息</h1>
      </div>
      <div class="nav-right">
        <i class="material-icons">settings</i>
      </div>
    </div>

    <!-- 消息列表 -->
    <div class="message-list">
      <div class="message-item" v-for="message in messages" :key="message.id" @click="handleMessageClick(message)">
        <div class="message-avatar">
          <img :src="message.avatar" :alt="message.name">
          <div v-if="message.unread" class="unread-badge">{{ message.unreadCount }}</div>
        </div>
        <div class="message-content">
          <div class="message-header">
            <span class="message-name">{{ message.name }}</span>
            <span class="message-time">{{ message.time }}</span>
          </div>
          <div class="message-preview">{{ message.lastMessage }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 示例消息数据
const messages = ref([
  {
    id: 1,
    name: '小美',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    lastMessage: '你好，很高兴认识你！',
    time: '10:30',
    unread: true,
    unreadCount: 2
  },
  {
    id: 2,
    name: '阿狸',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    lastMessage: '在吗？',
    time: '昨天',
    unread: false,
    unreadCount: 0
  },
  {
    id: 3,
    name: '小甜',
    avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
    lastMessage: '好的，我知道了',
    time: '昨天',
    unread: true,
    unreadCount: 1
  }
])

const handleMessageClick = (message) => {
  // TODO: 跳转到聊天详情页
  console.log('点击消息:', message)
}
</script>

<style scoped>
.messages-container {
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

.nav-right i {
  color: #d4af37;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-right i:hover {
  transform: scale(1.1);
}

.message-list {
  padding: 72px 0 0;
}

.message-item {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.message-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.message-avatar {
  position: relative;
  width: 48px;
  height: 48px;
}

.message-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid rgba(212, 175, 55, 0.3);
}

.unread-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: #ff4d4d;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  border: 2px solid #1a1a1a;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.message-name {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.message-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.message-preview {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style> 