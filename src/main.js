import { createApp } from 'vue'
import { createPinia } from 'pinia'
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

// 挂载应用
app.mount('#app')
