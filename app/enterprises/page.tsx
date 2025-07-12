'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Building2, 
  Search, 
  Filter, 
  Eye, 
  ToggleLeft, 
  ToggleRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useCompanies, useToggleCompanyStatus } from '@/hooks/use-api'
import type { Company, CompanyQuery } from '@/lib/types'

export default function EnterprisesPage() {
  const [query, setQuery] = useState<CompanyQuery>({
    page: 1,
    limit: 20,
    search: '',
    status: undefined,
    type: undefined,
  })

  const { data, isLoading, error } = useCompanies(query)
  const toggleStatusMutation = useToggleCompanyStatus()

  const handleSearch = (search: string) => {
    setQuery(prev => ({ ...prev, search, page: 1 }))
  }

  const handleStatusFilter = (status: string) => {
    setQuery(prev => ({ 
      ...prev, 
      status: status === 'all' ? undefined : status as Company['status'],
      page: 1 
    }))
  }

  const handleTypeFilter = (type: string) => {
    setQuery(prev => ({ 
      ...prev, 
      type: type === 'all' ? undefined : type as Company['type'],
      page: 1 
    }))
  }

  const handlePageChange = (page: number) => {
    setQuery(prev => ({ ...prev, page }))
  }

  const handleToggleStatus = async (companyId: number) => {
    try {
      await toggleStatusMutation.mutateAsync(companyId)
    } catch (error) {
      console.error('Toggle status failed:', error)
    }
  }

  const getStatusBadge = (status: Company['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="secondary">已激活</Badge>
      case 'pending_review':
        return <Badge variant="destructive">待审核</Badge>
      case 'disabled':
        return <Badge variant="outline">已禁用</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getTypeBadge = (type: Company['type']) => {
    switch (type) {
      case 'supplier':
        return <Badge variant="default">供应商</Badge>
      case 'buyer':
        return <Badge variant="secondary">采购商</Badge>
      case 'manufacturer':
        return <Badge variant="outline">制造商</Badge>
      case 'distributor':
        return <Badge variant="outline">分销商</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">企业管理</h1>
          <p className="text-muted-foreground">管理平台上的所有企业信息</p>
        </div>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            加载企业数据失败: {(error as any).message}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">企业管理</h1>
        <p className="text-muted-foreground">管理平台上的所有企业信息</p>
      </div>

      {/* 筛选器 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            筛选条件
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            {/* 搜索 */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索企业名称..."
                  value={query.search || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* 状态筛选 */}
            <div className="min-w-[150px]">
              <Select
                value={query.status || 'all'}
                onValueChange={handleStatusFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有状态</SelectItem>
                  <SelectItem value="active">已激活</SelectItem>
                  <SelectItem value="pending_review">待审核</SelectItem>
                  <SelectItem value="disabled">已禁用</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 类型筛选 */}
            <div className="min-w-[150px]">
              <Select
                value={query.type || 'all'}
                onValueChange={handleTypeFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有类型</SelectItem>
                  <SelectItem value="supplier">供应商</SelectItem>
                  <SelectItem value="buyer">采购商</SelectItem>
                  <SelectItem value="manufacturer">制造商</SelectItem>
                  <SelectItem value="distributor">分销商</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 企业列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            企业列表
          </CardTitle>
          <CardDescription>
            {data && `共 ${data.meta.totalItems} 家企业，当前显示第 ${data.meta.currentPage} 页`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>企业名称</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>用户数</TableHead>
                    <TableHead>注册时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{company.name.zh}</div>
                          {company.name.en && (
                            <div className="text-sm text-muted-foreground">
                              {company.name.en}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(company.type)}</TableCell>
                      <TableCell>{getStatusBadge(company.status)}</TableCell>
                      <TableCell>{company.users?.length || 0}</TableCell>
                      <TableCell>
                        {new Date(company.createdAt).toLocaleDateString('zh-CN')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(company.id)}
                            disabled={toggleStatusMutation.isPending}
                          >
                            {company.status === 'active' ? (
                              <ToggleRight className="h-4 w-4" />
                            ) : (
                              <ToggleLeft className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* 分页 */}
              {data && data.meta.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-muted-foreground">
                    显示 {(data.meta.currentPage - 1) * data.meta.itemsPerPage + 1} - {Math.min(data.meta.currentPage * data.meta.itemsPerPage, data.meta.totalItems)} 条，共 {data.meta.totalItems} 条
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(data.meta.currentPage - 1)}
                      disabled={data.meta.currentPage <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      上一页
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, data.meta.totalPages) }, (_, i) => {
                        const pageNum = data.meta.currentPage - 2 + i
                        if (pageNum < 1 || pageNum > data.meta.totalPages) return null
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === data.meta.currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(data.meta.currentPage + 1)}
                      disabled={data.meta.currentPage >= data.meta.totalPages}
                    >
                      下一页
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
