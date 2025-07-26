'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

// 表单验证schema
const batchReviewFormSchema = z.object({
  reason: z.string().min(1, '审核理由不能为空'),
})

type BatchReviewFormValues = z.infer<typeof batchReviewFormSchema>

export interface BatchReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: string) => void
  loading: boolean
  approved: boolean
  selectedCount: number
}

export function BatchReviewDialog({
  open,
  onOpenChange,
  onConfirm,
  loading,
  approved,
  selectedCount
}: BatchReviewDialogProps) {
  const form = useForm<BatchReviewFormValues>({
    resolver: zodResolver(batchReviewFormSchema),
    defaultValues: {
      reason: approved 
        ? '产品信息完整，符合平台规范，批准上架' 
        : '产品信息不完整或不符合规范，需要修改后重新提交'
    },
  })

  const onSubmit = async (values: BatchReviewFormValues) => {
    await onConfirm(values.reason)
    form.reset()
  }

  const handleClose = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {approved ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            批量{approved ? '通过' : '拒绝'}审核
          </DialogTitle>
          <DialogDescription>
            即将{approved ? '通过' : '拒绝'} {selectedCount} 个产品的审核，请填写审核理由
          </DialogDescription>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            此操作将同时处理所选的 {selectedCount} 个产品
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>审核理由 *</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder={approved 
                        ? "请说明通过审核的理由..." 
                        : "请说明拒绝审核的理由..."
                      }
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={loading}>
                取消
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className={approved 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-red-600 hover:bg-red-700"
                }
              >
                {approved ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                {loading 
                  ? '处理中...' 
                  : `确认${approved ? '通过' : '拒绝'} (${selectedCount} 个)`
                }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}