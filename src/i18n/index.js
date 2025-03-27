import { createI18n } from 'vue-i18n'
import zh from '../locales/zh'
import en from '../locales/en'

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('language') || 'zh', // 从本地存储获取语言设置，默认为中文
  fallbackLocale: 'en',
  messages: {
    zh,
    en
  }
})

// 导出切换语言的方法
export const setLanguage = (locale) => {
  i18n.global.locale.value = locale
  localStorage.setItem('language', locale)
  document.querySelector('html').setAttribute('lang', locale)
}

export default i18n 