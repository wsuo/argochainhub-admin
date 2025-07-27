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
import { Loader2, ArrowLeft, CheckCircle, XCircle, Clock, FileText, Globe, DollarSign, Calendar, Package } from "lucide-react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { 
  useRegistrationRequest, 
  useUpdateRegistrationRequestStatus, 
  useDeleteRegistrationRequest 
} from "@/hooks/use-api"

// 登记申请状态枚举
const REGISTRATION_STATUS = {
  pending_response: { label: "待回复", color: "warning", icon: Clock },
  in_progress: { label: "进行中", color: "info", icon: FileText },
  completed: { label: "已完成", color: "success", icon: CheckCircle },
  declined: { label: "已拒绝", color: "destructive", icon: XCircle },
  cancelled: { label: "已取消", color: "secondary", icon: XCircle },
}

export default function RegistrationRequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [statusDialog, setStatusDialog] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>("")
  const [statusNote, setStatusNote] = useState("")

  // 使用统一的API hooks
  const { data: registrationRequest, isLoading } = useRegistrationRequest(id)
  const updateStatusMutation = useUpdateRegistrationRequestStatus()
  const deleteMutation = useDeleteRegistrationRequest()

  const resetForm = () => {
    setSelectedStatus("")
    setStatusNote("")
  }

  const handleStatusUpdate = () => {
    updateStatusMutation.mutate(
      { 
        id, 
        data: {
          status: selectedStatus,
          statusNote,
          operatedBy: "admin", // TODO: 从当前用户获取
        }
      },
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
        router.push("/business/registrations")
      },
    })
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

  // 检查是否可以删除
  const canDelete = (status: string) => {
    return status === "pending_response" || status === "cancelled"
  }

  // 格式化金额
  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!registrationRequest) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">登记申请不存在</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/business/registrations")}
        >
          返回列表
        </Button>
      </div>
    )
  }

  const currentStatus = REGISTRATION_STATUS[registrationRequest.status as keyof typeof REGISTRATION_STATUS]
  const StatusIcon = currentStatus?.icon || FileText

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/business/registrations")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回列表
          </Button>
          <h1 className="text-2xl font-bold">登记申请详情</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedStatus(registrationRequest.status)
              setStatusDialog(true)
            }}
          >
            更新状态
          </Button>
          {canDelete(registrationRequest.status) && (
            <Button
              variant="destructive"
              onClick={() => setDeleteDialog(true)}
            >
              删除申请
            </Button>
          )}
        </div>
      </div>

      {/* 基本信息 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>基本信息</CardTitle>
            <div className="flex items-center gap-2">
              <StatusIcon className="h-5 w-5" />
              <Badge variant={getStatusBadgeVariant(currentStatus?.color)}>
                {currentStatus?.label}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-muted-foreground">申请单号</div>
              <div className="font-medium">{registrationRequest.regReqNo}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">目标国家</div>
              <div className="font-medium flex items-center gap-2">
                <Globe className="h-4 w-4" />
                {registrationRequest.details.targetCountry}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">独家代理</div>
              <div className="font-medium">
                {registrationRequest.details.isExclusive ? "是" : "否"}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">时间期限</div>
              <div className="font-medium">{registrationRequest.details.timeline}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">预算</div>
              <div className="font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                {formatAmount(registrationRequest.details.budget.amount, registrationRequest.details.budget.currency)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">截止日期</div>
              <div className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {format(new Date(registrationRequest.deadline), "yyyy年MM月dd日", { locale: zhCN })}
              </div>
            </div>
            {registrationRequest.createdAt && (
              <div>
                <div className="text-sm text-muted-foreground">创建时间</div>
                <div className="font-medium">
                  {format(new Date(registrationRequest.createdAt), "yyyy年MM月dd日 HH:mm", { locale: zhCN })}
                </div>
              </div>
            )}
            {registrationRequest.updatedAt && (
              <div>
                <div className="text-sm text-muted-foreground">更新时间</div>
                <div className="font-medium">
                  {format(new Date(registrationRequest.updatedAt), "yyyy年MM月dd日 HH:mm", { locale: zhCN })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 登记要求 */}
      <Card>
        <CardHeader>
          <CardTitle>登记要求</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground mb-2">所需文件</div>
            <div className="flex flex-wrap gap-2">
              {registrationRequest.details.docReqs.map((doc, index) => (
                <Badge key={index} variant="secondary">
                  {doc}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground mb-2">样品需求</div>
            {registrationRequest.details.sampleReq.needed ? (
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span>
                  需要样品：{registrationRequest.details.sampleReq.quantity} {registrationRequest.details.sampleReq.unit}
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground">不需要样品</span>
            )}
          </div>

          {registrationRequest.details.additionalRequirements && (
            <div>
              <div className="text-sm text-muted-foreground mb-2">其他要求</div>
              <div className="bg-muted/50 p-4 rounded-md">
                {registrationRequest.details.additionalRequirements}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 产品信息 */}
      <Card>
        <CardHeader>
          <CardTitle>产品信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-muted-foreground">产品名称</div>
              <div className="font-medium">{registrationRequest.productSnapshot.name}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">产品分类</div>
              <div className="font-medium">{registrationRequest.productSnapshot.category}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">剂型</div>
              <div className="font-medium">{registrationRequest.productSnapshot.formulation}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">有效成分</div>
              <div className="font-medium">{registrationRequest.productSnapshot.activeIngredient}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">含量</div>
              <div className="font-medium">{registrationRequest.productSnapshot.content}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">产品链接</div>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0"
                onClick={() => router.push(`/content/products/${registrationRequest.product.id}`)}
              >
                查看产品详情
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 企业信息 */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>买方企业</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">企业名称</div>
                <div className="font-medium">{registrationRequest.buyer.name["zh-CN"]}</div>
                {registrationRequest.buyer.name.en && (
                  <div className="text-sm text-muted-foreground">{registrationRequest.buyer.name.en}</div>
                )}
              </div>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0"
                onClick={() => router.push(`/enterprises/${registrationRequest.buyer.id}`)}
              >
                查看企业详情
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>供应商企业</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">企业名称</div>
                <div className="font-medium">{registrationRequest.supplier.name["zh-CN"]}</div>
                {registrationRequest.supplier.name.en && (
                  <div className="text-sm text-muted-foreground">{registrationRequest.supplier.name.en}</div>
                )}
              </div>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0"
                onClick={() => router.push(`/enterprises/${registrationRequest.supplier.id}`)}
              >
                查看企业详情
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 状态更新对话框 */}
      <Dialog open={statusDialog} onOpenChange={setStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>更新登记申请状态</DialogTitle>
            <DialogDescription>
              当前状态：{currentStatus?.label}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">新状态</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="选择新状态" />
                </SelectTrigger>
                <SelectContent>
                  {registrationRequest.status === "pending_response" && (
                    <>
                      <SelectItem value="in_progress">进行中</SelectItem>
                      <SelectItem value="declined">已拒绝</SelectItem>
                      <SelectItem value="cancelled">已取消</SelectItem>
                    </>
                  )}
                  {registrationRequest.status === "in_progress" && (
                    <>
                      <SelectItem value="completed">已完成</SelectItem>
                      <SelectItem value="declined">已拒绝</SelectItem>
                      <SelectItem value="cancelled">已取消</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="statusNote">
                {selectedStatus === "declined" ? "拒绝原因" : "状态说明"}
              </Label>
              <Textarea
                id="statusNote"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder={selectedStatus === "declined" ? "请输入拒绝原因..." : "请输入状态说明（可选）..."}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialog(false)}>
              取消
            </Button>
            <Button 
              onClick={handleStatusUpdate}
              disabled={!selectedStatus || updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
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