'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, Plus, Beaker, TrendingUp, Eye, EyeOff, Upload } from 'lucide-react'
import { usePesticides, useDeletePesticide } from '@/hooks/use-api'
import { DataPagination } from '@/components/data-pagination'
import { PesticideListTable } from '@/components/pesticide/pesticide-list-table'
import { PesticideFilters } from '@/components/pesticide/pesticide-filters'
import { ImageUploadDialog } from '@/components/pesticide/image-upload-dialog'
import { ErrorDisplay } from '@/components/ui/error-display'
import { LoadingState, StatCardSkeleton } from '@/components/ui/loading-state'
import { ErrorBoundary } from '@/components/error-boundary'
import type { PesticideQuery } from '@/lib/types'
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

export default function PesticidesPage() {
  const [query, setQuery] = useState<PesticideQuery>({
    page: 1,
    limit: 20,
  })
  
  // 筛选状态
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [formulationFilter, setFormulationFilter] = useState('')
  const [visibilityFilter, setVisibilityFilter] = useState('all')
  const [searchInput, setSearchInput] = useState('')
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pesticideToDelete, setPesticideToDelete] = useState<number | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)

  const { data, isLoading, error } = usePesticides(query)
  const deleteMutation = useDeletePesticide()

  const handleFilterChange = useCallback((newQuery: Partial<PesticideQuery>) => {
    setQuery(prev => ({ ...prev, ...newQuery, page: 1 }))
  }, [])

  const handlePageChange = (page: number) => {
    setQuery(prev => ({ ...prev, page }))
  }

  const handleDeleteClick = (pesticideId: number) => {
    setPesticideToDelete(pesticideId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (pesticideToDelete) {
      await deleteMutation.mutateAsync(pesticideToDelete)
      setDeleteDialogOpen(false)
      setPesticideToDelete(null)
    }
  }

  // 计算统计数据
  const totalPesticides = data?.meta?.totalItems || 0
  const currentPageVisiblePesticides = data?.data.filter(pesticide => pesticide.isVisible).length || 0
  const currentPageHiddenPesticides = data?.data.filter(pesticide => !pesticide.isVisible).length || 0
  const currentPageCategoriesCount = data?.data ? new Set(data.data.map(p => p.category)).size : 0

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">农药价格管理</h1>
          <p className="text-muted-foreground">管理标准农药信息和价格走势</p>
        </div>
        <ErrorDisplay 
          error={error}
          title="加载农药数据失败"
          showRetry={true}
          onRetry={() => window.location.reload()}
          showReportBug={true}
        />
      </div>
    )
  }

  const isInitialLoading = isLoading && !data

  if (isInitialLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">农药价格管理</h1>
          <p className="text-muted-foreground">管理标准农药信息和价格走势</p>
        </div>
        
        <StatCardSkeleton />
        
        <Card>
          <CardHeader>
            <div className="h-6 w-24 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="h-10 w-[300px] bg-muted animate-pulse rounded" />
                <div className="h-10 w-[200px] bg-muted animate-pulse rounded" />
                <div className="h-10 w-[80px] bg-muted animate-pulse rounded" />
                <div className="h-10 w-[80px] bg-muted animate-pulse rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
            <div className="h-4 w-48 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <LoadingState
              type="table"
              message="加载农药列表..."
              description="正在获取农药数据"
              icon="package"
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">农药价格管理</h1>
          <p className="text-muted-foreground">管理标准农药信息和价格走势</p>
        </div>
        <div className="flex items-center gap-2">
          {totalPesticides > 0 && (
            <Badge variant="secondary" className="text-base px-3 py-1">
              <Beaker className="h-4 w-4 mr-1" />
              {totalPesticides} 种农药
            </Badge>
          )}
          <Button asChild>
            <Link href="/content/pesticides/new">
              <Plus className="h-4 w-4 mr-2" />
              新建农药
            </Link>
          </Button>
          <Button 
            variant="outline"
            onClick={() => setUploadDialogOpen(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            图片解析价格
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总农药数</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalPesticides}
            </div>
            <p className="text-xs text-muted-foreground">
              系统中的农药总数
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">可见农药（当前页）</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {currentPageVisiblePesticides}
            </div>
            <p className="text-xs text-muted-foreground">
              当前页可见的农药
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">隐藏农药（当前页）</CardTitle>
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {currentPageHiddenPesticides}
            </div>
            <p className="text-xs text-muted-foreground">
              当前页隐藏的农药
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">产品类别（当前页）</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {currentPageCategoriesCount}
            </div>
            <p className="text-xs text-muted-foreground">
              当前页不同的产品类别
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 筛选器 */}
      <PesticideFilters
        onSearch={handleFilterChange}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        formulationFilter={formulationFilter}
        setFormulationFilter={setFormulationFilter}
        visibilityFilter={visibilityFilter}
        setVisibilityFilter={setVisibilityFilter}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
      />

      {/* 农药列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Beaker className="h-4 w-4" />
                农药列表
              </CardTitle>
              <CardDescription>
                {data && data.meta && `共 ${data.meta.totalItems} 种农药，当前显示第 ${data.meta.currentPage} 页（共 ${data.meta.totalPages} 页）`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState
              type="table"
              message="加载农药数据..."
              description="正在获取最新的农药信息"
              icon="package"
            />
          ) : data?.data.length === 0 ? (
            <div className="text-center py-12">
              <Beaker className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
              <h3 className="text-xl font-semibold mb-2">
                {query.search || Object.keys(query).length > 2 ? '未找到匹配的农药' : '暂无农药'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {query.search || Object.keys(query).length > 2 
                  ? '尝试调整筛选条件或搜索关键词来查找农药' 
                  : '还没有添加任何农药，点击下方按钮开始添加第一种农药'
                }
              </p>
              <div className="flex gap-3 justify-center">
                {(query.search || Object.keys(query).length > 2) ? (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setCategoryFilter('all')
                      setFormulationFilter('')
                      setVisibilityFilter('all')
                      setSearchInput('')
                      setQuery({ page: 1, limit: 20 })
                    }}
                  >
                    清除筛选条件
                  </Button>
                ) : null}
                <Button asChild>
                  <Link href="/content/pesticides/new">
                    <Plus className="h-4 w-4 mr-2" />
                    {query.search || Object.keys(query).length > 2 ? '新建农药' : '创建第一种农药'}
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <ErrorBoundary>
                <PesticideListTable
                  pesticides={data?.data || []}
                  loading={isLoading}
                  onDelete={handleDeleteClick}
                />
              </ErrorBoundary>

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

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除农药</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将永久删除该农药信息，包括相关的价格走势数据。
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

      {/* 图片上传解析对话框 */}
      <ImageUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
      />
    </div>
  )
}