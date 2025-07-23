'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Search, 
  Filter, 
  RotateCcw
} from 'lucide-react'
import type { Company, CompanyQuery } from '@/lib/types'
import { SimpleCountrySelect } from '@/components/enhanced-country-select'
import { CompanySizeSelect, CompanyStatusSelect } from '@/components/dictionary-components'
import { useDictionaryOptions } from '@/lib/dictionary-utils'

export interface EnterpriseFiltersProps {
  onSearch: (query: Partial<CompanyQuery>) => void
  showStatusFilter?: boolean
  showTypeFilter?: boolean
  showCountryFilter?: boolean
  showCompanySizeFilter?: boolean
  showBusinessCategoryFilter?: boolean
  defaultStatus?: Company['status']
  className?: string
}

export function EnterpriseFilters({
  onSearch,
  showStatusFilter = true,
  showTypeFilter = true,
  showCountryFilter = true,
  showCompanySizeFilter = true,
  showBusinessCategoryFilter = true,
  defaultStatus,
  className
}: EnterpriseFiltersProps) {
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>(defaultStatus || 'all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [countryFilter, setCountryFilter] = useState<string>('all')
  const [companySizeFilter, setCompanySizeFilter] = useState<string>('all')
  const [businessCategoryFilter, setBusinessCategoryFilter] = useState<string>('all')

  // 获取字典选项
  const businessTypeOptions = useDictionaryOptions('business_type')

  const handleSearch = () => {
    const query: Partial<CompanyQuery> = {
      search: searchInput.trim() || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter as Company['status'],
      type: typeFilter === 'all' ? undefined : typeFilter as Company['type'],
      country: countryFilter === 'all' ? undefined : countryFilter,
      companySize: companySizeFilter === 'all' ? undefined : companySizeFilter,
      businessCategory: businessCategoryFilter === 'all' ? undefined : businessCategoryFilter,
      page: 1 // 重置到第一页
    }
    onSearch(query)
  }

  const handleReset = () => {
    setSearchInput('')
    setStatusFilter(defaultStatus || 'all')
    setTypeFilter('all')
    setCountryFilter('all')
    setCompanySizeFilter('all')
    setBusinessCategoryFilter('all')
    
    const query: Partial<CompanyQuery> = {
      page: 1,
      status: defaultStatus ? defaultStatus : undefined,
      type: undefined,
      country: undefined,
      companySize: undefined,
      businessCategory: undefined,
    }
    onSearch(query)
  }

  const handleFilterChange = (filterType: string, value: string) => {
    // 立即搜索的筛选器
    const query: Partial<CompanyQuery> = {
      search: searchInput.trim() || undefined,
      status: filterType === 'status' ? (value === 'all' ? undefined : value as Company['status']) : (statusFilter === 'all' ? undefined : statusFilter as Company['status']),
      type: filterType === 'type' ? (value === 'all' ? undefined : value as Company['type']) : (typeFilter === 'all' ? undefined : typeFilter as Company['type']),
      country: filterType === 'country' ? (value === 'all' ? undefined : value) : (countryFilter === 'all' ? undefined : countryFilter),
      companySize: filterType === 'companySize' ? (value === 'all' ? undefined : value) : (companySizeFilter === 'all' ? undefined : companySizeFilter),
      businessCategory: filterType === 'businessCategory' ? (value === 'all' ? undefined : value) : (businessCategoryFilter === 'all' ? undefined : businessCategoryFilter),
      page: 1
    }
    onSearch(query)
  }

  const hasActiveFilters = () => {
    return (statusFilter !== (defaultStatus || 'all')) || 
           typeFilter !== 'all' || 
           countryFilter !== 'all' || 
           companySizeFilter !== 'all' || 
           businessCategoryFilter !== 'all' || 
           searchInput.trim() !== ''
  }

  return (
    <Card className={className}>
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
            {showStatusFilter && (
              <div>
                <CompanyStatusSelect
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value)
                    handleFilterChange('status', value)
                  }}
                  includeAll={true}
                  placeholder="所有状态"
                />
              </div>
            )}

            {/* 类型筛选 */}
            {showTypeFilter && (
              <div>
                <Select
                  value={typeFilter}
                  onValueChange={(value) => {
                    setTypeFilter(value)
                    handleFilterChange('type', value)
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
            )}

            {/* 国家筛选 */}
            {showCountryFilter && (
              <div>
                <SimpleCountrySelect
                  value={countryFilter}
                  onValueChange={(value) => {
                    setCountryFilter(value)
                    handleFilterChange('country', value)
                  }}
                  includeAll={true}
                  allLabel="所有国家"
                  placeholder="所有国家"
                />
              </div>
            )}

            {/* 公司规模筛选 */}
            {showCompanySizeFilter && (
              <div>
                <CompanySizeSelect
                  value={companySizeFilter}
                  onValueChange={(value) => {
                    setCompanySizeFilter(value)
                    handleFilterChange('companySize', value)
                  }}
                  includeAll={true}
                  placeholder="所有规模"
                />
              </div>
            )}

            {/* 业务类别筛选 */}
            {showBusinessCategoryFilter && (
              <div>
                <Select
                  value={businessCategoryFilter}
                  onValueChange={(value) => {
                    setBusinessCategoryFilter(value)
                    handleFilterChange('businessCategory', value)
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
            )}
          </div>

          {/* 筛选结果提示 */}
          {hasActiveFilters() && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>已应用筛选条件</span>
              <div className="flex gap-1">
                {searchInput && <Badge variant="outline">关键词: {searchInput}</Badge>}
                {statusFilter !== (defaultStatus || 'all') && <Badge variant="outline">状态</Badge>}
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
  )
}