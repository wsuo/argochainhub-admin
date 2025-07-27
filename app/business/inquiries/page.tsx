"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Search, Eye, RotateCcw, Edit, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { useInquiries, useUpdateInquiryStatus, useDeleteInquiry } from "@/hooks/use-api"
import type { InquiryQuery } from "@/lib/types"

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "success" | "destructive" | "outline" }> = {
  pending_quote: { label: "待报价", variant: "default" },
  quoted: { label: "已报价", variant: "secondary" },
  confirmed: { label: "已确认", variant: "success" },
  declined: { label: "已拒绝", variant: "destructive" },
  expired: { label: "已过期", variant: "outline" },
  cancelled: { label: "已取消", variant: "outline" }
}


export default function InquiriesPage() {
  const router = useRouter()
  const [searchKeyword, setSearchKeyword] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  
  // 状态修改对话框状态
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [editingInquiry, setEditingInquiry] = useState<any>(null)
  const [newStatus, setNewStatus] = useState("")
  const [quotePrice, setQuotePrice] = useState("")
  const [quoteValidUntil, setQuoteValidUntil] = useState("")
  const [supplierRemarks, setSupplierRemarks] = useState("")
  const [declineReason, setDeclineReason] = useState("")
  
  // 构建查询参数
  const query: InquiryQuery = {
    page: currentPage,
    limit: pageSize,
    ...(searchKeyword && { keyword: searchKeyword }),
    ...(selectedStatus !== "all" && { status: selectedStatus }),
  }
  
  // 使用统一的API hooks
  const { data, isLoading, error } = useInquiries(query)
  const updateStatusMutation = useUpdateInquiryStatus()
  const deleteMutation = useDeleteInquiry()
  const inquiries = data?.data || []
  const totalItems = data?.meta?.total || 0
  const totalPages = Math.ceil(totalItems / pageSize)

  // 处理搜索
  const handleSearch = () => {
    setCurrentPage(1) // 搜索时重置到第一页
  }

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  // 重置筛选
  const handleReset = () => {
    setSearchKeyword("")
    setSelectedStatus("all")
    setCurrentPage(1)
  }

  // 查看详情
  const handleViewDetail = (id: number) => {
    router.push(`/business/inquiries/${id}`)
  }

  // 打开状态修改对话框
  const handleStatusEdit = (inquiry: any) => {
    setEditingInquiry(inquiry)
    setNewStatus(inquiry.status)
    setQuotePrice("")
    setQuoteValidUntil("")
    setSupplierRemarks("")
    setDeclineReason("")
    setIsStatusDialogOpen(true)
  }

  // 提交状态修改
  const handleStatusUpdate = async () => {
    if (!editingInquiry || !newStatus) return

    try {
      const updateData: any = {
        status: newStatus,
        operatedBy: "admin"
      }

      // 根据状态添加相应的数据
      if (newStatus === "quoted" && quotePrice) {
        updateData.quoteDetails = {
          totalPrice: parseFloat(quotePrice),
          validUntil: quoteValidUntil,
          supplierRemarks: supplierRemarks
        }
      }

      if (newStatus === "declined" && declineReason) {
        updateData.declineReason = declineReason
      }

      await updateStatusMutation.mutateAsync({ id: editingInquiry.id, data: updateData })
      // 移除这里的 toast，因为 hook 中已经有了
      setIsStatusDialogOpen(false)
      setEditingInquiry(null)
    } catch (error: any) {
      // 移除这里的 toast，因为 hook 中已经有了
      console.error('Status update failed:', error)
    }
  }

  // 删除询盘
  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id)
      // 移除这里的 toast，因为 hook 中已经有了
    } catch (error: any) {
      // 移除这里的 toast，因为 hook 中已经有了
      console.error('Delete inquiry failed:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>询盘管理</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 筛选条件 */}
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="搜索询盘编号、买方企业名、供应商企业名、产品名称"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={handleKeyPress}
            className="max-w-sm"
          />
          <Select value={selectedStatus} onValueChange={(value) => {
            setSelectedStatus(value)
            setCurrentPage(1)
          }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="询盘状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              {Object.entries(statusMap).map(([value, { label }]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSearch} disabled={isLoading}>
            <Search className="h-4 w-4 mr-2" />
            搜索
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            重置
          </Button>
        </div>

        {/* 数据表格 */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>询盘编号</TableHead>
                <TableHead>买方</TableHead>
                <TableHead>供应商</TableHead>
                <TableHead>产品数量</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>截止日期</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-red-500">
                    加载失败，请重试
                  </TableCell>
                </TableRow>
              ) : inquiries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                inquiries.map((inquiry) => (
                  <TableRow key={inquiry.id}>
                    <TableCell className="font-medium">{inquiry.inquiryNo}</TableCell>
                    <TableCell>{inquiry.buyer.name['zh-CN']}</TableCell>
                    <TableCell>{inquiry.supplier.name['zh-CN']}</TableCell>
                    <TableCell>{inquiry.items?.length || 0} 个产品</TableCell>
                    <TableCell>
                      <Badge variant={statusMap[inquiry.status]?.variant || "default"}>
                        {statusMap[inquiry.status]?.label || inquiry.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(inquiry.deadline), "yyyy-MM-dd", { locale: zhCN })}
                    </TableCell>
                    <TableCell>
                      {format(new Date(inquiry.createdAt), "yyyy-MM-dd HH:mm", { locale: zhCN })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(inquiry.id)}
                          title="查看详情"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusEdit(inquiry)}
                          title="修改状态"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="删除询盘"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>确认删除询盘</AlertDialogTitle>
                              <AlertDialogDescription>
                                此操作将删除询盘 "{inquiry.inquiryNo}"，该操作无法撤销。确定要继续吗？
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(inquiry.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                确认删除
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              共 {totalItems} 条记录，第 {currentPage} / {totalPages} 页
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
              >
                上一页
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
              >
                下一页
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* 状态修改对话框 */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>修改询盘状态</DialogTitle>
            <DialogDescription>
              修改询盘 "{editingInquiry?.inquiryNo}" 的状态
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
                  {Object.entries(statusMap).map(([value, { label }]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 报价状态的额外字段 */}
            {newStatus === "quoted" && (
              <>
                <div>
                  <Label htmlFor="quotePrice">报价总额 (元) *</Label>
                  <Input
                    id="quotePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={quotePrice}
                    onChange={(e) => setQuotePrice(e.target.value)}
                    placeholder="请输入报价总额"
                  />
                </div>
                <div>
                  <Label htmlFor="quoteValidUntil">报价有效期 *</Label>
                  <Input
                    id="quoteValidUntil"
                    type="date"
                    value={quoteValidUntil}
                    onChange={(e) => setQuoteValidUntil(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="supplierRemarks">供应商备注</Label>
                  <Textarea
                    id="supplierRemarks"
                    value={supplierRemarks}
                    onChange={(e) => setSupplierRemarks(e.target.value)}
                    placeholder="请输入供应商备注信息"
                    rows={3}
                  />
                </div>
              </>
            )}

            {/* 拒绝状态的额外字段 */}
            {newStatus === "declined" && (
              <div>
                <Label htmlFor="declineReason">拒绝原因 *</Label>
                <Textarea
                  id="declineReason"
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="请输入拒绝原因"
                  rows={3}
                />
              </div>
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
                (newStatus === "quoted" && (!quotePrice || !quoteValidUntil)) ||
                (newStatus === "declined" && !declineReason)
              }
            >
              确认修改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}