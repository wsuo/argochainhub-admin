'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  Loader2, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Power, 
  Crown,
  Users,
  DollarSign,
  Globe
} from 'lucide-react'
import { DataPagination } from '@/components/data-pagination'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { 
  useVipConfigs, 
  useVipConfigStats,
  useDeleteVipConfig,
  useToggleVipConfigStatus,
  useBatchToggleVipConfigStatus
} from '@/hooks/use-api'
import type { VipConfigQuery } from '@/lib/types'

// VIP配置常量
const PLATFORM_OPTIONS = {
  supplier: { label: '供应端', color: 'bg-blue-100 text-blue-800' },
  purchaser: { label: '采购端', color: 'bg-green-100 text-green-800' }
}

const LEVEL_OPTIONS = {
  promotion: { label: '促销版', color: 'bg-orange-100 text-orange-800' },
  basic: { label: '基础版', color: 'bg-gray-100 text-gray-800' },
  advanced: { label: '高级版', color: 'bg-purple-100 text-purple-800' }
}

const CURRENCY_OPTIONS = {
  USD: { label: '美元', symbol: '$' },
  CNY: { label: '人民币', symbol: '¥' }
}

export default function VipConfigsPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [platformFilter, setPlatformFilter] = useState<string>('all')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [currencyFilter, setCurrencyFilter] = useState<string>('all')
  const [isActiveFilter, setIsActiveFilter] = useState<string>('all')
  const [searchInput, setSearchInput] = useState('')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  
  // 删除对话框状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingConfigId, setDeletingConfigId] = useState<number | null>(null)

  // 构建查询参数
  const query: VipConfigQuery = {
    page,
    limit: 20,
    ...(keyword && { keyword }),
    ...(platformFilter !== 'all' && { platform: platformFilter as any }),
    ...(levelFilter !== 'all' && { level: levelFilter as any }),
    ...(currencyFilter !== 'all' && { currency: currencyFilter as any }),
    ...(isActiveFilter !== 'all' && { isActive: isActiveFilter === 'true' }),
  }

  // 使用统一的API hooks
  const { data: stats } = useVipConfigStats()
  const { data, isLoading } = useVipConfigs(query)
  const deleteConfigMutation = useDeleteVipConfig()
  const toggleStatusMutation = useToggleVipConfigStatus()
  const batchToggleStatusMutation = useBatchToggleVipConfigStatus()
  
  const vipConfigs = data?.data || []
  const meta = data?.meta

  // 处理搜索
  const handleSearch = () => {
    setKeyword(searchInput)
    setPage(1)
  }

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // 重置搜索条件
  const handleReset = () => {
    setSearchInput('')
    setKeyword('')
    setPlatformFilter('all')
    setLevelFilter('all')
    setCurrencyFilter('all')
    setIsActiveFilter('all')
    setPage(1)
  }

  // 处理筛选变化
  const handlePlatformFilterChange = (value: string) => {
    setPlatformFilter(value)
    setPage(1)
  }

  const handleLevelFilterChange = (value: string) => {
    setLevelFilter(value)
    setPage(1)
  }

  const handleCurrencyFilterChange = (value: string) => {
    setCurrencyFilter(value)
    setPage(1)
  }

  const handleIsActiveFilterChange = (value: string) => {
    setIsActiveFilter(value)
    setPage(1)
  }

  // 切换状态
  const handleToggleStatus = (id: number) => {
    toggleStatusMutation.mutate(id)
  }

  // 打开删除确认对话框
  const openDeleteDialog = (id: number) => {
    setDeletingConfigId(id)
    setDeleteDialogOpen(true)
  }

  // 确认删除
  const handleDelete = async () => {
    if (!deletingConfigId) return

    try {
      await deleteConfigMutation.mutateAsync(deletingConfigId)
      setDeleteDialogOpen(false)
      setDeletingConfigId(null)
    } catch (error) {
      // 错误已由mutation处理
    }
  }

  // 格式化价格
  const formatPrice = (price: string, currency: string) => {
    const symbol = CURRENCY_OPTIONS[currency as keyof typeof CURRENCY_OPTIONS]?.symbol || ''
    return `${symbol}${price}`
  }

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总配置数</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalConfigs || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">启用配置</CardTitle>
            <Power className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeConfigs || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">禁用配置</CardTitle>
            <Power className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.inactiveConfigs || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平台分布</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              {stats?.platformStats?.map((stat) => (
                <div key={stat.platform} className="flex justify-between">
                  <span>{PLATFORM_OPTIONS[stat.platform as keyof typeof PLATFORM_OPTIONS]?.label}</span>
                  <span className="font-medium">{stat.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 列表区域 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>VIP配置列表</CardTitle>
            <Link href="/finance/vip-configs/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                新增配置
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {/* 搜索和筛选 */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="搜索配置名称..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
            </div>
            <Select value={platformFilter} onValueChange={handlePlatformFilterChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="平台" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部平台</SelectItem>
                {Object.entries(PLATFORM_OPTIONS).map(([value, { label }]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={handleLevelFilterChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="等级" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部等级</SelectItem>
                {Object.entries(LEVEL_OPTIONS).map(([value, { label }]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={currencyFilter} onValueChange={handleCurrencyFilterChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="币种" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部币种</SelectItem>
                {Object.entries(CURRENCY_OPTIONS).map(([value, { label }]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={isActiveFilter} onValueChange={handleIsActiveFilterChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="true">启用</SelectItem>
                <SelectItem value="false">禁用</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} size="sm">
              <Search className="h-4 w-4 mr-1" />
              搜索
            </Button>
            <Button onClick={handleReset} variant="outline" size="sm">
              重置
            </Button>
          </div>

          {/* 表格 */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : vipConfigs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              暂无VIP配置数据
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>配置名称</TableHead>
                    <TableHead>平台</TableHead>
                    <TableHead>等级</TableHead>
                    <TableHead>价格</TableHead>
                    <TableHead>时长</TableHead>
                    <TableHead>账户配额</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>排序</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vipConfigs.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell className="font-medium">
                        {config.name["zh-CN"]}
                      </TableCell>
                      <TableCell>
                        <Badge className={PLATFORM_OPTIONS[config.platform]?.color}>
                          {PLATFORM_OPTIONS[config.platform]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={LEVEL_OPTIONS[config.level]?.color}>
                          {LEVEL_OPTIONS[config.level]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {formatPrice(config.currentPrice, config.currency)}
                          </div>
                          {config.originalPrice !== config.currentPrice && (
                            <div className="text-xs text-muted-foreground line-through">
                              {formatPrice(config.originalPrice, config.currency)}
                            </div>
                          )}
                          {config.discount && (
                            <Badge variant="outline" className="text-xs">
                              {config.discount}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{config.days}天</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {config.accountQuota}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={config.isActive ? "default" : "secondary"}>
                          {config.isActive ? "启用" : "禁用"}
                        </Badge>
                      </TableCell>
                      <TableCell>{config.sortOrder}</TableCell>
                      <TableCell>
                        {format(new Date(config.createdAt), "yyyy-MM-dd", { locale: zhCN })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/finance/vip-configs/${config.id}`)}
                            title="编辑"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(config.id)}
                            title={config.isActive ? "禁用" : "启用"}
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(config.id)}
                            title="删除"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* 分页 */}
              {meta && (
                <div className="mt-4">
                  <DataPagination
                    currentPage={meta.currentPage}
                    totalPages={meta.totalPages}
                    totalItems={meta.totalItems}
                    itemsPerPage={meta.itemsPerPage}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除这个VIP配置吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={deleteConfigMutation.isPending}
            >
              {deleteConfigMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}