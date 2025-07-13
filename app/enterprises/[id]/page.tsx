'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Building2, 
  ArrowLeft, 
  Edit, 
  CheckCircle, 
  XCircle,
  Mail,
  Phone,
  MapPin,
  Globe,
  Star,
  Crown
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { companyApi } from '@/lib/api'
import type { Company, ReviewRequest, UpdateCompanyRequest, MultiLangText } from '@/lib/types'
import { toast } from 'sonner'

export default function CompanyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const companyId = Number(params.id)

  const [isEditMode, setIsEditMode] = useState(false)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [reviewReason, setReviewReason] = useState('')
  const [editData, setEditData] = useState<UpdateCompanyRequest>({})

  // 获取多语言文本的辅助函数
  const getMultiLangText = (text: MultiLangText | { zh: string; en?: string; 'zh-CN'?: string } | undefined, lang: 'zh-CN' | 'en' = 'zh-CN'): string => {
    if (!text) return ''
    // 新格式 MultiLangText
    if ('zh-CN' in text) {
      return lang === 'en' ? text.en || '' : text['zh-CN'] || ''
    }
    // 旧格式向后兼容
    if ('zh' in text) {
      return lang === 'en' ? text.en || '' : text.zh || text['zh-CN'] || ''
    }
    return ''
  }

  // 设置多语言文本的辅助函数
  const setMultiLangText = (text: string, lang: 'zh-CN' | 'en' = 'zh-CN'): MultiLangText => {
    if (lang === 'en') {
      return { 'zh-CN': '', en: text }
    }
    return { 'zh-CN': text }
  }

  // 获取企业详情
  const { data: company, isLoading, error } = useQuery({
    queryKey: ['company', companyId],
    queryFn: () => companyApi.getCompany(companyId),
    enabled: !!companyId
  })

  // 企业审核
  const reviewMutation = useMutation({
    mutationFn: ({ approved, reason }: ReviewRequest) => 
      companyApi.reviewCompany(companyId, { approved, reason }),
    onSuccess: () => {
      toast.success('企业审核完成')
      queryClient.invalidateQueries({ queryKey: ['company', companyId] })
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      setIsReviewDialogOpen(false)
      setReviewReason('')
    },
    onError: (error: any) => {
      toast.error(`审核失败: ${error?.response?.data?.message || error?.message}`)
    }
  })

  // 更新企业信息
  const updateMutation = useMutation({
    mutationFn: (data: UpdateCompanyRequest) => 
      companyApi.updateCompany(companyId, data),
    onSuccess: () => {
      toast.success('企业信息更新成功')
      queryClient.invalidateQueries({ queryKey: ['company', companyId] })
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      setIsEditMode(false)
    },
    onError: (error: any) => {
      toast.error(`更新失败: ${error?.response?.data?.message || error?.message}`)
    }
  })

  const handleReview = (approved: boolean) => {
    reviewMutation.mutate({
      approved,
      reason: reviewReason
    })
  }

  const handleUpdate = () => {
    updateMutation.mutate(editData)
  }

  const handleEditToggle = () => {
    if (isEditMode) {
      setEditData({})
    } else {
      setEditData({
        name: company?.name ? {
          'zh-CN': getMultiLangText(company.name, 'zh-CN'),
          en: getMultiLangText(company.name, 'en')
        } : undefined,
        type: company?.type,
        profile: company?.profile ? {
          ...company.profile,
          description: company.profile.description ? {
            'zh-CN': getMultiLangText(company.profile.description, 'zh-CN'),
            en: getMultiLangText(company.profile.description, 'en')
          } : undefined
        } : undefined,
        rating: company?.rating,
        isTop100: company?.isTop100,
        email: company?.email
      })
    }
    setIsEditMode(!isEditMode)
  }

  const getStatusBadge = (status: Company['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="secondary" className="gap-1"><CheckCircle className="h-3 w-3" />已激活</Badge>
      case 'pending_review':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />待审核</Badge>
      case 'disabled':
        return <Badge variant="outline" className="gap-1"><XCircle className="h-3 w-3" />已禁用</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getTypeBadge = (type: Company['type']) => {
    switch (type) {
      case 'supplier':
        return <Badge variant="default">供应商</Badge>
      case 'buyer':
        return <Badge variant="secondary">采购商</Badge>
      case 'manufacturer':
        return <Badge variant="outline">制造商</Badge>
      case 'distributor':
        return <Badge variant="outline">分销商</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
          <div className="h-8 bg-muted animate-pulse rounded w-40" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted animate-pulse rounded w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
        </div>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            加载企业详情失败: {(error as any)?.message || '企业不存在'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6" />
            <div>
              <h1 className="text-2xl font-bold">{getMultiLangText(company.name, 'zh-CN')}</h1>
              {getMultiLangText(company.name, 'en') && (
                <p className="text-muted-foreground">{getMultiLangText(company.name, 'en')}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {company.status === 'pending_review' && (
            <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  审核企业
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>审核企业</DialogTitle>
                  <DialogDescription>
                    请选择审核结果并填写审核意见
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="reason">审核意见</Label>
                    <Textarea
                      id="reason"
                      placeholder="请填写审核意见..."
                      value={reviewReason}
                      onChange={(e) => setReviewReason(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => handleReview(false)}
                    disabled={reviewMutation.isPending}
                  >
                    拒绝
                  </Button>
                  <Button
                    onClick={() => handleReview(true)}
                    disabled={reviewMutation.isPending}
                  >
                    通过
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          <Button
            variant="outline"
            onClick={handleEditToggle}
            disabled={updateMutation.isPending}
          >
            <Edit className="h-4 w-4 mr-2" />
            {isEditMode ? '取消编辑' : '编辑信息'}
          </Button>
          
          {isEditMode && (
            <Button
              onClick={handleUpdate}
              disabled={updateMutation.isPending}
            >
              保存更改
            </Button>
          )}
        </div>
      </div>

      {/* 企业基本信息 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">企业状态</span>
              {getStatusBadge(company.status)}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">企业类型</span>
              {isEditMode ? (
                <Select
                  value={editData.type || company.type}
                  onValueChange={(value) => setEditData(prev => ({ ...prev, type: value as Company['type'] }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="supplier">供应商</SelectItem>
                    <SelectItem value="buyer">采购商</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                getTypeBadge(company.type)
              )}
            </div>

            {company.rating !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">企业评分</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {isEditMode ? (
                    <Input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={editData.rating || company.rating}
                      onChange={(e) => setEditData(prev => ({ ...prev, rating: parseFloat(e.target.value) }))}
                      className="w-20"
                    />
                  ) : (
                    <span>{company.rating}</span>
                  )}
                </div>
              </div>
            )}

            {company.isTop100 && (
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-600">百强企业</span>
              </div>
            )}

            <Separator />

            <div className="space-y-3">
              {company.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{company.email}</span>
                </div>
              )}
              
              {company.profile?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{company.profile.phone}</span>
                </div>
              )}

              {company.profile?.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{company.profile.address}</span>
                </div>
              )}

              {company.profile?.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={company.profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {company.profile.website}
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>企业描述</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditMode ? (
              <div className="space-y-4">
                <div>
                  <Label>中文描述</Label>
                  <Textarea
                    value={editData.profile?.description ? getMultiLangText(editData.profile.description, 'zh-CN') : getMultiLangText(company.profile?.description, 'zh-CN')}
                    onChange={(e) => setEditData(prev => ({
                      ...prev,
                      profile: {
                        ...prev.profile,
                        description: {
                          'zh-CN': e.target.value,
                          en: prev.profile?.description?.en || getMultiLangText(company.profile?.description, 'en')
                        }
                      }
                    }))}
                  />
                </div>
                <div>
                  <Label>英文描述</Label>
                  <Textarea
                    value={editData.profile?.description ? getMultiLangText(editData.profile.description, 'en') : getMultiLangText(company.profile?.description, 'en')}
                    onChange={(e) => setEditData(prev => ({
                      ...prev,
                      profile: {
                        ...prev.profile,
                        description: {
                          'zh-CN': prev.profile?.description?.['zh-CN'] || getMultiLangText(company.profile?.description, 'zh-CN'),
                          en: e.target.value
                        }
                      }
                    }))}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {getMultiLangText(company.profile?.description, 'zh-CN') && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">中文描述</h4>
                    <p className="text-sm text-muted-foreground">{getMultiLangText(company.profile?.description, 'zh-CN')}</p>
                  </div>
                )}
                {getMultiLangText(company.profile?.description, 'en') && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">英文描述</h4>
                    <p className="text-sm text-muted-foreground">{getMultiLangText(company.profile?.description, 'en')}</p>
                  </div>
                )}
                {!getMultiLangText(company.profile?.description, 'zh-CN') && !getMultiLangText(company.profile?.description, 'en') && (
                  <p className="text-sm text-muted-foreground">暂无企业描述</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 关联用户 */}
      {company.users && company.users.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>关联用户 ({company.users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {company.users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge variant={user.isActive ? "secondary" : "outline"}>
                    {user.isActive ? "活跃" : "未激活"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 订阅信息 */}
      {company.subscriptions && company.subscriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>订阅历史</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {company.subscriptions.map((subscription) => (
                <div key={subscription.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{getMultiLangText(subscription.plan?.name, 'zh-CN')}</p>
                    <p className="text-sm text-muted-foreground">
                      {subscription.startDate} - {subscription.endDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={subscription.status === 'active' ? "secondary" : "outline"}>
                      {subscription.status === 'active' ? '活跃' : subscription.status === 'expired' ? '已过期' : '已取消'}
                    </Badge>
                    <Badge variant="outline">
                      {subscription.type === 'paid' ? '付费' : '赠送'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}