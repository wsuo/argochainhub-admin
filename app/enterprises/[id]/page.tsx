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
  Crown,
  Factory,
  Package,
  Users,
  DollarSign,
  FileText,
  Camera,
  Download,
  Eye
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { companyApi } from '@/lib/api'
import type { Company, ReviewRequest, UpdateCompanyRequest, MultiLangText } from '@/lib/types'
import { toast } from 'sonner'
import { StarRating, StarDisplay } from '@/components/star-rating'
import { EnhancedCountrySelect } from '@/components/enhanced-country-select'
import { BusinessTypesMultiSelect, CompanySizeSelect } from '@/components/dictionary-components'
import { MultiLangInput } from '@/components/multi-lang-input'
import { ImageUpload } from '@/components/file-upload'
import { useCountryOptions, useDictionaryOptions, getDictionaryLabel, getDictionaryLabels } from '@/lib/dictionary-utils'

export default function CompanyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const companyId = Number(params.id)

  const [isEditMode, setIsEditMode] = useState(false)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [reviewReason, setReviewReason] = useState('')
  const [editData, setEditData] = useState<UpdateCompanyRequest>({})

  // 字典数据
  const countries = useCountryOptions()
  const businessTypes = useDictionaryOptions('business_type')
  const companySizes = useDictionaryOptions('company_size')

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
        email: company?.email,
        // 新增字段
        country: company?.country,
        businessCategories: company?.businessCategories,
        businessScope: company?.businessScope,
        companySize: company?.companySize,
        mainProducts: company?.mainProducts,
        mainSuppliers: company?.mainSuppliers,
        annualImportExportValue: company?.annualImportExportValue,
        registrationNumber: company?.registrationNumber,
        taxNumber: company?.taxNumber,
        businessLicenseUrl: company?.businessLicenseUrl,
        companyPhotosUrls: company?.companyPhotosUrls
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
                {isEditMode ? (
                  <StarRating
                    value={editData.rating !== undefined ? editData.rating : parseFloat(company.rating.toString()) || 0}
                    onChange={(value) => setEditData(prev => ({ ...prev, rating: value }))}
                    size="md"
                    showValue={true}
                  />
                ) : (
                  <StarDisplay
                    value={parseFloat(company.rating.toString()) || 0}
                    size="sm"
                    showValue={true}
                  />
                )}
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
              <MultiLangInput
                label=""
                value={(editData.profile?.description || company.profile?.description) as MultiLangText}
                onChange={(value) => setEditData(prev => ({
                  ...prev,
                  profile: {
                    ...prev.profile,
                    description: value
                  }
                }))}
                variant="textarea"
                rows={4}
              />
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

      {/* 扩展信息 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 业务信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Factory className="h-5 w-5" />
              业务信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 所在国家 */}
            {company.country && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">所在国家</span>
                {isEditMode ? (
                  <EnhancedCountrySelect
                    value={editData.country || company.country}
                    onValueChange={(value) => setEditData(prev => ({ ...prev, country: value }))}
                    showFlag={true}
                    className="w-48"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <span>{getDictionaryLabel(countries, company.country)}</span>
                  </div>
                )}
              </div>
            )}

            {/* 公司规模 */}
            {company.companySize && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">公司规模</span>
                {isEditMode ? (
                  <CompanySizeSelect
                    value={editData.companySize || company.companySize}
                    onValueChange={(value) => setEditData(prev => ({ ...prev, companySize: value }))}
                  />
                ) : (
                  <span className="text-sm">{getDictionaryLabel(companySizes, company.companySize)}</span>
                )}
              </div>
            )}

            {/* 业务类别 */}
            {company.businessCategories && company.businessCategories.length > 0 && (
              <div>
                <span className="text-sm font-medium mb-2 block">业务类别</span>
                {isEditMode ? (
                  <BusinessTypesMultiSelect
                    value={editData.businessCategories || company.businessCategories}
                    onValueChange={(value) => setEditData(prev => ({ ...prev, businessCategories: value }))}
                    maxItems={5}
                  />
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {company.businessCategories.map((category, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {getDictionaryLabel(businessTypes, category)}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 年进出口额 */}
            {company.annualImportExportValue && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">年{company.type === 'supplier' ? '出口' : '进口'}额</span>
                {isEditMode ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editData.annualImportExportValue || company.annualImportExportValue}
                      onChange={(e) => setEditData(prev => ({ ...prev, annualImportExportValue: parseFloat(e.target.value) || 0 }))}
                      className="w-32"
                    />
                    <span className="text-sm text-muted-foreground">美元</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{parseFloat(company.annualImportExportValue.toString()).toLocaleString()} 美元</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 认证信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              认证信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 注册证号 */}
            {company.registrationNumber && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">注册证号</span>
                {isEditMode ? (
                  <Input
                    value={editData.registrationNumber || company.registrationNumber}
                    onChange={(e) => setEditData(prev => ({ ...prev, registrationNumber: e.target.value }))}
                    className="w-48"
                  />
                ) : (
                  <span className="text-sm font-mono bg-muted px-2 py-1 rounded">{company.registrationNumber}</span>
                )}
              </div>
            )}

            {/* 税号 */}
            {company.taxNumber && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">税号</span>
                {isEditMode ? (
                  <Input
                    value={editData.taxNumber || company.taxNumber}
                    onChange={(e) => setEditData(prev => ({ ...prev, taxNumber: e.target.value }))}
                    className="w-48"
                  />
                ) : (
                  <span className="text-sm font-mono bg-muted px-2 py-1 rounded">{company.taxNumber}</span>
                )}
              </div>
            )}

            {/* 营业执照 */}
            {company.businessLicenseUrl && (
              <div>
                <span className="text-sm font-medium mb-2 block">营业执照</span>
                {isEditMode ? (
                  <ImageUpload
                    value={editData.businessLicenseUrl ? [editData.businessLicenseUrl] : company.businessLicenseUrl ? [company.businessLicenseUrl] : []}
                    onChange={(urls) => setEditData(prev => ({ ...prev, businessLicenseUrl: urls[0] || '' }))}
                    maxFiles={1}
                    fileType="company_certificate"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="text-xs"
                    >
                      <a href={company.businessLicenseUrl} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-3 w-3 mr-1" />
                        查看
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="text-xs"
                    >
                      <a href={company.businessLicenseUrl} download>
                        <Download className="h-3 w-3 mr-1" />
                        下载
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 业务范围和产品信息 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 业务范围 */}
        {company.businessScope && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                业务范围
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditMode ? (
                <MultiLangInput
                  label=""
                  value={editData.businessScope || company.businessScope}
                  onChange={(value) => setEditData(prev => ({ ...prev, businessScope: value }))}
                  variant="textarea"
                  rows={4}
                />
              ) : (
                <div className="space-y-3">
                  {getMultiLangText(company.businessScope, 'zh-CN') && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">中文</h4>
                      <p className="text-sm text-muted-foreground">{getMultiLangText(company.businessScope, 'zh-CN')}</p>
                    </div>
                  )}
                  {getMultiLangText(company.businessScope, 'en') && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">English</h4>
                      <p className="text-sm text-muted-foreground">{getMultiLangText(company.businessScope, 'en')}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 主要产品 */}
        {company.mainProducts && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                主要{company.type === 'supplier' ? '产品' : '采购产品'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditMode ? (
                <MultiLangInput
                  label=""
                  value={editData.mainProducts || company.mainProducts}
                  onChange={(value) => setEditData(prev => ({ ...prev, mainProducts: value }))}
                  variant="textarea"
                  rows={4}
                />
              ) : (
                <div className="space-y-3">
                  {getMultiLangText(company.mainProducts, 'zh-CN') && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">中文</h4>
                      <p className="text-sm text-muted-foreground">{getMultiLangText(company.mainProducts, 'zh-CN')}</p>
                    </div>
                  )}
                  {getMultiLangText(company.mainProducts, 'en') && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">English</h4>
                      <p className="text-sm text-muted-foreground">{getMultiLangText(company.mainProducts, 'en')}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* 主要供应商（采购商才显示） */}
      {company.type === 'buyer' && company.mainSuppliers && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              主要供应商
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditMode ? (
              <MultiLangInput
                label=""
                value={editData.mainSuppliers || company.mainSuppliers}
                onChange={(value) => setEditData(prev => ({ ...prev, mainSuppliers: value }))}
                variant="textarea"
                rows={4}
              />
            ) : (
              <div className="space-y-3">
                {getMultiLangText(company.mainSuppliers, 'zh-CN') && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">中文</h4>
                    <p className="text-sm text-muted-foreground">{getMultiLangText(company.mainSuppliers, 'zh-CN')}</p>
                  </div>
                )}
                {getMultiLangText(company.mainSuppliers, 'en') && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">English</h4>
                    <p className="text-sm text-muted-foreground">{getMultiLangText(company.mainSuppliers, 'en')}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 公司照片 */}
      {company.companyPhotosUrls && company.companyPhotosUrls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              公司照片
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditMode ? (
              <ImageUpload
                value={editData.companyPhotosUrls || company.companyPhotosUrls}
                onChange={(urls) => setEditData(prev => ({ ...prev, companyPhotosUrls: urls }))}
                maxFiles={5}
                fileType="company_certificate"
              />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {company.companyPhotosUrls.map((url, index) => (
                  <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border">
                    <img
                      src={url}
                      alt={`公司照片 ${index + 1}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        asChild
                        className="text-xs"
                      >
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-3 w-3" />
                        </a>
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        asChild
                        className="text-xs"
                      >
                        <a href={url} download>
                          <Download className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

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