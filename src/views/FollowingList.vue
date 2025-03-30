<template>
  <div class="following-container">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <div class="back-btn" @click="router.back()">
        <span class="material-icons">arrow_back</span>
      </div>
      <h1>{{ isCurrentUser ? '我的关注' : `${username}的关注` }}</h1>
      <div class="nav-actions"></div>
    </div>

    <!-- 关注列表 -->
    <div class="following-list" v-if="following.length > 0">
      <div class="following-item" v-for="followUser in following" :key="followUser.id">
        <div class="following-avatar" @click="goToUserProfile(followUser.id)">
          <img :src="followUser.avatar" :alt="followUser.username">
        </div>
        <div class="following-info" @click="goToUserProfile(followUser.id)">
          <div class="following-name">{{ followUser.username }}</div>
          <div class="following-bio">{{ followUser.bio }}</div>
        </div>
        <div class="follow-action">
          <button 
            class="follow-btn followed" 
            @click="toggleFollow(followUser)"
          >
            已关注
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-else>
      <span class="material-icons">person_outline</span>
      <p>{{ isCurrentUser ? '你还没有关注任何人' : `${username}还没有关注任何人` }}</p>
      <button class="action-btn" v-if="isCurrentUser" @click="router.push('/short-video')">
        <span class="material-icons">explore</span>
        去探索
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const userId = route.params.id
const user = JSON.parse(localStorage.getItem('user') || '{}')
const isCurrentUser = computed(() => !userId || userId === user.id)
const username = ref('')
const following = ref([])

// 获取用户名
onMounted(() => {
  // 在实际应用中，这里应该从API获取用户信息
  if (isCurrentUser.value) {
    username.value = user.username || '我'
  } else {
    username.value = '用户' + userId
  }
  
  // 获取关注列表
  fetchFollowing()
})

// 获取关注列表
const fetchFollowing = () => {
  // 这里应该从API获取关注列表
  // 模拟API返回数据
  const mockFollowing = Array.from({ length: 15 }, (_, index) => ({
    id: 'following_' + (index + 1),
    username: '用户' + (index + 1),
    avatar: 'https://randomuser.me/api/portraits/' + (index % 2 ? 'women' : 'men') + '/' + (index + 1) + '.jpg',
    bio: '这是用户' + (index + 1) + '的个人简介',
    isFollowed: true
  }))
  
  following.value = mockFollowing
}

// 跳转到用户资料页
const goToUserProfile = (id) => {
  // 检查是否为当前用户
  if (id === user.id) {
    router.push('/profile')
  } else {
    router.push(`/user/${id}`)
  }
}

// 取消关注用户
const toggleFollow = (followUser) => {
  if (!user.isLoggedIn) {
    router.push({
      path: '/login',
      query: { from: route.fullPath }
    })
    return
  }
  
  // 从关注列表中移除
  following.value = following.value.filter(item => item.id !== followUser.id)
  
  // 这里应该调用API更新关注状态
  console.log('取消关注用户:', followUser.id)
}
</script>

<style scoped>
.following-container {
  min-height: 100vh;
  background-color: #1a1a1a;
  color: #ffffff;
  padding-bottom: 60px;
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

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
}

.back-btn:active {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-bar h1 {
  font-size: 18px;
  font-weight: 600;
  color: #d4af37;
  margin: 0;
  flex-grow: 1;
  text-align: center;
}

.following-list {
  padding: 72px 16px 16px;
}

.following-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.following-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12px;
  cursor: pointer;
}

.following-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.following-info {
  flex-grow: 1;
  overflow: hidden;
  cursor: pointer;
}

.following-name {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
  color: #ffffff;
}

.following-bio {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.follow-btn {
  background: linear-gradient(135deg, #d4af37, #e5c158);
  border: none;
  border-radius: 20px;
  padding: 6px 16px;
  color: #000;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.follow-btn.followed {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.follow-btn:active {
  transform: scale(0.95);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 0;
  color: rgba(255, 255, 255, 0.6);
}

.empty-state .material-icons {
  font-size: 64px;
  margin-bottom: 20px;
  color: rgba(212, 175, 55, 0.5);
}

.empty-state p {
  font-size: 16px;
  margin-bottom: 20px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #d4af37, #e5c158);
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  color: #000;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:active {
  transform: scale(0.95);
}
</style> 