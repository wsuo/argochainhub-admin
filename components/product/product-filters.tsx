'use client'

import { useCallback, memo } from 'react'
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
  // 状态提升：接收所有状态值和更新函数
  statusFilter: string
  setStatusFilter: (value: string) => void
  formulationFilter: string
  setFormulationFilter: (value: string) => void
  toxicityFilter: string
  setToxicityFilter: (value: string) => void
  countryFilter: string
  setCountryFilter: (value: string) => void
  listingFilter: string
  setListingFilter: (value: string) => void
  searchInput: string
  setSearchInput: (value: string) => void
  supplierFilter: string
  setSupplierFilter: (value: string) => void
  effectiveDateStart?: Date
  setEffectiveDateStart: (value: Date | undefined) => void
  effectiveDateEnd?: Date
  setEffectiveDateEnd: (value: Date | undefined) => void
  createdDateStart?: Date
  setCreatedDateStart: (value: Date | undefined) => void
  createdDateEnd?: Date
  setCreatedDateEnd: (value: Date | undefined) => void
}

function ProductFiltersComponent({
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
  toxicities = [],
  // 状态提升：接收所有状态值和更新函数
  statusFilter,
  setStatusFilter,
  formulationFilter,
  setFormulationFilter,
  toxicityFilter,
  setToxicityFilter,
  countryFilter,
  setCountryFilter,
  listingFilter,
  setListingFilter,
  searchInput,
  setSearchInput,
  supplierFilter,
  setSupplierFilter,
  effectiveDateStart,
  setEffectiveDateStart,
  effectiveDateEnd,
  setEffectiveDateEnd,
  createdDateStart,
  setCreatedDateStart,
  createdDateEnd,
  setCreatedDateEnd
}: ProductFiltersProps) {
  // 状态现在由父组件管理，无需在此初始化

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

  const handleFilterChange = useCallback((filterType: string, value: string) => {    
    // 检查是否需要更新
    let currentValue = ''
    switch (filterType) {
      case 'status': currentValue = statusFilter; break
      case 'formulation': currentValue = formulationFilter; break
      case 'toxicity': currentValue = toxicityFilter; break
      case 'country': currentValue = countryFilter; break
      case 'listing': currentValue = listingFilter; break
    }
    
    if (currentValue === value) {
      return
    }
    
    // 更新状态
    switch (filterType) {
      case 'status': setStatusFilter(value); break
      case 'formulation': setFormulationFilter(value); break
      case 'toxicity': setToxicityFilter(value); break
      case 'country': setCountryFilter(value); break
      case 'listing': setListingFilter(value); break
    }
    
    // 异步调用搜索
    setTimeout(() => {
      const newState = {
        status: filterType === 'status' ? value : statusFilter,
        formulation: filterType === 'formulation' ? value : formulationFilter,
        toxicity: filterType === 'toxicity' ? value : toxicityFilter,
        country: filterType === 'country' ? value : countryFilter,
        listing: filterType === 'listing' ? value : listingFilter,
      }
      
      const query: Partial<ProductQuery> = {
        search: searchInput.trim() || undefined,
        status: newState.status === 'all' ? undefined : newState.status as Product['status'],
        formulation: newState.formulation === 'all' ? undefined : newState.formulation,
        toxicity: newState.toxicity === 'all' ? undefined : newState.toxicity as Product['toxicity'],
        country: newState.country === 'all' ? undefined : newState.country,
        isListed: newState.listing === 'all' ? undefined : newState.listing === 'listed',
        supplierName: supplierFilter.trim() || undefined,
        effectiveDateStart: effectiveDateStart ? format(effectiveDateStart, 'yyyy-MM-dd') : undefined,
        effectiveDateEnd: effectiveDateEnd ? format(effectiveDateEnd, 'yyyy-MM-dd') : undefined,
        createdStartDate: createdDateStart ? format(createdDateStart, 'yyyy-MM-dd') : undefined,
        createdEndDate: createdDateEnd ? format(createdDateEnd, 'yyyy-MM-dd') : undefined,
        page: 1
      }
      
      onSearch(query)
    }, 0)
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
            {/* 审核状态筛选 */}
            {showStatusFilter && (
              <div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="审核状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有审核状态</SelectItem>
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
                    <SelectItem value="all">全部上架状态</SelectItem>
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

// 使用React.memo防止不必要的重新挂载
export const ProductFilters = memo(ProductFiltersComponent, (prevProps, nextProps) => {
  // 自定义比较函数，只在真正需要重新渲染时才返回false
  const propsEqual = (
    prevProps.showStatusFilter === nextProps.showStatusFilter &&
    prevProps.showFormulationFilter === nextProps.showFormulationFilter &&
    prevProps.showToxicityFilter === nextProps.showToxicityFilter &&
    prevProps.showCountryFilter === nextProps.showCountryFilter &&
    prevProps.showSupplierFilter === nextProps.showSupplierFilter &&
    prevProps.showListingFilter === nextProps.showListingFilter &&
    prevProps.showDateFilters === nextProps.showDateFilters &&
    prevProps.defaultStatus === nextProps.defaultStatus &&
    prevProps.className === nextProps.className &&
    prevProps.onSearch === nextProps.onSearch
  )
  
  // 比较数组内容，而不是引用
  const formulationsEqual = (
    prevProps.formulations?.length === nextProps.formulations?.length &&
    prevProps.formulations?.every((item, index) => 
      item.value === nextProps.formulations?.[index]?.value &&
      item.label === nextProps.formulations?.[index]?.label
    )
  )
  
  const toxicitiesEqual = (
    prevProps.toxicities?.length === nextProps.toxicities?.length &&
    prevProps.toxicities?.every((item, index) => 
      item.value === nextProps.toxicities?.[index]?.value &&
      item.label === nextProps.toxicities?.[index]?.label
    )
  )
  
  // 比较状态值，状态提升后这些值不应该引起重新渲染
  const stateEqual = (
    prevProps.statusFilter === nextProps.statusFilter &&
    prevProps.formulationFilter === nextProps.formulationFilter &&
    prevProps.toxicityFilter === nextProps.toxicityFilter &&
    prevProps.countryFilter === nextProps.countryFilter &&
    prevProps.listingFilter === nextProps.listingFilter &&
    prevProps.searchInput === nextProps.searchInput &&
    prevProps.supplierFilter === nextProps.supplierFilter &&
    prevProps.effectiveDateStart === nextProps.effectiveDateStart &&
    prevProps.effectiveDateEnd === nextProps.effectiveDateEnd &&
    prevProps.createdDateStart === nextProps.createdDateStart &&
    prevProps.createdDateEnd === nextProps.createdDateEnd
  )
  
  const shouldSkipRerender = propsEqual && formulationsEqual && toxicitiesEqual && stateEqual
  
  return shouldSkipRerender
})