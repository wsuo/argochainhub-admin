"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Package, Eye, Check, X, Truck, Search } from "lucide-react"
import { DataPagination } from "@/components/data-pagination"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { useRouter } from "next/navigation"
import { useSampleRequests, useSampleRequestStats } from "@/hooks/use-api"
import type { SampleRequestQuery } from "@/lib/types"

// 样品申请状态枚举
const SAMPLE_STATUS = {
  pending_approval: { label: "待审核", color: "warning" },
  approved: { label: "已批准", color: "success" },
  shipped: { label: "已发货", color: "info" },
  delivered: { label: "已送达", color: "default" },
  rejected: { label: "已拒绝", color: "destructive" },
  cancelled: { label: "已取消", color: "secondary" },
}

export default function SampleRequestsPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [searchNo, setSearchNo] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchInput, setSearchInput] = useState("")

  // 构建查询参数
  const query: SampleRequestQuery = {
    page,
    limit: 20,
    ...(searchNo && { sampleReqNo: searchNo }),
    ...(statusFilter !== "all" && { status: statusFilter }),
  }

  // 使用统一的API hooks
  const { data: stats } = useSampleRequestStats()
  const { data, isLoading } = useSampleRequests(query)
  const sampleRequests = data?.data || []
  const meta = data?.meta
  const totalPages = meta?.totalPages || 1

  const handleSearch = () => {
    setSearchNo(searchInput)
    setPage(1)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleReset = () => {
    setSearchInput("")
    setSearchNo("")
    setStatusFilter("all")
    setPage(1)
  }

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    setPage(1)
  }

  const getStatusBadge = (status: keyof typeof SAMPLE_STATUS) => {
    const statusInfo = SAMPLE_STATUS[status]
    return (
      <Badge variant={statusInfo.color as any}>
        {statusInfo.label}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">待审核</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingApproval}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">已批准</CardTitle>
              <Check className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">已发货</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.shipped}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">已送达</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.delivered}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">已拒绝</CardTitle>
              <X className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rejected}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">总计</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 筛选条件 */}
      <Card>
        <CardHeader>
          <CardTitle>样品申请列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="搜索申请单号..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="max-w-sm"
              />
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  {Object.entries(SAMPLE_STATUS).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSearch}>
                <Search className="w-4 h-4 mr-2" />
                搜索
              </Button>
              <Button variant="outline" onClick={handleReset}>
                重置
              </Button>
            </div>
          </div>

          {/* 数据表格 */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>申请单号</TableHead>
                    <TableHead>申请时间</TableHead>
                    <TableHead>采购商</TableHead>
                    <TableHead>供应商</TableHead>
                    <TableHead>产品名称</TableHead>
                    <TableHead>数量</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.sampleReqNo}</TableCell>
                      <TableCell>
                        {format(new Date(request.createdAt), "yyyy-MM-dd HH:mm", {
                          locale: zhCN,
                        })}
                      </TableCell>
                      <TableCell>{request.buyer.name["zh-CN"]}</TableCell>
                      <TableCell>{request.supplier.name["zh-CN"]}</TableCell>
                      <TableCell>{request.product.name["zh-CN"]}</TableCell>
                      <TableCell>
                        {request.quantity} {request.unit}
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            router.push(`/business/sample-requests/${request.id}`)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* 分页 */}
              {meta && totalPages > 1 && (
                <div className="mt-4">
                  <DataPagination
                    currentPage={meta.currentPage}
                    totalPages={totalPages}
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
    </div>
  )
}