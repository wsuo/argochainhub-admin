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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Loader2, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Power,
  RotateCcw,
  Settings,
  Mail,
  Shield,
  CheckCircle2,
  XCircle,
  TestTube
} from 'lucide-react'
import { DataPagination } from '@/components/data-pagination'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { ErrorBoundary } from '@/components/error-boundary'
import { LoadingState } from '@/components/ui/loading-state'
import { ErrorDisplay } from '@/components/ui/error-display'
import { 
  useEmailConfigs, 
  useDeleteEmailConfig,
  useTestEmailConfig
} from '@/hooks/use-api'
import type { EmailConfigQuery, EmailConfig, TestEmailConfigRequest } from '@/lib/types'

export default function EmailConfigsPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [isActiveFilter, setIsActiveFilter] = useState<string>('all')
  const [isDefaultFilter, setIsDefaultFilter] = useState<string>('all')
  const [searchInput, setSearchInput] = useState('')
  
  // 删除对话框状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingConfigId, setDeletingConfigId] = useState<number | null>(null)
  
  // 测试邮件对话框状态
  const [testDialogOpen, setTestDialogOpen] = useState(false)
  const [testingConfigId, setTestingConfigId] = useState<number | null>(null)
  const [testEmail, setTestEmail] = useState('')

  // 构建查询参数
  const query: EmailConfigQuery = {
    page,
    limit: 20,
    ...(keyword && { name: keyword }),
    ...(isActiveFilter !== 'all' && { isActive: isActiveFilter === 'true' }),
    ...(isDefaultFilter !== 'all' && { isDefault: isDefaultFilter === 'true' }),
  }

  // API调用
  const { data: emailConfigsData, isLoading, error } = useEmailConfigs(query)
  const deleteEmailConfigMutation = useDeleteEmailConfig()
  const testEmailConfigMutation = useTestEmailConfig()

  // 处理搜索
  const handleSearch = () => {
    setKeyword(searchInput.trim())
    setPage(1)
  }

  // 处理重置搜索
  const handleResetSearch = () => {
    setSearchInput('')
    setKeyword('')
    setIsActiveFilter('all')
    setIsDefaultFilter('all')
    setPage(1)
  }

  // 处理删除
  const handleDelete = (id: number) => {
    setDeletingConfigId(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (deletingConfigId) {
      deleteEmailConfigMutation.mutate(deletingConfigId, {
        onSuccess: () => {
          setDeleteDialogOpen(false)
          setDeletingConfigId(null)
        }
      })
    }
  }

  // 处理测试邮件配置
  const handleTest = (id: number) => {
    setTestingConfigId(id)
    setTestDialogOpen(true)
    setTestEmail('')
  }

  const confirmTest = () => {
    if (testingConfigId && testEmail.trim()) {
      const testData: TestEmailConfigRequest = {
        testEmail: testEmail.trim()
      }
      testEmailConfigMutation.mutate(
        { id: testingConfigId, data: testData },
        {
          onSuccess: () => {
            setTestDialogOpen(false)
            setTestingConfigId(null)
            setTestEmail('')
          }
        }
      )
    }
  }

  // 获取状态徽章
  const getStatusBadge = (config: EmailConfig) => {
    if (!config.isActive) {
      return <Badge variant="secondary" className="bg-gray-100 text-gray-600">已禁用</Badge>
    }
    if (config.isDefault) {
      return <Badge variant="default" className="bg-green-100 text-green-700">默认配置</Badge>
    }
    return <Badge variant="outline" className="text-blue-600">已启用</Badge>
  }

  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorDisplay error={error} />
  }

  const emailConfigs = emailConfigsData?.items || []
  const totalPages = emailConfigsData?.totalPages || 1

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* 页面标题和操作 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">邮件配置</h1>
            <p className="text-sm text-gray-600">管理SMTP邮件服务器配置</p>
          </div>
          <Button onClick={() => router.push('/system/email-configs/new')}>
            <Plus className="w-4 h-4 mr-2" />
            新增配置
          </Button>
        </div>

        {/* 搜索和筛选 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">搜索筛选</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 搜索输入框 */}
              <div className="space-y-2">
                <Label htmlFor="search">配置名称</Label>
                <div className="flex space-x-2">
                  <Input
                    id="search"
                    placeholder="输入配置名称..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>

              {/* 状态筛选 */}
              <div className="space-y-2">
                <Label>启用状态</Label>
                <Select value={isActiveFilter} onValueChange={setIsActiveFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="true">已启用</SelectItem>
                    <SelectItem value="false">已禁用</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 默认配置筛选 */}
              <div className="space-y-2">
                <Label>默认配置</Label>
                <Select value={isDefaultFilter} onValueChange={setIsDefaultFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部配置</SelectItem>
                    <SelectItem value="true">默认配置</SelectItem>
                    <SelectItem value="false">非默认配置</SelectItem>
                  </SelectContent>
                </Select>
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

        {/* 邮件配置列表 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">配置列表</CardTitle>
              <div className="text-sm text-gray-600">
                共 {emailConfigsData?.total || 0} 条记录
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {emailConfigs.length === 0 ? (
              <div className="text-center py-12">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">暂无邮件配置</p>
                <Button onClick={() => router.push('/system/email-configs/new')}>
                  <Plus className="w-4 h-4 mr-2" />
                  新增邮件配置
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>配置名称</TableHead>
                      <TableHead>SMTP服务器</TableHead>
                      <TableHead>发件人</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>重试设置</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emailConfigs.map((config) => (
                      <TableRow key={config.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{config.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">{config.host}:{config.port}</span>
                              {config.secure && (
                                <Shield className="w-3 h-3 text-green-500" title="SSL/TLS加密" />
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              用户: {config.authUser}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">{config.fromName}</div>
                            <div className="text-xs text-gray-500">{config.fromEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(config)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            最大重试: {config.maxRetries}次
                            <br />
                            <span className="text-xs text-gray-500">
                              延迟: {config.retryDelay}秒
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {format(new Date(config.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTest(config.id)}
                              className="h-8 px-2"
                            >
                              <TestTube className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/system/email-configs/${config.id}/edit`)}
                              className="h-8 px-2"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(config.id)}
                              className="h-8 px-2 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
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

        {/* 删除确认对话框 */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除</AlertDialogTitle>
              <AlertDialogDescription>
                您确定要删除这个邮件配置吗？此操作不可撤销。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={deleteEmailConfigMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteEmailConfigMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* 测试邮件对话框 */}
        <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>测试邮件配置</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="test-email">测试邮箱地址</Label>
                <Input
                  id="test-email"
                  type="email"
                  placeholder="输入用于测试的邮箱地址"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setTestDialogOpen(false)}>
                  取消
                </Button>
                <Button
                  onClick={confirmTest}
                  disabled={!testEmail.trim() || testEmailConfigMutation.isPending}
                >
                  {testEmailConfigMutation.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  发送测试邮件
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ErrorBoundary>
  )
}