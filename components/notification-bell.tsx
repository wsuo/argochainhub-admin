'use client'

import { useState } from 'react'
import { Bell, BellRing, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useNotifications } from '@/hooks/use-notifications'
import { NotificationPanel } from './notification-panel'

interface NotificationBellProps {
  className?: string
  showConnectionStatus?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'ghost' | 'outline'
}

export function NotificationBell({ 
  className, 
  showConnectionStatus = true,
  size = 'md',
  variant = 'ghost'
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const {
    unreadCount,
    unreadCountByPriority,
    isConnected,
    connectionError,
    wsStatus,
    isLoading,
  } = useNotifications({
    enableRealtime: true,
    showToast: true,
    autoMarkAsRead: false,
  })

  // 获取按钮尺寸样式
  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'h-8 w-8'
      case 'md': return 'h-9 w-9'
      case 'lg': return 'h-10 w-10'
      default: return 'h-9 w-9'
    }
  }

  // 获取图标尺寸
  const getIconSize = () => {
    switch (size) {
      case 'sm': return 16
      case 'md': return 18
      case 'lg': return 20
      default: return 18
    }
  }

  // 确定显示的图标和状态
  const getNotificationIcon = () => {
    const iconSize = getIconSize()
    
    if (unreadCount > 0) {
      return <BellRing size={iconSize} className="text-primary" />
    }
    return <Bell size={iconSize} />
  }

  // 获取优先级最高的未读通知数量显示颜色
  const getBadgeColor = () => {
    if (unreadCountByPriority.CRITICAL > 0) return 'bg-red-600 hover:bg-red-700'
    if (unreadCountByPriority.URGENT > 0) return 'bg-orange-600 hover:bg-orange-700'
    if (unreadCountByPriority.HIGH > 0) return 'bg-yellow-600 hover:bg-yellow-700'
    if (unreadCountByPriority.NORMAL > 0) return 'bg-primary hover:bg-primary/90'
    return 'bg-gray-600 hover:bg-gray-700'
  }

  // 获取连接状态工具提示
  const getConnectionTooltip = () => {
    if (wsStatus === 'connecting') return '正在连接通知服务...'
    if (wsStatus === 'connected' && isConnected) return '实时通知已连接'
    if (wsStatus === 'disconnected') return '通知服务已断开'
    if (wsStatus === 'error' || connectionError) return `连接错误: ${connectionError?.message || '未知错误'}`
    return '通知服务状态未知'
  }

  // 获取连接状态图标
  const getConnectionIcon = () => {
    const iconSize = 12
    if (wsStatus === 'connected' && isConnected) {
      return <Wifi size={iconSize} className="text-green-600" />
    }
    return <WifiOff size={iconSize} className="text-gray-400" />
  }

  const buttonContent = (
    <div className="relative">
      {getNotificationIcon()}
      
      {/* 未读数量徽章 */}
      {unreadCount > 0 && (
        <Badge 
          className={cn(
            'absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs font-medium text-white border-2 border-background',
            getBadgeColor()
          )}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
      
      {/* 连接状态指示器 */}
      {showConnectionStatus && (
        <div className="absolute -bottom-1 -right-1">
          {getConnectionIcon()}
        </div>
      )}
      
      {/* 加载状态指示器 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
        </div>
      )}
    </div>
  )

  return (
    <TooltipProvider>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={variant}
                  size="icon"
                  className={cn(
                    getSizeClass(),
                    'relative focus-visible:ring-2 focus-visible:ring-primary',
                    unreadCount > 0 && 'text-primary',
                    className
                  )}
                  aria-label={`通知 ${unreadCount > 0 ? `(${unreadCount}条未读)` : ''}`}
                >
                  {buttonContent}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="flex items-center space-x-2">
                <span>
                  {unreadCount > 0 
                    ? `${unreadCount}条未读通知` 
                    : '暂无未读通知'
                  }
                </span>
                {showConnectionStatus && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-xs">{getConnectionTooltip()}</span>
                  </>
                )}
              </TooltipContent>
            </Tooltip>
          </div>
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-96 p-0 shadow-lg" 
          side="bottom" 
          align="end"
          sideOffset={8}
        >
          <NotificationPanel 
            onClose={() => setIsOpen(false)}
            maxHeight="400px"
          />
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  )
}

// 纯图标版本，用于空间受限的地方
export function NotificationBellIcon({ 
  className,
  size = 18 
}: { 
  className?: string
  size?: number 
}) {
  const { unreadCount, isConnected } = useNotifications({
    enableRealtime: true,
    showToast: false,
    autoMarkAsRead: false,
  })

  return (
    <div className={cn('relative', className)}>
      {unreadCount > 0 ? (
        <BellRing size={size} className="text-primary" />
      ) : (
        <Bell size={size} />
      )}
      
      {/* 未读数量小点 */}
      {unreadCount > 0 && (
        <div className="absolute -top-1 -right-1 h-2 w-2 bg-red-600 rounded-full" />
      )}
      
      {/* 连接状态小点 */}
      <div className={cn(
        'absolute -bottom-1 -right-1 h-2 w-2 rounded-full',
        isConnected ? 'bg-green-500' : 'bg-gray-400'
      )} />
    </div>
  )
}

export default NotificationBell