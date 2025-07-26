'use client'

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { Check, ChevronsUpDown, Search, X, Loader2, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { useCompanies } from '@/hooks/use-api'
import type { Company, CompanyQuery, MultiLangText } from '@/lib/types'

interface SupplierSelectProps {
  value?: number
  onValueChange?: (value: number | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  required?: boolean
  allowClear?: boolean
}

interface SupplierOption {
  id: number
  name: string // 处理后的显示名称
  originalName: MultiLangText // 原始多语言名称
  country?: string
  businessCategory?: string
  email?: string
  status: Company['status']
}

// 供应商搜索策略
type SearchStrategy = 'frontend' | 'backend'

// 多语言文本处理工具函数
const getDisplayText = (text: string | MultiLangText): string => {
  if (typeof text === 'string') return text
  if (typeof text === 'object' && text !== null) {
    // 优先使用中文，再英文，最后西班牙文
    return text['zh-CN'] || text['en'] || text['es'] || '未知'
  }
  return '未知'
}

export function SupplierSelect({
  value,
  onValueChange,
  placeholder = "请选择供应商",
  disabled = false,
  className,
  required = false,
  allowClear = true
}: SupplierSelectProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchStrategy, setSearchStrategy] = useState<SearchStrategy>('backend')
  const [currentPage, setCurrentPage] = useState(1)
  const [allSuppliers, setAllSuppliers] = useState<SupplierOption[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  
  const ITEMS_PER_PAGE = 20

  // 构建查询参数
  const queryParams = useMemo<CompanyQuery>(() => {
    const params: CompanyQuery = {
      type: 'supplier',
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    }
    
    // 后端搜索模式：将搜索词发送到后端
    if (searchStrategy === 'backend' && searchQuery.trim()) {
      params.search = searchQuery.trim()
    }
    
    return params
  }, [currentPage, searchQuery, searchStrategy])

  // 获取供应商数据
  const { data: suppliersResponse, isLoading, error } = useCompanies(queryParams)

  // 处理供应商数据
  const suppliers = useMemo<SupplierOption[]>(() => {
    if (!suppliersResponse?.data) return []
    
    return suppliersResponse.data.map(company => ({
      id: parseInt(company.id), // 确保 id 是数字类型
      name: getDisplayText(company.name), // 处理多语言名称
      originalName: company.name,
      country: company.country,
      businessCategory: company.businessCategories, // 注意这里可能是复数形式
      email: company.users?.[0]?.email, // 使用第一个用户的邮箱
      status: company.status
    }))
  }, [suppliersResponse])

  // 合并所有数据（用于无限滚动）
  useEffect(() => {
    if (suppliers.length > 0) {
      if (currentPage === 1) {
        // 第一页或新搜索：替换数据
        setAllSuppliers(suppliers)
      } else {
        // 后续页面：追加数据
        setAllSuppliers(prev => {
          const existingIds = new Set(prev.map(s => s.id))
          const newSuppliers = suppliers.filter(s => !existingIds.has(s.id))
          return [...prev, ...newSuppliers]
        })
      }
    }
  }, [suppliers, currentPage])

  // 前端搜索过滤
  const filteredSuppliers = useMemo(() => {
    if (searchStrategy === 'backend' || !searchQuery.trim()) {
      return allSuppliers
    }
    
    // 前端搜索：按名称、国家、业务类别搜索
    const query = searchQuery.toLowerCase()
    return allSuppliers.filter(supplier => 
      supplier.name.toLowerCase().includes(query) ||
      supplier.country?.toLowerCase().includes(query) ||
      supplier.businessCategory?.toLowerCase().includes(query) ||
      supplier.email?.toLowerCase().includes(query)
    )
  }, [allSuppliers, searchQuery, searchStrategy])

  // 获取当前选中的供应商
  const selectedSupplier = useMemo(() => {
    return filteredSuppliers.find(supplier => supplier.id === value)
  }, [filteredSuppliers, value])

  // 处理搜索输入变化
  const handleSearchChange = useCallback((newSearch: string) => {
    setSearchQuery(newSearch)
    setCurrentPage(1) // 重置到第一页
    
    // 如果清空搜索，切换到后端搜索模式
    if (!newSearch.trim()) {
      setSearchStrategy('backend')
    }
  }, [])

  // 处理滚动加载更多
  const handleScrollToBottom = useCallback(() => {
    if (isLoading || !suppliersResponse?.hasMore) return
    
    setCurrentPage(prev => prev + 1)
  }, [isLoading, suppliersResponse?.hasMore])

  // 监听滚动事件
  useEffect(() => {
    const scrollElement = scrollRef.current
    if (!scrollElement) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement
      // 当滚动到底部附近时加载更多
      if (scrollHeight - scrollTop <= clientHeight + 50) {
        handleScrollToBottom()
      }
    }

    scrollElement.addEventListener('scroll', handleScroll)
    return () => scrollElement.removeEventListener('scroll', handleScroll)
  }, [handleScrollToBottom])

  // 清除选择
  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onValueChange?.(undefined)
    setOpen(false)
  }, [onValueChange])

  // 选择供应商
  const handleSelect = useCallback((supplierId: number) => {
    onValueChange?.(supplierId)
    setOpen(false)
  }, [onValueChange])

  // 切换搜索策略
  const toggleSearchStrategy = useCallback(() => {
    const newStrategy = searchStrategy === 'frontend' ? 'backend' : 'frontend'
    setSearchStrategy(newStrategy)
    
    if (newStrategy === 'backend') {
      setCurrentPage(1) // 切换到后端搜索时重置页面
    }
  }, [searchStrategy])

  // 获取供应商状态标识
  const getStatusBadge = (status: Company['status']) => {
    const variants = {
      active: { variant: 'default' as const, label: '活跃' },
      inactive: { variant: 'secondary' as const, label: '不活跃' },
      pending: { variant: 'outline' as const, label: '待审核' },
      rejected: { variant: 'destructive' as const, label: '已拒绝' }
    }
    
    const config = variants[status] || variants.pending
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    )
  }

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              !value && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <div className="flex items-center flex-1 min-w-0">
              {selectedSupplier ? (
                <>
                  <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <span className="truncate font-medium">{selectedSupplier.name}</span>
                    {selectedSupplier.country && (
                      <span className="text-xs text-muted-foreground truncate">
                        {selectedSupplier.country}
                      </span>
                    )}
                  </div>
                  {getStatusBadge(selectedSupplier.status)}
                </>
              ) : (
                <>
                  <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{placeholder}</span>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-1 ml-2">
              {allowClear && value && (
                <div
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground rounded cursor-pointer flex items-center justify-center"
                  onClick={handleClear}
                >
                  <X className="h-3 w-3" />
                </div>
              )}
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" style={{ width: 'var(--radix-popover-trigger-width)' }}>
          <Command shouldFilter={searchStrategy === 'frontend'}>
            <div className="flex items-center border-b">
              <CommandInput 
                placeholder="搜索供应商..." 
                value={searchQuery}
                onValueChange={handleSearchChange}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSearchStrategy}
                className="h-8 px-2 text-xs"
                title={searchStrategy === 'frontend' ? '切换到后端搜索' : '切换到前端搜索'}
              >
                {searchStrategy === 'frontend' ? '前端' : '后端'}
              </Button>
            </div>
            <CommandList ref={scrollRef} className="max-h-64 overflow-auto">
              {isLoading && currentPage === 1 ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">加载中...</span>
                </div>
              ) : error ? (
                <CommandEmpty>
                  <div className="text-center py-4">
                    <p className="text-sm text-destructive">加载失败</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {error.message || '请检查网络连接'}
                    </p>
                  </div>
                </CommandEmpty>
              ) : filteredSuppliers.length === 0 ? (
                <CommandEmpty>
                  {searchQuery.trim() ? '未找到匹配的供应商' : '暂无供应商数据'}
                </CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredSuppliers.map((supplier) => (
                    <CommandItem
                      key={supplier.id}
                      value={`${supplier.name} ${supplier.country || ''} ${supplier.businessCategory || ''}`}
                      onSelect={() => handleSelect(supplier.id)}
                      className="flex items-center gap-2 py-3"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === supplier.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium">{supplier.name}</span>
                          {getStatusBadge(supplier.status)}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          {supplier.country && (
                            <span className="truncate">{supplier.country}</span>
                          )}
                          {supplier.businessCategory && (
                            <span className="truncate">{supplier.businessCategory}</span>
                          )}
                          {supplier.email && (
                            <span className="truncate">{supplier.email}</span>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                  
                  {/* 加载更多指示器 */}
                  {isLoading && currentPage > 1 && (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="h-3 w-3 animate-spin mr-2" />
                      <span className="text-xs text-muted-foreground">加载更多...</span>
                    </div>
                  )}
                  
                  {/* 已加载完毕提示 */}
                  {!isLoading && suppliersResponse?.hasMore === false && filteredSuppliers.length > ITEMS_PER_PAGE && (
                    <div className="text-center py-2">
                      <span className="text-xs text-muted-foreground">已加载全部供应商</span>
                    </div>
                  )}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {/* 搜索策略说明 */}
      {open && (
        <div className="text-xs text-muted-foreground mt-1">
          当前使用<strong>{searchStrategy === 'frontend' ? '前端搜索' : '后端搜索'}</strong>
          {searchStrategy === 'frontend' ? '（实时过滤）' : '（模糊查询）'}
        </div>
      )}
    </div>
  )
}

// 供应商显示组件（只读）
interface SupplierDisplayProps {
  supplierId?: number
  showStatus?: boolean
  showDetails?: boolean
  className?: string
}

export function SupplierDisplay({
  supplierId,
  showStatus = false,
  showDetails = false,
  className
}: SupplierDisplayProps) {
  const { data: suppliersResponse } = useCompanies({ 
    type: 'supplier',
    page: 1,
    limit: 1000 // 获取足够多的数据用于查找
  })
  
  const supplier = useMemo(() => {
    return suppliersResponse?.data?.find(s => parseInt(s.id) === supplierId)
  }, [suppliersResponse, supplierId])

  if (!supplier) {
    return (
      <span className={cn("text-muted-foreground", className)}>
        {supplierId ? '供应商未找到' : '未选择供应商'}
      </span>
    )
  }

  const displayName = getDisplayText(supplier.name)

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{displayName}</span>
          {showStatus && (
            <Badge variant="outline" className="text-xs">
              {supplier.status === 'active' ? '活跃' : 
               supplier.status === 'inactive' ? '不活跃' : 
               supplier.status === 'pending' ? '待审核' : '已拒绝'}
            </Badge>
          )}
        </div>
        {showDetails && (
          <div className="text-xs text-muted-foreground mt-1">
            {[supplier.country, supplier.businessCategories].filter(Boolean).join(' • ')}
          </div>
        )}
      </div>
    </div>
  )
}

// 使用示例组件
export function SupplierSelectExample() {
  const [selectedSupplier, setSelectedSupplier] = useState<number | undefined>()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">供应商选择器</h3>
        <SupplierSelect
          value={selectedSupplier}
          onValueChange={setSelectedSupplier}
          placeholder="请选择供应商"
          allowClear={true}
          className="max-w-md"
        />
        
        {selectedSupplier && (
          <div className="mt-4">
            <SupplierDisplay 
              supplierId={selectedSupplier} 
              showStatus={true} 
              showDetails={true} 
            />
          </div>
        )}
      </div>
    </div>
  )
}