'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useWebSocket } from './use-websocket'
import {
  useUnreadNotificationCount,
  useUnreadCountByPriority,
  useAdminNotifications,
  useMarkNotificationAsRead,
  queryKeys,
} from './use-api'
import type {
  AdminNotification,
  AdminNotificationQuery,
  WebSocketNotificationMessage,
} from '@/lib/types'

// 通知管理状态
export interface NotificationState {
  // 通知列表
  notifications: AdminNotification[]
  
  // 未读数量
  unreadCount: number
  unreadCountByPriority: Record<string, number>
  
  // WebSocket连接状态
  isConnected: boolean
  connectionError: Error | null
  
  // 加载状态
  isLoading: boolean
  error: Error | null
}

// 通知管理配置
export interface NotificationOptions {
  // 是否启用实时通知
  enableRealtime?: boolean
  
  // 是否自动标记为已读
  autoMarkAsRead?: boolean
  
  // 通知显示配置
  showToast?: boolean
  toastDuration?: number
  
  // 查询配置
  query?: AdminNotificationQuery
}

// 全局去重缓存 - 避免组件重新渲染时缓存丢失
const globalRecentNotifications = new Set<string>()
const globalToastNotifications = new Set<string>() // Toast级别去重

const DEFAULT_OPTIONS: Required<NotificationOptions> = {
  enableRealtime: true,
  autoMarkAsRead: false,
  showToast: true,
  toastDuration: 4000,
  query: { page: 1, limit: 20 },
}

