<template>
  <div class="short-video-container">
    <!-- 搜索导航栏 -->
    <div class="search-nav">
      <div class="search-box" @click="showSearchPanel = true">
        <span class="material-icons search-icon">search</span>
        <span class="placeholder">{{ t('search.placeholder') }}</span>
      </div>
    </div>

    <!-- 搜索面板 -->
    <SearchPanel
      v-model="showSearchPanel"
      @search="handleSearch"
    />

    <div 
      class="video-container" 
      ref="videoContainer"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <video
        v-for="(video, index) in videos"
        :key="video.id"
        :src="video.url"
        class="video-player"
        :class="{ active: currentIndex === index }"
        loop
        muted
        ref="videoRefs"
        @click="togglePlay(index)"
        @ended="handleVideoEnd(index)"
      ></video>
      
      <!-- 视频信息 -->
      <div class="video-info">
        <div class="user-info">
          <img :src="videos[currentIndex].authorAvatar" :alt="videos[currentIndex].authorName" class="avatar">
          <span class="username">@{{ videos[currentIndex].authorName }}</span>
        </div>
        <p class="description">{{ videos[currentIndex].description }}</p>
      </div>

      <!-- 右侧操作栏 -->
      <div class="action-bar">
        <!-- 头像 -->
        <div class="user-profile" @click="goToProfile">
          <img :src="user.avatar || defaultAvatar" :alt="user.username || '未登录'" class="profile-avatar">
          <div class="status-indicator" :class="{ 'online': user.isLoggedIn }"></div>
        </div>

        <!-- 点赞按钮 -->
        <div class="action-item" @click="handleLike(currentIndex)">
          <div class="action-icon" :class="{ 'liked': videos[currentIndex].isLiked }">
            <i class="material-icons">{{ videos[currentIndex].isLiked ? 'favorite' : 'favorite_border' }}</i>
          </div>
          <span class="action-count">{{ formatNumber(videos[currentIndex].likes) }}</span>
        </div>

        <!-- 评论按钮 -->
        <div class="action-item" @click="handleComment(currentIndex)">
          <div class="action-icon">
            <i class="material-icons">chat_bubble_outline</i>
          </div>
          <span class="action-count">{{ formatNumber(videos[currentIndex].comments) }}</span>
        </div>

        <!-- 分享按钮 -->
        <div class="action-item" @click="handleShare(currentIndex)">
          <div class="action-icon">
            <i class="material-icons">share</i>
          </div>
          <span class="action-count">{{ formatNumber(videos[currentIndex].shares) }}</span>
        </div>
      </div>

      <!-- 评论面板 -->
      <CommentPanel
        v-model="showCommentPanel"
        :video-id="videos[currentIndex].id"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import CommentPanel from '../components/CommentPanel.vue'
import SearchPanel from '../components/SearchPanel.vue'

console.log('ShortVideo component loaded')

const router = useRouter()
const { t } = useI18n()
const user = JSON.parse(localStorage.getItem('user') || '{}')
const defaultAvatar = 'https://randomuser.me/api/portraits/lego/1.jpg'

// 示例视频列表
const sampleVideos = [
  'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'
]

// 生成随机视频数据
const generateRandomVideos = (count) => {
  return Array.from({ length: count }, (_, index) => ({
    id: String(index + 1),
    url: sampleVideos[index % sampleVideos.length],
    authorName: '用户' + (index + 1),
    authorAvatar: 'https://randomuser.me/api/portraits/men/' + (index + 1) + '.jpg',
    description: '这是第' + (index + 1) + '个视频描述，展示精彩内容',
    likes: Math.floor(Math.random() * 10000),
    comments: Math.floor(Math.random() * 1000),
    shares: Math.floor(Math.random() * 500),
    isLiked: false,
    isAnimating: false
  }))
}

const videos = ref(generateRandomVideos(5))
const currentIndex = ref(0)
const videoRefs = ref(null)
let touchStartY = 0
let touchEndY = 0
let hasInteracted = false
const showCommentPanel = ref(false)
const showSearchPanel = ref(false)

const handleTouchStart = (e) => {
  touchStartY = e.touches[0].clientY
}

const handleTouchMove = (e) => {
  touchEndY = e.touches[0].clientY
}

const handleTouchEnd = () => {
  const diff = touchStartY - touchEndY
  if (Math.abs(diff) > 50) {
    if (diff > 0 && currentIndex.value < videos.value.length - 1) {
      currentIndex.value++
    } else if (diff < 0 && currentIndex.value > 0) {
      currentIndex.value--
    }
    updateVideoPlay()
  }
}

const togglePlay = async (index) => {
  if (!videoRefs.value) return
  const video = videoRefs.value[index]
  if (!video) return
  
  try {
    if (video.paused) {
      // 取消静音并播放
      video.muted = false
      await video.play()
      hasInteracted = true
    } else {
      video.pause()
    }
  } catch (error) {
    console.log('播放失败:', error)
  }
}

const handleVideoEnd = (index) => {
  if (!videoRefs.value) return
  const video = videoRefs.value[index]
  if (video && index === currentIndex.value) {
    video.play().catch(error => {
      console.log('重新播放失败:', error)
    })
  }
}

