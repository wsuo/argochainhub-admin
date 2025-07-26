"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, RotateCcw } from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { useInquiries } from "@/hooks/use-api"
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
  
  // 构建查询参数
  const query: InquiryQuery = {
    page: currentPage,
    limit: pageSize,
    ...(searchKeyword && { inquiryNo: searchKeyword }),
    ...(selectedStatus !== "all" && { status: selectedStatus }),
  }
  
  // 使用统一的API hooks
  const { data, isLoading, error } = useInquiries(query)
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>询盘管理</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 筛选条件 */}
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="搜索询盘编号、买方或供应商名称"
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetail(inquiry.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        查看
                      </Button>
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
                disabled={currentPage === 1 || loading}
              >
                上一页
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
              >
                下一页
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}