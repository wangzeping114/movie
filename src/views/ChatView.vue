<template>
  <div class="chat-container">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <div class="nav-left">
        <i class="material-icons" @click="router.back()">arrow_back</i>
        <h1>{{ currentChat?.name || '聊天' }}</h1>
      </div>
      <div class="nav-right">
        <i class="material-icons" @click="showMenu = !showMenu">more_vert</i>
        <div class="menu-dropdown" v-if="showMenu">
          <div class="menu-item" @click="handleFollow">
            <i class="material-icons">{{ currentChat.isFollowed ? 'person_remove' : 'person_add' }}</i>
            <span>{{ currentChat.isFollowed ? '取消关注' : '关注' }}</span>
          </div>
          <div class="menu-item" @click="handleBlock">
            <i class="material-icons">block</i>
            <span>拉入黑名单</span>
          </div>
          <div class="menu-item" @click="handleClearMessages">
            <i class="material-icons">delete_sweep</i>
            <span>清除消息</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 消息列表 -->
    <div class="message-list" ref="messageList">
      <div class="message-list-content">
        <div 
          v-for="message in messages" 
          :key="message.id" 
          class="message-wrapper"
          :class="{ 'sent': message.isSent }"
        >
          <div class="message-avatar" v-if="!message.isSent">
            <img :src="currentChat?.avatar" :alt="currentChat?.name">
          </div>
          <div class="message-content">
            <div class="message-bubble" @click="message.type === 'image' && previewMedia(message)">
              <!-- 文本消息 -->
              <template v-if="!message.type">
                {{ message.content }}
              </template>
              <!-- 图片消息 -->
              <template v-else-if="message.type === 'image'">
                <img :src="message.content" class="message-media" alt="图片">
              </template>
              <!-- 视频消息 -->
              <template v-else-if="message.type === 'video'">
                <div class="video-container" :id="`video-container-${message.id}`" @click.stop="handleVideoClick(message)">
                  <video 
                    :src="message.content" 
                    class="message-media video-element" 
                    preload="none"
                    :ref="el => { if (el) videoRefs[message.id] = el }"
                    @play="handleVideoPlay(message.id)"
                    @pause="handleVideoPause(message.id)"
                    :data-message-id="message.id"
                    playsinline
                    webkit-playsinline
                    x5-video-player-type="h5"
                    x5-video-player-fullscreen="true"
                    x5-video-orientation="portraint"
                  >
                    你的浏览器不支持视频播放
                  </video>
                  
                  <div class="video-overlay">
                    <!-- 下载进度圈 -->
                    <div class="progress-circle" v-if="downloadProgress[message.id] !== undefined && downloadProgress[message.id] < 100">
                      <svg class="progress-ring" width="48" height="48">
                        <circle
                          class="progress-ring-circle"
                          stroke="#fff"
                          stroke-width="2"
                          fill="transparent"
                          r="22"
                          cx="24"
                          cy="24"
                          :style="getProgressStyle(message.id)"
                        />
                      </svg>
                      <span class="progress-text">{{ Math.round(downloadProgress[message.id]) }}%</span>
                    </div>
                    
                    <!-- 播放状态图标 -->
                    <i class="material-icons play-icon" v-if="!videoStates[message.id] || videoStates[message.id] === 'paused'">
                      play_circle_filled
                    </i>
                  </div>
                </div>
              </template>
            </div>
            <div class="message-time">{{ message.time }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <div class="input-wrapper">
        <div class="input-actions">
          <i class="material-icons action-icon" @click="showEmojiPicker = true">emoji_emotions</i>
          <label class="action-icon">
            <i class="material-icons">image</i>
            <input 
              type="file" 
              accept="image/*,video/*" 
              @change="handleFileSelect" 
              multiple
              class="file-input"
            >
          </label>
        </div>
        <input 
          type="text" 
          v-model="inputMessage" 
          placeholder="输入消息..." 
          @keyup.enter="sendMessage"
        >
        <i class="material-icons send-btn" @click="sendMessage">send</i>
      </div>
    </div>

    <!-- 表情选择器 -->
    <div class="emoji-picker" v-if="showEmojiPicker">
      <div class="emoji-header">
        <span>表情</span>
        <i class="material-icons close-btn" @click="showEmojiPicker = false">close</i>
      </div>
      <div class="emoji-content">
        <div 
          v-for="emoji in emojiList" 
          :key="emoji"
          class="emoji-item"
          @click="handleEmojiSelect(emoji)"
        >
          {{ emoji }}
        </div>
      </div>
    </div>

    <!-- 预览图片/视频 -->
    <div class="preview-modal" v-if="previewUrl" @click="closePreview">
      <div class="preview-content" @click.stop>
        <div class="preview-header">
          <i class="material-icons close-btn" @click="closePreview">close</i>
        </div>
        <img 
          v-if="previewType === 'image'" 
          :src="previewUrl" 
          class="preview-media"
          :class="{ 'fullscreen': isFullscreen }"
          @click="toggleFullscreen"
        >
        <video 
          v-else-if="previewType === 'video'" 
          :src="previewUrl" 
          class="preview-media"
          :class="{ 'fullscreen': isFullscreen }"
          controls
          controlsList="nodownload"
          @click="toggleFullscreen"
          ref="previewVideo"
        ></video>
      </div>
    </div>

    <!-- 清除消息确认弹窗 -->
    <ConfirmDialog
      v-model="showClearDialog"
      title="清除消息"
      message="确定要清除所有聊天记录吗？此操作不可恢复。"
      @confirm="clearAllMessages"
      @cancel="cancelClearMessages"
    />

    <!-- 拉黑确认弹窗 -->
    <ConfirmDialog
      v-model="showBlockDialog"
      title="拉入黑名单"
      :message="`确定要将 ${currentChat.name} 拉入黑名单吗？`"
      @confirm="confirmBlock"
      @cancel="cancelBlock"
    />

    <!-- 添加全屏视频播放器组件 -->
    <div class="fullscreen-video-player" v-if="fullscreenVideo">
      <video 
        :src="fullscreenVideo.content" 
        ref="activeVideoPlayer"
        class="fullscreen-video" 
        playsinline
        autoplay
        controls
      ></video>
      <div class="fullscreen-controls">
        <div class="control-bar">
          <div class="control-left">
            <i class="material-icons control-btn" @click="togglePlayPause">
              {{ isPlaying ? 'pause' : 'play_arrow' }}
            </i>
          </div>
          <div class="control-right">
            <i class="material-icons control-btn" @click="closeFullscreenVideo">close</i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ConfirmDialog from '../components/ConfirmDialog.vue'

const route = useRoute()
const router = useRouter()
const messageList = ref(null)
const inputMessage = ref('')
const showClearDialog = ref(false)
const showBlockDialog = ref(false)
const showEmojiPicker = ref(false)
const showMenu = ref(false)
const isFullscreen = ref(false)
const previewVideo = ref(null)

// 添加新的响应式状态
const isVideoFullscreen = ref(false)
const fullscreenVideo = ref(null)
const activeVideoPlayer = ref(null)
const isPlaying = ref(false)

// 模拟当前聊天对象
const currentChat = ref({
  id: route.params.id,
  name: '小美',
  avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
  isFollowed: false
})

// 消息列表
const messages = ref([
  {
    id: 1,
    content: '你好！',
    time: '10:00',
    isSent: false
  },
  {
    id: 2,
    content: '你好，很高兴认识你！',
    time: '10:01',
    isSent: true
  }
])

// 表情列表
const emojiList = [
  '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍',
  '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎',
  '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩',
  '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰'
]

// 预览相关
const previewUrl = ref('')
const previewType = ref('')

// 添加新的状态
const downloadProgress = ref({}) // 记录每个视频的下载进度
const videoStates = ref({}) // 记录每个视频的状态（downloading/playing/paused）

// 添加到 script 部分
const videoRefs = ref({})

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim()) return
  
  const newMessage = {
    id: Date.now(),
    content: inputMessage.value,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    isSent: true
  }
  
  messages.value.push(newMessage)
  inputMessage.value = ''
  
  // 等待 DOM 更新后滚动到底部
  await nextTick()
  scrollToBottom()
}

