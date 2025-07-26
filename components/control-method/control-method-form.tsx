'use client'

import { useEffect } from 'react'
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Target, Save } from 'lucide-react'
import type { ControlMethod, CreateControlMethodRequest, UpdateControlMethodRequest } from '@/lib/types'
import { useCreateControlMethod, useUpdateControlMethod } from '@/hooks/use-api'

// 表单验证schema
const controlMethodFormSchema = z.object({
  target: z.object({
    'zh-CN': z.string().min(1, '中文防治对象不能为空'),
    'en': z.string().optional(),
  }),
  pestDisease: z.object({
    'zh-CN': z.string().min(1, '中文防治病虫害不能为空'),
    'en': z.string().optional(),
  }),
  method: z.object({
    'zh-CN': z.string().min(1, '中文使用方法不能为空'),
    'en': z.string().optional(),
  }),
  dosage: z.object({
    'zh-CN': z.string().min(1, '中文用药量不能为空'),
    'en': z.string().optional(),
  }),
  remarks: z.string().optional(),
})

type ControlMethodFormValues = z.infer<typeof controlMethodFormSchema>

export interface ControlMethodFormProps {
  productId: number
  method?: ControlMethod | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ControlMethodForm({
  productId,
  method,
  open,
  onOpenChange
}: ControlMethodFormProps) {
  const isEdit = !!method
  const createMutation = useCreateControlMethod()
  const updateMutation = useUpdateControlMethod()

  const form = useForm<ControlMethodFormValues>({
    resolver: zodResolver(controlMethodFormSchema),
    defaultValues: {
      target: { 'zh-CN': '', 'en': '' },
      pestDisease: { 'zh-CN': '', 'en': '' },
      method: { 'zh-CN': '', 'en': '' },
      dosage: { 'zh-CN': '', 'en': '' },
      remarks: '',
    },
  })

  // 当编辑模式时，更新表单数据
  useEffect(() => {
    if (method && open) {
      const getMultiLangText = (text: any, lang: 'zh-CN' | 'en' = 'zh-CN'): string => {
        if (!text) return ''
        if (typeof text === 'string') return text
        return text[lang] || ''
      }

      form.reset({
        target: {
          'zh-CN': getMultiLangText(method.targetCrop, 'zh-CN'),
          'en': getMultiLangText(method.targetCrop, 'en'),
        },
        pestDisease: {
          'zh-CN': getMultiLangText(method.pestDisease, 'zh-CN'),
          'en': getMultiLangText(method.pestDisease, 'en'),
        },
        method: {
          'zh-CN': getMultiLangText(method.applicationMethod, 'zh-CN'),
          'en': getMultiLangText(method.applicationMethod, 'en'),
        },
        dosage: {
          'zh-CN': getMultiLangText(method.dosage, 'zh-CN'),
          'en': getMultiLangText(method.dosage, 'en'),
        },
        remarks: method.remarks || '',
      })
    } else if (!method && open) {
      // 新建模式，重置表单
      form.reset({
        target: { 'zh-CN': '', 'en': '' },
        pestDisease: { 'zh-CN': '', 'en': '' },
        method: { 'zh-CN': '', 'en': '' },
        dosage: { 'zh-CN': '', 'en': '' },
        remarks: '',
      })
    }
  }, [method, open, form])

  const onSubmit = async (values: ControlMethodFormValues) => {
    try {
      if (isEdit && method) {
        // 更新防治方法
        const updateData: UpdateControlMethodRequest = {
          targetCrop: values.target,
          pestDisease: values.pestDisease,
          applicationMethod: values.method,
          dosage: values.dosage,
          remarks: values.remarks || undefined,
        }

        await updateMutation.mutateAsync({
          id: method.id,
          data: updateData
        })
      } else {
        // 创建防治方法
        const createData: CreateControlMethodRequest = {
          productId,
          targetCrop: values.target,
          pestDisease: values.pestDisease,
          applicationMethod: values.method,
          dosage: values.dosage,
          remarks: values.remarks || undefined,
        }

        await createMutation.mutateAsync({
          productId,
          data: createData
        })
      }

      onOpenChange(false)
    } catch (error) {
      // 错误处理由hooks中的toast处理
      console.error('Save control method failed:', error)
    }
  }

  const handleClose = () => {
    form.reset()
    onOpenChange(false)
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {isEdit ? '编辑防治方法' : '添加防治方法'}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? '修改防治方法的详细信息' : '为产品添加新的防治方法'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* 防治对象 */}
            <div className="space-y-4">
              <h4 className="font-medium">防治对象</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="target.zh-CN"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>中文名称 *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="例如: 水稻" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="target.en"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>英文名称</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="例如: Rice" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 防治病虫害 */}
            <div className="space-y-4">
              <h4 className="font-medium">防治病虫害</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="pestDisease.zh-CN"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>中文名称 *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="例如: 蚜虫" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pestDisease.en"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>英文名称</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="例如: Aphids" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 使用方法 */}
            <div className="space-y-4">
              <h4 className="font-medium">使用方法</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="method.zh-CN"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>中文描述 *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="例如: 叶面喷雾" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="method.en"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>英文描述</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="例如: Foliar spray" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 用药量 */}
            <div className="space-y-4">
              <h4 className="font-medium">用药量</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dosage.zh-CN"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>中文描述 *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="例如: 1000-1500倍液" />
                      </FormControl>
                      <FormDescription>
                        稀释倍数或具体用量
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dosage.en"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>英文描述</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="例如: 1000-1500 times dilution" />
                      </FormControl>
                      <FormDescription>
                        Dilution ratio or specific dosage
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 备注 */}
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>备注</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="其他需要说明的使用注意事项..." 
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    可以补充说明使用条件、注意事项等
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                取消
              </Button>
              <Button type="submit" disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? (isEdit ? '保存中...' : '创建中...') : (isEdit ? '保存更改' : '创建防治方法')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}