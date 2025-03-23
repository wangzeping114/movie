import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN'
import zhTW from './locales/zh-TW'
import enUS from './locales/en-US'
import jaJP from './locales/ja-JP'
import koKR from './locales/ko-KR'

const messages = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  'en-US': enUS,
  'ja-JP': jaJP,
  'ko-KR': koKR
}

// 获取浏览器语言设置
const getBrowserLanguage = () => {
  const language = navigator.language || navigator.userLanguage
  // 检查是否支持该语言
  return messages[language] ? language : 'zh-CN'
}

// 获取本地存储的语言设置或使用浏览器语言
const getStoredLanguage = () => {
  return localStorage.getItem('language') || getBrowserLanguage()
}

const i18n = createI18n({
  legacy: false, // 使用组合式API
  locale: getStoredLanguage(),
  fallbackLocale: 'zh-CN', // 设置回退语言
  messages
})

// 导出切换语言的方法
export const setLanguage = (locale) => {
  i18n.global.locale.value = locale
  localStorage.setItem('language', locale)
  document.querySelector('html').setAttribute('lang', locale)
}

export default i18n 