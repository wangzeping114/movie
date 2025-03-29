<template>
  <div class="login-container">
    <div class="login-header">
      <!-- <div class="logo">
        <img src="@/assets/images/logo.png" alt="Logo">
      </div> -->
      <h1 class="title">{{ t('login.title') }}</h1>
      <p class="subtitle">{{ isLogin ? t('login.welcomeBack') : t('login.welcomeJoin') }}</p>
    </div>

    <form @submit.prevent="handleSubmit" class="login-form">
      <div class="form-group">
        <label>{{ t('login.username') }}</label>
        <input 
          type="text" 
          v-model="form.username" 
          :placeholder="t('login.username')"
          required
        >
      </div>
      
      <div class="form-group">
        <label>{{ t('login.password') }}</label>
        <input 
          :type="showPassword ? 'text' : 'password'"
          v-model="form.password" 
          :placeholder="t('login.password')"
          required
        >
      </div>
      
      <div class="form-group" v-if="!isLogin">
        <label>{{ t('login.confirmPassword') }}</label>
        <input 
          :type="showConfirmPassword ? 'text' : 'password'"
          v-model="form.confirmPassword" 
          :placeholder="t('login.confirmPassword')"
          required
        >
      </div>

      <button type="submit" class="login-btn" :class="{ loading: isLoading }">
        {{ t('login.submit') }}
      </button>
    </form>

    <!-- <div class="other-login">
      <span>{{ t('login.otherLogin') }}</span>
    </div> -->

    <!-- <div class="social-login">
      <div class="social-btn">
        <img src="@/assets/icons/wechat.png" alt="WeChat">
      </div>
      <div class="social-btn">
        <img src="@/assets/icons/qq.png" alt="QQ">
      </div>
      <div class="social-btn">
        <img src="@/assets/icons/weibo.png" alt="Weibo">
      </div>
    </div> -->

    <div class="register-link">
      {{ isLogin ? t('login.noAccount') : t('login.haveAccount') }}
      <a @click.prevent="toggleMode" class="switch-link">
        {{ isLogin ? t('login.switchToRegister') : t('login.switchToLogin') }}
      </a>
    </div>

    <div class="language-selector">
      <div class="selected-language" @click="showLanguageDropdown = !showLanguageDropdown">
        <img :src="getFlagUrl(currentLanguage)" :alt="t('languageName')" class="flag-icon">
      </div>
      <div class="language-dropdown" v-if="showLanguageDropdown">
        <div 
          v-for="lang in languages" 
          :key="lang.code"
          class="language-option"
          @click="selectLanguage(lang.code)"
        >
          <img :src="getFlagUrl(lang.code)" :alt="lang.name" class="flag-icon">
          <span>{{ lang.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { setLanguage } from '../i18n'

const router = useRouter()
const { t } = useI18n()
const isLogin = ref(true)
const isLoading = ref(false)
const currentLanguage = ref(localStorage.getItem('language') || 'zh-CN')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const showLanguageDropdown = ref(false)

const languages = [
  { code: 'zh-CN', name: '简体中文' },
  { code: 'zh-TW', name: '繁體中文' },
  { code: 'en-US', name: 'English' },
  { code: 'ja-JP', name: '日本語' },
  { code: 'ko-KR', name: '한국어' }
]

const form = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

const getFlagUrl = (code) => {
  const countryCode = code.split('-')[1].toLowerCase()
  return 'https://flagcdn.com/24x18/' + countryCode + '.png'
}

const selectLanguage = (code) => {
  currentLanguage.value = code
  setLanguage(code)
  showLanguageDropdown.value = false
}

const toggleMode = () => {
  isLogin.value = !isLogin.value
  form.username = ''
  form.password = ''
  form.confirmPassword = ''
  showPassword.value = false
  showConfirmPassword.value = false
  nextTick(() => {
    if (!isLogin.value) {
      document.querySelector('.login-form').scrollIntoView({ behavior: 'smooth' })
    }
  })
}

const handleSubmit = async () => {
  if (!isLogin.value && form.password !== form.confirmPassword) {
    alert(t('login.passwordMismatch'))
    return
  }

  isLoading.value = true
  try {
    // 模拟登录/注册请求
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    localStorage.setItem('user', JSON.stringify({
      username: form.username,
      isLoggedIn: true
    }))
    
    alert(isLogin.value ? t('login.loginSuccess') : t('login.registerSuccess'))
    
    const from = router.currentRoute.value.query.from || '/short-video'
    router.push(from)
  } catch (error) {
    console.error('Login error:', error)
    alert(t('login.error'))
  } finally {
    isLoading.value = false
  }
}

// 点击外部关闭语言下拉框
const closeDropdown = (e) => {
  if (!e.target.closest('.language-selector')) {
    showLanguageDropdown.value = false
  }
}

// 添加阻止双击放大的处理函数
const preventDoubleTapZoom = (e) => {
  if (e.touches.length > 1) {
    e.preventDefault()
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdown)
  document.addEventListener('touchstart', preventDoubleTapZoom, { passive: false })
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
  document.removeEventListener('touchstart', preventDoubleTapZoom)
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0f1a 0%, #1a1f2a 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  position: relative;
  overflow: hidden;
  touch-action: manipulation; /* 禁用双击放大 */
  -webkit-tap-highlight-color: transparent; /* 移除点击高亮 */
}

/* 添加背景动画效果 */
.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.1) 0%, transparent 50%);
  animation: pulse 4s ease-in-out infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
  z-index: 1;
  max-width: 400px;
  width: 100%;
}

