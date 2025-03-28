<template>
  <div class="profile-container">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <span class="material-icons back-icon" @click="router.back()">arrow_back</span>
      <h1>个人主页</h1>
      <div class="nav-actions">
        <span class="material-icons settings-icon" @click="showSettings = true">settings</span>
      </div>
    </div>

    <!-- 用户信息区域 -->
    <div class="user-info">
      <div class="avatar-container">
        <img :src="user.avatar || 'https://picsum.photos/200'" :alt="user.username" class="avatar">
        <div class="edit-avatar" @click="handleEditAvatar">
          <span class="material-icons">edit</span>
        </div>
      </div>
      <h2 class="username">{{ user.username || '未设置昵称' }}</h2>
      <p class="user-id">ID: {{ user.id || '未登录' }}</p>
      <div class="stats">
        <div class="stat-item">
          <span class="count">{{ formatCount(userStats.likes) }}</span>
          <span class="label">获赞</span>
        </div>
        <div class="stat-item">
          <span class="count">{{ formatCount(userStats.followers) }}</span>
          <span class="label">粉丝</span>
        </div>
        <div class="stat-item">
          <span class="count">{{ formatCount(userStats.following) }}</span>
          <span class="label">关注</span>
        </div>
      </div>
      <div class="edit-profile" @click="showEditProfile = true">
        <span>编辑资料</span>
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
        <span class="tab-label">{{ tab.label }}</span>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content">
      <!-- 作品列表 -->
      <div v-if="currentTab === 'works'" class="works-list">
        <div v-if="works.length === 0" class="empty-state">
          <span class="material-icons">videocam_off</span>
          <p>还没有发布作品</p>
        </div>
        <div v-else class="video-grid">
          <div v-for="(video, index) in works" 
               :key="index" 
               class="video-item"
               @click="handleVideoClick(video)">
            <div class="video-wrapper">
              <video
                :src="video.url"
                class="video-preview"
                loop
                muted
                @mouseenter="handleVideoHover($event, true)"
                @mouseleave="handleVideoHover($event, false)"
              ></video>
              <div class="video-overlay">
                <span class="material-icons">play_circle</span>
              </div>
            </div>
            <div class="video-info">
              <div class="video-stats">
                <span class="material-icons">favorite</span>
                <span>{{ formatCount(video.likes) }}</span>
              </div>
              <div class="video-title">{{ video.description }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 喜欢列表 -->
      <div v-if="currentTab === 'likes'" class="likes-list">
        <div v-if="likedVideos.length === 0" class="empty-state">
          <span class="material-icons">favorite_border</span>
          <p>还没有喜欢的视频</p>
        </div>
        <div v-else class="video-grid">
          <div v-for="video in likedVideos" 
               :key="video.id" 
               class="video-item"
               @click="handleVideoClick(video)">
            <div class="video-wrapper">
              <video
                :src="video.url"
                class="video-preview"
                loop
                muted
                @mouseenter="handleVideoHover($event, true)"
                @mouseleave="handleVideoHover($event, false)"
              ></video>
              <div class="video-overlay">
                <span class="material-icons">play_circle</span>
              </div>
            </div>
            <div class="video-info">
              <div class="video-stats">
                <span class="material-icons">favorite</span>
                <span>{{ formatCount(video.likes) }}</span>
              </div>
              <div class="video-title">{{ video.description }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 发布按钮 -->
    <div class="publish-fab" @click="handlePublish">
      <span class="material-icons">add</span>
    </div>

    <!-- 设置弹窗 -->
    <div v-if="showSettings" class="settings-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>设置</h3>
          <span class="material-icons close-icon" @click="showSettings = false">close</span>
        </div>
        <div class="settings-list">
          <div class="settings-item" @click="handleAccountSettings">
            <span class="material-icons">person</span>
            <span>账号设置</span>
          </div>
          <div class="settings-item" @click="handlePrivacySettings">
            <span class="material-icons">lock</span>
            <span>隐私设置</span>
          </div>
          <div class="settings-item" @click="handleNotificationSettings">
            <span class="material-icons">notifications</span>
            <span>通知设置</span>
          </div>
          <div class="settings-item logout" @click="handleLogout">
            <span class="material-icons">logout</span>
            <span>退出登录</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑资料弹窗 -->
    <div v-if="showEditProfile" class="settings-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>编辑资料</h3>
          <span class="material-icons close-icon" @click="showEditProfile = false">close</span>
        </div>
        <div class="edit-form">
          <div class="form-group">
            <label>昵称</label>
            <input v-model="editForm.username" type="text" placeholder="请输入昵称">
          </div>
          <div class="form-group">
            <label>简介</label>
            <textarea v-model="editForm.bio" placeholder="介绍一下自己吧"></textarea>
          </div>
          <button class="save-btn" @click="saveProfile">保存</button>
        </div>
      </div>
    </div>

    <!-- 头像上传弹窗 -->
    <div v-if="showAvatarUpload" class="settings-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>更换头像</h3>
          <span class="material-icons close-icon" @click="showAvatarUpload = false">close</span>
        </div>
        <div class="avatar-upload">
          <div class="preview-container">
            <img :src="avatarPreview || user.avatar || 'https://picsum.photos/200'" alt="头像预览" class="avatar-preview">
          </div>
          <input 
            type="file" 
            ref="fileInput" 
            accept="image/*" 
            style="display: none" 
            @change="handleFileChange"
          >
          <div class="upload-actions">
            <button class="upload-btn" @click="$refs.fileInput.click()">
              <span class="material-icons">upload</span>
              选择图片
            </button>
            <button class="save-btn" @click="saveAvatar" :disabled="!avatarFile">
              保存头像
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 设置相关弹窗 -->
    <div v-if="showAccountSettings" class="settings-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>账号设置</h3>
          <span class="material-icons close-icon" @click="showAccountSettings = false">close</span>
        </div>
        <div class="settings-form">
          <div class="form-group">
            <label>修改密码</label>
            <input v-model="accountForm.oldPassword" type="password" placeholder="当前密码">
            <input v-model="accountForm.newPassword" type="password" placeholder="新密码">
            <input v-model="accountForm.confirmPassword" type="password" placeholder="确认新密码">
          </div>
          <button class="save-btn" @click="saveAccountSettings">保存修改</button>
        </div>
      </div>
    </div>

    <div v-if="showPrivacySettings" class="settings-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>隐私设置</h3>
          <span class="material-icons close-icon" @click="showPrivacySettings = false">close</span>
        </div>
        <div class="settings-form">
          <div class="switch-group">
            <label>
              <span>私密账号</span>
              <div class="switch" :class="{ active: privacyForm.isPrivate }" @click="privacyForm.isPrivate = !privacyForm.isPrivate">
                <div class="switch-handle"></div>
              </div>
            </label>
            <p class="description">开启后，只有关注的人才能看到你的作品</p>
          </div>
          <div class="switch-group">
            <label>
              <span>允许评论</span>
              <div class="switch" :class="{ active: privacyForm.allowComments }" @click="privacyForm.allowComments = !privacyForm.allowComments">
                <div class="switch-handle"></div>
              </div>
            </label>
          </div>
          <div class="switch-group">
            <label>
              <span>允许下载</span>
              <div class="switch" :class="{ active: privacyForm.allowDownload }" @click="privacyForm.allowDownload = !privacyForm.allowDownload">
                <div class="switch-handle"></div>
              </div>
            </label>
          </div>
          <button class="save-btn" @click="savePrivacySettings">保存设置</button>
        </div>
      </div>
    </div>

    <div v-if="showNotificationSettings" class="settings-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>通知设置</h3>
          <span class="material-icons close-icon" @click="showNotificationSettings = false">close</span>
        </div>
        <div class="settings-form">
          <div class="switch-group">
            <label>
              <span>点赞通知</span>
              <div class="switch" :class="{ active: notificationForm.likes }" @click="notificationForm.likes = !notificationForm.likes">
                <div class="switch-handle"></div>
              </div>
            </label>
          </div>
          <div class="switch-group">
            <label>
              <span>评论通知</span>
              <div class="switch" :class="{ active: notificationForm.comments }" @click="notificationForm.comments = !notificationForm.comments">
                <div class="switch-handle"></div>
              </div>
            </label>
          </div>
          <div class="switch-group">
            <label>
              <span>关注通知</span>
              <div class="switch" :class="{ active: notificationForm.follows }" @click="notificationForm.follows = !notificationForm.follows">
                <div class="switch-handle"></div>
              </div>
            </label>
          </div>
          <button class="save-btn" @click="saveNotificationSettings">保存设置</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const user = JSON.parse(localStorage.getItem('user') || '{}')
const showSettings = ref(false)
const showEditProfile = ref(false)
const currentTab = ref('works')
const showAvatarUpload = ref(false)
const avatarPreview = ref('')
const avatarFile = ref(null)
const fileInput = ref(null)

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

const editForm = reactive({
  username: user.username || '',
  bio: user.bio || ''
})

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

// 格式化数字
const formatCount = (count) => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k'
  }
  return count
}

