<template>
  <div class="short-video-container">
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
          
          <div class="interaction-buttons">
            <div class="button-item" @click="handleLike(index)">
              <span class="icon">❤️</span>
              <span>{{ video.likes }}</span>
            </div>
            <div class="button-item" @click="handleComment(index)">
              <span class="icon">💬</span>
              <span>{{ video.comments }}</span>
            </div>
            <div class="button-item" @click="handleShare(index)">
              <span class="icon">↗️</span>
              <span>{{ video.shares }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

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
    url: sampleVideos[index % sampleVideos.length],
    authorName: '用户' + (index + 1),
    authorAvatar: 'https://randomuser.me/api/portraits/men/' + (index + 1) + '.jpg',
    description: '这是第' + (index + 1) + '个视频描述，展示精彩内容',
    likes: Math.floor(Math.random() * 10000),
    comments: Math.floor(Math.random() * 1000),
    shares: Math.floor(Math.random() * 500)
  }))
}

const videos = ref(generateRandomVideos(5))

const currentIndex = ref(0)
const videoRefs = ref([])
let touchStartY = 0
let touchEndY = 0
let hasInteracted = false

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
  if (!user.isLoggedIn) {
    router.push({
      path: '/login',
      query: { from: '/short-video' }
    })
    return
  }
  videos.value[index].likes++
}

const handleComment = (index) => {
  if (!user.isLoggedIn) {
    router.push({
      path: '/login',
      query: { from: '/short-video' }
    })
    return
  }
  // 实现评论功能
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
</script>

<style scoped>
.short-video-container {
  width: 100%;
  height: 100vh;
  background-color: #000;
  overflow: hidden;
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
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  color: white;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
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
}

.author-name {
  font-size: 16px;
  font-weight: bold;
}

.video-description {
  margin-bottom: 15px;
  font-size: 14px;
}

.interaction-buttons {
  display: flex;
  gap: 20px;
}

.button-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.icon {
  font-size: 24px;
}

.button-item span:last-child {
  font-size: 12px;
}
</style> 