.logo {
  width: 120px;
  height: 120px;
  margin-bottom: 20px;
  border-radius: 30px;
  background: linear-gradient(135deg, #d4af37, #e5c158);
  padding: 20px;
  box-shadow: 0 8px 32px rgba(212, 175, 55, 0.3);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0);
  }
}

.logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.title {
  font-size: 36px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 16px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #d4af37, #e5c158);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 30px;
  line-height: 1.6;
}

.login-form {
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 2;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 14px 18px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 16px;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #d4af37;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2);
}

.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.login-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #d4af37, #e5c158);
  border: none;
  border-radius: 12px;
  color: #000;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  margin-top: 24px;
  letter-spacing: 0.5px;
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(212, 175, 55, 0.4);
}

.login-btn:hover::before {
  opacity: 1;
}

.login-btn:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
}

.other-login {
  margin-top: 40px;
  text-align: center;
  position: relative;
}

.other-login::before,
.other-login::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 35%;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}

.other-login::before {
  left: 0;
}

.other-login::after {
  right: 0;
}

.other-login span {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  background: rgba(10, 15, 26, 0.8);
  padding: 0 15px;
  position: relative;
}

.social-login {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.social-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.social-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.social-btn img {
  width: 24px;
  height: 24px;
  opacity: 0.8;
}

.register-link {
  text-align: center;
  margin-top: 24px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  line-height: 1.6;
}

.register-link a {
  color: #d4af37;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
  margin-left: 4px;
  cursor: pointer;
  user-select: none;
  padding: 4px 8px;
  border-radius: 4px;
}

.register-link a:hover {
  color: #e5c158;
  background: rgba(212, 175, 55, 0.1);
}

/* 添加错误提示样式 */
.error-message {
  color: #ff4d4d;
  font-size: 14px;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.error-message i {
  font-size: 16px;
}

/* 添加加载状态样式 */
.login-btn.loading {
  position: relative;
  color: transparent;
}

.login-btn.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  border: 2px solid rgba(0, 0, 0, 0.3);
  border-top-color: #000;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 添加响应式样式 */
@media (max-width: 480px) {
  .login-container {
    padding: 20px 16px;
  }

  .logo {
    width: 100px;
    height: 100px;
  }

  .title {
    font-size: 32px;
  }

  .login-form {
    padding: 30px 24px;
  }

  .social-login {
    gap: 15px;
  }

  .social-btn {
    width: 45px;
    height: 45px;
  }

  .form-group input {
    padding: 12px 16px;
  }

  .login-btn {
    padding: 14px;
  }
}

/* 添加语言选择器样式 */
.language-selector {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 100;
}

.selected-language {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.selected-language:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.flag-icon {
  width: 24px;
  height: 18px;
  object-fit: cover;
  border-radius: 2px;
}

.language-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: rgba(10, 15, 26, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  width: 160px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.language-option {
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.language-option:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.language-option span {
  font-size: 14px;
  font-weight: 500;
}

/* 响应式优化 */
@media (max-width: 480px) {
  .language-selector {
    top: 16px;
    right: 16px;
  }

  .selected-language {
    width: 36px;
    height: 36px;
  }

  .language-dropdown {
    width: 140px;
  }

  .language-option {
    padding: 10px 14px;
  }
}

.switch-link {
  color: #d4af37;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-left: 4px;
  cursor: pointer;
  user-select: none;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
  position: relative;
}

.switch-link:hover {
  color: #e5c158;
  background: rgba(212, 175, 55, 0.1);
  transform: translateY(-1px);
}

.switch-link:active {
  transform: translateY(0);
}
</style> 