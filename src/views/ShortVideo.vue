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
      :class="{ 'landscape-mode': isLandscape }"
    >
      <video
        v-for="(video, index) in videos"
        :key="video.id"
        :src="video.url"
        class="video-player"
        :class="{ 
          'active': currentIndex === index, 
          'widescreen-player': video.isWidescreen && !isFullscreen,
          'landscape': isLandscape 
        }"
        preload="metadata"
        playsinline
        webkit-playsinline
        x5-playsinline
        x5-video-player-type="h5"
        x5-video-player-fullscreen="true"
        x5-video-orientation="portrait"
        :muted="video.isMuted"
        ref="videoRefs"
        @ended="handleVideoEnd"
        @timeupdate="handleTimeUpdate(index)"
        @loadedmetadata="handleVideoLoaded(index)"
        @loadeddata="checkVideoAspectRatio(index)"
        @click="togglePlay"
        :poster="video.poster"
      ></video>
      
      <!-- 调试信息 -->
      <div class="debug-info" v-if="showDebug">
        <p>视频宽高比: {{ videos[currentIndex].aspectRatio?.toFixed(2) }}</p>
        <p>是否宽屏: {{ videos[currentIndex].isWidescreen ? '是' : '否' }}</p>
        <p>全屏模式: {{ isFullscreen ? '是' : '否' }}</p>
        <p>横屏模式: {{ isLandscape ? '是' : '否' }}</p>
      </div>
      
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
      <div class="action-bar" :class="{ 'landscape-action-bar': isLandscape }">
        <!-- 作者头像 -->
        <div class="author-avatar-wrapper">
          <div class="author-avatar" @click="goToUserProfile(videos[currentIndex].authorId)">
            <img :src="videos[currentIndex].authorAvatar" :alt="videos[currentIndex].authorName">
          </div>
          <div class="follow-plus-container" v-if="!videos[currentIndex].isFollowed" @click.stop="toggleFollow(currentIndex)">
            <div class="follow-plus">
              <i class="material-icons" v-if="videos[currentIndex].followAnimation === 'check'">check</i>
              <i class="material-icons" v-else>add</i>
            </div>
          </div>
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

      <!-- 作者名称 -->
      <!-- <div class="author-name-container">
        <div class="author-name">@{{ videos[currentIndex].authorName }}</div>
      </div> -->
      
      <!-- 视频描述 -->
      <div class="video-desc" :class="{ 'landscape-desc': isLandscape }">
        <p>{{ videos[currentIndex].description }}</p>
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
        :class="{ 'landscape-controls': isFullscreen }"
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
            <div class="progress-handle" :style="{ left: `${videos[currentIndex].progress}%` }"></div>
          </div>
          
          <!-- 时间显示 -->
          <div class="time-display">
            {{ formatTime(videos[currentIndex].currentTime) }} / {{ formatTime(videos[currentIndex].duration) }}
          </div>
          
          <!-- 倍速按钮 -->
          <div class="speed-btn" @click.stop.prevent="toggleSpeedControls">
            <span>{{ currentPlaybackSpeed }}x</span>
          </div>
          
          <!-- 静音按钮 -->
          <div class="mute-btn" @click.stop.prevent="toggleMute">
            <i class="material-icons">{{ videos[currentIndex].isMuted ? 'volume_off' : 'volume_up' }}</i>
          </div>
          
          <!-- 全屏按钮 (当视频是横向时显示) -->
          <div 
            v-if="videos[currentIndex].isWidescreen && !isFullscreen" 
            class="fullscreen-btn" 
            @click.stop.prevent="toggleFullscreen"
          >
            <i class="material-icons">fullscreen</i>
          </div>
          
          <!-- 退出全屏按钮 -->
          <div 
            v-if="isFullscreen" 
            class="fullscreen-btn" 
            @click.stop.prevent="toggleFullscreen"
          >
            <i class="material-icons">fullscreen_exit</i>
          </div>
        </div>
      </div>
      
      <!-- 全屏指示器 (当视频是横向但未全屏时显示) -->
      <div 
        v-if="videos[currentIndex].isWidescreen && !isFullscreen" 
        class="fullscreen-indicator"
        @click="toggleFullscreen"
      >
        <i class="material-icons">fullscreen</i>
      </div>
    </div>

    <!-- 添加倍速控制面板 -->
    <div 
      class="playback-speed-controls" 
      v-if="showSpeedControls"
      :class="{ 'landscape-speed-controls': isLandscape }"
    >
      <div class="speed-title">播放速度</div>
      <div class="speed-options">
        <div 
          v-for="speed in playbackSpeeds" 
          :key="speed" 
          class="speed-option" 
          :class="{ 'active': currentPlaybackSpeed === speed }"
          @click="setPlaybackSpeed(speed)"
        >
          {{ speed }}x
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
        <!-- <span class="nav-label">发布</span> -->
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

