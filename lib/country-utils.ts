/**
 * 国家/地区工具函数
 * 处理国旗显示、特殊地区等逻辑
 */

// 国旗映射表 - 处理特殊情况和缺失的国旗
const FLAG_MAPPING: Record<string, string> = {
  // 中国相关
  'cn': '🇨🇳',
  'china': '🇨🇳',
  
  // 台湾使用中国国旗
  'tw': '🇨🇳',
  'taiwan': '🇨🇳',
  'chinese taipei': '🇨🇳',
  '中国台湾': '🇨🇳',
  'china taiwan': '🇨🇳',
  
  // 香港澳门
  'hk': '🇭🇰',
  'hongkong': '🇭🇰',
  'hong kong': '🇭🇰',
  'mo': '🇲🇴',
  'macau': '🇲🇴',
  'macao': '🇲🇴',
  
  // 常见国家
  'us': '🇺🇸',
  'usa': '🇺🇸',
  'united states': '🇺🇸',
  'gb': '🇬🇧',
  'uk': '🇬🇧',
  'united kingdom': '🇬🇧',
  'jp': '🇯🇵',
  'japan': '🇯🇵',
  'kr': '🇰🇷',
  'korea': '🇰🇷',
  'south korea': '🇰🇷',
  'de': '🇩🇪',
  'germany': '🇩🇪',
  'fr': '🇫🇷',
  'france': '🇫🇷',
  'in': '🇮🇳',
  'india': '🇮🇳',
  'br': '🇧🇷',
  'brazil': '🇧🇷',
  'ca': '🇨🇦',
  'canada': '🇨🇦',
  'au': '🇦🇺',
  'australia': '🇦🇺',
  'ru': '🇷🇺',
  'russia': '🇷🇺',
  'it': '🇮🇹',
  'italy': '🇮🇹',
  'es': '🇪🇸',
  'spain': '🇪🇸',
  'mx': '🇲🇽',
  'mexico': '🇲🇽',
  'ar': '🇦🇷',
  'argentina': '🇦🇷',
  'za': '🇿🇦',
  'south africa': '🇿🇦',
  'eg': '🇪🇬',
  'egypt': '🇪🇬',
  'ng': '🇳🇬',
  'nigeria': '🇳🇬',
  'th': '🇹🇭',
  'thailand': '🇹🇭',
  'vn': '🇻🇳',
  'vietnam': '🇻🇳',
  'id': '🇮🇩',
  'indonesia': '🇮🇩',
  'my': '🇲🇾',
  'malaysia': '🇲🇾',
  'sg': '🇸🇬',
  'singapore': '🇸🇬',
  'ph': '🇵🇭',
  'philippines': '🇵🇭',
  'pk': '🇵🇰',
  'pakistan': '🇵🇰',
  'bd': '🇧🇩',
  'bangladesh': '🇧🇩',
  'ir': '🇮🇷',
  'iran': '🇮🇷',
  'tr': '🇹🇷',
  'turkey': '🇹🇷',
  'sa': '🇸🇦',
  'saudi arabia': '🇸🇦',
  'ae': '🇦🇪',
  'uae': '🇦🇪',
  'united arab emirates': '🇦🇪',
  'il': '🇮🇱',
  'israel': '🇮🇱',
  'ke': '🇰🇪',
  'kenya': '🇰🇪',
  'gh': '🇬🇭',
  'ghana': '🇬🇭',
  'ma': '🇲🇦',
  'morocco': '🇲🇦',
  'tn': '🇹🇳',
  'tunisia': '🇹🇳',
  'dz': '🇩🇿',
  'algeria': '🇩🇿',
  'ly': '🇱🇾',
  'libya': '🇱🇾',
}

/**
 * 获取国家/地区的国旗图标
 * @param extraData 字典项的额外数据
 * @param name 国家/地区名称对象
 * @param code 国家/地区代码
 * @returns 国旗emoji字符串
 */
