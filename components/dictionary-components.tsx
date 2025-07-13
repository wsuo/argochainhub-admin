import React, { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useDictionaryOptions, useCountryOptions } from '@/lib/dictionary-utils'
import { Check, ChevronsUpDown } from 'lucide-react'
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

/**
 * 字典下拉选择组件
 * @param code 字典分类代码
 * @param placeholder 占位符文本
 * @param value 当前值
 * @param onValueChange 值变化回调
 * @param includeDisabled 是否包含禁用项
 * @param className 样式类名
 */
interface DictionarySelectProps {
  code: string
  placeholder?: string
  value?: string
  onValueChange?: (value: string) => void
  includeDisabled?: boolean
  className?: string
}

export function DictionarySelect({
  code,
  placeholder = '请选择',
  value,
  onValueChange,
  includeDisabled = false,
  className
}: DictionarySelectProps) {
  const options = useDictionaryOptions(code, includeDisabled)

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem 
            key={option.value} 
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/**
 * 国家选择组件 - 带国旗显示
 */
interface CountrySelectProps {
  placeholder?: string
  value?: string
  onValueChange?: (value: string) => void
  includeDisabled?: boolean
  className?: string
  showFlag?: boolean // 是否显示国旗
}

export function CountrySelect({
  placeholder = '请选择国家',
  value,
  onValueChange,
  includeDisabled = false,
  className,
  showFlag = true
}: CountrySelectProps) {
  const countries = useCountryOptions(includeDisabled)

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {countries.map((country) => (
          <SelectItem 
            key={country.value} 
            value={country.value}
            disabled={country.disabled}
          >
            <div className="flex items-center gap-2">
              {showFlag && country.extra?.flag && (
                <span className="text-lg">{country.extra.flag}</span>
              )}
              <span>{country.label}</span>
              {country.extra?.phoneCode && (
                <span className="text-xs text-muted-foreground ml-auto">
                  +{country.extra.phoneCode}
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/**
 * 业务类型选择组件
 */
interface BusinessTypeSelectProps {
  placeholder?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}

export function BusinessTypeSelect({
  placeholder = '请选择业务类型',
  value,
  onValueChange,
  className
}: BusinessTypeSelectProps) {
  return (
    <DictionarySelect
      code="business_type"
      placeholder={placeholder}
      value={value}
      onValueChange={onValueChange}
      className={className}
    />
  )
}

/**
 * 业务类型多选组件
 */
interface BusinessTypesMultiSelectProps {
  placeholder?: string
  value?: string[]
  onValueChange?: (value: string[]) => void
  className?: string
  maxItems?: number
}

export function BusinessTypesMultiSelect({
  placeholder = '请选择业务类型',
  value = [],
  onValueChange,
  className,
  maxItems = 5
}: BusinessTypesMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const options = useDictionaryOptions('business_type')

  const selectedOptions = options.filter(option => value.includes(option.value))

  const handleSelect = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue]
    
    onValueChange?.(newValue)
  }

  const handleRemove = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newValue = value.filter(v => v !== optionValue)
    onValueChange?.(newValue)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between h-auto min-h-[40px] px-3 py-2", className)}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedOptions.length > 0 ? (
              selectedOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant="secondary"
                  className="text-xs"
                  onClick={(e) => handleRemove(option.value, e)}
                >
                  {option.label}
                  <span className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center text-xs">
                    ×
                  </span>
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" style={{ width: 'var(--radix-popover-trigger-width)' }}>
        <Command>
          <CommandInput placeholder="搜索业务类型..." />
          <CommandList>
            <CommandEmpty>未找到相关业务类型</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                  disabled={!value.includes(option.value) && value.length >= maxItems}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.includes(option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                  {!value.includes(option.value) && value.length >= maxItems && (
                    <Badge variant="outline" className="ml-auto text-xs">
                      已达上限
                    </Badge>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

/**
 * 公司规模选择组件
 */
interface CompanySizeSelectProps {
  placeholder?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  includeAll?: boolean
}

export function CompanySizeSelect({
  placeholder = '请选择公司规模',
  value,
  onValueChange,
  className,
  includeAll = false
}: CompanySizeSelectProps) {
  const baseOptions = useDictionaryOptions('company_size')
  
  const options = includeAll 
    ? [{ value: 'all', label: '所有规模', disabled: false }, ...baseOptions]
    : baseOptions

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem 
            key={option.value} 
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/**
 * 企业状态选择组件 - 从字典获取
 */
interface CompanyStatusSelectProps {
  placeholder?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  includeAll?: boolean
}

export function CompanyStatusSelect({
  placeholder = '请选择企业状态',
  value,
  onValueChange,
  className,
  includeAll = false
}: CompanyStatusSelectProps) {
  const baseOptions = useDictionaryOptions('company_status')
  
  const options = includeAll 
    ? [{ value: 'all', label: '所有状态', disabled: false }, ...baseOptions]
    : baseOptions

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem 
            key={option.value} 
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/**
 * 使用示例组件
 */
export function DictionaryExample() {
  const [businessTypes, setBusinessTypes] = useState<string[]>([])
  const [country, setCountry] = useState('')
  const [companySize, setCompanySize] = useState('')
  const [companyStatus, setCompanyStatus] = useState('')

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">业务类型（多选）</label>
        <BusinessTypesMultiSelect
          value={businessTypes}
          onValueChange={setBusinessTypes}
          className="w-full"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">国家</label>
        <CountrySelect
          value={country}
          onValueChange={setCountry}
          className="w-full"
          showFlag={true}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">公司规模</label>
        <CompanySizeSelect
          value={companySize}
          onValueChange={setCompanySize}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">企业状态</label>
        <CompanyStatusSelect
          value={companyStatus}
          onValueChange={setCompanyStatus}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">自定义字典</label>
        <DictionarySelect
          code="your_custom_dict_code"
          placeholder="请选择自定义选项"
          className="w-full"
        />
      </div>
    </div>
  )
}