import { useMemo } from 'react'
import { useDictionary, useCountriesWithFlags } from '@/hooks/use-api'
import { getCountryFlag } from './country-utils'
import { getDictionaryData } from './mock-dictionary'
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
    // 减少调试日志输出，避免干扰
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 字典数据调试 (${code}):`, {
        hasData: !!dictionary,
        isLoading,
        hasError: !!error,
        dataLength: dictionary?.items?.length || (Array.isArray(dictionary) ? dictionary.length : 0)
      })
    }
    
    // 如果API数据加载成功，使用API数据
    if (dictionary) {
      let items = []
      
      // 检查数据格式：是否为 { items: [...] } 格式
      if (dictionary.items && Array.isArray(dictionary.items)) {
        items = dictionary.items
      }
      // 或者直接是数组格式 [...]
      else if (Array.isArray(dictionary)) {
        items = dictionary
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 ${code} 字典原始items:`, items.slice(0, 2))
      }
      
      if (items.length > 0) {
        // 检测数据结构并适配
        const firstItem = items[0]
        const isNewFormat = firstItem?.code !== undefined && firstItem?.name !== undefined
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔍 ${code} 字典格式检测:`, {
            isNewFormat,
            sampleItem: { code: firstItem?.code, hasName: !!firstItem?.name }
          })
        }
        
        if (isNewFormat) {
          // 新格式：{ code, name: {zh-CN, en, es}, isActive, ... }
          const result = items
            .filter(item => includeDisabled || item.isActive !== false)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
            .map(item => ({
              value: item.code,
              label: item.name?.['zh-CN'] || item.name?.en || item.code,
              disabled: item.isActive === false,
              extra: {
                labelEn: item.name?.en,
                labelEs: item.name?.es,
                description: item.description,
                id: item.id
              }
            }))
          
          if (process.env.NODE_ENV === 'development') {
            console.log(`🔍 ${code} 字典处理结果:`, result.slice(0, 2))
          }
          return result
        } else {
          // 旧格式：{ value, labelZh, labelEn, status, ... }
          const result = items
            .filter(item => includeDisabled || item.status === 'active')
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
            .map(item => ({
              value: item.value,
              label: item.labelZh || item.labelEn || item.value,
              disabled: item.status !== 'active',
              extra: {
                labelEn: item.labelEn,
                labelEs: item.labelEs,
                flag: getCountryFlag(item.extra, { 'zh-CN': item.labelZh, 'en': item.labelEn }, item.value),
                ...item.extra
              }
            }))
          
          if (process.env.NODE_ENV === 'development') {
            console.log(`🔍 ${code} 字典处理结果 (旧格式):`, result.slice(0, 2))
          }
          return result
        }
      }
    }
    
    // 如果API数据不可用，使用模拟数据
    const mockData = getDictionaryData(code)
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 ${code} 使用模拟数据:`, mockData.length)
    }
    return mockData.map(item => ({
      value: item.value,
      label: item.label,
      disabled: false,
      extra: {
        description: item.description
      }
    }))
  }, [dictionary, includeDisabled, code])
}

/**
 * 获取国家选项列表Hook - 包含国旗等额外信息
 * @param includeDisabled 是否包含禁用项，默认false
 * @returns 国家选项数组，包含国旗、ISO代码等信息
 */
export function useCountryOptions(includeDisabled = false): DictionaryOption[] {
  const { data: countries, isLoading, error } = useCountriesWithFlags()
  
  return useMemo(() => {
    // 如果API数据加载成功，使用API数据
    if (countries && Array.isArray(countries) && countries.length > 0) {
      // 检查数据结构，适配不同的API响应格式
      const isNewFormat = countries[0]?.code !== undefined && countries[0]?.name !== undefined
      
      if (isNewFormat) {
        // 新的API格式：{ code, name: {zh-CN, en, es}, flag, isActive, ... }
        return countries
          .filter(item => includeDisabled || item.isActive !== false)
          .map(item => {
            // 如果API返回的flag是白旗或无效，使用我们的生成函数
            const apiFlag = item.flag && item.flag !== '🏳️' ? item.flag : null
            const generatedFlag = getCountryFlag({ iso2: item.iso2 }, item.name, item.code)
            
            return {
              value: item.code || item.value,
              label: item.name?.['zh-CN'] || item.name?.en || item.code || item.value,
              disabled: item.isActive === false,
              extra: {
                labelEn: item.name?.en,
                labelEs: item.name?.es,
                flag: apiFlag || generatedFlag,
                iso2: item.iso2,
                iso3: item.iso3,
                phoneCode: item.countryCode,
                continent: item.continent
              }
            }
          })
      } else {
        // 旧的API格式：{ value, labelZh, labelEn, status, extra }
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
              flag: getCountryFlag(item.extra, { 'zh-CN': item.labelZh, 'en': item.labelEn }, item.value),
              iso2: item.extra?.iso2,
              iso3: item.extra?.iso3,
              phoneCode: item.extra?.countryCode,
              ...item.extra
            }
          }))
      }
    }
    
    // 如果正在加载中，返回空数组（不使用模拟数据，避免闪烁）
    if (isLoading) {
      return []
    }
    
    // 如果加载失败或无数据，使用模拟数据
    const mockCountries = [
      { value: 'CN', label: '中国', iso2: 'CN', iso3: 'CHN' },
      { value: 'US', label: '美国', iso2: 'US', iso3: 'USA' },
      { value: 'JP', label: '日本', iso2: 'JP', iso3: 'JPN' },
      { value: 'DE', label: '德国', iso2: 'DE', iso3: 'DEU' },
      { value: 'FR', label: '法国', iso2: 'FR', iso3: 'FRA' },
      { value: 'GB', label: '英国', iso2: 'GB', iso3: 'GBR' },
      { value: 'IN', label: '印度', iso2: 'IN', iso3: 'IND' },
      { value: 'BR', label: '巴西', iso2: 'BR', iso3: 'BRA' },
      { value: 'AU', label: '澳大利亚', iso2: 'AU', iso3: 'AUS' },
      { value: 'CA', label: '加拿大', iso2: 'CA', iso3: 'CAN' }
    ]
    
    return mockCountries.map(country => ({
      value: country.value,
      label: country.label,
      disabled: false,
      extra: {
        labelEn: country.label,
        flag: getCountryFlag({ iso2: country.iso2 }, { 'zh-CN': country.label }, country.value),
        iso2: country.iso2,
        iso3: country.iso3,
        phoneCode: undefined
      }
    }))
  }, [countries, includeDisabled, isLoading, error])
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
  COMPANY_SIZE: 'company_size',
  COMPANY_STATUS: 'company_status',
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