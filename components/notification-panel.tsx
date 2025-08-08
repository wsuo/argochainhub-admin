'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { 
  Check, 
  CheckCheck, 
  Archive, 
  Trash2, 
  ExternalLink,
  Settings,
  RefreshCw,
  Filter,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useNotificationContext } from '@/contexts/notification-context'
import { useMarkAllNotificationsAsRead } from '@/hooks/use-api'
import { useDictionaryOptions } from '@/lib/dictionary-utils'
import type { AdminNotificationQuery, AdminNotification } from '@/lib/types'

interface NotificationPanelProps {
  onClose?: () => void
  maxHeight?: string
  showHeader?: boolean
  showFooter?: boolean
  className?: string
}

export function NotificationPanel({
  onClose,
  maxHeight = '400px',
  showHeader = true,
  showFooter = true,
  className,
}: NotificationPanelProps) {
  const [filter, setFilter] = useState<AdminNotificationQuery>({
    page: 1,
    limit: 10,
  })

  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    refresh,
    markAsRead,
    getPriorityColor,
    getCategoryIcon,
    isConnected,
  } = useNotificationContext()

  const markAllAsReadMutation = useMarkAllNotificationsAsRead()
  
  // 获取字典选项（使用新的字典系统）
  const notificationPriorities = useDictionaryOptions('admin_notification_priority')
  const notificationStatuses = useDictionaryOptions('admin_notification_status')
  const notificationCategories = useDictionaryOptions('admin_notification_category')
  const notificationTypes = useDictionaryOptions('admin_notification_type')
  
  // 处理通知点击
  const handleNotificationClick = (notification: AdminNotification) => {
    // 标记为已读 - 兼容大小写
    if (notification.status === 'UNREAD' || notification.status === 'unread') {
      markAsRead(notification.id)
    }
    
    // 如果有跳转链接，则跳转
    if (notification.data?.actionUrl) {
      window.open(notification.data.actionUrl, '_blank')
    }
  }

  // 获取优先级显示文本 - 使用字典系统
  const getPriorityText = (priority: string) => {
    // 优先从字典中查找
    const priorityOption = notificationPriorities.find(option => 
      option.value === priority || option.value.toLowerCase() === priority.toLowerCase()
    )
    
    if (priorityOption) {
      return priorityOption.label
    }
    
    // 如果字典中没有，使用备用映射
    const priorityMap: Record<string, string> = {
      // 小写（API期望的格式）
      'critical': '严重',
      'urgent': '紧急', 
      'high': '高',
      'normal': '普通',
      'low': '低',
      // 兼容大写（可能的返回值）
      'CRITICAL': '严重',
      'URGENT': '紧急', 
      'HIGH': '高',
      'NORMAL': '普通',
      'LOW': '低',
    }
    return priorityMap[priority] || priority
  }

  // 获取分类显示文本 - 使用字典系统
  const getCategoryText = (category: string) => {
    // 优先从字典中查找
    const categoryOption = notificationCategories.find(option => 
      option.value === category || option.value.toLowerCase() === category.toLowerCase()
    )
    
    if (categoryOption) {
      return categoryOption.label
    }
    
    // 如果字典中没有，使用备用映射
    const categoryMap: Record<string, string> = {
      'review': '审核',
      'business': '业务',
      'operation': '运营',
      'system': '系统',
      'security': '安全',
    }
    return categoryMap[category] || category
  }

  // 渲染单个通知项
  const renderNotificationItem = (notification: AdminNotification) => {
    const isUnread = notification.status === 'UNREAD' || notification.status === 'unread'
    const priorityColor = getPriorityColor(notification.priority)
    
    return (
      <div
        key={notification.id}
        className={cn(
          'p-3 border-b last:border-b-0 cursor-pointer transition-colors hover:bg-gray-50',
          isUnread && 'bg-blue-50/50 border-l-4 border-l-primary'
        )}
        onClick={() => handleNotificationClick(notification)}
      >
        <div className="flex items-start space-x-3">
          {/* 图标和优先级指示器 */}
          <div className="flex-shrink-0 pt-1">
            <div className={cn('p-2 rounded-full text-sm', priorityColor)}>
              {getCategoryIcon(notification.category)}
            </div>
          </div>
          
          {/* 通知内容 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h4 className={cn(
                'text-sm font-medium text-gray-900 line-clamp-2',
                isUnread && 'font-semibold'
              )}>
                {notification.title}
              </h4>
              
              {/* 时间和状态 */}
              <div className="flex-shrink-0 ml-2">
                <time className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                    locale: zhCN,
                  })}
                </time>
              </div>
            </div>
            
            {/* 通知内容 */}
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
              {notification.content}
            </p>
            
            {/* 标签 */}
            <div className="mt-2 flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {getCategoryText(notification.category)}
              </Badge>
              <Badge 
                variant="outline" 
                className={cn('text-xs', priorityColor)}
              >
                {getPriorityText(notification.priority)}
              </Badge>
              {isUnread && (
                <Badge className="text-xs bg-primary">
                  未读
                </Badge>
              )}
            </div>
          </div>
          
          {/* 操作按钮 */}
          <div className="flex-shrink-0 flex items-center space-x-1">
            {isUnread && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        markAsRead(notification.id)
                      }}
                    >
                      <Check size={12} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>标记已读</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {notification.data?.actionUrl && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(notification.data!.actionUrl, '_blank')
                      }}
                    >
                      <ExternalLink size={12} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>查看详情</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('bg-white rounded-lg border shadow-lg', className)}>
      {/* 头部 */}
      {showHeader && (
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">
                通知中心
              </h3>
              {unreadCount > 0 && (
                <Badge className="bg-primary">
                  {unreadCount}条未读
                </Badge>
              )}
              {/* 连接状态指示器 */}
              <div className={cn(
                'h-2 w-2 rounded-full',
                isConnected ? 'bg-green-500' : 'bg-gray-400'
              )} />
            </div>
            
            <div className="flex items-center space-x-2">
              {/* 刷新按钮 */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={refresh}
                      disabled={isLoading}
                    >
                      <RefreshCw size={14} className={cn(isLoading && 'animate-spin')} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>刷新通知</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {/* 全部标记已读 */}
              {unreadCount > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => markAllAsReadMutation.mutate()}
                        disabled={markAllAsReadMutation.isPending}
                      >
                        <CheckCheck size={14} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>全部标记已读</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {/* 关闭按钮 */}
              {onClose && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={onClose}
                >
                  <X size={14} />
                </Button>
              )}
            </div>
          </div>
          
          {/* 筛选器 */}
          <div className="mt-3 flex items-center space-x-2">
            <Select
              value={filter.status || 'all'}
              onValueChange={(value) => setFilter(prev => ({ 
                ...prev, 
                status: value === 'all' ? undefined : value,
                page: 1 
              }))}
            >
              <SelectTrigger className="w-24 h-8">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                {notificationStatuses.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={filter.priority || 'all'}
              onValueChange={(value) => setFilter(prev => ({ 
                ...prev, 
                priority: value === 'all' ? undefined : value,
                page: 1 
              }))}
            >
              <SelectTrigger className="w-20 h-8">
                <SelectValue placeholder="优先级" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                {notificationPriorities.map(priority => (
                  <SelectItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      
      {/* 通知列表 */}
      <div 
        style={{ maxHeight }}
        className="relative overflow-y-auto overflow-x-hidden"
        onWheel={(e) => {
          e.stopPropagation()
          // 确保滚动事件不会冒泡到父元素
        }}
        onTouchMove={(e) => {
          e.stopPropagation()
        }}
        onTouchStart={(e) => {
          e.stopPropagation()
        }}
        onTouchEnd={(e) => {
          e.stopPropagation()
        }}
        onScroll={(e) => {
          e.stopPropagation()
        }}
        onMouseDown={(e) => {
          // 防止拖拽时影响主页面
          e.stopPropagation()
        }}
      >
        {error ? (
          <div className="p-4 text-center text-red-600">
            <p>加载通知失败</p>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={refresh}
              className="mt-2"
            >
              重试
            </Button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">🔔</div>
            <p>暂无通知</p>
          </div>
        ) : (
          <div>
            {notifications.map(renderNotificationItem)}
          </div>
        )}
      </div>
      
      {/* 底部操作栏 */}
      {showFooter && (
        <>
          <Separator />
          <div className="p-3 bg-gray-50 rounded-b-lg">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                共 {notifications.length} 条通知
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  // 跳转到完整的通知管理页面
                  window.location.href = '/system/notifications'
                }}
                className="text-xs"
              >
                查看全部通知
                <ExternalLink size={12} className="ml-1" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default NotificationPanel