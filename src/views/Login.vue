<template>
  <div class="login-container">
    <div class="login-box">
      <div class="language-selector">
        <div class="selected-language" @click="showLanguageDropdown = !showLanguageDropdown">
          <img :src="getFlagUrl(currentLanguage)" :alt="t('languageName')" class="flag-icon">
          <span>{{ t('languageName') }}</span>
          <i class="arrow-down"></i>
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
      
      <div class="login-content">
        <h1>{{ t('login.title') }}</h1>
        <p class="welcome-text">{{ isLogin ? t('login.welcomeBack') : t('login.welcomeJoin') }}</p>
        
        <form @submit.prevent="handleSubmit" class="login-form">
          <div class="form-group">
            <label>{{ t('login.username') }}</label>
            <div class="input-wrapper">
              <span class="material-icons icon">person</span>
              <input 
                type="text" 
                v-model="form.username" 
                :placeholder="t('login.username')"
                required
              >
            </div>
          </div>
          
          <div class="form-group">
            <label>{{ t('login.password') }}</label>
            <div class="input-wrapper">
              <span class="material-icons icon">lock</span>
              <input 
                :type="showPassword ? 'text' : 'password'"
                v-model="form.password" 
                :placeholder="t('login.password')"
                required
              >
              <span 
                class="material-icons icon clickable"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? 'visibility_off' : 'visibility' }}
              </span>
            </div>
          </div>
          
          <div class="form-group" v-if="!isLogin">
            <label>{{ t('login.confirmPassword') }}</label>
            <div class="input-wrapper">
              <span class="material-icons icon">lock</span>
              <input 
                :type="showConfirmPassword ? 'text' : 'password'"
                v-model="form.confirmPassword" 
                :placeholder="t('login.confirmPassword')"
                required
              >
              <span 
                class="material-icons icon clickable"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                {{ showConfirmPassword ? 'visibility_off' : 'visibility' }}
              </span>
            </div>
          </div>

          <button type="submit" class="submit-btn">
            {{ t('login.submit') }}
            <span class="btn-hover"></span>
          </button>
        </form>

        <p class="switch-mode" @click="toggleMode">
          {{ isLogin ? t('login.switchToRegister') : t('login.switchToLogin') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { setLanguage } from '../i18n'

const router = useRouter()
const { t } = useI18n()
const isLogin = ref(true)
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
  form.password = ''
  form.confirmPassword = ''
}

const handleSubmit = () => {
  if (!isLogin.value && form.password !== form.confirmPassword) {
    alert(t('login.passwordMismatch'))
    return
  }

  localStorage.setItem('user', JSON.stringify({
    username: form.username,
    isLoggedIn: true
  }))
  
  alert(isLogin.value ? t('login.loginSuccess') : t('login.registerSuccess'))
  
  const from = router.currentRoute.value.query.from || '/short-video'
  router.push(from)
}

// 点击外部关闭语言下拉框
const closeDropdown = (e) => {
  if (!e.target.closest('.language-selector')) {
    showLanguageDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-box {
  background: rgba(255, 255, 255, 0.95);
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
  position: relative;
  backdrop-filter: blur(10px);
}

.login-content {
  position: relative;
  z-index: 1;
}

h1 {
  color: #333;
  font-size: 2rem;
  margin-bottom: 0.5rem;
  text-align: center;
}

.welcome-text {
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.language-selector {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 100;
}

.selected-language {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.selected-language:hover {
  background: #f8f8f8;
}

.language-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 180px;
}

.language-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.language-option:hover {
  background: #f5f5f5;
}

.flag-icon {
  width: 24px;
  height: 18px;
  object-fit: cover;
  border-radius: 2px;
}

.arrow-down {
  border: solid #666;
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 3px;
  transform: rotate(45deg);
  margin-left: 4px;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  color: #555;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

input {
  width: 100%;
  padding: 12px 40px;
  border: 2px solid #eee;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

input:focus {
  border-color: #667eea;
  outline: none;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-hover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.submit-btn:hover .btn-hover {
  opacity: 1;
}

.switch-mode {
  text-align: center;
  margin-top: 1.5rem;
  color: #667eea;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.switch-mode:hover {
  color: #764ba2;
  text-decoration: underline;
}

.material-icons.icon {
  position: absolute;
  color: #999;
  font-size: 20px;
  line-height: 1;
}

.material-icons.icon:first-child {
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
}

.material-icons.icon.clickable {
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-box {
    padding: 2rem;
  }

  h1 {
    font-size: 1.75rem;
  }

  .welcome-text {
    font-size: 1rem;
  }

  .submit-btn {
    padding: 12px;
    font-size: 1rem;
  }
}
</style> 