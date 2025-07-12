import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import Cookies from 'js-cookie'
import { ApiError } from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // 请求拦截器 - 自动添加认证token
    this.client.interceptors.request.use(
      (config) => {
        const token = Cookies.get('auth_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // 响应拦截器 - 统一错误处理
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      (error: AxiosError<ApiError>) => {
        // 处理认证失败
        if (error.response?.status === 401) {
          this.clearAuth()
          // 如果不在登录页面，则跳转到登录页面
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login'
          }
        }

        // 格式化错误信息
        const apiError: ApiError = error.response?.data || {
          statusCode: error.response?.status || 500,
          message: error.message || '网络请求失败',
          error: 'Unknown Error',
        }

        return Promise.reject(apiError)
      }
    )
  }

  // 设置认证token
  setAuth(token: string) {
    Cookies.set('auth_token', token, { 
      expires: 7, // 7天过期
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })
  }

  // 清除认证信息
  clearAuth() {
    Cookies.remove('auth_token')
  }

  // 检查是否已认证
  isAuthenticated(): boolean {
    return !!Cookies.get('auth_token')
  }

  // GET请求
  async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const response = await this.client.get<T>(url, { params })
    return response.data
  }

  // POST请求
  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(url, data)
    return response.data
  }

  // PUT请求
  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(url, data)
    return response.data
  }

  // PATCH请求
  async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.patch<T>(url, data)
    return response.data
  }

  // DELETE请求
  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url)
    return response.data
  }

  // 获取原始axios实例（如果需要更复杂的配置）
  getClient(): AxiosInstance {
    return this.client
  }
}

// 创建全局API客户端实例
export const apiClient = new ApiClient()

// 导出类型以便在其他地方使用
export type { ApiClient }
export default apiClient