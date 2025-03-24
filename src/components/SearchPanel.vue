<template>
  <div class="search-panel" v-if="modelValue">
    <div class="search-header">
      <div class="search-input">
        <span class="material-icons">search</span>
        <input 
          type="text" 
          :placeholder="t('search.placeholder')"
          v-model="searchQuery"
          @keyup.enter="handleSearch"
          ref="searchInput"
          @input="onInput"
          >
          <span 
            v-if="searchQuery" 
            class="clear-icon material-icons"
            @click="clearInput"
          >close</span>
       
      </div>
      <span class="cancel-btn" @click="$emit('update:modelValue', false)">{{ t('common.cancel') }}</span>
    </div>

    <!-- 搜索历史 -->
    <div class="search-history" v-if="searchHistory.length > 0">
      <div class="section-header">
        <span class="title">{{ t('search.history') }}</span>
        <span class="clear-btn" @click="clearHistory">
          <span class="material-icons">delete</span>
        </span>
      </div>
      <div class="history-list">
        <div 
          v-for="(item, index) in searchHistory" 
          :key="index"
          class="history-item"
          @click="handleHistoryClick(item)"
        >
          <span class="material-icons">history</span>
          <span class="text">{{ item }}</span>
        </div>
      </div>
    </div>

    <!-- 热门搜索 -->
    <div class="hot-searches">
      <div class="section-header">
        <span class="title">{{ t('search.hot') }}</span>
      </div>
      <div class="hot-list">
        <div 
          v-for="(item, index) in hotSearches" 
          :key="index"
          class="hot-item"
          @click="handleHotClick(item)"
        >
          <span class="rank" :class="{ 'top': index < 3 }">{{ index + 1 }}</span>
          <span class="text">{{ item }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'search'])

const searchQuery = ref('')
const searchInput = ref(null)
const searchHistory = ref(JSON.parse(localStorage.getItem('searchHistory') || '[]'))
const hotSearches = ref([
  '热门视频1',
  '热门视频2',
  '热门视频3',
  '热门视频4',
  '热门视频5'
])

// 监听面板显示状态，自动聚焦输入框
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      searchInput.value?.focus()
    }, 100)
  }
})

// 处理搜索
const handleSearch = () => {
  if (!searchQuery.value.trim()) return
  addToHistory(searchQuery.value)
  emit('search', searchQuery.value)
  emit('update:modelValue', false)
}
// 清空输入框
const clearInput = () => {
  searchQuery.value = ''
  searchInput.value?.focus()
}

// 输入框内容变化时的处理
const onInput = () => {
  // 可以在这里添加实时搜索或其他逻辑
}
// 处理历史记录点击
const handleHistoryClick = (query) => {
  searchQuery.value = query
  handleSearch()
}

// 处理热门搜索点击
const handleHotClick = (query) => {
  searchQuery.value = query
  handleSearch()
}

// 添加到历史记录
const addToHistory = (query) => {
  const history = searchHistory.value
  const index = history.indexOf(query)
  if (index > -1) {
    history.splice(index, 1)
  }
  history.unshift(query)
  if (history.length > 10) {
    history.pop()
  }
  localStorage.setItem('searchHistory', JSON.stringify(history))
}

// 清空历史记录
const clearHistory = () => {
  searchHistory.value = []
  localStorage.removeItem('searchHistory')
}
</script>

<style scoped>
.search-panel {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.search-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
}

.search-input {
  flex: 1;
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 8px 12px;
  margin-right: 12px;
}

.search-input .material-icons {
  color: #999;
  font-size: 20px;
  margin-right: 8px;
}

.search-input input {
  flex: 1;
  background: none;
  border: none;
  font-size: 16px;
  outline: none;
}

.cancel-btn {
  color: #666;
  font-size: 16px;
  padding: 8px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.section-header .title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.clear-btn {
  color: #999;
  cursor: pointer;
}

.history-list, .hot-list {
  padding: 8px 0;
}

.history-item, .hot-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
}

.history-item:hover, .hot-item:hover {
  background: #f5f5f5;
}

.history-item .material-icons {
  color: #999;
  font-size: 20px;
  margin-right: 12px;
}

.history-item .text, .hot-item .text {
  font-size: 16px;
  color: #333;
}

.hot-item .rank {
  width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  border-radius: 50%;
  background: #f5f5f5;
  color: #999;
  font-size: 14px;
  margin-right: 12px;
}

.hot-item .rank.top {
  background: #ff3040;
  color: #fff;
}
</style> 