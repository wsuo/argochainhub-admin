"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Loader2, ArrowLeft, Check, X, Truck, Package } from "lucide-react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { 
  useSampleRequest, 
  useUpdateSampleRequestStatus, 
  useDeleteSampleRequest 
} from "@/hooks/use-api"

// 样品申请状态枚举
const SAMPLE_STATUS = {
  pending_approval: { label: "待审核", color: "warning", icon: Package },
  approved: { label: "已批准", color: "success", icon: Check },
  shipped: { label: "已发货", color: "info", icon: Truck },
  delivered: { label: "已送达", color: "default", icon: Package },
  rejected: { label: "已拒绝", color: "destructive", icon: X },
  cancelled: { label: "已取消", color: "secondary", icon: X },
}

export default function SampleRequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [statusDialog, setStatusDialog] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>("")
  const [rejectReason, setRejectReason] = useState("")
  const [trackingCarrier, setTrackingCarrier] = useState("")
  const [trackingNumber, setTrackingNumber] = useState("")

  // 使用统一的API hooks
  const { data: sampleRequest, isLoading } = useSampleRequest(id)
  const updateStatusMutation = useUpdateSampleRequestStatus()
  const deleteMutation = useDeleteSampleRequest()

  const resetForm = () => {
    setSelectedStatus("")
    setRejectReason("")
    setTrackingCarrier("")
    setTrackingNumber("")
  }

  const handleStatusUpdate = () => {
    const data: any = {
      status: selectedStatus,
      operatedBy: "admin", // TODO: 从当前用户获取
    }

    if (selectedStatus === "rejected" && rejectReason) {
      data.rejectReason = rejectReason
    }

    if (selectedStatus === "shipped" && trackingCarrier && trackingNumber) {
      data.trackingInfo = {
        carrier: trackingCarrier,
        trackingNumber: trackingNumber,
      }
    }

    updateStatusMutation.mutate(
      { id, data },
      {
        onSuccess: () => {
          setStatusDialog(false)
          resetForm()
        },
      }
    )
  }

  const handleDelete = () => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        router.push("/business/sample-requests")
      },
    })
  }

  const getStatusBadge = (status: keyof typeof SAMPLE_STATUS) => {
    const statusInfo = SAMPLE_STATUS[status]
    const Icon = statusInfo.icon
    return (
      <Badge variant={statusInfo.color as any} className="gap-1">
        <Icon className="h-3 w-3" />
        {statusInfo.label}
      </Badge>
    )
  }

  // 判断是否可以删除
  const canDelete = sampleRequest?.status === "pending_approval" || 
                   sampleRequest?.status === "cancelled"

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!sampleRequest) {
    return (
      <div className="text-center py-8">
        <p>样品申请不存在</p>
        <Button onClick={() => router.back()} className="mt-4">
          返回
        </Button>
      </div>
    )
  }

  const availableTransitions = getAvailableStatusTransitions(sampleRequest.status)

  return (
    <div className="space-y-6">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </Button>
        <div className="flex gap-2">
          {availableTransitions.length > 0 && (
            <Button onClick={() => setStatusDialog(true)}>
              更新状态
            </Button>
          )}
          {canDelete && (
            <Button
              variant="destructive"
              onClick={() => setDeleteDialog(true)}
            >
              删除
            </Button>
          )}
        </div>
      </div>

      {/* 基本信息 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>样品申请详情</CardTitle>
            {getStatusBadge(sampleRequest.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">申请单号</Label>
              <p className="font-medium">{sampleRequest.sampleReqNo}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">申请时间</Label>
              <p className="font-medium">
                {format(new Date(sampleRequest.createdAt), "yyyy-MM-dd HH:mm", {
                  locale: zhCN,
                })}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">截止日期</Label>
              <p className="font-medium">
                {format(new Date(sampleRequest.deadline), "yyyy-MM-dd", {
                  locale: zhCN,
                })}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">更新时间</Label>
              <p className="font-medium">
                {format(new Date(sampleRequest.updatedAt), "yyyy-MM-dd HH:mm", {
                  locale: zhCN,
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 企业信息 */}
      <Card>
        <CardHeader>
          <CardTitle>企业信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">采购商</Label>
              <p className="font-medium">{sampleRequest.buyer.name["zh-CN"]}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">供应商</Label>
              <p className="font-medium">{sampleRequest.supplier.name["zh-CN"]}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 产品信息 */}
      <Card>
        <CardHeader>
          <CardTitle>产品信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">产品名称</Label>
              <p className="font-medium">{sampleRequest.product.name["zh-CN"]}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">含量</Label>
              <p className="font-medium">{sampleRequest.productSnapshot.content}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">类别</Label>
              <p className="font-medium">{sampleRequest.productSnapshot.category}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">剂型</Label>
              <p className="font-medium">{sampleRequest.productSnapshot.formulation}</p>
            </div>
            <div className="col-span-2">
              <Label className="text-muted-foreground">有效成分</Label>
              <p className="font-medium">{sampleRequest.productSnapshot.activeIngredient}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 样品申请详情 */}
      <Card>
        <CardHeader>
          <CardTitle>申请详情</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">申请数量</Label>
              <p className="font-medium">
                {sampleRequest.quantity} {sampleRequest.unit}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">配送方式</Label>
              <p className="font-medium">{sampleRequest.details.shippingMethod}</p>
            </div>
            <div className="col-span-2">
              <Label className="text-muted-foreground">收货地址</Label>
              <p className="font-medium">{sampleRequest.details.shippingAddress}</p>
            </div>
            <div className="col-span-2">
              <Label className="text-muted-foreground">用途说明</Label>
              <p className="font-medium">{sampleRequest.details.purpose}</p>
            </div>
            {sampleRequest.details.willingnessToPay && (
              <div>
                <Label className="text-muted-foreground">付费意愿</Label>
                <p className="font-medium">
                  {sampleRequest.details.willingnessToPay.paid 
                    ? `愿意支付 ¥${sampleRequest.details.willingnessToPay.amount}`
                    : "不愿意付费"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 物流信息 */}
      {sampleRequest.trackingInfo && (
        <Card>
          <CardHeader>
            <CardTitle>物流信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">物流公司</Label>
                <p className="font-medium">{sampleRequest.trackingInfo.carrier}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">物流单号</Label>
                <p className="font-medium">{sampleRequest.trackingInfo.trackingNumber}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 状态更新对话框 */}
      <Dialog open={statusDialog} onOpenChange={setStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>更新状态</DialogTitle>
            <DialogDescription>
              选择新的状态并填写相关信息
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>新状态</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  {availableTransitions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {SAMPLE_STATUS[status as keyof typeof SAMPLE_STATUS].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedStatus === "rejected" && (
              <div>
                <Label>拒绝原因</Label>
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="请输入拒绝原因..."
                />
              </div>
            )}

            {selectedStatus === "shipped" && (
              <>
                <div>
                  <Label>物流公司</Label>
                  <Input
                    value={trackingCarrier}
                    onChange={(e) => setTrackingCarrier(e.target.value)}
                    placeholder="如：德邦快递"
                  />
                </div>
                <div>
                  <Label>物流单号</Label>
                  <Input
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="请输入物流单号"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialog(false)}>
              取消
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={
                !selectedStatus ||
                (selectedStatus === "shipped" && (!trackingCarrier || !trackingNumber))
              }
            >
              确认更新
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这个样品申请吗？此操作不可恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}