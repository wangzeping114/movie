<template>
  <div class="comment-wrapper" v-show="modelValue" @click.self="closePanel">
    <div 
      class="comment-panel" 
      :class="{ 'panel-show': modelValue }"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <!-- 头部 -->
      <div class="panel-header">
        <div class="drag-handle"></div>
        <div class="header-content">
          <span class="title">{{ commentCount }}条评论</span>
          <span class="close-btn" @click="closePanel">关闭</span>
        </div>
      </div>

      <!-- 评论列表 -->
      <div class="comment-list" ref="commentListRef">
        <div v-if="comments.length === 0" class="no-comment">
          <div class="empty-icon material-icons">chat_bubble_outline</div>
          <div class="empty-text">还没有评论，快来抢沙发吧~</div>
        </div>
        <template v-else>
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <!-- 用户头像 -->
            <div class="avatar">
              <img :src="comment.avatar" :alt="comment.username">
            </div>
            <!-- 评论内容 -->
            <div class="comment-content">
              <div class="username">{{ comment.username }}</div>
              <div class="text">{{ comment.content }}</div>
              <div class="meta">
                <span class="time">{{ comment.time }}</span>
                <span class="reply-btn" @click="handleReply(comment)">回复</span>
              </div>
              <!-- 回复列表 -->
              <div class="replies" v-if="comment.replies && comment.replies.length > 0">
                <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                  <div class="reply-content">
                    <span class="reply-username">{{ reply.username }}</span>
                    <span class="reply-text">{{ reply.content }}</span>
                  </div>
                  <div class="reply-meta">
                    <span class="time">{{ reply.time }}</span>
                    <span class="reply-btn" @click="handleReply(reply)">回复</span>
                  </div>
                </div>
              </div>
            </div>
            <!-- 点赞 -->
            <div class="like-wrapper">
              <span 
                class="material-icons like-icon" 
                :class="{ 
                  'liked': comment.isLiked,
                  'like-animation': comment.isAnimating 
                }" 
                @click="toggleLike(comment)"
              >
                {{ comment.isLiked ? 'favorite' : 'favorite_border' }}
              </span>
              <span class="like-count" :class="{ 'liked': comment.isLiked }">
                {{ formatLikeCount(comment.likeCount) }}
              </span>
            </div>
          </div>
          
          <!-- 加载状态 -->
          <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <span>加载中...</span>
          </div>
          <div v-if="!hasMore && comments.length > 0" class="no-more">
            没有更多评论了
          </div>
        </template>
      </div>

      <!-- 评论输入框 -->
      <div class="comment-input">
        <input 
          type="text" 
          v-model="commentText"
          :placeholder="placeholder"
          @keyup.enter="submitComment"
          ref="commentInputRef"
        >
        <button 
          class="submit-btn"
          :class="{ 'active': commentText.trim() }"
          @click="submitComment"
        >发送</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  videoId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

// 使用 Map 存储每个视频的评论
const videoCommentsMap = ref(new Map())

// 当前视频的评论
const comments = computed(() => {
  if (!videoCommentsMap.value.has(props.videoId)) {
    // 如果是新视频，初始化空评论列表
    videoCommentsMap.value.set(props.videoId, [])
  }
  return videoCommentsMap.value.get(props.videoId)
})

// 分页相关
const page = ref(1)
const pageSize = 10
const loading = ref(false)
const hasMore = ref(true)

// 评论列表引用
const commentListRef = ref(null)

// 加载更多评论
const loadMoreComments = async () => {
  if (loading.value || !hasMore.value) return
  
  loading.value = true
  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newComments = Array.from({ length: pageSize }, (_, index) => ({
      id: Date.now() + index,
      username: `用户${page.value * pageSize + index + 1}`,
      avatar: `https://picsum.photos/50/50?random=${page.value * pageSize + index + 1}`,
      content: `这是第${page.value}页的第${index + 1}条评论`,
      time: '2分钟前',
      likeCount: Math.floor(Math.random() * 1000),
      isLiked: false,
      replies: []
    }))
    
    const currentComments = videoCommentsMap.value.get(props.videoId) || []
    videoCommentsMap.value.set(props.videoId, [...currentComments, ...newComments])
    
    page.value++
    hasMore.value = page.value <= 3 // 模拟只有3页数据
  } catch (error) {
    console.error('加载评论失败:', error)
  } finally {
    loading.value = false
  }
}

