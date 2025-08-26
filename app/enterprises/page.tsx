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
  Plus,
  Globe,
  Users
} from 'lucide-react'
import { useCompanies, useToggleCompanyStatus } from '@/hooks/use-api'
import { DataPagination } from '@/components/data-pagination'
import type { Company, CompanyQuery } from '@/lib/types'
import { SimpleCountrySelect, CountryDisplay } from '@/components/enhanced-country-select'
import { CompanySizeSelect, CompanyStatusSelect, BusinessTypeSelect } from '@/components/dictionary-components'
import { useDictionaryOptions } from '@/lib/dictionary-utils'
import { toast } from 'sonner'

export default function EnterprisesPage() {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [countryFilter, setCountryFilter] = useState<string>('all')
  const [companySizeFilter, setCompanySizeFilter] = useState<string>('all')
  const [businessCategoryFilter, setBusinessCategoryFilter] = useState<string>('all')
  
  const [query, setQuery] = useState<CompanyQuery>({
    page: 1,
    limit: 20,
    status: undefined,
    type: undefined,
  })

  const { data, isLoading, error } = useCompanies(query)
  const toggleStatusMutation = useToggleCompanyStatus()

  // 获取字典选项
  const companyStatusOptions = useDictionaryOptions('company_status')
  const companySizeOptions = useDictionaryOptions('company_size')
  const businessTypeOptions = useDictionaryOptions('business_type')

  const handleSearch = () => {
    setQuery(prev => ({ 
      ...prev, 
      search: searchInput.trim() || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter as Company['status'],
      type: typeFilter === 'all' ? undefined : typeFilter as Company['type'],
      country: countryFilter === 'all' ? undefined : countryFilter,
      companySize: companySizeFilter === 'all' ? undefined : companySizeFilter,
      businessCategory: businessCategoryFilter === 'all' ? undefined : businessCategoryFilter,
      page: 1 
    }))
  }

  const handleReset = () => {
    setSearchInput('')
    setStatusFilter('all')
    setTypeFilter('all')
    setCountryFilter('all')
    setCompanySizeFilter('all')
    setBusinessCategoryFilter('all')
    setQuery({
      page: 1,
      limit: 20,
      status: undefined,
      type: undefined,
      country: undefined,
      companySize: undefined,
      businessCategory: undefined,
    })
  }

  const handlePageChange = (page: number) => {
    setQuery(prev => ({ ...prev, page }))
  }

  const handleToggleStatus = async (companyId: number, currentStatus: Company['status']) => {
    // 检查是否可以切换状态
    if (currentStatus === 'pending_review') {
      toast.error(
        "操作限制",
        {
          description: "待审核状态的企业不能直接切换状态，请先审核通过。",
        }
      )
      return
    }

    try {
      await toggleStatusMutation.mutateAsync(companyId)
    } catch (error: any) {
      // 不再手动处理错误，让API拦截器和React Query的onError处理
      // 这里的catch主要是为了阻止错误继续传播
      console.error('Toggle status failed:', error)
    }
  }

  const getStatusBadge = (status: Company['status']) => {
    const option = companyStatusOptions.find(opt => opt.value === status)
    if (option) {
      return <Badge variant="secondary">{option.label}</Badge>
    }
    
    // 兜底处理
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

  const getCompanySizeBadge = (size?: string) => {
    if (!size) return null
    
    const option = companySizeOptions.find(opt => opt.value === size)
    return option ? (
      <Badge variant="outline" className="text-xs">
        {option.label}
      </Badge>
    ) : null
  }

  const formatAnnualValue = (value?: number | string) => {
    if (!value || value === 0) return null
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(numValue) || numValue === 0) return null
    
    if (numValue >= 1000000) {
      return `$${(numValue / 1000000).toFixed(1)}M`
    } else if (numValue >= 1000) {
      return `$${(numValue / 1000).toFixed(1)}K`
    } else {
      return `$${numValue.toFixed(0)}`
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
          <div className="space-y-4">
            {/* 第一行：搜索框 */}
            <div className="flex items-end justify-between gap-4">
              <div className="flex items-end gap-4 flex-1">
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
              </div>

              {/* 操作按钮 */}
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

            {/* 第二行：筛选下拉框 */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* 状态筛选 */}
              <div>
                <CompanyStatusSelect
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value)
                    // 立即搜索
                    setQuery(prev => ({ 
                      ...prev, 
                      status: value === 'all' ? undefined : value as Company['status'],
                      page: 1 
                    }))
                  }}
                  includeAll={true}
                  placeholder="所有状态"
                />
              </div>

              {/* 类型筛选 */}
              <div>
                <Select
                  value={typeFilter}
                  onValueChange={(value) => {
                    setTypeFilter(value)
                    // 立即搜索
                    setQuery(prev => ({ 
                      ...prev, 
                      type: value === 'all' ? undefined : value as Company['type'],
                      page: 1 
                    }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="所有类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有类型</SelectItem>
                    <SelectItem value="supplier">供应商</SelectItem>
                    <SelectItem value="buyer">采购商</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 国家筛选 */}
              <div>
                <SimpleCountrySelect
                  value={countryFilter}
                  onValueChange={(value) => {
                    setCountryFilter(value)
                    // 立即搜索
                    setQuery(prev => ({ 
                      ...prev, 
                      country: value === 'all' ? undefined : value,
                      page: 1 
                    }))
                  }}
                  includeAll={true}
                  allLabel="所有国家"
                  placeholder="所有国家"
                />
              </div>

              {/* 公司规模筛选 */}
              <div>
                <CompanySizeSelect
                  value={companySizeFilter}
                  onValueChange={(value) => {
                    setCompanySizeFilter(value)
                    // 立即搜索
                    setQuery(prev => ({ 
                      ...prev, 
                      companySize: value === 'all' ? undefined : value,
                      page: 1 
                    }))
                  }}
                  includeAll={true}
                  placeholder="所有规模"
                />
              </div>

              {/* 业务类别筛选 */}
              <div>
                <Select
                  value={businessCategoryFilter}
                  onValueChange={(value) => {
                    setBusinessCategoryFilter(value)
                    // 立即搜索
                    setQuery(prev => ({ 
                      ...prev, 
                      businessCategory: value === 'all' ? undefined : value,
                      page: 1 
                    }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="所有业务" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有业务</SelectItem>
                    {businessTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 筛选结果提示 */}
            {(statusFilter !== 'all' || typeFilter !== 'all' || countryFilter !== 'all' || 
              companySizeFilter !== 'all' || businessCategoryFilter !== 'all' || searchInput) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span>已应用筛选条件</span>
                <div className="flex gap-1">
                  {searchInput && <Badge variant="outline">关键词: {searchInput}</Badge>}
                  {statusFilter !== 'all' && <Badge variant="outline">状态</Badge>}
                  {typeFilter !== 'all' && <Badge variant="outline">类型</Badge>}
                  {countryFilter !== 'all' && <Badge variant="outline">国家</Badge>}
                  {companySizeFilter !== 'all' && <Badge variant="outline">规模</Badge>}
                  {businessCategoryFilter !== 'all' && <Badge variant="outline">业务</Badge>}
                </div>
              </div>
            )}
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
                    <TableHead>
                      <div className="flex items-center gap-1">
                        <Globe className="h-4 w-4" />
                        国家
                      </div>
                    </TableHead>
                    <TableHead>规模</TableHead>
                    <TableHead>年交易额</TableHead>
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
                      <TableCell>
                        {company.country ? (
                          <CountryDisplay value={company.country} showFlag={true} />
                        ) : (
                          <span className="text-muted-foreground text-sm">未设置</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getCompanySizeBadge(company.companySize) || (
                          <span className="text-muted-foreground text-sm">未设置</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {formatAnnualValue(company.annualImportExportValue) || (
                          <span className="text-muted-foreground text-sm">未设置</span>
                        )}
                      </TableCell>
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
                            onClick={() => router.push(`/enterprises/${company.id}/users`)}
                            title="管理员工"
                          >
                            <Users className="h-4 w-4" />
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
