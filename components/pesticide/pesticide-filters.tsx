'use client'

import { useState, KeyboardEvent } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Filter, RotateCcw } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDictionaryOptions } from '@/lib/dictionary-utils'
import type { PesticideQuery } from '@/lib/types'

interface PesticideFiltersProps {
  onSearch: (query: Partial<PesticideQuery>) => void
  categoryFilter: string
  setCategoryFilter: (value: string) => void
  formulationFilter: string
  setFormulationFilter: (value: string) => void
  visibilityFilter: string
  setVisibilityFilter: (value: string) => void
  searchInput: string
  setSearchInput: (value: string) => void
}

export function PesticideFilters({
  onSearch,
  categoryFilter,
  setCategoryFilter,
  formulationFilter,
  setFormulationFilter,
  visibilityFilter,
  setVisibilityFilter,
  searchInput,
  setSearchInput,
}: PesticideFiltersProps) {
  // 获取字典数据
  const categories = useDictionaryOptions('product_category')
  const formulations = useDictionaryOptions('formulation')

  const handleSearch = () => {
    const query: Partial<PesticideQuery> = {}
    
    if (searchInput) query.search = searchInput
    if (categoryFilter !== 'all') query.category = categoryFilter
    if (formulationFilter && formulationFilter !== 'all') query.formulation = formulationFilter
    if (visibilityFilter === 'visible') query.isVisible = true
    else if (visibilityFilter === 'hidden') query.isVisible = false
    
    onSearch(query)
  }

  const handleReset = () => {
    setCategoryFilter('all')
    setFormulationFilter('')
    setVisibilityFilter('all')
    setSearchInput('')
    onSearch({})
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value)
    // 立即触发搜索
    const query: Partial<PesticideQuery> = {}
    if (searchInput) query.search = searchInput
    if (value !== 'all') query.category = value
    if (formulationFilter && formulationFilter !== 'all') query.formulation = formulationFilter
    if (visibilityFilter === 'visible') query.isVisible = true
    else if (visibilityFilter === 'hidden') query.isVisible = false
    onSearch(query)
  }

  const handleFormulationChange = (value: string) => {
    setFormulationFilter(value)
    // 立即触发搜索
    const query: Partial<PesticideQuery> = {}
    if (searchInput) query.search = searchInput
    if (categoryFilter !== 'all') query.category = categoryFilter
    if (value && value !== 'all') query.formulation = value
    if (visibilityFilter === 'visible') query.isVisible = true
    else if (visibilityFilter === 'hidden') query.isVisible = false
    onSearch(query)
  }

  const handleVisibilityChange = (value: string) => {
    setVisibilityFilter(value)
    // 立即触发搜索
    const query: Partial<PesticideQuery> = {}
    if (searchInput) query.search = searchInput
    if (categoryFilter !== 'all') query.category = categoryFilter
    if (formulationFilter && formulationFilter !== 'all') query.formulation = formulationFilter
    if (value === 'visible') query.isVisible = true
    else if (value === 'hidden') query.isVisible = false
    onSearch(query)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          筛选条件
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 搜索栏 */}
          <div className="flex gap-2">
            <Input
              placeholder="搜索农药名称（支持中英西三语）..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              搜索
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              重置
            </Button>
          </div>

          {/* 筛选下拉框 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 产品类别 */}
            <Select value={categoryFilter} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="选择产品类别" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类别</SelectItem>
                {categories.map((category, index) => (
                  <SelectItem key={`category-${category.value}-${index}`} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 剂型 */}
            <Select value={formulationFilter} onValueChange={handleFormulationChange}>
              <SelectTrigger>
                <SelectValue placeholder="选择剂型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部剂型</SelectItem>
                {formulations.map((formulation, index) => (
                  <SelectItem key={`formulation-${formulation.value}-${index}`} value={formulation.value}>
                    {formulation.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 可见性 */}
            <Select value={visibilityFilter} onValueChange={handleVisibilityChange}>
              <SelectTrigger>
                <SelectValue placeholder="选择可见性" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="visible">可见</SelectItem>
                <SelectItem value="hidden">隐藏</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}