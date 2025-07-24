'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Target, AlertTriangle } from 'lucide-react'
import { useProduct } from '@/hooks/use-api'
import { ControlMethodList } from '@/components/control-method/control-method-list'
import { ControlMethodForm } from '@/components/control-method/control-method-form'
import { ControlMethodBatchImport } from '@/components/control-method/control-method-batch-import'
import type { ControlMethod } from '@/lib/types'

export default function ControlMethodsPage() {
  const params = useParams()
  const productId = Number(params.id)
  
  const [formOpen, setFormOpen] = useState(false)
  const [batchImportOpen, setBatchImportOpen] = useState(false)
  const [editingMethod, setEditingMethod] = useState<ControlMethod | null>(null)

  const { data: product, isLoading: productLoading, error: productError } = useProduct(productId)

  const handleCreateNew = () => {
    setEditingMethod(null)
    setFormOpen(true)
  }

  const handleEdit = (method: ControlMethod) => {
    setEditingMethod(method)
    setFormOpen(true)
  }

  const handleBatchCreate = () => {
    setBatchImportOpen(true)
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setEditingMethod(null)
  }

  const getMultiLangText = (text: any, lang: 'zh-CN' | 'en' = 'zh-CN'): string => {
    if (!text) return ''
    if (typeof text === 'string') return text
    return text[lang] || text['zh-CN'] || text.zh || ''
  }

  if (productLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/content/products/${productId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回产品详情
            </Link>
          </Button>
          <div>
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-32 bg-muted animate-pulse rounded mt-2" />
          </div>
        </div>
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  if (productError || !product) {
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
            <h1 className="text-3xl font-bold tracking-tight">防治方法管理</h1>
            <p className="text-muted-foreground">管理产品的防治方法信息</p>
          </div>
        </div>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <p className="text-sm text-destructive">
              加载产品信息失败: {(productError as any)?.message || '产品不存在'}
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
            <Link href={`/content/products/${productId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回产品详情
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">防治方法管理</h1>
            <p className="text-muted-foreground">
              产品: {getMultiLangText(product.name, 'zh-CN')}
            </p>
          </div>
        </div>
      </div>

      {/* 产品基础信息卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            产品信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-muted-foreground">产品名称</div>
              <div className="font-medium">{getMultiLangText(product.name, 'zh-CN')}</div>
              {getMultiLangText(product.name, 'en') && (
                <div className="text-sm text-muted-foreground">{getMultiLangText(product.name, 'en')}</div>
              )}
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground">农药名称</div>
              <div className="font-medium">{getMultiLangText(product.pesticideName, 'zh-CN')}</div>
              {getMultiLangText(product.pesticideName, 'en') && (
                <div className="text-sm text-muted-foreground">{getMultiLangText(product.pesticideName, 'en')}</div>
              )}
            </div>

            <div>
              <div className="text-sm text-muted-foreground">供应商</div>
              <div className="font-medium">{product.supplier?.name || '未知供应商'}</div>
              {product.supplier?.country && (
                <div className="text-sm text-muted-foreground">{product.supplier.country}</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 防治方法列表 */}
      <ControlMethodList
        productId={productId}
        onEdit={handleEdit}
        onCreateNew={handleCreateNew}
        onBatchCreate={handleBatchCreate}
      />

      {/* 防治方法表单对话框 */}
      <ControlMethodForm
        productId={productId}
        method={editingMethod}
        open={formOpen}
        onOpenChange={handleFormClose}
      />

      {/* 批量导入对话框 */}
      <ControlMethodBatchImport
        productId={productId}
        open={batchImportOpen}
        onOpenChange={setBatchImportOpen}
      />
    </div>
  )
}