<template>
  <div class="profile-container">
    <!-- 导航栏 -->
    <div class="nav-bar">
      <div class="back-btn" @click="router.back()">
        <span class="material-icons">arrow_back</span>
      </div>
      <h1>{{ isCurrentUser ? t('profile.title') : profileUser.username }}</h1>
      <div class="nav-actions">
        <span class="material-icons" v-if="isCurrentUser" @click="showSettings = true">settings</span>
        <span class="material-icons" v-else @click="toggleFollow">{{ profileUser.isFollowed ? 'done' : 'add' }}</span>
      </div>
    </div>

    <!-- 用户资料 -->
    <div class="profile-header">
      <div class="avatar-container" @click="isCurrentUser ? handleAvatarClick() : null">
        <img :src="profileUser.avatar" alt="Avatar" class="avatar">
        <div class="avatar-overlay" v-if="isCurrentUser">
          <span class="material-icons">photo_camera</span>
        </div>
      </div>
      <h2 class="username">{{ profileUser.username }}</h2>
      <p class="bio">{{ profileUser.bio }}</p>
      <div class="stats">
        <div class="stat-item">
          <span class="stat-count">{{ formatNumber(profileUser.stats.likes) }}</span>
          <span class="stat-label">{{ t('profile.likes') }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-count">{{ formatNumber(profileUser.stats.followers) }}</span>
          <span class="stat-label">{{ t('profile.followers') }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-count">{{ formatNumber(profileUser.stats.following) }}</span>
          <span class="stat-label">{{ t('profile.following') }}</span>
        </div>
      </div>
      <div class="profile-actions" v-if="!isCurrentUser">
        <button class="action-btn follow-btn" :class="{ 'followed': profileUser.isFollowed }" @click="toggleFollow">
          <span class="material-icons">{{ profileUser.isFollowed ? 'done' : 'add' }}</span>
          {{ profileUser.isFollowed ? t('profile.followed') : t('profile.follow') }}
        </button>
        <button class="action-btn message-btn" @click="handleMessage">
          <span class="material-icons">message</span>
          {{ t('profile.message') }}
        </button>
      </div>
      <div class="profile-actions" v-else>
        <button class="action-btn edit-btn" @click="showEditProfile = true">
          <span class="material-icons">edit</span>
          {{ t('profile.editProfile') }}
        </button>
      </div>
    </div>

    <!-- 内容标签页 -->
    <div class="tabs">
      <div 
        v-for="tab in tabs" 
        :key="tab.id"
        class="tab" 
        :class="{ active: currentTab === tab.id }"
        @click="currentTab = tab.id"
      >
        <span class="material-icons">{{ tab.icon }}</span>
        <span>{{ tab.label }}</span>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-area">
      <!-- 作品列表 -->
      <div class="video-grid" v-if="currentTab === 'works'" v-show="works.length > 0">
        <div v-for="(video, index) in works" :key="index" class="video-item" @click="handleVideoClick(video)">
          <div class="video-card">
            <video
              :src="video.url"
              class="video-preview"
              loop
              muted
              @mouseenter="handleVideoHover($event, true)"
              @mouseleave="handleVideoHover($event, false)"
            ></video>
            <div class="video-info">
              <div class="video-stats">
                <span class="video-stat">
                  <span class="material-icons">visibility</span>
                  {{ formatNumber(video.views) }}
                </span>
                <span class="video-stat">
                  <span class="material-icons">favorite</span>
                  {{ formatNumber(video.likes || 0) }}
                </span>
              </div>
              <div class="video-description" v-if="video.description">{{ video.description }}</div>
              <div class="video-date">{{ formatDate(video.createdAt || new Date()) }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="empty-state" v-else-if="currentTab === 'works' && works.length === 0">
        <span class="material-icons">videocam_off</span>
        <p>{{ isCurrentUser ? '你还没有发布作品' : '该用户还没有发布作品' }}</p>
        <button v-if="isCurrentUser" class="action-btn" @click="router.push('/publish')">
          立即发布
        </button>
      </div>

      <!-- 喜欢的视频 -->
      <div class="video-grid" v-if="currentTab === 'likes'" v-show="likedVideos.length > 0">
        <div v-for="(video, index) in likedVideos" :key="index" class="video-item" @click="handleVideoClick(video)">
          <div class="video-card">
            <video
              :src="video.url"
              class="video-preview"
              loop
              muted
              @mouseenter="handleVideoHover($event, true)"
              @mouseleave="handleVideoHover($event, false)"
            ></video>
            <div class="video-info">
              <div class="video-stats">
                <span class="video-stat">
                  <span class="material-icons">visibility</span>
                  {{ formatNumber(video.views) }}
                </span>
                <span class="video-stat">
                  <span class="material-icons">favorite</span>
                  {{ formatNumber(video.likes || 0) }}
                </span>
              </div>
              <div class="video-author" v-if="video.authorName">{{ video.authorName }}</div>
              <div class="video-description" v-if="video.description">{{ video.description }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="empty-state" v-else-if="currentTab === 'likes' && likedVideos.length === 0">
        <span class="material-icons">favorite_border</span>
        <p>{{ isCurrentUser ? '你还没有喜欢的视频' : '该用户还没有喜欢的视频' }}</p>
        <button v-if="isCurrentUser" class="action-btn" @click="router.push('/short-video')">
          去探索更多视频
        </button>
      </div>
    </div>

    <!-- 设置弹窗 -->
    <div v-if="showSettings" class="settings-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ t('settings.title') }}</h3>
          <span class="material-icons close-icon" @click="showSettings = false">close</span>
        </div>
        <div class="settings-list">
          <div class="settings-item" @click="handleLanguageSettings">
            <span class="material-icons">language</span>
            <span>{{ t('settings.language') }}</span>
            <span class="material-icons right-icon">chevron_right</span>
          </div>
          <div class="settings-item">
            <span class="material-icons">dark_mode</span>
            <span>{{ t('settings.darkMode') }}</span>
            <div class="switch">
              <input type="checkbox" id="dark-mode-switch">
              <label for="dark-mode-switch"></label>
            </div>
          </div>
          <div class="settings-item">
            <span class="material-icons">notifications</span>
            <span>{{ t('settings.notifications') }}</span>
            <span class="material-icons right-icon">chevron_right</span>
          </div>
          <div class="settings-item">
            <span class="material-icons">lock</span>
            <span>{{ t('settings.privacy') }}</span>
            <span class="material-icons right-icon">chevron_right</span>
          </div>
          <div class="settings-item">
            <span class="material-icons">help_outline</span>
            <span>{{ t('settings.help') }}</span>
            <span class="material-icons right-icon">chevron_right</span>
          </div>
          <div class="settings-item">
            <span class="material-icons">info_outline</span>
            <span>{{ t('settings.about') }}</span>
            <span class="material-icons right-icon">chevron_right</span>
          </div>
          <div class="settings-item logout" @click="handleLogout">
            <span class="material-icons">logout</span>
            <span>{{ t('settings.logout') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑资料弹窗 -->
    <div v-if="showEditProfile" class="settings-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ t('profile.editProfile') }}</h3>
          <span class="material-icons close-icon" @click="showEditProfile = false">close</span>
        </div>
        <div class="edit-profile-form">
          <div class="form-group">
            <label>{{ t('profile.username') }}</label>
            <input type="text" v-model="profileForm.username" :placeholder="t('profile.usernamePlaceholder')">
          </div>
          <div class="form-group">
            <label>{{ t('profile.bio') }}</label>
            <textarea v-model="profileForm.bio" :placeholder="t('profile.bioPlaceholder')"></textarea>
          </div>
          <button class="submit-btn" @click="handleProfileSubmit">{{ t('common.save') }}</button>
        </div>
      </div>
    </div>

    <!-- 头像上传 -->
    <div v-if="showAvatarUpload" class="settings-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>更换头像</h3>
          <span class="material-icons close-icon" @click="showAvatarUpload = false">close</span>
        </div>
        <div class="avatar-upload">
          <div class="avatar-preview-container">
            <img :src="avatarPreview || profileUser.avatar" alt="Avatar Preview" class="avatar-preview-img">
            <div class="avatar-overlay-preview" @click="triggerFileInput">
              <span class="material-icons upload-icon">photo_camera</span>
              <span class="upload-text">点击更换</span>
            </div>
          </div>
          <input type="file" ref="fileInput" style="display: none;" accept="image/*" @change="handleFileChange">
          <div class="upload-actions">
            <button class="cancel-btn" @click="showAvatarUpload = false">
              取消
            </button>
            <button class="submit-btn" :disabled="!avatarFile" @click="handleAvatarSubmit">
              保存
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 语言设置弹窗 -->
    <div v-if="showLanguageSettings" class="settings-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>语言设置</h3>
          <span class="material-icons close-icon" @click="showLanguageSettings = false">close</span>
        </div>
        <div class="language-settings">
          <div class="language-option" 
               :class="{ active: currentLocale === 'zh-CN' }"
               @click="changeLanguage('zh-CN')">
            <div class="language-flag">🇨🇳</div>
            <span class="language-name">简体中文</span>
            <span class="material-icons check-icon" v-if="currentLocale === 'zh-CN'">check_circle</span>
          </div>
          <div class="language-option"
               :class="{ active: currentLocale === 'en-US' }"
               @click="changeLanguage('en-US')">
            <div class="language-flag">🇺🇸</div>
            <span class="language-name">English</span>
            <span class="material-icons check-icon" v-if="currentLocale === 'en-US'">check_circle</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()
const currentLocale = computed(() => locale.value)
const user = JSON.parse(localStorage.getItem('user') || '{}')
const showSettings = ref(false)
const showEditProfile = ref(false)
const currentTab = ref('works')
const showAvatarUpload = ref(false)
const avatarPreview = ref('')
const avatarFile = ref(null)
const fileInput = ref(null)
const showLanguageSettings = ref(false)
const isCurrentUser = computed(() => !route.params.id || route.params.id === user.id)

// 标签页配置
const tabs = [
  { id: 'works', label: '作品', icon: 'videocam' },
  { id: 'likes', label: '喜欢', icon: 'favorite_border' }
]

// 用户统计数据
const userStats = ref({
  likes: 1234,
  followers: 567,
  following: 89
})

// 作品和喜欢的视频列表
const works = ref([])
const likedVideos = ref([])

// 编辑资料表单
const profileForm = reactive({
  username: '',
  bio: ''
})

// 关注/取消关注用户
const toggleFollow = () => {
  if (!user.isLoggedIn) {
    router.push({
      path: '/login',
      query: { from: route.fullPath }
    })
    return
  }
  
  // 更新关注状态
  if (profileUser.value.isFollowed) {
    profileUser.value.isFollowed = false
    profileUser.value.stats.followers -= 1
  } else {
    profileUser.value.isFollowed = true
    profileUser.value.stats.followers += 1
  }
}

// 处理消息发送
const handleMessage = () => {
  if (!user.isLoggedIn) {
    router.push({
      path: '/login',
      query: { from: route.fullPath }
    })
    return
  }
  
  // 跳转到消息页面
  router.push({
    path: '/messages',
    query: { userId: profileUser.value.id }
  })
}

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
    authorName: user.username || '用户' + (index + 1),
    authorAvatar: user.avatar || 'https://randomuser.me/api/portraits/men/' + (index + 1) + '.jpg',
    description: '这是第' + (index + 1) + '个视频描述，展示精彩内容',
    likes: Math.floor(Math.random() * 10000),
    comments: Math.floor(Math.random() * 1000),
    shares: Math.floor(Math.random() * 500),
    isLiked: false,
    isAnimating: false
  }))
}

// 初始化视频数据
works.value = generateRandomVideos(6)
likedVideos.value = generateRandomVideos(4)

const currentIndex = ref(0)
const videoRefs = ref([])
let touchStartY = 0
let touchEndY = 0
let hasInteracted = false

// 初始化videoRefs数组
onMounted(() => {
  videoRefs.value = new Array(works.value.length).fill(null)
})

// 设置视频引用的函数
const setVideoRef = (el, index) => {
  if (el && videoRefs.value) {
    videoRefs.value[index] = el
  }
}

const showAccountSettings = ref(false)
const showPrivacySettings = ref(false)
const showNotificationSettings = ref(false)

const accountForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const privacyForm = reactive({
  isPrivate: false,
  allowComments: true,
  allowDownload: false
})

const notificationForm = reactive({
  likes: true,
  comments: true,
  follows: true
})

// 工具函数：格式化数字
const formatNumber = (num) => {
  if (num === undefined || num === null) return '0';
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// 格式化日期函数
const formatDate = (date) => {
  if (!date) return ''
  
  const now = new Date()
  const inputDate = new Date(date)
  
  // 计算时间差（毫秒）
  const diff = now.getTime() - inputDate.getTime()
  
  // 小于1分钟
  if (diff < 60 * 1000) {
    return '刚刚'
  }
  
  // 小于1小时
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000))
    return `${minutes}分钟前`
  }
  
  // 小于24小时
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    return `${hours}小时前`
  }
  
  // 小于7天
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    return `${days}天前`
  }
  
  // 显示日期
  const year = inputDate.getFullYear()
  const month = String(inputDate.getMonth() + 1).padStart(2, '0')
  const day = String(inputDate.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

// 处理头像点击
const handleAvatarClick = () => {
  showAvatarUpload.value = true
}

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value.click()
}

