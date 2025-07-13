'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Building2, Save, Globe, Upload as UploadIcon } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { companyApi } from '@/lib/api'
import type { CreateCompanyRequest, MultiLangText } from '@/lib/types'
import { toast } from 'sonner'
import { CompanyNameInput, MultiLangInput } from '@/components/multi-lang-input'
import { EnhancedCountrySelect } from '@/components/enhanced-country-select'
import { BusinessTypesMultiSelect, CompanySizeSelect, CompanyStatusSelect } from '@/components/dictionary-components'
import { ImageUpload } from '@/components/file-upload'
import { StarRating } from '@/components/star-rating'

export default function NewCompanyPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState<CreateCompanyRequest>({
    name: {
      'zh-CN': ''
    },
    type: 'supplier',
    status: 'active',
    profile: {
      description: {
        'zh-CN': ''
      },
      address: '',
      phone: '',
      website: ''
    },
    rating: 4.0,
    isTop100: false,
    email: '',
    // 新增字段
    country: '',
    businessCategories: [],
    businessScope: {
      'zh-CN': ''
    },
    companySize: '',
    mainProducts: {
      'zh-CN': ''
    },
    mainSuppliers: {
      'zh-CN': ''
    },
    annualImportExportValue: 0,
    registrationNumber: '',
    taxNumber: '',
    businessLicenseUrl: '',
    companyPhotosUrls: []
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateCompanyRequest) => companyApi.createCompany(data),
    onSuccess: (data) => {
      toast.success('企业创建成功')
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      router.push(`/enterprises/${data.id}`)
    },
    onError: (error: any) => {
      toast.error(`创建失败: ${error?.response?.data?.message || error?.message}`)
    }
  })

  // 清理多语言字段的辅助函数
  const cleanMultiLangText = (multiLangText?: MultiLangText): MultiLangText | undefined => {
    if (!multiLangText) return undefined
    
    const cleaned: Record<string, string> = {}
    
    // 遍历所有可能的语言键
    Object.keys(multiLangText).forEach(key => {
      const value = multiLangText[key as keyof MultiLangText]
      if (value && value.trim()) {
        cleaned[key] = value.trim()
      }
    })
    
    // 如果没有任何有效内容，返回undefined
    return Object.keys(cleaned).length > 0 ? cleaned as MultiLangText : undefined
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // 验证必填的多语言字段
    if (!formData.name['zh-CN']?.trim()) {
      toast.error('请填写企业中文名称')
      return
    }
    
    if (!formData.email?.trim()) {
      toast.error('请填写企业邮箱')
      return
    }

    // 清理空值并格式化数据
    const cleanedName = cleanMultiLangText(formData.name)
    if (!cleanedName || !cleanedName['zh-CN']) {
      toast.error('企业名称中文版本为必填项')
      return
    }

    // 清理空值并格式化数据
    const cleanData = {
      ...formData,
      name: cleanedName,
      email: formData.email?.trim(),
      profile: {
        description: cleanMultiLangText(formData.profile?.description),
        address: formData.profile?.address?.trim() || undefined,
        phone: formData.profile?.phone?.trim() || undefined,
        website: formData.profile?.website?.trim() || undefined
      },
      // 清理多语言字段
      businessScope: cleanMultiLangText(formData.businessScope),
      mainProducts: cleanMultiLangText(formData.mainProducts),
      mainSuppliers: cleanMultiLangText(formData.mainSuppliers),
      // 清理其他字段
      country: formData.country || undefined,
      companySize: formData.companySize || undefined,
      registrationNumber: formData.registrationNumber?.trim() || undefined,
      taxNumber: formData.taxNumber?.trim() || undefined,
      businessLicenseUrl: formData.businessLicenseUrl || undefined,
      companyPhotosUrls: formData.companyPhotosUrls?.length ? formData.companyPhotosUrls : undefined,
      annualImportExportValue: formData.annualImportExportValue || undefined
    }

    createMutation.mutate(cleanData)
  }

  const updateFormData = (path: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev }
      const keys = path.split('.')
      let current: any = newData
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {}
        }
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return newData
    })
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          返回
        </Button>
        <div className="flex items-center gap-3">
          <Building2 className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold">新增企业</h1>
            <p className="text-muted-foreground">创建新的企业档案</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
            <CardDescription>企业的基础档案信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 企业名称 */}
            <CompanyNameInput
              value={formData.name}
              onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">企业类型 *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => updateFormData('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="supplier">供应商</SelectItem>
                    <SelectItem value="buyer">采购商</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">企业状态</Label>
                <CompanyStatusSelect
                  value={formData.status || 'active'}
                  onValueChange={(value) => updateFormData('status', value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">企业邮箱 *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => updateFormData('email', e.target.value)}
                placeholder="请输入企业邮箱"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* 扩展信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              扩展信息
            </CardTitle>
            <CardDescription>企业的详细业务信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="country">所在国家</Label>
                <EnhancedCountrySelect
                  value={formData.country}
                  onValueChange={(value) => updateFormData('country', value)}
                  placeholder="请选择国家"
                  showFlag={true}
                />
              </div>

              <div>
                <Label htmlFor="companySize">公司规模</Label>
                <CompanySizeSelect
                  value={formData.companySize}
                  onValueChange={(value) => updateFormData('companySize', value)}
                />
              </div>

              <div>
                <Label htmlFor="businessCategories">业务类别</Label>
                <BusinessTypesMultiSelect
                  value={formData.businessCategories}
                  onValueChange={(value) => updateFormData('businessCategories', value)}
                  maxItems={3}
                />
              </div>
            </div>

            {/* 业务范围 */}
            <MultiLangInput
              label="业务范围"
              value={formData.businessScope}
              onChange={(value) => updateFormData('businessScope', value)}
              variant="textarea"
              placeholder={{
                'zh-CN': '请描述企业的主要业务范围',
                'en': 'Please describe the main business scope',
                'es': 'Por favor describa el alcance principal del negocio'
              }}
            />

            {/* 主要产品 */}
            <MultiLangInput
              label={formData.type === 'supplier' ? '主要产品' : '主要采购产品'}
              value={formData.mainProducts}
              onChange={(value) => updateFormData('mainProducts', value)}
              variant="textarea"
              placeholder={{
                'zh-CN': formData.type === 'supplier' ? '请列出主要生产或销售的产品' : '请列出主要采购的产品',
                'en': formData.type === 'supplier' ? 'Please list main products produced or sold' : 'Please list main products purchased',
                'es': formData.type === 'supplier' ? 'Por favor enumere los principales productos producidos o vendidos' : 'Por favor enumere los principales productos comprados'
              }}
            />

            {/* 主要供应商（采购商填写） */}
            {formData.type === 'buyer' && (
              <MultiLangInput
                label="主要供应商"
                value={formData.mainSuppliers}
                onChange={(value) => updateFormData('mainSuppliers', value)}
                variant="textarea"
                placeholder={{
                  'zh-CN': '请列出主要合作的供应商',
                  'en': 'Please list main cooperating suppliers',
                  'es': 'Por favor enumere los principales proveedores cooperantes'
                }}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="annualValue">年{formData.type === 'supplier' ? '出口' : '进口'}额（美元）</Label>
                <Input
                  id="annualValue"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.annualImportExportValue || ''}
                  onChange={(e) => updateFormData('annualImportExportValue', parseFloat(e.target.value) || 0)}
                  placeholder="请输入年交易额"
                />
              </div>

              <div>
                <Label htmlFor="registrationNumber">注册证号</Label>
                <Input
                  id="registrationNumber"
                  value={formData.registrationNumber || ''}
                  onChange={(e) => updateFormData('registrationNumber', e.target.value)}
                  placeholder="请输入注册证号"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="taxNumber">税号</Label>
              <Input
                id="taxNumber"
                value={formData.taxNumber || ''}
                onChange={(e) => updateFormData('taxNumber', e.target.value)}
                placeholder="请输入税号"
              />
            </div>
          </CardContent>
        </Card>

        {/* 联系信息 */}
        <Card>
          <CardHeader>
            <CardTitle>联系信息</CardTitle>
            <CardDescription>企业的联系方式和地址信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">联系电话</Label>
                <Input
                  id="phone"
                  value={formData.profile?.phone || ''}
                  onChange={(e) => updateFormData('profile.phone', e.target.value)}
                  placeholder="请输入联系电话"
                />
              </div>

              <div>
                <Label htmlFor="website">企业网站</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.profile?.website || ''}
                  onChange={(e) => updateFormData('profile.website', e.target.value)}
                  placeholder="请输入企业网站（如：https://example.com）"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">企业地址</Label>
              <Input
                id="address"
                value={formData.profile?.address || ''}
                onChange={(e) => updateFormData('profile.address', e.target.value)}
                placeholder="请输入企业地址"
              />
            </div>
          </CardContent>
        </Card>

        {/* 企业描述 */}
        <Card>
          <CardHeader>
            <CardTitle>企业描述</CardTitle>
            <CardDescription>企业的详细介绍信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <MultiLangInput
              label="企业描述"
              value={formData.profile?.description}
              onChange={(value) => updateFormData('profile.description', value)}
              variant="textarea"
              rows={4}
              placeholder={{
                'zh-CN': '请输入企业中文描述',
                'en': 'Please enter company description in English',
                'es': 'Por favor ingrese la descripción de la empresa en español'
              }}
            />
          </CardContent>
        </Card>

        {/* 文件上传 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadIcon className="h-5 w-5" />
              资质文件
            </CardTitle>
            <CardDescription>上传企业相关证件和照片</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>营业执照</Label>
              <ImageUpload
                value={formData.businessLicenseUrl ? [formData.businessLicenseUrl] : []}
                onChange={(urls) => updateFormData('businessLicenseUrl', urls[0] || '')}
                maxFiles={1}
                fileType="company_certificate"
                className="mt-2"
              />
            </div>

            <div>
              <Label>公司照片</Label>
              <ImageUpload
                value={formData.companyPhotosUrls || []}
                onChange={(urls) => updateFormData('companyPhotosUrls', urls)}
                maxFiles={5}
                fileType="company_certificate"
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* 企业评级 */}
        <Card>
          <CardHeader>
            <CardTitle>企业评级</CardTitle>
            <CardDescription>设置企业的评分和特殊标识</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rating">企业评分</Label>
                <div className="mt-2">
                  <StarRating
                    value={formData.rating || 4.0}
                    onChange={(value) => updateFormData('rating', value)}
                    size="lg"
                    showValue={true}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-1">点击星星设置评分</p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isTop100"
                  checked={formData.isTop100 || false}
                  onCheckedChange={(checked) => updateFormData('isTop100', checked)}
                />
                <Label htmlFor="isTop100">百强企业</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={createMutation.isPending}
          >
            取消
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {createMutation.isPending ? '创建中...' : '创建企业'}
          </Button>
        </div>
      </form>
    </div>
  )
}