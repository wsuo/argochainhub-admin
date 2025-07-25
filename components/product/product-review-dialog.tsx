'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle, 
  XCircle, 
  Package,
  Building,
  Calendar,
  FileText,
  AlertTriangle
} from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import type { Product } from '@/lib/types'
import { getDictionaryLabel } from '@/lib/dictionary-utils'
import { getMultiLangText, safeRenderText } from '@/lib/multi-lang-utils'
import type { DictionaryOption } from '@/lib/dictionary-utils'

export interface ProductReviewDialogProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (approved: boolean, reason: string) => void
  loading?: boolean
  formulations?: DictionaryOption[]
  toxicities?: DictionaryOption[]
}

export function ProductReviewDialog({
  product,
  open,
  onOpenChange,
  onConfirm,
  loading = false,
  formulations = [],
  toxicities = []
}: ProductReviewDialogProps) {
  const [reason, setReason] = useState('')
  const [selectedAction, setSelectedAction] = useState<'approve' | 'reject' | null>(null)

  const handleClose = () => {
    setReason('')
    setSelectedAction(null)
    onOpenChange(false)
  }

  const handleConfirm = () => {
    if (selectedAction && (selectedAction === 'approve' || reason.trim())) {
      onConfirm(selectedAction === 'approve', reason.trim())
      handleClose()
    }
  }


  const getToxicityBadge = (toxicity: Product['toxicity']) => {
    console.log('🔍 产品审核对话框 - 毒性数据调试:', {
      toxicity,
      toxicityType: typeof toxicity,
      toxicities: toxicities.length > 0 ? toxicities.slice(0, 3) : '字典未加载'
    })
    
    if (!toxicity) {
      return <Badge variant="outline" className="text-muted-foreground">未设置</Badge>
    }
    
    // 从字典中获取标签 - 需要将数字转换为字符串来匹配字典的code
    const toxicityCode = String(toxicity)
    const label = getDictionaryLabel(toxicities, toxicityCode, toxicityCode)
    
    console.log('🔍 毒性标签映射 (审核对话框):', {
      原始值: toxicity,
      转换后code: toxicityCode,
      匹配到的标签: label
    })
    
    // 根据毒性等级设置不同颜色
    const colorClass = (() => {
      switch (toxicityCode) {
        case '1': // 微毒
        case '6': // 微毒(原药高毒)
          return 'bg-blue-100 text-blue-800'
        case '2': // 低毒  
        case '8': // 低毒(原药高毒)
        case '9': // 低毒(原药剧毒)
          return 'bg-green-100 text-green-800'
        case '3': // 中等毒
        case '10': // 中等毒(原药高毒)
        case '11': // 中等毒(原药剧毒)
          return 'bg-yellow-100 text-yellow-800'
        case '4': // 高毒
          return 'bg-orange-100 text-orange-800'
        case '5': // 剧毒
          return 'bg-red-100 text-red-800'
        default:
          return 'bg-gray-100 text-gray-800'
      }
    })()
    
    return <Badge variant="secondary" className={colorClass}>{label}</Badge>
  }

  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            产品审核 - {getMultiLangText(product.name, 'zh-CN')}
          </DialogTitle>
          <DialogDescription>
            请仔细审核产品信息，确保内容准确无误后选择审核结果
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 基础信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">基础信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">产品名称</Label>
                  <div className="mt-1">
                    <div className="font-medium">{getMultiLangText(product.name, 'zh-CN')}</div>
                    {getMultiLangText(product.name, 'en') && (
                      <div className="text-sm text-muted-foreground">{getMultiLangText(product.name, 'en')}</div>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">农药名称</Label>
                  <div className="mt-1">
                    <div className="font-medium">{getMultiLangText(product.pesticideName, 'zh-CN')}</div>
                    {getMultiLangText(product.pesticideName, 'en') && (
                      <div className="text-sm text-muted-foreground">{getMultiLangText(product.pesticideName, 'en')}</div>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">供应商</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{safeRenderText(product.supplier?.name, '未知供应商')}</span>
                    {product.supplier?.country && (
                      <Badge variant="outline">{safeRenderText(product.supplier.country)}</Badge>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">剂型</Label>
                  <div className="mt-1">
                    <Badge variant="outline">
                      {getDictionaryLabel(formulations, product.formulation, product.formulation)}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">毒性等级</Label>
                  <div className="mt-1">
                    {getToxicityBadge(product.toxicity)}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">总含量</Label>
                  <div className="mt-1 font-medium">{product.totalContent}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 登记信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">登记信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">登记证号</Label>
                  <div className="mt-1 font-mono bg-muted px-2 py-1 rounded">
                    {product.registrationNumber || '未填写'}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">登记证持有人</Label>
                  <div className="mt-1">{product.registrationHolder || '未填写'}</div>
                </div>

                <div>
                  <Label className="text-sm font-medium">有效截止日期</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {product.effectiveDate ? (
                      format(new Date(product.effectiveDate), 'yyyy年MM月dd日', { locale: zhCN })
                    ) : '未填写'}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">首次批准日期</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {product.firstApprovalDate ? (
                      format(new Date(product.firstApprovalDate), 'yyyy年MM月dd日', { locale: zhCN })
                    ) : '未填写'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 有效成分 */}
          {(product.activeIngredient1 || product.activeIngredient2 || product.activeIngredient3) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">有效成分</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[product.activeIngredient1, product.activeIngredient2, product.activeIngredient3]
                  .filter(Boolean)
                  .map((ingredient, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{getMultiLangText(ingredient?.name, 'zh-CN')}</div>
                        {getMultiLangText(ingredient?.name, 'en') && (
                          <div className="text-sm text-muted-foreground">{getMultiLangText(ingredient?.name, 'en')}</div>
                        )}
                      </div>
                      <Badge variant="secondary">{ingredient?.content}</Badge>
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}

          {/* 订购信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">订购信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">最低起订量</Label>
                  <div className="mt-1 font-medium">
                    {product.minOrderQuantity?.toLocaleString()} {product.minOrderUnit}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 产品详情 */}
          {product.details && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">产品详情</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.details.productCategory && (
                  <div>
                    <Label className="text-sm font-medium">产品品类</Label>
                    <div className="mt-1">
                      <Badge variant="outline">{product.details.productCategory}</Badge>
                    </div>
                  </div>
                )}

                {product.details.exportRestrictedCountries?.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">出口限制国家</Label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {product.details.exportRestrictedCountries.map((country, index) => (
                        <Badge key={index} variant="destructive">{country}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {product.details.description && (
                  <div>
                    <Label className="text-sm font-medium">产品描述</Label>
                    <div className="mt-1 p-3 bg-muted rounded-lg">
                      {product.details.description}
                    </div>
                  </div>
                )}

                {product.details.remarks && (
                  <div>
                    <Label className="text-sm font-medium">备注</Label>
                    <div className="mt-1 p-3 bg-muted rounded-lg">
                      {product.details.remarks}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* 审核操作 */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                variant={selectedAction === 'approve' ? 'default' : 'outline'}
                onClick={() => setSelectedAction('approve')}
                className="flex-1"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                通过审核
              </Button>
              <Button
                variant={selectedAction === 'reject' ? 'destructive' : 'outline'}
                onClick={() => setSelectedAction('reject')}
                className="flex-1"
              >
                <XCircle className="mr-2 h-4 w-4" />
                拒绝审核
              </Button>
            </div>

            {selectedAction === 'reject' && (
              <div className="space-y-2">
                <Label htmlFor="reason" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  拒绝原因 <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="reason"
                  placeholder="请详细说明拒绝审核的原因..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                />
              </div>
            )}

            {selectedAction === 'approve' && (
              <div className="space-y-2">
                <Label htmlFor="reason">审核意见（可选）</Label>
                <Textarea
                  id="reason"
                  placeholder="可以填写审核通过的意见或建议..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            取消
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || !selectedAction || (selectedAction === 'reject' && !reason.trim())}
          >
            {loading ? '提交中...' : '确认审核'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}