'use client'

import { useState, useEffect, useCallback } from 'react'
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
  RotateCcw,
  Calendar
} from 'lucide-react'
import { format } from 'date-fns'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import type { Product, ProductQuery } from '@/lib/types'
import { SimpleCountrySelect } from '@/components/enhanced-country-select'
import type { DictionaryOption } from '@/lib/dictionary-utils'

export interface ProductFiltersProps {
  onSearch: (query: Partial<ProductQuery>) => void
  showStatusFilter?: boolean
  showFormulationFilter?: boolean
  showToxicityFilter?: boolean
  showCountryFilter?: boolean
  showSupplierFilter?: boolean
  showListingFilter?: boolean
  showDateFilters?: boolean
  defaultStatus?: Product['status']
  className?: string
  // 字典数据props，避免子组件重复调用API
  formulations?: DictionaryOption[]
  toxicities?: DictionaryOption[]
}

export function ProductFilters({
  onSearch,
  showStatusFilter = true,
  showFormulationFilter = true,
  showToxicityFilter = true,
  showCountryFilter = true,
  showSupplierFilter = true,
  showListingFilter = true,
  showDateFilters = false,
  defaultStatus,
  className,
  formulations = [],
  toxicities = []
}: ProductFiltersProps) {
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>(defaultStatus || 'all')
  const [formulationFilter, setFormulationFilter] = useState<string>('all')
  const [toxicityFilter, setToxicityFilter] = useState<string>('all')
  const [countryFilter, setCountryFilter] = useState<string>('all')
  const [supplierFilter, setSupplierFilter] = useState('')
  const [listingFilter, setListingFilter] = useState<string>('all')
  const [effectiveDateStart, setEffectiveDateStart] = useState<Date>()
  const [effectiveDateEnd, setEffectiveDateEnd] = useState<Date>()
  const [createdDateStart, setCreatedDateStart] = useState<Date>()
  const [createdDateEnd, setCreatedDateEnd] = useState<Date>()

  // 字典数据现在通过props传入，不再单独调用API

  const handleSearch = () => {
    const query: Partial<ProductQuery> = {
      search: searchInput.trim() || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter as Product['status'],
      formulation: formulationFilter === 'all' ? undefined : formulationFilter,
      toxicity: toxicityFilter === 'all' ? undefined : toxicityFilter as Product['toxicity'],
      country: countryFilter === 'all' ? undefined : countryFilter,
      supplierName: supplierFilter.trim() || undefined,
      isListed: listingFilter === 'all' ? undefined : listingFilter === 'listed',
      effectiveDateStart: effectiveDateStart ? format(effectiveDateStart, 'yyyy-MM-dd') : undefined,
      effectiveDateEnd: effectiveDateEnd ? format(effectiveDateEnd, 'yyyy-MM-dd') : undefined,
      createdStartDate: createdDateStart ? format(createdDateStart, 'yyyy-MM-dd') : undefined,
      createdEndDate: createdDateEnd ? format(createdDateEnd, 'yyyy-MM-dd') : undefined,
      page: 1 // 重置到第一页
    }
    onSearch(query)
  }

  const handleReset = () => {
    setSearchInput('')
    setStatusFilter(defaultStatus || 'all')
    setFormulationFilter('all')
    setToxicityFilter('all')
    setCountryFilter('all')
    setSupplierFilter('')
    setListingFilter('all')
    setEffectiveDateStart(undefined)
    setEffectiveDateEnd(undefined)
    setCreatedDateStart(undefined)
    setCreatedDateEnd(undefined)
    
    const query: Partial<ProductQuery> = {
      page: 1,
      status: defaultStatus ? defaultStatus : undefined,
    }
    onSearch(query)
  }

  // 创建稳定的筛选处理函数
  const handleFilterChange = useCallback((filterType: string, value: string) => {
    // 使用函数式状态更新，确保获取最新状态
    const updateFiltersAndSearch = () => {
      let newStatusFilter = statusFilter
      let newFormulationFilter = formulationFilter
      let newToxicityFilter = toxicityFilter
      let newCountryFilter = countryFilter
      let newListingFilter = listingFilter
      
      // 根据变化的类型更新对应的筛选条件
      switch (filterType) {
        case 'status':
          newStatusFilter = value
          setStatusFilter(value)
          break
        case 'formulation':
          newFormulationFilter = value
          setFormulationFilter(value)
          break
        case 'toxicity':
          newToxicityFilter = value
          setToxicityFilter(value)
          break
        case 'country':
          newCountryFilter = value
          setCountryFilter(value)
          break
        case 'listing':
          newListingFilter = value
          setListingFilter(value)
          break
      }
      
      // 使用最新的值构建查询对象
      const query: Partial<ProductQuery> = {
        search: searchInput.trim() || undefined,
        status: newStatusFilter === 'all' ? undefined : newStatusFilter as Product['status'],
        formulation: newFormulationFilter === 'all' ? undefined : newFormulationFilter,
        toxicity: newToxicityFilter === 'all' ? undefined : newToxicityFilter as Product['toxicity'],
        country: newCountryFilter === 'all' ? undefined : newCountryFilter,
        isListed: newListingFilter === 'all' ? undefined : newListingFilter === 'listed',
        supplierName: supplierFilter.trim() || undefined,
        effectiveDateStart: effectiveDateStart ? format(effectiveDateStart, 'yyyy-MM-dd') : undefined,
        effectiveDateEnd: effectiveDateEnd ? format(effectiveDateEnd, 'yyyy-MM-dd') : undefined,
        createdStartDate: createdDateStart ? format(createdDateStart, 'yyyy-MM-dd') : undefined,
        createdEndDate: createdDateEnd ? format(createdDateEnd, 'yyyy-MM-dd') : undefined,
        page: 1
      }
      
      onSearch(query)
    }

    // 立即执行更新
    updateFiltersAndSearch()
  }, [
    statusFilter,
    formulationFilter,
    toxicityFilter,
    countryFilter,
    listingFilter,
    searchInput,
    supplierFilter,
    effectiveDateStart,
    effectiveDateEnd,
    createdDateStart,
    createdDateEnd,
    onSearch
  ])

  const hasActiveFilters = () => {
    return (statusFilter !== (defaultStatus || 'all')) || 
           formulationFilter !== 'all' || 
           toxicityFilter !== 'all' || 
           countryFilter !== 'all' || 
           listingFilter !== 'all' ||
           supplierFilter.trim() !== '' ||
           searchInput.trim() !== '' ||
           effectiveDateStart ||
           effectiveDateEnd ||
           createdDateStart ||
           createdDateEnd
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
                    placeholder="搜索产品名称、农药名称、登记证号..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-8"
                  />
                </div>
              </div>

              {/* 供应商搜索 */}
              {showSupplierFilter && (
                <div className="w-[200px]">
                  <Input
                    placeholder="供应商名称"
                    value={supplierFilter}
                    onChange={(e) => setSupplierFilter(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              )}
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

          {/* 第二行：基础筛选下拉框 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* 状态筛选 */}
            {showStatusFilter && (
              <div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="所有状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有状态</SelectItem>
                    <SelectItem value="DRAFT">草稿</SelectItem>
                    <SelectItem value="PENDING_REVIEW">待审核</SelectItem>
                    <SelectItem value="ACTIVE">已通过</SelectItem>
                    <SelectItem value="REJECTED">已拒绝</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* 剂型筛选 */}
            {showFormulationFilter && (
              <div>
                <Select
                  value={formulationFilter}
                  onValueChange={(value) => handleFilterChange('formulation', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="所有剂型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有剂型</SelectItem>
                    {formulations.map((formulation) => (
                      <SelectItem key={formulation.value} value={formulation.value}>
                        {formulation.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* 毒性筛选 */}
            {showToxicityFilter && (
              <div>
                <Select
                  value={toxicityFilter}
                  onValueChange={(value) => handleFilterChange('toxicity', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="所有毒性" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有毒性</SelectItem>
                    {toxicities.map((toxicity) => (
                      <SelectItem key={toxicity.value} value={toxicity.value}>
                        {toxicity.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* 国家筛选 */}
            {showCountryFilter && (
              <div>
                <SimpleCountrySelect
                  value={countryFilter}
                  onValueChange={(value) => handleFilterChange('country', value)}
                  includeAll={true}
                  allLabel="所有国家"
                  placeholder="所有国家"
                />
              </div>
            )}

            {/* 上架状态筛选 */}
            {showListingFilter && (
              <div>
                <Select
                  value={listingFilter}
                  onValueChange={(value) => handleFilterChange('listing', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="上架状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有状态</SelectItem>
                    <SelectItem value="listed">已上架</SelectItem>
                    <SelectItem value="unlisted">未上架</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* 第三行：日期筛选 */}
          {showDateFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* 有效期筛选 */}
              <div>
                <label className="text-sm font-medium mb-2 block">有效期开始</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />
                      {effectiveDateStart ? format(effectiveDateStart, 'yyyy-MM-dd') : '选择日期'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={effectiveDateStart}
                      onSelect={setEffectiveDateStart}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">有效期结束</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />
                      {effectiveDateEnd ? format(effectiveDateEnd, 'yyyy-MM-dd') : '选择日期'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={effectiveDateEnd}
                      onSelect={setEffectiveDateEnd}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* 创建日期筛选 */}
              <div>
                <label className="text-sm font-medium mb-2 block">创建开始</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />
                      {createdDateStart ? format(createdDateStart, 'yyyy-MM-dd') : '选择日期'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={createdDateStart}
                      onSelect={setCreatedDateStart}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">创建结束</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />
                      {createdDateEnd ? format(createdDateEnd, 'yyyy-MM-dd') : '选择日期'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={createdDateEnd}
                      onSelect={setCreatedDateEnd}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* 筛选结果提示 */}
          {hasActiveFilters() && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>已应用筛选条件</span>
              <div className="flex gap-1 flex-wrap">
                {searchInput && <Badge variant="outline">关键词: {searchInput}</Badge>}
                {supplierFilter && <Badge variant="outline">供应商: {supplierFilter}</Badge>}
                {statusFilter !== (defaultStatus || 'all') && <Badge variant="outline">状态</Badge>}
                {formulationFilter !== 'all' && <Badge variant="outline">剂型</Badge>}
                {toxicityFilter !== 'all' && <Badge variant="outline">毒性</Badge>}
                {countryFilter !== 'all' && <Badge variant="outline">国家</Badge>}
                {listingFilter !== 'all' && <Badge variant="outline">上架状态</Badge>}
                {(effectiveDateStart || effectiveDateEnd) && <Badge variant="outline">有效期</Badge>}
                {(createdDateStart || createdDateEnd) && <Badge variant="outline">创建日期</Badge>}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}