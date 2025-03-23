<template>
  <div class="video-container">
    <!-- 顶部导航区域 -->
    <div class="top-nav">
      <div class="user-profile" @click="goToProfile">
        <img 
          :src="user.avatar || 'https://picsum.photos/200'"
          :alt="user.username || '未登录'"
          class="user-avatar"
        >
        <div class="login-status" :class="{ 'logged-in': user.isLoggedIn }"></div>
      </div>
    </div>
    
    <!-- 视频内容 -->
    <div class="video-list" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
      <div v-for="(video, index) in videos" 
           :key="index" 
           class="video-item"
           :style="{ transform: 'translateY(' + (currentIndex === index ? '0' : (index < currentIndex ? '-100%' : '100%')) + ')' }">
        <video
          ref="videoRefs"
          :src="video.url"
          class="video-player"
          loop
          muted
          playsinline
          @click="togglePlay(index)"
          @ended="handleVideoEnd(index)"
        ></video>
        
        <div class="video-info">
          <div class="author-info">
            <img :src="video.authorAvatar" class="author-avatar" />
            <span class="author-name">{{ video.authorName }}</span>
          </div>
          <div class="video-description">{{ video.description }}</div>
        </div>
      </div>
    </div>

    <!-- 评论面板 -->
    <CommentPanel 
      v-model="showComments"
      :video-id="String(currentIndex + 1)"
    />

    <!-- 右侧操作栏 -->
    <div class="action-bar">
      <div class="action-item" @click="handleLike(currentIndex)">
        <span 
          class="material-icons like-icon" 
          :class="{ 
            'liked': videos[currentIndex].isLiked,
            'like-animation': videos[currentIndex].isAnimating 
          }"
        >
          {{ videos[currentIndex].isLiked ? 'favorite' : 'favorite_border' }}
        </span>
        <span class="count" :class="{ 'liked': videos[currentIndex].isLiked }">
          {{ formatCount(videos[currentIndex].likes) }}
        </span>
      </div>
      <div class="action-item" @click="handleComment(currentIndex)">
        <span class="material-icons">chat_bubble_outline</span>
        <span class="count">{{ formatCount(videos[currentIndex].comments) }}</span>
      </div>
      <div class="action-item" @click="handleShare(currentIndex)">
        <span class="material-icons">share</span>
        <span class="count">{{ formatCount(videos[currentIndex].shares) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import CommentPanel from '../components/CommentPanel.vue'

console.log('ShortVideo component loaded')

const router = useRouter()
const user = JSON.parse(localStorage.getItem('user') || '{}')

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
const videoRefs = ref([])
let touchStartY = 0
let touchEndY = 0
let hasInteracted = false
const showComments = ref(false)

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
  const video = videoRefs.value[index]
  try {
    if (video.paused) {
      await video.play()
    } else {
      video.pause()
    }
  } catch (error) {
    console.log('播放失败:', error)
  }
}

const handleVideoEnd = (index) => {
  if (index === currentIndex.value) {
    videoRefs.value[index].play()
  }
}

const updateVideoPlay = async () => {
  videoRefs.value.forEach((video, index) => {
    if (index === currentIndex.value) {
      if (hasInteracted) {
        video.play().catch(error => {
          console.log('自动播放失败:', error)
        })
      }
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
  showComments.value = true
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

onMounted(() => {
  console.log('ShortVideo component mounted')
  document.addEventListener('click', handleUserInteraction)
  document.addEventListener('touchstart', handleUserInteraction)
})

onUnmounted(() => {
  console.log('ShortVideo component unmounted')
  document.removeEventListener('click', handleUserInteraction)
  document.removeEventListener('touchstart', handleUserInteraction)
  videoRefs.value.forEach(video => {
    video.pause()
    video.src = ''
  })
})

// 格式化数字
const formatCount = (count) => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k'
  }
  return count
}
</script>

<style scoped>
.video-container {
  position: relative;
  height: 100vh;
  background-color: #000;
  overflow: hidden;
}

.top-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  padding: 10px 16px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  z-index: 100;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), transparent);
}

.user-profile {
  position: relative;
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.user-profile:hover {
  transform: scale(1.1);
}

.user-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  object-fit: cover;
}

.login-status {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #fff;
  background-color: #999;
  transition: background-color 0.3s ease;
}

.login-status.logged-in {
  background-color: #4CAF50;
}

.video-list {
  width: 100%;
  height: 100%;
  position: relative;
}

.video-item {
  position: absolute;
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease-out;
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.author-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.author-name {
  font-size: 16px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.video-description {
  font-size: 14px;
  line-height: 1.4;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.action-bar {
  position: fixed;
  right: 12px;
  bottom: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 100;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
  cursor: pointer;
  color: #fff;
}

.action-item .material-icons {
  font-size: 32px;
  margin-bottom: 4px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.action-item .count {
  font-size: 14px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.like-icon {
  transition: all 0.3s ease;
}

.like-icon.liked {
  color: #ff2c55;
}

.like-animation {
  animation: likeAnimation 0.5s ease;
}

@keyframes likeAnimation {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
}

.count.liked {
  color: #ff2c55;
}
</style> 