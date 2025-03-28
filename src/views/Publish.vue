<template>
  <div class="publish-container">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <span class="material-icons back-icon" @click="router.back()">arrow_back</span>
      <h1>发布视频</h1>
    </div>

    <!-- 上传区域 -->
    <div class="upload-area">
      <div class="upload-box" @click="triggerFileInput" @drop.prevent="handleDrop" @dragover.prevent>
        <input 
          type="file" 
          ref="fileInput" 
          accept="video/*" 
          style="display: none" 
          @change="handleFileChange"
        >
        <div class="upload-content">
          <span class="material-icons">cloud_upload</span>
          <p>点击或拖拽视频文件到此处</p>
          <p class="upload-tip">支持mp4、mov等格式，大小不超过500MB</p>
        </div>
      </div>

      <!-- 视频预览 -->
      <div v-if="videoPreview" class="video-preview">
        <video :src="videoPreview" controls></video>
        <div class="preview-actions">
          <button class="delete-btn" @click="deleteVideo">
            <span class="material-icons">delete</span>
            删除
          </button>
          <button class="retry-btn" @click="triggerFileInput">
            <span class="material-icons">refresh</span>
            重新选择
          </button>
        </div>
      </div>
    </div>

    <!-- 视频信息表单 -->
    <div v-if="videoPreview" class="video-form">
      <div class="form-group">
        <label>视频标题</label>
        <input v-model="videoForm.title" type="text" placeholder="请输入视频标题">
      </div>
      <div class="form-group">
        <label>视频描述</label>
        <textarea v-model="videoForm.description" placeholder="介绍一下你的视频吧"></textarea>
      </div>
      <div class="form-group">
        <label>视频封面</label>
        <div class="cover-upload" @click="triggerCoverInput">
          <input 
            type="file" 
            ref="coverInput" 
            accept="image/*" 
            style="display: none" 
            @change="handleCoverChange"
          >
          <div class="cover-preview" v-if="coverPreview">
            <img :src="coverPreview" alt="封面预览">
          </div>
          <div v-else class="cover-placeholder">
            <span class="material-icons">add_photo_alternate</span>
            <span>选择封面</span>
          </div>
        </div>
      </div>
      <div class="form-group">
        <label>视频分类</label>
        <div class="category-select">
          <div 
            v-for="category in categories" 
            :key="category.id"
            class="category-item"
            :class="{ active: videoForm.category === category.id }"
            @click="videoForm.category = category.id"
          >
            {{ category.name }}
          </div>
        </div>
      </div>
      <div class="form-group">
        <label>视频标签</label>
        <div class="tags-input">
          <div 
            v-for="(tag, index) in videoForm.tags" 
            :key="index"
            class="tag-item"
          >
            {{ tag }}
            <span class="material-icons" @click="removeTag(index)">close</span>
          </div>
          <input 
            v-if="videoForm.tags.length < 5"
            v-model="newTag"
            type="text"
            placeholder="添加标签"
            @keyup.enter="addTag"
          >
        </div>
      </div>
      <div class="form-group">
        <label>发布设置</label>
        <div class="publish-settings">
          <div class="setting-item">
            <span>允许评论</span>
            <div class="switch" :class="{ active: videoForm.allowComments }" @click="videoForm.allowComments = !videoForm.allowComments">
              <div class="switch-handle"></div>
            </div>
          </div>
          <div class="setting-item">
            <span>允许下载</span>
            <div class="switch" :class="{ active: videoForm.allowDownload }" @click="videoForm.allowDownload = !videoForm.allowDownload">
              <div class="switch-handle"></div>
            </div>
          </div>
        </div>
      </div>
      <button class="publish-btn" @click="handlePublish" :disabled="!canPublish">
        发布视频
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const fileInput = ref(null)
const coverInput = ref(null)
const videoPreview = ref('')
const coverPreview = ref('')
const videoFile = ref(null)
const coverFile = ref(null)
const newTag = ref('')

// 视频分类
const categories = [
  { id: 1, name: '舞蹈' },
  { id: 2, name: '音乐' },
  { id: 3, name: '搞笑' },
  { id: 4, name: '生活' },
  { id: 5, name: '美食' },
  { id: 6, name: '其他' }
]

// 视频表单数据
const videoForm = reactive({
  title: '',
  description: '',
  category: null,
  tags: [],
  allowComments: true,
  allowDownload: false
})

// 是否可以发布
const canPublish = computed(() => {
  return videoFile.value && 
         videoForm.title.trim() && 
         videoForm.category && 
         videoForm.tags.length > 0
})

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value.click()
}

// 触发封面选择
const triggerCoverInput = () => {
  coverInput.value.click()
}

