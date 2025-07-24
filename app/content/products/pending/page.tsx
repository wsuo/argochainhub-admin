'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react'
import { usePendingProducts, useReviewProduct } from '@/hooks/use-api'
import { DataPagination } from '@/components/data-pagination'
import { ProductListTable } from '@/components/product/product-list-table'
import { ProductFilters } from '@/components/product/product-filters'
import { ProductReviewDialog } from '@/components/product/product-review-dialog'
import type { Product, ProductQuery } from '@/lib/types'
import { useDictionaryOptions } from '@/lib/dictionary-utils'

export default function PendingProductsPage() {
  const [query, setQuery] = useState<Omit<ProductQuery, 'status'>>({
    page: 1,
    limit: 20,
  })
  
  const [reviewProduct, setReviewProduct] = useState<Product | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)

  const { data, isLoading, error } = usePendingProducts(query)
  const reviewMutation = useReviewProduct()

  // 获取字典数据
  const formulations = useDictionaryOptions('formulation')

  const handleFilterChange = (newQuery: Partial<ProductQuery>) => {
    // 从newQuery中移除status字段，因为这是专门的待审核页面
    const { status, ...filteredQuery } = newQuery
    setQuery(prev => ({ ...prev, ...filteredQuery }))
  }

  const handlePageChange = (page: number) => {
    setQuery(prev => ({ ...prev, page }))
  }

  const handleReview = (product: Product, approved: boolean) => {
    setReviewProduct(product)
    setReviewDialogOpen(true)
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

  // 计算统计数据
  const totalPendingProducts = data?.meta?.totalItems || 0

  if (error) {
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
            <h1 className="text-3xl font-bold tracking-tight">待审核产品</h1>
            <p className="text-muted-foreground">审核平台上等待处理的产品信息</p>
          </div>
        </div>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <p className="text-sm text-destructive">
              加载待审核产品数据失败: {(error as any).message}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/content/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回产品管理
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">待审核产品</h1>
            <p className="text-muted-foreground">审核平台上等待处理的产品信息</p>
          </div>
        </div>
        {totalPendingProducts > 0 && (
          <Badge variant="destructive" className="text-base px-3 py-1">
            <AlertTriangle className="h-4 w-4 mr-1" />
            {totalPendingProducts} 个待审核
          </Badge>
        )}
      </div>

      {/* 快速审核统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待审核总数</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {totalPendingProducts}
            </div>
            <p className="text-xs text-muted-foreground">
              需要审核的产品
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日待处理</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {/* 这里可以根据创建日期筛选今日的产品 */}
              {data?.data.filter(product => {
                const today = new Date()
                const productDate = new Date(product.createdAt)
                return productDate.toDateString() === today.toDateString()
              }).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              今天提交的产品
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均处理时间</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              2.5
            </div>
            <p className="text-xs text-muted-foreground">
              天 (预计数据)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 筛选器 - 不显示状态筛选 */}
      <ProductFilters
        onSearch={handleFilterChange}
        showStatusFilter={false}
        showFormulationFilter={true}
        showToxicityFilter={true}
        showCountryFilter={true}
        showSupplierFilter={true}
        showListingFilter={false}
        showDateFilters={true}
      />

      {/* 待审核产品列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                待审核产品列表
              </CardTitle>
              <CardDescription>
                {data && data.meta && `共 ${data.meta.totalItems} 个待审核产品，当前显示第 ${data.meta.currentPage} 页`}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                批量通过
              </Button>
              <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                <XCircle className="h-4 w-4 mr-2" />
                批量拒绝
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : data?.data.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">🎉 太好了！没有待审核的产品</h3>
              <p className="text-muted-foreground mb-4">
                当前筛选条件下没有找到需要审核的产品
              </p>
              <Button asChild variant="outline">
                <Link href="/content/products">
                  查看所有产品
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <ProductListTable
                products={data?.data || []}
                loading={isLoading}
                showReviewActions={true}
                showListingToggle={false}
                showDeleteAction={false}
                onReview={handleReview}
                formulations={formulations}
              />

              {/* 分页 */}
              {data && data.meta && (
                <DataPagination
                  currentPage={data.meta.currentPage}
                  totalPages={data.meta.totalPages}
                  totalItems={data.meta.totalItems}
                  itemsPerPage={data.meta.itemsPerPage}
                  onPageChange={handlePageChange}
                />
              )}
            </>
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
      />
    </div>
  )
}