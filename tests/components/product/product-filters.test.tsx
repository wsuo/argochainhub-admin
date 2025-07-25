import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ProductFilters } from '@/components/product/product-filters'
import type { ProductQuery } from '@/lib/types'

// Mock 字典数据
const mockFormulations = [
  { value: 'WG', label: '水分散粒剂', disabled: false },
  { value: 'SC', label: '悬浮剂', disabled: false },
  { value: 'EC', label: '乳油', disabled: false }
]

const mockToxicities = [
  { value: 'LOW', label: '低毒', disabled: false },
  { value: 'MODERATE', label: '中等毒', disabled: false },
  { value: 'HIGH', label: '高毒', disabled: false }
]

// Mock useCountryOptions hook
jest.mock('@/lib/dictionary-utils', () => ({
  useCountryOptions: () => [
    { value: 'CN', label: '中国', disabled: false, extra: { flag: '🇨🇳' } },
    { value: 'US', label: '美国', disabled: false, extra: { flag: '🇺🇸' } },
    { value: 'JP', label: '日本', disabled: false, extra: { flag: '🇯🇵' } }
  ]
}))

describe('ProductFilters - 产品筛选功能测试', () => {
  let mockOnSearch: jest.Mock<void, [Partial<ProductQuery>]>

  beforeEach(() => {
    mockOnSearch = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const defaultProps = {
    onSearch: mockOnSearch,
    formulations: mockFormulations,
    toxicities: mockToxicities
  }

  describe('组件渲染测试', () => {
    test('应该正确渲染所有筛选组件', () => {
      render(<ProductFilters {...defaultProps} />)

      // 验证主要筛选元素存在
      expect(screen.getByPlaceholderText('搜索产品名称、农药名称、登记证号...')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('供应商名称')).toBeInTheDocument()
      expect(screen.getByText('搜索')).toBeInTheDocument()
      expect(screen.getByText('重置')).toBeInTheDocument()
    })

    test('应该根据props控制筛选器显示', () => {
      render(
        <ProductFilters 
          {...defaultProps}
          showStatusFilter={false}
          showFormulationFilter={false}
        />
      )

      // 状态和剂型筛选器应该不显示
      expect(screen.queryByText('所有状态')).not.toBeInTheDocument()
      expect(screen.queryByText('所有剂型')).not.toBeInTheDocument()
    })
  })

  describe('搜索功能测试', () => {
    test('输入关键词后点击搜索按钮应该触发搜索', () => {
      render(<ProductFilters {...defaultProps} />)

      const searchInput = screen.getByPlaceholderText('搜索产品名称、农药名称、登记证号...')
      const searchButton = screen.getByText('搜索')

      fireEvent.change(searchInput, { target: { value: '草甘膦' } })
      fireEvent.click(searchButton)

      expect(mockOnSearch).toHaveBeenCalledWith({
        search: '草甘膦',
        page: 1
      })
    })

    test('在搜索框中按回车键应该触发搜索', () => {
      render(<ProductFilters {...defaultProps} />)

      const searchInput = screen.getByPlaceholderText('搜索产品名称、农药名称、登记证号...')

      fireEvent.change(searchInput, { target: { value: '杀虫剂' } })
      fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' })

      expect(mockOnSearch).toHaveBeenCalledWith({
        search: '杀虫剂',
        page: 1
      })
    })

    test('供应商搜索框按回车键应该触发搜索', () => {
      render(<ProductFilters {...defaultProps} />)

      const supplierInput = screen.getByPlaceholderText('供应商名称')

      fireEvent.change(supplierInput, { target: { value: '拜耳公司' } })
      fireEvent.keyDown(supplierInput, { key: 'Enter', code: 'Enter' })

      expect(mockOnSearch).toHaveBeenCalledWith({
        supplierName: '拜耳公司',
        page: 1
      })
    })
  })

  describe('筛选器功能测试', () => {
    test('选择状态筛选应该立即触发搜索', async () => {
      render(<ProductFilters {...defaultProps} />)

      // 打开状态下拉框并选择
      const statusTrigger = screen.getByText('所有状态')
      fireEvent.click(statusTrigger)
      
      await waitFor(() => {
        const activeOption = screen.getByText('已通过')
        fireEvent.click(activeOption)
      })

      expect(mockOnSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'ACTIVE',
          page: 1
        })
      )
    })

    test('选择剂型筛选应该立即触发搜索', async () => {
      render(<ProductFilters {...defaultProps} />)

      const formulationTrigger = screen.getByText('所有剂型')
      fireEvent.click(formulationTrigger)
      
      await waitFor(() => {
        const wgOption = screen.getByText('水分散粒剂')
        fireEvent.click(wgOption)
      })

      expect(mockOnSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          formulation: 'WG',
          page: 1
        })
      )
    })

    test('选择毒性筛选应该立即触发搜索', async () => {
      render(<ProductFilters {...defaultProps} />)

      const toxicityTrigger = screen.getByText('所有毒性')
      fireEvent.click(toxicityTrigger)
      
      await waitFor(() => {
        const lowToxicOption = screen.getByText('低毒')
        fireEvent.click(lowToxicOption)
      })

      expect(mockOnSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          toxicity: 'LOW',
          page: 1
        })
      )
    })

    test('选择上架状态筛选应该立即触发搜索', async () => {
      render(<ProductFilters {...defaultProps} />)

      const listingTrigger = screen.getByText('所有状态')
      fireEvent.click(listingTrigger)
      
      await waitFor(() => {
        const listedOption = screen.getByText('已上架')
        fireEvent.click(listedOption)
      })

      expect(mockOnSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          isListed: true,
          page: 1
        })
      )
    })
  })

  describe('重置功能测试', () => {
    test('点击重置按钮应该清除所有筛选条件', async () => {
      render(<ProductFilters {...defaultProps} />)

      // 先设置一些筛选条件
      const searchInput = screen.getByPlaceholderText('搜索产品名称、农药名称、登记证号...')
      fireEvent.change(searchInput, { target: { value: '测试产品' } })

      const supplierInput = screen.getByPlaceholderText('供应商名称')
      fireEvent.change(supplierInput, { target: { value: '测试供应商' } })

      // 点击重置
      const resetButton = screen.getByText('重置')
      fireEvent.click(resetButton)

      // 验证输入框被清空
      expect(searchInput).toHaveValue('')
      expect(supplierInput).toHaveValue('')

      // 验证触发了重置搜索
      expect(mockOnSearch).toHaveBeenCalledWith({
        page: 1
      })
    })

    test('有默认状态时重置应该保持默认状态', () => {
      render(
        <ProductFilters 
          {...defaultProps}
          defaultStatus="PENDING_REVIEW"
        />
      )

      const resetButton = screen.getByText('重置')
      fireEvent.click(resetButton)

      expect(mockOnSearch).toHaveBeenCalledWith({
        page: 1,
        status: 'PENDING_REVIEW'
      })
    })
  })

  describe('组合筛选测试', () => {
    test('多个筛选条件应该正确组合', async () => {
      render(<ProductFilters {...defaultProps} />)

      // 设置搜索关键词
      const searchInput = screen.getByPlaceholderText('搜索产品名称、农药名称、登记证号...')
      fireEvent.change(searchInput, { target: { value: '杀虫剂' } })

      // 设置供应商
      const supplierInput = screen.getByPlaceholderText('供应商名称')
      fireEvent.change(supplierInput, { target: { value: '拜耳' } })

      // 选择状态
      const statusTrigger = screen.getByText('所有状态')
      fireEvent.click(statusTrigger)
      
      await waitFor(() => {
        const activeOption = screen.getByText('已通过')
        fireEvent.click(activeOption)
      })

      expect(mockOnSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          search: '杀虫剂',
          supplierName: '拜耳',
          status: 'ACTIVE',
          page: 1
        })
      )
    })
  })

  describe('筛选状态显示测试', () => {
    test('有活动筛选条件时应该显示筛选提示', () => {
      render(<ProductFilters {...defaultProps} defaultStatus="ACTIVE" />)

      // 设置一些筛选条件来激活筛选提示
      const searchInput = screen.getByPlaceholderText('搜索产品名称、农药名称、登记证号...')
      fireEvent.change(searchInput, { target: { value: '测试' } })
      
      // 验证显示了筛选提示
      expect(screen.getByText('已应用筛选条件')).toBeInTheDocument()
      expect(screen.getByText('关键词: 测试')).toBeInTheDocument()
    })

    test('无筛选条件时不应该显示筛选提示', () => {
      render(<ProductFilters {...defaultProps} />)

      expect(screen.queryByText('已应用筛选条件')).not.toBeInTheDocument()
    })
  })

  describe('边界情况测试', () => {
    test('空字符串搜索应该被过滤掉', () => {
      render(<ProductFilters {...defaultProps} />)

      const searchInput = screen.getByPlaceholderText('搜索产品名称、农药名称、登记证号...')
      const searchButton = screen.getByText('搜索')

      fireEvent.change(searchInput, { target: { value: '   ' } }) // 只有空格
      fireEvent.click(searchButton)

      expect(mockOnSearch).toHaveBeenCalledWith({
        page: 1
      })
    })

    test('字典数据为空时应该正常渲染', () => {
      render(
        <ProductFilters 
          {...defaultProps}
          formulations={[]}
          toxicities={[]}
        />
      )

      // 组件应该正常渲染，不会崩溃
      expect(screen.getByText('筛选条件')).toBeInTheDocument()
    })
  })

  describe('React异步状态修复验证', () => {
    test('快速连续选择筛选条件应该正确处理', async () => {
      render(<ProductFilters {...defaultProps} />)

      // 快速连续选择不同的状态
      const statusTrigger = screen.getByText('所有状态')
      
      fireEvent.click(statusTrigger)
      await waitFor(() => {
        const draftOption = screen.getByText('草稿')
        fireEvent.click(draftOption)
      })

      fireEvent.click(statusTrigger)
      await waitFor(() => {
        const activeOption = screen.getByText('已通过')
        fireEvent.click(activeOption)
      })

      // 最后一次选择应该生效
      expect(mockOnSearch).toHaveBeenLastCalledWith(
        expect.objectContaining({
          status: 'ACTIVE'
        })
      )
    })

    test('首次选择筛选条件不应该导致页面刷新', async () => {
      const { container } = render(<ProductFilters {...defaultProps} />)

      const statusTrigger = screen.getByText('所有状态')
      fireEvent.click(statusTrigger)
      
      await waitFor(() => {
        const activeOption = screen.getByText('已通过')
        fireEvent.click(activeOption)
      })

      // 组件应该仍然存在，没有被卸载重新挂载
      expect(container.firstChild).toBeInTheDocument()
      expect(mockOnSearch).toHaveBeenCalledTimes(1)
    })
  })
})