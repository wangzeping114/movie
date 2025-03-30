<template>
  <div class="follow-container">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
        <div class="back-btn" @click="router.back()">
        <i class="material-icons">arrow_back</i>
      </div>
      <h1>{{ tabTitle }}</h1>
      <div class="nav-actions"></div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <div class="search-input">
        <i class="material-icons search-icon">search</i>
        <input 
          type="text" 
          v-model="searchQuery" 
          :placeholder="activeTab === 'followers' ? '搜索粉丝' : '搜索关注'" 
          @input="filterUsers"
        >
        <i class="material-icons clear-icon" @click="clearSearch" v-if="searchQuery">close</i>
      </div>
    </div>

    <!-- 标签切换 -->
    <div class="tabs">
      <div 
        class="tab" 
        :class="{ 'active': activeTab === 'followers' }" 
        @click="activeTab = 'followers'"
      >
        粉丝 {{ formatNumber(followers.length) }}
      </div>
      <div 
        class="tab" 
        :class="{ 'active': activeTab === 'following' }" 
        @click="activeTab = 'following'"
      >
        关注 {{ formatNumber(following.length) }}
      </div>
    </div>

    <!-- 滚动容器 -->
    <div class="user-list-container" ref="scrollContainer" @scroll="handleScroll" v-if="filteredUsers.length > 0">
      <!-- 粉丝列表 -->
      <div class="user-list" v-if="activeTab === 'followers'">
        <div class="user-item" v-for="user in filteredUsers" :key="user.id">
          <div class="user-avatar" @click="goToUserProfile(user.id)">
            <img :src="user.avatar" :alt="user.username">
          </div>
          <div class="user-info" @click="goToUserProfile(user.id)">
            <div class="user-name">{{ user.username }}</div>
            <div class="user-bio">{{ user.bio }}</div>
          </div>
          <div class="follow-action">
            <button 
              class="follow-btn" 
              :class="{ 'followed': user.isFollowed }" 
              @click="toggleFollow(user)"
              v-if="!isCurrentUser || !user.isCurrentUser"
            >
              {{ user.isFollowed ? '已关注' : '关注' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 关注列表 -->
      <div class="user-list" v-if="activeTab === 'following'">
        <div class="user-item" v-for="user in filteredUsers" :key="user.id">
          <div class="user-avatar" @click="goToUserProfile(user.id)">
            <img :src="user.avatar" :alt="user.username">
          </div>
          <div class="user-info" @click="goToUserProfile(user.id)">
            <div class="user-name">{{ user.username }}</div>
            <div class="user-bio">{{ user.bio }}</div>
          </div>
          <div class="follow-action">
            <button 
              class="follow-btn followed" 
              @click="toggleFollow(user)"
            >
              已关注
            </button>
          </div>
        </div>
      </div>

      <!-- 加载更多指示器 -->
      <div class="loading-more" v-if="isLoading && !searchQuery">
        <div class="loading-spinner"></div>
        <span>加载更多...</span>
      </div>

      <!-- 全部加载完毕提示 -->
      <div class="load-all" v-if="loadedAll && !searchQuery">
        <span>已经加载全部</span>
      </div>
    </div>

    <!-- 空状态 - 无搜索结果 -->
    <div class="empty-state" v-if="searchQuery && filteredUsers.length === 0">
      <i class="material-icons">search_off</i>
      <p>未找到匹配的用户</p>
    </div>

    <!-- 空状态 - 无粉丝 -->
    <div class="empty-state" v-else-if="activeTab === 'followers' && followers.length === 0">
      <i class="material-icons">people_outline</i>
      <p>{{ isCurrentUser ? '还没有人关注你' : `还没有人关注${username}` }}</p>
    </div>

    <!-- 空状态 - 无关注 -->
    <div class="empty-state" v-else-if="activeTab === 'following' && following.length === 0">
      <i class="material-icons">person_outline</i>
      <p>{{ isCurrentUser ? '你还没有关注任何人' : `${username}还没有关注任何人` }}</p>
      <button class="action-btn" v-if="isCurrentUser" @click="router.push('/short-video')">
        <i class="material-icons">explore</i>
        去探索
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const userId = route.params.id
const initialTab = route.query.tab || 'followers'
const user = JSON.parse(localStorage.getItem('user') || '{}')
const isCurrentUser = computed(() => !userId || userId === user.id)
const username = ref('')
const followers = ref([])
const following = ref([])
const activeTab = ref(initialTab)
const searchQuery = ref('')
const filteredUsers = ref([])
const scrollContainer = ref(null)
const isLoading = ref(false)
const loadedAll = ref(false)

// 计算标题
const tabTitle = computed(() => {
  if (activeTab.value === 'followers') {
    return isCurrentUser.value ? '我的粉丝' : `${username.value}的粉丝`
  } else {
    return isCurrentUser.value ? '我的关注' : `${username.value}的关注`
  }
})

// 获取用户名
onMounted(() => {
  // 在实际应用中，这里应该从API获取用户信息
  if (isCurrentUser.value) {
    username.value = user.username || '我'
  } else {
    username.value = '用户' + userId
  }
  
  // 获取粉丝和关注列表
  fetchFollowers()
  fetchFollowing()
  
  // 确保滚动容器正确初始化
  setTimeout(() => {
    if (scrollContainer.value) {
      // 手动触发一次滚动事件以检查是否需要加载更多
      handleScroll({ target: scrollContainer.value });
    }
  }, 500);
})

// 监听 activeTab 变化，更新过滤后的用户列表
watch(activeTab, () => {
  loadedAll.value = false;
  isLoading.value = false;
  filterUsers()
})

// 监听搜索查询变化
watch(searchQuery, () => {
  // 当用户开始搜索时，不显示加载更多和加载完毕
  if (searchQuery.value) {
    isLoading.value = false;
  }
})

// 获取粉丝列表
const fetchFollowers = () => {
  // 这里应该从API获取粉丝列表
  // 模拟API返回数据
  const mockFollowers = Array.from({ length: 20 }, (_, index) => ({
    id: 'follower_' + (index + 1),
    username: '用户' + (index + 1),
    avatar: 'https://randomuser.me/api/portraits/' + (index % 2 ? 'women' : 'men') + '/' + (index + 1) + '.jpg',
    bio: '这是用户' + (index + 1) + '的个人简介',
    isFollowed: Math.random() > 0.5,
    isCurrentUser: index === 0 && isCurrentUser.value
  }))
  
  followers.value = mockFollowers
  
  // 如果当前标签是粉丝，则更新过滤后的用户列表
  if (activeTab.value === 'followers') {
    filterUsers()
  }
}

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
  
  // 如果当前标签是关注，则更新过滤后的用户列表
  if (activeTab.value === 'following') {
    filterUsers()
  }
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

// 关注/取消关注用户
const toggleFollow = (userItem) => {
  if (!user.isLoggedIn) {
    router.push({
      path: '/login',
      query: { from: route.fullPath }
    })
    return
  }
  
  if (activeTab.value === 'followers') {
    // 更新关注状态
    userItem.isFollowed = !userItem.isFollowed
    
    // 这里应该调用API更新关注状态
    console.log(`${userItem.isFollowed ? '关注' : '取消关注'}用户:`, userItem.id)
  } else {
    // 从关注列表中移除
    following.value = following.value.filter(item => item.id !== userItem.id)
    filteredUsers.value = filteredUsers.value.filter(item => item.id !== userItem.id)
    
    // 这里应该调用API更新关注状态
    console.log('取消关注用户:', userItem.id)
  }
}

// 过滤用户
const filterUsers = () => {
  const currentList = activeTab.value === 'followers' ? followers.value : following.value
  
  if (!searchQuery.value) {
    filteredUsers.value = currentList
    return
  }
  
  const query = searchQuery.value.toLowerCase()
  filteredUsers.value = currentList.filter(userItem => 
    userItem.username.toLowerCase().includes(query) || 
    userItem.bio.toLowerCase().includes(query)
  )
}

// 清除搜索
const clearSearch = () => {
  searchQuery.value = ''
  filterUsers()
}

// 工具函数：格式化数字
const formatNumber = (num) => {
  if (num === undefined || num === null) return '0';
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// 处理滚动事件
const handleScroll = (e) => {
  if (isLoading.value || loadedAll.value || searchQuery.value) return;
  
  const { scrollTop, scrollHeight, clientHeight } = e.target;
  
  // 当滚动到距离底部50px时触发加载
  if (scrollHeight - scrollTop - clientHeight < 50) {
    loadMoreData();
  }
}

// 加载更多数据
const loadMoreData = () => {
  if (isLoading.value || loadedAll.value) return;
  
  isLoading.value = true
  console.log('Loading more data...');
  
  // 模拟网络请求延迟
  setTimeout(() => {
    fetchMoreData()
  }, 1000)
}

// 获取更多数据
const fetchMoreData = () => {
  console.log('Fetching more data...');
  
  // 这里应该从API获取更多数据
  // 模拟API返回数据
  const currentList = activeTab.value === 'followers' ? followers.value : following.value
  const startIndex = currentList.length
  
  // 最多加载100条数据
  if (startIndex >= 100) {
    loadedAll.value = true
    isLoading.value = false
    return
  }
  
  const mockMoreData = Array.from({ length: 10 }, (_, index) => ({
    id: `${activeTab.value}_more_${startIndex + index + 1}`,
    username: `${activeTab.value === 'followers' ? '粉丝' : '关注'}用户${startIndex + index + 1}`,
    avatar: `https://randomuser.me/api/portraits/${index % 2 ? 'women' : 'men'}/${(startIndex + index + 1) % 30 || 30}.jpg`,
    bio: `这是${activeTab.value === 'followers' ? '粉丝' : '关注'}用户${startIndex + index + 1}的个人简介`,
    isFollowed: activeTab.value === 'following' ? true : Math.random() > 0.5,
    isCurrentUser: false
  }))
  
  if (activeTab.value === 'followers') {
    followers.value = [...followers.value, ...mockMoreData]
  } else {
    following.value = [...following.value, ...mockMoreData]
  }
  
  filterUsers()
  isLoading.value = false
  
  // 如果数据量达到100，显示全部加载完毕
  if ((activeTab.value === 'followers' ? followers.value.length : following.value.length) >= 100) {
    loadedAll.value = true
  }
}
</script>

<style scoped>
.follow-container {
  min-height: 100vh;
  background-color: #1a1a1a;
  color: #ffffff;
  padding-bottom: 60px;
  display: flex;
  flex-direction: column;
  position: relative;
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

.search-bar {
  padding: 72px 16px 8px;
  position: sticky;
  top: 0;
  background: #1a1a1a;
  z-index: 20;
}

.search-input {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 6px 12px;
}

.search-icon {
  color: rgba(255, 255, 255, 0.5);
  margin-right: 8px;
}

.clear-icon {
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
}

.search-input input {
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  flex: 1;
  height: 36px;
  font-size: 16px;
}

.search-input input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.tabs {
  display: flex;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 8px;
  position: sticky;
  top: 124px;
  background: #1a1a1a;
  z-index: 15;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  position: relative;
  font-size: 16px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
}

.tab.active {
  color: #d4af37;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 25%;
  width: 50%;
  height: 2px;
  background-color: #d4af37;
  border-radius: 1px;
}

.user-list-container {
  flex: 1;
  overflow-y: auto;
  height: calc(100vh - 190px);
  padding: 0 16px;
  margin-top: 8px;
}

.user-list {
  padding: 0;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12px;
  cursor: pointer;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  flex-grow: 1;
  overflow: hidden;
  cursor: pointer;
}

.user-name {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
  color: #ffffff;
}

.user-bio {
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

.loading-more, .load-all {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 0;
  color: rgba(255, 255, 255, 0.6);
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(212, 175, 55, 0.3);
  border-top: 2px solid #d4af37;
  border-radius: 50%;
  margin-right: 10px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 