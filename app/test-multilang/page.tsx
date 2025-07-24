'use client'

import { ErrorBoundary } from '@/components/error-boundary'
import { ProductListTable } from '@/components/product/product-list-table'
import { getMultiLangText } from '@/lib/multi-lang-utils'

// 模拟产品数据，包含多语言对象
const mockProducts = [
  {
    id: 1,
    name: { 'zh-CN': '测试产品', en: 'Test Product', es: 'Producto de Prueba' },
    pesticideName: { 'zh-CN': '测试农药', en: 'Test Pesticide' },
    supplierId: 1,
    supplier: {
      id: 1,
      name: '测试供应商',
      country: '中国'
    },
    formulation: 'WP',
    toxicity: 'LOW' as const,
    registrationNumber: 'PD20240001',
    registrationHolder: '测试公司',
    effectiveDate: '2024-12-31',
    firstApprovalDate: '2020-01-01',
    totalContent: '90%',
    minOrderQuantity: 100,
    minOrderUnit: '公斤',
    isListed: true,
    status: 'ACTIVE' as const,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z'
  }
]

export default function TestPage() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">多语言渲染测试</h1>
      
      {/* 直接渲染多语言对象 - 这应该会报错 */}
      <div className="p-4 border rounded">
        <h2 className="text-lg font-semibold mb-2">错误演示：直接渲染对象</h2>
        <div>产品名称: {mockProducts[0].name}</div>
      </div>
      
      {/* 使用工具函数渲染 - 这应该正常工作 */}
      <div className="p-4 border rounded">
        <h2 className="text-lg font-semibold mb-2">正确演示：使用工具函数</h2>
        <div>产品名称: {getMultiLangText(mockProducts[0].name)}</div>
      </div>
      
      {/* 测试ProductListTable */}
      <div>
        <h2 className="text-lg font-semibold mb-2">ProductListTable 测试</h2>
        <ErrorBoundary>
          <ProductListTable
            products={mockProducts}
            loading={false}
            showReviewActions={false}
            showListingToggle={false}
            showDeleteAction={false}
            formulations={[{ value: 'WP', label: '可湿性粉剂' }]}
          />
        </ErrorBoundary>
      </div>
    </div>
  )
}