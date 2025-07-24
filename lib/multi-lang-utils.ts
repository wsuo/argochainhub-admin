import type { MultiLangText } from './types'

/**
 * 安全获取多语言文本
 * @param text 多语言文本对象或字符串
 * @param lang 目标语言
 * @param fallback 备用文本
 * @returns 处理后的字符串
 */
export function getMultiLangText(
  text: MultiLangText | string | any,
  lang: 'zh-CN' | 'en' | 'es' = 'zh-CN',
  fallback = ''
): string {
  // 空值处理
  if (!text) return fallback

  // 如果已经是字符串，直接返回
  if (typeof text === 'string') return text

  // 如果是对象，尝试提取语言文本
  if (typeof text === 'object' && text !== null) {
    // 优先返回指定语言
    if (text[lang]) return String(text[lang])
    
    // 备选方案：中文 -> 英文 -> 西班牙语
    if (text['zh-CN']) return String(text['zh-CN'])
    if (text.zh) return String(text.zh) // 兼容旧格式
    if (text.en) return String(text.en)
    if (text['es']) return String(text['es'])
    
    // 取第一个非空值
    const firstValue = Object.values(text).find(val => val && String(val).trim())
    if (firstValue) return String(firstValue)
    
    // 最后尝试序列化对象（用于调试）
    try {
      return JSON.stringify(text)
    } catch {
      return fallback
    }
  }

  // 其他类型转换为字符串
  try {
    return String(text) || fallback
  } catch {
    return fallback
  }
}

/**
 * 检查多语言文本是否为空
 */
export function isMultiLangTextEmpty(text: MultiLangText | string | any): boolean {
  if (!text) return true
  
  if (typeof text === 'string') return !text.trim()
  
  if (typeof text === 'object' && text !== null) {
    return !Object.values(text).some(val => val && String(val).trim())
  }
  
  return true
}

/**
 * 创建多语言文本对象
 */
export function createMultiLangText(
  zhCN: string,
  en?: string,
  es?: string
): MultiLangText {
  const result: MultiLangText = { 'zh-CN': zhCN }
  if (en) result.en = en
  if (es) result.es = es
  return result
}

/**
 * 获取多语言文本的所有可用语言
 */
export function getAvailableLanguages(text: MultiLangText | string | any): string[] {
  if (!text || typeof text !== 'object') return []
  
  return Object.keys(text).filter(key => 
    text[key] && String(text[key]).trim()
  )
}