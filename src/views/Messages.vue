<template>
  <div class="messages-container">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <div class="nav-left">
        <i v-if="!isEditing" class="material-icons" @click="router.back()">arrow_back</i>
        <i v-else class="material-icons" @click="cancelEdit">close</i>
        <h1>{{ isEditing ? `已选择 ${selectedMessages.length} 项` : '消息' }}</h1>
      </div>
      <div class="nav-right">
        <span v-if="!isEditing" class="edit-btn" @click="startEdit">编辑</span>
        <template v-else>
          <span class="action-text" @click="handleBatchDelete" v-if="selectedMessages.length > 0">删除</span>
          <span class="action-text" @click="selectAll">{{ isAllSelected ? '取消全选' : '全选' }}</span>
        </template>
      </div>
    </div>

    <!-- 下拉刷新指示器 -->
    <div class="refresh-indicator" :class="{ 'refreshing': isRefreshing }">
      <i class="material-icons" :style="{ transform: `rotate(${refreshDistance.value * 3}deg)` }">refresh</i>
      <span>{{ isRefreshing ? '正在刷新...' : '下拉刷新' }}</span>
    </div>

    <!-- 消息列表 -->
    <div 
      class="message-list"
      :class="{ 'editing-mode': isEditing }"
      @touchstart="handlePullStart"
      @touchmove="handlePullMove"
      @touchend="handlePullEnd"
    >
      <div 
        v-for="message in sortedMessages" 
        :key="message.id" 
        class="message-wrapper"
        :class="{ 'sliding': message.isSliding, 'editing': isEditing }"
        :data-id="message.id"
        @touchstart.stop="!isEditing && handleTouchStart($event, message)"
        @touchmove.stop="!isEditing && handleTouchMove($event)"
        @touchend.stop="!isEditing && handleTouchEnd($event)"
      >
        <div class="checkbox-wrapper" v-if="isEditing">
          <input 
            type="checkbox" 
            :checked="selectedMessages.includes(message.id)"
            @change="toggleSelect(message)"
          >
        </div>
        <div class="message-slide-content" @click="handleItemClick(message)">
          <div class="message-item">
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
        <div class="message-actions" v-if="!isEditing">
          <div class="action-btn mark-read" v-if="message.unread" @click="handleMarkRead(message)">
            <i class="material-icons">done_all</i>
            <span>已读</span>
          </div>
          <div class="action-btn delete" @click="handleDelete(message)">
            <i class="material-icons">delete</i>
            <span>删除</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 单条消息删除确认弹窗 -->
    <ConfirmDialog
      v-model="showDeleteDialog"
      title="删除消息"
      message="确定要删除这条消息吗？"
      @confirm="confirmDelete"
    />
    
    <!-- 批量删除确认弹窗 -->
    <ConfirmDialog
      v-model="showBatchDeleteDialog"
      title="批量删除"
      :message="`确定要删除选中的 ${selectedMessages.length} 条消息吗？`"
      @confirm="confirmBatchDelete"
    />
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import ConfirmDialog from '../components/ConfirmDialog.vue'

const router = useRouter()
const currentSlideElement = ref(null)
const isEditing = ref(false)
const selectedMessages = ref([])

// 添加确认弹窗相关的状态
const showDeleteDialog = ref(false)
const showBatchDeleteDialog = ref(false)
const messageToDelete = ref(null)

// 下拉刷新相关状态
const isRefreshing = ref(false)
const startY = ref(0)
const refreshDistance = ref(0)
const maxRefreshDistance = 80
const refreshThreshold = 60

// 添加排序后的消息列表计算属性
const sortedMessages = computed(() => {
  return [...messages.value].sort((a, b) => {
    // 首先按未读状态排序
    if (a.unread && !b.unread) return -1
    if (!a.unread && b.unread) return 1
    // 然后按时间排序（这里假设time字段是字符串，实际应用中应该使用时间戳）
    return b.time.localeCompare(a.time)
  })
})

// 计算是否全部选中
const isAllSelected = computed(() => {
  return messages.value.length > 0 && selectedMessages.value.length === messages.value.length
})