// 处理头像编辑
const handleEditAvatar = () => {
  showAvatarUpload.value = true
}

// 处理文件选择
const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过5MB')
      return
    }
    
    avatarFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// 保存头像
const saveAvatar = () => {
  if (!avatarFile.value) return
  
  // 这里应该调用后端API上传图片
  // 这里使用模拟数据
  const newUser = {
    ...user,
    avatar: avatarPreview.value
  }
  localStorage.setItem('user', JSON.stringify(newUser))
  
  showAvatarUpload.value = false
  avatarFile.value = null
  avatarPreview.value = ''
  
  // 刷新页面以更新头像
  window.location.reload()
}

// 保存个人资料
const saveProfile = () => {
  if (!editForm.username.trim()) {
    alert('昵称不能为空')
    return
  }
  
  // 这里应该调用后端API保存资料
  // 这里使用模拟数据
  const newUser = {
    ...user,
    username: editForm.username,
    bio: editForm.bio
  }
  localStorage.setItem('user', JSON.stringify(newUser))
  
  showEditProfile.value = false
  
  // 刷新页面以更新资料
  window.location.reload()
}

// 处理账号设置
const handleAccountSettings = () => {
  showSettings.value = false
  showAccountSettings.value = true
}

// 处理隐私设置
const handlePrivacySettings = () => {
  showSettings.value = false
  showPrivacySettings.value = true
}