// 处理文件选择
const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    avatarFile.value = file
    avatarPreview.value = URL.createObjectURL(file)
  }
}

// 保存头像
const handleAvatarSubmit = () => {
  if (!avatarFile.value) return
  
  // 模拟头像上传成功
  const newAvatarUrl = avatarPreview.value
  
  // 更新用户对象
  const newUser = {
    ...user,
    avatar: newAvatarUrl
  }
  localStorage.setItem('user', JSON.stringify(newUser))
  
  // 关闭弹窗
  showAvatarUpload.value = false
  alert(t('profile.avatarUpdated'))
}

// 处理资料编辑提交
const handleProfileSubmit = () => {
  if (!profileForm.username.trim()) {
    alert(t('profile.usernameRequired'))
    return
  }
  
  // 保存到本地存储
  const newUser = {
    ...user,
    username: profileForm.username,
    bio: profileForm.bio
  }
  localStorage.setItem('user', JSON.stringify(newUser))
  
  showEditProfile.value = false
  alert(t('profile.profileUpdated'))
}

// 处理用户登出
const handleLogout = () => {
  localStorage.removeItem('user')
  router.push('/login')
}

// 处理语言设置
const handleLanguageSettings = () => {
  showSettings.value = false
  showLanguageSettings.value = true
}

