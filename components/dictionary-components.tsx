import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select'
import { useDictionaryOptions, useCountryOptions } from '@/lib/dictionary-utils'

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
 * 使用示例组件
 */
export function DictionaryExample() {
  const [businessType, setBusinessType] = React.useState('')
  const [country, setCountry] = React.useState('')

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">业务类型</label>
        <BusinessTypeSelect
          value={businessType}
          onValueChange={setBusinessType}
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