<template>
  <div class="chat-panel">
    <!-- 聊天头部 -->
    <div class="chat-header">
      <div class="header-left">
        <i class="material-icons" @click="$emit('close')">arrow_back</i>
        <div class="user-info">
          <img :src="targetUser.avatar" :alt="targetUser.name" class="avatar">
          <div class="user-detail">
            <div class="name">{{ targetUser.name }}</div>
            <div class="status">{{ targetUser.online ? $t('message.online') : $t('message.offline') }}</div>
          </div>
        </div>
      </div>
      <div class="header-right">
        <i class="material-icons">more_vert</i>
      </div>
    </div>

    <!-- 消息列表 -->
    <div class="message-list" ref="messageList" @scroll="handleScroll">
      <div v-if="messages.length === 0" class="no-messages">
        {{ $t('message.noMessages') }}
      </div>
      <div v-else v-for="message in messages" :key="message.id" 
           :class="['message-item', message.isSelf ? 'self' : 'other']">
        <div class="message-content">
          <div class="message-text">{{ message.content }}</div>
          <div class="message-time">{{ formatTime(message.timestamp) }}</div>
        </div>
        <img :src="message.avatar" :alt="message.name" class="avatar">
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <div class="input-wrapper">
        <i class="material-icons">emoji_emotions</i>
        <input 
          type="text" 
          v-model="inputMessage" 
          :placeholder="$t('message.sendMessage')"
          @keyup.enter="sendMessage"
          ref="messageInput"
        >
        <i class="material-icons">image</i>
      </div>
      <div class="send-btn" @click="sendMessage">
        <i class="material-icons">send</i>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { HubConnectionBuilder } from '@microsoft/signalr'
import { debounce } from 'lodash-es'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  targetUser: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])
const { t } = useI18n()

// 状态管理
const messages = ref([])
const inputMessage = ref('')
const messageList = ref(null)
const messageInput = ref(null)
const connection = ref(null)
const page = ref(1)
const hasMore = ref(true)
const isLoading = ref(false)

// 初始化 WebSocket 连接
const initConnection = async () => {
  try {
    connection.value = new HubConnectionBuilder()
      .withUrl('/chathub')
      .withAutomaticReconnect()
      .build()

    // 监听消息
    connection.value.on('ReceiveMessage', (userId, message) => {
      if (userId === props.targetUser.id) {
        addMessage({
          id: Date.now(),
          content: message,
          timestamp: new Date(),
          isSelf: false,
          avatar: props.targetUser.avatar,
          name: props.targetUser.name
        })
      }
    })

    await connection.value.start()
    console.log('WebSocket 连接成功')
  } catch (err) {
    console.error('WebSocket 连接失败:', err)
  }
}

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim()) return

  try {
    const message = {
      id: Date.now(),
      content: inputMessage.value,
      timestamp: new Date(),
      isSelf: true,
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg', // 当前用户头像
      name: '我'
    }

    await connection.value.invoke('SendMessage', props.targetUser.id, inputMessage.value)
    addMessage(message)
    inputMessage.value = ''
  } catch (err) {
    console.error('发送消息失败:', err)
  }
}

// 添加消息到列表
const addMessage = (message) => {
  messages.value.push(message)
  scrollToBottom()
}

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (messageList.value) {
    messageList.value.scrollTop = messageList.value.scrollHeight
  }
}

// 加载历史消息
const loadHistoryMessages = async () => {
  if (isLoading.value || !hasMore.value) return

  isLoading.value = true
  try {
    // 模拟加载历史消息
    const newMessages = Array.from({ length: 10 }, (_, i) => ({
      id: Date.now() - i,
      content: `历史消息 ${i + 1}`,
      timestamp: new Date(Date.now() - i * 1000 * 60),
      isSelf: Math.random() > 0.5,
      avatar: Math.random() > 0.5 ? props.targetUser.avatar : 'https://randomuser.me/api/portraits/men/1.jpg',
      name: Math.random() > 0.5 ? props.targetUser.name : '我'
    }))

    messages.value.unshift(...newMessages)
    page.value++
    hasMore.value = newMessages.length === 10
  } catch (err) {
    console.error('加载历史消息失败:', err)
  } finally {
    isLoading.value = false
  }
}

// 处理滚动事件
const handleScroll = debounce(() => {
  if (messageList.value.scrollTop === 0) {
    loadHistoryMessages()
  }
}, 300)

// 格式化时间
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// 生命周期钩子
onMounted(() => {
  initConnection()
  loadHistoryMessages()
})

onUnmounted(() => {
  if (connection.value) {
    connection.value.stop()
  }
})
</script>

<style scoped>
.chat-panel {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-detail {
  display: flex;
  flex-direction: column;
}

.name {
  font-size: 16px;
  font-weight: 500;
}

.status {
  font-size: 12px;
  color: #666;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  max-width: 70%;
}

.message-item.self {
  margin-left: auto;
  flex-direction: row-reverse;
}

.message-content {
  background-color: #fff;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message-item.self .message-content {
  background-color: #007AFF;
  color: #fff;
}

.message-text {
  font-size: 14px;
  line-height: 1.4;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.message-item.self .message-time {
  color: rgba(255, 255, 255, 0.8);
}

.input-area {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #fff;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
}

.input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 20px;
  padding: 8px 12px;
  margin-right: 12px;
}

.input-wrapper input {
  flex: 1;
  border: none;
  background: none;
  outline: none;
  padding: 0 8px;
  font-size: 14px;
}

.send-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #007AFF;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
}

.send-btn:hover {
  background-color: #0056b3;
}

.material-icons {
  font-size: 24px;
  color: #666;
  cursor: pointer;
}

.input-wrapper .material-icons {
  font-size: 20px;
}

.no-messages {
  text-align: center;
  color: #999;
  padding: 20px;
  font-size: 14px;
}
</style> 