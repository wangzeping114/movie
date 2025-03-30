<template>
  <div class="about-page">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <span class="material-icons back-icon" @click="goBack">arrow_back</span>
      <span class="nav-title">{{ t('about.title') }}</span>
    </div>

    <div class="about-content">
      <!-- 应用信息 -->
      <div class="app-info">
        <div class="app-logo">
          <img src="@/assets/images/logo.png" alt="Logo">
        </div>
        <h1 class="app-name">{{ t('about.appName') }}</h1>
        <p class="app-version">{{ t('about.version') }}</p>
      </div>

      <!-- 公司信息 -->
      <div class="section">
        <h2 class="section-title">{{ t('about.company') }}</h2>
        <div class="company-info">
          <p>{{ t('about.companyDesc') }}</p>
          <div class="company-stats">
            <div class="stat-item">
              <span class="stat-value">{{ t('about.userCount') }}</span>
              <span class="stat-label">{{ t('about.users') }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ t('about.videoCount') }}</span>
              <span class="stat-label">{{ t('about.videos') }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ t('about.countryCount') }}</span>
              <span class="stat-label">{{ t('about.countries') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 团队介绍 -->
      <div class="section">
        <h2 class="section-title">{{ t('about.team') }}</h2>
        <div class="team-list">
          <div class="team-member" v-for="(member, index) in teamMembers" :key="index">
            <img :src="member.avatar" :alt="member.name">
            <div class="member-info">
              <h3>{{ member.name }}</h3>
              <p>{{ member.role }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 社交媒体 -->
      <div class="section">
        <h2 class="section-title">{{ t('about.social') }}</h2>
        <div class="social-list">
          <div class="social-item" v-for="(social, index) in socialLinks" :key="index" @click="openSocialLink(social)">
            <span class="material-icons">{{ social.icon }}</span>
            <span>{{ social.name }}</span>
            <span class="material-icons">chevron_right</span>
          </div>
        </div>
      </div>

      <!-- 版权信息 -->
      <div class="copyright">
        <p>{{ t('about.copyright') }}</p>
        <p>{{ t('about.rights') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

// 返回设置页面
const goBack = () => {
  router.push('/settings')
}

// 团队成员数据
const teamMembers = ref([
  {
    name: t('about.teamMember1.name'),
    role: t('about.teamMember1.role'),
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
  },
  {
    name: t('about.teamMember2.name'),
    role: t('about.teamMember2.role'),
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg'
  },
  {
    name: t('about.teamMember3.name'),
    role: t('about.teamMember3.role'),
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg'
  }
])

// 社交媒体链接
const socialLinks = ref([
  {
    name: t('about.weibo'),
    icon: 'public',
    url: 'https://weibo.com/example'
  },
  {
    name: t('about.wechat'),
    icon: 'chat',
    url: 'https://weixin.qq.com/example'
  },
  {
    name: t('about.website'),
    icon: 'language',
    url: 'https://example.com'
  }
])

// 打开社交媒体链接
const openSocialLink = (social) => {
  window.open(social.url, '_blank')
}
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  background: var(--background-color);
  display: flex;
  flex-direction: column;
}

/* 导航栏样式 */
.nav-bar {
  display: flex;
  align-items: center;
  padding: 16px;
  background: var(--surface-color);
  border-bottom: 1px solid var(--border-color);
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

.back-icon:active {
  background: rgba(255, 255, 255, 0.1);
}

.nav-title {
  font-size: 18px;
  font-weight: 500;
  color: var(--text-color);
}

/* 内容区域样式 */
.about-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  -webkit-overflow-scrolling: touch;
}

/* 应用信息样式 */
.app-info {
  text-align: center;
  padding: 32px 16px;
  background: var(--surface-color);
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.app-logo {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  padding: 16px;
}

.app-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.app-name {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 8px;
}

.app-version {
  font-size: 14px;
  color: var(--text-secondary-color);
}

/* 章节样式 */
.section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 16px;
  padding-left: 8px;
  border-left: 3px solid var(--primary-color);
}

/* 公司信息样式 */
.company-info {
  background: var(--surface-color);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.company-info p {
  color: var(--text-secondary-color);
  line-height: 1.6;
  margin-bottom: 16px;
}

.company-stats {
  display: flex;
  justify-content: space-around;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary-color);
}

/* 团队成员样式 */
.team-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

.team-member {
  background: var(--surface-color);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.team-member img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.member-info {
  padding: 12px;
  text-align: center;
}

.member-info h3 {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 4px;
}

.member-info p {
  font-size: 12px;
  color: var(--text-secondary-color);
}

/* 社交媒体样式 */
.social-list {
  background: var(--surface-color);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.social-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: background-color 0.3s;
}

.social-item:active {
  background: rgba(255, 255, 255, 0.05);
}

.social-item:last-child {
  border-bottom: none;
}

.social-item .material-icons:first-child {
  margin-right: 12px;
  color: var(--primary-color);
}

.social-item span:nth-child(2) {
  flex: 1;
  color: var(--text-color);
}

.social-item .material-icons:last-child {
  color: var(--text-secondary-color);
}

/* 版权信息样式 */
.copyright {
  text-align: center;
  padding: 24px 16px;
  color: var(--text-secondary-color);
  font-size: 12px;
  line-height: 1.6;
}

.copyright p {
  margin-bottom: 8px;
}
</style> 