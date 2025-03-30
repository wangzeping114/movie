<template>
  <div class="publish-container">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <span class="material-icons back-icon" @click="router.back()">arrow_back</span>
      <h1>发布作品</h1>
      <span class="publish-btn-small" @click="handlePublish" v-if="videoFile && !isUploading">发布</span>
    </div>

    <!-- 上传区域 -->
    <div class="upload-area">
      <div v-if="!videoPreview" class="upload-box" @click="triggerFileInput" @drop.prevent="handleDrop" @dragover.prevent
        @dragenter.prevent="isDragging = true" 
        @dragleave.prevent="isDragging = false"
        :class="{'dragging': isDragging}">
        <input 
          type="file" 
          ref="fileInput" 
          accept="video/*" 
          style="display: none" 
          @change="handleFileChange"
        >
        <div class="upload-content">
          <span class="material-icons upload-icon">cloud_upload</span>
          <p>点击或拖拽视频</p>
          <p class="upload-tip">支持mp4、mov等格式</p>
        </div>
      </div>

      <!-- 视频预览 -->
      <div v-if="videoPreview && !isUploading" class="video-preview-container">
        <video class="video-preview" :src="videoPreview" controls autoplay muted></video>
        
        <!-- 简化的表单 -->
        <div class="quick-input">
          <textarea 
            v-model="videoForm.description" 
            placeholder="添加作品描述（可选）" 
            maxlength="100"
            rows="3"
          ></textarea>
          <div class="action-buttons">
            <button class="action-btn delete-btn" @click="deleteVideo">
              <span class="material-icons">delete</span>
              重新选择
            </button>
            <button class="action-btn publish-btn" @click="handlePublish">
              <span class="material-icons">publish</span>
              立即发布
            </button>
          </div>
        </div>
      </div>

      <!-- 上传进度 -->
      <div v-if="isUploading" class="upload-progress">
        <div class="progress-status">
          <span class="progress-label">{{ uploadStatus }}</span>
          <span class="progress-percent">{{ uploadProgress }}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-inner" :style="{width: uploadProgress + '%'}"></div>
        </div>
        <div class="processing-steps">
          <div class="step" v-for="(step, index) in processingSteps" :key="index"
               :class="{'active': processingStep > index, 'current': processingStep === index + 1}">
            <span class="material-icons">{{ step.icon }}</span>
            <span>{{ step.text }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 上传成功提示 -->
    <div class="success-overlay" v-if="showSuccess" @click="goToProfile">
      <div class="success-modal" @click.stop>
        <div class="success-icon-container">
          <span class="material-icons success-icon">check_circle</span>
        </div>
        <h2>发布成功！</h2>
        <p>你的作品已经上传成功，即将为你跳转到个人主页查看</p>
        <div class="success-actions">
          <button class="success-action-btn continue-btn" @click="handleContinueUpload">
            <span class="material-icons">add</span>
            继续发布
          </button>
          <button class="success-action-btn view-btn" @click="goToProfile">
            <span class="material-icons">person</span>
            立即查看我的作品
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUploadStore } from '../stores/uploadStore'
import { v4 as uuidv4 } from 'uuid'

const router = useRouter()
const uploadStore = useUploadStore()
const fileInput = ref(null)
const videoPreview = ref('')
const videoFile = ref(null)
const uploadProgress = ref(0)
const isUploading = ref(false)
const uploadStatus = ref('准备上传')
const processingStep = ref(0)
const showSuccess = ref(false)
const isDragging = ref(false)
const uploadId = ref('')

// 处理步骤
const processingSteps = [
  { text: '上传', icon: 'cloud_upload' },
  { text: '处理', icon: 'movie' },
  { text: '完成', icon: 'check_circle' }
]

// 视频表单数据 - 仅保留描述
const videoForm = reactive({
  description: ''
})

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value.click()
}

// 处理文件选择
const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    if (file.size > 500 * 1024 * 1024) {
      // 使用更友好的提示
      showToast('视频过大，请上传小于500MB的视频')
      return
    }
    
    videoFile.value = file
    videoPreview.value = URL.createObjectURL(file)
    
    // 添加震动反馈（如果设备支持）
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
  }
}

// 处理拖放
const handleDrop = (e) => {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file && file.type.startsWith('video/')) {
    if (file.size > 500 * 1024 * 1024) {
      showToast('视频过大，请上传小于500MB的视频')
      return
    }
    
    videoFile.value = file
    videoPreview.value = URL.createObjectURL(file)
    
    // 添加震动反馈
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
  } else {
    showToast('请上传视频文件')
  }
}

// 删除视频
const deleteVideo = () => {
  videoFile.value = null
  videoPreview.value = ''
  URL.revokeObjectURL(videoPreview.value)
  uploadProgress.value = 0
  isUploading.value = false
  processingStep.value = 0
  videoForm.description = ''
}

