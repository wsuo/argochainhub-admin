# 端口配置管理

## 概述

项目已重构为集中式端口配置管理，所有端口相关的配置都在 `lib/config.ts` 文件中统一管理。

## 配置文件结构

### 主配置文件：`lib/config.ts`

```typescript
export const APP_CONFIG = {
  // 端口配置
  PORTS: {
    FRONTEND_DEV: 3060,     // 开发环境前端端口
    FRONTEND_PROD: 3060,    // 生产环境前端端口  
    BACKEND: 3050,          // 后端API端口
  },

  // API配置
  API: {
    BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || `http://localhost:3050/api/v1`,
    TIMEOUT: 10000,
  },

  // 认证配置
  AUTH: {
    TOKEN_KEY: 'auth_token',
    TOKEN_EXPIRES_DAYS: 7,
  },

  // 其他配置...
}
```

### 环境变量文件：`.env.local`

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3050/api/v1
FRONTEND_DEV_PORT=3060
FRONTEND_PROD_PORT=3060
BACKEND_PORT=3050
```

## 如何修改端口号

### 1. 修改后端端口

只需在 `lib/config.ts` 中修改：

```typescript
PORTS: {
  BACKEND: 3060, // 从 3050 改为 3060
}
```

同时更新 API 配置：

```typescript
API: {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || `http://localhost:3060/api/v1`,
}
```

### 2. 修改前端端口

在 `lib/config.ts` 中修改：

```typescript
PORTS: {
  FRONTEND_DEV: 3080,  // 从 3060 改为 3080
  FRONTEND_PROD: 3080, // 从 3060 改为 3080
}
```

### 3. 更新环境变量（可选）

在 `.env.local` 中同步修改：

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3060/api/v1
FRONTEND_DEV_PORT=3080
FRONTEND_PROD_PORT=3080
BACKEND_PORT=3060
```

### 4. 重启服务

修改后需要重启开发服务器：

```bash
# 停止当前服务器 (Ctrl+C)
# 然后重新启动
npm run dev
```

## 受影响的文件

以下文件已经重构为使用集中配置：

1. **`lib/api-client.ts`** - API客户端基础URL和认证配置
2. **`lib/file-api.ts`** - 文件上传API端点
3. **`components/file-upload.tsx`** - 文件上传组件
4. **`package.json`** - 开发和生产脚本端口

## 工具函数

配置文件还提供了便利的工具函数：

```typescript
// 生成完整的API URL
const apiUrl = getApiUrl('/users') // -> http://localhost:3050/api/v1/users

// 生成上传URL  
const uploadUrl = getUploadUrl('/files') // -> http://localhost:3050/api/v1/uploads/files
```

## 优势

1. **集中管理** - 所有端口配置在一个文件中
2. **类型安全** - TypeScript支持，避免配置错误
3. **环境适配** - 支持环境变量覆盖
4. **易于维护** - 修改端口只需改一个地方
5. **工具函数** - 提供便利的URL生成函数

## 注意事项

1. 修改配置后必须重启开发服务器
2. 生产环境部署时需要设置正确的环境变量
3. 确保前后端端口不冲突
4. 文档和配置保持同步更新