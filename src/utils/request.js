import axios from 'axios'
import router from '@/router'
import { ElMessage } from 'element-plus'

// 根据环境设置 baseURL
const baseURL = import.meta.env.VITE_API_BASE_URL
const service = axios.create({
  baseURL,
  timeout: 10000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 这里可以统一加 token
    // const token = localStorage.getItem('token')
    // if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器
service.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response && error.response.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      // 清除本地token等信息
      localStorage.removeItem('token')
      // 跳转到登录页
      router.push('/login')
    } else {
      // 统一错误提示
      ElMessage.error(error.response?.data?.message || '请求失败')
    }
    return Promise.reject(error)
  }
)

export default service