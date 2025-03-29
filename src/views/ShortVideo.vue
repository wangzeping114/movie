<template>
  <div class="short-video-container">
    <!-- SVG渐变定义 -->
    <svg width="0" height="0" style="position: absolute;">
      <defs>
        <linearGradient id="gradient-normal" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="rgba(255, 255, 255, 0.9)"/>
          <stop offset="100%" stop-color="rgba(255, 255, 255, 0.7)"/>
        </linearGradient>
        <linearGradient id="gradient-active" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#d4af37"/>
          <stop offset="100%" stop-color="#e5c158"/>
        </linearGradient>
      </defs>
    </svg>

    <!-- 搜索按钮移到顶部 -->
    <div class="top-search">
      <div class="search-btn" @click="showSearchPanel = true">
        <i class="material-icons">search</i>
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
        preload="auto"
        muted
        ref="videoRefs"
        @ended="handleVideoEnd"
        @timeupdate="handleTimeUpdate(index)"
        @loadedmetadata="handleVideoLoaded(index)"
        @click="togglePlay"
      ></video>
      <div class="loading-spinner" v-if="!videos[currentIndex].isLoaded">
        <i class="material-icons">hourglass_empty</i>
      </div>
            <!-- 视频信息 -->
      <!-- <div class="video-info" :class="{ visible: currentIndex !== null }">
        <div class="user-info">
          <img :src="videos[currentIndex].authorAvatar" :alt="videos[currentIndex].authorName" class="avatar">
          <span class="username">@{{ videos[currentIndex].authorName }}</span>
        </div>
        <p class="description">{{ videos[currentIndex].description }}</p>
      </div> -->

      <!-- 右侧操作栏 -->
      <div class="action-bar">
        <!-- 头像 -->
        <div class="user-profile" @click="goToProfile">
          <img :src="user.avatar || defaultAvatar" :alt="user.username || t('common.notLoggedIn')" class="profile-avatar">
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

      <!-- 添加播放控制层 -->
      <div 
        class="video-controls" 
        v-if="currentIndex !== null"
      >
        <!-- 进度条和时间显示 -->
        <div class="progress-container">
          <!-- 播放/暂停按钮 -->
          <div class="play-pause-btn" @click.stop.prevent="togglePlay">
            <i class="material-icons">{{ videos[currentIndex].isPlaying ? 'pause' : 'play_arrow' }}</i>
          </div>
          
          <!-- 进度条 -->
          <div class="progress-bar" @click.stop.prevent="handleProgressClick">
            <div class="progress-bg"></div>
            <div class="progress-current" :style="{ width: `${videos[currentIndex].progress}%` }"></div>
          </div>
          
          <!-- 时间显示 -->
          <div class="time-display">
            {{ formatTime(videos[currentIndex].currentTime) }} / {{ formatTime(videos[currentIndex].duration) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 底部导航栏 -->
    <div class="bottom-nav">
      <div class="nav-item" :class="{ active: currentTab === 'home' }" @click="handleTabClick('home')">
        <span class="material-icons">{{ currentTab === 'home' ? 'home' : 'home_outlined' }}</span>
        <span class="nav-label">首页</span>
      </div>
      <div class="nav-item" :class="{ active: currentTab === 'live' }" @click="handleTabClick('live')">
        <div class="svg-icon-container" :class="{ active: currentTab === 'live' }">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="svg-icon">
            <path d="M21 6h-7.59l3.29-3.29L16 2l-4 4-4-4-.71.71L10.59 6H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 14H3V8h18v12zM9 10v8l7-4z"/>
          </svg>
        </div>
        <span class="nav-label">直播</span>
      </div>
      <div class="nav-item publish-btn" @click="handlePublish">
        <span class="material-icons">add_circle</span>
        <span class="nav-label">发布</span>
      </div>
      <div class="nav-item" :class="{ active: currentTab === 'messages' }" @click="handleTabClick('messages')">
        <span class="material-icons">{{ currentTab === 'messages' ? 'chat_bubble' : 'chat_bubble_outline' }}</span>
        <span class="nav-label">消息</span>
        <div v-if="unreadCount > 0" class="badge">{{ unreadCount }}</div>
      </div>
      <div class="nav-item" :class="{ active: currentTab === 'profile' }" @click="handleTabClick('profile')">
        <span class="material-icons">{{ currentTab === 'profile' ? 'person' : 'person_outline' }}</span>
        <span class="nav-label">我的</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import CommentPanel from '../components/CommentPanel.vue'
import SearchPanel from '../components/SearchPanel.vue'
import Icon from '../components/Icon.vue'

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
    isAnimating: false,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    progress: 0
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
const hasUserInteracted = ref(false)

// 添加新的响应式变量
const currentTab = ref('home')
const unreadCount = ref(3) // 未读消息数量

const handleTouchStart = (e) => {
  // 如果点击的是控制层或进度条，不处理触摸事件
  if (e.target.closest('.video-controls') || e.target.closest('.progress-bar')) {
    return;
  }
  
  if (!hasUserInteracted.value) {
    hasUserInteracted.value = true;
  }
  touchStartY = e.touches[0].clientY;
}

const handleTouchMove = (e) => {
  // 如果点击的是控制层或进度条，不处理触摸事件
  if (e.target.closest('.video-controls') || e.target.closest('.progress-bar')) {
    return;
  }
  touchEndY = e.touches[0].clientY;
}

let isSwitching = false;

const handleTouchEnd = () => {
  // 如果点击的是控制层或进度条，不处理触摸事件
  if (event.target.closest('.video-controls') || event.target.closest('.progress-bar')) {
    return;
  }

  if (isSwitching) return;
  isSwitching = true;
  
  const diff = touchStartY - touchEndY;
  if (Math.abs(diff) > 50) {
    if (diff > 0 && currentIndex.value < videos.value.length - 1) {
      currentIndex.value++;
    } else if (diff < 0 && currentIndex.value > 0) {
      currentIndex.value--;
    }
    updateVideoPlay();
  }
  setTimeout(() => {
    isSwitching = false;
  }, 300);
}

const togglePlay = async () => {
  if (!videoRefs.value) return;
  const video = videoRefs.value[currentIndex.value];
  if (!video) return;

  try {
    // 先更新状态，避免重复点击
    const isCurrentlyPlaying = !video.paused;
    videos.value[currentIndex.value].isPlaying = !isCurrentlyPlaying;

    if (isCurrentlyPlaying) {
      // 如果正在播放，直接暂停
      video.pause();
    } else {
      // 如果已暂停，尝试播放
      try {
        video.muted = !hasInteracted;
        await video.play();
      } catch (error) {
        // 如果播放失败，恢复状态
        console.error('播放失败:', error);
        videos.value[currentIndex.value].isPlaying = false;
      }
    }
  } catch (error) {
    console.error('操作失败:', error);
    // 发生错误时恢复状态
    videos.value[currentIndex.value].isPlaying = !video.paused;
  }
};

const updateVideoPlay = async () => {
  if (!videoRefs.value) return;

  // 先暂停所有视频
  videoRefs.value.forEach((video, idx) => {
    if (idx !== currentIndex.value) {
      video.pause();
      videos.value[idx].isPlaying = false;
    }
  });

  // 获取当前视频
  const currentVideo = videoRefs.value[currentIndex.value];
  if (currentVideo) {
    try {
      currentVideo.muted = !hasInteracted;
      
      // 如果视频已经准备好，直接播放
      if (currentVideo.readyState >= 2) {
        await currentVideo.play();
        videos.value[currentIndex.value].isPlaying = true;
      } else {
        // 等待视频加载完成
        await new Promise((resolve) => {
          const playHandler = async () => {
            try {
              await currentVideo.play();
              videos.value[currentIndex.value].isPlaying = true;
            } catch (e) {
              console.error('视频加载后播放失败:', e);
              videos.value[currentIndex.value].isPlaying = false;
            }
            resolve();
          };
          currentVideo.addEventListener('canplay', playHandler, { once: true });
        });
      }
    } catch (error) {
      console.error('播放失败:', error);
      videos.value[currentIndex.value].isPlaying = false;
    }
  }
};

const handleVideoEnd = () => {
  if (currentIndex.value < videos.value.length - 1) {
    currentIndex.value++;
  } else {
    currentIndex.value = 0; // 回到第一个视频
  }

  nextTick(() => {
    updateVideoPlay();
  });
};

const handleLike = (index) => {
  if (!user.isLoggedIn) {
    router.push({
      path: '/login',
      query: { from: '/short-video' }
    })
    return
  }

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

// 视频播放状态
const handleTimeUpdate = (index) => {
  if (!videoRefs.value || !videoRefs.value[index]) return
  const video = videoRefs.value[index]
  videos.value[index].currentTime = video.currentTime
  videos.value[index].progress = (video.currentTime / video.duration) * 100
}

const handleVideoLoaded = (index) => {
  videos.value[index].isLoaded = true;
  if (!videoRefs.value || !videoRefs.value[index]) return
  const video = videoRefs.value[index]
  videos.value[index].duration = video.duration
}

const handleProgressClick = (e) => {
  if (!videoRefs.value || !videoRefs.value[currentIndex.value]) return
  const video = videoRefs.value[currentIndex.value]
  const rect = e.currentTarget.getBoundingClientRect()
  const x = e.clientX - rect.left
  const percentage = x / rect.width
  video.currentTime = video.duration * percentage
}

const formatTime = (seconds) => {
  if (!seconds) return '00:00'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

onMounted(() => {
  console.log('ShortVideo component mounted')
  
  // 确保视频引用已经准备好
  nextTick(() => {
    // 添加用户交互监听
    const handleInteraction = () => {
      hasUserInteracted.value = true
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('touchstart', handleInteraction)
    }

    document.addEventListener('click', handleInteraction)
    document.addEventListener('touchstart', handleInteraction)

    // 初始化视频播放
    updateVideoPlay()
  })
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

// 处理标签页切换
const handleTabClick = (tab) => {
  currentTab.value = tab
  if (tab === 'profile') {
    router.push('/profile')
  } else if (tab === 'messages') {
    router.push('/messages')
  } else if (tab === 'live') {
    router.push('/live')
  }
}

// 处理发布按钮点击
const handlePublish = () => {
  router.push('/publish')
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
  padding-bottom: 72px;
}

.video-container {
  position: relative;
  height: calc(100vh - 72px);
  width: 100%;
  overflow: hidden;
  touch-action: pan-y;
  background: #000;
  perspective: 1000px;
  transform-style: preserve-3d;
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
  will-change: transform, opacity;
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

/* 修改视频切换动画 */
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
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.video-player:not(.active) {
  animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

/* 添加视频容器样式 */
.video-container {
  position: relative;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  touch-action: pan-y;
  background: #000;
  perspective: 1000px;
  transform-style: preserve-3d;
}

/* 优化视频信息显示 */
.video-info {
  position: absolute;
  bottom: 100px;
  left: 0;
  right: 80px;
  padding: 20px;
  color: white;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.3));
  z-index: 2;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
}

.video-info.visible {
  opacity: 1;
  transform: translateY(0);
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
  position: fixed;
  right: 20px;
  bottom: 100px;
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
}

.action-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  transition: all 0.3s ease;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px);
}

.action-icon i {
  font-size: 22px;
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
}

.action-icon:hover {
  background: rgba(0, 0, 0, 0.3);
  transform: scale(1.1);
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
  margin-bottom: 24px;
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
  display: none;
}

/* 修改操作栏样式 */
.action-bar {
  position: fixed;
  right: 20px;
  bottom: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  z-index: 10;
}

.action-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  transition: all 0.3s ease;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px);
}

.action-icon i {
  font-size: 22px;
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
}

.action-icon:hover {
  background: rgba(0, 0, 0, 0.3);
  transform: scale(1.1);
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

/* 修改视频控制层样式 */
.video-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.5));
  z-index: 10;
  opacity: 1;
  pointer-events: auto;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
}

