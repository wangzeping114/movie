<template>
  <div class="language-switcher">
    <button 
      class="language-btn" 
      :class="{ 'active': currentLocale === 'zh-CN' }" 
      @click="changeLanguage('zh-CN')"
    >
      中文
    </button>
    <button 
      class="language-btn" 
      :class="{ 'active': currentLocale === 'en-US' }" 
      @click="changeLanguage('en-US')"
    >
      English
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const currentLocale = computed(() => locale.value)

const changeLanguage = (lang) => {
  locale.value = lang
  localStorage.setItem('locale', lang)
}
</script>

<style scoped>
.language-switcher {
  display: flex;
  gap: 8px;
  padding: 8px;
}

.language-btn {
  padding: 6px 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.language-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.8);
}

.language-btn.active {
  background: #d4af37;
  color: #000;
  border-color: transparent;
}
</style> 