// 监听滚动事件
const handleScroll = () => {
  if (!commentListRef.value) return
  
  const { scrollTop, scrollHeight, clientHeight } = commentListRef.value
  if (scrollHeight - scrollTop - clientHeight < 50) {
    loadMoreComments()
  }
}

// 监听面板显示状态
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    // 重置分页状态
    page.value = 1
    hasMore.value = true
    loading.value = false
    
    // 添加滚动监听
    nextTick(() => {
      if (commentListRef.value) {
        commentListRef.value.addEventListener('scroll', handleScroll)
      }
    })
    
    // 加载第一页评论
    loadMoreComments()
  } else {
    // 移除滚动监听
    if (commentListRef.value) {
      commentListRef.value.removeEventListener('scroll', handleScroll)
    }
  }
})

// 格式化时间
const formatTime = (timestamp) => {
  const now = Date.now()
  const diff = now - timestamp
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 2592000000) return `${Math.floor(diff / 86400000)}天前`
  return new Date(timestamp).toLocaleDateString()
}

const commentText = ref('')
const replyTo = ref(null)
const placeholder = computed(() => {
  if (replyTo.value) {
    return '回复 @' + replyTo.value.username
  }
  return '说点什么...'
})

const closePanel = () => {
  emit('update:modelValue', false)
  replyTo.value = null
  commentText.value = ''
}

const commentInputRef = ref(null)

const handleReply = (comment) => {
  replyTo.value = comment
  console.log('回复:', comment.username)
  
  // 使用 nextTick 确保在 DOM 更新后再聚焦
  nextTick(() => {
    if (commentInputRef.value) {
      commentInputRef.value.focus()
    }
  })
}

const submitComment = () => {
  if (!commentText.value.trim()) return
  
  console.log('提交评论:', commentText.value)
  
  if (replyTo.value) {
    // 处理回复
    const targetComment = comments.value.find(c => c.id === replyTo.value.id)
    if (targetComment) {
      if (!targetComment.replies) {
        targetComment.replies = []
      }
      targetComment.replies.push({
        id: Date.now(),
        username: '当前用户',
        content: commentText.value,
        time: formatTime(Date.now())
      })
    }
  } else {
    // 添加新评论
    const newComment = {
      id: Date.now(),
      username: '当前用户',
      avatar: 'https://picsum.photos/50/50',
      content: commentText.value,
      time: formatTime(Date.now()),
      likeCount: 0,
      isLiked: false,
      replies: []
    }
    comments.value.unshift(newComment)
  }
  
  commentText.value = ''
  replyTo.value = null
}

const formatLikeCount = (count) => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k'
  }
  return count
}

const toggleLike = (comment) => {
  // 如果正在动画中，不响应点击
  if (comment.isAnimating) return

  // 切换点赞状态
  comment.isLiked = !comment.isLiked
  comment.likeCount += comment.isLiked ? 1 : -1

  // 添加动画标记
  comment.isAnimating = true
  setTimeout(() => {
    comment.isAnimating = false
  }, 300) // 动画持续时间为 300ms
}

const commentCount = computed(() => {
  let count = comments.value.length
  comments.value.forEach(comment => {
    if (comment.replies) {
      count += comment.replies.length
    }
  })
  return count
})

// 下拉关闭相关
const touchStartY = ref(0)
const currentTranslateY = ref(0)
const isDragging = ref(false)

const handleTouchStart = (e) => {
  touchStartY.value = e.touches[0].clientY
  isDragging.value = true
}

const handleTouchMove = (e) => {
  if (!isDragging.value) return
  
  const currentY = e.touches[0].clientY
  const diff = currentY - touchStartY.value
  
  // 只允许向下拖动
  if (diff > 0) {
    currentTranslateY.value = diff
    e.currentTarget.style.transform = `translateY(${diff}px)`
  }
}

