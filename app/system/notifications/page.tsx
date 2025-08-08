'use client'

import { useState, useEffect, useMemo } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { 
  Bell,
  BellRing,
  Check, 
  CheckCheck, 
  Archive, 
  Trash2, 
  ExternalLink,
  Settings,
  RefreshCw,
  Filter,
  Search,
  MoreHorizontal,
  Wifi,
  WifiOff,
  AlertCircle,
  Info,
  AlertTriangle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LoadingState } from '@/components/ui/loading-state'
import { ErrorDisplay } from '@/components/ui/error-display'
import { cn } from '@/lib/utils'
import { useNotificationContext } from '@/contexts/notification-context'
import { useAdminNotifications } from '@/hooks/use-api'
import {
  useMarkAllNotificationsAsRead,
  useArchiveNotification,
  useDeleteNotification,
  useFilterTree,
} from '@/hooks/use-api'
import { useDictionaryOptions } from '@/lib/dictionary-utils'
import type { AdminNotificationQuery, AdminNotification, FilterTreeNode } from '@/lib/types'

export default function NotificationsPage() {
  const [query, setQuery] = useState<AdminNotificationQuery>({
    page: 1,
    limit: 20,
  })
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all') // 大类选择
  const [availableTypes, setAvailableTypes] = useState<FilterTreeNode[]>([]) // 可用的小类选项
  
  // 获取筛选树数据
  const { data: filterTreeData, isLoading: filterTreeLoading, error: filterTreeError } = useFilterTree()
  
  // 安全处理筛选树数据
  const filterTree = useMemo(() => {
    if (!filterTreeData) return []
    
    // 如果直接是数组，直接使用
    if (Array.isArray(filterTreeData)) {
      return filterTreeData
    }
    
    // 如果有data字段且是数组，使用data
    if (filterTreeData.data && Array.isArray(filterTreeData.data)) {
      return filterTreeData.data
    }
    
    // 兜底返回空数组
    return []
  }, [filterTreeData])
  

  // 获取全局通知状态（用于WebSocket连接、统计数据等）
  const globalNotifications = useNotificationContext()

  // 获取页面级通知数据（用于列表显示、筛选等）
  const {
    data: notificationsResponse,
    isLoading,
    error,
    refetch: refetchPageNotifications, // 页面级数据刷新
  } = useAdminNotifications(query)

  // 从响应中提取数据
  const notifications = notificationsResponse?.data || []
  const meta = notificationsResponse?.meta

  // 使用全局状态的其他数据
  const {
    unreadCount,
    unreadCountByPriority,
    isConnected,
    connectionError,
    refresh: globalRefresh,
    markAsRead,
    getPriorityColor,
    getCategoryIcon,
    wsStatus,
  } = globalNotifications

  // API操作hooks
  const markAllAsReadMutation = useMarkAllNotificationsAsRead()
  const archiveNotificationMutation = useArchiveNotification()
  const deleteNotificationMutation = useDeleteNotification()
  
  // 获取字典选项（使用新的字典系统）
  const notificationPriorities = useDictionaryOptions('admin_notification_priority')
  const notificationStatuses = useDictionaryOptions('admin_notification_status')
  const notificationCategories = useDictionaryOptions('admin_notification_category')
  const notificationTypes = useDictionaryOptions('admin_notification_type')

  // 处理搜索
  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword)
    setQuery(prev => ({ ...prev, page: 1 }))
  }

  // 处理筛选
  const handleFilter = (key: keyof AdminNotificationQuery, value: string) => {
    setQuery(prev => ({
      ...prev,
      [key]: value || undefined,
      page: 1,
    }))
  }
  
  // 处理大类选择变化
  const handleCategoryChange = (categoryValue: string) => {
    setSelectedCategory(categoryValue)
    
    if (categoryValue === 'all') {
      // 清空大类和小类筛选
      setAvailableTypes([])
      setQuery(prev => ({
        ...prev,
        category: undefined,
        type: undefined,
        page: 1,
      }))
    } else {
      // 查找对应的大类数据
      const category = filterTree.find(item => item.value === categoryValue)
      const types = category?.children || []
      setAvailableTypes(types)
      
      // 更新筛选参数，只选择大类
      setQuery(prev => ({
        ...prev,
        category: categoryValue,
        type: undefined, // 清空小类选择
        page: 1,
      }))
    }
  }
  
  // 处理小类选择变化
  const handleTypeChange = (typeValue: string) => {
    if (typeValue === 'all') {
      // 只保留大类筛选
      setQuery(prev => ({
        ...prev,
        type: undefined,
        page: 1,
      }))
    } else {
      // 选择具体小类
      setQuery(prev => ({
        ...prev,
        type: typeValue,
        page: 1,
      }))
    }
  }

  // 处理分页
  const handlePageChange = (page: number) => {
    setQuery(prev => ({ ...prev, page }))
  }

  // 处理通知操作
  const handleMarkAsRead = (id: number | string) => {
    markAsRead(id)
  }

  const handleArchive = (id: number | string) => {
    archiveNotificationMutation.mutate(id)
  }

  const handleDelete = (id: number | string) => {
    deleteNotificationMutation.mutate(id)
  }

  const handleNotificationClick = (notification: AdminNotification) => {
    // 标记为已读
    if (notification.readAt === null) {
      markAsRead(notification.id)
    }
    
    // 如果有跳转链接，则跳转
    if (notification.data?.actionUrl) {
      window.open(notification.data.actionUrl, '_blank')
    }
  }

  // 获取优先级显示文本和图标
  const getPriorityDisplay = (priority: string) => {
    const config = {
      'critical': { text: '严重', icon: AlertCircle, color: 'text-red-600' },
      'urgent': { text: '紧急', icon: AlertTriangle, color: 'text-orange-600' },
      'high': { text: '高', icon: AlertTriangle, color: 'text-yellow-600' },
      'normal': { text: '普通', icon: Info, color: 'text-blue-600' },
      'low': { text: '低', icon: Info, color: 'text-gray-600' },
      // 兼容大写（后端可能返回大写）
      'CRITICAL': { text: '严重', icon: AlertCircle, color: 'text-red-600' },
      'URGENT': { text: '紧急', icon: AlertTriangle, color: 'text-orange-600' },
      'HIGH': { text: '高', icon: AlertTriangle, color: 'text-yellow-600' },
      'NORMAL': { text: '普通', icon: Info, color: 'text-blue-600' },
      'LOW': { text: '低', icon: Info, color: 'text-gray-600' },
    }
    return config[priority as keyof typeof config] || config.normal
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
  
  // 获取类型显示文本（优先使用筛选树，再使用字典）
  const getTypeText = (type: string, category: string) => {
    // 优先从筛选树中查找，因为筛选树提供了完整的中文名称
    if (filterTree && filterTree.length > 0) {
      const categoryNode = filterTree.find(item => item.value === category)
      if (categoryNode?.children) {
        const typeNode = categoryNode.children.find(child => child.value === type)
        if (typeNode) {
          return typeNode.label
        }
      }
    }
    
    // 如果筛选树中没有，再从字典中查找（处理大小写不匹配）
    // 先尝试精确匹配
    let typeOption = notificationTypes.find(option => option.value === type)
    
    // 如果精确匹配失败，尝试大写匹配
    if (!typeOption) {
      typeOption = notificationTypes.find(option => option.value === type.toUpperCase())
    }
    
    // 如果大写匹配也失败，尝试小写匹配
    if (!typeOption) {
      typeOption = notificationTypes.find(option => option.value.toLowerCase() === type.toLowerCase())
    }
    
    if (typeOption) {
      return typeOption.label
    }
    
    // 如果都找不到，返回原始值
    return type
  }

  // 获取连接状态显示
  const getConnectionStatus = () => {
    if (wsStatus === 'connected' && isConnected) {
      return { icon: Wifi, text: '实时连接已启用', color: 'text-green-600' }
    } else if (wsStatus === 'connecting') {
      return { icon: RefreshCw, text: '正在连接...', color: 'text-yellow-600' }
    } else {
      return { icon: WifiOff, text: '实时连接已断开', color: 'text-gray-400' }
    }
  }

  const connectionStatus = getConnectionStatus()

  return (
    <div className="space-y-6">
      {/* 页面标题和概览 */}
      <div>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">通知中心</h2>
            <p className="text-sm text-muted-foreground">
              管理系统通知和实时消息推送
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* 连接状态 */}
            <div className="flex items-center space-x-2">
              <connectionStatus.icon size={16} className={cn(connectionStatus.color, wsStatus === 'connecting' && 'animate-spin')} />
              <span className={cn('text-sm', connectionStatus.color)}>
                {connectionStatus.text}
              </span>
            </div>
            
            <Button onClick={() => {
              // 使用全局刷新，会同步所有相关数据
              globalRefresh()
            }} disabled={isLoading} size="sm">
              <RefreshCw size={16} className={cn('mr-2', isLoading && 'animate-spin')} />
              刷新
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">未读通知</CardTitle>
              <BellRing className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{unreadCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">严重</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {unreadCountByPriority.critical || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">紧急</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {unreadCountByPriority.urgent || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">高优先级</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {unreadCountByPriority.high || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">普通</CardTitle>
              <Info className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {unreadCountByPriority.normal || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">低优先级</CardTitle>
              <Info className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">
                {unreadCountByPriority.low || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 筛选和搜索 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>通知列表</CardTitle>
              <CardDescription>
                查看和管理所有系统通知消息
              </CardDescription>
            </div>
            
            {unreadCount > 0 && (
              <Button
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                size="sm"
              >
                <CheckCheck size={16} className="mr-2" />
                全部标记已读
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            {/* 搜索 */}
            <div className="flex-1 max-w-sm">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="搜索通知..."
                  value={searchKeyword}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* 状态筛选 */}
            <Select
              value={query.status || 'all'}
              onValueChange={(value) => handleFilter('status', value === 'all' ? '' : value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                {notificationStatuses.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 优先级筛选 */}
            <Select
              value={query.priority || 'all'}
              onValueChange={(value) => handleFilter('priority', value === 'all' ? '' : value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="优先级" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部优先级</SelectItem>
                {notificationPriorities.map(priority => (
                  <SelectItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 大类筛选 */}
            <Select
              value={selectedCategory}
              onValueChange={handleCategoryChange}
              disabled={filterTreeLoading}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="大类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部分类</SelectItem>
                {filterTree.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 小类筛选 - 仅在选择了大类时显示 */}
            {selectedCategory !== 'all' && availableTypes.length > 0 && (
              <Select
                value={query.type || 'all'}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="具体类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  {availableTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* 通知列表 */}
          {error ? (
            <ErrorDisplay 
              error={error} 
              onRetry={globalRefresh}
              className="py-8"
            />
          ) : isLoading ? (
            <LoadingState className="py-8" />
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <BellRing className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                暂无通知
              </h3>
              <p className="text-gray-500">
                当前没有符合筛选条件的通知消息
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>通知内容</TableHead>
                      <TableHead className="w-24">分类</TableHead>
                      <TableHead className="w-48">具体类型</TableHead>
                      <TableHead className="w-24">优先级</TableHead>
                      <TableHead className="w-32">状态</TableHead>
                      <TableHead className="w-32">时间</TableHead>
                      <TableHead className="w-20">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notifications.map((notification) => {
                      const isUnread = notification.readAt === null
                      const priorityDisplay = getPriorityDisplay(notification.priority)
                      const priorityColor = getPriorityColor(notification.priority)

                      return (
                        <TableRow 
                          key={notification.id}
                          className={cn(
                            'cursor-pointer hover:bg-gray-50',
                            isUnread && 'bg-blue-50/50'
                          )}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <TableCell>
                            <div className={cn('p-2 rounded-full text-lg', priorityColor)}>
                              {getCategoryIcon(notification.category)}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="space-y-1">
                              <p className={cn(
                                'font-medium text-sm',
                                isUnread && 'font-semibold'
                              )}>
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {notification.content}
                              </p>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <Badge variant="outline">
                              {getCategoryText(notification.category)}
                            </Badge>
                          </TableCell>
                          
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">
                              {getTypeText(notification.type, notification.category)}
                            </Badge>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <priorityDisplay.icon size={14} className={priorityDisplay.color} />
                              <span className={cn('text-xs', priorityDisplay.color)}>
                                {priorityDisplay.text}
                              </span>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            {isUnread ? (
                              <Badge className="bg-primary">未读</Badge>
                            ) : notification.archivedAt ? (
                              <Badge variant="outline">已归档</Badge>
                            ) : (
                              <Badge variant="secondary">已读</Badge>
                            )}
                          </TableCell>
                          
                          <TableCell>
                            <time className="text-sm text-gray-500">
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                                locale: zhCN,
                              })}
                            </time>
                          </TableCell>
                          
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {isUnread && (
                                  <DropdownMenuItem onClick={() => handleMarkAsRead(notification.id)}>
                                    <Check className="mr-2 h-4 w-4" />
                                    标记已读
                                  </DropdownMenuItem>
                                )}
                                {notification.data?.actionUrl && (
                                  <DropdownMenuItem onClick={() => window.open(notification.data!.actionUrl, '_blank')}>
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    查看详情
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => handleArchive(notification.id)}>
                                  <Archive className="mr-2 h-4 w-4" />
                                  归档
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(notification.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  删除
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* 分页 */}
              {meta && meta.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    第 {meta.currentPage} 页，共 {meta.totalPages} 页
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(Math.max(1, meta.currentPage - 1))}
                      disabled={meta.currentPage <= 1}
                    >
                      上一页
                    </Button>
                    <span className="text-sm text-gray-600">
                      {meta.currentPage} / {meta.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(Math.min(meta.totalPages, meta.currentPage + 1))}
                      disabled={meta.currentPage >= meta.totalPages}
                    >
                      下一页
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}