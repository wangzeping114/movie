import { createApp, watch } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import en from 'element-plus/dist/locale/en.mjs'
import 'element-plus/theme-chalk/index.css'
import App from './App.vue'
import router from './router'
import i18n from './i18n'

// 导入样式文件
import './assets/fonts/material-icons.css'
import './assets/main.css'

// 创建应用实例
const app = createApp(App)

// 在使用其他插件之前先创建并使用pinia
const pinia = createPinia()
app.use(pinia)

// 其他插件
app.use(router)
app.use(i18n)

// 获取当前语言
const currentLanguage = localStorage.getItem('language') || 'zh-CN'

// 初始化 Element Plus 的本地化配置
app.use(ElementPlus, {
  locale: currentLanguage === 'en-US' ? en : zhCn,
})

// 监听语言变化，动态更新 Element Plus 的本地化配置
watch(() => i18n.global.locale.value, (newLocale) => {
  const locale = newLocale === 'en-US' ? en : zhCn
  ElementPlus.locale = locale
})

// 挂载应用
app.mount('#app')
