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
  RotateCcw,
  FileText,
  Mail,
  Eye,
  Globe,
  Tag,
  Zap
} from 'lucide-react'
import { DataPagination } from '@/components/data-pagination'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { ErrorBoundary } from '@/components/error-boundary'
import { LoadingState } from '@/components/ui/loading-state'
import { ErrorDisplay } from '@/components/ui/error-display'
import { 
  useEmailTemplates, 
  useDeleteEmailTemplate,
  useEmailTriggerEvents,
  usePreviewEmailTemplate
} from '@/hooks/use-api'
import type { 
  EmailTemplateQuery, 
  EmailTemplate, 
  PreviewEmailTemplateRequest,
  SupportedLanguage 
} from '@/lib/types'
import { getMultiLangText } from '@/lib/multi-lang-utils'

// 语言选项
const LANGUAGE_OPTIONS = {
  'zh-CN': { label: '中文', flag: '🇨🇳' },
  'en': { label: 'English', flag: '🇺🇸' },
  'es': { label: 'Español', flag: '🇪🇸' }
}

export default function EmailTemplatesPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [codeFilter, setCodeFilter] = useState('')
  const [isActiveFilter, setIsActiveFilter] = useState<string>('all')
  const [triggerEventFilter, setTriggerEventFilter] = useState<string>('all')
  const [searchInput, setSearchInput] = useState('')
  
  // 删除对话框状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingTemplateId, setDeletingTemplateId] = useState<number | null>(null)
  
  // 预览对话框状态
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [previewingTemplateId, setPreviewingTemplateId] = useState<number | null>(null)
  const [previewLanguage, setPreviewLanguage] = useState<SupportedLanguage>('zh-CN')
  const [previewVariables, setPreviewVariables] = useState<Record<string, string>>({})
  const [previewResult, setPreviewResult] = useState<{ subject: string; body: string } | null>(null)

  // 构建查询参数
  const query: EmailTemplateQuery = {
    page,
    limit: 20,
    ...(keyword && { name: keyword }),
    ...(codeFilter && { code: codeFilter }),
    ...(isActiveFilter !== 'all' && { isActive: isActiveFilter === 'true' }),
    ...(triggerEventFilter !== 'all' && { triggerEvent: triggerEventFilter }),
  }

  // API调用
  const { data: emailTemplatesData, isLoading, error } = useEmailTemplates(query)
  const { data: triggerEvents } = useEmailTriggerEvents()
  const deleteEmailTemplateMutation = useDeleteEmailTemplate()
  const previewEmailTemplateMutation = usePreviewEmailTemplate()

  // 处理搜索
  const handleSearch = () => {
    setKeyword(searchInput.trim())
    setCodeFilter('')
    setPage(1)
  }

  // 处理重置搜索
  const handleResetSearch = () => {
    setSearchInput('')
    setKeyword('')
    setCodeFilter('')
    setIsActiveFilter('all')
    setTriggerEventFilter('all')
    setPage(1)
  }

  // 处理删除
  const handleDelete = (id: number) => {
    setDeletingTemplateId(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (deletingTemplateId) {
      deleteEmailTemplateMutation.mutate(deletingTemplateId, {
        onSuccess: () => {
          setDeleteDialogOpen(false)
          setDeletingTemplateId(null)
        }
      })
    }
  }

  // 处理预览
  const handlePreview = (template: EmailTemplate) => {
    setPreviewingTemplateId(template.id)
    setPreviewLanguage('zh-CN')
    
    // 初始化预览变量
    const initialVariables: Record<string, string> = {}
    template.variables.forEach(variable => {
      initialVariables[variable.name] = variable.example
    })
    setPreviewVariables(initialVariables)
    
    setPreviewDialogOpen(true)
    
    // 立即执行预览
    generatePreview(template.id, 'zh-CN', initialVariables)
  }

  // 生成预览
  const generatePreview = (templateId: number, language: SupportedLanguage, variables: Record<string, string>) => {
    const previewData: PreviewEmailTemplateRequest = {
      variables,
      language
    }
    
    previewEmailTemplateMutation.mutate(
      { id: templateId, data: previewData },
      {
        onSuccess: (result) => {
          setPreviewResult(result)
        }
      }
    )
  }

  // 更新预览
  const updatePreview = () => {
    if (previewingTemplateId) {
      generatePreview(previewingTemplateId, previewLanguage, previewVariables)
    }
  }

  // 获取状态徽章
  const getStatusBadge = (template: EmailTemplate) => {
    return template.isActive ? (
      <Badge variant="default" className="bg-green-100 text-green-700">已启用</Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-600">已禁用</Badge>
    )
  }

  // 获取触发事件显示名称
  const getTriggerEventName = (event: string) => {
    const eventNames: Record<string, string> = {
      'inquiry.created': '询价创建',
      'inquiry.quoted': '询价报价',
      'inquiry.accepted': '询价接受',
      'inquiry.declined': '询价拒绝',
      'inquiry.expired': '询价过期',
      'sample_request.created': '样品申请创建',
      'sample_request.approved': '样品申请批准',
      'sample_request.rejected': '样品申请拒绝',
      'sample_request.shipped': '样品发货',
      'sample_request.delivered': '样品送达',
      'registration_request.created': '登记申请创建',
      'registration_request.processing': '登记申请处理中',
      'registration_request.completed': '登记申请完成',
      'company.approved': '企业审核通过',
      'company.rejected': '企业审核拒绝',
      'user.welcome': '用户欢迎',
      'user.password_reset': '密码重置'
    }
    return eventNames[event] || event
  }

  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorDisplay error={error} />
  }

  const emailTemplates = emailTemplatesData?.items || []
  const totalPages = emailTemplatesData?.totalPages || 1

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* 页面标题和操作 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">邮件模板</h1>
            <p className="text-sm text-gray-600">管理邮件通知模板，支持多语言内容</p>
          </div>
          <Button onClick={() => router.push('/system/email-templates/new')}>
            <Plus className="w-4 h-4 mr-2" />
            新增模板
          </Button>
        </div>

        {/* 搜索和筛选 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">搜索筛选</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* 搜索输入框 */}
              <div className="space-y-2">
                <Label htmlFor="search">模板名称</Label>
                <Input
                  id="search"
                  placeholder="输入模板名称..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
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

              {/* 触发事件筛选 */}
              <div className="space-y-2">
                <Label>触发事件</Label>
                <Select value={triggerEventFilter} onValueChange={setTriggerEventFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部事件</SelectItem>
                    {triggerEvents?.map((event) => (
                      <SelectItem key={event} value={event}>
                        {getTriggerEventName(event)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 占位列 */}
              <div></div>

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

        {/* 邮件模板列表 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">模板列表</CardTitle>
              <div className="text-sm text-gray-600">
                共 {emailTemplatesData?.total || 0} 条记录
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {emailTemplates.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">暂无邮件模板</p>
                <Button onClick={() => router.push('/system/email-templates/new')}>
                  <Plus className="w-4 h-4 mr-2" />
                  新增邮件模板
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>模板信息</TableHead>
                      <TableHead>触发事件</TableHead>
                      <TableHead>变量数量</TableHead>
                      <TableHead>多语言</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emailTemplates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell>
                          <div className="flex items-start space-x-3">
                            <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                              <div className="font-medium text-gray-900">
                                {getMultiLangText(template.name, 'zh-CN')}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                代码: {template.code}
                              </div>
                              <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                                {getMultiLangText(template.description, 'zh-CN')}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Zap className="w-4 h-4 text-orange-500" />
                            <span className="text-sm">
                              {getTriggerEventName(template.triggerEvent)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Tag className="w-4 h-4 text-blue-500" />
                            <span className="text-sm">
                              {template.variables.length} 个变量
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            {Object.entries(LANGUAGE_OPTIONS).map(([lang, config]) => {
                              const hasContent = template.subject[lang as SupportedLanguage] && 
                                               template.body[lang as SupportedLanguage]
                              return (
                                <span 
                                  key={lang}
                                  className={`text-xs px-1.5 py-0.5 rounded ${
                                    hasContent 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-gray-100 text-gray-400'
                                  }`}
                                  title={config.label}
                                >
                                  {config.flag}
                                </span>
                              )
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(template)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {format(new Date(template.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePreview(template)}
                              className="h-8 px-2"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/system/email-templates/${template.id}/edit`)}
                              className="h-8 px-2"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(template.id)}
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
                您确定要删除这个邮件模板吗？此操作不可撤销。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={deleteEmailTemplateMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteEmailTemplateMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* 预览对话框 */}
        <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>邮件模板预览</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* 预览控制 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>预览语言</Label>
                  <Select value={previewLanguage} onValueChange={(value: SupportedLanguage) => {
                    setPreviewLanguage(value)
                    updatePreview()
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(LANGUAGE_OPTIONS).map(([lang, config]) => (
                        <SelectItem key={lang} value={lang}>
                          {config.flag} {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 变量设置 */}
              {previewingTemplateId && (
                <div className="space-y-4">
                  <Label className="text-base font-medium">模板变量</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(previewVariables).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <Label htmlFor={`var-${key}`} className="text-sm">
                          {key}
                        </Label>
                        <Input
                          id={`var-${key}`}
                          value={value}
                          onChange={(e) => {
                            setPreviewVariables(prev => ({
                              ...prev,
                              [key]: e.target.value
                            }))
                          }}
                          onBlur={updatePreview}
                        />
                      </div>
                    ))}
                  </div>
                  <Button onClick={updatePreview} size="sm">
                    更新预览
                  </Button>
                </div>
              )}

              {/* 预览结果 */}
              {previewResult && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-base font-medium">邮件主题</Label>
                    <div className="p-3 border rounded-lg bg-gray-50">
                      {previewResult.subject}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base font-medium">邮件内容</Label>
                    <div 
                      className="p-4 border rounded-lg bg-white min-h-[200px]"
                      dangerouslySetInnerHTML={{ __html: previewResult.body }}
                    />
                  </div>
                </div>
              )}

              {previewEmailTemplateMutation.isPending && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="ml-2">正在生成预览...</span>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ErrorBoundary>
  )
}