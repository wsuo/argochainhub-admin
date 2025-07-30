'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  Loader2, 
  Search, 
  RotateCcw,
  Mail,
  Eye,
  RefreshCw,
  Calendar,
  User,
  FileText,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Send
} from 'lucide-react'
import { DataPagination } from '@/components/data-pagination'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { ErrorBoundary } from '@/components/error-boundary'
import { LoadingState } from '@/components/ui/loading-state'
import { ErrorDisplay } from '@/components/ui/error-display'
import { 
  useEmailHistories, 
  useEmailHistory,
  useResendEmail,
  useEmailStatistics
} from '@/hooks/use-api'
import type { 
  EmailHistoryQuery, 
  EmailHistory, 
  EmailStatus,
  SupportedLanguage 
} from '@/lib/types'
import { getMultiLangText } from '@/lib/multi-lang-utils'

// 邮件状态配置
const STATUS_CONFIG: Record<EmailStatus, { 
  label: string
  color: string
  icon: React.ComponentType<{ className?: string }>
}> = {
  pending: { 
    label: '待发送', 
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock
  },
  sending: { 
    label: '发送中', 
    color: 'bg-blue-100 text-blue-800',
    icon: Send
  },
  sent: { 
    label: '已发送', 
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle2
  },
  failed: { 
    label: '发送失败', 
    color: 'bg-red-100 text-red-800',
    icon: XCircle
  },
  retry: { 
    label: '重试中', 
    color: 'bg-orange-100 text-orange-800',
    icon: RefreshCw
  }
}

// 语言选项
const LANGUAGE_OPTIONS = {
  'zh-CN': { label: '中文', flag: '🇨🇳' },
  'en': { label: 'English', flag: '🇺🇸' },
  'es': { label: 'Español', flag: '🇪🇸' }
}

