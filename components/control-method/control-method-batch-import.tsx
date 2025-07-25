'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Upload, Plus, X, Target } from 'lucide-react'
import type { BatchCreateControlMethodsRequest } from '@/lib/types'
import { useBatchCreateControlMethods } from '@/hooks/use-api'

// 单个防治方法的验证schema
const singleMethodSchema = z.object({
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

// 批量导入表单验证schema
const batchFormSchema = z.object({
  methods: z.array(singleMethodSchema).min(1, '至少需要添加一个防治方法'),
})

type BatchFormValues = z.infer<typeof batchFormSchema>

export interface ControlMethodBatchImportProps {
  productId: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ControlMethodBatchImport({
  productId,
  open,
  onOpenChange
}: ControlMethodBatchImportProps) {
  const [csvInput, setCsvInput] = useState('')
  const batchCreateMutation = useBatchCreateControlMethods()

  const form = useForm<BatchFormValues>({
    resolver: zodResolver(batchFormSchema),
    defaultValues: {
      methods: [
        {
          target: { 'zh-CN': '', 'en': '' },
          pestDisease: { 'zh-CN': '', 'en': '' },
          method: { 'zh-CN': '', 'en': '' },
          dosage: { 'zh-CN': '', 'en': '' },
          remarks: '',
        }
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'methods',
  })

  const addMethod = () => {
    append({
      target: { 'zh-CN': '', 'en': '' },
      pestDisease: { 'zh-CN': '', 'en': '' },
      method: { 'zh-CN': '', 'en': '' },
      dosage: { 'zh-CN': '', 'en': '' },
      remarks: '',
    })
  }

  const parseCsvAndFillForm = () => {
    if (!csvInput.trim()) return

    try {
      const lines = csvInput.trim().split('\n')
      const methods = lines.map(line => {
        const columns = line.split(',').map(col => col.trim().replace(/^"(.*)"$/, '$1'))
        
        // CSV格式: 防治对象(中),防治对象(英),防治病虫害(中),防治病虫害(英),使用方法(中),使用方法(英),用药量(中),用药量(英),备注
        if (columns.length < 7) {
          throw new Error('CSV格式不正确，至少需要7列数据')
        }

        return {
          target: {
            'zh-CN': columns[0] || '',
            'en': columns[1] || '',
          },
          pestDisease: {
            'zh-CN': columns[2] || '',
            'en': columns[3] || '',
          },
          method: {
            'zh-CN': columns[4] || '',
            'en': columns[5] || '',
          },
          dosage: {
            'zh-CN': columns[6] || '',
            'en': columns[7] || '',
          },
          remarks: columns[8] || '',
        }
      })

      form.setValue('methods', methods)
      setCsvInput('')
    } catch (error) {
      console.error('CSV解析失败:', error)
      // 这里可以添加toast错误提示
    }
  }

  const onSubmit = async (values: BatchFormValues) => {
    try {
      // 转换表单数据为API格式
      const controlMethods = values.methods.map(method => ({
        productId,
        targetCrop: method.target,
        pestDisease: method.pestDisease,
        applicationMethod: method.method,
        dosage: method.dosage,
        remarks: method.remarks || undefined,
      }))

      const batchData: BatchCreateControlMethodsRequest = {
        controlMethods
      }

      await batchCreateMutation.mutateAsync({
        productId,
        data: batchData
      })

      onOpenChange(false)
      form.reset()
      setCsvInput('')
    } catch (error) {
      console.error('Batch create failed:', error)
    }
  }

  const handleClose = () => {
    form.reset()
    setCsvInput('')
    onOpenChange(false)
  }

  const isLoading = batchCreateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            批量导入防治方法
          </DialogTitle>
          <DialogDescription>
            一次性添加多个防治方法，支持手动输入和CSV导入
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* CSV导入区域 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">CSV数据导入</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  CSV数据格式 (每行一个防治方法)
                </label>
                <div className="text-xs text-muted-foreground mt-1 mb-2">
                  格式: 防治对象(中),防治对象(英),防治病虫害(中),防治病虫害(英),使用方法(中),使用方法(英),用药量(中),用药量(英),备注
                </div>
                <Textarea
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                  placeholder={`示例:
水稻,Rice,蚜虫,Aphids,叶面喷雾,Foliar spray,1000-1500倍液,1000-1500 times dilution,注意避开花期
玉米,Corn,红蜘蛛,Spider mites,均匀喷雾,Uniform spray,800-1000倍液,800-1000 times dilution,高温时段避免使用`}
                  rows={4}
                />
              </div>
              <Button onClick={parseCsvAndFillForm} disabled={!csvInput.trim()}>
                <Upload className="h-4 w-4 mr-2" />
                解析CSV数据
              </Button>
            </CardContent>
          </Card>

          {/* 手动输入表单 */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">防治方法列表</h3>
                <Button type="button" onClick={addMethod} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  添加防治方法
                </Button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          防治方法 {index + 1}
                        </CardTitle>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => remove(index)}
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* 防治对象 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`methods.${index}.target.zh-CN`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>防治对象(中文) *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="例如: 水稻" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`methods.${index}.target.en`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>防治对象(英文)</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="例如: Rice" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* 防治病虫害 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`methods.${index}.pestDisease.zh-CN`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>防治病虫害(中文) *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="例如: 蚜虫" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`methods.${index}.pestDisease.en`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>防治病虫害(英文)</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="例如: Aphids" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* 使用方法 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`methods.${index}.method.zh-CN`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>使用方法(中文) *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="例如: 叶面喷雾" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`methods.${index}.method.en`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>使用方法(英文)</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="例如: Foliar spray" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* 用药量 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`methods.${index}.dosage.zh-CN`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>用药量(中文) *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="例如: 1000-1500倍液" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`methods.${index}.dosage.en`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>用药量(英文)</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="例如: 1000-1500 times dilution" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* 备注 */}
                      <FormField
                        control={form.control}
                        name={`methods.${index}.remarks`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>备注</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="使用注意事项..." 
                                rows={2}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                  取消
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <Upload className="h-4 w-4 mr-2" />
                  {isLoading ? '导入中...' : `批量导入 (${fields.length} 个)`}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}