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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { 
  CheckCircle, 
  XCircle, 
  Building2, 
  Globe, 
  Users, 
  Calendar,
  AlertTriangle,
  Loader2
} from 'lucide-react'
import type { Company } from '@/lib/types'
import { CountryDisplay } from '@/components/enhanced-country-select'
import { useDictionaryOptions } from '@/lib/dictionary-utils'

export interface ReviewDialogProps {
  company: Company | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (approved: boolean, reason: string) => Promise<void>
  loading?: boolean
}

export function ReviewDialog({
  company,
  open,
  onOpenChange,
  onConfirm,
  loading = false
}: ReviewDialogProps) {
  const [reviewType, setReviewType] = useState<'approve' | 'reject'>('approve')
  const [reason, setReason] = useState('')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // 获取字典选项
  const companySizeOptions = useDictionaryOptions('company_size')

  const handleSubmit = () => {
    if (!company) return
    
    // 如果是拒绝审核且没有填写理由，显示警告
    if (reviewType === 'reject' && !reason.trim()) {
      return
    }
    
    setShowConfirmDialog(true)
  }

  const handleConfirm = async () => {
    if (!company) return
    
    try {
      await onConfirm(reviewType === 'approve', reason.trim())
      
      // 重置状态
      setReviewType('approve')
      setReason('')
      setShowConfirmDialog(false)
      onOpenChange(false)
    } catch (error) {
      // 错误处理已在上层完成
      setShowConfirmDialog(false)
    }
  }

  const handleClose = () => {
    if (loading) return // 加载中不允许关闭
    
    setReviewType('approve')
    setReason('')
    setShowConfirmDialog(false)
    onOpenChange(false)
  }

  const getCompanySizeLabel = (size?: string) => {
    if (!size) return '未设置'
    const option = companySizeOptions.find(opt => opt.value === size)
    return option ? option.label : size
  }

  const getTypeLabel = (type: Company['type']) => {
    switch (type) {
      case 'supplier': return '供应商'
      case 'buyer': return '采购商'
      case 'manufacturer': return '制造商'
      case 'distributor': return '分销商'
      default: return type
    }
  }

  const formatAnnualValue = (value?: number | string) => {
    if (!value || value === 0) return '未设置'
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(numValue) || numValue === 0) return '未设置'
    
    if (numValue >= 1000000) {
      return `$${(numValue / 1000000).toFixed(1)}M`
    } else if (numValue >= 1000) {
      return `$${(numValue / 1000).toFixed(1)}K`
    } else {
      return `$${numValue.toFixed(0)}`
    }
  }

  if (!company) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              企业审核
            </DialogTitle>
            <DialogDescription>
              请仔细审核企业信息，并选择审核结果
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* 企业基本信息 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">企业基本信息</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">企业名称</Label>
                  <div className="mt-1">
                    <div className="font-medium">{company.name['zh-CN'] || company.name.zh}</div>
                    {company.name.en && (
                      <div className="text-sm text-muted-foreground">{company.name.en}</div>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">企业类型</Label>
                  <div className="mt-1">
                    <Badge variant="outline">{getTypeLabel(company.type)}</Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">国家地区</Label>
                  <div className="mt-1">
                    {company.country ? (
                      <CountryDisplay value={company.country} showFlag={true} />
                    ) : (
                      <span className="text-muted-foreground">未设置</span>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">公司规模</Label>
                  <div className="mt-1">
                    <Badge variant="outline">{getCompanySizeLabel(company.companySize)}</Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">年交易额</Label>
                  <div className="mt-1 font-medium">
                    {formatAnnualValue(company.annualImportExportValue)}
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">注册时间</Label>
                  <div className="mt-1 flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(company.createdAt).toLocaleDateString('zh-CN')}</span>
                  </div>
                </div>
              </div>

              {/* 联系信息 */}
              {(company.email || company.profile?.phone) && (
                <div>
                  <Label className="text-sm text-muted-foreground">联系信息</Label>
                  <div className="mt-1 space-y-1">
                    {company.email && (
                      <div className="text-sm">邮箱: {company.email}</div>
                    )}
                    {company.profile?.phone && (
                      <div className="text-sm">电话: {company.profile.phone}</div>
                    )}
                  </div>
                </div>
              )}

              {/* 业务范围 */}
              {company.businessScope && (
                <div>
                  <Label className="text-sm text-muted-foreground">业务范围</Label>
                  <div className="mt-1 text-sm">
                    {company.businessScope['zh-CN'] || company.businessScope.zh || '未设置'}
                  </div>
                </div>
              )}

              {/* 主要产品 */}
              {company.mainProducts && (
                <div>
                  <Label className="text-sm text-muted-foreground">主要产品</Label>
                  <div className="mt-1 text-sm">
                    {company.mainProducts['zh-CN'] || company.mainProducts.zh || '未设置'}
                  </div>
                </div>
              )}
            </div>

            {/* 审核选择 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">审核决定</h3>
              
              <RadioGroup value={reviewType} onValueChange={(value) => setReviewType(value as 'approve' | 'reject')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="approve" id="approve" />
                  <Label htmlFor="approve" className="flex items-center gap-2 cursor-pointer">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 font-medium">审核通过</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="reject" id="reject" />
                  <Label htmlFor="reject" className="flex items-center gap-2 cursor-pointer">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-red-600 font-medium">审核拒绝</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* 审核理由 */}
            <div className="space-y-2">
              <Label htmlFor="reason" className="flex items-center gap-2">
                审核理由
                {reviewType === 'reject' && (
                  <span className="text-red-500 text-sm">*</span>
                )}
              </Label>
              <Textarea
                id="reason"
                placeholder={reviewType === 'approve' ? '可选：补充说明审核通过的原因...' : '请填写拒绝审核的具体理由...'}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className={reviewType === 'reject' && !reason.trim() ? 'border-red-300' : ''}
              />
              {reviewType === 'reject' && !reason.trim() && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  拒绝审核时必须填写理由
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              取消
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || (reviewType === 'reject' && !reason.trim())}
              className={reviewType === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {reviewType === 'approve' ? '确认通过' : '确认拒绝'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 确认对话框 */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {reviewType === 'approve' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              确认{reviewType === 'approve' ? '通过' : '拒绝'}审核
            </AlertDialogTitle>
            <AlertDialogDescription>
              您确定要{reviewType === 'approve' ? '通过' : '拒绝'} <strong>{company.name['zh-CN'] || company.name.zh}</strong> 的企业审核吗？
              {reason && (
                <div className="mt-2 p-2 bg-muted rounded text-sm">
                  <strong>审核理由：</strong>{reason}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirm} 
              disabled={loading}
              className={reviewType === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              确认{reviewType === 'approve' ? '通过' : '拒绝'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}