const updateVideoPlay = async () => {
  if (!videoRefs.value) return
  Array.from(videoRefs.value).forEach((video, index) => {
    if (!video) return
    
    if (index === currentIndex.value) {
      // 初始时保持静音播放
      video.muted = !hasInteracted
      video.play().catch(error => {
        console.log('自动播放失败:', error)
      })
    } else {
      video.pause()
      video.currentTime = 0
    }
  })
}

const handleLike = (index) => {
  // 如果正在动画中，不响应点击
  if (videos.value[index].isAnimating) return

  // 切换点赞状态
  videos.value[index].isLiked = !videos.value[index].isLiked
  videos.value[index].likes += videos.value[index].isLiked ? 1 : -1

  // 添加动画标记
  videos.value[index].isAnimating = true
  setTimeout(() => {
    videos.value[index].isAnimating = false
  }, 300)
}

const handleComment = (index) => {
  if (!user.isLoggedIn) {
    router.push({
      path: '/login',
      query: { from: '/short-video' }
    })
    return
  }
  showCommentPanel.value = true
}

const handleShare = (index) => {
  if (!user.isLoggedIn) {
    router.push({
      path: '/login',
      query: { from: '/short-video' }
    })
    return
  }
  // 实现分享功能
}

const handleUserInteraction = () => {
  if (!hasInteracted) {
    hasInteracted = true
    updateVideoPlay()
  }
}

// 跳转到个人主页
const goToProfile = () => {
  if (user.isLoggedIn) {
    router.push('/profile')
  } else {
    router.push('/login')
  }
}

// 处理搜索
const handleSearch = (query) => {
  if (!query.trim()) return
  // TODO: 实现搜索功能
  console.log('搜索:', query)
}

// 处理扫一扫
const handleScan = () => {
  // TODO: 实现扫一扫功能
  console.log('扫一扫')
}

// 处理消息
const handleMessage = () => {
  // TODO: 实现消息功能
  console.log('消息')
}

onMounted(() => {
  console.log('ShortVideo component mounted')
  // 组件加载后自动播放当前视频（静音）
  updateVideoPlay()
  document.addEventListener('click', handleUserInteraction)
  document.addEventListener('touchstart', handleUserInteraction)
})

onUnmounted(() => {
  console.log('ShortVideo component unmounted')
  document.removeEventListener('click', handleUserInteraction)
  document.removeEventListener('touchstart', handleUserInteraction)
  if (videoRefs.value) {
    Array.from(videoRefs.value).forEach(video => {
      if (video) {
        video.pause()
        video.src = ''
      }
    })
  }
})

// 格式化数字
const formatNumber = (count) => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k'
  }
  return count
}
</script>

<style scoped>
.short-video-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.video-container {
  position: relative;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  touch-action: pan-y;
  padding-top: 56px;
  background: #000;
}

.video-player {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease-out;
  background: #000;
  opacity: 0;
  transform: translateY(100%);
}

.video-player.active {
  transform: translateY(0);
  z-index: 1;
  opacity: 1;
}

.video-player:not(.active) {
  transform: translateY(100%);
  z-index: 0;
  opacity: 0;
  pointer-events: none;
}

/* 添加视频切换动画 */
@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideDown {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(100%);
    opacity: 0;
  }
}

.video-player.active {
  animation: slideUp 0.3s ease-out forwards;
}

.video-player:not(.active) {
  animation: slideDown 0.3s ease-out forwards;
}

.video-info {
  position: absolute;
  bottom: 100px;
  left: 0;
  right: 80px;
  padding: 20px;
  color: white;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.3));
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.username {
  font-size: 16px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.description {
  font-size: 14px;
  line-height: 1.4;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.action-bar {
  position: absolute;
  right: 20px;
  bottom: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  z-index: 10;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.action-item:hover {
  transform: scale(1.1);
}

.action-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  transition: all 0.3s ease;
}

.action-icon i {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
}

.action-icon.liked {
  background: transparent;
}

.action-icon.liked i {
  color: #ff3040;
}

.action-count {
  color: #fff;
  font-size: 12px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.user-profile {
  position: relative;
  cursor: pointer;
  margin-bottom: 20px;
}

.profile-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s;
}

.profile-avatar:hover {
  transform: scale(1.1);
}

.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ccc;
  border: 2px solid #fff;
}

.status-indicator.online {
  background: #4CAF50;
}

/* 添加评论面板样式 */
:deep(.comment-panel) {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-radius: 20px 20px 0 0;
  z-index: 100;
  max-height: 80vh;
  overflow-y: auto;
}

.search-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  pointer-events: none;
  background: linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0));
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  border-radius: 20px;
  padding: 8px 14px;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.15);
  pointer-events: auto;
  backdrop-filter: blur(8px);
  background: rgba(0, 0, 0, 0.2);
}

.search-box:hover {
  border-color: rgba(255, 255, 255, 0.25);
  background: rgba(0, 0, 0, 0.3);
}

.search-icon {
  color: rgba(255, 255, 255, 0.7);
  font-size: 18px;
  margin-right: 6px;
}

.placeholder {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0.2px;
}

/* 移除不需要的样式 */
.nav-actions {
  display: none;
}

/* 添加搜索面板样式 */
:deep(.search-panel) {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  z-index: 1000;
  overflow-y: auto;
}
</style> 