export const useNotifications = (options: NotificationOptions = {}) => {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options }
  const queryClient = useQueryClient()
  
  // 本地状态
  const [connectionError, setConnectionError] = useState<Error | null>(null)
  // 使用全局去重缓存而不是组件级缓存
  // const recentNotificationsRef = useRef<Set<number | string>>(new Set())

  // API查询hooks
  const { 
    data: notificationsResponse, 
    isLoading: isLoadingNotifications, 
    error: notificationsError,
    refetch: refetchNotifications 
  } = useAdminNotifications(mergedOptions.query)
  
  const { 
    data: unreadCountResponse, 
    isLoading: isLoadingUnreadCount,
    error: unreadCountError 
  } = useUnreadNotificationCount()
  
  const { 
    data: unreadCountByPriorityResponse,
    isLoading: isLoadingUnreadCountByPriority,
    error: unreadCountByPriorityError 
  } = useUnreadCountByPriority()

  // 标记已读的mutation
  const markAsReadMutation = useMarkNotificationAsRead()

  // 处理收到新通知
  const handleNewNotification = useCallback(async (notification: WebSocketNotificationMessage) => {
    // 避免重复处理相同通知 - 使用全局缓存
    const notificationKey = `${notification.id}_${notification.title}`
    
    if (globalRecentNotifications.has(notificationKey)) {
      return
    }
    
    globalRecentNotifications.add(notificationKey)
    
    // 15秒后清理缓存（延长时间避免短时间内重复）
    setTimeout(() => {
      globalRecentNotifications.delete(notificationKey)
    }, 15000)
    
    // 刷新查询数据 - 使用强制刷新确保数据同步
    try {
      // 1. 让查询失效，触发重新获取
      await Promise.all([
        queryClient.invalidateQueries({ 
          predicate: (query) => {
            return query.queryKey[0] === 'admin-notifications'
          }
        }),
        queryClient.invalidateQueries({ queryKey: queryKeys.unreadNotificationCount }),
        queryClient.invalidateQueries({ queryKey: queryKeys.unreadCountByPriority })
      ])
      
      // 2. 强制重新获取关键数据
      await Promise.all([
        queryClient.refetchQueries({ queryKey: queryKeys.unreadNotificationCount }),
        queryClient.refetchQueries({ queryKey: queryKeys.unreadCountByPriority })
      ])
    } catch (error) {
      // 静默处理错误
    }
    
    // 显示Toast通知 - 添加Toast级别去重
    if (mergedOptions.showToast) {
      const toastKey = `${notification.id}_${notification.title}_toast`
      
      if (!globalToastNotifications.has(toastKey)) {
        globalToastNotifications.add(toastKey)
        
        // 清理Toast去重缓存
        setTimeout(() => {
          globalToastNotifications.delete(toastKey)
        }, 10000)
        
        const getPriorityColor = (priority: string) => {
          switch (priority.toLowerCase()) {
            case 'critical': return 'text-red-600'
            case 'urgent': return 'text-orange-600'
            case 'high': return 'text-yellow-600'
            case 'normal': return 'text-blue-600'
            case 'low': return 'text-gray-600'
            default: return 'text-gray-600'
          }
        }
        
        const getCategoryIcon = (category: string) => {
          switch (category.toLowerCase()) {
            case 'review': return '📋'
            case 'business': return '💼'
            case 'operation': return '⚙️'
            case 'system': return '🖥️'
            case 'security': return '🔒'
            default: return '📢'
          }
        }
        
        toast.info(`${getCategoryIcon(notification.category)} ${notification.title}: ${notification.content}`, {
          duration: mergedOptions.toastDuration,
          action: mergedOptions.autoMarkAsRead ? undefined : {
            label: '标记已读',
            onClick: () => markAsReadMutation.mutate(notification.id),
          },
        })
      }
    }
    
    // 自动标记为已读
    if (mergedOptions.autoMarkAsRead) {
      setTimeout(() => {
        markAsReadMutation.mutate(notification.id)
      }, 2000) // 2秒后自动标记已读
    }
  }, [queryClient, mergedOptions.showToast, mergedOptions.toastDuration, mergedOptions.autoMarkAsRead, markAsReadMutation])

  // 处理未读数量更新
  const handleUnreadCountUpdate = useCallback((count: number) => {
    // 直接更新查询缓存
    queryClient.setQueryData(queryKeys.unreadNotificationCount, { count })
    
    // 同时刷新优先级分组数据
    queryClient.invalidateQueries({ queryKey: queryKeys.unreadCountByPriority })
  }, [queryClient])

  // 处理通知状态变更事件
  const handleNotificationStatusChanged = useCallback((data: { 
    type: string, 
    notificationId?: string, 
    count?: number 
  }) => {
    // 根据事件类型更新缓存
    switch (data.type) {
      case 'read':
      case 'unread':
        // 标记已读/未读时，刷新计数和列表
        queryClient.invalidateQueries({ queryKey: queryKeys.unreadNotificationCount })
        queryClient.invalidateQueries({ queryKey: queryKeys.unreadCountByPriority })
        if (data.notificationId) {
          queryClient.invalidateQueries({ 
            predicate: (query) => query.queryKey[0] === 'admin-notifications'
          })
        }
        break
      case 'deleted':
      case 'archived':
        // 删除/归档时，刷新所有相关数据
        queryClient.invalidateQueries({ 
          predicate: (query) => query.queryKey[0] === 'admin-notifications'
        })
        queryClient.invalidateQueries({ queryKey: queryKeys.unreadNotificationCount })
        queryClient.invalidateQueries({ queryKey: queryKeys.unreadCountByPriority })
        break
      default:
        // 静默处理未知类型
        break
    }
  }, [queryClient])

  // 处理批量操作事件
  const handleNotificationsBulkUpdated = useCallback((data: { 
    type: string, 
    affectedCount: number, 
    newUnreadCount: number 
  }) => {
    // 直接更新未读数量缓存
    queryClient.setQueryData(queryKeys.unreadNotificationCount, { count: data.newUnreadCount })
    
    // 刷新其他相关数据
    queryClient.invalidateQueries({ queryKey: queryKeys.unreadCountByPriority })
    queryClient.invalidateQueries({ 
      predicate: (query) => query.queryKey[0] === 'admin-notifications'
    })
  }, [queryClient])

  // WebSocket事件处理
  const handleWebSocketConnected = useCallback(() => {
    setConnectionError(null)
    
    // 重新获取最新数据
    refetchNotifications()
    queryClient.invalidateQueries({ queryKey: queryKeys.unreadNotificationCount })
    queryClient.invalidateQueries({ queryKey: queryKeys.unreadCountByPriority })
  }, [refetchNotifications, queryClient])

  const handleWebSocketDisconnected = useCallback(() => {
    // 静默处理断开连接
  }, [])

  const handleWebSocketError = useCallback((error: Error) => {
    setConnectionError(error)
  }, [])

  // WebSocket连接
  const { 
    status: wsStatus, 
    isAuthenticated: wsIsAuthenticated,
    error: wsError,
    reconnect: wsReconnect
  } = useWebSocket(
    mergedOptions.enableRealtime ? {
      onNotification: handleNewNotification,
      onUnreadCountUpdate: handleUnreadCountUpdate,
      onNotificationStatusChanged: handleNotificationStatusChanged,
      onNotificationsBulkUpdated: handleNotificationsBulkUpdated,
      onConnected: handleWebSocketConnected,
      onDisconnected: handleWebSocketDisconnected,
      onError: handleWebSocketError,
    } : undefined,
    {
      autoReconnect: true,
      maxReconnectAttempts: 5,
      reconnectInterval: 3000,
    }
  )

  // 组合状态
  const state: NotificationState = {
    notifications: notificationsResponse?.data || [],
    unreadCount: unreadCountResponse?.count || 0,
    unreadCountByPriority: unreadCountByPriorityResponse || {},
    isConnected: wsStatus === 'connected' && wsIsAuthenticated,
    connectionError: connectionError || wsError,
    isLoading: isLoadingNotifications || isLoadingUnreadCount || isLoadingUnreadCountByPriority,
    error: notificationsError || unreadCountError || unreadCountByPriorityError || null,
  }

  // 辅助方法
  const actions = {
    // 刷新所有通知数据
    refresh: useCallback(async () => {
      // 1. 先刷新当前实例的数据
      await refetchNotifications()
      
      // 2. 然后强制刷新所有相关查询缓存
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.unreadNotificationCount }),
        queryClient.invalidateQueries({ queryKey: queryKeys.unreadCountByPriority }),
        queryClient.invalidateQueries({ 
          predicate: (query) => query.queryKey[0] === 'admin-notifications'
        })
      ])
      
      // 3. 等待所有查询重新获取数据
      await Promise.all([
        queryClient.refetchQueries({ queryKey: queryKeys.unreadNotificationCount }),
        queryClient.refetchQueries({ queryKey: queryKeys.unreadCountByPriority })
      ])
    }, [refetchNotifications, queryClient]),
    
    // 重新连接WebSocket
    reconnect: useCallback(() => {
      if (mergedOptions.enableRealtime) {
        wsReconnect()
      }
    }, [mergedOptions.enableRealtime, wsReconnect]),
    
    // 手动标记通知已读
    markAsRead: useCallback((id: number | string) => {
      markAsReadMutation.mutate(id)
    }, [markAsReadMutation]),
    
    // 获取优先级颜色类名
    getPriorityColor: useCallback((priority: string) => {
      switch (priority?.toLowerCase()) {
        case 'critical': return 'text-red-600 bg-red-50 border-red-200'
        case 'urgent': return 'text-orange-600 bg-orange-50 border-orange-200'
        case 'high': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
        case 'normal': return 'text-blue-600 bg-blue-50 border-blue-200'
        case 'low': return 'text-gray-600 bg-gray-50 border-gray-200'
        default: return 'text-gray-600 bg-gray-50 border-gray-200'
      }
    }, []),
    
    // 获取分类图标
    getCategoryIcon: useCallback((category: string) => {
      switch (category?.toLowerCase()) {
        case 'review': return '📋'
        case 'business': return '💼'
        case 'operation': return '⚙️'
        case 'system': return '🖥️'
        case 'security': return '🔒'
        default: return '📢'
      }
    }, []),
  }

  // 清理缓存定时器 - 使用全局缓存
  useEffect(() => {
    const interval = setInterval(() => {
      // 清理缓存 - 静默处理
    }, 60000) // 每分钟检查一次
    
    return () => clearInterval(interval)
  }, [])

  return {
    ...state,
    ...actions,
    // 分页信息
    meta: notificationsResponse?.meta,
    // WebSocket状态
    wsStatus,
    wsIsAuthenticated,
    // 是否启用实时通知
    isRealtimeEnabled: mergedOptions.enableRealtime,
  }
}

export default useNotifications