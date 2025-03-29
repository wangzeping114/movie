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
          muted
          class="live-video"
          @click="toggleControls"
        ></video>
        
        <!-- 加载指示器 -->
        <div class="loading-indicator" v-if="isLoading">
          <div class="spinner"></div>
          <div>正在加载直播...</div>
        </div>
        
        <!-- 播放按钮 -->
        <div class="play-button" v-if="showPlayButton" @click.stop="playVideo">
          <i class="material-icons">play_arrow</i>
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
        
        <!-- 视频控制 -->
        <div class="video-controls" v-if="showControls">
          <div class="control-button mute-button" @click.stop="toggleMute">
            <i class="material-icons">{{ isMuted ? 'volume_off' : 'volume_up' }}</i>
          </div>
          
          <!-- 礼物特效控制按钮 -->
          <div class="control-button gift-effect-button" @click.stop="toggleGiftEffects" :title="showPremiumEffects ? '关闭豪华礼物特效' : '开启豪华礼物特效'">
            <i class="material-icons">{{ showPremiumEffects ? 'visibility' : 'visibility_off' }}</i>
          </div>
          
          <!-- 礼物位置控制按钮 -->
          <div class="control-button gift-position-button" @click.stop="toggleGiftDisplayMode" :title="giftDisplayMode === 'chat' ? '在视频上显示礼物' : '在聊天区显示礼物'">
            <i class="material-icons">{{ giftDisplayMode === 'chat' ? 'chat' : 'videocam' }}</i>
          </div>
        </div>
        
        <!-- 视频模式下的礼物动画区域 -->
        <LiveGiftAnimation 
          v-if="giftDisplayMode === 'video'"
          :gifts="giftAnimations" 
          :max-visible="3"
          :show-premium-effects="showPremiumEffects"
          :chat-mode="false"
        />
      </div>
      
      <!-- 聊天区域 -->
      <div class="chat-container">
        <!-- 聊天模式下的礼物动画区域 -->
        <div class="chat-gift-container" v-if="giftDisplayMode === 'chat'">
          <LiveGiftAnimation 
            :gifts="giftAnimations" 
            :max-visible="3"
            :show-premium-effects="showPremiumEffects"
            :chat-mode="true"
          />
        </div>
        
        <!-- 聊天消息 -->
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
          <button class="send-btn" @click="sendMessage">
            <i class="material-icons">send</i>
          </button>
          <button class="gift-btn" @click="showGiftPanel = true">
            <i class="material-icons">card_giftcard</i>
          </button>
        </div>
      </div>
    </div>
    
    <!-- 礼物面板 -->
    <LiveGiftPanel 
      :show="showGiftPanel" 
      :user-balance="userBalance"
      @close="showGiftPanel = false"
      @send-gift="handleSendGift"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import LiveGiftPanel from '../components/LiveGiftPanel.vue'
import LiveGiftAnimation from '../components/LiveGiftAnimation.vue'

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
  
  // 模拟加载过程
  setTimeout(() => {
    isLoading.value = false
    
    // 设置直播视频源
    if (videoPlayer.value) {
      // 实际项目中这里会连接到真实的直播流
      // 使用本地示例视频或公共视频作为演示
      const sampleVideoUrls = [
        '/videos/sample-live1.mp4',
        '/videos/sample-live2.mp4',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
      ]
      
      // 随机选择一个视频
      const randomVideoUrl = sampleVideoUrls[Math.floor(Math.random() * sampleVideoUrls.length)]
      videoPlayer.value.src = randomVideoUrl
      
      // 循环播放
      videoPlayer.value.loop = true
      
      // 自动播放
      videoPlayer.value.play().catch(error => {
        console.error('自动播放失败:', error)
        // 显示播放按钮
        showPlayButton.value = true
      })
    }
  }, 1500)
}

// 添加播放控制状态
const showPlayButton = ref(false)
const isMuted = ref(true) // 默认静音

// 手动播放视频
const playVideo = () => {
  if (videoPlayer.value) {
    videoPlayer.value.play()
    .then(() => {
      showPlayButton.value = false
    })
    .catch(error => {
      console.error('播放失败:', error)
    })
  }
}