// 修改清除消息的方法
const handleClearMessages = () => {
  showClearDialog.value = true
  showMenu.value = false
}

// 清除所有消息
const clearAllMessages = () => {
  messages.value = []
  showClearDialog.value = false
}

// 添加取消清除消息的方法
const cancelClearMessages = () => {
  showClearDialog.value = false
}

// 滚动到底部
const scrollToBottom = () => {
  if (messageList.value) {
    messageList.value.scrollTop = messageList.value.scrollHeight
  }
}

// 监听消息变化，自动滚动到底部
watch(messages, async () => {
  await nextTick()
  scrollToBottom()
}, { deep: true })

// 处理表情选择
const handleEmojiSelect = async (emoji) => {
  inputMessage.value += emoji
  showEmojiPicker.value = false
  // 确保输入框获得焦点
  await nextTick()
  document.querySelector('.input-wrapper input').focus()
}

// 处理关注/取消关注
const handleFollow = () => {
  currentChat.value.isFollowed = !currentChat.value.isFollowed
  showMenu.value = false
  // 这里可以添加实际的关注/取消关注逻辑
}

// 处理拉黑
const handleBlock = () => {
  showBlockDialog.value = true
  showMenu.value = false
}

// 添加取消拉黑方法
const cancelBlock = () => {
  showBlockDialog.value = false
}

