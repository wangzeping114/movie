<template>
  <div class="settings-panel">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <span class="material-icons back-icon" @click="goBack">arrow_back</span>
      <span class="nav-title">{{ t('settings.title') }}</span>
    </div>

    <div class="settings-content">
      <!-- 通用设置 -->
      <div class="settings-group">
        <div class="settings-item" @click="showThemeSettings">
          <span class="item-label">{{ t('settings.theme') }}</span>
          <div class="item-right">
            <span class="item-value">{{ t(`themes.${themeStore.currentTheme}`) }}</span>
            <span class="material-icons">chevron_right</span>
          </div>
        </div>
        <div class="settings-item" @click="showLanguageSettings">
          <span class="item-label">{{ t('settings.language') }}</span>
          <div class="item-right">
            <span class="item-value">{{ currentLocale === 'zh-CN' ? '简体中文' : 'English' }}</span>
            <span class="material-icons">chevron_right</span>
          </div>
        </div>
      </div>

      <!-- 隐私设置 -->
      <div class="settings-group">
        <div class="settings-item">
          <span class="item-label">{{ t('privacy.privateAccount') }}</span>
          <div class="switch">
            <input type="checkbox" id="private-account" v-model="privacySettings.isPrivate">
            <label for="private-account"></label>
          </div>
        </div>
        <div class="settings-item">
          <span class="item-label">{{ t('privacy.allowComments') }}</span>
          <div class="switch">
            <input type="checkbox" id="allow-comments" v-model="privacySettings.allowComments">
            <label for="allow-comments"></label>
          </div>
        </div>
        <div class="settings-item">
          <span class="item-label">{{ t('privacy.allowDownload') }}</span>
          <div class="switch">
            <input type="checkbox" id="allow-download" v-model="privacySettings.allowDownload">
            <label for="allow-download"></label>
          </div>
        </div>
        <div class="settings-item">
          <span class="item-label">{{ t('privacy.allowLikes') }}</span>
          <div class="switch">
            <input type="checkbox" id="allow-likes" v-model="privacySettings.allowLikes">
            <label for="allow-likes"></label>
          </div>
        </div>
      </div>

      <!-- 帮助与支持 -->
      <div class="settings-group">
        <div class="settings-item" @click="showHelpCenter">
          <span class="item-label">{{ t('settings.help') }}</span>
          <span class="material-icons">chevron_right</span>
        </div>
        <div class="settings-item" @click="showAbout">
          <span class="item-label">{{ t('settings.about') }}</span>
          <span class="material-icons">chevron_right</span>
        </div>
      </div>

      <!-- 退出登录 -->
      <div class="logout-section">
        <button class="logout-btn" @click="handleLogout">
          {{ t('settings.logout') }}
        </button>
      </div>
    </div>

    <!-- 主题选择弹窗 -->
    <div v-if="showThemeSelector" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <span class="modal-title">{{ t('settings.theme') }}</span>
          <span class="material-icons close-icon" @click="showThemeSelector = false">close</span>
        </div>
        <div class="theme-list">
          <div 
            v-for="(theme, key) in themeStore.themes" 
            :key="key"
            class="theme-item"
            :class="{ active: themeStore.currentTheme === key }"
            @click="selectTheme(key)"
          >
            <div class="theme-preview" :style="{ background: theme.gradient }"></div>
            <span class="theme-name">{{ t(`themes.${key}`) }}</span>
            <span class="material-icons check-icon" v-if="themeStore.currentTheme === key">check</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 语言选择弹窗 -->
    <div v-if="showLanguageSelector" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <span class="modal-title">{{ t('settings.language') }}</span>
          <span class="material-icons close-icon" @click="showLanguageSelector = false">close</span>
        </div>
        <div class="language-list">
          <div 
            class="language-item"
            :class="{ active: currentLocale === 'zh-CN' }"
            @click="selectLanguage('zh-CN')"
          >
            <div class="language-flag">🇨🇳</div>
            <span class="language-name">简体中文</span>
            <span class="material-icons check-icon" v-if="currentLocale === 'zh-CN'">check</span>
          </div>
          <div 
            class="language-item"
            :class="{ active: currentLocale === 'en-US' }"
            @click="selectLanguage('en-US')"
          >
            <div class="language-flag">🇺🇸</div>
            <span class="language-name">English</span>
            <span class="material-icons check-icon" v-if="currentLocale === 'en-US'">check</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '../stores/theme'