export function getCountryFlag(
  extraData?: Record<string, any>,
  name?: { 'zh-CN'?: string; en?: string; es?: string },
  code?: string
): string {
  // 1. 优先使用 extraData 中的 flag 字段
  if (extraData?.flag && extraData.flag !== '🏳️') {
    return extraData.flag
  }
  
  // 2. 使用 extraData 中的 flagIcon 字段（但排除默认的白旗）
  if (extraData?.flagIcon && extraData.flagIcon !== '🏳️') {
    return extraData.flagIcon
  }
  
  // 3. 根据ISO代码查找
  if (extraData?.iso2) {
    const flagByIso2 = FLAG_MAPPING[extraData.iso2.toLowerCase()]
    if (flagByIso2) return flagByIso2
  }
  
  if (extraData?.iso3) {
    const flagByIso3 = FLAG_MAPPING[extraData.iso3.toLowerCase()]
    if (flagByIso3) return flagByIso3
  }
  
  // 4. 根据代码查找
  if (code) {
    const flagByCode = FLAG_MAPPING[code.toLowerCase()]
    if (flagByCode) return flagByCode
  }
  
  // 5. 根据中文名称查找（特殊处理台湾）
  if (name?.['zh-CN']) {
    const chineseName = name['zh-CN'].toLowerCase()
    if (chineseName.includes('台湾') || chineseName.includes('中华民国')) {
      return '🇨🇳'
    }
    
    const flagByChineseName = FLAG_MAPPING[chineseName]
    if (flagByChineseName) return flagByChineseName
  }
  
  // 6. 根据英文名称查找
  if (name?.en) {
    const englishName = name.en.toLowerCase()
    const flagByEnglishName = FLAG_MAPPING[englishName]
    if (flagByEnglishName) return flagByEnglishName
  }
  
  // 7. 特殊处理：从国家代码生成区域指示符
  if (extraData?.iso2 && extraData.iso2.length === 2) {
    try {
      const regionalIndicators = extraData.iso2.toUpperCase()
        .split('')
        .map((char: string) => String.fromCodePoint(0x1F1E6 + char.charCodeAt(0) - 'A'.charCodeAt(0)))
        .join('')
      
      // 验证生成的是否为有效的国旗emoji
      if (regionalIndicators.length === 4) {
        return regionalIndicators
      }
    } catch (error) {
      console.warn('Failed to generate flag from ISO2 code:', extraData.iso2)
    }
  }
  
  // 8. 默认返回地球图标
  return '🌍'
}

/**
 * 检查是否为台湾相关的地区
 * @param name 名称对象
 * @param code 代码
 * @returns 是否为台湾
 */
export function isTaiwanRegion(
  name?: { 'zh-CN'?: string; en?: string },
  code?: string
): boolean {
  if (!name && !code) return false
  
  // 检查代码
  if (code && ['tw', 'taiwan'].includes(code.toLowerCase())) {
    return true
  }
  
  // 检查中文名称
  if (name?.['zh-CN']) {
    const chineseName = name['zh-CN'].toLowerCase()
    if (chineseName.includes('台湾') || chineseName.includes('中华民国')) {
      return true
    }
  }
  
  // 检查英文名称
  if (name?.en) {
    const englishName = name.en.toLowerCase()
    if (englishName.includes('taiwan') || englishName.includes('chinese taipei')) {
      return true
    }
  }
  
  return false
}

/**
 * 获取国家/地区的显示名称（处理台湾特殊显示）
 * @param name 名称对象
 * @param lang 当前语言
 * @returns 处理后的显示名称
 */
export function getCountryDisplayName(
  name: { 'zh-CN'?: string; en?: string; es?: string },
  lang: 'zh-CN' | 'en' | 'es' = 'zh-CN'
): string {
  const displayName = name[lang] || name['zh-CN'] || name.en || ''
  
  // 特殊处理台湾显示
  if (lang === 'zh-CN' && displayName.includes('台湾') && !displayName.includes('中国')) {
    return `中国台湾`
  }
  
  return displayName
}