// 示例视频列表，使用本地文件
const sampleVideos = [
  // 使用项目内视频或公开可访问的视频
  '/videos/vertical1.mp4',
  '/videos/vertical2.mp4',
  '/videos/vertical3.mp4',
  '/videos/horizontal1.mp4',
  '/videos/horizontal2.mp4'
]

// 生成随机视频数据
const generateRandomVideos = (count) => {
  // 创建一个备用视频数组，确保即使没有本地视频也能展示UI
  const fallbackUrls = new Array(count).fill('').map((_, i) => 
    `data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAABhtZGF0AAACrgYF//+q3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE1MCByMjkwMCAtIEguMjY0L01QRUctNCBBVkMgY29kZWMgLSBDb3B5bGVmdCAyMDAzLTIwMTggLSBodHRwOi8vd3d3LnZpZGVvbGFuLm9yZy94MjY0Lmh0bWwgLSBvcHRpb25zOiBjYWJhYz0xIHJlZj0zIGRlYmxvY2s9MTowOjAgYW5hbHlzZT0weDM6MHgxMTMgbWU9aGV4IHN1Ym1lPTcgcHN5PTEgcHN5X3JkPTEuMDA6MC4wMCBtaXhlZF9yZWY9MSBtZV9yYW5nZT0xNiBjaHJvbWFfbWU9MSB0cmVsbGlzPTEgOHg4ZGN0PTEgY3FtPTAgZGVhZHpvbmU9MjEsMTEgZmFzdF9wc2tpcD0xIGNocm9tYV9xcF9vZmZzZXQ9LTIgdGhyZWFkcz02IGxvb2thaGVhZF90aHJlYWRzPTEgc2xpY2VkX3RocmVhZHM9MCBucj0wIGRlY2ltYXRlPTEgaW50ZXJsYWNlZD0wIGJsdXJheV9jb21wYXQ9MCBjb25zdHJhaW5lZF9pbnRyYT0wIGJmcmFtZXM9MyBiX3B5cmFtaWQ9MiBiX2FkYXB0PTEgYl9iaWFzPTAgZGlyZWN0PTEgd2VpZ2h0Yj0xIG9wZW5fZ29wPTAgd2VpZ2h0cD0yIGtleWludD1pbmZpbml0ZSBrZXlpbnRfbWluPTI5IHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9NDAgcmM9Y3JmIG1idHJlZT0xIGNyZj0yMy4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMAAA`
  );

  return Array.from({ length: count }, (_, index) => ({
    id: String(index + 1),
    authorId: String(index + 1),
    url: index < sampleVideos.length ? sampleVideos[index] : fallbackUrls[index],
    poster: `https://picsum.photos/720/1280?random=${index}`, // 预览图，提高加载体验
    authorName: '用户' + (index + 1),
    authorAvatar: 'https://randomuser.me/api/portraits/men/' + (index + 1) + '.jpg',
    description: '视频描述 ' + (index + 1),
    likes: Math.floor(Math.random() * 10000),
    comments: Math.floor(Math.random() * 1000),
    shares: Math.floor(Math.random() * 500),
    isLiked: false,
    isFollowed: false,
    followAnimation: null,
    isAnimating: false,
    isPlaying: false,
    isMuted: true, // 默认静音，避免扰民
    currentTime: 0,
    duration: 0,
    progress: 0,
    aspectRatio: 9/16, // 默认竖屏比例
    isWidescreen: false, // 是否是宽屏视频
    isLoaded: false
  }));
}