// 修改确认拉黑方法
const confirmBlock = () => {
  // 这里添加实际的拉黑逻辑
  showBlockDialog.value = false
  router.back() // 拉黑后返回上一页
}

// 点击其他地方关闭菜单
const handleClickOutside = (event) => {
  if (showMenu.value && !event.target.closest('.nav-right')) {
    showMenu.value = false
  }
}

// 处理文件选择
const handleFileSelect = (event) => {
  const files = event.target.files
  if (!files.length) return

  Array.from(files).forEach(file => {
    if (!file.type.match(/^(image|video)/)) {
      alert('只能上传图片或视频文件！')
      return
    }
    
    if (file.size > 50 * 1024 * 1024) {
      alert('文件大小不能超过50MB！')
      return
    }

    const reader = new FileReader()
    reader.onload = async (e) => {
      const newMessage = {
        id: Date.now(),
        content: e.target.result,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        isSent: true,
        type: file.type.startsWith('image/') ? 'image' : 'video'
      }
      messages.value.push(newMessage)
      await nextTick()
      scrollToBottom()
    }
    reader.readAsDataURL(file)
  })
  
  event.target.value = ''
}

// 预览媒体
const previewMedia = (message) => {
  if (message.type === 'image' || message.type === 'video') {
    previewUrl.value = message.content
    previewType.value = message.type
    isFullscreen.value = false // 重置全屏状态
  }
}

// 关闭预览
const closePreview = () => {
  if (document.fullscreenElement) {
    document.exitFullscreen()
  }
  previewUrl.value = ''
  previewType.value = ''
  isFullscreen.value = false
}

// 定义视频播放和控制函数
const handleVideoPlay = (messageId) => {
  videoStates.value[messageId] = 'playing'
}

const handleVideoPause = (messageId) => {
  videoStates.value[messageId] = 'paused'
}

const togglePlayPause = () => {
  if (!activeVideoPlayer.value) return
  
  if (activeVideoPlayer.value.paused) {
    activeVideoPlayer.value.play()
    isPlaying.value = true
  } else {
    activeVideoPlayer.value.pause()
    isPlaying.value = false
  }
}

// 关闭全屏视频
const closeFullscreenVideo = () => {
  if (activeVideoPlayer.value) {
    activeVideoPlayer.value.pause()
  }
  fullscreenVideo.value = null
  isPlaying.value = false
}

// 修改视频点击处理逻辑
const handleVideoClick = async (message) => {
  // 如果视频还没下载，先下载
  if (!videoRefs.value[message.id] || !videoRefs.value[message.id].src || videoRefs.value[message.id].src !== message.content) {
    await downloadVideo(message)
    return
  }
  
  // 如果视频已下载，打开全屏播放器
  fullscreenVideo.value = message
  isPlaying.value = true
  
  // 等待DOM更新后自动播放
  await nextTick()
  if (activeVideoPlayer.value) {
    activeVideoPlayer.value.play()
  }
}

