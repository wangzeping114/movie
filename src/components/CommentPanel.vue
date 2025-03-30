<template>
  <div class="comment-wrapper" v-show="modelValue" @click.self="closePanel">
    <div class="comment-panel" :class="{ 'panel-show': modelValue }">
      <!-- 头部 -->
      <div class="panel-header">
        <span class="title">{{ commentCount }}条评论</span>
        <span class="close-btn material-icons" @click="closePanel($event)">close</span>
      </div>

      <!-- 评论列表 -->
      <div class="comment-list" ref="commentListRef">
        <div v-if="comments.length === 0" class="no-comment">
          还没有评论，快来抢沙发吧~
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
                <span class="reply-btn" @click="handleReply(comment, null, $event)">回复</span>
              </div>
              <!-- 回复列表 -->
              <div class="replies" v-if="comment.replies && comment.replies.length > 0">
                <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                  <div class="reply-user">{{ reply.username }}</div>
                  <div class="reply-text">{{ reply.content }}</div>
                  <div class="reply-meta">
                    <span class="time">{{ reply.time }}</span>
                    <span class="reply-btn" @click="handleReply(reply, comment, $event)">回复</span>
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
                @click="toggleLike(comment, $event)"
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

      <!-- 评论输入框 -->
      <div class="comment-input">
        <input 
          type="text" 
          v-model="commentText"
          :placeholder="placeholder"
          @keyup.enter="submitComment"
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
import { ref, computed, watch } from 'vue'

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

// 初始化一些示例评论（仅在组件首次加载时）
if (videoCommentsMap.value.size === 0) {
  videoCommentsMap.value.set('1', [
    {
      id: 1,
      username: '用户A',
      avatar: 'https://picsum.photos/50/50',
      content: '这个视频太棒了！',
      time: '2分钟前',
      likeCount: 128,
      isLiked: false,
      replies: [
        {
          id: 11,
          username: '用户B',
          content: '完全同意！',
          time: '1分钟前'
        }
      ]
    },
    {
      id: 2,
      username: '用户C',
      avatar: 'https://picsum.photos/50/50',
      content: '期待更新！',
      time: '5分钟前',
      likeCount: 56,
      isLiked: false,
      replies: []
    }
  ])
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

const commentText = ref('')
const replyTo = ref(null)
const placeholder = computed(() => {
  if (replyTo.value) {
    return '回复 @' + replyTo.value.username
  }
  return '说点什么...'
})

const closePanel = (event) => {
  // 阻止事件冒泡，防止触发视频切换
  if (event) {
    event.stopPropagation()
  }
  
  emit('update:modelValue', false)
  replyTo.value = null
  commentText.value = ''
}

const handleReply = (comment, parentComment = null, event) => {
  // 阻止事件冒泡，防止触发视频切换
  if (event) {
    event.stopPropagation()
  }
  
  replyTo.value = comment
  // 自动聚焦输入框
  document.querySelector('.comment-input input').focus()
}

const submitComment = () => {
  if (!commentText.value.trim()) return

  const currentComments = videoCommentsMap.value.get(props.videoId) || []

  if (replyTo.value) {
    // 处理回复
    const targetComment = currentComments.find(c => c.id === replyTo.value.id)
    if (targetComment) {
      if (!targetComment.replies) {
        targetComment.replies = []
      }
      targetComment.replies.push({
        id: Date.now(),
        username: '当前用户',
        content: commentText.value,
        time: '刚刚'
      })
    }
  } else {
    // 添加新评论
    const newComment = {
      id: Date.now(),
      username: '当前用户', // 这里应该使用实际的用户信息
      avatar: 'https://picsum.photos/50/50',
      content: commentText.value,
      time: '刚刚',
      likeCount: 0,
      isLiked: false,
      replies: []
    }
    currentComments.unshift(newComment)
  }

  // 更新 Map 中的评论数据
  videoCommentsMap.value.set(props.videoId, currentComments)
  
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

const toggleLike = (comment, event) => {
  // 阻止事件冒泡，防止触发视频切换
  if (event) {
    event.stopPropagation()
  }
  
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

  // 更新存储的评论数据
  const currentComments = videoCommentsMap.value.get(props.videoId)
  if (currentComments) {
    const index = currentComments.findIndex(c => c.id === comment.id)
    if (index !== -1) {
      currentComments[index] = comment
      videoCommentsMap.value.set(props.videoId, currentComments)
    }
  }
}

// 监听面板显示状态，当显示时滚动到顶部
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      const commentList = document.querySelector('.comment-list')
      if (commentList) {
        commentList.scrollTop = 0
      }
    }, 100)
  }
})
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
  border-radius: 12px 12px 0 0;
  transform: translateY(100%);
  transition: transform 0.3s ease-out;
  display: flex;
  flex-direction: column;
}

.panel-show {
  transform: translateY(0);
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 16px;
  font-weight: 600;
}

.close-btn {
  cursor: pointer;
  color: #666;
}

.comment-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.no-comment {
  text-align: center;
  color: #999;
  padding: 32px 0;
}

.comment-item {
  display: flex;
  margin-bottom: 20px;
  position: relative;
}

.avatar {
  width: 40px;
  height: 40px;
  margin-right: 12px;
  flex-shrink: 0;
}

.avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.comment-content {
  flex: 1;
  margin-right: 40px;
}

.username {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.text {
  font-size: 15px;
  line-height: 1.4;
  margin-bottom: 8px;
}

.meta {
  font-size: 12px;
  color: #999;
}

.time {
  margin-right: 16px;
}

.reply-btn {
  color: #666;
  cursor: pointer;
}

.reply-btn:hover {
  color: #333;
}

.replies {
  margin-top: 8px;
  padding: 8px;
  background-color: #f8f8f8;
  border-radius: 4px;
}

.reply-item {
  margin-bottom: 8px;
}

.reply-item:last-child {
  margin-bottom: 0;
}

.reply-user {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.reply-text {
  font-size: 14px;
  line-height: 1.4;
}

.reply-meta {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
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
}

.like-icon.liked {
  color: #ff2c55;
}

.like-icon.like-animation {
  animation: likeAnimation 0.3s ease;
}

.like-count {
  font-size: 12px;
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
}

.comment-input input {
  flex: 1;
  height: 36px;
  padding: 0 12px;
  border: 1px solid #e0e0e0;
  border-radius: 18px;
  margin-right: 12px;
  font-size: 14px;
}

.comment-input input:focus {
  outline: none;
  border-color: #666;
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
}

.submit-btn.active {
  background-color: #ff2c55;
  color: #fff;
  cursor: pointer;
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