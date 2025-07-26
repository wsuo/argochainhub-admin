'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { ArrowLeft, Save, Package, Plus } from 'lucide-react'
import { useCreateProduct } from '@/hooks/use-api'
import { useDictionaryOptions } from '@/lib/dictionary-utils'
import { SupplierSelect } from '@/components/supplier-select'
import type { CreateProductRequest } from '@/lib/types'
import { toast } from 'sonner'

// 表单验证schema
const productFormSchema = z.object({
  name: z.object({
    'zh-CN': z.string().min(1, '中文产品名称不能为空'),
    'en': z.string().optional(),
  }),
  pesticideName: z.object({
    'zh-CN': z.string().min(1, '中文农药名称不能为空'),
    'en': z.string().optional(),
  }),
  supplierId: z.number().min(1, '请选择供应商'),
  formulation: z.string().min(1, '请选择剂型'),
  toxicity: z.string().min(1, '请选择毒性等级'),
  totalContent: z.string().min(1, '总含量不能为空'),
  registrationNumber: z.string().optional(),
  registrationHolder: z.string().optional(),
  effectiveDate: z.string().optional(),
  firstApprovalDate: z.string().optional(),
  minOrderQuantity: z.number().min(1, '最低起订量必须大于0').optional(),
  minOrderUnit: z.string().optional(),
  // 有效成分
  activeIngredient1Name: z.object({
    'zh-CN': z.string().optional(),
    'en': z.string().optional(),
  }).optional(),
  activeIngredient1Content: z.string().optional(),
  activeIngredient2Name: z.object({
    'zh-CN': z.string().optional(),
    'en': z.string().optional(),
  }).optional(),
  activeIngredient2Content: z.string().optional(),
  activeIngredient3Name: z.object({
    'zh-CN': z.string().optional(),
    'en': z.string().optional(),
  }).optional(),
  activeIngredient3Content: z.string().optional(),
  // 产品详情
  productCategory: z.string().optional(),
  exportRestrictedCountries: z.string().optional(), // 用逗号分隔的字符串
  description: z.string().optional(),
  remarks: z.string().optional(),
})

type ProductFormValues = z.infer<typeof productFormSchema>

