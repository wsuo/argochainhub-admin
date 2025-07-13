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
import { ArrowLeft, Building2, Save } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { companyApi } from '@/lib/api'
import type { CreateCompanyRequest } from '@/lib/types'
import { toast } from 'sonner'

export default function NewCompanyPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState<CreateCompanyRequest>({
    name: {
      zh: '',
      en: ''
    },
    type: 'supplier',
    status: 'active',
    profile: {
      description: {
        zh: '',
        en: ''
      },
      address: '',
      phone: '',
      website: ''
    },
    rating: 4.0,
    isTop100: false,
    email: ''
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // 基本验证
    if (!formData.name.zh.trim()) {
      toast.error('请填写企业中文名称')
      return
    }
    
    if (!formData.email?.trim()) {
      toast.error('请填写企业邮箱')
      return
    }

    // 清理空值
    const cleanData = {
      ...formData,
      name: {
        zh: formData.name.zh.trim(),
        en: formData.name.en?.trim() || undefined
      },
      email: formData.email?.trim(),
      profile: {
        description: {
          zh: formData.profile?.description?.zh?.trim() || '',
          en: formData.profile?.description?.en?.trim() || ''
        },
        address: formData.profile?.address?.trim() || undefined,
        phone: formData.profile?.phone?.trim() || undefined,
        website: formData.profile?.website?.trim() || undefined
      }
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
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name-zh">企业中文名称 *</Label>
                <Input
                  id="name-zh"
                  value={formData.name.zh}
                  onChange={(e) => updateFormData('name.zh', e.target.value)}
                  placeholder="请输入企业中文名称"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="name-en">企业英文名称</Label>
                <Input
                  id="name-en"
                  value={formData.name.en || ''}
                  onChange={(e) => updateFormData('name.en', e.target.value)}
                  placeholder="请输入企业英文名称（可选）"
                />
              </div>
            </div>

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
                <Select
                  value={formData.status || 'active'}
                  onValueChange={(value) => updateFormData('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">已激活</SelectItem>
                    <SelectItem value="pending_review">待审核</SelectItem>
                    <SelectItem value="disabled">已禁用</SelectItem>
                  </SelectContent>
                </Select>
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
            <div>
              <Label htmlFor="desc-zh">中文描述</Label>
              <Textarea
                id="desc-zh"
                value={formData.profile?.description?.zh || ''}
                onChange={(e) => updateFormData('profile.description.zh', e.target.value)}
                placeholder="请输入企业中文描述"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="desc-en">英文描述</Label>
              <Textarea
                id="desc-en"
                value={formData.profile?.description?.en || ''}
                onChange={(e) => updateFormData('profile.description.en', e.target.value)}
                placeholder="请输入企业英文描述（可选）"
                rows={4}
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
                <Input
                  id="rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating || 4.0}
                  onChange={(e) => updateFormData('rating', parseFloat(e.target.value))}
                />
                <p className="text-sm text-muted-foreground mt-1">评分范围：0-5分</p>
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