// 静音切换
const toggleMute = () => {
  if (videoPlayer.value) {
    videoPlayer.value.muted = !videoPlayer.value.muted
    isMuted.value = videoPlayer.value.muted
  }
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

// 礼物相关
const showGiftPanel = ref(false)
const userBalance = ref(10000) // 用户余额
const giftAnimations = ref([]) // 礼物动画队列

// 处理发送礼物
const handleSendGift = (giftData) => {
  // 扣除用户余额
  userBalance.value -= giftData.totalPrice
  
  // 添加消息到聊天区域
  messages.value.push({
    sender: '我',
    content: `送出了 ${giftData.count} 个 ${giftData.gift.name}`
  })
  
  // 添加礼物到动画队列
  const gift = {
    ...giftData.gift,
    count: giftData.count,
    senderName: '我',
    senderAvatar: 'https://randomuser.me/api/portraits/lego/1.jpg', // 默认用户头像
  }
  
  giftAnimations.value = [...giftAnimations.value, gift]
  
  // 自动滚动聊天区域到底部
  setTimeout(() => {
    const chatMessages = document.querySelector('.chat-messages')
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight
    }
  }, 50)
}

// 模拟其他用户发送礼物
const simulateGifts = () => {
  const randomGifts = [
    { id: 1, name: '玫瑰花', price: 5, icon: 'https://cdn-icons-png.flaticon.com/128/3082/3082059.png', animation: 'simple' },
    { id: 2, name: '啤酒', price: 10, icon: 'https://cdn-icons-png.flaticon.com/128/2738/2738730.png', animation: 'simple' },
    { id: 9, name: '爱心', price: 99, icon: 'https://cdn-icons-png.flaticon.com/128/4381/4381470.png', animation: 'medium' },
    { id: 11, name: '跑车', price: 520, icon: 'https://cdn-icons-png.flaticon.com/128/185/185277.png', animation: 'advanced' }
  ]
  
  const randomUsers = [
    { name: '粉丝1', avatar: 'https://randomuser.me/api/portraits/women/11.jpg' },
    { name: '粉丝2', avatar: 'https://randomuser.me/api/portraits/men/12.jpg' },
    { name: '粉丝3', avatar: 'https://randomuser.me/api/portraits/women/13.jpg' },
    { name: '粉丝4', avatar: 'https://randomuser.me/api/portraits/men/14.jpg' }
  ]
  
  setInterval(() => {
    // 随机选择一个礼物和用户
    const randomGift = randomGifts[Math.floor(Math.random() * randomGifts.length)]
    const randomUser = randomUsers[Math.floor(Math.random() * randomUsers.length)]
    const giftCount = Math.floor(Math.random() * 10) + 1 // 随机数量1-10
    
    // 添加消息到聊天区域
    messages.value.push({
      sender: randomUser.name,
      content: `送出了 ${giftCount} 个 ${randomGift.name}`
    })
    
    // 添加礼物到动画队列
    const gift = {
      ...randomGift,
      count: giftCount,
      senderName: randomUser.name,
      senderAvatar: randomUser.avatar
    }
    
    giftAnimations.value = [...giftAnimations.value, gift]
    
    // 自动滚动到底部
    setTimeout(() => {
      const chatMessages = document.querySelector('.chat-messages')
      if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight
      }
    }, 50)
  }, 10000) // 每10秒随机发送一个礼物
}

// 添加礼物特效控制
const showPremiumEffects = ref(true)

// 切换礼物特效显示
const toggleGiftEffects = () => {
  showPremiumEffects.value = !showPremiumEffects.value
}

// 添加礼物显示位置控制
const giftDisplayMode = ref('chat') // 'chat' 或 'video'

// 切换礼物显示位置
const toggleGiftDisplayMode = () => {
  giftDisplayMode.value = giftDisplayMode.value === 'chat' ? 'video' : 'chat'
}

onMounted(() => {
  loadLiveStream()
  addRandomMessages()
  simulateGifts() // 添加模拟礼物发送
  
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

.chat-gift-container {
  position: relative;
  width: 100%;
  min-height: 60px;
  margin-bottom: 10px;
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
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(26, 26, 26, 0.8);
}

.chat-input input {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 20px;
  color: #ffffff;
  padding: 8px 16px;
  font-size: 14px;
}

.chat-input input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.15);
}

.chat-input button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.chat-input .send-btn {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.chat-input .gift-btn {
  background: linear-gradient(135deg, #d4af37, #e5c158);
  color: #000;
}

.chat-input button:hover {
  transform: scale(1.05);
}

.chat-input button i {
  font-size: 20px;
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

.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
}

.play-button i {
  font-size: 48px;
  color: #d4af37;
}

.play-button:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: translate(-50%, -50%) scale(1.1);
}

.video-controls {
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 16px;
  z-index: 10;
}

.control-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-button:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}

.control-button i {
  color: #fff;
  font-size: 20px;
}

.gift-effect-button i {
  color: #d4af37;
}

.mute-button.active i {
  color: #d4af37;
}

.gift-position-button i {
  color: #42b983;
}
</style> 