// 切换语言
const changeLanguage = (lang) => {
  locale.value = lang
  localStorage.setItem('locale', lang)
  // 短暂延迟后关闭弹窗
  setTimeout(() => {
    showLanguageSettings.value = false
  }, 300)
}

// 用户信息 - 如果有路由参数id，则显示该用户的信息，否则显示当前登录用户
const profileUser = computed(() => {
  if (route.params.id && route.params.id !== user.id) {
    // 模拟获取其他用户信息
    return {
      id: route.params.id,
      username: '用户' + route.params.id,
      avatar: 'https://randomuser.me/api/portraits/men/' + route.params.id + '.jpg',
      isFollowed: false,
      bio: '这是用户' + route.params.id + '的个人简介',
      stats: {
        likes: Math.floor(Math.random() * 10000),
        followers: Math.floor(Math.random() * 1000),
        following: Math.floor(Math.random() * 500)
      }
    }
  } else {
    // 返回当前登录用户信息
    return {
      id: user.id || '1',
      username: user.username || '当前用户',
      avatar: user.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg',
      isFollowed: false,
      bio: user.bio || '这是我的个人简介',
      stats: userStats.value || {
        likes: 0,
        followers: 0,
        following: 0
      }
    }
  }
})

// 处理视频点击
const handleVideoClick = (video) => {
  // 这里可以添加视频点击后的处理逻辑，比如跳转到视频详情页
  console.log('Video clicked:', video)
}

