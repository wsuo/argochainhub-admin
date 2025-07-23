'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Building2, AlertTriangle } from 'lucide-react'
import { usePendingCompanies, useReviewCompany } from '@/hooks/use-api'
import { DataPagination } from '@/components/data-pagination'
import { EnterpriseListTable } from '@/components/enterprise/enterprise-list-table'
import { EnterpriseFilters } from '@/components/enterprise/enterprise-filters'
import { ReviewDialog } from '@/components/enterprise/review-dialog'
import type { Company, CompanyQuery } from '@/lib/types'

export default function PendingEnterprisesPage() {
  const [query, setQuery] = useState<Omit<CompanyQuery, 'status'>>({
    page: 1,
    limit: 20,
  })
  
  const [reviewCompany, setReviewCompany] = useState<Company | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)

  const { data, isLoading, error } = usePendingCompanies(query)
  const reviewMutation = useReviewCompany()

  const handleFilterChange = (newQuery: Partial<CompanyQuery>) => {
    // 移除status参数，因为待审核页面固定只显示待审核的企业
    const { status, ...filteredQuery } = newQuery
    setQuery(prev => ({ ...prev, ...filteredQuery }))
  }

  const handlePageChange = (page: number) => {
    setQuery(prev => ({ ...prev, page }))
  }

  const handleReview = (company: Company, approved: boolean) => {
    setReviewCompany(company)
    setReviewDialogOpen(true)
  }

  const handleReviewConfirm = async (approved: boolean, reason: string) => {
    if (!reviewCompany) return

    await reviewMutation.mutateAsync({
      id: reviewCompany.id,
      data: { approved, reason }
    })
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">待审核企业</h1>
          <p className="text-muted-foreground">审核新注册的企业申请</p>
        </div>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <p className="text-sm text-destructive">
              加载待审核企业数据失败: {(error as any).message}
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
          <h1 className="text-3xl font-bold tracking-tight">待审核企业</h1>
          <p className="text-muted-foreground">审核新注册的企业申请</p>
        </div>
        {data && data.meta?.totalItems && data.meta.totalItems > 0 && (
          <Badge variant="destructive" className="text-base px-3 py-1">
            <Clock className="h-4 w-4 mr-1" />
            {data.meta.totalItems} 家待审核
          </Badge>
        )}
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待审核企业</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {data?.meta?.totalItems || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              需要审核的企业数量
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日新增</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data?.data.filter(company => {
                const today = new Date()
                const createdAt = new Date(company.createdAt)
                return createdAt.toDateString() === today.toDateString()
              }).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              今日提交的申请
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均处理时间</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              2.5天
            </div>
            <p className="text-xs text-muted-foreground">
              历史平均审核时长
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 筛选器 */}
      <EnterpriseFilters
        onSearch={handleFilterChange}
        showStatusFilter={false} // 待审核页面不显示状态筛选
        showTypeFilter={true}
        showCountryFilter={true}
        showCompanySizeFilter={true}
        showBusinessCategoryFilter={true}
      />

      {/* 企业列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            待审核企业列表
          </CardTitle>
          <CardDescription>
            {data && data.meta && `共 ${data.meta.totalItems} 家待审核企业，当前显示第 ${data.meta.currentPage} 页`}
          </CardDescription>
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
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">暂无待审核企业</h3>
              <p className="text-muted-foreground">
                当前没有需要审核的企业申请
              </p>
            </div>
          ) : (
            <>
              <EnterpriseListTable
                companies={data?.data || []}
                loading={isLoading}
                showReviewActions={true}
                showStatusToggle={false}
                onReview={handleReview}
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
      <ReviewDialog
        company={reviewCompany}
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        onConfirm={handleReviewConfirm}
        loading={reviewMutation.isPending}
      />
    </div>
  )
}