// 提取下载视频功能为单独函数
const downloadVideo = async (message) => {
  const video = videoRefs.value[message.id]
  if (!video) return
  
  downloadProgress.value[message.id] = 0
  videoStates.value[message.id] = 'downloading'
  
  try {
    // 开始下载视频
    const response = await fetch(message.content)
    const reader = response.body.getReader()
    const contentLength = +response.headers.get('Content-Length')
    
    let receivedLength = 0
    const chunks = []
    
    while(true) {
      const {done, value} = await reader.read()
      
      if (done) break
      
      chunks.push(value)
      receivedLength += value.length
      
      // 更新下载进度
      downloadProgress.value[message.id] = (receivedLength / contentLength) * 100
    }
    
    // 合并所有chunks
    const blob = new Blob(chunks)
    const url = URL.createObjectURL(blob)
    
    // 设置视频源
    video.src = url
    delete downloadProgress.value[message.id]
    videoStates.value[message.id] = 'paused'
    
    // 自动保存到本地
    const a = document.createElement('a')
    a.href = url
    a.download = `video_${message.id}.mp4`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    // 下载完成后打开全屏播放器
    fullscreenVideo.value = message
    isPlaying.value = true
    
    // 等待DOM更新后自动播放
    await nextTick()
    if (activeVideoPlayer.value) {
      activeVideoPlayer.value.play()
    }
    
  } catch (error) {
    console.error('下载视频失败:', error)
    delete downloadProgress.value[message.id]
    videoStates.value[message.id] = undefined
  }
}

// 修改全屏变化处理函数
const handleFullscreenChange = (event) => {
  const video = event.target
  const messageId = video.dataset.messageId
  isVideoFullscreen.value = !!(document.fullscreenElement || 
                             document.webkitFullscreenElement || 
                             document.mozFullScreenElement || 
                             document.msFullscreenElement)
  if (!isVideoFullscreen.value) {
    video.pause()
    videoStates.value[messageId] = 'paused'
  }
}

// 添加计算进度样式的方法
const getProgressStyle = (messageId) => {
  const progress = downloadProgress.value[messageId]
  const circumference = 2 * Math.PI * 22
  return {
    strokeDasharray: `${circumference} ${circumference}`,
    strokeDashoffset: `${circumference * (1 - progress / 100)}`
  }
}

// 切换全屏状态
const toggleFullscreen = async () => {
  if (!document.fullscreenElement) {
    isFullscreen.value = true
    if (previewType.value === 'video' && previewVideo.value) {
      try {
        await previewVideo.value.requestFullscreen()
        previewVideo.value.play()
      } catch (err) {
        console.error('Error attempting to enable fullscreen:', err)
      }
    } else {
      try {
        await document.querySelector('.preview-content').requestFullscreen()
      } catch (err) {
        console.error('Error attempting to enable fullscreen:', err)
      }
    }
  } else {
    isFullscreen.value = false
    try {
      await document.exitFullscreen()
    } catch (err) {
      console.error('Error attempting to exit fullscreen:', err)
    }
  }
}

// 监听全屏变化
onMounted(() => {
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
      isFullscreen.value = false
    }
  })
  document.addEventListener('click', handleClickOutside)
  nextTick(() => {
    scrollToBottom()
  })
  
  // 监听键盘弹出事件（移动端）
  window.addEventListener('resize', () => {
    scrollToBottom()
  })

  // 添加ESC键监听
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && fullscreenVideo.value) {
      closeFullscreenVideo()
    }
  })
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('fullscreenchange', () => {})
  window.removeEventListener('resize', scrollToBottom)
  isVideoFullscreen.value = false
  
  // 移除ESC键监听
  document.removeEventListener('keydown', (e) => {
    if (e.key === 'Escape' && fullscreenVideo.value) {
      closeFullscreenVideo()
    }
  })
})
</script>

<style scoped>
.chat-container {
  height: 100vh;
  background: #1a1a1a;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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
  padding: 8px;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 72px 16px 80px;
  position: relative;
}

.message-list-content {
  width: 100%;
}

.message-wrapper {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
  animation: message-in 0.3s ease;
}

.message-wrapper.sent {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  margin: 0 8px;
}

.message-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid rgba(212, 175, 55, 0.3);
}

.message-content {
  display: flex;
  flex-direction: column;
  max-width: 70%;
}

.sent .message-content {
  align-items: flex-end;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.1);
  margin-bottom: 4px;
  word-break: break-word;
  line-height: 1.4;
  overflow: hidden;
}

.sent .message-bubble {
  background: #d4af37;
  color: #000;
}

.message-bubble .message-media {
  max-width: 240px;
  max-height: 240px;
  border-radius: 8px;
  cursor: pointer;
  display: block;
  margin: -12px -16px;
}

.video-container {
  position: relative;
  cursor: pointer;
  margin: -13px -20px;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  max-width: 240px;
  aspect-ratio: 16/9;
}

.video-element {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
}

.message-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 4px;
}

