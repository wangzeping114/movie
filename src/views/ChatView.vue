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
              <!-- 语音消息 -->
              <template v-else-if="message.type === 'voice'">
                <div class="voice-message" @click="playVoice(message)" :class="{ 'playing': playingVoiceId === message.id }">
                  <div class="voice-message-icon">
                    <i class="material-icons">{{ playingVoiceId === message.id ? 'pause' : 'play_arrow' }}</i>
                  </div>
                  <div class="voice-message-duration">{{ message.duration || '0:00' }}</div>
                  <div class="voice-wave-container">
                    <div class="voice-wave" v-for="i in 4" :key="i"></div>
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
        <div class="input-actions" v-if="!isVoiceMode">
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
          v-if="!isVoiceMode"
          type="text" 
          v-model="inputMessage" 
          placeholder="输入消息..." 
          @keyup.enter="sendMessage"
        >
        <div 
          v-else 
          class="voice-record-btn" 
          @touchstart.prevent="startRecording" 
          @touchend.prevent="stopRecording"
          @touchmove.prevent="handleTouchMove"
          @touchcancel.prevent="cancelRecording"
          @mousedown.prevent="startRecording" 
          @mouseup.prevent="stopRecording"
          @mouseleave.prevent="cancelRecording"
        >
          {{ isRecording ? '松开发送，上滑取消' : '按住 说话' }}
        </div>
        
        <!-- 按钮区域 -->
        <div v-if="!isVoiceMode && inputMessage.trim()" class="send-btn-container">
          <i class="material-icons send-btn" @click="sendMessage">send</i>
        </div>
        <div v-else-if="!isVoiceMode" class="voice-toggle-btn" @click="toggleVoiceInput">
          <i class="material-icons">mic</i>
        </div>
        <div v-else class="voice-toggle-btn active" @click="toggleVoiceInput">
          <i class="material-icons">keyboard</i>
        </div>
      </div>
    </div>

    <!-- 录音反馈 -->
    <div class="voice-record-feedback" v-if="isRecording">
      <div class="voice-record-panel" :class="{ 'cancelling': isCancelling }">
        <i class="material-icons record-icon" :class="{ 'recording': isRecording }">{{ isCancelling ? 'delete' : 'mic' }}</i>
        <div class="record-wave-container" v-if="!isCancelling">
          <div class="record-wave" v-for="(level, index) in voiceWaveLevels" :key="index" :style="{ height: level + 'px' }"></div>
        </div>
        <div class="record-time">{{ formatRecordTime(recordDuration) }}</div>
        <div class="record-tip" v-if="!isCancelling">松开发送，上滑取消</div>
        <div class="record-cancel-tip" v-else>松开手指，取消发送</div>
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

// 语音消息相关状态
const isVoiceMode = ref(false)
const isRecording = ref(false)
const isCancelling = ref(false)
const recordStartTime = ref(0)
const recordDuration = ref(0)
const recordTimer = ref(null)
const mediaRecorder = ref(null)
const audioChunks = ref([])
const playingVoiceId = ref(null)
const audioPlayer = ref(new Audio())
const voiceWaveLevels = ref(Array(10).fill(5))
const voiceAnimationTimer = ref(null)

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

// 切换语音输入模式
const toggleVoiceInput = () => {
  isVoiceMode.value = !isVoiceMode.value
}

// 开始录音
const startRecording = async (event) => {
  // 阻止默认行为，防止页面滚动
  if (event) {
    event.preventDefault()
  }
  
  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // 创建音频上下文用于可视化
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const audioSource = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      audioSource.connect(analyser)
      
      // 设置动画
      const animationInterval = setInterval(() => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteFrequencyData(dataArray)
        
        // 更新声波可视化
        voiceWaveLevels.value = Array.from({length: 10}, (_, i) => {
          // 采样一些频率来生成波形
          const index = Math.floor(i * 5)
          // 将0-255的值映射到5-20的范围
          return 5 + (dataArray[index] / 255) * 15
        })
      }, 100)
      
      // 保存音频上下文用于之后清理
      audioContext.resume()
      
      // 创建并配置MediaRecorder
      mediaRecorder.value = new MediaRecorder(stream)
      audioChunks.value = []
      
      mediaRecorder.value.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.value.push(e.data)
        }
      }
      
      // 开始录音
      mediaRecorder.value.start()
      isRecording.value = true
      isCancelling.value = false
      recordStartTime.value = Date.now()
      
      // 保存清理函数
      recordTimer.value = setInterval(() => {
        recordDuration.value = Math.floor((Date.now() - recordStartTime.value) / 1000)
      }, 1000)
      
      // 保存动画间隔引用
      voiceAnimationTimer.value = animationInterval
      
    } else {
      alert('您的浏览器不支持录音功能')
    }
  } catch (error) {
    console.error('录音失败:', error)
    alert('无法启动录音: ' + error.message)
    isRecording.value = false
  }
}

