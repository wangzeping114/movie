<template>
  <div class="profile-container">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <span class="material-icons back-icon" @click="router.back()">arrow_back</span>
      <h1>个人主页</h1>
      <span class="material-icons settings-icon" @click="showSettings = true">settings</span>
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
        <div v-else class="video-list" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
          <div v-for="(video, index) in works" 
               :key="index" 
               class="video-item"
               :style="{ transform: 'translateY(' + (currentIndex === index ? '0' : (index < currentIndex ? '-100%' : '100%')) + ')' }">
            <video
              :ref="el => setVideoRef(el, index)"
              :src="video.url"
              class="video-player"
              loop
              muted
              @click="togglePlay(index)"
              @ended="handleVideoEnd(index)"
            ></video>
            <div class="video-info">
              <span class="material-icons">favorite</span>
              <span>{{ formatCount(video.likes) }}</span>
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
          <div v-for="video in likedVideos" :key="video.id" class="video-item">
            <video :src="video.url" class="video-preview"></video>
            <div class="video-info">
              <span class="material-icons">favorite</span>
              <span>{{ formatCount(video.likes) }}</span>
            </div>
          </div>
        </div>
      </div>
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
          <div class="form-group">
            <label>绑定手机</label>
            <div class="phone-input">
              <input v-model="accountForm.phone" type="tel" placeholder="请输入手机号">
              <button class="verify-btn" @click="sendVerifyCode">获取验证码</button>
            </div>
            <input v-model="accountForm.verifyCode" type="text" placeholder="请输入验证码">
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
              <span>新关注通知</span>
              <div class="switch" :class="{ active: notificationForm.followNotify }" @click="notificationForm.followNotify = !notificationForm.followNotify">
                <div class="switch-handle"></div>
              </div>
            </label>
          </div>
          <div class="switch-group">
            <label>
              <span>点赞通知</span>
              <div class="switch" :class="{ active: notificationForm.likeNotify }" @click="notificationForm.likeNotify = !notificationForm.likeNotify">
                <div class="switch-handle"></div>
              </div>
            </label>
          </div>
          <div class="switch-group">
            <label>
              <span>评论通知</span>
              <div class="switch" :class="{ active: notificationForm.commentNotify }" @click="notificationForm.commentNotify = !notificationForm.commentNotify">
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
  confirmPassword: '',
  phone: '',
  verifyCode: ''
})

const privacyForm = reactive({
  isPrivate: false,
  allowComments: true,
  allowDownload: true
})

const notificationForm = reactive({
  followNotify: true,
  likeNotify: true,
  commentNotify: true
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

// 发送验证码
const sendVerifyCode = () => {
  if (!accountForm.phone) {
    alert('请输入手机号')
    return
  }
  // 这里应该调用后端API发送验证码
  alert('验证码已发送')
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
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background-color: #fff;
}

.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.nav-bar h1 {
  font-size: 18px;
  font-weight: 600;
}

.back-icon,
.settings-icon {
  font-size: 24px;
  color: #333;
  cursor: pointer;
}

.user-info {
  padding: 76px 16px 20px;
  text-align: center;
  background-color: #fff;
}

.avatar-container {
  position: relative;
  display: inline-block;
}

.avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.edit-avatar {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.edit-avatar .material-icons {
  font-size: 20px;
  color: #666;
}

.username {
  margin-top: 12px;
  font-size: 20px;
  font-weight: 600;
}

.user-id {
  margin-top: 4px;
  font-size: 14px;
  color: #999;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 48px;
  margin-top: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-item .count {
  font-size: 18px;
  font-weight: 600;
}

.stat-item .label {
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}

.edit-profile {
  margin-top: 20px;
  display: inline-block;
  padding: 8px 24px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
}

.tabs {
  display: flex;
  border-top: 1px solid #f0f0f0;
  background-color: #fff;
}

.tab {
  flex: 1;
  height: 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
}

.tab.active {
  color: #333;
}

.tab .material-icons {
  font-size: 24px;
}

.tab-label {
  margin-top: 2px;
  font-size: 12px;
}

.content {
  min-height: calc(100vh - 56px - 44px);
  background-color: #f8f8f8;
  padding: 12px;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
  color: #999;
}

.empty-state .material-icons {
  font-size: 48px;
  margin-bottom: 12px;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
}

.video-item {
  position: relative;
  aspect-ratio: 9/16;
  background-color: #eee;
  overflow: hidden;
}

.video-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-info {
  position: absolute;
  bottom: 8px;
  left: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.video-info .material-icons {
  font-size: 16px;
}

.settings-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  background-color: #fff;
  border-radius: 12px 12px 0 0;
  overflow: hidden;
}

.modal-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  font-size: 16px;
  font-weight: 600;
}

.close-icon {
  font-size: 24px;
  color: #666;
  cursor: pointer;
}

.settings-list {
  padding: 8px 0;
}

.settings-item {
  height: 56px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.settings-item:active {
  background-color: #f8f8f8;
}

.settings-item .material-icons {
  font-size: 24px;
  color: #666;
}

.settings-item span:last-child {
  font-size: 16px;
  color: #333;
}

.settings-item.logout {
  color: #ff2c55;
}

.settings-item.logout .material-icons {
  color: #ff2c55;
}

.settings-item.logout span:last-child {
  color: #ff2c55;
}

.edit-form {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-size: 14px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

.form-group textarea {
  height: 100px;
  resize: none;
}

.save-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.avatar-upload {
  padding: 20px;
  text-align: center;
}

.preview-container {
  width: 200px;
  height: 200px;
  margin: 0 auto 20px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #ddd;
}

.avatar-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background-color: #f5f5f5;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.upload-btn:hover {
  background-color: #eee;
}

.upload-btn .material-icons {
  font-size: 20px;
}

.settings-form {
  padding: 20px;
}

.phone-input {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.verify-btn {
  padding: 0 16px;
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
}

.switch-group {
  margin-bottom: 24px;
}

.switch-group label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.switch-group .description {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.switch {
  width: 51px;
  height: 31px;
  background-color: #ddd;
  border-radius: 31px;
  padding: 3px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.switch.active {
  background-color: #4CAF50;
}

.switch-handle {
  width: 25px;
  height: 25px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s;
}

.switch.active .switch-handle {
  transform: translateX(20px);
}

.video-list {
  display: flex;
  overflow: hidden;
  height: 100%;
}

.video-item {
  flex: 0 0 100%;
  transform: translateX(0%);
  transition: transform 0.5s ease;
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style> 