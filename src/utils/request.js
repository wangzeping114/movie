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
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      window.location.href = '/login'
    } else if (error.response?.status === 403) {
      ElMessage.error('无权限访问该资源')
    } else if (error.response?.status === 500) {
      ElMessage.error('服务器内部错误，请稍后再试')
    } else {
      ElMessage.error(error.response?.data?.message || '请求失败')
    }
    return Promise.reject(error)
  }
)

export default service