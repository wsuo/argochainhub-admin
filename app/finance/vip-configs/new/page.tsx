'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2, ArrowLeft, Save } from 'lucide-react'
import { useCreateVipConfig } from '@/hooks/use-api'
import type { CreateVipConfigRequest } from '@/lib/types'
import { MultiLangInput } from '@/components/multi-lang-input'

export default function VipConfigNewPage() {
  const router = useRouter()

  const [formData, setFormData] = useState<CreateVipConfigRequest>({
    name: {
      "zh-CN": "",
      en: "",
      es: ""
    },
    platform: 'supplier',
    level: 'basic',
    currency: 'USD',
    originalPrice: 0,
    currentPrice: 0,
    days: 365,
    accountQuota: 1,
    maxPurchaseCount: 1,
    bonusDays: 0,
    sampleViewCount: 0,
    vipLevelNumber: 1,
    inquiryManagementCount: 0,
    registrationManagementCount: 0,
    productPublishCount: 0,
    viewCount: 0,
    remarkZh: '',
    remarkEn: '',
    remarkEs: '',
    isActive: true,
    sortOrder: 1,
  })

  const createConfigMutation = useCreateVipConfig()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await createConfigMutation.mutateAsync(formData)
      router.push('/finance/vip-configs')
    } catch (error) {
      // 错误已由mutation处理
    }
  }

  const handleMultiLangChange = (field: string, values: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: values
    }))
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/finance/vip-configs')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回列表
          </Button>
          <h1 className="text-2xl font-bold">新增VIP配置</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">配置名称 *</Label>
              <MultiLangInput
                value={formData.name}
                onChange={(values) => handleMultiLangChange('name', values)}
                placeholder={{
                  "zh-CN": "中文名称",
                  en: "English Name",
                  es: "Nombre en Español"
                }}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="platform">平台类型 *</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, platform: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择平台" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="supplier">供应端</SelectItem>
                    <SelectItem value="purchaser">采购端</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="level">VIP等级 *</Label>
                <Select
                  value={formData.level}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, level: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择等级" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="promotion">促销版</SelectItem>
                    <SelectItem value="basic">基础版</SelectItem>
                    <SelectItem value="advanced">高级版</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="currency">币种 *</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择币种" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">美元 (USD)</SelectItem>
                    <SelectItem value="CNY">人民币 (CNY)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 价格配置 */}
        <Card>
          <CardHeader>
            <CardTitle>价格配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="originalPrice">原价 *</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    originalPrice: parseFloat(e.target.value) || 0 
                  }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="currentPrice">现价 *</Label>
                <Input
                  id="currentPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.currentPrice}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    currentPrice: parseFloat(e.target.value) || 0 
                  }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="days">有效天数 *</Label>
                <Input
                  id="days"
                  type="number"
                  min="1"
                  value={formData.days}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    days: parseInt(e.target.value) || 0 
                  }))}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 权限配置 */}
        <Card>
          <CardHeader>
            <CardTitle>权限配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="accountQuota">账户配额 *</Label>
                <Input
                  id="accountQuota"
                  type="number"
                  min="1"
                  value={formData.accountQuota}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    accountQuota: parseInt(e.target.value) || 0 
                  }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="maxPurchaseCount">最大购买次数 *</Label>
                <Input
                  id="maxPurchaseCount"
                  type="number"
                  min="1"
                  value={formData.maxPurchaseCount}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    maxPurchaseCount: parseInt(e.target.value) || 0 
                  }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="bonusDays">赠送天数</Label>
                <Input
                  id="bonusDays"
                  type="number"
                  min="0"
                  value={formData.bonusDays}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    bonusDays: parseInt(e.target.value) || 0 
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="vipLevelNumber">VIP等级数字 *</Label>
                <Input
                  id="vipLevelNumber"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.vipLevelNumber}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    vipLevelNumber: parseInt(e.target.value) || 1 
                  }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="sampleViewCount">样品查看次数 *</Label>
                <Input
                  id="sampleViewCount"
                  type="number"
                  min="0"
                  value={formData.sampleViewCount}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    sampleViewCount: parseInt(e.target.value) || 0 
                  }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="viewCount">查看次数 *</Label>
                <Input
                  id="viewCount"
                  type="number"
                  min="0"
                  value={formData.viewCount}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    viewCount: parseInt(e.target.value) || 0 
                  }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="inquiryManagementCount">询盘管理次数 *</Label>
                <Input
                  id="inquiryManagementCount"
                  type="number"
                  min="0"
                  value={formData.inquiryManagementCount}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    inquiryManagementCount: parseInt(e.target.value) || 0 
                  }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="registrationManagementCount">登记管理次数 *</Label>
                <Input
                  id="registrationManagementCount"
                  type="number"
                  min="0"
                  value={formData.registrationManagementCount}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    registrationManagementCount: parseInt(e.target.value) || 0 
                  }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="productPublishCount">产品发布数量</Label>
                <Input
                  id="productPublishCount"
                  type="number"
                  min="0"
                  value={formData.productPublishCount}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    productPublishCount: parseInt(e.target.value) || 0 
                  }))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  仅供应端使用，采购端设置为0
                </p>
              </div>

              <div>
                <Label htmlFor="sortOrder">排序</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  min="1"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    sortOrder: parseInt(e.target.value) || 1 
                  }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 备注信息 */}
        <Card>
          <CardHeader>
            <CardTitle>备注信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="remarkZh">中文备注</Label>
              <Textarea
                id="remarkZh"
                value={formData.remarkZh}
                onChange={(e) => setFormData(prev => ({ ...prev, remarkZh: e.target.value }))}
                placeholder="请输入中文备注..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="remarkEn">英文备注</Label>
              <Textarea
                id="remarkEn"
                value={formData.remarkEn}
                onChange={(e) => setFormData(prev => ({ ...prev, remarkEn: e.target.value }))}
                placeholder="Please enter English remarks..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="remarkEs">西班牙文备注</Label>
              <Textarea
                id="remarkEs"
                value={formData.remarkEs}
                onChange={(e) => setFormData(prev => ({ ...prev, remarkEs: e.target.value }))}
                placeholder="Por favor ingrese comentarios en español..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* 状态设置 */}
        <Card>
          <CardHeader>
            <CardTitle>状态设置</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">启用此配置</Label>
            </div>
          </CardContent>
        </Card>

        {/* 提交按钮 */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/finance/vip-configs')}
          >
            取消
          </Button>
          <Button
            type="submit"
            disabled={createConfigMutation.isPending}
          >
            {createConfigMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            <Save className="mr-2 h-4 w-4" />
            创建配置
          </Button>
        </div>
      </form>
    </div>
  )
}