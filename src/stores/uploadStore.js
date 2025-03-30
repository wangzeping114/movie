import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUploadStore = defineStore('upload', () => {
  // 上传中的视频列表
  const uploadingVideos = ref([])
  
  // 计算当前上传的总进度
  const totalProgress = computed(() => {
    if (uploadingVideos.value.length === 0) return 0
    
    const totalPercent = uploadingVideos.value.reduce((sum, video) => sum + video.progress, 0)
    return Math.floor(totalPercent / uploadingVideos.value.length)
  })
  
  // 是否有视频在上传中
  const isUploading = computed(() => uploadingVideos.value.length > 0)
  
  // 添加视频到上传队列
  const addUploadingVideo = (video) => {
    uploadingVideos.value.push(video)
  }
  
  // 更新视频上传进度
  const updateProgress = (id, progress) => {
    const video = uploadingVideos.value.find(v => v.id === id)
    if (video) {
      video.progress = progress
    }
  }
  
  // 设置视频上传状态
  const setVideoStatus = (id, status) => {
    const video = uploadingVideos.value.find(v => v.id === id)
    if (video) {
      video.status = status
    }
  }
  
  // 移除已完成的视频
  const removeVideo = (id) => {
    const index = uploadingVideos.value.findIndex(v => v.id === id)
    if (index > -1) {
      uploadingVideos.value.splice(index, 1)
    }
  }
  
  // 获取当前上传中的最新视频
  const currentUploadingVideo = computed(() => {
    if (uploadingVideos.value.length === 0) return null
    return uploadingVideos.value[uploadingVideos.value.length - 1]
  })
  
  return {
    uploadingVideos,
    totalProgress,
    isUploading,
    currentUploadingVideo,
    addUploadingVideo,
    updateProgress,
    setVideoStatus,
    removeVideo
  }
}) 