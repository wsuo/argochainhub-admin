'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { 
  ArrowLeft, 
  Edit, 
  Package, 
  Building, 
  Calendar, 
  FileText, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  PackageOpen,
  Trash2,
  Plus,
  Target
} from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useProduct, useReviewProduct, useListProduct, useUnlistProduct, useDeleteProduct, useControlMethods } from '@/hooks/use-api'
import { ProductReviewDialog } from '@/components/product/product-review-dialog'
import type { Product } from '@/lib/types'
import { useDictionaryOptions } from '@/lib/dictionary-utils'
import { getDictionaryLabel } from '@/lib/dictionary-utils'
import { getMultiLangText, safeRenderText } from '@/lib/multi-lang-utils'
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

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = Number(params.id)
  
  const [reviewProduct, setReviewProduct] = useState<Product | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)

  const { data: product, isLoading, error } = useProduct(productId)
  const { data: controlMethods } = useControlMethods(productId)
  const reviewMutation = useReviewProduct()
  const listMutation = useListProduct()
  const unlistMutation = useUnlistProduct()
  const deleteMutation = useDeleteProduct()

  // 获取字典数据
  const formulations = useDictionaryOptions('formulation')
  const toxicities = useDictionaryOptions('toxicity')

  const handleReview = (approved: boolean) => {
    if (product) {
      setReviewProduct(product)
      setReviewDialogOpen(true)
    }
  }

  const handleReviewConfirm = async (approved: boolean, reason: string) => {
    if (!reviewProduct) return

    await reviewMutation.mutateAsync({
      id: reviewProduct.id,
      data: { approved, reason }
    })
    setReviewDialogOpen(false)
    setReviewProduct(null)
  }

  const handleToggleListing = async () => {
    if (!product) return
    
    if (product.isListed) {
      await unlistMutation.mutateAsync(product.id)
    } else {
      await listMutation.mutateAsync(product.id)
    }
  }

  const handleDelete = async () => {
    if (!product) return
    
    await deleteMutation.mutateAsync(product.id)
    router.push('/content/products')
  }

  const getStatusBadge = (status: Product['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="secondary" className="gap-1"><CheckCircle className="h-3 w-3" />已通过</Badge>
      case 'pending_review':
        return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />待审核</Badge>
      case 'rejected':
        return <Badge variant="outline" className="gap-1"><XCircle className="h-3 w-3" />已拒绝</Badge>
      case 'draft':
        return <Badge variant="outline">草稿</Badge>
      case 'inactive':
        return <Badge variant="outline">未激活</Badge>
      case 'archived':
        return <Badge variant="outline">已归档</Badge>
      default:
        // 未知状态的中文映射
        const statusMap: Record<string, string> = {
          'ACTIVE': '已通过',
          'PENDING_REVIEW': '待审核',
          'REJECTED': '已拒绝',
          'DRAFT': '草稿',
          'INACTIVE': '未激活',
          'disabled': '已禁用',
          'suspended': '已暂停'
        }
        return <Badge variant="outline">{statusMap[status] || status}</Badge>
    }
  }

  const getToxicityBadge = (toxicity: Product['toxicity']) => {
    
    if (!toxicity) {
      return <Badge variant="outline" className="text-muted-foreground">未设置</Badge>
    }
    
    // 从字典中获取标签 - 需要将数字转换为字符串来匹配字典的code
    const toxicityCode = String(toxicity)
    const label = getDictionaryLabel(toxicities, toxicityCode, toxicityCode)
    
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

  const getListingBadge = (isListed: boolean) => {
    return isListed ? (
      <Badge variant="secondary" className="gap-1"><Package className="h-3 w-3" />已上架</Badge>
    ) : (
      <Badge variant="outline" className="gap-1"><PackageOpen className="h-3 w-3" />未上架</Badge>
    )
  }


  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/content/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回产品管理
            </Link>
          </Button>
          <div>
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-32 bg-muted animate-pulse rounded mt-2" />
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/content/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回产品管理
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">产品详情</h1>
            <p className="text-muted-foreground">查看产品的详细信息</p>
          </div>
        </div>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <p className="text-sm text-destructive">
              加载产品详情失败: {(error as any)?.message || '产品不存在'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/content/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回产品管理
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {getMultiLangText(product.name, 'zh-CN')}
            </h1>
            <p className="text-muted-foreground">
              产品ID: {product.id} | 创建时间: {format(new Date(product.createdAt), 'yyyy年MM月dd日', { locale: zhCN })}
            </p>
          </div>
        </div>
        
        {/* 操作按钮 */}
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/content/products/${product.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              编辑
            </Link>
          </Button>
          
          {/* 审核操作 */}
          {product.status === 'pending_review' && (
            <>
              <Button onClick={() => handleReview(true)} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                通过审核
              </Button>
              <Button onClick={() => handleReview(false)} variant="destructive">
                <XCircle className="h-4 w-4 mr-2" />
                拒绝审核
              </Button>
            </>
          )}
          
          {/* 上架/下架操作 */}
          {product.status === 'active' && (
            <Button 
              onClick={handleToggleListing} 
              variant={product.isListed ? "outline" : "default"}
              disabled={listMutation.isPending || unlistMutation.isPending}
            >
              {product.isListed ? (
                <>
                  <PackageOpen className="h-4 w-4 mr-2" />
                  下架产品
                </>
              ) : (
                <>
                  <Package className="h-4 w-4 mr-2" />
                  上架产品
                </>
              )}
            </Button>
          )}
          
          {/* 删除操作 */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive hover:bg-destructive hover:text-destructive-foreground">
                <Trash2 className="h-4 w-4 mr-2" />
                删除
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认删除产品</AlertDialogTitle>
                <AlertDialogDescription>
                  此操作将永久删除产品 "{getMultiLangText(product.name, 'zh-CN')}" 及其所有相关数据。
                  该操作无法撤销，请确认是否继续。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? '删除中...' : '确认删除'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* 状态徽章 */}
      <div className="flex gap-2">
        {getStatusBadge(product.status)}
        {getListingBadge(product.isListed)}
        {getToxicityBadge(product.toxicity)}
      </div>

      {/* 基础信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            基础信息
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium">产品名称</Label>
              <div className="mt-1">
                <div className="font-medium text-lg">{getMultiLangText(product.name, 'zh-CN')}</div>
                {(() => {
                  const englishText = getMultiLangText(product.name, 'en')
                  return englishText ? (
                    <div className="text-sm text-muted-foreground">{englishText}</div>
                  ) : null
                })()}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">农药名称</Label>
              <div className="mt-1">
                <div className="font-medium">{getMultiLangText(product.pesticideName, 'zh-CN')}</div>
                {(() => {
                  const englishText = getMultiLangText(product.pesticideName, 'en')
                  return englishText ? (
                    <div className="text-sm text-muted-foreground">{englishText}</div>
                  ) : null
                })()}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">供应商</Label>
              <div className="mt-1 flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{safeRenderText(product.supplier?.name, '未知供应商')}</span>
                {product.supplier?.country && (
                  <Badge variant="outline">{safeRenderText(product.supplier.country)}</Badge>
                )}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">剂型</Label>
              <div className="mt-1">
                <Badge variant="outline" className="text-base px-3 py-1">
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
              <div className="mt-1 font-medium">{safeRenderText(product.totalContent)}</div>
            </div>

            <div>
              <Label className="text-sm font-medium">最低起订量</Label>
              <div className="mt-1 font-medium">
                {product.minOrderQuantity?.toLocaleString()} {safeRenderText(product.minOrderUnit)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 登记信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            登记信息
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium">登记证号</Label>
              <div className="mt-1 font-mono bg-muted px-3 py-2 rounded-lg">
                {safeRenderText(product.registrationNumber, '未填写')}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">登记证持有人</Label>
              <div className="mt-1 font-medium">{safeRenderText(product.registrationHolder, '未填写')}</div>
            </div>

            <div>
              <Label className="text-sm font-medium">有效截止日期</Label>
              <div className="mt-1 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {product.effectiveDate ? 
                    format(new Date(product.effectiveDate), 'yyyy年MM月dd日', { locale: zhCN }) : 
                    '未填写'
                  }
                </span>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">首次批准日期</Label>
              <div className="mt-1 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {product.firstApprovalDate ? 
                    format(new Date(product.firstApprovalDate), 'yyyy年MM月dd日', { locale: zhCN }) : 
                    '未填写'
                  }
                </span>
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
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                  <div>
                    <div className="font-medium">{getMultiLangText(ingredient?.name, 'zh-CN')}</div>
                    {(() => {
                      const englishText = getMultiLangText(ingredient?.name, 'en')
                      return englishText ? (
                        <div className="text-sm text-muted-foreground">{englishText}</div>
                      ) : null
                    })()}
                  </div>
                  <Badge variant="secondary" className="text-base px-3 py-1">{safeRenderText(ingredient?.content)}</Badge>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* 产品详情 */}
      {product.details && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">产品详情</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {product.details.productCategory && (
              <div>
                <Label className="text-sm font-medium">产品品类</Label>
                <div className="mt-1">
                  <Badge variant="outline" className="text-base px-3 py-1">
                    {safeRenderText(product.details.productCategory)}
                  </Badge>
                </div>
              </div>
            )}

            {product.details.exportRestrictedCountries?.length > 0 && (
              <div>
                <Label className="text-sm font-medium">出口限制国家</Label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {product.details.exportRestrictedCountries.map((country, index) => (
                    <Badge key={index} variant="destructive">{safeRenderText(country)}</Badge>
                  ))}
                </div>
              </div>
            )}

            {product.details.description && (
              <div>
                <Label className="text-sm font-medium">产品描述</Label>
                <div className="mt-1 p-4 bg-muted rounded-lg">
                  <p className="whitespace-pre-wrap">{safeRenderText(product.details.description)}</p>
                </div>
              </div>
            )}

            {product.details.remarks && (
              <div>
                <Label className="text-sm font-medium">备注</Label>
                <div className="mt-1 p-4 bg-muted rounded-lg">
                  <p className="whitespace-pre-wrap">{safeRenderText(product.details.remarks)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 防治方法 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">防治方法</CardTitle>
            <Button size="sm" asChild>
              <Link href={`/content/products/${product.id}/control-methods`}>
                <Plus className="h-4 w-4 mr-2" />
                管理防治方法
              </Link>
            </Button>
          </div>
          <CardDescription>
            产品的防治对象和使用方法
            {controlMethods && controlMethods.length > 0 && ` (共 ${controlMethods.length} 个)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!controlMethods || controlMethods.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">暂无防治方法</h3>
              <p className="mb-4">还没有为该产品添加防治方法</p>
              <Button asChild>
                <Link href={`/content/products/${product.id}/control-methods`}>
                  <Plus className="h-4 w-4 mr-2" />
                  添加防治方法
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 防治方法摘要 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{controlMethods.length}</div>
                  <div className="text-sm text-muted-foreground">防治方法</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {new Set(controlMethods.map(m => getMultiLangText(m.targetCrop, 'zh-CN'))).size}
                  </div>
                  <div className="text-sm text-muted-foreground">防治对象</div>
                </div>
              </div>

              {/* 防治方法列表预览 */}
              <div className="space-y-3">
                {controlMethods.slice(0, 3).map((method, index) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-primary text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{getMultiLangText(method.targetCrop, 'zh-CN')}</div>
                          <div className="text-sm text-muted-foreground">
                            防治: {getMultiLangText(method.pestDisease, 'zh-CN')} • 
                            方法: {getMultiLangText(method.applicationMethod, 'zh-CN')} • 
                            用量: {getMultiLangText(method.dosage, 'zh-CN')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {controlMethods.length > 3 && (
                  <div className="text-center py-4">
                    <Button variant="outline" asChild>
                      <Link href={`/content/products/${product.id}/control-methods`}>
                        查看全部 {controlMethods.length} 个防治方法
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 审核对话框 */}
      <ProductReviewDialog
        product={reviewProduct}
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        onConfirm={handleReviewConfirm}
        loading={reviewMutation.isPending}
        formulations={formulations}
        toxicities={toxicities}
      />
    </div>
  )
}