// 停止录音并发送
const stopRecording = async () => {
  if (!isRecording.value || !mediaRecorder.value) return
  
  // 如果是滑动取消的，不发送
  if (isCancelling.value) {
    cancelRecording()
    return
  }
  
  try {
    // 结束录音
    mediaRecorder.value.stop()
    clearInterval(recordTimer.value)
    clearInterval(voiceAnimationTimer.value)
    
    // 等待录音数据
    await new Promise(resolve => {
      mediaRecorder.value.onstop = async () => {
        // 如果录音时间太短（小于1秒）
        if (recordDuration.value < 1) {
          // 振动反馈
          if (navigator.vibrate) {
            navigator.vibrate(30)
          }
          
          // 显示提示并取消录音
          alert('录音时间太短')
          resetRecordingState()
          return
        }
        
        // 振动反馈
        if (navigator.vibrate) {
          navigator.vibrate([20, 30, 20])
        }
        
        // 创建音频文件
        const audioBlob = new Blob(audioChunks.value, { type: 'audio/webm' })
        const audioUrl = URL.createObjectURL(audioBlob)
        
        // 发送语音消息
        const newMessage = {
          id: Date.now(),
          content: audioUrl,
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          isSent: true,
          type: 'voice',
          duration: formatRecordTime(recordDuration.value)
        }
        
        messages.value.push(newMessage)
        resetRecordingState()
        
        // 滚动到底部
        await nextTick()
        scrollToBottom()
        
        resolve()
      }
    })
  } catch (error) {
    console.error('处理录音失败:', error)
    resetRecordingState()
  }
}

// 取消录音
const cancelRecording = () => {
  if (!isRecording.value || !mediaRecorder.value) return
  
  try {
    // 振动反馈
    if (navigator.vibrate) {
      navigator.vibrate([10, 20, 30])
    }
    
    mediaRecorder.value.stop()
    resetRecordingState()
  } catch (error) {
    console.error('取消录音失败:', error)
    resetRecordingState()
  }
}

// 重置录音状态
const resetRecordingState = () => {
  isRecording.value = false
  isCancelling.value = false
  recordDuration.value = 0
  
  // 清除定时器
  if (recordTimer.value) {
    clearInterval(recordTimer.value)
    recordTimer.value = null
  }
  
  if (voiceAnimationTimer.value) {
    clearInterval(voiceAnimationTimer.value)
    voiceAnimationTimer.value = null
  }
  
  // 停止所有音轨
  if (mediaRecorder.value && mediaRecorder.value.stream) {
    mediaRecorder.value.stream.getTracks().forEach(track => track.stop())
  }
  
  // 释放资源
  mediaRecorder.value = null
  audioChunks.value = []
}

// 处理触摸移动（滑动取消）
const handleTouchMove = (event) => {
  if (!isRecording.value) return
  
  const touch = event.touches[0]
  const touchY = touch.clientY
  
  // 获取按钮的位置信息
  const btnRect = event.target.getBoundingClientRect()
  const startY = btnRect.top + btnRect.height / 2
  
  // 计算滑动距离（向上为负值）
  const distanceY = touchY - startY
  
  // 如果向上滑动超过50px，进入取消模式
  if (distanceY < -50) {
    if (!isCancelling.value) {
      // 触发振动反馈（如果设备支持）
      if (navigator.vibrate) {
        navigator.vibrate(10)
      }
    }
    isCancelling.value = true
  } else {
    isCancelling.value = false
  }
}

// 格式化录音时间
const formatRecordTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 播放语音消息
const playVoice = (message) => {
  if (playingVoiceId.value === message.id) {
    // 如果当前正在播放，则暂停
    audioPlayer.value.pause()
    playingVoiceId.value = null
  } else {
    // 如果播放其他语音，先停止当前播放
    audioPlayer.value.pause()
    
    // 播放新语音
    audioPlayer.value.src = message.content
    audioPlayer.value.play()
    playingVoiceId.value = message.id
    
    // 监听播放结束
    audioPlayer.value.onended = () => {
      playingVoiceId.value = null
    }
  }
}