const handleTouchEnd = (e) => {
  if (!isDragging.value) return
  
  const diff = e.changedTouches[0].clientY - touchStartY.value
  
  // 如果下拉距离超过100px，则关闭面板
  if (diff > 100) {
    closePanel()
  } else {
    // 否则恢复原位
    e.currentTarget.style.transform = 'translateY(0)'
  }
  
  isDragging.value = false
  currentTranslateY.value = 0
}
</script>

<style scoped>
.comment-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.comment-panel {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 70vh;
  background-color: #fff;
  transform: translateY(100%);
  transition: transform 0.3s ease-out;
  display: flex;
  flex-direction: column;
  border-radius: 12px 12px 0 0;
}

.panel-show {
  transform: translateY(0);
}

.panel-header {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 1;
}

.drag-handle {
  width: 36px;
  height: 4px;
  background-color: #e0e0e0;
  border-radius: 2px;
  margin: 0 auto 8px;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #666;
  padding: 8px;
}

.comment-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: #fff;
  -webkit-overflow-scrolling: touch;
}

.comment-item {
  display: flex;
  margin-bottom: 24px;
  position: relative;
}

.avatar {
  width: 40px;
  height: 40px;
  margin-right: 12px;
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid #eee;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.comment-content {
  flex: 1;
  margin-right: 40px;
}

.username {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #333;
}

.text {
  font-size: 15px;
  line-height: 1.5;
  margin-bottom: 8px;
  color: #333;
}

.meta {
  font-size: 13px;
  color: #999;
  display: flex;
  align-items: center;
}

.time {
  margin-right: 16px;
}

.reply-btn {
  color: #666;
  cursor: pointer;
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.reply-btn:hover, .reply-btn:active {
  background-color: #f0f0f0;
  color: #333;
}

.replies {
  margin-top: 12px;
  padding: 12px;
  background-color: #f8f8f8;
  border-radius: 8px;
}

.reply-item {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.reply-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.reply-content {
  display: flex;
  align-items: flex-start;
  gap: 4px;
}

.reply-username {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.reply-text {
  font-size: 14px;
  line-height: 1.4;
  color: #333;
}

.reply-meta {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  display: flex;
  align-items: center;
}

.like-wrapper {
  position: absolute;
  right: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.like-icon {
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
  user-select: none;
  font-size: 24px;
  padding: 4px;
}

.like-icon.liked {
  color: #ff2c55;
}

.like-icon.like-animation {
  animation: likeAnimation 0.3s ease;
}

.like-count {
  font-size: 13px;
  color: #999;
  margin-top: 4px;
  transition: color 0.2s;
}

.like-count.liked {
  color: #ff2c55;
}

.comment-input {
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  background-color: #fff;
  position: sticky;
  bottom: 0;
  z-index: 1;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.comment-input input {
  flex: 1;
  height: 40px;
  padding: 0 16px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  margin-right: 12px;
  font-size: 14px;
  background-color: #f5f5f5;
}

.comment-input input:focus {
  outline: none;
  border-color: #ff2c55;
  background-color: #fff;
}

.submit-btn {
  padding: 0 20px;
  height: 40px;
  border: none;
  border-radius: 20px;
  background-color: #f0f0f0;
  color: #999;
  font-size: 14px;
  cursor: not-allowed;
  transition: all 0.2s;
  font-weight: 500;
  white-space: nowrap;
}

.submit-btn.active {
  background-color: #ff2c55;
  color: #fff;
  cursor: pointer;
}

.submit-btn.active:active {
  opacity: 0.9;
}

.no-comment {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
}

.empty-icon {
  font-size: 48px;
  color: #ccc;
  margin-bottom: 16px;
}

.empty-text {
  color: #999;
  font-size: 14px;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: #999;
  font-size: 14px;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  margin-right: 8px;
  border: 2px solid #f0f0f0;
  border-top-color: #ff2c55;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.no-more {
  text-align: center;
  padding: 16px;
  color: #999;
  font-size: 14px;
}

@keyframes likeAnimation {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 自定义滚动条样式 */
.comment-list::-webkit-scrollbar {
  width: 4px;
}

.comment-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.comment-list::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 2px;
}

.comment-list::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style> 