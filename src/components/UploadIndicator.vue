<template>
  <div v-if="isUploading" class="upload-indicator" @click="toggleExpand">
    <!-- 悬浮的圆形进度指示器 -->
    <div class="progress-circle-container">
      <div class="progress-circle">
        <svg width="48" height="48" viewBox="0 0 48 48">
          <circle class="progress-background" cx="24" cy="24" r="20" />
          <circle class="progress-bar" 
                 cx="24" cy="24" r="20" 
                 :stroke-dashoffset="calculateDashOffset(progress)" />
        </svg>
        <span class="progress-text">{{ progress }}%</span>
      </div>
    </div>

    <!-- 展开后显示的详情面板 -->
    <div v-if="expanded" class="upload-details">
      <div class="detail-header">
        <span class="detail-title">正在上传 ({{ uploadingVideos.length }})</span>
        <span class="detail-close material-icons" @click.stop="expanded = false">close</span>
      </div>
      
      <div class="video-list">
        <div v-for="video in uploadingVideos" :key="video.id" class="video-item">
          <div class="video-info">
            <span class="material-icons video-icon">videocam</span>
            <div class="video-text">
              <div class="video-name">{{ video.name }}</div>
              <div class="video-status">{{ getStatusText(video.status) }} · {{ video.progress }}%</div>
            </div>
          </div>
          <div class="video-progress">
            <div class="video-progress-bar" :style="{ width: video.progress + '%' }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUploadStore } from '../stores/uploadStore'

const uploadStore = useUploadStore()
const expanded = ref(false)

// 从Store获取数据
const isUploading = computed(() => uploadStore.isUploading)
const progress = computed(() => uploadStore.totalProgress)
const uploadingVideos = computed(() => uploadStore.uploadingVideos)

// 计算SVG环形进度条的偏移值
const calculateDashOffset = (percent) => {
  const circumference = 2 * Math.PI * 20 // 2πr, r=20
  return circumference - (percent / 100) * circumference
}

// 切换展开/收起状态
const toggleExpand = () => {
  expanded.value = !expanded.value
}

// 获取上传状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'uploading': return '上传中'
    case 'processing': return '处理中'
    case 'completed': return '已完成'
    case 'failed': return '上传失败'
    default: return '上传中'
  }
}
</script>

<style scoped>
.upload-indicator {
  position: fixed;
  right: 16px;
  bottom: 80px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.progress-circle-container {
  width: 48px;
  height: 48px;
  background: #1a1a1a;
  border-radius: 50%;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  overflow: hidden;
  position: relative;
}

.progress-circle {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-background {
  fill: none;
  stroke: rgba(255, 255, 255, 0.1);
  stroke-width: 3;
}

.progress-bar {
  fill: none;
  stroke: #d4af37;
  stroke-width: 3;
  stroke-linecap: round;
  transform: rotate(-90deg);
  transform-origin: center;
  transition: stroke-dashoffset 0.3s;
  stroke-dasharray: 125.6;
}

.progress-text {
  position: absolute;
  font-size: 12px;
  font-weight: 500;
  color: #fff;
}

.upload-details {
  width: 280px;
  max-height: 300px;
  background: #1a1a1a;
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-title {
  font-size: 14px;
  font-weight: 500;
  color: #fff;
}

.detail-close {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
}

.video-list {
  max-height: 250px;
  overflow-y: auto;
}

.video-item {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.video-info {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.video-icon {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.6);
  margin-right: 12px;
}

.video-text {
  flex: 1;
}

.video-name {
  font-size: 13px;
  color: #fff;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.video-status {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.video-progress {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.video-progress-bar {
  height: 100%;
  background: #d4af37;
  transition: width 0.3s;
}
</style> 