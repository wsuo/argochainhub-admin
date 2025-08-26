'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { apiClient } from '@/lib/api-client'
import { APP_CONFIG } from '@/lib/config'
import type {
  WebSocketMessage,
  WebSocketNotificationMessage,
  WebSocketUnreadCountMessage,
} from '@/lib/types'

// Socket.IO 连接状态
export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

// Socket.IO 事件回调类型
export interface WebSocketEvents {
  onNotification?: (notification: WebSocketNotificationMessage) => void
  onUnreadCountUpdate?: (count: number) => void
  onNotificationStatusChanged?: (data: { type: string, notificationId?: string, count?: number }) => void
  onNotificationsBulkUpdated?: (data: { type: string, affectedCount: number, newUnreadCount: number }) => void
  onConnected?: (data: any) => void
  onDisconnected?: () => void
  onError?: (error: Error) => void
}

// Socket.IO 配置
interface WebSocketConfig {
  autoReconnect?: boolean
  maxReconnectAttempts?: number
  reconnectInterval?: number
}

const DEFAULT_CONFIG: Required<WebSocketConfig> = {
  autoReconnect: true,
  maxReconnectAttempts: 5,
  reconnectInterval: 3000, // 3秒
}

export const useWebSocket = (events?: WebSocketEvents, config?: WebSocketConfig) => {
  const [status, setStatus] = useState<WebSocketStatus>('disconnected')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const socketRef = useRef<Socket | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isManualCloseRef = useRef(false)
  
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }

  // 清理定时器
  const clearTimers = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
  }, [])

  // 获取认证token
  const getAuthToken = useCallback(() => {
    if (!apiClient.isAuthenticated()) {
      return null
    }
    
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith(APP_CONFIG.AUTH.TOKEN_KEY + '='))
      ?.split('=')[1]
    
    return token
  }, [])

  // 连接Socket.IO服务器
  const connect = useCallback(() => {
    const token = getAuthToken()
    
    if (!token) {
      return
    }

    try {
      setStatus('connecting')
      setError(null)
      isManualCloseRef.current = false

      // 断开已有连接
      if (socketRef.current) {
        socketRef.current.removeAllListeners() // 移除所有监听器
        socketRef.current.disconnect()
        socketRef.current = null
      }

      // 创建新的Socket.IO连接
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3050/api/v1'
      const socketUrl = baseUrl.replace('/api/v1', '/notifications')
      const serverUrl = process.env.NODE_ENV === 'production' 
        ? 'https://agroapi.wsuo.top/notifications'
        : socketUrl

      socketRef.current = io(serverUrl, {
        auth: {
          token  // 管理员JWT token
        },
        query: {
          type: 'admin'  // 重要：指定为admin类型
        },
        transports: ['websocket'],
        autoConnect: true,
      })

      // 连接成功事件
      socketRef.current.on('connect', () => {
        setStatus('connected')
        setIsAuthenticated(false) // 等待服务器确认
        reconnectAttemptsRef.current = 0
        clearTimers()
      })

      // 服务器连接确认事件
      socketRef.current.on('connected', (data) => {
        setIsAuthenticated(true)
        events?.onConnected?.(data)
      })

      // 🎯 管理员专用通知事件 - 主要事件（移除通用监听避免重复）
      socketRef.current.on('admin_notification', (notification) => {
        events?.onNotification?.(notification)
      })

      // 🎯 系统广播通知
      socketRef.current.on('system_notification', (notification) => {
        events?.onNotification?.(notification)
      })

      // 监听所有可能的通知事件 - 仅开发环境
      if (process.env.NODE_ENV === 'development') {
        // 监听所有Socket.IO事件
        socketRef.current.onAny((eventName, ...args) => {
          if (eventName !== 'pong') { // 过滤心跳響应日志
            console.log(`🔍 Socket.IO事件: ${eventName}`, args)
          }
        })
      }

      // 未读数量更新 - 保留通用监听
      socketRef.current.on('unread_count_update', (data) => {
        events?.onUnreadCountUpdate?.(data.count)
      })

      // 🎯 管理员未读数量更新 - 主要事件
      socketRef.current.on('admin_unread_count', (data) => {
        if (data && typeof data.count === 'number') {
          events?.onUnreadCountUpdate?.(data.count)
        }
      })

      // 🎯 心跳检测响应
      socketRef.current.on('pong', (data) => {
        // 静默处理心跳响应
      })

      // 启动心跳检测 (每30秒发送一次ping)
      const pingInterval = setInterval(() => {
        if (socketRef.current?.connected) {
          socketRef.current.emit('ping')
        }
      }, 30000)

      // 清理心跳检测
      const cleanupPing = () => {
        if (pingInterval) {
          clearInterval(pingInterval)
        }
      }

      // 通知状态变更事件（标记已读、删除等）
      socketRef.current.on('notification_status_changed', (data) => {
        events?.onNotificationStatusChanged?.(data)
      })

      // 批量操作事件（如全部标记为已读）
      socketRef.current.on('notifications_bulk_updated', (data) => {
        events?.onNotificationsBulkUpdated?.(data)
      })

      // 连接断开事件
      socketRef.current.on('disconnect', (reason) => {
        setStatus('disconnected')
        setIsAuthenticated(false)
        clearTimers()
        cleanupPing() // 清理心跳检测
        events?.onDisconnected?.()

        // 自动重连逻辑 (除非是手动断开或服务器主动断开)
        if (!isManualCloseRef.current && 
            mergedConfig.autoReconnect && 
            reason !== 'io server disconnect' &&
            reconnectAttemptsRef.current < mergedConfig.maxReconnectAttempts) {
          
          reconnectAttemptsRef.current++
          
          const delay = mergedConfig.reconnectInterval * Math.pow(1.5, reconnectAttemptsRef.current - 1)
          reconnectTimeoutRef.current = setTimeout(connect, delay)
        } else if (reconnectAttemptsRef.current >= mergedConfig.maxReconnectAttempts) {
          setError(new Error('连接失败，已达到最大重连次数'))
          events?.onError?.(new Error('连接失败'))
        }
      })

      // 连接错误事件
      socketRef.current.on('connect_error', (error) => {
        setStatus('error')
        setError(error)
        events?.onError?.(error)
      })

    } catch (error) {
      setStatus('error')
      setError(error as Error)
      events?.onError?.(error as Error)
    }
  }, [getAuthToken, events, mergedConfig, clearTimers])

  // 断开连接
  const disconnect = useCallback(() => {
    isManualCloseRef.current = true
    clearTimers()
    
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
    
    setStatus('disconnected')
    setIsAuthenticated(false)
    setError(null)
  }, [clearTimers])

  // 发送消息（如果需要）
  const sendMessage = useCallback((eventName: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(eventName, data)
      return true
    }
    return false
  }, [])

  // 自动连接和清理
  useEffect(() => {
    connect()
    
    return () => {
      disconnect()
    }
  }, []) // 只在组件挂载时执行一次

  // 监听认证状态变化
  useEffect(() => {
    const handleAuthChange = () => {
      if (apiClient.isAuthenticated()) {
        // 用户登录，连接Socket.IO
        if (status === 'disconnected') {
          connect()
        }
      } else {
        // 用户登出，断开连接
        disconnect()
      }
    }

    // 监听存储变化（简单的认证状态检测）
    window.addEventListener('storage', handleAuthChange)
    
    return () => {
      window.removeEventListener('storage', handleAuthChange)
    }
  }, [connect, disconnect, status])

  return {
    status,
    isConnected: status === 'connected' && isAuthenticated,
    isAuthenticated,
    error,
    connect,
    disconnect,
    sendMessage,
    socket: socketRef.current,
  }
}