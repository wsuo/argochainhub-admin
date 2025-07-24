'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, Building2, AlertTriangle, CheckCircle2, XCircle, Plus } from 'lucide-react'
import { useProducts, useReviewProduct, useListProduct, useUnlistProduct, useDeleteProduct } from '@/hooks/use-api'
import { DataPagination } from '@/components/data-pagination'
import { ProductListTable } from '@/components/product/product-list-table'
import { ProductFilters } from '@/components/product/product-filters'
import { ProductReviewDialog } from '@/components/product/product-review-dialog'
import type { Product, ProductQuery } from '@/lib/types'
import { useDictionaryOptions } from '@/lib/dictionary-utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function ProductsPage() {
  const [query, setQuery] = useState<ProductQuery>({
    page: 1,
    limit: 20,
  })
  
  const [reviewProduct, setReviewProduct] = useState<Product | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<number | null>(null)

  const { data, isLoading, error } = useProducts(query)
  const reviewMutation = useReviewProduct()
  const listMutation = useListProduct()
  const unlistMutation = useUnlistProduct()
  const deleteMutation = useDeleteProduct()

  // 获取字典数据
  const formulations = useDictionaryOptions('formulation')

  const handleFilterChange = (newQuery: Partial<ProductQuery>) => {
    setQuery(prev => ({ ...prev, ...newQuery }))
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

  const handleToggleListing = async (productId: number, isListed: boolean) => {
    if (isListed) {
      await listMutation.mutateAsync(productId)
    } else {
      await unlistMutation.mutateAsync(productId)
    }
  }

  const handleDeleteClick = (productId: number) => {
    setProductToDelete(productId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (productToDelete) {
      await deleteMutation.mutateAsync(productToDelete)
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    }
  }

  // 计算统计数据
  const totalProducts = data?.meta?.totalItems || 0
  const activeProducts = data?.data.filter(product => product.status === 'ACTIVE').length || 0
  const pendingProducts = data?.data.filter(product => product.status === 'PENDING_REVIEW').length || 0
  const listedProducts = data?.data.filter(product => product.isListed).length || 0

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">产品管理</h1>
          <p className="text-muted-foreground">管理平台上的产品信息</p>
        </div>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <p className="text-sm text-destructive">
              加载产品数据失败: {(error as any).message}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">产品管理</h1>
          <p className="text-muted-foreground">管理平台上的产品信息</p>
        </div>
        <div className="flex items-center gap-2">
          {totalProducts > 0 && (
            <Badge variant="secondary" className="text-base px-3 py-1">
              <Package className="h-4 w-4 mr-1" />
              {totalProducts} 个产品
            </Badge>
          )}
          <Button asChild>
            <Link href="/content/products/new">
              <Plus className="h-4 w-4 mr-2" />
              新建产品
            </Link>
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总产品数</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalProducts}
            </div>
            <p className="text-xs text-muted-foreground">
              平台上的产品总数
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已通过</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activeProducts}
            </div>
            <p className="text-xs text-muted-foreground">
              审核通过的产品
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待审核</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {pendingProducts}
            </div>
            <p className="text-xs text-muted-foreground">
              等待审核的产品
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已上架</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {listedProducts}
            </div>
            <p className="text-xs text-muted-foreground">
              正在销售的产品
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 筛选器 */}
      <ProductFilters
        onSearch={handleFilterChange}
        showStatusFilter={true}
        showFormulationFilter={true}
        showToxicityFilter={true}
        showCountryFilter={true}
        showSupplierFilter={true}
        showListingFilter={true}
      />

      {/* 产品列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                产品列表
              </CardTitle>
              <CardDescription>
                {data && data.meta && `共 ${data.meta.totalItems} 个产品，当前显示第 ${data.meta.currentPage} 页`}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/content/products/pending">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  待审核产品
                  {pendingProducts > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {pendingProducts}
                    </Badge>
                  )}
                </Link>
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
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">暂无产品</h3>
              <p className="text-muted-foreground mb-4">
                当前筛选条件下没有找到产品
              </p>
              <Button asChild>
                <Link href="/content/products/new">
                  <Plus className="h-4 w-4 mr-2" />
                  创建第一个产品
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <ProductListTable
                products={data?.data || []}
                loading={isLoading}
                showReviewActions={true}
                showListingToggle={true}
                showDeleteAction={true}
                onReview={handleReview}
                onToggleListing={handleToggleListing}
                onDelete={handleDeleteClick}
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

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除产品</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将永久删除该产品信息，包括相关的防治方法数据。
              该操作无法撤销，请确认是否继续。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}