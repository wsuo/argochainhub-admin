'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
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
import { ArrowLeft, Save, Package, AlertTriangle } from 'lucide-react'
import { useProduct, useUpdateProduct } from '@/hooks/use-api'
import { useDictionaryOptions } from '@/lib/dictionary-utils'
import { getMultiLangText, safeRenderText } from '@/lib/multi-lang-utils'
import type { Product, UpdateProductRequest } from '@/lib/types'
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
  formulation: z.string().min(1, '请选择剂型'),
  toxicity: z.string().min(1, '请选择毒性等级'),
  totalContent: z.string().min(1, '总含量不能为空'),
  registrationNumber: z.string().optional(),
  registrationHolder: z.string().optional(),
  effectiveDate: z.string().optional(),
  firstApprovalDate: z.string().optional(),
  minOrderQuantity: z.coerce.number().min(1, '最低起订量必须大于0').optional(),
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

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const productId = Number(params.id)
  
  const { data: product, isLoading, error } = useProduct(productId)
  const updateMutation = useUpdateProduct()
  const formulations = useDictionaryOptions('formulation')
  const toxicities = useDictionaryOptions('toxicity')

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: { 'zh-CN': '', 'en': '' },
      pesticideName: { 'zh-CN': '', 'en': '' },
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

  // 当产品数据加载完成时，更新表单数据
  useEffect(() => {
    // 确保产品数据和字典数据都已加载
    if (product && formulations.length > 0 && toxicities.length > 0) {
      console.log('🔍 产品编辑页面 - 原始产品数据:', {
        formulation: product.formulation,
        formulationType: typeof product.formulation,
        toxicity: product.toxicity,
        toxicityType: typeof product.toxicity,
        product: product
      })
      
      console.log('🔍 产品编辑页面 - 字典数据状态:', {
        formulations: formulations.length > 0 ? formulations.slice(0, 3) : '字典未加载',
        toxicities: toxicities.length > 0 ? toxicities.slice(0, 3) : '字典未加载',
        formulations完整: formulations,
        toxicities完整: toxicities
      })
      
      const resetData = {
        name: {
          'zh-CN': getMultiLangText(product.name, 'zh-CN'),
          'en': getMultiLangText(product.name, 'en'),
        },
        pesticideName: {
          'zh-CN': getMultiLangText(product.pesticideName, 'zh-CN'),
          'en': getMultiLangText(product.pesticideName, 'en'),
        },
        formulation: String(product.formulation || ''),
        toxicity: String(product.toxicity || ''),
        totalContent: safeRenderText(product.totalContent),
        registrationNumber: safeRenderText(product.registrationNumber),
        registrationHolder: safeRenderText(product.registrationHolder),
        effectiveDate: product.effectiveDate ? product.effectiveDate.split('T')[0] : '',
        firstApprovalDate: product.firstApprovalDate ? product.firstApprovalDate.split('T')[0] : '',
        minOrderQuantity: product.minOrderQuantity ? Number(product.minOrderQuantity) : 1,
        minOrderUnit: safeRenderText(product.minOrderUnit),
        activeIngredient1Name: {
          'zh-CN': getMultiLangText(product.activeIngredient1?.name, 'zh-CN'),
          'en': getMultiLangText(product.activeIngredient1?.name, 'en'),
        },
        activeIngredient1Content: safeRenderText(product.activeIngredient1?.content),
        activeIngredient2Name: {
          'zh-CN': getMultiLangText(product.activeIngredient2?.name, 'zh-CN'),
          'en': getMultiLangText(product.activeIngredient2?.name, 'en'),
        },
        activeIngredient2Content: safeRenderText(product.activeIngredient2?.content),
        activeIngredient3Name: {
          'zh-CN': getMultiLangText(product.activeIngredient3?.name, 'zh-CN'),
          'en': getMultiLangText(product.activeIngredient3?.name, 'en'),
        },
        activeIngredient3Content: safeRenderText(product.activeIngredient3?.content),
        productCategory: safeRenderText(product.details?.productCategory),
        exportRestrictedCountries: product.details?.exportRestrictedCountries?.join(', ') || '',
        description: safeRenderText(product.details?.description),
        remarks: safeRenderText(product.details?.remarks),
      }
      
      console.log('🔍 产品编辑页面 - 表单重置数据:', {
        formulation: resetData.formulation,
        toxicity: resetData.toxicity,
        resetData,
        字典匹配检查: {
          剂型匹配: formulations.find(f => f.value === resetData.formulation),
          毒性匹配: toxicities.find(t => t.value === resetData.toxicity),
          formulations前3项: formulations.slice(0, 3),
          toxicities前3项: toxicities.slice(0, 3)
        }
      })
      
      // 添加延迟确保DOM更新
      setTimeout(() => {
        console.log('🔍 延迟检查表单值:', {
          formulation表单值: form.getValues('formulation'),
          toxicity表单值: form.getValues('toxicity')
        })
      }, 100)
      
      form.reset(resetData)
      
      // 额外使用setValue确保Select组件正确更新
      setTimeout(() => {
        form.setValue('formulation', String(product.formulation || ''))
        form.setValue('toxicity', String(product.toxicity || ''))
        console.log('🔍 手动设置后表单值:', {
          formulation: form.getValues('formulation'),
          toxicity: form.getValues('toxicity')
        })
      }, 200)
    }
  }, [product, form, formulations, toxicities])

  const onSubmit = async (values: ProductFormValues) => {
    try {
      const updateData: UpdateProductRequest = {
        name: values.name,
        pesticideName: values.pesticideName,
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
        updateData.activeIngredient1 = {
          name: values.activeIngredient1Name,
          content: values.activeIngredient1Content,
        }
      }
      if (values.activeIngredient2Name?.['zh-CN'] && values.activeIngredient2Content) {
        updateData.activeIngredient2 = {
          name: values.activeIngredient2Name,
          content: values.activeIngredient2Content,
        }
      }
      if (values.activeIngredient3Name?.['zh-CN'] && values.activeIngredient3Content) {
        updateData.activeIngredient3 = {
          name: values.activeIngredient3Name,
          content: values.activeIngredient3Content,
        }
      }

      // 处理产品详情
      if (values.productCategory || values.exportRestrictedCountries || values.description || values.remarks) {
        updateData.details = {
          productCategory: values.productCategory || undefined,
          exportRestrictedCountries: values.exportRestrictedCountries 
            ? values.exportRestrictedCountries.split(',').map(s => s.trim()).filter(Boolean)
            : undefined,
          description: values.description || undefined,
          remarks: values.remarks || undefined,
        }
      }

      await updateMutation.mutateAsync({
        id: productId,
        data: updateData
      })

      // 成功后导航回详情页（不需要手动toast，hook已处理）
      router.push(`/content/products/${productId}`)
    } catch (error) {
      toast.error('更新失败: ' + (error as any).message)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/content/products/${productId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回产品详情
            </Link>
          </Button>
          <div>
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-32 bg-muted animate-pulse rounded mt-2" />
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/content/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回产品管理
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">编辑产品</h1>
            <p className="text-muted-foreground">修改产品的详细信息</p>
          </div>
        </div>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <p className="text-sm text-destructive">
              加载产品信息失败: {(error as any)?.message || '产品不存在'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/content/products/${productId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回产品详情
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">编辑产品</h1>
            <p className="text-muted-foreground">修改产品的详细信息</p>
          </div>
        </div>
        <Button 
          type="submit" 
          form="product-form"
          disabled={updateMutation.isPending}
        >
          <Save className="h-4 w-4 mr-2" />
          {updateMutation.isPending ? '保存中...' : '保存更改'}
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

                {/* 剂型 */}
                <Controller
                  name="formulation"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <div>
                      <Label htmlFor="formulation" className="text-sm font-medium">剂型 *</Label>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="请选择剂型" />
                        </SelectTrigger>
                        <SelectContent>
                          {formulations.map((formulation) => (
                            <SelectItem key={formulation.value} value={formulation.value}>
                              {formulation.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.error && (
                        <p className="text-sm font-medium text-destructive mt-1">
                          {fieldState.error.message}
                        </p>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        调试: 当前值={field.value}, 选项数={formulations.length}
                      </div>
                    </div>
                  )}
                />

                {/* 毒性等级 */}
                <Controller
                  name="toxicity"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <div>
                      <Label htmlFor="toxicity" className="text-sm font-medium">毒性等级 *</Label>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="请选择毒性等级" />
                        </SelectTrigger>
                        <SelectContent>
                          {toxicities.map((toxicity) => (
                            <SelectItem key={toxicity.value} value={toxicity.value}>
                              {toxicity.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.error && (
                        <p className="text-sm font-medium text-destructive mt-1">
                          {fieldState.error.message}
                        </p>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        调试: 当前值={field.value}, 选项数={toxicities.length}
                      </div>
                    </div>
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
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                产品的官方登记和证书信息
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
                产品的有效成分信息（最多3种）
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
                产品的详细描述和其他信息
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