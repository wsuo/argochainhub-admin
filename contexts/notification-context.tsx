'use client'

import React, { createContext, useContext, useMemo } from 'react'
import { useNotifications, type NotificationOptions } from '@/hooks/use-notifications'
import type { NotificationState } from '@/hooks/use-notifications'
import type { AdminNotificationQuery } from '@/lib/types'

// 通知上下文类型
interface NotificationContextType extends NotificationState {
  // 辅助方法
  refresh: () => void
  reconnect: () => void
  markAsRead: (id: number | string) => void
  getPriorityColor: (priority: string) => string
  getCategoryIcon: (category: string) => string
  // 分页信息
  meta?: any
  // WebSocket状态
  wsStatus: string
  wsIsAuthenticated: boolean
  // 是否启用实时通知
  isRealtimeEnabled: boolean
  // 获取带查询参数的通知数据
  getNotificationsWithQuery: (query?: AdminNotificationQuery) => any
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

// 通知提供者组件
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  // 创建单一的通知管理实例 - 只用于全局状态和WebSocket连接
  const globalNotificationState = useNotifications({
    enableRealtime: true,
    showToast: true,
    autoMarkAsRead: false,
    query: { page: 1, limit: 20 }, // 默认查询，主要用于铃铛显示
  })

  // 创建扩展的上下文值
  const contextValue = useMemo(() => ({
    ...globalNotificationState,
    // 提供一个方法让页面级组件获取带特定查询参数的数据
    getNotificationsWithQuery: (query?: AdminNotificationQuery) => {
      // 这个方法可以被页面级组件覆盖使用
      return globalNotificationState.notifications
    }
  }), [globalNotificationState])

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  )
}

// 使用通知上下文的 Hook
export function useNotificationContext() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider')
  }
  return context
}

export default NotificationProvider