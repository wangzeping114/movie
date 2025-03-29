<template>
  <div class="chat-view">
    <!-- 聊天头部 -->
    <div class="chat-header">
      <div class="header-left">
        <button class="back-btn" @click="goBack">
          <i class="material-icons">arrow_back</i>
        </button>
        <div class="user-info">
          <img :src="currentChat.avatar" :alt="currentChat.username" class="user-avatar">
          <div class="user-details">
            <div class="username">{{ currentChat.username }}</div>
            <div class="status">{{ currentChat.status }}</div>
          </div>
        </div>
      </div>
      <div class="header-right">
        <div class="action-menu">
          <button class="action-btn" @click="toggleMenu">
            <i class="material-icons">more_vert</i>
          </button>
          <div class="menu-dropdown" v-if="showMenu">
            <div class="menu-item" @click="handleFollow">
              <i class="material-icons">{{ currentChat.isFollowed ? 'person_remove' : 'person_add' }}</i>
              <span>{{ currentChat.isFollowed ? '取消关注' : '关注' }}</span>
            </div>
            <div class="menu-item" @click="handleBlock">
              <i class="material-icons">block</i>
              <span>拉入黑名单</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 聊天消息区域 -->
    <div class="chat-messages" ref="messagesContainer">
      <div 
        v-for="(message, index) in chatMessages" 
        :key="index"
        class="message-wrapper"
        :class="{ 'message-self': message.isSelf }"
        @touchstart="handleTouchStart($event, message)"
        @touchmove="handleTouchMove($event)"
        @touchend="handleTouchEnd($event)"
      >
        <div class="message-slide-content">
          <div class="message">
            <div class="message-avatar" v-if="!message.isSelf">
              <img :src="message.avatar" :alt="message.username">
            </div>
            <div class="message-content">
              <div class="message-bubble">
                {{ message.content }}
              </div>
              <div class="message-time">{{ message.time }}</div>
            </div>
          </div>
        </div>
        <div class="message-actions">
          <div class="action-btn mark-read" @click="handleMarkRead(message)">
            <i class="material-icons">done_all</i>
            <span>标为已读</span>
          </div>
          <div class="action-btn pin" @click="handlePin(message)">
            <i class="material-icons">push_pin</i>
            <span>顶置</span>
          </div>
          <div class="action-btn delete" @click="handleDelete(message)">
            <i class="material-icons">delete</i>
            <span>删除</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="chat-input-area">
      <div class="input-wrapper">
        <button class="action-btn" @click="showEmojiPicker = true">
          <i class="material-icons">emoji_emotions</i>
        </button>
        <input 
          type="text" 
          v-model="inputMessage" 
          placeholder="输入消息..."
          @keyup.enter="sendMessage"
        >
        <button class="action-btn" @click="sendMessage">
          <i class="material-icons">send</i>
        </button>
      </div>
    </div>

    <!-- 表情选择器 -->
    <EmojiPicker 
      :show="showEmojiPicker"
      @close="showEmojiPicker = false"
      @select="handleEmojiSelect"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import EmojiPicker from '../components/EmojiPicker.vue'

const router = useRouter()
const showEmojiPicker = ref(false)
const showMenu = ref(false)

// 当前聊天对象信息
const currentChat = ref({
  username: '测试用户',
  avatar: 'https://picsum.photos/200',
  status: '在线',
  isFollowed: false
})

// 聊天消息列表
const chatMessages = ref([
  {
    content: '你好！',
    time: '10:30',
    isSelf: false,
    username: '测试用户',
    avatar: 'https://picsum.photos/200'
  },
  {
    content: '你好啊！',
    time: '10:31',
    isSelf: true,
    username: '我',
    avatar: 'https://picsum.photos/201'
  }
])

// 输入消息
const inputMessage = ref('')
const messagesContainer = ref(null)

// 添加滑动相关变量
const slidingMessage = ref(null)
const startX = ref(0)
const currentX = ref(0)
const isDragging = ref(false)

