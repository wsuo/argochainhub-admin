"use client"

import { useParams, useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, FileText, Package, Building2, User, Phone, Calendar, MapPin } from "lucide-react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { useInquiry } from "@/hooks/use-api"

interface InquiryDetail {
  id: number
  inquiryNo: string
  status: string
  details: {
    deliveryLocation: string
    tradeTerms: string
    paymentMethod: string
    buyerRemarks: string
    declineReason?: string
    declinedBy?: string
  }
  quoteDetails?: {
    totalPrice: number
    validUntil: string
    supplierRemarks: string
  }
  deadline: string
  buyer: {
    id: number
    name: string
    contactPerson: string
    contactPhone: string
  }
  supplier: {
    id: number
    name: string
    contactPerson: string
    contactPhone: string
  }
  items: Array<{
    id: number
    quantity: number
    unit: string
    packagingReq?: string
    product: {
      id: number
      name: {
        zh: string
        en: string
      }
    }
    productSnapshot: {
      name: {
        zh: string
        en: string
      }
      pesticideName: {
        zh: string
        en: string
      }
      formulation: string
      activeIngredient1: {
        name: {
          zh: string
          en: string
        }
        content: string
      }
    }
  }>
  createdAt: string
  updatedAt: string
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "success" | "destructive" | "outline" }> = {
  pending_quote: { label: "待报价", variant: "default" },
  quoted: { label: "已报价", variant: "secondary" },
  confirmed: { label: "已确认", variant: "success" },
  declined: { label: "已拒绝", variant: "destructive" },
  expired: { label: "已过期", variant: "outline" },
  cancelled: { label: "已取消", variant: "outline" }
}


export default function InquiryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const inquiryId = Number(params.id)

  // 使用统一的API hooks
  const { data: inquiry, isLoading, error } = useInquiry(inquiryId)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">加载中...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-red-500">加载失败，请重试</div>
        </CardContent>
      </Card>
    )
  }

  if (!inquiry) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">询盘不存在</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 头部信息 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回
              </Button>
              <CardTitle>询盘详情</CardTitle>
              <Badge variant={statusMap[inquiry.status]?.variant || "default"}>
                {statusMap[inquiry.status]?.label || inquiry.status}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              询盘编号：{inquiry.inquiryNo}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 基本信息 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 买方信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              买方信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground">公司名称</div>
              <div className="font-medium">{inquiry.buyer.name['zh-CN']}</div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" />
                  联系人
                </div>
                <div>{inquiry.buyer.contactPerson}</div>
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  联系电话
                </div>
                <div>{inquiry.buyer.contactPhone}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 供应商信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              供应商信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground">公司名称</div>
              <div className="font-medium">{inquiry.supplier.name['zh-CN']}</div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" />
                  联系人
                </div>
                <div>{inquiry.supplier.contactPerson}</div>
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  联系电话
                </div>
                <div>{inquiry.supplier.contactPhone}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 询价详情 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            询价详情
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                交货地点
              </div>
              <div className="font-medium">{inquiry.details.deliveryLocation}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">贸易条款</div>
              <div className="font-medium">{inquiry.details.tradeTerms}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">付款方式</div>
              <div className="font-medium">{inquiry.details.paymentMethod}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                报价截止日期
              </div>
              <div className="font-medium">
                {format(new Date(inquiry.deadline), "yyyy年MM月dd日", { locale: zhCN })}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">创建时间</div>
              <div className="font-medium">
                {format(new Date(inquiry.createdAt), "yyyy年MM月dd日 HH:mm", { locale: zhCN })}
              </div>
            </div>
          </div>

          {inquiry.details.buyerRemarks && (
            <div>
              <div className="text-sm text-muted-foreground mb-1">买方备注</div>
              <div className="bg-muted/50 p-3 rounded-md text-sm">
                {inquiry.details.buyerRemarks}
              </div>
            </div>
          )}

          {inquiry.details.declineReason && (
            <div className="mt-4">
              <div className="text-sm text-muted-foreground mb-1">拒绝原因</div>
              <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                {inquiry.details.declinedBy === "buyer" ? "买方" : "供应商"}拒绝：{inquiry.details.declineReason}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 报价信息 */}
      {inquiry.quoteDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">报价信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-sm text-muted-foreground">报价总额</div>
                <div className="font-medium text-lg">¥{inquiry.quoteDetails.totalPrice.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">报价有效期</div>
                <div className="font-medium">
                  {format(new Date(inquiry.quoteDetails.validUntil), "yyyy年MM月dd日", { locale: zhCN })}
                </div>
              </div>
            </div>
            
            {inquiry.quoteDetails.supplierRemarks && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">供应商备注</div>
                <div className="bg-muted/50 p-3 rounded-md text-sm">
                  {inquiry.quoteDetails.supplierRemarks}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 产品列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5" />
            询价产品列表
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>产品名称</TableHead>
                  <TableHead>农药名称</TableHead>
                  <TableHead>剂型</TableHead>
                  <TableHead>有效成分</TableHead>
                  <TableHead>数量</TableHead>
                  <TableHead>包装要求</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(inquiry.items || []).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.productSnapshot.name?.['zh-CN']}</div>
                        <div className="text-sm text-muted-foreground">{item.productSnapshot.name?.en}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{item.productSnapshot.pesticideName?.['zh-CN'] || '-'}</div>
                        <div className="text-sm text-muted-foreground">{item.productSnapshot.pesticideName?.en || '-'}</div>
                      </div>
                    </TableCell>
                    <TableCell>{item.productSnapshot.formulation || '-'}</TableCell>
                    <TableCell>
                      <div>
                        <div>{item.productSnapshot.activeIngredient1?.name?.['zh-CN'] || '-'}</div>
                        <div className="text-sm text-muted-foreground">{item.productSnapshot.activeIngredient1?.content || '-'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.quantity} {item.unit}
                    </TableCell>
                    <TableCell>{item.packagingReq || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}