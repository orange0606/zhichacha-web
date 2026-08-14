import axios from 'axios'
import router from '../router'
import { Message } from 'element-ui'

const service = axios.create({
  // 开发环境使用本地地址，生产环境使用相对路径交给Nginx代理
  baseURL: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api',
  timeout: 120000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code === 401) {
      Message.error('登录已过期，请重新登录')
      localStorage.clear()
      router.push('/login')
      return Promise.reject(new Error('未登录'))
    }
    if (res.code && res.code !== 0) {
      Message.error(res.msg || '请求失败')
      return Promise.reject(new Error(res.msg || '请求失败'))
    }
    return res
  },
  error => {
    Message.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default service