// 发送消息
const sendMessage = () => {
  if (!inputMessage.value.trim()) return
  
  const newMessage = {
    content: inputMessage.value,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    isSelf: true,
    username: '我',
    avatar: 'https://picsum.photos/201'
  }
  
  chatMessages.value.push(newMessage)
  inputMessage.value = ''
  
  // 滚动到底部
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 处理表情选择
const handleEmojiSelect = (emoji) => {
  inputMessage.value += emoji
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 处理关注/取消关注
const handleFollow = () => {
  currentChat.value.isFollowed = !currentChat.value.isFollowed
  showMenu.value = false
  // 这里可以添加实际的关注/取消关注逻辑
}

// 处理拉黑
const handleBlock = () => {
  if (confirm('确定要将该用户拉入黑名单吗？')) {
    // 这里可以添加实际的拉黑逻辑
    showMenu.value = false
    alert('已将该用户拉入黑名单')
  }
}

// 切换菜单显示
const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

// 点击其他地方关闭菜单
const handleClickOutside = (event) => {
  if (showMenu.value && !event.target.closest('.action-menu')) {
    showMenu.value = false
  }
}

// 处理触摸开始
const handleTouchStart = (event, message) => {
  if (message.isSelf) return // 自己的消息不允许滑动
  isDragging.value = true
  startX.value = event.touches[0].clientX
  currentX.value = startX.value
  slidingMessage.value = message
}

// 处理触摸移动
const handleTouchMove = (event) => {
  if (!isDragging.value) return
  currentX.value = event.touches[0].clientX
  const diff = currentX.value - startX.value
  if (diff < 0 && diff > -240) {
    event.target.closest('.message-slide-content').style.transform = `translateX(${diff}px)`
  }
}

// 处理触摸结束
const handleTouchEnd = (event) => {
  if (!isDragging.value) return
  isDragging.value = false
  const diff = currentX.value - startX.value
  if (diff < -120) {
    event.target.closest('.message-slide-content').style.transform = 'translateX(-240px)'
    event.target.closest('.message-wrapper').classList.add('sliding')
  } else {
    event.target.closest('.message-slide-content').style.transform = 'translateX(0)'
    event.target.closest('.message-wrapper').classList.remove('sliding')
  }
}

// 处理标为已读
const handleMarkRead = (message) => {
  message.isRead = true
  // 这里可以添加实际的已读逻辑
}

// 处理顶置
const handlePin = (message) => {
  const index = chatMessages.value.indexOf(message)
  if (index > 0) {
    chatMessages.value.unshift(chatMessages.value.splice(index, 1)[0])
  }
  // 这里可以添加实际的顶置逻辑
}

// 处理删除
const handleDelete = (message) => {
  if (confirm('确定要删除这条消息吗？')) {
    const index = chatMessages.value.indexOf(message)
    chatMessages.value.splice(index, 1)
    // 这里可以添加实际的删除逻辑
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.chat-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #1a1f2a;
  color: #fff;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #d4af37;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: 600;
  font-size: 16px;
}

.status {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
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

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  touch-action: pan-y pinch-zoom;
}

.message-slide-content {
  position: relative;
  width: 100%;
  background: #1a1f2a;
  transition: transform 0.3s ease;
  z-index: 1;
}

.message-actions {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  display: flex;
  align-items: center;
  background: #1a1f2a;
  z-index: 0;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 100%;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn i {
  font-size: 24px;
  margin-bottom: 4px;
}

.action-btn span {
  font-size: 12px;
}

.mark-read {
  background: #4CAF50;
}

.pin {
  background: #FFC107;
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

.message {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  max-width: 70%;
  padding: 8px 0;
}

.message-self {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid rgba(212, 175, 55, 0.3);
}

.message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-bubble {
  background: rgba(255, 255, 255, 0.1);
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.4;
  word-break: break-word;
  position: relative;
}

.message-self .message-bubble {
  background: #d4af37;
  color: #000;
}

.message-self .message-bubble::before {
  content: '';
  position: absolute;
  right: -8px;
  top: 12px;
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  transform: rotate(180deg);
}

.message:not(.message-self) .message-bubble::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 12px;
  width: 0;
  height: 0;
  border-right: 8px solid rgba(255, 255, 255, 0.1);
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
}

.message-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 4px;
}

.chat-input-area {
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 8px 16px;
}

.input-wrapper input {
  flex: 1;
  background: none;
  border: none;
  color: #fff;
  font-size: 14px;
  padding: 8px 0;
}

.input-wrapper input:focus {
  outline: none;
}

.input-wrapper input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.action-menu {
  position: relative;
}

.menu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 0;
  min-width: 160px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.menu-item i {
  font-size: 20px;
  color: #d4af37;
}

.menu-item span {
  font-size: 14px;
}
</style> 