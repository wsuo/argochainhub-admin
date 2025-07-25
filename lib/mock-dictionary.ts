// 模拟字典数据（实际应该从API获取）
export const mockDictionaryData = {
  company_size: [
    { value: 'startup', label: '初创企业', description: '1-10人' },
    { value: 'small', label: '小型企业', description: '11-50人' },
    { value: 'medium', label: '中型企业', description: '51-200人' },
    { value: 'large', label: '大型企业', description: '201-1000人' },
    { value: 'enterprise', label: '大型集团', description: '1000+人' }
  ],
  
  company_status: [
    { value: 'pending_review', label: '待审核' },
    { value: 'active', label: '已激活' },
    { value: 'disabled', label: '已禁用' },
    { value: 'suspended', label: '已暂停' }
  ],
  
  business_type: [
    { value: 'pesticide_supplier', label: '农药供应商' },
    { value: 'fertilizer_supplier', label: '化肥供应商' },
    { value: 'seed_supplier', label: '种子供应商' },
    { value: 'equipment_supplier', label: '设备供应商' },
    { value: 'pesticide_buyer', label: '农药采购商' },
    { value: 'fertilizer_buyer', label: '化肥采购商' },
    { value: 'distributor', label: '分销商' },
    { value: 'manufacturer', label: '制造商' }
  ],
  
  // 剂型字典数据
  formulation: [
    { value: 'SC', label: '悬浮剂', description: '悬浮剂（Suspension Concentrate）' },
    { value: 'WG', label: '水分散粒剂', description: '水分散粒剂（Water Dispersible Granule）' },
    { value: 'WP', label: '可湿性粉剂', description: '可湿性粉剂（Wettable Powder）' },
    { value: 'EC', label: '乳油', description: '乳油（Emulsifiable Concentrate）' },
    { value: 'EW', label: '水乳剂', description: '水乳剂（Emulsion in Water）' },
    { value: 'SL', label: '水剂', description: '水剂（Soluble Liquid）' },
    { value: 'DP', label: '粉剂', description: '粉剂（Dust Powder）' },
    { value: 'GR', label: '颗粒剂', description: '颗粒剂（Granule）' },
    { value: 'AS', label: '水剂', description: '水剂（Aqueous Solution）' },
    { value: 'BK', label: '菌饼', description: '菌饼（Bacterial Cake）' }
  ],
  
  // 毒性等级字典数据
  toxicity: [
    { value: 'LOW', label: '低毒', description: '低毒性农药' },
    { value: 'MEDIUM', label: '中等毒', description: '中等毒性农药' },
    { value: 'HIGH', label: '高毒', description: '高毒性农药' },
    { value: 'ACUTE', label: '剧毒', description: '剧毒性农药' }
  ]
}

// 检查字典数据是否存在，如果不存在则使用模拟数据
export const getDictionaryData = (code: string) => {
  // 这里应该调用实际的字典API
  // 现在先返回模拟数据
  return mockDictionaryData[code as keyof typeof mockDictionaryData] || []
}