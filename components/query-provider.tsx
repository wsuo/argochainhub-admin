'use client'

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// 创建QueryClient实例
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 缓存时间 - 数据在内存中保持多长时间
      staleTime: 0,
      // 重新获取数据的时间间隔
      refetchInterval: false,
      // 窗口重新聚焦时重新获取数据
      refetchOnWindowFocus: false,
      // 重试次数
      retry: (failureCount, error: any) => {
        // 对于 4xx 错误不重试
        if (error?.statusCode >= 400 && error?.statusCode < 500) {
          return false
        }
        // 最多重试2次
        return failureCount < 2
      },
      // 重试延迟
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // 突变失败时的重试策略
      retry: false,
    },
  },
})

interface QueryProviderProps {
  children: React.ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false} 
          position="bottom-right"
        />
      )}
    </QueryClientProvider>
  )
}