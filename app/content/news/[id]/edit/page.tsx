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
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
import { ArrowLeft, Save, Newspaper, Eye } from 'lucide-react'
import { useNewsById, useUpdateNews } from '@/hooks/use-api'
import { useDictionaryOptions } from '@/lib/dictionary-utils'
import { MultiLangInput } from '@/components/multi-lang-input'
import { ErrorDisplay } from '@/components/ui/error-display'
import { LoadingState } from '@/components/ui/loading-state'
import type { UpdateNewsRequest, MultiLangText } from '@/lib/types'
import { toast } from 'sonner'

// 表单验证schema
const newsFormSchema = z.object({
  title: z.object({
    'zh-CN': z.string().min(1, '中文标题不能为空'),
    'en': z.string().optional(),
    'es': z.string().optional(),
  }),
  content: z.object({
    'zh-CN': z.string().min(1, '中文内容不能为空'),
    'en': z.string().optional(),
    'es': z.string().optional(),
  }),
  category: z.string().min(1, '请选择新闻类别'),
  coverImage: z.string().optional(),
  sortOrder: z.coerce.number().min(0, '排序值不能小于0').optional(),
  isPublished: z.boolean().optional(),
})

type NewsFormValues = z.infer<typeof newsFormSchema>

export default function EditNewsPage() {
  const params = useParams()
  const router = useRouter()
  const newsId = params.id as string
  
  const { data: news, isLoading, error } = useNewsById(newsId)
  const updateMutation = useUpdateNews()
  const newsCategories = useDictionaryOptions('news_category')

  const form = useForm<NewsFormValues>({
    resolver: zodResolver(newsFormSchema),
    defaultValues: {
      title: { 'zh-CN': '' },
      content: { 'zh-CN': '' },
      category: '',
      coverImage: '',
      sortOrder: 0,
      isPublished: false,
    },
  })

  // 当新闻数据加载完成时，更新表单默认值
  useEffect(() => {
    if (news) {
      form.reset({
        title: news.title,
        content: news.content,
        category: news.category,
        coverImage: news.coverImage || '',
        sortOrder: news.sortOrder,
        isPublished: news.isPublished,
      })
    }
  }, [news, form])

  const onSubmit = async (values: NewsFormValues) => {
    if (!news) return

    try {
      const data: UpdateNewsRequest = {
        title: values.title as MultiLangText,
        content: values.content as MultiLangText,
        category: values.category,
        coverImage: values.coverImage || undefined,
        sortOrder: values.sortOrder || 0,
        isPublished: values.isPublished || false,
      }

      await updateMutation.mutateAsync({ id: news.id, data })
      toast.success('新闻更新成功')
      router.push('/content/news')
    } catch (error) {
      console.error('更新新闻失败:', error)
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/content/news">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回列表
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">编辑新闻</h1>
            <p className="text-muted-foreground">修改新闻资讯内容</p>
          </div>
        </div>
        <ErrorDisplay 
          error={error}
          title="加载新闻数据失败"
          showRetry={true}
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/content/news">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回列表
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">编辑新闻</h1>
            <p className="text-muted-foreground">修改新闻资讯内容</p>
          </div>
        </div>
        <LoadingState
          type="page"
          message="加载新闻数据..."
          description="正在获取新闻详细信息"
          icon="newspaper"
        />
      </div>
    )
  }

  if (!news) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/content/news">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回列表
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">编辑新闻</h1>
            <p className="text-muted-foreground">修改新闻资讯内容</p>
          </div>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">新闻不存在或已被删除</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/content/news">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回列表
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">编辑新闻</h1>
            <p className="text-muted-foreground">修改新闻资讯内容</p>
          </div>
        </div>
        
        <Button variant="outline" asChild>
          <Link href={`/content/news/${news.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            查看详情
          </Link>
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 主要内容区域 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 新闻标题 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Newspaper className="h-4 w-4" />
                    新闻标题
                  </CardTitle>
                  <CardDescription>
                    设置新闻的多语言标题
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <MultiLangInput
                            value={field.value}
                            onChange={field.onChange}
                            label="新闻标题"
                            placeholder={{
                              'zh-CN': '请输入中文标题',
                              'en': 'Please enter English title',
                              'es': 'Por favor ingrese el título en español'
                            }}
                            required={true}
                            variant="input"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* 新闻内容 */}
              <Card>
                <CardHeader>
                  <CardTitle>新闻内容</CardTitle>
                  <CardDescription>
                    编写新闻的详细内容，支持HTML格式
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <MultiLangInput
                            value={field.value}
                            onChange={field.onChange}
                            label="新闻内容"
                            placeholder={{
                              'zh-CN': '请输入中文内容，支持HTML格式',
                              'en': 'Please enter English content, HTML supported',
                              'es': 'Por favor ingrese contenido en español, HTML compatible'
                            }}
                            required={true}
                            variant="textarea"
                            rows={10}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* 侧边栏配置区域 */}
            <div className="space-y-6">
              {/* 发布设置 */}
              <Card>
                <CardHeader>
                  <CardTitle>发布设置</CardTitle>
                  <CardDescription>
                    配置新闻的发布选项
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="isPublished"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            发布状态
                          </FormLabel>
                          <FormDescription>
                            勾选后新闻将对外发布
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* 新闻分类 */}
              <Card>
                <CardHeader>
                  <CardTitle>新闻分类</CardTitle>
                  <CardDescription>
                    选择新闻所属的类别
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>新闻类别</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="选择新闻类别" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {newsCategories.map((category) => (
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
                </CardContent>
              </Card>

              {/* 其他设置 */}
              <Card>
                <CardHeader>
                  <CardTitle>其他设置</CardTitle>
                  <CardDescription>
                    配置新闻的附加选项
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="coverImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>封面图片</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="https://example.com/image.jpg"
                            type="url"
                          />
                        </FormControl>
                        <FormDescription>
                          新闻封面图片的URL地址（可选）
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sortOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>排序值</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            placeholder="0"
                          />
                        </FormControl>
                        <FormDescription>
                          数值越小排序越靠前（默认为0）
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* 操作按钮 */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={updateMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateMutation.isPending ? '保存中...' : '保存修改'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      asChild
                    >
                      <Link href={`/content/news/${news.id}`}>
                        取消
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}