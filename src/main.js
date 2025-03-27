import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import i18n from './i18n'

// 导入样式文件
import './assets/fonts/material-icons.css'
import './assets/main.css'

const app = createApp(App)

app.use(router)
app.use(i18n)

app.mount('#app')
