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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Loader2, Package, Eye, Check, X, Truck, Search, Edit, Trash2 } from "lucide-react"
import { DataPagination } from "@/components/data-pagination"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { useRouter } from "next/navigation"
import { 
  useSampleRequests, 
  useSampleRequestStats, 
  useUpdateSampleRequestStatus,
  useDeleteSampleRequest 
} from "@/hooks/use-api"
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
  const [keyword, setKeyword] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchInput, setSearchInput] = useState("")
  
  // 状态修改对话框状态
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [editingRequest, setEditingRequest] = useState<any>(null)
  const [newStatus, setNewStatus] = useState("")
  const [rejectReason, setRejectReason] = useState("")
  const [trackingCarrier, setTrackingCarrier] = useState("")
  const [trackingNumber, setTrackingNumber] = useState("")
  
  // 删除对话框状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingRequestId, setDeletingRequestId] = useState<string>("")

  // 构建查询参数
  const query: SampleRequestQuery = {
    page,
    limit: 20,
    ...(keyword && { keyword }),
    ...(statusFilter !== "all" && { status: statusFilter }),
  }

  // 使用统一的API hooks
  const { data: stats } = useSampleRequestStats()
  const { data, isLoading } = useSampleRequests(query)
  const updateStatusMutation = useUpdateSampleRequestStatus()
  const deleteMutation = useDeleteSampleRequest()
  
  const sampleRequests = data?.data || []
  const meta = data?.meta
  const totalPages = meta?.totalPages || 1

  const handleSearch = () => {
    setKeyword(searchInput)
    setPage(1)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleReset = () => {
    setSearchInput("")
    setKeyword("")
    setStatusFilter("all")
    setPage(1)
  }

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    setPage(1)
  }

  // 打开状态修改对话框
  const handleStatusEdit = (request: any) => {
    setEditingRequest(request)
    setNewStatus(request.status)
    setRejectReason("")
    setTrackingCarrier("")
    setTrackingNumber("")
    setIsStatusDialogOpen(true)
  }

  // 提交状态修改
  const handleStatusUpdate = async () => {
    if (!editingRequest || !newStatus) return

    const updateData: any = {
      status: newStatus,
      operatedBy: "admin"
    }

    if (newStatus === "rejected" && rejectReason) {
      updateData.rejectReason = rejectReason
    }

    if (newStatus === "shipped" && trackingCarrier && trackingNumber) {
      updateData.trackingInfo = {
        carrier: trackingCarrier,
        trackingNumber: trackingNumber
      }
    }

    updateStatusMutation.mutate(
      { id: editingRequest.id, data: updateData },
      {
        onSuccess: () => {
          setIsStatusDialogOpen(false)
          setEditingRequest(null)
        }
      }
    )
  }

  // 删除样品申请
  const handleDelete = (id: string) => {
    setDeletingRequestId(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    deleteMutation.mutate(deletingRequestId, {
      onSuccess: () => {
        setDeleteDialogOpen(false)
        setDeletingRequestId("")
      }
    })
  }

  const getStatusBadge = (status: keyof typeof SAMPLE_STATUS) => {
    const statusInfo = SAMPLE_STATUS[status]
    return (
      <Badge variant={statusInfo.color as any}>
        {statusInfo.label}
      </Badge>
    )
  }

  // 获取可用的状态转换选项
  const getAvailableStatusTransitions = (currentStatus: string) => {
    const transitions: Record<string, string[]> = {
      pending_approval: ["approved", "rejected"],
      approved: ["shipped", "rejected"],
      shipped: ["delivered"],
      delivered: [],
      rejected: [],
      cancelled: [],
    }
    return transitions[currentStatus] || []
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
                placeholder="搜索申请单号、企业名称、产品名称、申请用途..."
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
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              router.push(`/business/sample-requests/${request.id}`)
                            }}
                            title="查看详情"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {getAvailableStatusTransitions(request.status).length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusEdit(request)}
                              title="修改状态"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {(request.status === "pending_approval" || request.status === "cancelled") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(request.id)}
                              title="删除"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
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

      {/* 状态修改对话框 */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>修改样品申请状态</DialogTitle>
            <DialogDescription>
              修改样品申请 "{editingRequest?.sampleReqNo}" 的状态
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">新状态 *</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择新状态" />
                </SelectTrigger>
                <SelectContent>
                  {editingRequest && getAvailableStatusTransitions(editingRequest.status).map((status) => (
                    <SelectItem key={status} value={status}>
                      {SAMPLE_STATUS[status as keyof typeof SAMPLE_STATUS].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 拒绝状态的额外字段 */}
            {newStatus === "rejected" && (
              <div>
                <Label htmlFor="rejectReason">拒绝原因 *</Label>
                <Textarea
                  id="rejectReason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="请输入拒绝原因"
                  rows={3}
                />
              </div>
            )}

            {/* 发货状态的额外字段 */}
            {newStatus === "shipped" && (
              <>
                <div>
                  <Label htmlFor="trackingCarrier">物流公司 *</Label>
                  <Input
                    id="trackingCarrier"
                    value={trackingCarrier}
                    onChange={(e) => setTrackingCarrier(e.target.value)}
                    placeholder="如：德邦快递"
                  />
                </div>
                <div>
                  <Label htmlFor="trackingNumber">物流单号 *</Label>
                  <Input
                    id="trackingNumber"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="请输入物流单号"
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStatusDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={
                updateStatusMutation.isPending ||
                !newStatus ||
                (newStatus === "rejected" && !rejectReason) ||
                (newStatus === "shipped" && (!trackingCarrier || !trackingNumber))
              }
            >
              确认修改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除样品申请</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将删除该样品申请，操作无法撤销。确定要继续吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}