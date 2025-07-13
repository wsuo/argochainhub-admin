'use client'

import React, { useState, useMemo } from 'react'
import { Check, ChevronsUpDown, Search, X } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { useCountryOptions } from '@/lib/dictionary-utils'
import { getCountryFlag } from '@/lib/country-utils'

interface EnhancedCountrySelectProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  required?: boolean
  allowClear?: boolean
  showFlag?: boolean
  showSearchInTrigger?: boolean
}

export function EnhancedCountrySelect({
  value,
  onValueChange,
  placeholder = "请选择国家",
  disabled = false,
  className,
  required = false,
  allowClear = true,
  showFlag = true,
  showSearchInTrigger = false
}: EnhancedCountrySelectProps) {
  const [open, setOpen] = useState(false)
  const countries = useCountryOptions()

  // 获取当前选中的国家
  const selectedCountry = useMemo(() => {
    return countries.find(country => country.value === value)
  }, [countries, value])

  // 获取国旗
  const getFlag = (country: any) => {
    if (!showFlag) return null
    
    const flag = country.extra?.flag
    return flag ? <span className="text-lg mr-2">{flag}</span> : null
  }

  // 清除选择
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onValueChange?.('')
    setOpen(false)
  }

  // 选择国家
  const handleSelect = (countryValue: string) => {
    onValueChange?.(countryValue)
    setOpen(false)
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
              {selectedCountry ? (
                <>
                  {getFlag(selectedCountry)}
                  <span className="truncate">{selectedCountry.label}</span>
                  {selectedCountry.extra?.iso2 && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {selectedCountry.extra.iso2.toUpperCase()}
                    </Badge>
                  )}
                </>
              ) : (
                <span>{placeholder}</span>
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
          <Command>
            <CommandInput placeholder="搜索国家..." />
            <CommandList>
              <CommandEmpty>未找到相关国家</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {countries.map((country) => (
                  <CommandItem
                    key={country.value}
                    value={`${country.label} ${country.value} ${country.extra?.iso2 || ''} ${country.extra?.labelEn || ''}`}
                    onSelect={() => handleSelect(country.value)}
                    className="flex items-center gap-2"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === country.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {getFlag(country)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate">{country.label}</span>
                        {country.extra?.iso2 && (
                          <Badge variant="outline" className="text-xs">
                            {country.extra.iso2.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                      {country.extra?.iso3 && (
                        <div className="text-xs text-muted-foreground">
                          {country.extra.iso3.toUpperCase()}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

// 简化版国家选择器（用于筛选等场景）
interface SimpleCountrySelectProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  includeAll?: boolean
  allLabel?: string
  showFlag?: boolean
}

export function SimpleCountrySelect({
  value,
  onValueChange,
  placeholder = "选择国家",
  disabled = false,
  className,
  includeAll = false,
  allLabel = "所有国家",
  showFlag = true
}: SimpleCountrySelectProps) {
  const [open, setOpen] = useState(false)
  const countries = useCountryOptions()

  const allOptions = useMemo(() => {
    const options = [...countries]
    if (includeAll) {
      options.unshift({
        value: 'all',
        label: allLabel,
        disabled: false,
        extra: { flag: '🌍' }
      })
    }
    return options
  }, [countries, includeAll, allLabel])

  const selectedOption = allOptions.find(option => option.value === value)

  const getFlag = (option: any) => {
    if (!showFlag) return null
    
    if (option.value === 'all') {
      return <span className="text-lg mr-2">🌍</span>
    }
    
    const flag = getCountryFlag(
      option.extra, 
      option.label, 
      option.value
    )
    
    return flag ? <span className="text-lg mr-2">{flag}</span> : null
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <div className="flex items-center flex-1 min-w-0">
            {selectedOption ? (
              <>
                {getFlag(selectedOption)}
                <span className="truncate">{selectedOption.label}</span>
              </>
            ) : (
              <span>{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" style={{ width: 'var(--radix-popover-trigger-width)' }}>
        <Command>
          <CommandInput placeholder="搜索国家..." />
          <CommandList>
            <CommandEmpty>未找到相关国家</CommandEmpty>
            <CommandGroup className="max-h-48 overflow-auto">
              {allOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onValueChange?.(currentValue === value ? '' : currentValue)
                    setOpen(false)
                  }}
                  className="flex items-center gap-2"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {getFlag(option)}
                  <span className="truncate">{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// 国家显示组件（只读）
interface CountryDisplayProps {
  value?: string
  showFlag?: boolean
  showCode?: boolean
  className?: string
}

export function CountryDisplay({
  value,
  showFlag = true,
  showCode = false,
  className
}: CountryDisplayProps) {
  const countries = useCountryOptions()
  const country = countries.find(c => c.value === value)

  if (!country) {
    return <span className={cn("text-muted-foreground", className)}>未知国家</span>
  }

  const flag = showFlag ? getCountryFlag(country.extra, country.label, country.value) : null

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {flag && <span className="text-lg">{flag}</span>}
      <span>{country.label}</span>
      {showCode && country.extra?.iso2 && (
        <Badge variant="outline" className="text-xs">
          {country.extra.iso2.toUpperCase()}
        </Badge>
      )}
    </div>
  )
}

// 使用示例
export function CountrySelectExample() {
  const [selectedCountry, setSelectedCountry] = useState('')
  const [filterCountry, setFilterCountry] = useState('')

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">增强型国家选择器</h3>
        <EnhancedCountrySelect
          value={selectedCountry}
          onValueChange={setSelectedCountry}
          placeholder="请选择国家"
          showFlag={true}
          allowClear={true}
        />
        {selectedCountry && (
          <div className="mt-2">
            <CountryDisplay value={selectedCountry} showCode={true} />
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">简化版国家筛选</h3>
        <SimpleCountrySelect
          value={filterCountry}
          onValueChange={setFilterCountry}
          placeholder="筛选国家"
          includeAll={true}
          className="max-w-xs"
        />
      </div>
    </div>
  )
}