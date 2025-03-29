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
      <div 
        v-for="message in sortedMessages" 
        :key="message.id" 
        class="message-wrapper"
        :class="{ 'sliding': message.isSliding }"
        @touchstart="handleTouchStart($event, message)"
        @touchmove="handleTouchMove($event)"
        @touchend="handleTouchEnd($event)"
      >
        <div class="message-slide-content" @click="handleMessageClick(message)">
          <div class="message-item" :class="{ 'pinned': message.isPinned }">
            <div class="message-avatar">
              <img :src="message.avatar" :alt="message.name">
              <div v-if="message.unread" class="unread-badge">{{ message.unreadCount }}</div>
            </div>
            <div class="message-content">
              <div class="message-header">
                <span class="message-name">
                  {{ message.name }}
                  <span v-if="message.isPinned" class="pinned-tag">[置顶]</span>
                </span>
                <span class="message-time">{{ message.time }}</span>
              </div>
              <div class="message-preview">{{ message.lastMessage }}</div>
            </div>
          </div>
        </div>
        <div class="message-actions">
          <div class="action-btn mark-read" v-if="message.unread" @click="handleMarkRead(message)">
            <i class="material-icons">done_all</i>
            <span>已读</span>
          </div>
          <div class="action-btn pin" @click="handlePin(message)">
            <i class="material-icons" style="width: 24px;height: 24px;">{{ message.isPinned ? 'push_pin_off' : 'push_pin' }}</i>
            <span>{{ message.isPinned ? '取消置顶' : '置顶' }}</span>
          </div>
          <div class="action-btn delete" @click="handleDelete(message)">
            <i class="material-icons">delete</i>
            <span>删除</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentSlideElement = ref(null)

// 示例消息数据，确保每个消息有isSliding属性
const messages = ref([
  {
    id: 1,
    name: '小美',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    lastMessage: '你好，很高兴认识你！',
    time: '10:30',
    unread: true,
    unreadCount: 2,
    isPinned: true, // 默认置顶
    isSliding: false
  },
  {
    id: 2,
    name: '阿狸',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    lastMessage: '在吗？',
    time: '昨天',
    unread: false,
    unreadCount: 0,
    isPinned: false,
    isSliding: false
  },
  {
    id: 3,
    name: '小甜',
    avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
    lastMessage: '好的，我知道了',
    time: '昨天',
    unread: true,
    unreadCount: 1,
    isPinned: false,
    isSliding: false
  }
])

// 添加滑动相关变量
const slidingMessage = ref(null)
const startX = ref(0)
const currentX = ref(0)
const isDragging = ref(false)

// 使用计算属性来确保顶置消息在前面
const sortedMessages = computed(() => {
  const pinnedMessages = messages.value.filter(m => m.isPinned)
  const unpinnedMessages = messages.value.filter(m => !m.isPinned)
  return [...pinnedMessages, ...unpinnedMessages]
})

// 处理触摸开始
const handleTouchStart = (event, message) => {
  // 关闭其他所有打开的消息
  messages.value.forEach(m => {
    if (m !== message && m.isSliding) {
      m.isSliding = false
    }
  })
  
  // 获取当前消息的滑动元素
  const slideElement = event.currentTarget.querySelector('.message-slide-content')
  
  // 重置所有其他消息的滑动状态
  document.querySelectorAll('.message-wrapper.sliding').forEach(el => {
    if (el !== event.currentTarget) {
      el.classList.remove('sliding')
      const content = el.querySelector('.message-slide-content')
      if (content) {
        content.style.transform = 'translateX(0)'
      }
    }
  })
  
  isDragging.value = true
  startX.value = event.touches[0].clientX
  currentX.value = startX.value
  slidingMessage.value = message
  currentSlideElement.value = slideElement
}

// 处理触摸移动
const handleTouchMove = (event) => {
  if (!isDragging.value || !currentSlideElement.value) return
  event.preventDefault() // 阻止默认滚动
  currentX.value = event.touches[0].clientX
  const diff = currentX.value - startX.value
  
  // 限制只能向左滑动，且最大滑动距离为240px
  if (diff <= 0 && diff >= -240) {
    currentSlideElement.value.style.transform = `translateX(${diff}px)`
  }
}

