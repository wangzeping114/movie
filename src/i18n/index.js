import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN.json'
import zhTW from './locales/zh-TW.json'
import enUS from './locales/en-US.json'
import jaJP from './locales/ja-JP.json'
import koKR from './locales/ko-KR.json'

// 从 localStorage 获取语言设置，如果没有则使用默认语言
const locale = localStorage.getItem('language') || 'zh-CN'

// 创建 i18n 实例
const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale,
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': zhCN,
    'zh-TW': zhTW,
    'en-US': enUS,
    'ja-JP': jaJP,
    'ko-KR': koKR
  }
})

// 导出设置语言的函数
export const setLanguage = (lang) => {
  i18n.global.locale.value = lang
  localStorage.setItem('language', lang)
}

export default i18n 