// 生成测试消息数据的函数
const generateTestMessages = (startId, count) => {
  const messages = []
  const names = ['小美', '阿狸', '小甜', '小雨', '小花', '小月', '小星', '小云', '小风', '小雪']
  const messages_content = [
    '你好，很高兴认识你！',
    '在吗？有个问题想请教你',
    '周末一起去看电影吗？',
    '项目进展得怎么样了？',
    '记得下周要开会哦',
    '资料我已经发给你了',
    '晚上有空吗？',
    '这个问题我们需要讨论一下',
    '新版本已经上线了',
    '谢谢你的帮助！'
  ]
  const times = ['刚刚', '5分钟前', '10分钟前', '30分钟前', '1小时前', '2小时前', '昨天', '前天', '星期一', '上周']

  for (let i = 0; i < count; i++) {
    const id = startId + i
    const randomUnread = Math.random() > 0.5
    messages.push({
      id,
      name: names[Math.floor(Math.random() * names.length)],
      avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'women' : 'men'}/${id % 70 + 1}.jpg`,
      lastMessage: messages_content[Math.floor(Math.random() * messages_content.length)],
      time: times[Math.floor(Math.random() * times.length)],
      unread: randomUnread,
      unreadCount: randomUnread ? Math.floor(Math.random() * 5) + 1 : 0,
      isSliding: false
    })
  }
  return messages
}

// 示例消息数据
const messages = ref(generateTestMessages(1, 20))

// 添加滑动相关变量
const slidingMessage = ref(null)
const startX = ref(0)
const currentX = ref(0)
const isDragging = ref(false)

// 添加长按相关变量
const longPressTimer = ref(null)
const longPressDelay = 500 // 长按触发时间（毫秒）

// 修改消息点击处理函数
const handleItemClick = (message) => {
  if (isEditing.value) {
    toggleSelect(message)
  } else {
    // 直接进入聊天页面
    handleMessageClick(message)
  }
}

// 修改开始编辑模式函数
const startEdit = () => {
  isEditing.value = true
  selectedMessages.value = []
  // 重置所有滑动状态
  messages.value.forEach(message => {
    if (message.isSliding) {
      resetSlide(message)
    }
  })
}

// 取消编辑模式
const cancelEdit = () => {
  isEditing.value = false
  selectedMessages.value = []
}

// 切换选择状态
const toggleSelect = (message) => {
  const index = selectedMessages.value.indexOf(message.id)
  if (index === -1) {
    selectedMessages.value.push(message.id)
  } else {
    selectedMessages.value.splice(index, 1)
  }
}

// 全选/取消全选
const selectAll = () => {
  if (isAllSelected.value) {
    selectedMessages.value = []
  } else {
    selectedMessages.value = messages.value.map(m => m.id)
  }
}

// 处理删除
const handleDelete = (message) => {
  messageToDelete.value = message
  showDeleteDialog.value = true
}

// 确认删除单条消息
const confirmDelete = () => {
  const index = messages.value.findIndex(m => m.id === messageToDelete.value.id)
  if (index === -1) return
  
  messages.value.splice(index, 1)
  
  // 关闭滑动状态并重置样式
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
  slidingMessage.value = null
  messageToDelete.value = null
}

// 处理批量删除
const handleBatchDelete = () => {
  if (selectedMessages.value.length === 0) return
  showBatchDeleteDialog.value = true
}

// 确认批量删除
const confirmBatchDelete = () => {
  messages.value = messages.value.filter(m => !selectedMessages.value.includes(m.id))
  cancelEdit()
}

// 修改触摸开始处理函数
const handleTouchStart = (event, message) => {
  // 如果已经在滑动其他消息，先重置
  if (slidingMessage.value && slidingMessage.value !== message) {
    resetSlide(slidingMessage.value)
  }
  
  // 设置长按定时器
  longPressTimer.value = setTimeout(() => {
    startX.value = event.touches[0].clientX
    currentX.value = event.touches[0].clientX
    isDragging.value = true
    slidingMessage.value = message
    message.isSliding = true
  }, longPressDelay)
  
  // 阻止事件冒泡，防止触发点击事件
  event.stopPropagation()
}

// 修改触摸移动处理函数
const handleTouchMove = (event) => {
  // 如果长按定时器还在，清除它
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
    return
  }
  
  if (!isDragging.value || !slidingMessage.value) return
  
  currentX.value = event.touches[0].clientX
  const diff = currentX.value - startX.value
  
  // 只允许向左滑动
  if (diff < 0) {
    const slideElement = document.querySelector(`.message-wrapper[data-id="${slidingMessage.value.id}"]`)
    if (slideElement) {
      const content = slideElement.querySelector('.message-slide-content')
      if (content) {
        content.style.transform = `translateX(${Math.max(diff, -240)}px)`
      }
    }
  }
  
  // 阻止事件冒泡，防止触发点击事件
  event.stopPropagation()
}

// 修改触摸结束处理函数
const handleTouchEnd = (event) => {
  // 清除长按定时器
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
    return
  }
  
  if (!isDragging.value || !slidingMessage.value) return
  
  const diff = currentX.value - startX.value
  
  // 如果滑动距离超过阈值，保持展开状态
  if (diff < -120) {
    const slideElement = document.querySelector(`.message-wrapper[data-id="${slidingMessage.value.id}"]`)
    if (slideElement) {
      const content = slideElement.querySelector('.message-slide-content')
      if (content) {
        content.style.transform = 'translateX(-240px)'
      }
    }
  } else {
    // 否则重置位置
    resetSlide(slidingMessage.value)
  }
  
  isDragging.value = false
  
  // 阻止事件冒泡，防止触发点击事件
  event.stopPropagation()
}

// 添加重置滑动状态的函数
const resetSlide = (message) => {
  const slideElement = document.querySelector(`.message-wrapper[data-id="${message.id}"]`)
  if (slideElement) {
    const content = slideElement.querySelector('.message-slide-content')
    if (content) {
      content.style.transform = 'translateX(0)'
    }
  }
  message.isSliding = false
  slidingMessage.value = null
}

// 处理标为已读
const handleMarkRead = (message) => {
  // 获取消息的索引
  const index = messages.value.findIndex(m => m.id === message.id)
  if (index === -1) return
  
  // 更新消息
  messages.value[index] = {
    ...messages.value[index],
    unread: false,
    unreadCount: 0,
    isSliding: false
  }
  
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
  
  // 触发一次刷新以重新排序消息
  messages.value = [...messages.value]
}

const handleMessageClick = (message) => {
  router.push({
    name: 'chat',
    params: { id: message.id }
  })
}

// 处理下拉刷新开始
const handlePullStart = (event) => {
  if (isRefreshing.value || isEditing.value) return
  const scrollTop = document.querySelector('.message-list').scrollTop
  if (scrollTop > 0) return // 只有在顶部才能下拉刷新
  
  startY.value = event.touches[0].clientY
}

// 处理下拉刷新移动
const handlePullMove = (event) => {
  if (isRefreshing.value || isEditing.value) return
  const scrollTop = document.querySelector('.message-list').scrollTop
  if (scrollTop > 0) return
  
  const currentY = event.touches[0].clientY
  const diff = currentY - startY.value
  
  if (diff > 0) {
    event.preventDefault()
    refreshDistance.value = Math.min(diff * 0.5, maxRefreshDistance)
    document.querySelector('.message-list').style.transform = `translateY(${refreshDistance.value}px)`
  }
}

// 处理下拉刷新结束
const handlePullEnd = async () => {
  if (isEditing.value) return
  
  if (refreshDistance.value >= refreshThreshold) {
    isRefreshing.value = true
    await refreshMessages()
  }
  
  refreshDistance.value = 0
  document.querySelector('.message-list').style.transform = 'translateY(0)'
  setTimeout(() => {
    isRefreshing.value = false
  }, 300)
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
  height: calc(100vh - 72px);
  overflow-y: auto;
  transition: transform 0.3s ease;
  -webkit-overflow-scrolling: touch;
}

.message-wrapper {
  position: relative;
  width: 100%;
  background-color: #1a1a1a;
  overflow: hidden;
  touch-action: pan-y pinch-zoom;
}

.message-wrapper.sliding {
  z-index: 1;
}

.message-slide-content {
  position: relative;
  width: 100%;
  background-color: #1a1a1a;
  transition: transform 0.3s ease-out;
  will-change: transform;
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
  background-color: #1a1a1a;
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
  transition: right 0.3s ease;
}

.message-wrapper.sliding .message-actions {
  right: 0;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 100%;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mark-read {
  background: #4CAF50;
}

.delete {
  background: #F44336;
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

.edit-btn, .action-text {
  color: #d4af37;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
}

.nav-right {
  display: flex;
  gap: 16px;
  align-items: center;
}

.checkbox-wrapper {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
}

.checkbox-wrapper input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.message-wrapper.editing {
  pointer-events: auto !important;
}

.message-wrapper.editing .message-actions {
  display: none;
}

.message-wrapper.editing .message-slide-content {
  transform: none !important;
}

.refresh-indicator {
  position: fixed;
  top: 56px;
  left: 0;
  right: 0;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #d4af37;
  font-size: 14px;
  transform: translateY(-50px);
  transition: transform 0.3s ease;
  z-index: 99;
  pointer-events: none;
}

.refresh-indicator i {
  transition: transform 0.3s ease;
}

.refresh-indicator.refreshing i {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.message-list.editing-mode {
  touch-action: none;
  overflow: hidden;
}

.message-list.editing-mode .message-wrapper {
  pointer-events: auto;
}

.message-wrapper.editing {
  pointer-events: auto !important;
}

.message-wrapper.editing .message-actions {
  display: none;
}

.message-wrapper.editing .message-slide-content {
  transform: none !important;
}
</style> 