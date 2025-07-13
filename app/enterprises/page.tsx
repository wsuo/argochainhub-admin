'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  ChevronRight,
  RotateCcw,
  Plus
} from 'lucide-react'
import { useCompanies, useToggleCompanyStatus } from '@/hooks/use-api'
import { DataPagination } from '@/components/data-pagination'
import type { Company, CompanyQuery } from '@/lib/types'

export default function EnterprisesPage() {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  
  const [query, setQuery] = useState<CompanyQuery>({
    page: 1,
    limit: 20,
    status: undefined,
    type: undefined,
  })

  const { data, isLoading, error } = useCompanies(query)
  const toggleStatusMutation = useToggleCompanyStatus()

  const handleSearch = () => {
    setQuery(prev => ({ 
      ...prev, 
      search: searchInput.trim() || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter as Company['status'],
      type: typeFilter === 'all' ? undefined : typeFilter as Company['type'],
      page: 1 
    }))
  }

  const handleReset = () => {
    setSearchInput('')
    setStatusFilter('all')
    setTypeFilter('all')
    setQuery({
      page: 1,
      limit: 20,
      status: undefined,
      type: undefined,
    })
  }

  const handlePageChange = (page: number) => {
    setQuery(prev => ({ ...prev, page }))
  }

  const handleToggleStatus = async (companyId: number, currentStatus: Company['status']) => {
    // 检查是否可以切换状态
    if (currentStatus === 'pending_review') {
      alert('待审核状态的企业不能直接切换状态，请先审核通过。')
      return
    }

    try {
      await toggleStatusMutation.mutateAsync(companyId)
    } catch (error: any) {
      console.error('Toggle status failed:', error)
      
      // 根据错误信息显示不同的提示
      const errorMessage = error?.response?.data?.message || error?.message || '操作失败'
      
      if (errorMessage.includes('Cannot toggle status')) {
        alert('无法切换该企业状态，可能原因：企业正在审核中、有活跃订单或存在其他业务依赖关系。')
      } else {
        alert(`操作失败：${errorMessage}`)
      }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">企业管理</h1>
          <p className="text-muted-foreground">管理平台上的所有企业信息</p>
        </div>
        <Button onClick={() => router.push('/enterprises/new')}>
          <Plus className="h-4 w-4 mr-2" />
          新增企业
        </Button>
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
          <div className="flex items-end justify-between gap-4">
            {/* 左侧搜索条件 */}
            <div className="flex items-end gap-4">
              {/* 搜索 */}
              <div className="w-[300px]">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索企业名称..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-8"
                  />
                </div>
              </div>

              {/* 状态筛选 */}
              <div className="min-w-[150px]">
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
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
                  value={typeFilter}
                  onValueChange={setTypeFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有类型</SelectItem>
                    <SelectItem value="supplier">供应商</SelectItem>
                    <SelectItem value="buyer">采购商</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 右侧操作按钮 */}
            <div className="flex gap-2">
              <Button onClick={handleSearch} className="min-w-[80px]">
                <Search className="h-4 w-4 mr-2" />
                搜索
              </Button>
              <Button variant="outline" onClick={handleReset} className="min-w-[80px]">
                <RotateCcw className="h-4 w-4 mr-2" />
                重置
              </Button>
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
                          <div className="font-semibold">{company.name['zh-CN'] || company.name.zh}</div>
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
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push(`/enterprises/${company.id}`)}
                            title="查看详情"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(company.id, company.status)}
                            disabled={toggleStatusMutation.isPending || company.status === 'pending_review'}
                            title={company.status === 'pending_review' ? '待审核企业不能切换状态' : company.status === 'active' ? '点击禁用' : '点击启用'}
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
              {data && (
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
