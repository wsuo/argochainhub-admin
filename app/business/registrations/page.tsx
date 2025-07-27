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
import { Loader2, FileText, Eye, Edit, CheckCircle, XCircle, Clock, Search, Trash2, Calendar } from "lucide-react"
import { DataPagination } from "@/components/data-pagination"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { useRouter } from "next/navigation"
import { 
  useRegistrationRequests, 
  useRegistrationRequestStats, 
  useUpdateRegistrationRequestStatus,
  useDeleteRegistrationRequest 
} from "@/hooks/use-api"
import type { RegistrationRequestQuery } from "@/lib/types"
import { DictionarySelect, CountrySelect } from "@/components/dictionary-components"

// 登记申请状态枚举
const REGISTRATION_STATUS = {
  pending_response: { label: "待回复", color: "warning" },
  in_progress: { label: "进行中", color: "info" },
  completed: { label: "已完成", color: "success" },
  declined: { label: "已拒绝", color: "destructive" },
  cancelled: { label: "已取消", color: "secondary" },
}

export default function RegistrationRequestsPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [targetCountry, setTargetCountry] = useState<string>("")
  const [searchInput, setSearchInput] = useState("")
  
  // 状态修改对话框状态
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [editingRequest, setEditingRequest] = useState<any>(null)
  const [newStatus, setNewStatus] = useState("")
  const [statusNote, setStatusNote] = useState("")
  
  // 删除对话框状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingRequestId, setDeletingRequestId] = useState<string>("")

  // 构建查询参数
  const query: RegistrationRequestQuery = {
    page,
    limit: 20,
    ...(keyword && { keyword }),
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(targetCountry && { targetCountry }),
  }

  // 使用统一的API hooks
  const { data: stats } = useRegistrationRequestStats()
  const { data, isLoading } = useRegistrationRequests(query)
  const updateStatusMutation = useUpdateRegistrationRequestStatus()
  const deleteMutation = useDeleteRegistrationRequest()
  
  const registrationRequests = data?.data || []
  const meta = data?.meta

  // 处理搜索
  const handleSearch = () => {
    setKeyword(searchInput)
    setPage(1)
  }

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  // 重置搜索条件
  const handleReset = () => {
    setSearchInput("")
    setKeyword("")
    setStatusFilter("all")
    setTargetCountry("")
    setPage(1)
  }

  // 处理状态筛选变化
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setPage(1)
  }

  // 处理目标国家筛选变化
  const handleTargetCountryChange = (value: string) => {
    setTargetCountry(value)
    setPage(1)
  }

  // 获取状态徽章颜色
  const getStatusBadgeVariant = (color: string) => {
    const variantMap: { [key: string]: "default" | "secondary" | "destructive" | "warning" | "success" | "info" } = {
      default: "default",
      secondary: "secondary",
      destructive: "destructive",
      warning: "warning",
      success: "success",
      info: "info",
    }
    return variantMap[color] || "default"
  }

  // 获取可用的状态转换选项
  const getAvailableStatusTransitions = (currentStatus: string) => {
    const transitions: Record<string, string[]> = {
      pending_response: ["in_progress", "declined", "cancelled"],
      in_progress: ["completed", "declined", "cancelled"],
      completed: [],
      declined: [],
      cancelled: [],
    }
    return transitions[currentStatus] || []
  }

  // 打开状态修改对话框
  const openStatusDialog = (request: any) => {
    setEditingRequest(request)
    setNewStatus(request.status)
    setStatusNote("")
    setIsStatusDialogOpen(true)
  }

  // 提交状态更新
  const handleStatusUpdate = async () => {
    if (!editingRequest || !newStatus) return

    try {
      await updateStatusMutation.mutateAsync({
        id: editingRequest.id,
        data: {
          status: newStatus,
          statusNote,
          operatedBy: "admin", // 应该从当前用户上下文获取
        },
      })
      setIsStatusDialogOpen(false)
    } catch (error) {
      // 错误已由mutation处理
    }
  }

  // 检查是否可以删除
  const canDelete = (status: string) => {
    return status === "pending_response" || status === "cancelled"
  }

  // 打开删除确认对话框
  const openDeleteDialog = (id: string) => {
    setDeletingRequestId(id)
    setDeleteDialogOpen(true)
  }

  // 确认删除
  const handleDelete = async () => {
    if (!deletingRequestId) return

    try {
      await deleteMutation.mutateAsync(deletingRequestId)
      setDeleteDialogOpen(false)
    } catch (error) {
      // 错误已由mutation处理
    }
  }

  // 查看详情
  const handleViewDetail = (id: string) => {
    router.push(`/business/registrations/${id}`)
  }

  // 格式化金额
  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待回复</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingResponse || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">进行中</CardTitle>
            <FileText className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.inProgress || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已完成</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completed || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已拒绝</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.declined || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已取消</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.cancelled || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总计</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* 列表区域 */}
      <Card>
        <CardHeader>
          <CardTitle>登记申请列表</CardTitle>
        </CardHeader>
        <CardContent>
          {/* 搜索和筛选 */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="搜索登记申请单号、企业名称、产品名称..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="状态筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                {Object.entries(REGISTRATION_STATUS).map(([value, { label }]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="w-[180px]">
              <CountrySelect
                value={targetCountry}
                onValueChange={handleTargetCountryChange}
                placeholder="目标国家"
                allowClear
              />
            </div>
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
          ) : registrationRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              暂无登记申请数据
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>申请单号</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>目标国家</TableHead>
                    <TableHead>产品信息</TableHead>
                    <TableHead>买方企业</TableHead>
                    <TableHead>供应商</TableHead>
                    <TableHead>预算</TableHead>
                    <TableHead>截止日期</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrationRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.regReqNo}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(REGISTRATION_STATUS[request.status as keyof typeof REGISTRATION_STATUS]?.color)}>
                          {REGISTRATION_STATUS[request.status as keyof typeof REGISTRATION_STATUS]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{request.details.targetCountry}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{request.productSnapshot.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {request.productSnapshot.category} | {request.productSnapshot.formulation}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{request.buyer.name["zh-CN"]}</TableCell>
                      <TableCell>{request.supplier.name["zh-CN"]}</TableCell>
                      <TableCell>
                        {formatAmount(request.details.budget.amount, request.details.budget.currency)}
                      </TableCell>
                      <TableCell>
                        {format(new Date(request.deadline), "yyyy-MM-dd", { locale: zhCN })}
                      </TableCell>
                      <TableCell>
                        {request.createdAt && format(new Date(request.createdAt), "yyyy-MM-dd", { locale: zhCN })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetail(request.id)}
                            title="查看详情"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {getAvailableStatusTransitions(request.status).length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openStatusDialog(request)}
                              title="修改状态"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete(request.status) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(request.id)}
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

      {/* 状态修改对话框 */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>修改登记申请状态</DialogTitle>
            <DialogDescription>
              当前状态：{editingRequest && REGISTRATION_STATUS[editingRequest.status as keyof typeof REGISTRATION_STATUS]?.label}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">新状态</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="选择新状态" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableStatusTransitions(editingRequest?.status || '').map((status) => (
                    <SelectItem key={status} value={status}>
                      {REGISTRATION_STATUS[status as keyof typeof REGISTRATION_STATUS]?.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="statusNote">
                {newStatus === "declined" ? "拒绝原因" : "状态说明"}
              </Label>
              <Textarea
                id="statusNote"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder={newStatus === "declined" ? "请输入拒绝原因..." : "请输入状态说明..."}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              取消
            </Button>
            <Button 
              onClick={handleStatusUpdate} 
              disabled={!newStatus || updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              确认修改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除这个登记申请吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
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