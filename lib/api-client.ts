import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import Cookies from 'js-cookie'
import { ApiError, ApiErrorResponse, ApiResponse } from './types'
import { APP_CONFIG } from './config'
import { showRoleBasedPermissionToast } from './permission-toast'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: APP_CONFIG.API.BASE_URL,
      timeout: APP_CONFIG.API.TIMEOUT,
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
        const token = Cookies.get(APP_CONFIG.AUTH.TOKEN_KEY)
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
      (error: AxiosError<ApiErrorResponse>) => {
        // 处理认证失败
        if (error.response?.status === 401) {
          this.clearAuth()
          // 如果不在登录页面，则跳转到登录页面
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login'
          }
        }

        // 处理权限不足 - 403错误
        if (error.response?.status === 403) {
          // 获取当前用户角色（从token中解析或者从localStorage获取）
          let userRole: string | undefined
          try {
            const token = Cookies.get(APP_CONFIG.AUTH.TOKEN_KEY)
            if (token) {
              const payload = JSON.parse(atob(token.split('.')[1]))
              userRole = payload.role
            }
          } catch (e) {
            // 忽略token解析错误
          }
          
          // 使用toast显示权限提示，不抛出错误阻止后续处理
          const errorMessage = error.response?.data?.message || '权限不足'
          if (typeof window !== 'undefined') {
            // 延迟显示toast，确保组件已挂载
            setTimeout(() => {
              showRoleBasedPermissionToast(userRole, errorMessage)
            }, 100)
          }
          
          // 仍然返回错误，但不会触发默认的错误处理
          const apiError: ApiError = {
            statusCode: 403,
            message: errorMessage,
            error: 'Permission Denied',
            handled: true, // 标记为已处理
          }
          return Promise.reject(apiError)
        }

        // 处理新的统一响应格式
        if (error.response?.data && typeof error.response.data === 'object') {
          const errorData = error.response.data
          
          // 如果是新的统一格式
          if ('success' in errorData && 'message' in errorData) {
            const apiError: ApiError = {
              statusCode: error.response.status,
              message: errorData.message || '操作失败',
              error: errorData.error || 'API Error',
            }
            return Promise.reject(apiError)
          }
        }

        // 备用错误处理（兼容旧格式）
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
    Cookies.set(APP_CONFIG.AUTH.TOKEN_KEY, token, { 
      expires: APP_CONFIG.AUTH.TOKEN_EXPIRES_DAYS,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })
  }

  // 清除认证信息
  clearAuth() {
    Cookies.remove(APP_CONFIG.AUTH.TOKEN_KEY)
  }

  // 检查是否已认证
  isAuthenticated(): boolean {
    return !!Cookies.get(APP_CONFIG.AUTH.TOKEN_KEY)
  }

  // GET请求 - 返回完整响应(包含meta)
  async getWithMeta<T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, { params })
    // 直接返回后端的统一格式，已经包含success, message, data, meta字段
    return response.data
  }

  // GET请求
  async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, { params })
    // 从统一响应格式中提取data字段
    return response.data.data
  }

  // POST请求
  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data)
    // 从统一响应格式中提取data字段
    return response.data.data
  }

  // PUT请求
  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data)
    // 从统一响应格式中提取data字段
    return response.data.data
  }

  // PATCH请求
  async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data)
    // 从统一响应格式中提取data字段
    return response.data.data
  }

  // DELETE请求
  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url)
    // 从统一响应格式中提取data字段
    return response.data.data
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