// 更新上传进度状态
const updateUploadStatus = (progress) => {
  if (progress < 40) {
    uploadStatus.value = '上传中...'
    processingStep.value = 1
    
    // 更新全局状态
    if (uploadId.value) {
      uploadStore.setVideoStatus(uploadId.value, 'uploading')
    }
  } else if (progress < 90) {
    uploadStatus.value = '处理中...'
    processingStep.value = 2
    
    // 更新全局状态
    if (uploadId.value) {
      uploadStore.setVideoStatus(uploadId.value, 'processing')
    }
  } else {
    uploadStatus.value = '即将完成'
    processingStep.value = 3
    
    // 更新全局状态
    if (uploadId.value) {
      uploadStore.setVideoStatus(uploadId.value, 'completed')
    }
  }
  
  // 同步进度到全局状态
  if (uploadId.value) {
    uploadStore.updateProgress(uploadId.value, progress)
  }
}

// 简单的提示函数
const showToast = (message) => {
  const toast = document.createElement('div')
  toast.className = 'app-toast'
  toast.textContent = message
  document.body.appendChild(toast)
  
  setTimeout(() => {
    toast.classList.add('show')
    
    setTimeout(() => {
      toast.classList.remove('show')
      setTimeout(() => {
        document.body.removeChild(toast)
      }, 300)
    }, 2000)
  }, 10)
}

// 发布视频
const handlePublish = () => {
  if (!videoFile.value || isUploading.value) return
  
  // 生成唯一ID
  uploadId.value = uuidv4()
  
  // 开始上传
  isUploading.value = true
  uploadProgress.value = 0
  processingStep.value = 1
  
  // 添加到全局上传状态
  uploadStore.addUploadingVideo({
    id: uploadId.value,
    name: videoFile.value.name,
    progress: 0,
    status: 'uploading',
    description: videoForm.description
  })
  
  // 模拟上传进度
  const interval = setInterval(() => {
    if (uploadProgress.value < 100) {
      // 不均匀增加进度，模拟真实上传
      let increment = 0
      if (uploadProgress.value < 40) {
        // 上传阶段，进度较快
        increment = Math.random() * 2 + 1
      } else if (uploadProgress.value < 90) {
        // 处理阶段，进度适中
        increment = Math.random() * 1.5 + 0.5
      } else {
        // 最后阶段，进度缓慢
        increment = Math.random() * 0.8 + 0.2
      }
      
      uploadProgress.value += increment
      if (uploadProgress.value > 100) uploadProgress.value = 100
      
      // 更新状态文本
      updateUploadStatus(uploadProgress.value)
    } else {
      clearInterval(interval)
      
      // 更新全局状态为已完成
      if (uploadId.value) {
        uploadStore.setVideoStatus(uploadId.value, 'completed')
        uploadStore.updateProgress(uploadId.value, 100)
        
        // 10秒后从列表中删除
        setTimeout(() => {
          uploadStore.removeVideo(uploadId.value)
        }, 10000)
      }
      
      // 显示成功提示，并跳转到个人主页
      setTimeout(() => {
        // 完成后震动提示
        if (navigator.vibrate) {
          navigator.vibrate([50, 100, 50])
        }
        showSuccess.value = true
        
        // 2秒后自动跳转到个人主页
        setTimeout(() => {
          router.push('/profile')
        }, 2000)
      }, 500)
    }
  }, 200)
}

// 继续上传新视频
const handleContinueUpload = () => {
  showSuccess.value = false
  isUploading.value = false
  deleteVideo()
}

// 立即前往个人资料页面
const goToProfile = () => {
  showSuccess.value = false
  router.push('/profile')
}
</script>

<style scoped>
/* 统一字体样式 */
* {
  font-family: "PingFang SC", "Helvetica Neue", Helvetica, "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif;
  -webkit-tap-highlight-color: transparent;
}

.publish-container {
  min-height: 100vh;
  background-color: #0f0f0f;
  color: #ffffff;
  padding-bottom: 30px;
  user-select: none;
}

.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background-color: rgba(15, 15, 15, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  padding: 0 16px;
  z-index: 100;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  justify-content: space-between;
}

.nav-bar h1 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  background: linear-gradient(45deg, #d4af37, #e5c158);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  flex: 1;
  text-align: center;
}

.back-icon {
  font-size: 24px;
  cursor: pointer;
  color: #ffffff;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-left: -10px;
}

.back-icon:active {
  background-color: rgba(255, 255, 255, 0.1);
}

.publish-btn-small {
  font-size: 14px;
  font-weight: 500;
  color: #d4af37;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 16px;
  border: 1px solid #d4af37;
}