export default function NewProductPage() {
  const router = useRouter()
  const createMutation = useCreateProduct()
  const formulations = useDictionaryOptions('formulation')
  const toxicities = useDictionaryOptions('toxicity')

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: { 'zh-CN': '', 'en': '' },
      pesticideName: { 'zh-CN': '', 'en': '' },
      supplierId: 0,
      formulation: '',
      toxicity: '',
      totalContent: '',
      registrationNumber: '',
      registrationHolder: '',
      effectiveDate: '',
      firstApprovalDate: '',
      minOrderQuantity: 1,
      minOrderUnit: '',
      activeIngredient1Name: { 'zh-CN': '', 'en': '' },
      activeIngredient1Content: '',
      activeIngredient2Name: { 'zh-CN': '', 'en': '' },
      activeIngredient2Content: '',
      activeIngredient3Name: { 'zh-CN': '', 'en': '' },
      activeIngredient3Content: '',
      productCategory: '',
      exportRestrictedCountries: '',
      description: '',
      remarks: '',
    },
  })

  const onSubmit = async (values: ProductFormValues) => {
    try {
      const createData: CreateProductRequest = {
        name: values.name,
        pesticideName: values.pesticideName,
        supplierId: values.supplierId,
        formulation: values.formulation,
        toxicity: values.toxicity,
        totalContent: values.totalContent,
        registrationNumber: values.registrationNumber || undefined,
        registrationHolder: values.registrationHolder || undefined,
        effectiveDate: values.effectiveDate || undefined,
        firstApprovalDate: values.firstApprovalDate || undefined,
        minOrderQuantity: values.minOrderQuantity || undefined,
        minOrderUnit: values.minOrderUnit || undefined,
      }

      // 处理有效成分
      if (values.activeIngredient1Name?.['zh-CN'] && values.activeIngredient1Content) {
        createData.activeIngredient1 = {
          name: values.activeIngredient1Name,
          content: values.activeIngredient1Content,
        }
      }
      if (values.activeIngredient2Name?.['zh-CN'] && values.activeIngredient2Content) {
        createData.activeIngredient2 = {
          name: values.activeIngredient2Name,
          content: values.activeIngredient2Content,
        }
      }
      if (values.activeIngredient3Name?.['zh-CN'] && values.activeIngredient3Content) {
        createData.activeIngredient3 = {
          name: values.activeIngredient3Name,
          content: values.activeIngredient3Content,
        }
      }

      // 处理产品详情
      if (values.productCategory || values.exportRestrictedCountries || values.description || values.remarks) {
        createData.details = {
          productCategory: values.productCategory || undefined,
          exportRestrictedCountries: values.exportRestrictedCountries 
            ? values.exportRestrictedCountries.split(',').map(s => s.trim()).filter(Boolean)
            : undefined,
          description: values.description || undefined,
          remarks: values.remarks || undefined,
        }
      }

      const result = await createMutation.mutateAsync(createData)
      toast.success('产品创建成功')
      router.push(`/content/products/${result.id}`)
    } catch (error) {
      toast.error('创建失败: ' + (error as any).message)
    }
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/content/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回产品管理
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">新建产品</h1>
            <p className="text-muted-foreground">创建新的产品信息</p>
          </div>
        </div>
        <Button 
          type="submit" 
          form="product-form"
          disabled={createMutation.isPending}
        >
          <Save className="h-4 w-4 mr-2" />
          {createMutation.isPending ? '创建中...' : '创建产品'}
        </Button>
      </div>

      <Form {...form}>
        <form id="product-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* 基础信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                基础信息
              </CardTitle>
              <CardDescription>
                产品的基本信息和标识
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 产品名称 */}
                <div className="space-y-3">
                  <Label>产品名称</Label>
                  <FormField
                    control={form.control}
                    name="name.zh-CN"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>中文名称 *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="请输入中文产品名称" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name.en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>英文名称</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="请输入英文产品名称" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 农药名称 */}
                <div className="space-y-3">
                  <Label>农药名称</Label>
                  <FormField
                    control={form.control}
                    name="pesticideName.zh-CN"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>中文名称 *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="请输入中文农药名称" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pesticideName.en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>英文名称</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="请输入英文农药名称" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 供应商选择 */}
                <FormField
                  control={form.control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>供应商 *</FormLabel>
                      <FormControl>
                        <SupplierSelect
                          value={field.value || undefined}
                          onValueChange={(value) => field.onChange(value || 0)}
                          placeholder="请选择供应商"
                          className="w-full"
                          required
                        />
                      </FormControl>
                      <FormDescription>
                        支持搜索和筛选已审核的供应商
                      </FormDescription>
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="请选择剂型" />
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

                {/* 毒性等级 */}
                <FormField
                  control={form.control}
                  name="toxicity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>毒性等级 *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="请选择毒性等级" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {toxicities.map((toxicity) => (
                            <SelectItem key={toxicity.value} value={toxicity.value}>
                              {toxicity.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 总含量 */}
                <FormField
                  control={form.control}
                  name="totalContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>总含量 *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="例如: 500g/L" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 最低起订量 */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="minOrderQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>最低起订量</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            placeholder="数量"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="minOrderUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>单位</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="例如: 桶/箱/瓶" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 登记信息 */}
          <Card>
            <CardHeader>
              <CardTitle>登记信息</CardTitle>
              <CardDescription>
                产品的官方登记和证书信息（可选）
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="registrationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>登记证号</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="请输入登记证号" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="registrationHolder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>登记证持有人</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="请输入登记证持有人" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="effectiveDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>有效截止日期</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="firstApprovalDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>首次批准日期</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* 有效成分 */}
          <Card>
            <CardHeader>
              <CardTitle>有效成分</CardTitle>
              <CardDescription>
                产品的有效成分信息（最多3种，可选）
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[1, 2, 3].map((index) => (
                <div key={index} className="space-y-4 p-4 border rounded-lg">
                  <h4 className="font-medium">有效成分 {index}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name={`activeIngredient${index}Name.zh-CN` as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>中文名称</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="有效成分中文名称" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`activeIngredient${index}Name.en` as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>英文名称</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="有效成分英文名称" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`activeIngredient${index}Content` as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>含量</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="例如: 10%" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 产品详情 */}
          <Card>
            <CardHeader>
              <CardTitle>产品详情</CardTitle>
              <CardDescription>
                产品的详细描述和其他信息（可选）
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="productCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>产品品类</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="请输入产品品类" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="exportRestrictedCountries"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>出口限制国家</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="多个国家用逗号分隔，例如: 美国, 欧盟, 日本" />
                    </FormControl>
                    <FormDescription>
                      如果该产品对某些国家有出口限制，请在此列出
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>产品描述</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="请输入产品的详细描述..." 
                        rows={5}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>备注</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="其他需要说明的信息..." 
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  )
}