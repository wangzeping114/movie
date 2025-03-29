<template>
  <div class="live-view-container">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <div class="nav-left">
        <i class="material-icons" @click="router.back()">arrow_back</i>
        <h1>{{ liveInfo.title }}</h1>
      </div>
      <div class="nav-right">
        <i class="material-icons">more_vert</i>
      </div>
    </div>

    <!-- 直播内容 -->
    <div class="live-content">
      <div class="video-container">
        <video 
          ref="videoPlayer" 
          autoplay 
          class="live-video"
          @click="toggleControls"
        ></video>
        
        <!-- 加载指示器 -->
        <div class="loading-indicator" v-if="isLoading">
          <div class="spinner"></div>
          <div>正在加载直播...</div>
        </div>
        
        <!-- 主播信息 -->
        <div class="broadcaster-info">
          <img :src="liveInfo.authorAvatar" :alt="liveInfo.authorName" class="broadcaster-avatar">
          <div class="broadcaster-details">
            <div class="broadcaster-name">{{ liveInfo.authorName }}</div>
            <div class="viewer-count">{{ liveInfo.viewerCount }} 人观看</div>
          </div>
          <button class="follow-btn" :class="{ 'followed': isFollowed }" @click="toggleFollow">
            {{ isFollowed ? '已关注' : '关注' }}
          </button>
        </div>
      </div>
      
      <!-- 聊天区域 -->
      <div class="chat-container">
        <div class="chat-messages">
          <div v-for="(message, index) in messages" :key="index" class="chat-message">
            <div class="message-sender">{{ message.sender }}</div>
            <div class="message-content">{{ message.content }}</div>
          </div>
        </div>
        
        <!-- 聊天输入框 -->
        <div class="chat-input">
          <input 
            type="text" 
            v-model="newMessage" 
            placeholder="发送消息..." 
            @keyup.enter="sendMessage"
          >
          <button @click="sendMessage">
            <i class="material-icons">send</i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const videoPlayer = ref(null)
const isLoading = ref(true)
const isFollowed = ref(false)
const showControls = ref(true)
const controlsTimeout = ref(null)

// 模拟直播信息
const liveInfo = ref({
  id: route.params.id || '1',
  title: '性感舞蹈直播',
  authorName: '小美',
  authorAvatar: 'https://randomuser.me/api/portraits/women/1.jpg',
  viewerCount: 1234
})

// 聊天消息
const messages = ref([
  { sender: '观众1', content: '主播好漂亮啊！' },
  { sender: '观众2', content: '刚来，错过了什么？' },
  { sender: '小美', content: '欢迎新来的朋友们~' },
  { sender: '观众3', content: '主播跳支舞吧！' },
  { sender: '观众4', content: '送主播一朵玫瑰花！' }
])
const newMessage = ref('')

// 发送消息
const sendMessage = () => {
  if (!newMessage.value.trim()) return
  
  messages.value.push({
    sender: '我',
    content: newMessage.value
  })
  
  // 自动滚动到底部
  setTimeout(() => {
    const chatMessages = document.querySelector('.chat-messages')
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight
    }
  }, 50)
  
  newMessage.value = ''
}

// 关注/取消关注
const toggleFollow = () => {
  isFollowed.value = !isFollowed.value
}

// 显示/隐藏控制栏
const toggleControls = () => {
  showControls.value = !showControls.value
  
  // 如果显示了控制栏，设置自动隐藏
  if (showControls.value) {
    if (controlsTimeout.value) {
      clearTimeout(controlsTimeout.value)
    }
    
    controlsTimeout.value = setTimeout(() => {
      showControls.value = false
    }, 3000)
  }
}