// 然后再使用该函数
const videos = ref(generateRandomVideos(5))
const currentIndex = ref(0)
const videoRefs = ref(null)
let touchStartY = 0
let touchEndY = 0
let hasInteracted = false
const showCommentPanel = ref(false)
const showSearchPanel = ref(false)
const hasUserInteracted = ref(false)
const isLandscape = ref(false)  // 是否横向模式

// 添加新的响应式变量
const currentTab = ref('home')
const unreadCount = ref(3) // 未读消息数量
const isFullscreen = ref(false) // 是否全屏模式
const showDebug = ref(false) // 是否显示调试信息
const showSpeedControls = ref(false) // 是否显示倍速控制
const playbackSpeeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0] // 可选播放速度
const currentPlaybackSpeed = ref(1.0) // 当前播放速度

// 检测视频比例，决定是否是宽屏视频
const checkVideoAspectRatio = (index) => {
  if (!videoRefs.value || !videoRefs.value[index]) return
  const video = videoRefs.value[index]
  
  // 等待视频元数据加载完成
  if (video.videoWidth && video.videoHeight) {
    // 计算视频宽高比
    const aspectRatio = video.videoWidth / video.videoHeight
    console.log(`视频宽高比: ${aspectRatio}, 宽: ${video.videoWidth}, 高: ${video.videoHeight}`)
    
    // 保存视频的实际宽高比
    videos.value[index].aspectRatio = aspectRatio
    
    // 如果宽度大于高度（比如16:9的视频），则是横向视频(宽屏)
    const isWidescreen = aspectRatio > 1
    videos.value[index].isWidescreen = isWidescreen
    console.log(`视频是否宽屏: ${isWidescreen}`)
    
    // 只有宽屏视频和全屏模式下才设置横屏模式
    if (isFullscreen.value && videos.value[index].isWidescreen) {
      isLandscape.value = true
    } else {
      isLandscape.value = false
    }
  }
}

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

const togglePlay = () => {
  if (!videoRefs.value || !videoRefs.value[currentIndex.value]) return
  
  const video = videoRefs.value[currentIndex.value]
  
  if (video.paused) {
    // 启用硬件加速
    video.style.transform = 'translateZ(0)'
    
    const playPromise = video.play()
    
    if (playPromise !== undefined) {
      playPromise.then(() => {
        videos.value[currentIndex.value].isPlaying = true
      }).catch(error => {
        console.error('播放失败:', error)
        // 如果自动播放被阻止，提供交互选项
        videos.value[currentIndex.value].isPlaying = false
      })
    }
  } else {
    video.pause()
    videos.value[currentIndex.value].isPlaying = false
  }
}

const updateVideoPlay = () => {
  if (!videoRefs.value) return

  for (let i = 0; i < videos.value.length; i++) {
    const video = videoRefs.value[i]
    if (!video) continue

    if (i === currentIndex.value) {
      // 如果是当前视频，准备播放
      if (hasUserInteracted.value) {
        // 预先设置播放速度
        video.playbackRate = currentPlaybackSpeed.value
        
        // 使用requestAnimationFrame提高渲染性能
        requestAnimationFrame(() => {
          // 启用硬件加速
          video.style.transform = 'translateZ(0)'
          
          const playPromise = video.play()
          
          if (playPromise !== undefined) {
            playPromise.then(() => {
              videos.value[i].isPlaying = true
            }).catch(error => {
              console.error('播放失败:', error)
              videos.value[i].isPlaying = false
            })
          }
        })
      }
    } else {
      // 如果不是当前视频，则暂停并重置
      video.pause()
      video.currentTime = 0
      videos.value[i].isPlaying = false
      videos.value[i].currentTime = 0
      videos.value[i].progress = 0
    }
  }
}

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
  
  // 仅在当前视频时更新（节省性能）
  if (index === currentIndex.value) {
    videos.value[index].currentTime = video.currentTime
    videos.value[index].progress = (video.currentTime / video.duration) * 100 || 0
    
    // 更新播放速度以确保一致性
    if (video.playbackRate !== currentPlaybackSpeed.value) {
      video.playbackRate = currentPlaybackSpeed.value
    }
  }
}