.input-area {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(212, 175, 55, 0.1);
  padding: 12px 16px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 4px 16px;
}

.input-actions {
  display: flex;
  gap: 8px;
}

.action-icon {
  color: #d4af37;
  cursor: pointer;
  padding: 8px;
  transition: transform 0.2s ease;
}

.action-icon:hover {
  transform: scale(1.1);
}

.file-input {
  display: none;
}

input {
  flex: 1;
  background: none;
  border: none;
  padding: 8px 0;
  color: #fff;
  font-size: 16px;
  outline: none;
}

input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.send-btn {
  color: #d4af37;
  cursor: pointer;
  padding: 8px;
  transition: transform 0.2s ease;
}

.send-btn:hover {
  transform: scale(1.1);
}

@keyframes message-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.menu-dropdown {
  position: absolute;
  top: 100%;
  right: 16px;
  background: #2a2a2a;
  border-radius: 12px;
  padding: 8px 0;
  min-width: 160px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  animation: menu-in 0.2s ease;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: #fff;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.menu-item i {
  color: #d4af37;
}

@keyframes menu-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.emoji-picker {
  position: fixed;
  bottom: 80px;
  left: 16px;
  right: 16px;
  background: #2a2a2a;
  border-radius: 12px;
  max-height: 300px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  animation: slide-up 0.3s ease;
}

.emoji-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.emoji-content {
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
  overflow-y: auto;
  max-height: 240px;
}

.emoji-item {
  font-size: 24px;
  padding: 8px;
  cursor: pointer;
  text-align: center;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.emoji-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.close-btn {
  cursor: pointer;
  padding: 4px;
  color: rgba(255, 255, 255, 0.5);
}

.preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.preview-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: transparent;
}

.preview-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2001;
  padding: 16px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.5), transparent);
  display: flex;
  justify-content: flex-end;
}

.preview-header .close-btn {
  color: #fff;
  cursor: pointer;
  padding: 8px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
}

.preview-media {
  max-width: 100%;
  max-height: 100vh;
  width: auto;
  height: auto;
  object-fit: contain;
  margin: auto;
  transition: all 0.3s ease;
}

.preview-media.fullscreen {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.message-media {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  cursor: pointer;
}

.play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  font-size: 48px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  pointer-events: none;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.video-container:hover .play-icon {
  opacity: 1;
}

.progress-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-ring {
  transform: rotate(-90deg);
  position: absolute;
}

.progress-ring-circle {
  transition: stroke-dashoffset 0.1s;
}

.progress-text {
  color: #fff;
  font-size: 12px;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.video-controls {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4), transparent 30%, transparent 70%, rgba(0, 0, 0, 0.4));
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  flex-direction: column;
  touch-action: none;
  z-index: 9999;
}

.control-header {
  padding: 16px;
  display: flex;
  justify-content: flex-end;
  z-index: 10000;
}

.control-center {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.control-btn-wrapper {
  padding: 8px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 8px;
}

.control-btn {
  color: #fff;
  font-size: 32px;
  cursor: pointer;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.control-btn.large {
  width: 64px;
  height: 64px;
  font-size: 48px;
}

.control-btn:active {
  transform: scale(0.95);
}

@media (hover: hover) {
  .video-container:hover .video-controls,
  .video-controls:hover {
    opacity: 1;
  }
  
  .control-btn:hover {
    transform: scale(1.1);
  }
}

@media (hover: none) {
  .video-controls {
    opacity: 1;
  }
}

.video-container:fullscreen .video-controls,
.video-container:-webkit-full-screen .video-controls,
.video-container:-moz-full-screen .video-controls,
.video-container:-ms-fullscreen .video-controls {
  position: fixed;
  opacity: 1;
}

.fullscreen-video-player {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #000;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fullscreen-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.fullscreen-controls {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.5), transparent 30%, transparent 70%, rgba(0, 0, 0, 0.5));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.fullscreen-video-player:hover .fullscreen-controls {
  opacity: 1;
}

.control-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.control-left {
  display: flex;
  align-items: center;
}

.control-right {
  display: flex;
  align-items: center;
}

.control-btn {
  color: #fff;
  font-size: 28px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s ease;
  margin: 0 4px;
}

.control-btn:hover {
  transform: scale(1.1);
}

.control-btn:active {
  transform: scale(0.95);
}

@media (hover: none) {
  .fullscreen-controls {
    opacity: 1;
  }
}
</style> 