// 处理通知设置
const handleNotificationSettings = () => {
  showSettings.value = false
  showNotificationSettings.value = true
}

// 保存账号设置
const saveAccountSettings = () => {
  if (accountForm.newPassword && accountForm.newPassword !== accountForm.confirmPassword) {
    alert('两次输入的密码不一致')
    return
  }
  // 这里应该调用后端API保存设置
  alert('账号设置已保存')
  showAccountSettings.value = false
}

// 保存隐私设置
const savePrivacySettings = () => {
  // 这里应该调用后端API保存设置
  alert('隐私设置已保存')
  showPrivacySettings.value = false
}

// 保存通知设置
const saveNotificationSettings = () => {
  // 这里应该调用后端API保存设置
  alert('通知设置已保存')
  showNotificationSettings.value = false
}

// 处理退出登录
const handleLogout = () => {
  localStorage.removeItem('user')
  router.push('/login')
}

onMounted(() => {
  // 组件加载时的其他初始化逻辑
})

const handleTouchStart = (e) => {
  touchStartY = e.touches[0].clientY
  hasInteracted = true
}

const handleTouchMove = (e) => {
  touchEndY = e.touches[0].clientY
}

const handleTouchEnd = () => {
  if (!hasInteracted) return

  const touchDiff = touchEndY - touchStartY
  if (touchDiff > 100) {
    // Swipe down, next video
    currentIndex.value = (currentIndex.value + 1) % works.value.length
  } else if (touchDiff < -100) {
    // Swipe up, previous video
    currentIndex.value = (currentIndex.value - 1 + works.value.length) % works.value.length
  }

  hasInteracted = false
}

