<template>
  <teleport to="body">
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
            <span class="close-btn" @click="closePanel">×</span>
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
                  <span class="reply-btn" @click.stop="handleReply(comment)">回复</span>
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
                      <span class="reply-btn" @click.stop="handleReply(reply)">回复</span>
                    </div>
                  </div>
                </div>
              </div>
              <!-- 点赞 -->
              <div class="like-wrapper">
                <span 
                  class="material-icons like-icon" 
                  :class="{ 'liked': comment.isLiked }" 
                  @click.stop="toggleLike(comment)"
                >
                  {{ comment.isLiked ? 'favorite' : 'favorite_border' }}
                </span>
                <span class="like-count" :class="{ 'liked': comment.isLiked }">
                  {{ formatLikeCount(comment.likeCount) }}
                </span>
              </div>
            </div>
          </template>
        </div>

        <!-- 评论输入区域 -->
        <div class="comment-input-wrapper">
          <div class="comment-input">
            <input 
              type="text" 
              v-model="commentText"
              :placeholder="placeholder"
              @keyup.enter="submitComment"
              ref="commentInputRef"
              @focus="handleInputFocus"
            >
            <button 
              class="submit-btn"
              :class="{ 'active': commentText.trim() }"
              @click.stop="submitComment"
            >发送</button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
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
  commentText.value = ''
  
  // 使用 nextTick 确保在 DOM 更新后再聚焦
  nextTick(() => {
    if (commentInputRef.value) {
      commentInputRef.value.focus()
    }
  })
}

const submitComment = () => {
  if (!commentText.value.trim()) return
  
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

// 修改输入框焦点处理
const handleInputFocus = () => {
  // 延迟执行以确保键盘完全弹出
  setTimeout(() => {
    if (commentInputRef.value) {
      commentInputRef.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, 300)
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
  z-index: 99999;
  isolation: isolate;
}

.comment-panel {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 60vh;
  background-color: #fff;
  transform: translateY(100%);
  transition: transform 0.3s ease-out;
  display: flex;
  flex-direction: column;
  border-radius: 12px 12px 0 0;
  overflow: hidden;
  z-index: 100000;
  isolation: isolate;
}

.panel-show {
  transform: translateY(0);
}

.panel-header {
  padding: 8px 16px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fff;
  position: relative;
  z-index: 2;
}

.drag-handle {
  width: 36px;
  height: 4px;
  background-color: #e0e0e0;
  border-radius: 2px;
  margin: 0 auto 8px;
}

.header-content {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  height: 44px;
}

.title {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.close-btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  font-size: 24px;
  color: #666;
  padding: 8px;
  cursor: pointer;
}

.comment-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  padding-bottom: calc(70px + env(safe-area-inset-bottom));
  background-color: #fff;
  -webkit-overflow-scrolling: touch;
  position: relative;
  z-index: 1;
}

.comment-item {
  display: flex;
  margin-bottom: 20px;
  position: relative;
}

.avatar {
  width: 36px;
  height: 36px;
  margin-right: 12px;
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
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
  font-size: 14px;
  font-weight: 500;
  color: #666;
  margin-bottom: 4px;
}

.text {
  font-size: 15px;
  line-height: 1.4;
  color: #333;
  margin-bottom: 8px;
}

.meta {
  font-size: 12px;
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
  padding: 4px 8px;
}

.replies {
  margin-top: 12px;
  padding: 12px;
  background-color: #f8f8f8;
  border-radius: 8px;
}

.reply-item {
  margin-bottom: 12px;
}

.reply-item:last-child {
  margin-bottom: 0;
}

.reply-content {
  display: flex;
  align-items: flex-start;
  gap: 4px;
}

.reply-username {
  font-weight: 500;
  color: #666;
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
  font-size: 20px;
}

.like-icon.liked {
  color: #ff2c55;
}

.like-count {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.like-count.liked {
  color: #ff2c55;
}

.comment-input-wrapper {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #fff;
  z-index: 100001;
  border-top: 1px solid #f0f0f0;
  padding-bottom: env(safe-area-inset-bottom);
  isolation: isolate;
}

.comment-input {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: #fff;
  position: relative;
}

.comment-input input {
  flex: 1;
  height: 36px;
  padding: 0 16px;
  border: 1px solid #e0e0e0;
  border-radius: 18px;
  margin-right: 12px;
  font-size: 14px;
  background-color: #f5f5f5;
  outline: none;
  position: relative;
  z-index: 1;
}

.comment-input input:focus {
  border-color: #ff2c55;
  background-color: #fff;
}

.submit-btn {
  padding: 0 16px;
  height: 36px;
  border: none;
  border-radius: 18px;
  background-color: #f0f0f0;
  color: #999;
  font-size: 14px;
  cursor: not-allowed;
  transition: all 0.2s;
  position: relative;
  z-index: 1;
  min-width: 58px;
}

.submit-btn.active {
  background-color: #ff2c55;
  color: #fff;
  cursor: pointer;
}

.no-comment {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
}

.empty-icon {
  font-size: 40px;
  color: #ccc;
  margin-bottom: 8px;
}

.empty-text {
  color: #999;
  font-size: 14px;
}

/* 自定义滚动条样式 */
.comment-list::-webkit-scrollbar {
  width: 4px;
}

.comment-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.comment-list::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 2px;
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

@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .comment-panel {
    padding-bottom: env(safe-area-inset-bottom);
  }
}

@media screen and (max-width: 768px) {
  .comment-input-wrapper {
    position: fixed;
  }
  
  .comment-panel {
    height: 70vh;
  }
}

/* 添加新的样式规则 */
:deep(*) {
  box-sizing: border-box;
}
</style> 