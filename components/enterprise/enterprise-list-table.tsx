'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Eye, 
  ToggleLeft, 
  ToggleRight,
  Globe,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import type { Company } from '@/lib/types'
import { CountryDisplay } from '@/components/enhanced-country-select'
import { useDictionaryOptions } from '@/lib/dictionary-utils'

export interface EnterpriseListTableProps {
  companies: Company[]
  loading?: boolean
  showReviewActions?: boolean
  showStatusToggle?: boolean
  onReview?: (company: Company, approved: boolean) => void
  onToggleStatus?: (companyId: number, currentStatus: Company['status']) => void
  onViewDetails?: (companyId: number) => void
  toggleStatusLoading?: boolean
}

export function EnterpriseListTable({
  companies,
  loading = false,
  showReviewActions = false,
  showStatusToggle = false,
  onReview,
  onToggleStatus,
  onViewDetails,
  toggleStatusLoading = false
}: EnterpriseListTableProps) {
  const router = useRouter()
  
  // 获取字典选项
  const companyStatusOptions = useDictionaryOptions('company_status')
  const companySizeOptions = useDictionaryOptions('company_size')

  const getStatusBadge = (status: Company['status']) => {
    const option = companyStatusOptions.find(opt => opt.value === status)
    if (option) {
      return <Badge variant="secondary">{option.label}</Badge>
    }
    
    // 兜底处理
    switch (status) {
      case 'active':
        return <Badge variant="secondary">已激活</Badge>
      case 'pending_review':
        return <Badge variant="destructive">待审核</Badge>
      case 'disabled':
        return <Badge variant="outline">已禁用</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getTypeBadge = (type: Company['type']) => {
    switch (type) {
      case 'supplier':
        return <Badge variant="default">供应商</Badge>
      case 'buyer':
        return <Badge variant="secondary">采购商</Badge>
      case 'manufacturer':
        return <Badge variant="outline">制造商</Badge>
      case 'distributor':
        return <Badge variant="outline">分销商</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  const getCompanySizeBadge = (size?: string) => {
    if (!size) return null
    
    const option = companySizeOptions.find(opt => opt.value === size)
    return option ? (
      <Badge variant="outline" className="text-xs">
        {option.label}
      </Badge>
    ) : null
  }

  const formatAnnualValue = (value?: number | string) => {
    if (!value || value === 0) return null
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(numValue) || numValue === 0) return null
    
    if (numValue >= 1000000) {
      return `$${(numValue / 1000000).toFixed(1)}M`
    } else if (numValue >= 1000) {
      return `$${(numValue / 1000).toFixed(1)}K`
    } else {
      return `$${numValue.toFixed(0)}`
    }
  }

  const handleViewDetails = (companyId: number) => {
    if (onViewDetails) {
      onViewDetails(companyId)
    } else {
      router.push(`/enterprises/${companyId}`)
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded" />
        ))}
      </div>
    )
  }

  if (companies.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>暂无企业数据</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>企业名称</TableHead>
          <TableHead>类型</TableHead>
          <TableHead>状态</TableHead>
          <TableHead>
            <div className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              国家
            </div>
          </TableHead>
          <TableHead>规模</TableHead>
          <TableHead>年交易额</TableHead>
          <TableHead>用户数</TableHead>
          <TableHead>注册时间</TableHead>
          <TableHead>操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {companies.map((company) => (
          <TableRow key={company.id}>
            <TableCell className="font-medium">
              <div>
                <div className="font-semibold">{company.name['zh-CN'] || company.name.zh}</div>
                {company.name.en && (
                  <div className="text-sm text-muted-foreground">
                    {company.name.en}
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>{getTypeBadge(company.type)}</TableCell>
            <TableCell>{getStatusBadge(company.status)}</TableCell>
            <TableCell>
              {company.country ? (
                <CountryDisplay value={company.country} showFlag={true} />
              ) : (
                <span className="text-muted-foreground text-sm">未设置</span>
              )}
            </TableCell>
            <TableCell>
              {getCompanySizeBadge(company.companySize) || (
                <span className="text-muted-foreground text-sm">未设置</span>
              )}
            </TableCell>
            <TableCell>
              {formatAnnualValue(company.annualImportExportValue) || (
                <span className="text-muted-foreground text-sm">未设置</span>
              )}
            </TableCell>
            <TableCell>{company.users?.length || 0}</TableCell>
            <TableCell>
              {new Date(company.createdAt).toLocaleDateString('zh-CN')}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {/* 查看详情按钮 */}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewDetails(company.id)}
                  title="查看详情"
                >
                  <Eye className="h-4 w-4" />
                </Button>

                {/* 审核操作按钮 */}
                {showReviewActions && company.status === 'pending_review' && onReview && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onReview(company, true)}
                      title="审核通过"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onReview(company, false)}
                      title="审核拒绝"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </>
                )}

                {/* 状态切换按钮 */}
                {showStatusToggle && onToggleStatus && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleStatus(company.id, company.status)}
                    disabled={toggleStatusLoading || company.status === 'pending_review'}
                    title={company.status === 'pending_review' ? '待审核企业不能切换状态' : company.status === 'active' ? '点击禁用' : '点击启用'}
                  >
                    {company.status === 'active' ? (
                      <ToggleRight className="h-4 w-4" />
                    ) : (
                      <ToggleLeft className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}