// 处理文件选择
const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    if (file.size > 500 * 1024 * 1024) {
      alert('视频大小不能超过500MB')
      return
    }
    
    videoFile.value = file
    videoPreview.value = URL.createObjectURL(file)
  }
}

// 处理封面选择
const handleCoverChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过5MB')
      return
    }
    
    coverFile.value = file
    coverPreview.value = URL.createObjectURL(file)
  }
}

// 处理拖放
const handleDrop = (e) => {
  const file = e.dataTransfer.files[0]
  if (file && file.type.startsWith('video/')) {
    if (file.size > 500 * 1024 * 1024) {
      alert('视频大小不能超过500MB')
      return
    }
    
    videoFile.value = file
    videoPreview.value = URL.createObjectURL(file)
  } else {
    alert('请上传视频文件')
  }
}

// 删除视频
const deleteVideo = () => {
  videoFile.value = null
  videoPreview.value = ''
  URL.revokeObjectURL(videoPreview.value)
}

// 添加标签
const addTag = () => {
  if (newTag.value.trim() && videoForm.tags.length < 5) {
    videoForm.tags.push(newTag.value.trim())
    newTag.value = ''
  }
}

// 删除标签
const removeTag = (index) => {
  videoForm.tags.splice(index, 1)
}

// 发布视频
const handlePublish = () => {
  if (!canPublish.value) return
  
  // 这里应该调用后端API上传视频
  // 这里使用模拟数据
  const formData = new FormData()
  formData.append('video', videoFile.value)
  formData.append('cover', coverFile.value)
  formData.append('title', videoForm.title)
  formData.append('description', videoForm.description)
  formData.append('category', videoForm.category)
  formData.append('tags', JSON.stringify(videoForm.tags))
  formData.append('allowComments', videoForm.allowComments)
  formData.append('allowDownload', videoForm.allowDownload)
  
  // 模拟上传
  alert('视频上传中...')
  setTimeout(() => {
    alert('发布成功！')
    router.push('/profile')
  }, 2000)
}
</script>

<style scoped>
.publish-container {
  min-height: 100vh;
  background-color: #0f0f0f;
  color: #ffffff;
  padding-bottom: 24px;
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
}

.nav-bar h1 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  background: linear-gradient(45deg, #00ff87, #60efff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.back-icon {
  font-size: 24px;
  cursor: pointer;
  color: #ffffff;
  margin-right: 16px;
}

.upload-area {
  padding: 88px 16px 24px;
}

.upload-box {
  width: 100%;
  height: 200px;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-box:hover {
  border-color: #00ff87;
  background-color: rgba(0, 255, 135, 0.05);
}

.upload-content {
  text-align: center;
}

.upload-content .material-icons {
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

.video-preview {
  margin-top: 24px;
}

.video-preview video {
  width: 100%;
  border-radius: 12px;
  background-color: #000000;
}

.preview-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.preview-actions button {
  flex: 1;
  height: 40px;
  border: none;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.delete-btn {
  background-color: rgba(255, 77, 77, 0.1);
  color: #ff4d4d;
}

.delete-btn:hover {
  background-color: rgba(255, 77, 77, 0.2);
}

.retry-btn {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.retry-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.video-form {
  padding: 0 16px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  transition: all 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #00ff87;
  box-shadow: 0 0 0 2px rgba(0, 255, 135, 0.2);
}

.form-group textarea {
  height: 100px;
  resize: none;
}

.cover-upload {
  width: 100%;
  height: 200px;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  cursor: pointer;
  overflow: hidden;
}

.cover-preview {
  width: 100%;
  height: 100%;
}

.cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
}

.cover-placeholder .material-icons {
  font-size: 48px;
  margin-bottom: 8px;
}

.category-select {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.category-item {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.category-item.active {
  background: linear-gradient(45deg, #00ff87, #60efff);
  color: #000000;
  border-color: transparent;
}

.tags-input {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  min-height: 44px;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background-color: rgba(0, 255, 135, 0.1);
  border-radius: 4px;
  font-size: 14px;
}

.tag-item .material-icons {
  font-size: 16px;
  cursor: pointer;
  color: #00ff87;
}

.tags-input input {
  flex: 1;
  min-width: 100px;
  background: none;
  border: none;
  padding: 4px 8px;
  color: #ffffff;
  font-size: 14px;
}

.tags-input input:focus {
  outline: none;
}

.publish-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: rgba(255, 255, 255, 0.8);
}

.switch {
  width: 50px;
  height: 26px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 13px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s;
}

.switch.active {
  background: linear-gradient(45deg, #00ff87, #60efff);
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

.publish-btn {
  width: 100%;
  height: 48px;
  background: linear-gradient(45deg, #00ff87, #60efff);
  color: #000000;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.publish-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 255, 135, 0.3);
}

.publish-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style> 