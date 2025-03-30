<template>
  <div class="help-center">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <span class="material-icons back-icon" @click="goBack">arrow_back</span>
      <span class="nav-title">{{ t('help.title') }}</span>
    </div>

    <div class="help-content">
      <!-- 常见问题 -->
      <div class="section">
        <h2 class="section-title">{{ t('help.faq') }}</h2>
        <div class="faq-list">
          <div v-for="(faq, index) in faqs" :key="index" class="faq-item">
            <div class="faq-question" @click="toggleFaq(index)">
              <span>{{ faq.question }}</span>
              <span class="material-icons" :class="{ 'rotated': faq.isOpen }">expand_more</span>
            </div>
            <div class="faq-answer" v-show="faq.isOpen">
              {{ faq.answer }}
            </div>
          </div>
        </div>
      </div>

      <!-- 联系支持 -->
      <div class="section">
        <h2 class="section-title">{{ t('help.contact') }}</h2>
        <div class="contact-list">
          <div class="contact-item" @click="handleContact('email')">
            <span class="material-icons">email</span>
            <span>{{ t('help.email') }}</span>
            <span class="material-icons">chevron_right</span>
          </div>
          <div class="contact-item" @click="handleContact('wechat')">
            <span class="material-icons">chat</span>
            <span>{{ t('help.wechat') }}</span>
            <span class="material-icons">chevron_right</span>
          </div>
          <div class="contact-item" @click="handleContact('phone')">
            <span class="material-icons">phone</span>
            <span>{{ t('help.phone') }}</span>
            <span class="material-icons">chevron_right</span>
          </div>
        </div>
      </div>

      <!-- 用户协议 -->
      <div class="section">
        <h2 class="section-title">{{ t('help.agreements') }}</h2>
        <div class="agreement-list">
          <div class="agreement-item" @click="showAgreement('terms')">
            <span>{{ t('help.terms') }}</span>
            <span class="material-icons">chevron_right</span>
          </div>
          <div class="agreement-item" @click="showAgreement('privacy')">
            <span>{{ t('help.privacy') }}</span>
            <span class="material-icons">chevron_right</span>
          </div>
        </div>
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

// FAQ数据
const faqs = ref([
  {
    question: t('help.faq1.question'),
    answer: t('help.faq1.answer'),
    isOpen: false
  },
  {
    question: t('help.faq2.question'),
    answer: t('help.faq2.answer'),
    isOpen: false
  },
  {
    question: t('help.faq3.question'),
    answer: t('help.faq3.answer'),
    isOpen: false
  },
  {
    question: t('help.faq4.question'),
    answer: t('help.faq4.answer'),
    isOpen: false
  }
])

// 切换FAQ展开状态
const toggleFaq = (index) => {
  faqs.value[index].isOpen = !faqs.value[index].isOpen
}

// 处理联系方式点击
const handleContact = (type) => {
  switch (type) {
    case 'email':
      window.location.href = 'mailto:support@example.com'
      break
    case 'wechat':
      // 显示微信二维码
      alert(t('help.wechatQRCode'))
      break
    case 'phone':
      window.location.href = 'tel:400-123-4567'
      break
  }
}

// 显示协议内容
const showAgreement = (type) => {
  const content = type === 'terms' ? t('help.termsContent') : t('help.privacyContent')
  alert(content)
}
</script>

<style scoped>
.help-center {
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
.help-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  -webkit-overflow-scrolling: touch;
}

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

/* FAQ样式 */
.faq-list {
  background: var(--surface-color);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.faq-item {
  border-bottom: 1px solid var(--border-color);
}

.faq-item:last-child {
  border-bottom: none;
}

.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.faq-question:active {
  background: rgba(255, 255, 255, 0.05);
}

.faq-question .material-icons {
  transition: transform 0.3s;
}

.faq-question .material-icons.rotated {
  transform: rotate(180deg);
}

.faq-answer {
  padding: 16px;
  color: var(--text-secondary-color);
  font-size: 14px;
  line-height: 1.6;
  background: rgba(255, 255, 255, 0.02);
}

/* 联系方式样式 */
.contact-list {
  background: var(--surface-color);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: background-color 0.3s;
}

.contact-item:active {
  background: rgba(255, 255, 255, 0.05);
}

.contact-item:last-child {
  border-bottom: none;
}

.contact-item .material-icons:first-child {
  margin-right: 12px;
  color: var(--primary-color);
}

.contact-item span:nth-child(2) {
  flex: 1;
  color: var(--text-color);
}

.contact-item .material-icons:last-child {
  color: var(--text-secondary-color);
}

/* 协议样式 */
.agreement-list {
  background: var(--surface-color);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.agreement-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: background-color 0.3s;
}

.agreement-item:active {
  background: rgba(255, 255, 255, 0.05);
}

.agreement-item:last-child {
  border-bottom: none;
}

.agreement-item span:first-child {
  color: var(--text-color);
}

.agreement-item .material-icons {
  color: var(--text-secondary-color);
}
</style> 