const togglePlay = (index) => {
  // Implement video play logic here
}

const handleVideoEnd = (index) => {
  // Implement video end logic here
}

// 添加发布视频处理函数
const handlePublish = () => {
  router.push('/publish')
}

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

.user-info {
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

.edit-avatar {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #d4af37;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid #0a0f1a;
}

.edit-avatar:hover {
  background-color: #e5c158;
  transform: scale(1.1);
}

.edit-avatar .material-icons {
  font-size: 18px;
  color: #000000;
}

.username {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #ffffff;
  text-shadow: 0 0 10px rgba(212, 175, 55, 0.2);
}

.user-id {
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

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #d4af37;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.edit-profile {
  display: inline-flex;
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

.edit-profile:hover {
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

.content {
  padding: 16px;
  position: relative;
  z-index: 1;
}

.works-list {
  min-height: calc(100vh - 300px);
  background: linear-gradient(135deg, rgba(26, 31, 42, 0.5), rgba(10, 15, 26, 0.5));
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(212, 175, 55, 0.05);
  position: relative;
  z-index: 1;
}

.video-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px;
}

.video-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1f2a, #0a0f1a);
  border: 1px solid rgba(212, 175, 55, 0.05);
  transition: all 0.3s;
  width: calc((100% - 24px) / 3);
  aspect-ratio: 16/9;
}

.video-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(212, 175, 55, 0.15);
  border-color: rgba(212, 175, 55, 0.2);
  background: linear-gradient(135deg, #1f2435, #0a0f1a);
}

.video-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.video-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s;
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
  background-color: rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.3s;
}

.video-item:hover .video-overlay {
  opacity: 1;
}

.video-overlay .material-icons {
  font-size: 48px;
  color: #ffffff;
}

.video-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  color: #ffffff;
}

.video-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
}

.video-stats .material-icons {
  font-size: 16px;
  color: #d4af37;
}

.video-title {
  font-size: 14px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: rgba(255, 255, 255, 0.6);
}

.empty-state .material-icons {
  font-size: 48px;
  margin-bottom: 16px;
  color: rgba(255, 255, 255, 0.3);
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

.save-btn {
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

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
  background: linear-gradient(135deg, #e5c158, #d4af37);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.switch-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid rgba(255, 215, 0, 0.1);
}

.switch-group:last-child {
  border-bottom: none;
}

.switch-group label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  color: #ffffff;
}

.description {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin: 4px 0 0;
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

.switch.active {
  background: linear-gradient(135deg, #d4af37, #e5c158);
}

.switch-handle {
  width: 22px;
  height: 22px;
  background-color: #ffffff;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.switch.active .switch-handle {
  transform: translateX(24px);
}

.publish-fab {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d4af37, #e5c158);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(212, 175, 55, 0.3);
  z-index: 90;
}

.publish-fab:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 25px rgba(212, 175, 55, 0.4);
  background: linear-gradient(135deg, #e5c158, #d4af37);
}

.publish-fab .material-icons {
  font-size: 32px;
  color: #000000;
}

/* 添加滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #0a0f1a;
}

::-webkit-scrollbar-thumb {
  background: #ffd700;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #ffed4a;
}

/* 头像上传区域样式 */
.avatar-upload {
  padding: 20px;
}

.preview-container {
  width: 200px;
  height: 200px;
  margin: 0 auto 24px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #d4af37;
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.2);
}

.avatar-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 300px;
  margin: 0 auto;
}

.upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05));
  border: 2px dashed #d4af37;
  border-radius: 8px;
  color: #d4af37;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-btn:hover {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(212, 175, 55, 0.08));
  transform: translateY(-2px);
}

.upload-btn .material-icons {
  font-size: 24px;
}

@media (max-width: 768px) {
  .video-item {
    width: calc((100% - 12px) / 2);
  }
}

@media (max-width: 480px) {
  .video-item {
    width: 100%;
  }
}
</style> 