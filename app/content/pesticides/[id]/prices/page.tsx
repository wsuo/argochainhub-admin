'use client'

import { use, useState } from 'react'
import { notFound, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, TrendingUp, Beaker } from 'lucide-react'
import { usePesticide, usePriceTrends, useDeletePriceTrend } from '@/hooks/use-api'
import { DataPagination } from '@/components/data-pagination'
import { PriceTrendTable } from '@/components/pesticide/price-trend-table'
import { PriceTrendChart } from '@/components/pesticide/price-trend-chart'
import { PriceTrendDialog } from '@/components/pesticide/price-trend-dialog'
import { ErrorDisplay } from '@/components/ui/error-display'
import { LoadingState, StatCardSkeleton } from '@/components/ui/loading-state'
import { getMultiLangText } from '@/lib/multi-lang-utils'
import type { PriceTrendQuery } from '@/lib/types'
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

interface PriceTrendsPageProps {
  params: Promise<{ id: string }>
}

export default function PriceTrendsPage({ params }: PriceTrendsPageProps) {
  const { id } = use(params)
  const pesticideId = parseInt(id)
  const router = useRouter()
  
  const [query, setQuery] = useState<PriceTrendQuery>({
    page: 1,
    limit: 20,
    pesticideId: pesticideId,
    sortBy: 'weekEndDate',
    sortOrder: 'DESC'
  })
  
  const [priceDialogOpen, setPriceDialogOpen] = useState(false)
  const [editingPriceId, setEditingPriceId] = useState<number | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [priceToDelete, setPriceToDelete] = useState<number | null>(null)
  
  const { data: pesticide, isLoading: pesticideLoading, error: pesticideError } = usePesticide(pesticideId)
  const { data: priceTrends, isLoading: trendsLoading, error: trendsError } = usePriceTrends(query)
  const deleteMutation = useDeletePriceTrend()
  
  const handlePageChange = (page: number) => {
    setQuery(prev => ({ ...prev, page }))
  }
  
  const handleCreatePrice = () => {
    setEditingPriceId(null)
    setPriceDialogOpen(true)
  }
  
  const handleEditPrice = (priceId: number) => {
    setEditingPriceId(priceId)
    setPriceDialogOpen(true)
  }
  
  const handleDeleteClick = (priceId: number) => {
    setPriceToDelete(priceId)
    setDeleteDialogOpen(true)
  }
  
  const handleDeleteConfirm = async () => {
    if (priceToDelete) {
      await deleteMutation.mutateAsync(priceToDelete)
      setDeleteDialogOpen(false)
      setPriceToDelete(null)
    }
  }
  
  if (pesticideError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/content/pesticides">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">价格走势管理</h1>
        </div>
        <ErrorDisplay 
          error={pesticideError}
          title="加载农药数据失败"
          showRetry={true}
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }
  
  const isInitialLoading = pesticideLoading || (trendsLoading && !priceTrends)
  
  if (isInitialLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/content/pesticides">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">价格走势管理</h1>
        </div>
        
        <StatCardSkeleton />
        
        <Card>
          <CardHeader>
            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
            <div className="h-4 w-48 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <LoadingState
              type="table"
              message="加载价格走势..."
              description="正在获取价格数据"
              icon="loader"
            />
          </CardContent>
        </Card>
      </div>
    )
  }
  
  if (!pesticide) {
    notFound()
  }
  
  // 计算统计数据
  const totalRecords = priceTrends?.meta?.totalItems || 0
  const latestPrice = priceTrends?.data[0]?.unitPrice || 0
  const oldestPrice = priceTrends?.data[priceTrends.data.length - 1]?.unitPrice || 0
  const priceChange = latestPrice && oldestPrice ? ((latestPrice - oldestPrice) / oldestPrice * 100) : 0
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href={`/content/pesticides/${pesticideId}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <TrendingUp className="h-8 w-8" />
              价格走势管理
            </h1>
          </div>
          <p className="text-muted-foreground ml-12">
            {getMultiLangText(pesticide.productName, 'zh-CN')} ({pesticide.concentration})
          </p>
        </div>
        <Button onClick={handleCreatePrice}>
          <Plus className="h-4 w-4 mr-2" />
          新增价格
        </Button>
      </div>
      
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">价格记录数</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecords}</div>
            <p className="text-xs text-muted-foreground">
              历史价格记录总数
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">最新价格</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ¥{latestPrice.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              最近一期价格
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">价格变化</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${priceChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {priceChange > 0 ? '+' : ''}{priceChange.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              相对最早记录
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">农药信息</CardTitle>
            <Beaker className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {pesticide.concentration}
            </div>
            <p className="text-xs text-muted-foreground">
              {pesticide.category} - {pesticide.formulation}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* 价格走势图表 */}
      {totalRecords > 0 && (
        <PriceTrendChart pesticideId={pesticideId} />
      )}
      
      {/* 价格记录列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                价格记录列表
              </CardTitle>
              <CardDescription>
                {priceTrends && priceTrends.meta && `共 ${priceTrends.meta.totalItems} 条记录，当前显示第 ${priceTrends.meta.currentPage} 页`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {trendsLoading ? (
            <LoadingState
              type="table"
              message="加载价格记录..."
              description="正在获取价格数据"
              icon="loader"
            />
          ) : priceTrends?.data.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
              <h3 className="text-xl font-semibold mb-2">暂无价格记录</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                还没有添加任何价格记录，点击下方按钮开始添加
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={handleCreatePrice}>
                  <Plus className="h-4 w-4 mr-2" />
                  手动添加价格
                </Button>
              </div>
            </div>
          ) : (
            <>
              <PriceTrendTable
                priceTrends={priceTrends?.data || []}
                loading={trendsLoading}
                onEdit={handleEditPrice}
                onDelete={handleDeleteClick}
              />
              
              {/* 分页 */}
              {priceTrends && priceTrends.meta && (
                <DataPagination
                  currentPage={priceTrends.meta.currentPage}
                  totalPages={priceTrends.meta.totalPages}
                  totalItems={priceTrends.meta.totalItems}
                  itemsPerPage={priceTrends.meta.itemsPerPage}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* 价格新增/编辑对话框 */}
      <PriceTrendDialog
        open={priceDialogOpen}
        onOpenChange={setPriceDialogOpen}
        pesticideId={pesticideId}
        priceTrendId={editingPriceId}
      />
      
      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除价格记录</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将永久删除该价格记录，无法恢复。
              请确认是否继续？
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