export default function EmailHistoriesPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [toEmailFilter, setToEmailFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [relatedTypeFilter, setRelatedTypeFilter] = useState<string>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [searchInput, setSearchInput] = useState('')
  
  // 对话框状态
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedEmailId, setSelectedEmailId] = useState<number | null>(null)
  const [resendDialogOpen, setResendDialogOpen] = useState(false)
  const [resendingEmailId, setResendingEmailId] = useState<number | null>(null)

  // 构建查询参数
  const query: EmailHistoryQuery = {
    page,
    limit: 20,
    ...(toEmailFilter && { toEmail: toEmailFilter }),
    ...(statusFilter !== 'all' && { status: statusFilter as EmailStatus }),
    ...(relatedTypeFilter !== 'all' && { relatedType: relatedTypeFilter }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  }

  // API调用
  const { data: emailHistoriesData, isLoading, error } = useEmailHistories(query)
  const { data: emailDetail } = useEmailHistory(selectedEmailId || 0)
  const { data: statistics } = useEmailStatistics(7) // 最近7天的统计
  const resendEmailMutation = useResendEmail()

  // 处理搜索
  const handleSearch = () => {
    setToEmailFilter(searchInput.trim())
    setPage(1)
  }

  // 处理重置搜索
  const handleResetSearch = () => {
    setSearchInput('')
    setToEmailFilter('')
    setStatusFilter('all')
    setRelatedTypeFilter('all')
    setStartDate('')
    setEndDate('')
    setPage(1)
  }

  // 处理查看详情
  const handleViewDetail = (id: number) => {
    setSelectedEmailId(id)
    setDetailDialogOpen(true)
  }

  // 处理重新发送
  const handleResend = (id: number) => {
    setResendingEmailId(id)
    setResendDialogOpen(true)
  }

  const confirmResend = () => {
    if (resendingEmailId) {
      resendEmailMutation.mutate(
        { id: resendingEmailId },
        {
          onSuccess: () => {
            setResendDialogOpen(false)
            setResendingEmailId(null)
          }
        }
      )
    }
  }

  // 获取状态徽章
  const getStatusBadge = (status: EmailStatus) => {
    const config = STATUS_CONFIG[status]
    const Icon = config.icon
    return (
      <Badge variant="outline" className={`${config.color} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  // 获取关联类型显示名称
  const getRelatedTypeName = (type: string) => {
    const typeNames: Record<string, string> = {
      'inquiry': '询价',
      'sample_request': '样品申请',
      'registration_request': '登记申请',
      'company': '企业',
      'user': '用户'
    }
    return typeNames[type] || type
  }

  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorDisplay error={error} />
  }

  const emailHistories = emailHistoriesData?.items || []
  const totalPages = emailHistoriesData?.totalPages || 1

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">邮件发送历史</h1>
            <p className="text-sm text-gray-600">查看和管理所有邮件发送记录</p>
          </div>
        </div>

        {/* 统计信息 */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {statistics.statusCounts.map((stat) => {
              const config = STATUS_CONFIG[stat.status]
              const Icon = config.icon
              return (
                <Card key={stat.status}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${config.color} bg-opacity-20`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          {config.label}
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stat.count}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* 搜索和筛选 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">搜索筛选</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* 收件人搜索 */}
              <div className="space-y-2">
                <Label htmlFor="search">收件人邮箱</Label>
                <Input
                  id="search"
                  placeholder="输入邮箱地址..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              {/* 状态筛选 */}
              <div className="space-y-2">
                <Label>发送状态</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                      <SelectItem key={status} value={status}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 关联类型筛选 */}
              <div className="space-y-2">
                <Label>关联类型</Label>
                <Select value={relatedTypeFilter} onValueChange={setRelatedTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类型</SelectItem>
                    <SelectItem value="inquiry">询价</SelectItem>
                    <SelectItem value="sample_request">样品申请</SelectItem>
                    <SelectItem value="registration_request">登记申请</SelectItem>
                    <SelectItem value="company">企业</SelectItem>
                    <SelectItem value="user">用户</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 开始日期 */}
              <div className="space-y-2">
                <Label htmlFor="startDate">开始日期</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              {/* 结束日期 */}
              <div className="space-y-2">
                <Label htmlFor="endDate">结束日期</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              {/* 搜索按钮 */}
              <div className="flex items-end space-x-2">
                <Button onClick={handleSearch} className="flex-1">
                  <Search className="w-4 h-4 mr-2" />
                  搜索
                </Button>
                <Button variant="outline" onClick={handleResetSearch}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 邮件历史列表 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">发送记录</CardTitle>
              <div className="text-sm text-gray-600">
                共 {emailHistoriesData?.total || 0} 条记录
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {emailHistories.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">暂无邮件发送记录</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>收件人信息</TableHead>
                      <TableHead>邮件主题</TableHead>
                      <TableHead>模板信息</TableHead>
                      <TableHead>语言</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>发送时间</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emailHistories.map((email) => (
                      <TableRow key={email.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{email.toName}</span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {email.toEmail}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="font-medium truncate" title={email.subject}>
                              {email.subject}
                            </div>
                            {email.relatedType && (
                              <div className="text-xs text-gray-500 mt-1">
                                关联: {getRelatedTypeName(email.relatedType)}
                                {email.relatedId && ` #${email.relatedId}`}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          {email.template ? (
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <FileText className="w-4 h-4 text-blue-500" />
                                <span className="text-sm font-medium">
                                  {getMultiLangText(email.template.name, 'zh-CN')}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {email.template.code}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">直接发送</span>
                          )}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">
                              {LANGUAGE_OPTIONS[email.language]?.flag || '🌐'}
                            </span>
                            <span className="text-sm">
                              {LANGUAGE_OPTIONS[email.language]?.label || email.language}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            {getStatusBadge(email.status)}
                            {email.attempts > 1 && (
                              <div className="text-xs text-gray-500">
                                尝试 {email.attempts} 次
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            {email.sentAt ? (
                              <div className="text-sm">
                                {format(new Date(email.sentAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">未发送</span>
                            )}
                            <div className="text-xs text-gray-500">
                              创建: {format(new Date(email.createdAt), 'MM-dd HH:mm', { locale: zhCN })}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetail(email.id)}
                              className="h-8 px-2"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            {(email.status === 'failed' || email.status === 'retry') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleResend(email.id)}
                                className="h-8 px-2 text-orange-600 hover:text-orange-700"
                              >
                                <RefreshCw className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* 分页 */}
                {totalPages > 1 && (
                  <DataPagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 邮件详情对话框 */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>邮件详情</DialogTitle>
            </DialogHeader>
            {emailDetail && (
              <div className="space-y-6 py-4">
                {/* 基本信息 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">收件人</Label>
                    <div className="text-sm">
                      {emailDetail.toName} ({emailDetail.toEmail})
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">发送状态</Label>
                    <div>{getStatusBadge(emailDetail.status)}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">语言</Label>
                    <div className="text-sm">
                      {LANGUAGE_OPTIONS[emailDetail.language]?.flag} {LANGUAGE_OPTIONS[emailDetail.language]?.label}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">尝试次数</Label>
                    <div className="text-sm">{emailDetail.attempts} 次</div>
                  </div>
                </div>

                {/* 邮件内容 */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">邮件主题</Label>
                    <div className="p-3 border rounded-lg bg-gray-50">
                      {emailDetail.subject}
                    </div>
                  </div>
                  {emailDetail.body && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">邮件内容</Label>
                      <div 
                        className="p-4 border rounded-lg bg-white max-h-96 overflow-y-auto"
                        dangerouslySetInnerHTML={{ __html: emailDetail.body }}
                      />
                    </div>
                  )}
                </div>

                {/* 模板变量 */}
                {emailDetail.variables && Object.keys(emailDetail.variables).length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">模板变量</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Object.entries(emailDetail.variables).map(([key, value]) => (
                        <div key={key} className="flex items-center space-x-2 text-sm">
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                            {key}
                          </span>
                          <span>=</span>
                          <span className="text-gray-600">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 错误信息 */}
                {emailDetail.errorMessage && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-red-600">错误信息</Label>
                    <div className="p-3 border border-red-200 rounded-lg bg-red-50 text-red-700 text-sm">
                      {emailDetail.errorMessage}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* 重新发送确认对话框 */}
        <AlertDialog open={resendDialogOpen} onOpenChange={setResendDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认重新发送</AlertDialogTitle>
              <AlertDialogDescription>
                您确定要重新发送这封邮件吗？系统将使用当前的邮件配置重新发送。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmResend}
                disabled={resendEmailMutation.isPending}
              >
                {resendEmailMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                重新发送
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ErrorBoundary>
  )
}