/* 播放按钮样式 */
.play-pause-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.play-pause-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.play-pause-btn i {
  color: #fff;
  font-size: 24px;
  opacity: 0.9;
}

/* 进度条样式 */
.progress-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  cursor: pointer;
  position: relative;
  transition: height 0.2s ease;
}

.progress-bar:hover {
  height: 6px;
}

.progress-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.progress-current {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  background: #d4af37;
  border-radius: 2px;
  transition: width 0.1s linear;
}

.time-display {
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  min-width: 100px;
  text-align: right;
  font-family: monospace;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* 添加视频加载动画 */
.loading-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
  color: #fff;
  font-size: 48px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

/* 底部导航栏样式 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 72px;
  background: rgba(10, 15, 26, 0.85);
  backdrop-filter: blur(30px);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0 20px;
  z-index: 100;
  border-top: 1px solid rgba(212, 175, 55, 0.08);
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.15);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  padding: 8px 0;
  width: 64px;
  height: 64px;
  gap: 4px;
}

.nav-item .material-icons {
  font-size: 24px;
  transition: all 0.3s ease;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.nav-label {
  font-size: 12px;
  font-weight: 500;
  opacity: 0.7;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  line-height: 1;
  text-align: center;
  width: 100%;
  margin-top: 2px;
}

.nav-item.active {
  color: #d4af37;
}

.nav-item.active .material-icons {
  background: linear-gradient(180deg, #d4af37 0%, #e5c158 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-item.active .nav-label {
  opacity: 1;
  color: #d4af37;
  font-weight: 600;
}

.nav-item:hover {
  color: #e5c158;
  transform: translateY(-2px);
}

.nav-item:hover .material-icons {
  transform: scale(1.1);
}

.nav-item:hover .nav-label {
  color: #e5c158;
  opacity: 1;
}

.publish-btn {
  margin-top: -32px;
  background: linear-gradient(135deg, #d4af37, #e5c158);
  width: 64px;
  height: 64px;
  border-radius: 50%;
  color: #000000;
  box-shadow: 0 8px 32px rgba(212, 175, 55, 0.4),
              0 0 0 2px rgba(255, 255, 255, 0.1),
              inset 0 2px 4px rgba(255, 255, 255, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 2;
  transform: translateY(0);
}

.publish-btn::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0));
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.publish-btn::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  bottom: 2px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0));
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.publish-btn .material-icons {
  font-size: 32px;
  margin-bottom: 0;
  background: none;
  -webkit-background-clip: initial;
  -webkit-text-fill-color: #000000;
  width: 32px;
  height: 32px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.publish-btn .nav-label {
  position: absolute;
  bottom: -28px;
  color: #d4af37;
  font-weight: 600;
  opacity: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 12px;
  width: auto;
  margin-top: 0;
  letter-spacing: 0.5px;
}

.publish-btn:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 12px 40px rgba(212, 175, 55, 0.5),
              0 0 0 2px rgba(255, 255, 255, 0.2),
              inset 0 2px 4px rgba(255, 255, 255, 0.4);
}

.publish-btn:hover::before {
  opacity: 1;
}

.publish-btn:hover::after {
  opacity: 1;
}

.publish-btn:active {
  transform: translateY(0) scale(0.95);
  box-shadow: 0 4px 16px rgba(212, 175, 55, 0.3),
              0 0 0 2px rgba(255, 255, 255, 0.1),
              inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: linear-gradient(135deg, #ff4d4d, #ff6b6b);
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  border: 2px solid rgba(10, 15, 26, 0.8);
  box-shadow: 0 4px 12px rgba(255, 77, 77, 0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 4px 12px rgba(255, 77, 77, 0.3);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(255, 77, 77, 0.4);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 4px 12px rgba(255, 77, 77, 0.3);
  }
}

/* 添加顶部搜索按钮样式 */
.top-search {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 20;
}

.search-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-btn:hover {
  background: rgba(0, 0, 0, 0.4);
  transform: scale(1.1);
}

.search-btn i {
  color: #fff;
  font-size: 24px;
  opacity: 0.9;
}

/* 添加自定义的文字图标样式 */
.nav-icon-text {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
  color: #0a0f1a;
  transition: all 0.3s ease;
}

.nav-icon-text.active {
  background: linear-gradient(180deg, #d4af37 0%, #e5c158 100%);
  color: #000;
}

.nav-item:hover .nav-icon-text {
  transform: scale(1.1);
}

/* 修改SVG图标样式 */
.svg-icon-container {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.svg-icon {
  width: 24px;
  height: 24px;
  fill: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.svg-icon-container.active .svg-icon {
  fill: #d4af37;
}

.nav-item:hover .svg-icon-container {
  transform: scale(1.1);
}

.nav-item:hover .svg-icon {
  fill: #e5c158;
}
</style> 