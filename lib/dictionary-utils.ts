import { useMemo } from 'react'
import { useDictionary, useCountriesWithFlags } from '@/hooks/use-api'
import type { DictionaryItem } from './types'

/**
 * 字典工具类 - 提供常用的字典数据获取和处理功能
 * 
 * 使用示例：
 * const businessTypes = useDictionaryOptions('business_type')
 * const countries = useCountryOptions()
 * const countryName = getDictionaryLabel(businessTypes, 'manufacturing')
 */

// 字典选项接口，适用于下拉框等组件
export interface DictionaryOption {
  value: string
  label: string
  disabled?: boolean
  extra?: Record<string, any> // 额外字段如国旗、区号等
}

/**
 * 获取字典选项列表Hook - 适用于下拉框等组件
 * @param code 字典分类代码
 * @param includeDisabled 是否包含禁用项，默认false
 * @returns 字典选项数组
 */
export function useDictionaryOptions(code: string, includeDisabled = false): DictionaryOption[] {
  const { data: dictionary, isLoading, error } = useDictionary(code)
  
  return useMemo(() => {
    if (!dictionary?.items) return []
    
    return dictionary.items
      .filter(item => includeDisabled || item.status === 'active')
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map(item => ({
        value: item.value,
        label: item.labelZh || item.labelEn || item.value,
        disabled: item.status !== 'active',
        extra: {
          labelEn: item.labelEn,
          labelEs: item.labelEs,
          ...item.extra
        }
      }))
  }, [dictionary, includeDisabled])
}

/**
 * 获取国家选项列表Hook - 包含国旗等额外信息
 * @param includeDisabled 是否包含禁用项，默认false
 * @returns 国家选项数组，包含国旗、ISO代码等信息
 */
export function useCountryOptions(includeDisabled = false): DictionaryOption[] {
  const { data: countries, isLoading, error } = useCountriesWithFlags()
  
  return useMemo(() => {
    if (!countries) return []
    
    return countries
      .filter(item => includeDisabled || item.status === 'active')
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map(item => ({
        value: item.value,
        label: item.labelZh || item.labelEn || item.value,
        disabled: item.status !== 'active',
        extra: {
          labelEn: item.labelEn,
          labelEs: item.labelEs,
          flag: item.extra?.flag,
          iso2: item.extra?.iso2,
          iso3: item.extra?.iso3,
          phoneCode: item.extra?.phoneCode,
          ...item.extra
        }
      }))
  }, [countries, includeDisabled])
}

/**
 * 从字典选项中获取标签文本
 * @param options 字典选项数组
 * @param value 值
 * @param defaultLabel 默认标签，当未找到时返回
 * @returns 标签文本
 */
export function getDictionaryLabel(
  options: DictionaryOption[], 
  value: string, 
  defaultLabel = value
): string {
  const option = options.find(opt => opt.value === value)
  return option?.label || defaultLabel
}

/**
 * 从字典选项中获取额外字段
 * @param options 字典选项数组
 * @param value 值
 * @param field 额外字段名
 * @returns 额外字段值
 */
export function getDictionaryExtra(
  options: DictionaryOption[], 
  value: string, 
  field: string
): any {
  const option = options.find(opt => opt.value === value)
  return option?.extra?.[field]
}

/**
 * 批量获取字典标签
 * @param options 字典选项数组
 * @param values 值数组
 * @param separator 分隔符，默认逗号
 * @returns 标签文本，多个用分隔符连接
 */
export function getDictionaryLabels(
  options: DictionaryOption[], 
  values: string[], 
  separator = ', '
): string {
  return values
    .map(value => getDictionaryLabel(options, value))
    .join(separator)
}

/**
 * 常用字典分类代码常量
 */
export const DICTIONARY_CODES = {
  COUNTRIES: 'countries',
  BUSINESS_TYPE: 'business_type',
  // 可以根据项目需要添加更多常量
} as const

/**
 * 字典状态常量
 */
export const DICTIONARY_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const

/**
 * React组件示例：字典下拉框
 * 
 * 使用方式：
 * ```tsx
 * import { useDictionaryOptions } from '@/lib/dictionary-utils'
 * 
 * function BusinessTypeSelect() {
 *   const options = useDictionaryOptions('business_type')
 *   
 *   return (
 *     <Select>
 *       {options.map(option => (
 *         <Option key={option.value} value={option.value} disabled={option.disabled}>
 *           {option.label}
 *         </Option>
 *       ))}
 *     </Select>
 *   )
 * }
 * 
 * function CountrySelect() {
 *   const countries = useCountryOptions()
 *   
 *   return (
 *     <Select>
 *       {countries.map(country => (
 *         <Option key={country.value} value={country.value}>
 *           {country.extra?.flag} {country.label}
 *         </Option>
 *       ))}
 *     </Select>
 *   )
 * }
 * ```
 */