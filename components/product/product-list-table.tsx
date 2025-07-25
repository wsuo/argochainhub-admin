'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MoreHorizontal, 
  Eye, 
  Edit,
  CheckCircle,
  XCircle,
  Package,
  PackageOpen,
  Trash2,
  ShoppingCart
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Product } from '@/lib/types'
import { getDictionaryLabel } from '@/lib/dictionary-utils'
import { getMultiLangText, safeRenderText } from '@/lib/multi-lang-utils'
import type { DictionaryOption } from '@/lib/dictionary-utils'

export interface ProductListTableProps {
  products: Product[]
  loading?: boolean
  showReviewActions?: boolean // 是否显示审核操作
  showListingToggle?: boolean // 是否显示上架/下架操作
  showDeleteAction?: boolean // 是否显示删除操作
  onReview?: (product: Product, approved: boolean) => void
  onToggleListing?: (productId: number, isListed: boolean) => void
  onDelete?: (productId: number) => void
  formulations?: DictionaryOption[] // 剂型字典
  toxicities?: DictionaryOption[] // 毒性字典
}

export function ProductListTable({
  products,
  loading = false,
  showReviewActions = false,
  showListingToggle = false,
  showDeleteAction = false,
  onReview,
  onToggleListing,
  onDelete,
  formulations = [],
  toxicities = []
}: ProductListTableProps) {
  const getStatusBadge = (status: Product['status']) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="secondary" className="gap-1"><CheckCircle className="h-3 w-3" />已通过</Badge>
      case 'PENDING_REVIEW':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />待审核</Badge>
      case 'REJECTED':
        return <Badge variant="outline" className="gap-1"><XCircle className="h-3 w-3" />已拒绝</Badge>
      case 'DRAFT':
        return <Badge variant="outline">草稿</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getToxicityBadge = (toxicity: Product['toxicity']) => {
    console.log('🔍 产品列表表格 - 毒性数据调试:', {
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
    
    console.log('🔍 毒性标签映射 (列表表格):', {
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

  const getListingBadge = (isListed: boolean) => {
    return isListed ? (
      <Badge variant="secondary" className="gap-1"><Package className="h-3 w-3" />已上架</Badge>
    ) : (
      <Badge variant="outline" className="gap-1"><PackageOpen className="h-3 w-3" />未上架</Badge>
    )
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded" />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-semibold mb-2">暂无产品</h3>
        <p className="text-muted-foreground">
          当前筛选条件下没有找到产品
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>产品信息</TableHead>
            <TableHead>农药名称</TableHead>
            <TableHead>供应商</TableHead>
            <TableHead>剂型</TableHead>
            <TableHead>毒性</TableHead>
            <TableHead>起订量</TableHead>
            <TableHead>状态</TableHead>
            {showListingToggle && <TableHead>上架状态</TableHead>}
            <TableHead>创建时间</TableHead>
            <TableHead className="w-[100px]">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              {/* 产品信息 */}
              <TableCell>
                <div>
                  <div className="font-medium">
                    {getMultiLangText(product.name, 'zh-CN')}
                  </div>
                  {getMultiLangText(product.name, 'en') && (
                    <div className="text-sm text-muted-foreground">
                      {getMultiLangText(product.name, 'en')}
                    </div>
                  )}
                  {product.registrationNumber && (
                    <div className="text-xs text-muted-foreground">
                      登记证号: {safeRenderText(product.registrationNumber)}
                    </div>
                  )}
                </div>
              </TableCell>

              {/* 农药名称 */}
              <TableCell>
                <div>
                  <div className="font-medium">
                    {getMultiLangText(product.pesticideName, 'zh-CN')}
                  </div>
                  {getMultiLangText(product.pesticideName, 'en') && (
                    <div className="text-sm text-muted-foreground">
                      {getMultiLangText(product.pesticideName, 'en')}
                    </div>
                  )}
                </div>
              </TableCell>

              {/* 供应商 */}
              <TableCell>
                {product.supplier ? (
                  <div>
                    <div className="font-medium">{safeRenderText(product.supplier.name)}</div>
                    <div className="text-sm text-muted-foreground">{safeRenderText(product.supplier.country)}</div>
                  </div>
                ) : (
                  <span className="text-muted-foreground">未知供应商</span>
                )}
              </TableCell>

              {/* 剂型 */}
              <TableCell>
                {product.formulation ? (
                  <Badge variant="outline">
                    {(() => {
                      const formulationLabel = getDictionaryLabel(formulations, product.formulation, safeRenderText(product.formulation))
                      console.log('🔍 产品列表表格 - 剂型数据调试:', {
                        formulation: product.formulation,
                        formulationType: typeof product.formulation,  
                        formulations: formulations.length > 0 ? formulations.slice(0, 3) : '字典未加载',
                        匹配到的标签: formulationLabel
                      })
                      return formulationLabel
                    })()}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    未设置
                  </Badge>
                )}
              </TableCell>

              {/* 毒性 */}
              <TableCell>
                {getToxicityBadge(product.toxicity)}
              </TableCell>

              {/* 起订量 */}
              <TableCell>
                <div className="text-sm">
                  {product.minOrderQuantity?.toLocaleString()} {safeRenderText(product.minOrderUnit)}
                </div>
              </TableCell>

              {/* 状态 */}
              <TableCell>
                {getStatusBadge(product.status)}
              </TableCell>

              {/* 上架状态 */}
              {showListingToggle && (
                <TableCell>
                  {getListingBadge(product.isListed)}
                </TableCell>
              )}

              {/* 创建时间 */}
              <TableCell>
                <div className="text-sm">
                  {format(new Date(product.createdAt), 'yyyy-MM-dd', { locale: zhCN })}
                </div>
              </TableCell>

              {/* 操作 */}
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">打开菜单</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>操作</DropdownMenuLabel>
                    
                    {/* 查看详情 */}
                    <DropdownMenuItem asChild>
                      <Link href={`/content/products/${product.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        查看详情
                      </Link>
                    </DropdownMenuItem>

                    {/* 编辑 */}
                    <DropdownMenuItem asChild>
                      <Link href={`/content/products/${product.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        编辑
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* 审核操作 */}
                    {showReviewActions && product.status === 'PENDING_REVIEW' && (
                      <>
                        <DropdownMenuItem
                          onClick={() => onReview?.(product, true)}
                          className="text-green-600"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          通过审核
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onReview?.(product, false)}
                          className="text-red-600"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          拒绝审核
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}

                    {/* 上架/下架操作 */}
                    {showListingToggle && product.status === 'ACTIVE' && (
                      <>
                        {product.isListed ? (
                          <DropdownMenuItem
                            onClick={() => onToggleListing?.(product.id, false)}
                            className="text-orange-600"
                          >
                            <PackageOpen className="mr-2 h-4 w-4" />
                            下架产品
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => onToggleListing?.(product.id, true)}
                            className="text-green-600"
                          >
                            <Package className="mr-2 h-4 w-4" />
                            上架产品
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                      </>
                    )}

                    {/* 删除操作 */}
                    {showDeleteAction && (
                      <DropdownMenuItem
                        onClick={() => onDelete?.(product.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        删除产品
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}