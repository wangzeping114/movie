<template>
  <div class="live-container">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <div class="nav-left">
        <i class="material-icons" @click="router.back()">arrow_back</i>
        <h1>直播</h1>
      </div>
      <div class="nav-right">
        <button class="start-live-btn" @click="showStartLiveDialog = true">
          <i class="material-icons">videocam</i>
          <span>我要开播</span>
        </button>
      </div>
    </div>

    <!-- 直播列表 -->
    <div class="live-list">
      <div class="live-item" v-for="live in liveList" :key="live.id" @click="watchLive(live)">
        <div class="live-cover">
          <img :src="live.cover" :alt="live.title">
          <div class="live-status" :class="{ 'online': live.isOnline }">
            {{ live.isOnline ? '直播中' : '未开播' }}
          </div>
        </div>
        <div class="live-info">
          <div class="live-title">{{ live.title }}</div>
          <div class="live-author">
            <img :src="live.authorAvatar" :alt="live.authorName" class="author-avatar">
            <span class="author-name">{{ live.authorName }}</span>
            <span class="viewer-count">{{ live.viewerCount }}观看</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 开播弹窗 -->
    <div class="start-live-dialog" v-if="showStartLiveDialog">
      <div class="dialog-content">
        <div class="dialog-header">
          <h2>开始直播</h2>
          <i class="material-icons close-btn" @click="showStartLiveDialog = false">close</i>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label>直播标题</label>
            <input type="text" v-model="newLive.title" placeholder="请输入直播标题">
          </div>
          <div class="form-group">
            <label>选择封面</label>
            <div class="cover-selector">
              <div class="cover-preview" v-if="newLive.coverPreview">
                <img :src="newLive.coverPreview" alt="封面预览">
              </div>
              <label class="upload-btn">
                <input type="file" accept="image/*" @change="handleCoverUpload">
                <span><i class="material-icons">add_photo_alternate</i> 选择图片</span>
              </label>
            </div>
          </div>
          <div class="camera-preview" v-if="cameraActive">
            <video ref="videoPreview" autoplay muted></video>
          </div>
          <div class="camera-placeholder" v-else>
            <div class="camera-placeholder-content">
              <i class="material-icons">videocam_off</i>
              <div class="placeholder-text">无法访问摄像头</div>
              <button class="retry-btn" @click="startCamera">重试</button>
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="cancel-btn" @click="showStartLiveDialog = false">取消</button>
          <button class="start-btn" @click="startLiveStream" :disabled="!newLive.title">开始直播</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 直播列表数据
const liveList = ref([
  {
    id: 1,
    title: '性感舞蹈直播',
    authorName: '小美',
    authorAvatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    cover: 'https://picsum.photos/400/600',
    viewerCount: 1234,
    isOnline: true
  },
  {
    id: 2,
    title: '深夜聊天室',
    authorName: '阿狸',
    authorAvatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    cover: 'https://picsum.photos/400/601',
    viewerCount: 856,
    isOnline: true
  },
  {
    id: 3,
    title: '才艺表演',
    authorName: '小甜',
    authorAvatar: 'https://randomuser.me/api/portraits/women/3.jpg',
    cover: 'https://picsum.photos/400/602',
    viewerCount: 0,
    isOnline: false
  }
])

// 开播相关状态
const showStartLiveDialog = ref(false)
const cameraActive = ref(false)
const videoPreview = ref(null)
const stream = ref(null)
const newLive = ref({
  title: '',
  coverPreview: null,
  coverFile: null
})

// 观看直播
const watchLive = (live) => {
  if (live.isOnline) {
    router.push(`/live/${live.id}`)
  } else {
    alert('该直播尚未开始')
  }
}