import { useRouter } from 'vue-router'

const router = useRouter()
const { t, locale } = useI18n()
const themeStore = useThemeStore()
const currentLocale = computed(() => locale.value)

// 弹窗控制
const showThemeSelector = ref(false)
const showLanguageSelector = ref(false)

// 隐私设置
const privacySettings = ref({
  isPrivate: false,
  allowComments: true,
  allowDownload: false,
  allowLikes: true
})

// 返回个人主页
const goBack = () => {
  router.push('/profile')
}

// 显示主题设置
const showThemeSettings = () => {
  showThemeSelector.value = true
}

// 显示语言设置
const showLanguageSettings = () => {
  showLanguageSelector.value = true
}

// 选择主题
const selectTheme = (theme) => {
  themeStore.setTheme(theme)
  showThemeSelector.value = false
}

// 选择语言
const selectLanguage = (lang) => {
  locale.value = lang
  localStorage.setItem('locale', lang)
  showLanguageSelector.value = false
}

// 显示帮助中心
const showHelpCenter = () => {
  // TODO: 实现帮助中心页面跳转
}

// 显示关于我们
const showAbout = () => {
  // TODO: 实现关于我们页面跳转
}

// 处理退出登录
const handleLogout = () => {
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style scoped>
.settings-panel {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--background-color);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  transform: translateX(0);
  transition: transform 0.3s ease;
}

/* 导航栏样式 */
.nav-bar {
  display: flex;
  align-items: center;
  padding: 16px;
  background: var(--surface-color);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 1;
}

.back-icon {
  font-size: 24px;
  color: var(--text-color);
  cursor: pointer;
  margin-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.back-icon:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-title {
  font-size: 18px;
  font-weight: 500;
  color: var(--text-color);
}

/* 内容区域样式 */
.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  -webkit-overflow-scrolling: touch;
}

.settings-group {
  margin-bottom: 16px;
  background: var(--surface-color);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.3s;
}

.settings-item:active {
  background: rgba(255, 255, 255, 0.05);
}

.settings-item:last-child {
  border-bottom: none;
}

.item-label {
  font-size: 15px;
  color: var(--text-color);
}

.item-right {
  display: flex;
  align-items: center;
}

.item-value {
  font-size: 14px;
  color: var(--text-secondary-color);
  margin-right: 4px;
}

.material-icons {
  color: var(--text-secondary-color);
  font-size: 20px;
}

/* 开关样式 */
.switch {
  width: 44px;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  position: relative;
  cursor: pointer;
}

.switch input {
  display: none;
}

.switch label {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.switch label::before {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  top: 2px;
  left: 2px;
  transition: transform 0.3s;
}

.switch input:checked + label::before {
  transform: translateX(20px);
  background: var(--primary-color);
}

/* 退出登录按钮 */
.logout-section {
  padding: 16px;
  margin-top: auto;
}

.logout-btn {
  width: 100%;
  padding: 12px;
  background: rgba(255, 77, 77, 0.1);
  border: none;
  border-radius: 8px;
  color: #ff4d4d;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.logout-btn:active {
  background: rgba(255, 77, 77, 0.15);
}

/* 弹窗样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1001;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  width: 100%;
  background: var(--surface-color);
  border-radius: 12px 12px 0 0;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  background: var(--surface-color);
  z-index: 1;
}

.modal-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-color);
}

.close-icon {
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.close-icon:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* 主题列表样式 */
.theme-list {
  padding: 16px;
}

.theme-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.theme-item:active {
  background: rgba(255, 255, 255, 0.05);
}

.theme-item.active {
  background: rgba(212, 175, 55, 0.1);
}

.theme-preview {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  margin-right: 12px;
}

.theme-name {
  flex: 1;
  font-size: 15px;
  color: var(--text-color);
}

.check-icon {
  color: var(--primary-color);
}

/* 语言列表样式 */
.language-list {
  padding: 8px 0;
}

.language-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.language-item:active {
  background: rgba(255, 255, 255, 0.05);
}

.language-item.active {
  background: rgba(212, 175, 55, 0.1);
}

.language-flag {
  font-size: 20px;
  margin-right: 12px;
}

.language-name {
  flex: 1;
  font-size: 15px;
  color: var(--text-color);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style> 