<template>
  <div class="login-container">
    <div class="login-header">
      <!-- <div class="logo">
        <img src="@/assets/images/logo.png" alt="Logo">
      </div> -->
      <h1 class="title">{{ $t('login.title') }}</h1>
      <p class="subtitle">{{ isLogin ? $t('login.welcomeBack') : $t('login.welcomeJoin') }}</p>
    </div>

    <form @submit.prevent="handleSubmit" class="login-form">
      <div class="form-group">
        <label>{{ $t('login.username') }}</label>
        <input 
          type="text" 
          v-model="formData.username" 
          :placeholder="$t('login.username')"
          :data-msg="$t('login.usernameRequired')"
          required
        >
      </div>
      
      <div class="form-group">
        <label>{{ $t('login.password') }}</label>
        <input 
          :type="showPassword ? 'text' : 'password'"
          v-model="formData.password" 
          :placeholder="$t('login.password')"
          :data-msg="$t('login.passwordRequired')"
          required
        >
      </div>
      
      <div class="form-group" v-if="!isLogin">
        <label>{{ $t('login.confirmPassword') }}</label>
        <input 
          :type="showConfirmPassword ? 'text' : 'password'"
          v-model="formData.confirmPassword" 
          :placeholder="$t('login.confirmPassword')"
          :data-msg="$t('login.confirmPasswordRequired')"
          required
        >
      </div>

      <div class="options">
        <label class="remember-me">
          <input type="checkbox" v-model="rememberMe">
          <span>{{ $t('login.rememberMe') }}</span>
        </label>
        <a href="#" class="forgot-password">{{ $t('login.forgotPassword') }}</a>
      </div>

      <button type="submit" class="login-btn" :class="{ loading: isLoading }">
        {{ $t('login.submit') }}
      </button>
    </form>

    <!-- <div class="other-login">
      <span>{{ $t('login.otherLogin') }}</span>
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
      {{ isLogin ? $t('login.noAccount') : $t('login.haveAccount') }}
      <a @click.prevent="toggleMode" class="switch-link">
        {{ isLogin ? $t('login.switchToRegister') : $t('login.switchToLogin') }}
      </a>
    </div>

    <div class="language-selector">
      <div class="selected-language" @click="showLanguageDropdown = !showLanguageDropdown">
        <img :src="getFlagUrl(currentLanguage)" :alt="$t('languageName')" class="flag-icon">
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
    
    <!-- 添加自定义Toast提示 -->
    <Transition name="toast-fade">
      <div v-if="toast.show" class="custom-toast" :class="toast.type">
        <i class="material-icons toast-icon">{{ toast.icon }}</i>
        <span class="toast-message">{{ toast.message }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { setLanguage } from '../i18n'
import { ElMessage } from 'element-plus'
import { login, register } from '@/api/user'

const router = useRouter()
const { t } = useI18n()
const isLogin = ref(true)
const isLoading = ref(false)
const currentLanguage = ref(localStorage.getItem('language') || 'zh-CN')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const showLanguageDropdown = ref(false)
const rememberMe = ref(false)

// 添加Toast状态
const toast = reactive({
  show: false,
  message: '',
  type: 'info', // info, success, error, warning
  icon: 'info',
  timer: null
})

const languages = [
  { code: 'zh-CN', name: '简体中文' },
  { code: 'zh-TW', name: '繁體中文' },
  { code: 'en-US', name: 'English' },
  { code: 'ja-JP', name: '日本語' },
  { code: 'ko-KR', name: '한국어' }
]

const formData = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

// 显示Toast提示
const showToast = (message, type = 'info', duration = 2000) => {
  if (toast.timer) {
    clearTimeout(toast.timer)
  }
  
  // 设置图标
  let icon = 'info'
  switch (type) {
    case 'success':
      icon = 'check_circle'
      break
    case 'error':
      icon = 'error'
      break
    case 'warning':
      icon = 'warning'
      break
  }
  
  toast.message = message
  toast.type = type
  toast.icon = icon
  toast.show = true
  
  toast.timer = setTimeout(() => {
    toast.show = false
  }, duration)
}

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
  formData.username = ''
  formData.password = ''
  formData.confirmPassword = ''
  showPassword.value = false
  showConfirmPassword.value = false
  nextTick(() => {
    if (!isLogin.value) {
      document.querySelector('.login-form').scrollIntoView({ behavior: 'smooth' })
    }
  })
}

const handleSubmit = async () => {
  // 获取所有必填字段
  const requiredFields = document.querySelectorAll('input[required]')
  let hasError = false

  // 检查每个必填字段
  requiredFields.forEach(field => {
    if (!field.value) {
      // 使用自定义的错误消息
      const errorMsg = field.getAttribute('data-msg')
      ElMessage.error(errorMsg)
      hasError = true
    }
  })

  if (hasError) return

  try {
    if (isLogin.value) {
      const res = await login(formData)
      if (res.code === 1) {
        ElMessage.success(t('login.loginSuccess'))
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('userInfo', JSON.stringify({
          username: res.data.username,
          nickname: res.data.nickname
        }))
        ElMessage.success(t('login.loginSuccess'))
        router.push('/')
      } else {
        ElMessage.error(res.message || t('login.error'))
      }
    } else {
      // 注册逻辑
      if (formData.password !== formData.confirmPassword) {
        ElMessage.error(t('login.passwordMismatch'))
        return
      }
      const res = await register(formData)
      if (res.code === 1) {
        ElMessage.success(t('login.registerSuccess'))
        isLogin.value = true
        formData.confirmPassword = ''
      } else {
        ElMessage.error(res.message || t('login.error'))
      }
    }
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error(t('login.error'))
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
  if (toast.timer) {
    clearTimeout(toast.timer)
  }
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

/* 添加自定义Toast样式 */
.custom-toast {
  position: fixed;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 50px;
  background: rgba(26, 31, 42, 0.95);
  backdrop-filter: blur(8px);
  color: #fff;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  min-width: 200px;
  max-width: 80%;
  justify-content: center;
}

.toast-icon {
  font-size: 20px;
}

.toast-message {
  font-weight: 500;
}

.custom-toast.success {
  border-left: 3px solid #4CAF50;
}

.custom-toast.success .toast-icon {
  color: #4CAF50;
}

.custom-toast.error {
  border-left: 3px solid #F44336;
}

.custom-toast.error .toast-icon {
  color: #F44336;
}

.custom-toast.warning {
  border-left: 3px solid #FFC107;
}

.custom-toast.warning .toast-icon {
  color: #FFC107;
}

.custom-toast.info {
  border-left: 3px solid #2196F3;
}

.custom-toast.info .toast-icon {
  color: #2196F3;
}

/* Toast动画 */
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}

.options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  cursor: pointer;
  user-select: none;
}

.remember-me input[type="checkbox"] {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
}

.remember-me input[type="checkbox"]:checked {
  background: #d4af37;
  border-color: #d4af37;
}

.forgot-password {
  color: #d4af37;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  position: relative;
  padding: 4px 0;
  transition: all 0.3s ease;
}

.forgot-password::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: #d4af37;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.3s ease;
}

.forgot-password:hover {
  color: #e5c158;
}

.forgot-password:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}
</style> 