// 处理封面上传
const handleCoverUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    newLive.value.coverFile = file
    const reader = new FileReader()
    reader.onload = (e) => {
      newLive.value.coverPreview = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// 开始直播
const startLiveStream = async () => {
  if (!newLive.value.title) return
  
  try {
    // 如果没有封面预览，使用默认封面
    if (!newLive.value.coverPreview) {
      // 默认使用随机图片作为封面
      newLive.value.coverPreview = `https://picsum.photos/400/${600 + liveList.value.length}`
    }
    
    // 模拟创建直播
    const newLiveItem = {
      id: liveList.value.length + 1,
      title: newLive.value.title,
      authorName: '我的账号', // 可以从用户信息中获取
      authorAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      cover: newLive.value.coverPreview,
      viewerCount: 0,
      isOnline: true
    }
    
    liveList.value.unshift(newLiveItem)
    
    // 提示用户
    if (!cameraActive.value) {
      alert('直播已开始! (无摄像头模式)')
    } else {
      alert('直播已开始!')
    }
    
    // 关闭对话框
    showStartLiveDialog.value = false
    
    // 重置表单
    newLive.value = {
      title: '',
      coverPreview: null,
      coverFile: null
    }
    
    if (stream.value) {
      stopCamera()
    }
    
    // 可以选择跳转到直播页面
    // router.push(`/live/${newLiveItem.id}`)
  } catch (error) {
    console.error('开始直播失败:', error)
    alert('开始直播失败，请重试')
  }
}

// 开启摄像头
const startCamera = async () => {
  try {
    // 首先检查是否支持 getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('您的浏览器不支持访问摄像头，请更换浏览器或升级到最新版本')
    }
    
    stream.value = await navigator.mediaDevices.getUserMedia({ 
      video: true,
      audio: true
    })
    
    if (videoPreview.value) {
      videoPreview.value.srcObject = stream.value
    }
    cameraActive.value = true
  } catch (error) {
    console.error('获取摄像头失败:', error)
    
    let errorMessage = '无法访问摄像头，请检查权限设置'
    
    // 根据错误类型提供不同的提示
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      errorMessage = '摄像头访问被拒绝，请在浏览器设置中允许访问摄像头'
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      errorMessage = '未检测到摄像头设备，请确认摄像头已连接'
    } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      errorMessage = '摄像头可能被其他应用占用，请关闭可能使用摄像头的应用后重试'
    } else if (error.name === 'OverconstrainedError') {
      errorMessage = '摄像头不满足要求的规格，请尝试其他摄像头'
    } else if (error.name === 'SecurityError') {
      errorMessage = '使用摄像头被安全策略阻止，请使用HTTPS连接'
    }
    
    alert(errorMessage)
    
    // 在无法访问摄像头的情况下，仍然允许用户开播，但不显示预览
    cameraActive.value = false
  }
}

// 关闭摄像头
const stopCamera = () => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop())
    stream.value = null
  }
  cameraActive.value = false
}

// 监听对话框显示状态变化
watch(showStartLiveDialog, (newVal) => {
  if (newVal) {
    // 当对话框显示时，开启摄像头
    startCamera()
  } else {
    // 当对话框关闭时，关闭摄像头
    stopCamera()
  }
})

// 组件卸载时确保释放摄像头资源
onUnmounted(() => {
  stopCamera()
})
</script>

<style scoped>
.live-container {
  min-height: 100vh;
  background: #1a1a1a;
  color: #ffffff;
  padding-bottom: 72px;
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

.nav-right {
  display: flex;
  gap: 20px;
}

.start-live-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #d4af37, #e5c158);
  border: none;
  border-radius: 20px;
  padding: 6px 12px;
  color: #000;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-live-btn i {
  font-size: 20px;
}

.start-live-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
}

.live-list {
  padding: 72px 16px 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.live-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.live-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.live-cover {
  position: relative;
  width: 100%;
  padding-top: 150%;
}

.live-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.live-status {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.6);
  font-size: 12px;
  color: #fff;
}

.live-status.online {
  background: rgba(255, 77, 77, 0.8);
}

.live-info {
  padding: 12px;
}

.live-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #fff;
}

.live-author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.author-name {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.viewer-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-left: auto;
}

/* 开播弹窗样式 */
.start-live-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.dialog-content {
  background: #1a1a1a;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.dialog-header h2 {
  margin: 0;
  color: #d4af37;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  color: #fff;
  transform: scale(1.1);
}

.dialog-body {
  padding: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.form-group input[type="text"] {
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #fff;
  font-size: 16px;
}

.form-group input[type="text"]:focus {
  outline: none;
  border-color: rgba(212, 175, 55, 0.5);
}

.cover-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cover-preview {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
}

.cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(212, 175, 55, 0.2);
  border: 1px dashed rgba(212, 175, 55, 0.5);
  border-radius: 6px;
  color: #d4af37;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-btn:hover {
  background: rgba(212, 175, 55, 0.3);
}

.upload-btn input[type="file"] {
  display: none;
}

.camera-preview {
  margin-top: 16px;
  width: 100%;
  height: 240px;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.camera-preview video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera-placeholder {
  margin-top: 16px;
  width: 100%;
  height: 240px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.camera-placeholder-content i {
  font-size: 48px;
  color: rgba(255, 255, 255, 0.5);
}

.placeholder-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
}

.retry-btn {
  padding: 8px 16px;
  background: rgba(212, 175, 55, 0.3);
  border: 1px solid rgba(212, 175, 55, 0.5);
  border-radius: 6px;
  color: #d4af37;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: rgba(212, 175, 55, 0.4);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px;
  gap: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.cancel-btn {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.start-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #d4af37, #e5c158);
  border: none;
  border-radius: 6px;
  color: #000;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
}

.start-btn:disabled {
  opacity: 0.5;
  transform: none;
  box-shadow: none;
  cursor: not-allowed;
}
</style> 