'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon, Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  usePriceTrend, 
  useCreatePriceTrend, 
  useUpdatePriceTrend 
} from '@/hooks/use-api'
import type { CreatePriceTrendRequest, UpdatePriceTrendRequest } from '@/lib/types'

const priceTrendFormSchema = z.object({
  weekEndDate: z.date({
    required_error: '请选择周结束日期',
  }),
  unitPrice: z.string()
    .min(1, '请输入单价')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: '请输入有效的价格',
    }),
  exchangeRate: z.string()
    .min(1, '请输入汇率')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: '请输入有效的汇率',
    }),
})

type PriceTrendFormValues = z.infer<typeof priceTrendFormSchema>

interface PriceTrendDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pesticideId: number
  priceTrendId?: number | null
}

export function PriceTrendDialog({
  open,
  onOpenChange,
  pesticideId,
  priceTrendId
}: PriceTrendDialogProps) {
  const isEdit = !!priceTrendId
  
  const { data: priceTrend } = usePriceTrend(priceTrendId || 0)
  const createMutation = useCreatePriceTrend()
  const updateMutation = useUpdatePriceTrend()
  
  const form = useForm<PriceTrendFormValues>({
    resolver: zodResolver(priceTrendFormSchema),
    defaultValues: {
      weekEndDate: new Date(),
      unitPrice: '',
      exchangeRate: '7.2100',
    },
  })
  
  useEffect(() => {
    if (priceTrend && isEdit) {
      form.reset({
        weekEndDate: new Date(priceTrend.weekEndDate),
        unitPrice: priceTrend.unitPrice.toString(),
        exchangeRate: priceTrend.exchangeRate.toString(),
      })
    } else if (!isEdit) {
      form.reset({
        weekEndDate: new Date(),
        unitPrice: '',
        exchangeRate: '7.2100',
      })
    }
  }, [priceTrend, isEdit, form])
  
  const handleSubmit = async (values: PriceTrendFormValues) => {
    try {
      if (isEdit && priceTrendId) {
        const data: UpdatePriceTrendRequest = {
          weekEndDate: format(values.weekEndDate, 'yyyy-MM-dd'),
          unitPrice: parseFloat(values.unitPrice),
          exchangeRate: parseFloat(values.exchangeRate),
        }
        await updateMutation.mutateAsync({ id: priceTrendId, data })
      } else {
        const data: CreatePriceTrendRequest = {
          pesticideId,
          weekEndDate: format(values.weekEndDate, 'yyyy-MM-dd'),
          unitPrice: parseFloat(values.unitPrice),
          exchangeRate: parseFloat(values.exchangeRate),
        }
        await createMutation.mutateAsync(data)
      }
      onOpenChange(false)
      form.reset()
    } catch (error) {
      // 错误已由mutation处理
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑价格记录' : '新增价格记录'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '修改价格走势记录信息' : '添加新的价格走势记录'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* 周结束日期 */}
            <FormField
              control={form.control}
              name="weekEndDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>周结束日期</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "yyyy-MM-dd")
                          ) : (
                            <span>选择日期</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    选择价格数据对应的周结束日期
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 人民币单价 */}
            <FormField
              control={form.control}
              name="unitPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>人民币单价</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        ¥
                      </span>
                      <Input 
                        {...field} 
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-8"
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    输入农药的人民币单价
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 汇率 */}
            <FormField
              control={form.control}
              name="exchangeRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>汇率</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number"
                      step="0.0001"
                      placeholder="7.2100"
                    />
                  </FormControl>
                  <FormDescription>
                    人民币对美元汇率（1美元 = ?人民币）
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 美元单价预览 */}
            {form.watch('unitPrice') && form.watch('exchangeRate') && (
              <div className="rounded-lg border p-4 bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">美元单价</p>
                <p className="text-2xl font-bold">
                  $ {(parseFloat(form.watch('unitPrice')) / parseFloat(form.watch('exchangeRate'))).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
              </div>
            )}
            
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                取消
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {isEdit ? '更新' : '创建'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}