// 应用配置文件
// 所有端口号和环境配置都在这里统一管理

export const APP_CONFIG = {
  // 端口配置
  PORTS: {
    FRONTEND_DEV: 3060,
    FRONTEND_PROD: 3060,
    BACKEND: 3050,
  },

  // API配置
  API: {
    BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || `http://localhost:3050/api/v1`,
    TIMEOUT: 10000,
  },

  // 上传配置
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  },

  // 认证配置
  AUTH: {
    TOKEN_KEY: 'auth_token',
    TOKEN_EXPIRES_DAYS: 7,
  },

  // 分页配置
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  },
} as const

// 生成完整的URL
export const getApiUrl = (endpoint: string = '') => {
  return `${APP_CONFIG.API.BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
}

// 生成上传URL
export const getUploadUrl = (endpoint: string = '') => {
  return getApiUrl(`/uploads${endpoint}`)
}

export default APP_CONFIG