const handleVideoLoaded = (index) => {
  videos.value[index].isLoaded = true;
  if (!videoRefs.value || !videoRefs.value[index]) return
  const video = videoRefs.value[index]
  videos.value[index].duration = video.duration
  
  // 检测视频比例
  checkVideoAspectRatio(index)
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

// 添加关注/取消关注函数
const toggleFollow = (index) => {
  if (!user.isLoggedIn) {
    router.push({
      path: '/login',
      query: { from: '/short-video' }
    })
    return
  }

  // 显示勾选动画
  videos.value[index].followAnimation = 'check'
  
  // 一段时间后隐藏按钮
  setTimeout(() => {
    videos.value[index].isFollowed = true
  }, 800)
}

// 跳转到用户资料页
const goToUserProfile = (userId) => {
  if (user.isLoggedIn) {
    router.push(`/user/${userId}`)
  } else {
    router.push('/login')
  }
}

// 切换全屏模式
const toggleFullscreen = () => {
  console.log("切换全屏模式")
  isFullscreen.value = !isFullscreen.value
  
  if (isFullscreen.value && videos.value[currentIndex.value].isWidescreen) {
    // 进入全屏模式
    isLandscape.value = true
    console.log("进入横屏模式")
    
    // 可以在这里添加屏幕旋转逻辑，如果平台支持的话
    if (screen.orientation && screen.orientation.lock) {
      try {
        console.log("尝试锁定屏幕方向")
        screen.orientation.lock('landscape').catch(e => {
          console.warn('无法锁定横屏模式:', e)
        })
      } catch (e) {
        console.warn('不支持屏幕旋转锁定:', e)
      }
    }
  } else {
    // 退出全屏模式
    isLandscape.value = false
    console.log("退出横屏模式")
    
    // 恢复屏幕旋转
    if (screen.orientation && screen.orientation.unlock) {
      try {
        screen.orientation.unlock()
      } catch (e) {
        console.warn('无法解除屏幕旋转锁定:', e)
      }
    }
  }
}

// 设置播放速度
const setPlaybackSpeed = (speed) => {
  currentPlaybackSpeed.value = speed
  
  // 应用到当前视频
  if (videoRefs.value && videoRefs.value[currentIndex.value]) {
    videoRefs.value[currentIndex.value].playbackRate = speed
  }
  
  // 隐藏控制面板
  setTimeout(() => {
    showSpeedControls.value = false
  }, 300)
}

// 显示/隐藏倍速控制面板
const toggleSpeedControls = () => {
  showSpeedControls.value = !showSpeedControls.value
}

// 切换静音状态
const toggleMute = () => {
  videos.value[currentIndex.value].isMuted = !videos.value[currentIndex.value].isMuted
  
  if (videoRefs.value && videoRefs.value[currentIndex.value]) {
    videoRefs.value[currentIndex.value].muted = videos.value[currentIndex.value].isMuted
  }
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
  bottom: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  z-index: 10;
}

.author-avatar-wrapper {
  position: relative;
  margin-bottom: 16px;
  z-index: 10;
  width: 50px;
  height: 50px;
}

.author-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #fff;
  cursor: pointer;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 修改关注按钮样式，使其位于头像右下角 */
.follow-plus-container {
  position: absolute;
  bottom: -8px;
  right: -8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

.follow-plus {
  background: rgba(255, 0, 80, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
  cursor: pointer;
  z-index: 12;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.follow-plus i {
  color: #fff;
  font-size: 22px;
  line-height: 1;
  transition: all 0.2s ease;
}

.follow-plus:active {
  transform: scale(0.9);
}

.author-name-container {
  position: fixed;
  right: 20px;
  bottom: 155px;
  z-index: 10;
}

.author-name {
  color: #fff;
  font-size: 14px;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  text-align: center;
}

.video-desc {
  position: absolute;
  left: 16px;
  bottom: 160px;
  width: 70%;
  color: #fff;
  font-size: 14px;
  line-height: 1.5;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-align: left;
  z-index: 10;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  transition: all 0.3s ease;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
}

.action-icon i {
  font-size: 26px;
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
}

.action-icon:hover {
  background: rgba(0, 0, 0, 0.4);
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
  bottom: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
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
  bottom: 71px;
  left: 0;
  right: 0;
  padding: 10px 20px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.5));
  z-index: 20;
  opacity: 1;
  pointer-events: auto;
  display: flex;
  align-items: center;
}

.progress-container {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 播放按钮样式 */
.play-pause-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(212, 175, 55, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.play-pause-btn:hover {
  background: rgba(212, 175, 55, 0.4);
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

/* 添加横向视频模式样式 */
.landscape-mode {
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-player.landscape {
  object-fit: contain;
  background: #000;
}

.landscape-action-bar {
  right: 20px;
  bottom: auto;
  top: 50%;
  transform: translateY(-50%);
}

.landscape-desc {
  left: 16px;
  bottom: auto;
  top: 20px;
  width: calc(100% - 100px);
}

.landscape-controls {
  bottom: 100px;
}

/* 添加全屏按钮样式 */
.fullscreen-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 8px;
  flex-shrink: 0;
}

.fullscreen-btn:hover {
  background: rgba(0, 0, 0, 0.5);
  transform: scale(1.1);
}

.fullscreen-btn i {
  color: #fff;
  font-size: 22px;
}

/* 添加全屏指示器样式 */
.fullscreen-indicator {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 15;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

.fullscreen-indicator:hover {
  background: rgba(0, 0, 0, 0.5);
  transform: scale(1.1);
}

.fullscreen-indicator i {
  color: #fff;
  font-size: 24px;
}

/* 添加调试信息样式 */
.debug-info {
  position: absolute;
  top: 60px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
  border-radius: 5px;
  font-size: 12px;
  z-index: 1000;
}

.debug-info p {
  margin: 5px 0;
}

/* 添加宽屏视频样式 */
.widescreen-player {
  object-fit: contain !important;
  background-color: #000;
}

.widescreen-player.active {
  width: 100%;
  height: auto;
  max-height: 65%;
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%) !important;
}

/* 添加竖屏视频样式，确保完全全屏 */
.video-player.active:not(.widescreen-player) {
  object-fit: cover;
  width: 100%;
  height: 100%;
}

/* 添加倍速控制样式 */
.playback-speed-controls {
  position: absolute;
  right: 20px;
  bottom: 150px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 12px;
  padding: 15px;
  width: 200px;
  z-index: 30;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  transform-origin: bottom right;
  animation: pop-in 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.landscape-speed-controls {
  bottom: auto;
  top: 150px;
}

@keyframes pop-in {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.speed-title {
  font-size: 14px;
  color: #fff;
  margin-bottom: 12px;
  text-align: center;
}

.speed-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.speed-option {
  width: 50px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.speed-option:hover {
  background: rgba(255, 255, 255, 0.2);
}

.speed-option.active {
  background: #FF0050;
  font-weight: bold;
}

/* 优化进度条样式 */
.progress-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  cursor: pointer;
  position: relative;
  transition: height 0.2s ease;
}

.progress-handle {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #FF0050;
  top: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 8px rgba(255, 0, 80, 0.5);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.progress-bar:hover {
  height: 6px;
}

.progress-bar:hover .progress-handle {
  opacity: 1;
}

/* 添加速度和静音按钮样式 */
.speed-btn, .mute-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 8px;
  flex-shrink: 0;
}

.speed-btn {
  font-size: 14px;
  font-weight: bold;
  color: #fff;
}

.speed-btn:hover, .mute-btn:hover {
  background: rgba(0, 0, 0, 0.5);
  transform: scale(1.1);
}
</style> 