// 模拟声波动画
const animateVoiceWaves = () => {
  voiceAnimationTimer.value = setInterval(() => {
    voiceWaveLevels.value = voiceWaveLevels.value.map(() => {
      // 生成随机高度（模拟声波）
      return Math.floor(Math.random() * 15) + 5
    })
  }, 200)
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
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  
  // 释放录音相关资源
  resetRecordingState()
  
  // 释放音频播放器资源
  if (audioPlayer.value) {
    audioPlayer.value.pause()
    audioPlayer.value.src = ''
  }
  
  // 清除所有定时器
  clearInterval(recordTimer.value)
  clearInterval(voiceAnimationTimer.value)
  
  // 关闭全屏
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(err => {
      console.error('退出全屏失败:', err)
    })
  }
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
  background: #f7f7f7;
  padding: 8px 12px;
  box-shadow: 0 -1px 2px rgba(0, 0, 0, 0.1);
  z-index: 50;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border-radius: 4px;
  padding: 4px 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.input-actions {
  display: flex;
  gap: 8px;
}

.action-icon {
  color: #555;
  cursor: pointer;
  padding: 6px;
  transition: color 0.2s ease;
  font-size: 20px;
}

.action-icon:hover {
  color: #07c160;
}

.file-input {
  display: none;
}

input {
  flex: 1;
  background: none;
  border: none;
  padding: 8px 4px;
  color: #333;
  font-size: 15px;
  outline: none;
  min-height: 20px;
  max-height: 100px;
}

input::placeholder {
  color: #999;
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

.video-load-shade {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
}

/* 语音输入相关样式 */
.voice-record-btn {
  flex: 1;
  height: 36px;
  border-radius: 4px;
  background: #f5f5f5;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  user-select: none;
  touch-action: none;
  cursor: pointer;
  transition: background-color 0.2s;
  margin: 0 8px;
}

.voice-record-btn:active {
  background: #e0e0e0;
}

.voice-toggle-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #d4af37;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.voice-toggle-btn i {
  color: #fff;
  font-size: 20px;
}

.voice-toggle-btn:active {
  transform: scale(0.95);
}

.voice-toggle-btn.active {
  background: #e5c158;
}

.send-btn-container {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-btn {
  color: #d4af37;
  font-size: 24px;
  cursor: pointer;
}

.voice-record-feedback {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  pointer-events: none;
}

.voice-record-panel {
  width: 160px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.voice-record-panel.cancelling {
  background: rgba(232, 17, 35, 0.7);
}

.record-icon {
  font-size: 36px;
  color: #fff;
  margin-bottom: 16px;
}

.record-icon.recording {
  animation: pulse 1s infinite alternate;
}

@keyframes pulse {
  from {
    opacity: 0.6;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1.1);
  }
}

.record-wave-container {
  display: flex;
  align-items: flex-end;
  height: 40px;
  gap: 3px;
  margin-bottom: 12px;
}

.record-wave {
  width: 3px;
  background: #fff;
  border-radius: 1px;
  transition: height 0.2s ease;
}

.record-time {
  font-size: 18px;
  color: #fff;
  margin-bottom: 12px;
  font-family: monospace;
}

.record-tip {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.record-cancel-tip {
  font-size: 12px;
  color: #fff;
  font-weight: 500;
}

/* 语音消息样式 */
.voice-message {
  display: flex;
  align-items: center;
  background: #3a3f5a;
  padding: 12px 16px;
  border-radius: 4px 18px 18px 18px;
  min-width: 80px;
  max-width: 240px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s;
}

.sent .voice-message {
  background: #0080ff;
  border-radius: 18px 4px 18px 18px;
}

.voice-message:hover {
  opacity: 0.9;
}

.voice-message-icon {
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
}

.voice-message-icon i {
  color: #fff;
  font-size: 16px;
}

.voice-message-duration {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  margin-right: 8px;
}

.voice-wave-container {
  display: flex;
  align-items: center;
  gap: 2px;
}

.voice-wave {
  width: 2px;
  height: 8px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 1px;
}

.voice-message.playing .voice-wave {
  animation: wave 1s infinite ease-in-out alternate;
}

.voice-message.playing .voice-wave:nth-child(1) { animation-delay: 0.0s; }
.voice-message.playing .voice-wave:nth-child(2) { animation-delay: 0.2s; }
.voice-message.playing .voice-wave:nth-child(3) { animation-delay: 0.4s; }
.voice-message.playing .voice-wave:nth-child(4) { animation-delay: 0.6s; }

@keyframes wave {
  0% { height: 3px; }
  100% { height: 12px; }
}
</style> 