// 模拟加载直播流
const loadLiveStream = () => {
  isLoading.value = true
  
  // 模拟加载过程，实际项目中这里会连接到直播流
  setTimeout(() => {
    isLoading.value = false
    
    // 模拟直播视频，真实场景需要连接到流媒体服务
    if (videoPlayer.value) {
      // 在实际项目中，这里会设置直播流的URL
      // videoPlayer.value.src = 'https://your-live-stream-url'
      
      // 这里使用示例视频代替直播流
      videoPlayer.value.src = 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
      videoPlayer.value.play().catch(error => {
        console.error('自动播放失败:', error)
      })
    }
  }, 2000)
}

// 添加随机消息来模拟聊天活跃度
const addRandomMessages = () => {
  const randomMessages = [
    { sender: '观众5', content: '666666' },
    { sender: '观众6', content: '主播真好看' },
    { sender: '观众7', content: '送你一个小心心' },
    { sender: '观众8', content: '今天直播到几点？' },
    { sender: '观众9', content: '求歌单' }
  ]
  
  setInterval(() => {
    const randomIndex = Math.floor(Math.random() * randomMessages.length)
    messages.value.push(randomMessages[randomIndex])
    
    // 限制消息数量
    if (messages.value.length > 50) {
      messages.value.shift()
    }
    
    // 自动滚动到底部
    const chatMessages = document.querySelector('.chat-messages')
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight
    }
  }, 5000)
}

onMounted(() => {
  loadLiveStream()
  addRandomMessages()
  
  // 自动滚动到底部
  const chatMessages = document.querySelector('.chat-messages')
  if (chatMessages) {
    chatMessages.scrollTop = chatMessages.scrollHeight
  }
})

onUnmounted(() => {
  // 清理资源
  if (videoPlayer.value) {
    videoPlayer.value.pause()
    videoPlayer.value.src = ''
  }
  
  if (controlsTimeout.value) {
    clearTimeout(controlsTimeout.value)
  }
})
</script>

<style scoped>
.live-view-container {
  width: 100%;
  height: 100vh;
  background: #1a1a1a;
  color: #ffffff;
  display: flex;
  flex-direction: column;
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
  font-size: 18px;
  font-weight: 600;
  color: #d4af37;
  margin: 0;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  max-width: 200px;
}

.nav-right i {
  color: #d4af37;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-right i:hover {
  transform: scale(1.1);
}

.live-content {
  margin-top: 56px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 56px);
}

.video-container {
  position: relative;
  width: 100%;
  background: #000;
  flex: 1;
  min-height: 40%;
}

.live-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.loading-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: rgba(255, 255, 255, 0.8);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-left-color: #d4af37;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.broadcaster-info {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  padding: 8px 12px;
  border-radius: 24px;
  gap: 12px;
}

.broadcaster-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(212, 175, 55, 0.5);
}

.broadcaster-details {
  display: flex;
  flex-direction: column;
}

.broadcaster-name {
  font-weight: 600;
  font-size: 14px;
}

.viewer-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.follow-btn {
  background: #d4af37;
  border: none;
  border-radius: 20px;
  padding: 6px 12px;
  color: #000;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.follow-btn:hover {
  transform: scale(1.05);
}

.follow-btn.followed {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.chat-container {
  width: 100%;
  height: 40%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chat-message {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 8px 12px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message-sender {
  font-weight: 600;
  font-size: 12px;
  color: #d4af37;
  margin-bottom: 4px;
}

.message-content {
  font-size: 14px;
}

.chat-input {
  display: flex;
  padding: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-input input {
  flex: 1;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 20px;
  color: #fff;
  font-size: 14px;
}

.chat-input input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.15);
}

.chat-input button {
  background: #d4af37;
  border: none;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  margin-left: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.chat-input button:hover {
  transform: scale(1.1);
}

.chat-input button i {
  color: #000;
  font-size: 18px;
}

/* 响应式布局 */
@media (min-width: 768px) {
  .live-content {
    flex-direction: row;
  }
  
  .video-container {
    width: 70%;
    height: 100%;
  }
  
  .chat-container {
    width: 30%;
    height: 100%;
  }
}
</style> 