'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDictionaryOptions } from '@/lib/dictionary-utils'
import type { Pesticide, CreatePesticideRequest, UpdatePesticideRequest } from '@/lib/types'
import { getMultiLangText } from '@/lib/multi-lang-utils'
import { Save, Package } from 'lucide-react'

const pesticideFormSchema = z.object({
  category: z.string().min(1, '请选择产品类别'),
  formulation: z.string().min(1, '请选择剂型'),
  productName: z.object({
    'zh-CN': z.string().min(1, '请输入中文名称'),
    en: z.string().optional(),
    es: z.string().optional(),
  }),
  concentration: z.string().min(1, '请输入浓度规格'),
  isVisible: z.boolean().default(true),
})

type PesticideFormValues = z.infer<typeof pesticideFormSchema>

interface PesticideFormProps {
  pesticide?: Pesticide
  onSubmit: (data: CreatePesticideRequest | UpdatePesticideRequest) => Promise<void>
  loading?: boolean
}

export function PesticideForm({ pesticide, onSubmit, loading = false }: PesticideFormProps) {
  // 获取字典数据
  const categories = useDictionaryOptions('product_category')
  const formulations = useDictionaryOptions('formulation')

  const form = useForm<PesticideFormValues>({
    resolver: zodResolver(pesticideFormSchema),
    defaultValues: {
      category: pesticide?.category || '',
      formulation: pesticide?.formulation || '',
      productName: {
        'zh-CN': getMultiLangText(pesticide?.productName, 'zh-CN') || '',
        en: getMultiLangText(pesticide?.productName, 'en') || '',
        es: getMultiLangText(pesticide?.productName, 'es') || '',
      },
      concentration: pesticide?.concentration || '',
      isVisible: pesticide?.isVisible ?? true,
    },
  })

  const handleSubmit = async (values: PesticideFormValues) => {
    try {
      await onSubmit(values)
    } catch (error) {
      // 错误处理由父组件负责
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              基本信息
            </CardTitle>
            <CardDescription>
              填写农药的基本信息
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 产品类别 */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>产品类别 *</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择产品类别" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 剂型 */}
              <FormField
                control={form.control}
                name="formulation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>剂型 *</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择剂型" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {formulations.map((formulation) => (
                          <SelectItem key={formulation.value} value={formulation.value}>
                            {formulation.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 浓度规格 */}
            <FormField
              control={form.control}
              name="concentration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>浓度规格 *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="例如：96% TC"
                      disabled={loading}
                    />
                  </FormControl>
                  <FormDescription>
                    请输入农药的浓度和规格信息
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 可见性 */}
            <FormField
              control={form.control}
              name="isVisible"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">前台可见</FormLabel>
                    <FormDescription>
                      控制该农药是否在前台展示给用户
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={loading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>多语言名称</CardTitle>
            <CardDescription>
              请提供农药在不同语言下的名称
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="zh-CN" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="zh-CN">中文</TabsTrigger>
                <TabsTrigger value="en">English</TabsTrigger>
                <TabsTrigger value="es">Español</TabsTrigger>
              </TabsList>
              
              <TabsContent value="zh-CN" className="space-y-4">
                <FormField
                  control={form.control}
                  name="productName.zh-CN"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>中文名称 *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="请输入农药的中文名称"
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="en" className="space-y-4">
                <FormField
                  control={form.control}
                  name="productName.en"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>英文名称</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Enter product name in English"
                          disabled={loading}
                        />
                      </FormControl>
                      <FormDescription>
                        可选，用于国际化展示
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="es" className="space-y-4">
                <FormField
                  control={form.control}
                  name="productName.es"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>西班牙文名称</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Ingrese el nombre del producto en español"
                          disabled={loading}
                        />
                      </FormControl>
                      <FormDescription>
                        可选，用于国际化展示
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {pesticide ? '更新农药' : '创建农药'}
          </Button>
        </div>
      </form>
    </Form>
  )
}