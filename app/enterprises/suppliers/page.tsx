'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Truck, Building2, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { useCompanies, useToggleCompanyStatus } from '@/hooks/use-api'
import { DataPagination } from '@/components/data-pagination'
import { EnterpriseListTable } from '@/components/enterprise/enterprise-list-table'
import { EnterpriseFilters } from '@/components/enterprise/enterprise-filters'
import type { Company, CompanyQuery } from '@/lib/types'

export default function SuppliersPage() {
  const [query, setQuery] = useState<CompanyQuery>({
    type: 'supplier', // 固定为供应商类型
    page: 1,
    limit: 20,
  })

  const { data, isLoading, error } = useCompanies(query)
  const toggleStatusMutation = useToggleCompanyStatus()

  const handleFilterChange = (newQuery: Partial<CompanyQuery>) => {
    // 保持类型为supplier，其他筛选条件更新
    setQuery(prev => ({ ...prev, ...newQuery, type: 'supplier' }))
  }

  const handlePageChange = (page: number) => {
    setQuery(prev => ({ ...prev, page }))
  }

  const handleToggleStatus = (companyId: number, currentStatus: Company['status']) => {
    toggleStatusMutation.mutate(companyId)
  }

  // 计算统计数据
  const totalSuppliers = data?.meta?.totalItems || 0
  const activeSuppliers = data?.data.filter(company => company.status === 'active').length || 0
  const disabledSuppliers = data?.data.filter(company => company.status === 'disabled').length || 0
  const pendingSuppliers = data?.data.filter(company => company.status === 'pending_review').length || 0

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">供应企业</h1>
          <p className="text-muted-foreground">管理平台上的供应商企业</p>
        </div>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <p className="text-sm text-destructive">
              加载供应企业数据失败: {(error as any).message}
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
          <h1 className="text-3xl font-bold tracking-tight">供应企业</h1>
          <p className="text-muted-foreground">管理平台上的供应商企业</p>
        </div>
        {totalSuppliers > 0 && (
          <Badge variant="secondary" className="text-base px-3 py-1">
            <Truck className="h-4 w-4 mr-1" />
            {totalSuppliers} 家供应企业
          </Badge>
        )}
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总供应企业</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalSuppliers}
            </div>
            <p className="text-xs text-muted-foreground">
              平台上的供应企业总数
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃企业</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activeSuppliers}
            </div>
            <p className="text-xs text-muted-foreground">
              正常运营的供应企业
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已禁用</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {disabledSuppliers}
            </div>
            <p className="text-xs text-muted-foreground">
              已禁用的供应企业
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
              {pendingSuppliers}
            </div>
            <p className="text-xs text-muted-foreground">
              等待审核的供应企业
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 筛选器 */}
      <EnterpriseFilters
        onSearch={handleFilterChange}
        showStatusFilter={true}
        showTypeFilter={false} // 供应企业页面不显示类型筛选，因为已固定为supplier
        showCountryFilter={true}
        showCompanySizeFilter={true}
        showBusinessCategoryFilter={true}
        defaultStatus={undefined} // 默认显示所有状态
      />

      {/* 企业列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            供应企业列表
          </CardTitle>
          <CardDescription>
            {data && data.meta && `共 ${data.meta.totalItems} 家供应企业，当前显示第 ${data.meta.currentPage} 页`}
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
              <Truck className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">暂无供应企业</h3>
              <p className="text-muted-foreground">
                当前筛选条件下没有找到供应企业
              </p>
            </div>
          ) : (
            <>
              <EnterpriseListTable
                companies={data?.data || []}
                loading={isLoading}
                showReviewActions={false} // 不显示审核操作
                showStatusToggle={true} // 显示状态切换操作
                showUserManagement={true} // 显示员工管理操作
                onToggleStatus={handleToggleStatus}
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
    </div>
  )
}