// 处理触摸结束
const handleTouchEnd = (event) => {
  if (!isDragging.value || !currentSlideElement.value) return
  isDragging.value = false
  const diff = currentX.value - startX.value
  const messageWrapper = currentSlideElement.value.parentElement
  
  if (diff < -80) { // 降低滑动阈值以便更容易触发
    currentSlideElement.value.style.transform = 'translateX(-240px)'
    messageWrapper.classList.add('sliding')
    if (slidingMessage.value) {
      slidingMessage.value.isSliding = true
    }
  } else {
    currentSlideElement.value.style.transform = 'translateX(0)'
    messageWrapper.classList.remove('sliding')
    if (slidingMessage.value) {
      slidingMessage.value.isSliding = false
    }
  }
}

// 处理标为已读
const handleMarkRead = (message) => {
  // 获取消息的索引
  const index = messages.value.findIndex(m => m.id === message.id)
  if (index === -1) return
  
  // 更新消息
  messages.value[index].unread = false
  messages.value[index].unreadCount = 0
  messages.value[index].isSliding = false
  
  // 关闭滑动状态
  document.querySelectorAll('.message-wrapper.sliding').forEach(el => {
    el.classList.remove('sliding')
    const content = el.querySelector('.message-slide-content')
    if (content) {
      content.style.transform = 'translateX(0)'
    }
  })
  
  // 重置当前滑动元素
  currentSlideElement.value = null
}

// 处理顶置
const handlePin = (message) => {
  // 获取消息的索引
  const index = messages.value.findIndex(m => m.id === message.id)
  if (index === -1) return
  
  // 创建消息的副本并更新顶置状态
  const updatedMessage = { ...message, isPinned: !message.isPinned, isSliding: false }
  
  // 更新消息
  messages.value[index] = updatedMessage
  
  // 关闭滑动状态
  const slideElements = document.querySelectorAll('.message-wrapper.sliding')
  slideElements.forEach(el => {
    el.classList.remove('sliding')
    const content = el.querySelector('.message-slide-content')
    if (content) {
      content.style.transform = 'translateX(0)'
    }
  })
  
  // 重置当前滑动元素
  currentSlideElement.value = null
}

// 处理删除
const handleDelete = (message) => {
  if (confirm('确定要删除这条消息吗？')) {
    // 获取消息的索引
    const index = messages.value.findIndex(m => m.id === message.id)
    if (index === -1) return
    
    // 删除消息
    messages.value.splice(index, 1)
    
    // 关闭滑动状态
    document.querySelectorAll('.message-wrapper.sliding').forEach(el => {
      el.classList.remove('sliding')
      const content = el.querySelector('.message-slide-content')
      if (content) {
        content.style.transform = 'translateX(0)'
      }
    })
    
    // 重置当前滑动元素
    currentSlideElement.value = null
  }
}

const handleMessageClick = (message) => {
  router.push({
    name: 'chat',
    params: { id: message.id }
  })
}

// 监听消息列表变化
watch(messages, (newVal) => {
  console.log('消息列表状态变化:', JSON.stringify(newVal.map(m => ({id: m.id, name: m.name, isPinned: m.isPinned}))))
}, { deep: true })
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

.message-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  touch-action: none; /* 禁止所有默认触摸行为 */
}

.message-slide-content {
  position: relative;
  width: 100%;
  transition: transform 0.3s ease;
  z-index: 1;
}

.message-item {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  user-select: none;
  background: #1a1a1a; /* 添加默认背景色 */
}

.message-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.message-actions {
  position: absolute;
  top: 0;
  right: -240px;
  height: 100%;
  display: flex;
  align-items: center;
  z-index: 0;
}

.message-wrapper.sliding .message-actions {
  right: 0;
}

.action-btn {
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 100%;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.message-wrapper .message-item:has(.unread-badge) ~ .message-actions .mark-read {
  display: flex;
}

.message-wrapper.sliding .action-btn {
  display: flex;
}

.action-btn i {
  font-size: 24px;
  margin-bottom: 8px;
}

.action-btn span {
  font-size: 12px;
  white-space: nowrap;
}

.mark-read {
  background: #4CAF50;
}

.pin {
  background: #ffc107;
}

.delete {
  background: #F44336;
}

.action-btn:hover {
  opacity: 0.9;
}

/* 添加滑动效果 */
.message-wrapper.sliding .message-slide-content {
  transform: translateX(-240px);
}

.message-avatar {
  position: relative;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
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
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-item.pinned {
  position: relative;
  background: rgba(255, 193, 7, 0.1);
  border-bottom: 1px solid rgba(255, 193, 7, 0.3);
}

.message-item.pinned::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #ffc107;
}

.pinned-tag {
  color: #ffc107;
  font-size: 12px;
  margin-left: 4px;
  font-weight: normal;
  background: rgba(255, 193, 7, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
}
</style> 