.publish-btn-small:active {
  background-color: rgba(212, 175, 55, 0.1);
  transform: scale(0.96);
}

.upload-area {
  padding: 76px 16px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-box {
  width: 100%;
  height: 180px;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  max-width: 500px;
  margin: 0 auto;
}

.upload-box:hover {
  border-color: #d4af37;
  background-color: rgba(212, 175, 55, 0.05);
}

.upload-box:active {
  transform: scale(0.98);
}

.upload-box.dragging {
  border-color: #d4af37;
  background-color: rgba(212, 175, 55, 0.1);
  transform: scale(1.02);
}

.upload-content {
  text-align: center;
}

.upload-icon {
  font-size: 48px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 12px;
}

.upload-content p {
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
}

.upload-tip {
  font-size: 12px;
  margin-top: 8px;
  color: rgba(255, 255, 255, 0.4);
}

.video-preview-container {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.video-preview {
  width: 100%;
  border-radius: 16px;
  background-color: #000000;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.quick-input {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.quick-input textarea {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #fff;
  font-size: 15px;
  padding: 12px;
  resize: none;
}

.quick-input textarea:focus {
  outline: none;
  border-color: #d4af37;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 22px;
  font-size: 15px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:active {
  transform: scale(0.96);
}

.delete-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.delete-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.publish-btn {
  background: linear-gradient(45deg, #d4af37, #e5c158);
  color: #000;
}

.publish-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.25);
}

.upload-progress {
  width: 100%;
  max-width: 500px;
  margin: 20px auto;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.progress-status {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.progress-label {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.8);
}

.progress-percent {
  font-size: 15px;
  font-weight: 600;
  color: #d4af37;
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 24px;
}

.progress-inner {
  height: 100%;
  background: linear-gradient(45deg, #d4af37, #e5c158);
  border-radius: 4px;
  transition: width 0.3s ease-out;
}

.processing-steps {
  display: flex;
  justify-content: space-between;
  position: relative;
}

.processing-steps::before {
  content: '';
  position: absolute;
  top: 12px;
  left: 24px;
  right: 24px;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  z-index: 1;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
  background: rgba(15, 15, 15, 0.8);
  padding: 0 8px;
}

.step .material-icons {
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.4);
  font-size: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
  transition: all 0.3s;
}

.step span:not(.material-icons) {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  transition: all 0.3s;
}

.step.active .material-icons {
  background: rgba(212, 175, 55, 0.2);
  color: #d4af37;
}

.step.active span:not(.material-icons) {
  color: rgba(255, 255, 255, 0.7);
}

.step.current .material-icons {
  background: #d4af37;
  color: #000;
  transform: scale(1.2);
}

.step.current span:not(.material-icons) {
  color: #d4af37;
  font-weight: 500;
}

/* 成功提示样式 */
.success-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.success-modal {
  width: 85%;
  max-width: 320px;
  background-color: #1a1a1a;
  border-radius: 20px;
  padding: 24px 20px;
  text-align: center;
  animation: zoomIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes zoomIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

.success-icon-container {
  width: 72px;
  height: 72px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0) 70%);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.success-icon {
  font-size: 48px;
  color: #d4af37;
  animation: bounceIn 0.6s;
}

@keyframes bounceIn {
  0%, 20%, 40%, 60%, 80%, 100% { transition-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000); }
  0% { opacity: 0; transform: scale3d(0.3, 0.3, 0.3); }
  20% { transform: scale3d(1.1, 1.1, 1.1); }
  40% { transform: scale3d(0.9, 0.9, 0.9); }
  60% { opacity: 1; transform: scale3d(1.03, 1.03, 1.03); }
  80% { transform: scale3d(0.97, 0.97, 0.97); }
  100% { opacity: 1; transform: scale3d(1, 1, 1); }
}

.success-modal h2 {
  font-size: 20px;
  margin: 0 0 8px;
  color: #fff;
}

.success-modal p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 24px;
}

.success-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.success-action-btn {
  height: 44px;
  border-radius: 22px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.success-action-btn:active {
  transform: scale(0.96);
}

.continue-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.view-btn {
  background: linear-gradient(45deg, #d4af37, #e5c158);
  color: #000;
}

/* Toast 提示样式 */
:global(.app-toast) {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background-color: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
  z-index: 10000;
  opacity: 0;
  transition: all 0.3s ease;
}

:global(.app-toast.show) {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

@media (max-width: 600px) {
  .upload-area {
    padding-top: 66px;
  }
  
  .publish-btn-small {
    padding: 2px 8px;
    font-size: 12px;
  }
  
  .upload-box {
    height: 150px;
  }
  
  .action-btn {
    height: 40px;
    font-size: 14px;
  }
}
</style> 