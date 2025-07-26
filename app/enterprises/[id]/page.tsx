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
  Eye,
  Plus,
  User,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Shield,
  Briefcase,
  Calendar,
  CheckCircle2
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { companyApi } from '@/lib/api'
import type { Company, ReviewRequest, UpdateCompanyRequest, MultiLangText, CompanyUser, CreateCompanyUserRequest, UpdateCompanyUserRequest } from '@/lib/types'
import { toast } from 'sonner'
import { StarRating, StarDisplay } from '@/components/star-rating'
import { EnhancedCountrySelect } from '@/components/enhanced-country-select'
import { BusinessTypesMultiSelect, CompanySizeSelect } from '@/components/dictionary-components'
import { MultiLangInput } from '@/components/multi-lang-input'
import { ImageUpload } from '@/components/file-upload'
import { useCountryOptions, useDictionaryOptions, getDictionaryLabel, getDictionaryLabels } from '@/lib/dictionary-utils'
import { 
  useCompanyUsers, 
  useCreateCompanyUser, 
  useUpdateCompanyUser, 
  useDeleteCompanyUser, 
  useToggleCompanyUserStatus 
} from '@/hooks/use-api'
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export default function CompanyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const companyId = Number(params.id)

  const [isEditMode, setIsEditMode] = useState(false)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [reviewReason, setReviewReason] = useState('')
  const [editData, setEditData] = useState<UpdateCompanyRequest>({})
  
  // 图片预览状态
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [previewTitle, setPreviewTitle] = useState('')

  // 企业用户管理状态
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<CompanyUser | null>(null)
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false)

  // 表单验证schema
  const createUserSchema = z.object({
    email: z.string().email('请输入有效的邮箱地址'),
    name: z.string().min(2, '姓名至少需要2个字符').max(50, '姓名不能超过50个字符'),
    password: z.string().min(6, '密码至少需要6个字符'),
    phone: z.string().optional(),
    position: z.string().optional(),
    department: z.string().optional(),
    joinedAt: z.string().optional(),
    role: z.enum(['owner', 'admin', 'member']).default('member'),
    isActive: z.boolean().default(true),
  })

  const updateUserSchema = z.object({
    name: z.string().min(2, '姓名至少需要2个字符').max(50, '姓名不能超过50个字符'),
    phone: z.string().optional(),
    position: z.string().optional(),
    department: z.string().optional(),
    joinedAt: z.string().optional(),
    role: z.enum(['owner', 'admin', 'member']),
    isActive: z.boolean(),
  })

  type CreateUserFormData = z.infer<typeof createUserSchema>
  type UpdateUserFormData = z.infer<typeof updateUserSchema>

  // 字典数据
  const countries = useCountryOptions()
  const businessTypes = useDictionaryOptions('business_type')
  const companySizes = useDictionaryOptions('company_size')

  // 表单实例
  const createUserForm = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      name: '',
      password: '',
      phone: '',
      position: '',
      department: '',
      joinedAt: new Date().toISOString().split('T')[0],
      role: 'member',
      isActive: true,
    },
  })

  const updateUserForm = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: '',
      phone: '',
      position: '',
      department: '',
      joinedAt: '',
      role: 'member',
      isActive: true,
    },
  })

  // API调用
  const { data: companyUsers, isLoading: usersLoading } = useCompanyUsers(companyId, { page: 1, limit: 50 })
  const createUserMutation = useCreateCompanyUser()
  const updateUserMutation = useUpdateCompanyUser()
  const deleteUserMutation = useDeleteCompanyUser()
  const toggleUserStatusMutation = useToggleCompanyUserStatus()

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

  // 图片预览处理函数
  const handleImagePreview = (url: string, title: string) => {
    setPreviewImage(url)
    setPreviewTitle(title)
  }

  // 安全的数值转换函数
  const safeParseFloat = (value: any, defaultValue: number = 0): number => {
    if (value === null || value === undefined || value === '') return defaultValue
    const parsed = typeof value === 'string' ? parseFloat(value) : Number(value)
    return isNaN(parsed) ? defaultValue : parsed
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
        // 为历史数据设置默认值
        rating: typeof company?.rating === 'number' ? company.rating : 4.0,
        isTop100: company?.isTop100 || false,
        email: company?.email,
        // 新增字段，为历史数据设置默认值
        country: company?.country || '',
        businessCategories: company?.businessCategories || [],
        businessScope: company?.businessScope || { 'zh-CN': '' },
        companySize: company?.companySize || '',
        mainProducts: company?.mainProducts || { 'zh-CN': '' },
        mainSuppliers: company?.mainSuppliers || { 'zh-CN': '' },
        annualImportExportValue: typeof company?.annualImportExportValue === 'number' ? company.annualImportExportValue : 0,
        registrationNumber: company?.registrationNumber || '',
        taxNumber: company?.taxNumber || '',
        businessLicenseUrl: company?.businessLicenseUrl || '',
        companyPhotosUrls: company?.companyPhotosUrls || []
      })
    }
    setIsEditMode(!isEditMode)
  }

  // 企业用户管理事件处理函数
  const handleCreateUser = async (data: CreateUserFormData) => {
    try {
      await createUserMutation.mutateAsync({ companyId, data })
      toast.success('员工创建成功')
      setIsAddUserDialogOpen(false)
      createUserForm.reset()
    } catch (error: any) {
      toast.error(error.message || '员工创建失败')
    }
  }

  const handleEditUser = (user: CompanyUser) => {
    setEditingUser(user)
    updateUserForm.reset({
      name: user.name,
      phone: user.phone || '',
      position: user.position || '',
      department: user.department || '',
      joinedAt: user.joinedAt ? user.joinedAt.split('T')[0] : '',
      role: user.role,
      isActive: user.isActive,
    })
    setIsEditUserDialogOpen(true)
  }

  const handleUpdateUser = async (data: UpdateUserFormData) => {
    if (!editingUser) return
    try {
      await updateUserMutation.mutateAsync({
        companyId,
        userId: editingUser.id,
        data
      })
      toast.success('员工信息更新成功')
      setIsEditUserDialogOpen(false)
      setEditingUser(null)
    } catch (error: any) {
      toast.error(error.message || '员工信息更新失败')
    }
  }

  const handleDeleteUser = async (userId: number) => {
    try {
      await deleteUserMutation.mutateAsync({ companyId, userId })
      toast.success('员工删除成功')
    } catch (error: any) {
      toast.error(error.message || '员工删除失败')
    }
  }

  const handleToggleUserStatus = async (userId: number) => {
    try {
      await toggleUserStatusMutation.mutateAsync({ companyId, userId })
      toast.success('员工状态更新成功')
    } catch (error: any) {
      toast.error(error.message || '员工状态更新失败')
    }
  }

  const getRoleBadge = (role: CompanyUser['role']) => {
    switch (role) {
      case 'owner':
        return <Badge variant="destructive" className="gap-1"><Shield className="h-3 w-3" />企业主</Badge>
      case 'admin':
        return <Badge variant="default" className="gap-1"><Shield className="h-3 w-3" />管理员</Badge>
      case 'member':
        return <Badge variant="secondary" className="gap-1"><User className="h-3 w-3" />普通员工</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  const getUserStatusBadge = (isActive: boolean) => {
    if (!isActive) {
      return <Badge variant="destructive">已禁用</Badge>
    } else {
      return <Badge variant="secondary">正常</Badge>
    }
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
                    value={editData.rating !== undefined ? editData.rating : safeParseFloat(company.rating)}
                    onChange={(value) => setEditData(prev => ({ ...prev, rating: value }))}
                    size="md"
                    showValue={true}
                  />
                ) : (
                  <StarDisplay
                    value={safeParseFloat(company.rating)}
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
            {isEditMode ? (
              /* 编辑模式：使用网格布局，两两一行 */
              <div className="space-y-6">
                {/* 第一行：所在国家 + 年进出口额 */}
                <div className="grid grid-cols-2 gap-6">
                  {/* 所在国家 */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">所在国家</span>
                    <EnhancedCountrySelect
                      value={editData.country || company.country || ''}
                      onValueChange={(value) => setEditData(prev => ({ ...prev, country: value }))}
                      showFlag={true}
                      className="w-48"
                    />
                  </div>

                  {/* 年进出口额 */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">年{company.type === 'supplier' ? '出口' : '进口'}额</span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editData.annualImportExportValue !== undefined ? editData.annualImportExportValue : (company.annualImportExportValue || 0)}
                        onChange={(e) => setEditData(prev => ({ ...prev, annualImportExportValue: parseFloat(e.target.value) || 0 }))}
                        className="w-32"
                      />
                      <span className="text-sm text-muted-foreground">美元</span>
                    </div>
                  </div>
                </div>

                {/* 第二行：公司规模 + 业务类别 */}
                <div className="grid grid-cols-2 gap-6">
                  {/* 公司规模 */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">公司规模</span>
                    <CompanySizeSelect
                      value={editData.companySize || company.companySize || ''}
                      onValueChange={(value) => setEditData(prev => ({ ...prev, companySize: value }))}
                      className="w-48"
                    />
                  </div>

                  {/* 业务类别 */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">业务类别</span>
                    <BusinessTypesMultiSelect
                      value={editData.businessCategories || company.businessCategories || []}
                      onValueChange={(value) => setEditData(prev => ({ ...prev, businessCategories: value }))}
                      maxItems={10}
                      showMaxItemsHint={false}
                      className="w-48"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* 查看模式：保持原有布局 */
              <>
                {/* 所在国家 */}
                {company.country && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">所在国家</span>
                    <div className="flex items-center gap-2">
                      <span>{getDictionaryLabel(countries, company.country)}</span>
                    </div>
                  </div>
                )}

                {/* 公司规模 */}
                {company.companySize && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">公司规模</span>
                    <span className="text-sm">{getDictionaryLabel(companySizes, company.companySize)}</span>
                  </div>
                )}

                {/* 业务类别 */}
                {company.businessCategories && company.businessCategories.length > 0 && businessTypes.length > 0 && (
                  <div>
                    <span className="text-sm font-medium mb-2 block">业务类别</span>
                    <div className="flex flex-wrap gap-1">
                      {company.businessCategories.map((category, index) => {
                        const label = getDictionaryLabel(businessTypes, category)
                        // 只显示能找到对应标签的业务类别，避免显示原始代码
                        if (label && label !== category) {
                          return (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {label}
                            </Badge>
                          )
                        }
                        return null
                      })}
                    </div>
                  </div>
                )}

                {/* 年进出口额 */}
                {company.annualImportExportValue && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">年{company.type === 'supplier' ? '出口' : '进口'}额</span>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{safeParseFloat(company.annualImportExportValue).toLocaleString()} 美元</span>
                    </div>
                  </div>
                )}

                {/* 显示未设置的字段 */}
                {!company.country && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">所在国家</span>
                    <span className="text-sm text-muted-foreground">未设置</span>
                  </div>
                )}
                {!company.companySize && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">公司规模</span>
                    <span className="text-sm text-muted-foreground">未设置</span>
                  </div>
                )}
                {(!company.businessCategories || company.businessCategories.length === 0) && (
                  <div>
                    <span className="text-sm font-medium mb-2 block">业务类别</span>
                    <span className="text-sm text-muted-foreground">未设置</span>
                  </div>
                )}
                {!company.annualImportExportValue && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">年{company.type === 'supplier' ? '出口' : '进口'}额</span>
                    <span className="text-sm text-muted-foreground">未设置</span>
                  </div>
                )}
              </>
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
            {(company.registrationNumber || isEditMode) && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">注册证号</span>
                {isEditMode ? (
                  <Input
                    value={editData.registrationNumber || company.registrationNumber || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, registrationNumber: e.target.value }))}
                    className="w-48"
                  />
                ) : company.registrationNumber ? (
                  <span className="text-sm font-mono bg-muted px-2 py-1 rounded">{company.registrationNumber}</span>
                ) : (
                  <span className="text-sm text-muted-foreground">未设置</span>
                )}
              </div>
            )}

            {/* 税号 */}
            {(company.taxNumber || isEditMode) && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">税号</span>
                {isEditMode ? (
                  <Input
                    value={editData.taxNumber || company.taxNumber || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, taxNumber: e.target.value }))}
                    className="w-48"
                  />
                ) : company.taxNumber ? (
                  <span className="text-sm font-mono bg-muted px-2 py-1 rounded">{company.taxNumber}</span>
                ) : (
                  <span className="text-sm text-muted-foreground">未设置</span>
                )}
              </div>
            )}

            {/* 营业执照 */}
            {(company.businessLicenseUrl || isEditMode) && (
              <div>
                <span className="text-sm font-medium mb-2 block">营业执照</span>
                {isEditMode ? (
                  <ImageUpload
                    value={editData.businessLicenseUrl ? [editData.businessLicenseUrl] : company.businessLicenseUrl ? [company.businessLicenseUrl] : []}
                    onChange={(urls) => setEditData(prev => ({ ...prev, businessLicenseUrl: urls[0] || '' }))}
                    maxFiles={1}
                    fileType="company_certificate"
                  />
                ) : company.businessLicenseUrl ? (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleImagePreview(company.businessLicenseUrl || '', '营业执照')}
                      className="text-xs"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      查看
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
                ) : (
                  <span className="text-sm text-muted-foreground">未上传</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 业务范围和产品信息 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 业务范围 */}
        {(company.businessScope || isEditMode) && (
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
                  value={editData.businessScope || company.businessScope || { 'zh-CN': '' }}
                  onChange={(value) => setEditData(prev => ({ ...prev, businessScope: value }))}
                  variant="textarea"
                  rows={4}
                />
              ) : company.businessScope && (getMultiLangText(company.businessScope, 'zh-CN') || getMultiLangText(company.businessScope, 'en')) ? (
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
              ) : (
                <span className="text-sm text-muted-foreground">未设置</span>
              )}
            </CardContent>
          </Card>
        )}

        {/* 主要产品 */}
        {(company.mainProducts || isEditMode) && (
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
                  value={editData.mainProducts || company.mainProducts || { 'zh-CN': '' }}
                  onChange={(value) => setEditData(prev => ({ ...prev, mainProducts: value }))}
                  variant="textarea"
                  rows={4}
                />
              ) : company.mainProducts && (getMultiLangText(company.mainProducts, 'zh-CN') || getMultiLangText(company.mainProducts, 'en')) ? (
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
              ) : (
                <span className="text-sm text-muted-foreground">未设置</span>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* 主要供应商（采购商才显示） */}
      {company.type === 'buyer' && (company.mainSuppliers || isEditMode) && (
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
                value={editData.mainSuppliers || company.mainSuppliers || { 'zh-CN': '' }}
                onChange={(value) => setEditData(prev => ({ ...prev, mainSuppliers: value }))}
                variant="textarea"
                rows={4}
              />
            ) : company.mainSuppliers && (getMultiLangText(company.mainSuppliers, 'zh-CN') || getMultiLangText(company.mainSuppliers, 'en')) ? (
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
            ) : (
              <span className="text-sm text-muted-foreground">未设置</span>
            )}
          </CardContent>
        </Card>
      )}

      {/* 公司照片 */}
      {(company.companyPhotosUrls && company.companyPhotosUrls.length > 0) || isEditMode ? (
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
                value={editData.companyPhotosUrls || company.companyPhotosUrls || []}
                onChange={(urls) => setEditData(prev => ({ ...prev, companyPhotosUrls: urls }))}
                maxFiles={5}
                fileType="company_certificate"
              />
            ) : company.companyPhotosUrls && company.companyPhotosUrls.length > 0 ? (
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
                        onClick={() => handleImagePreview(url, `公司照片 ${index + 1}`)}
                        className="text-xs"
                      >
                        <Eye className="h-3 w-3" />
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
            ) : (
              <span className="text-sm text-muted-foreground">未上传</span>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* 企业用户管理 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                企业用户管理
              </CardTitle>
              <CardDescription>
                {companyUsers ? `共 ${companyUsers.meta.totalItems} 名员工` : '管理企业员工信息'}
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddUserDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              新增员工
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-muted animate-pulse rounded-full" />
                      <div className="space-y-2">
                        <div className="h-4 bg-muted animate-pulse rounded w-32" />
                        <div className="h-3 bg-muted animate-pulse rounded w-48" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                      <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                      <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : companyUsers?.data.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
              <h3 className="text-xl font-semibold mb-2">暂无员工</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                该企业还没有添加任何员工，点击上方按钮开始添加第一个员工
              </p>
              <Button onClick={() => setIsAddUserDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                添加第一个员工
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {companyUsers?.data.map((user) => (
                <div key={user.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-lg">{user.name}</h4>
                          {getRoleBadge(user.role)}
                          {getUserStatusBadge(user.isActive)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{user.email}</span>
                          </div>
                          
                          {user.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>入职: {new Date(user.joinedAt).toLocaleDateString('zh-CN')}</span>
                          </div>
                          
                          {user.position && (
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-4 w-4 text-muted-foreground" />
                              <span>{user.position}</span>
                            </div>
                          )}
                          
                          {user.department && (
                            <div className="text-muted-foreground">
                              部门: {user.department}
                            </div>
                          )}
                          
                          {user.lastLoginAt && (
                            <div className="text-muted-foreground">
                              上次登录: {new Date(user.lastLoginAt).toLocaleDateString('zh-CN')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                        title="编辑"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleUserStatus(user.id)}
                        disabled={toggleUserStatusMutation.isPending}
                        title={user.isActive ? '点击禁用' : '点击启用'}
                      >
                        {user.isActive ? (
                          <ToggleRight className="h-4 w-4" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" />
                        )}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            title="删除"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>确认删除员工</AlertDialogTitle>
                            <AlertDialogDescription>
                              此操作将永久删除员工 "{user.name}" 的账户，包括相关的所有数据。
                              该操作无法撤销，请确认是否继续。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>取消</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteUser(user.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              确认删除
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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

      {/* 图片预览模态框 */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-lg font-medium">
              {previewTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-6 pt-4">
            {previewImage && (
              <img
                src={previewImage}
                alt={previewTitle}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
                onError={(e) => {
                  console.error('图片加载失败:', previewImage)
                  e.currentTarget.src = '/placeholder-image.svg'
                }}
              />
            )}
          </div>
          <div className="flex justify-end gap-2 p-6 pt-0">
            <Button
              variant="outline"
              asChild
            >
              <a href={previewImage || ''} download>
                <Download className="h-4 w-4 mr-2" />
                下载图片
              </a>
            </Button>
            <Button
              variant="outline"
              onClick={() => setPreviewImage(null)}
            >
              关闭
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 新增用户对话框 */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新增员工</DialogTitle>
            <DialogDescription>
              为 {getMultiLangText(company?.name, 'zh-CN')} 添加新员工
            </DialogDescription>
          </DialogHeader>
          
          <Form {...createUserForm}>
            <form onSubmit={createUserForm.handleSubmit(handleCreateUser)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 基本信息 */}
                <FormField
                  control={createUserForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>姓名 *</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入员工姓名" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createUserForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>邮箱 *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="请输入邮箱地址" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createUserForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>初始密码 *</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="请输入初始密码" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createUserForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>手机号</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入手机号" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createUserForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>角色权限 *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="请选择角色权限" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="member">普通员工</SelectItem>
                          <SelectItem value="admin">管理员</SelectItem>
                          <SelectItem value="owner">企业主</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createUserForm.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>部门</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入所属部门" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createUserForm.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>职位</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入职位名称" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createUserForm.control}
                  name="joinedAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>入职日期</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={createUserForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        账户状态
                      </FormLabel>
                      <FormDescription>
                        启用后员工可以正常登录使用系统
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddUserDialogOpen(false)}
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={createUserMutation.isPending}
                >
                  创建员工
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* 编辑用户对话框 */}
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑员工</DialogTitle>
            <DialogDescription>
              修改 {editingUser?.name} 的员工信息
            </DialogDescription>
          </DialogHeader>
          
          <Form {...updateUserForm}>
            <form onSubmit={updateUserForm.handleSubmit(handleUpdateUser)} className="space-y-4">
              <div>
                <Label>邮箱（不可修改）</Label>
                <Input 
                  value={editingUser?.email || ''} 
                  disabled 
                  className="bg-muted text-muted-foreground"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={updateUserForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>姓名 *</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入员工姓名" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={updateUserForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>手机号</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入手机号" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={updateUserForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>角色权限 *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="请选择角色权限" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="member">普通员工</SelectItem>
                          <SelectItem value="admin">管理员</SelectItem>
                          <SelectItem value="owner">企业主</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={updateUserForm.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>部门</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入所属部门" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={updateUserForm.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>职位</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入职位名称" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={updateUserForm.control}
                  name="joinedAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>入职日期</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={updateUserForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        账户启用状态
                      </FormLabel>
                      <FormDescription>
                        启用后员工可以正常登录使用系统
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditUserDialogOpen(false)}
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={updateUserMutation.isPending}
                >
                  保存更改
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}