// 处理视频悬停
const handleVideoHover = (event, isHover) => {
  const video = event.target
  if (isHover) {
    video.play()
  } else {
    video.pause()
    video.currentTime = 0
  }
}
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0f1a 0%, #1a1f2a 50%, #0a0f1a 100%);
  color: #ffffff;
  padding-bottom: 24px;
  position: relative;
}

.profile-container::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 0%, rgba(212, 175, 55, 0.1) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: linear-gradient(to bottom, rgba(10, 15, 26, 0.95), rgba(26, 31, 42, 0.95));
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 100;
  border-bottom: 1px solid rgba(212, 175, 55, 0.05);
}

.nav-bar h1 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #d4af37;
  text-shadow: 0 0 10px rgba(212, 175, 55, 0.2);
}

.nav-actions {
  display: flex;
  gap: 16px;
}

.nav-actions .material-icons {
  font-size: 24px;
  color: #d4af37;
  cursor: pointer;
  transition: all 0.3s;
}

.nav-actions .material-icons:hover {
  color: #e5c158;
  transform: scale(1.1);
}

.profile-header {
  padding: 88px 16px 24px;
  text-align: center;
  background: linear-gradient(to bottom, rgba(212, 175, 55, 0.05), transparent);
  position: relative;
  z-index: 1;
}

.avatar-container {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 16px;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #d4af37;
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.2);
  transition: all 0.3s;
}

.avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 0 30px rgba(212, 175, 55, 0.3);
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-overlay .material-icons {
  font-size: 48px;
  color: #ffffff;
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.username {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #ffffff;
  text-shadow: 0 0 10px rgba(212, 175, 55, 0.2);
}

.bio {
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 24px;
  font-size: 14px;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 24px;
}

.stat-item {
  text-align: center;
}

.stat-count {
  font-size: 20px;
  font-weight: 600;
  color: #d4af37;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.profile-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
  background: linear-gradient(135deg, #d4af37, #e5c158);
  color: #000000;
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.2);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.3);
  background: linear-gradient(135deg, #e5c158, #d4af37);
}

.tabs {
  display: flex;
  gap: 24px;
  padding: 0 16px;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.05);
}

.tab {
  padding: 12px 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.tab.active {
  color: #d4af37;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #d4af37;
  border-radius: 1px;
}

.content-area {
  padding: 16px;
  position: relative;
  z-index: 1;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
  padding: 16px;
}

.video-item {
  cursor: pointer;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s ease;
}

.video-item:hover {
  transform: translateY(-4px);
}

.video-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.video-preview {
  width: 100%;
  aspect-ratio: 9/16;
  object-fit: cover;
  background-color: #000;
}

.video-info {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
}

.video-stats {
  display: flex;
  gap: 12px;
}

.video-stat {
  display: flex;
  align-items: center;
  gap: 4px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

.video-stat .material-icons {
  font-size: 14px;
}

.video-description {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.video-author {
  font-size: 12px;
  font-weight: 600;
  color: #d4af37;
}

.video-date {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

/* 头像上传样式 */
.avatar-preview-container {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 24px;
  position: relative;
  border: 3px solid rgba(212, 175, 55, 0.3);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.avatar-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-overlay-preview {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  cursor: pointer;
}

.avatar-preview-container:hover .avatar-overlay-preview {
  opacity: 1;
}

.upload-icon {
  font-size: 32px;
  color: #fff;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 14px;
  color: #fff;
}

.upload-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
}

.cancel-btn, .submit-btn {
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.submit-btn {
  background: linear-gradient(45deg, #d4af37, #e5c158);
  color: #000;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.25);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 语言设置样式 */
.language-settings {
  padding: 16px;
}

.language-option {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: 8px;
}

.language-option:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.language-option.active {
  background-color: rgba(212, 175, 55, 0.1);
}

.language-flag {
  font-size: 20px;
  margin-right: 12px;
}

.language-name {
  flex: 1;
  font-size: 16px;
}

.check-icon {
  color: #d4af37;
}

.settings-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: linear-gradient(135deg, #1a1f2a, #0a0f1a);
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  padding: 24px;
  border: 1px solid rgba(212, 175, 55, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1001;
}

.modal-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 0%, rgba(212, 175, 55, 0.05), transparent);
  border-radius: 16px;
  pointer-events: none;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #ffd700;
  margin: 0;
}

.close-icon {
  color: #ffd700;
  cursor: pointer;
  transition: all 0.3s;
}

.close-icon:hover {
  color: #ffed4a;
  transform: rotate(90deg);
}

.settings-list {
  padding: 20px;
}

.settings-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 1px solid rgba(255, 215, 0, 0.1);
}

.settings-item:hover {
  color: #ffd700;
  transform: translateX(4px);
}

.settings-item.logout {
  color: #ff4d4d;
}

.settings-item.logout:hover {
  color: #ff3333;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #ffd700;
  font-size: 14px;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.05), rgba(212, 175, 55, 0.02));
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  transition: all 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #d4af37;
  box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2);
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.08), rgba(212, 175, 55, 0.05));
}

.form-group textarea {
  height: 100px;
  resize: none;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #d4af37, #e5c158);
  color: #000000;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
  background: linear-gradient(135deg, #e5c158, #d4af37);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.switch {
  width: 50px;
  height: 26px;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05));
  border-radius: 13px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s;
}

.switch input {
  display: none;
}

.switch label {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px;
}

.switch label::before,
.switch label::after {
  content: '';
  width: 22px;
  height: 22px;
  background-color: #ffffff;
  border-radius: 50%;
  position: absolute;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.switch label::before {
  left: 2px;
}

.switch label::after {
  right: 2px;
}

.switch input:checked + label::before {
  transform: translateX(24px);
}

.switch input:checked + label::after {
  transform: translateX(-24px);
}

.language-settings {
  padding: 16px;
}

.language-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s;
  background: rgba(255, 255, 255, 0.05);
}

.language-option:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}

.language-option.active {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.1));
  border-left: 3px solid #d4af37;
}

.language-name {
  font-size: 16px;
  font-weight: 500;
}

.check-icon {
  color: #d4af37;
}

.right-icon {
  color: rgba(255, 255, 255, 0.6);
}
</style> 