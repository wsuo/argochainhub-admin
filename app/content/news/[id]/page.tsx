'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  User,
  Globe,
  CheckCircle2,
  XCircle,
  ExternalLink
} from 'lucide-react'
import { useNewsById, useDeleteNews, usePublishNews, useUnpublishNews } from '@/hooks/use-api'
import { ErrorDisplay } from '@/components/ui/error-display'
import { LoadingState } from '@/components/ui/loading-state'
import { useDictionaryOptions } from '@/lib/dictionary-utils'
import { getMultiLangText } from '@/lib/multi-lang-utils'
import { formatDistanceToNow, format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function NewsDetailPage() {
  const params = useParams()
  const router = useRouter()
  const newsId = params.id as string
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const { data: newsResponse, isLoading, error } = useNewsById(newsId)
  const news = newsResponse?.data
  const deleteMutation = useDeleteNews()
  const publishMutation = usePublishNews()
  const unpublishMutation = useUnpublishNews()

  // 获取新闻类别字典数据
  const newsCategories = useDictionaryOptions('news_category')

  const handleDelete = async () => {
    if (news) {
      await deleteMutation.mutateAsync(news.id)
      setDeleteDialogOpen(false)
      router.push('/content/news')
    }
  }

  const handleTogglePublish = async () => {
    if (news) {
      if (news.isPublished) {
        await unpublishMutation.mutateAsync(news.id)
      } else {
        await publishMutation.mutateAsync(news.id)
      }
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
            <h1 className="text-3xl font-bold tracking-tight">新闻详情</h1>
            <p className="text-muted-foreground">查看新闻资讯详细信息</p>
          </div>
        </div>
        <ErrorDisplay 
          error={error}
          title="加载新闻详情失败"
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
            <h1 className="text-3xl font-bold tracking-tight">新闻详情</h1>
            <p className="text-muted-foreground">查看新闻资讯详细信息</p>
          </div>
        </div>
        <LoadingState
          type="page"
          message="加载新闻详情..."
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
            <h1 className="text-3xl font-bold tracking-tight">新闻详情</h1>
            <p className="text-muted-foreground">查看新闻资讯详细信息</p>
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

  const categoryLabel = newsCategories.find(cat => cat.value === news.category)?.label || news.category

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
            <h1 className="text-3xl font-bold tracking-tight">新闻详情</h1>
            <p className="text-muted-foreground">查看新闻资讯详细信息</p>
          </div>
        </div>
        
        {/* 操作按钮 */}
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/content/news/${news.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              编辑
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={handleTogglePublish}
            disabled={publishMutation.isPending || unpublishMutation.isPending}
          >
            {news.isPublished ? (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                取消发布
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                发布
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            删除
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 主要内容区域 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 新闻标题和状态 */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">
                    {getMultiLangText(news.title)}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      创建于 {format(new Date(news.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {news.viewCount} 次浏览
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {news.isPublished ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      已发布
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <XCircle className="h-3 w-3 mr-1" />
                      草稿
                    </Badge>
                  )}
                  <Badge variant="outline">
                    {categoryLabel}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* 封面图片 */}
          {news.coverImage && (
            <Card>
              <CardHeader>
                <CardTitle>封面图片</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={news.coverImage}
                  alt={getMultiLangText(news.title)}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </CardContent>
            </Card>
          )}

          {/* 新闻内容 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                新闻内容
              </CardTitle>
              <CardDescription>
                支持多语言显示的新闻正文内容
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* 中文内容 */}
                {news.content['zh-CN'] && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-1">
                      🇨🇳 中文
                    </h4>
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: news.content['zh-CN'] }}
                    />
                  </div>
                )}

                {/* 英文内容 */}
                {news.content.en && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-1">
                      🇺🇸 English
                    </h4>
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: news.content.en }}
                    />
                  </div>
                )}

                {/* 西班牙语内容 */}
                {news.content.es && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-1">
                      🇪🇸 Español
                    </h4>
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: news.content.es }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 侧边栏信息 */}
        <div className="space-y-6">
          {/* 发布信息 */}
          <Card>
            <CardHeader>
              <CardTitle>发布信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">发布状态</Label>
                <div className="mt-1">
                  {news.isPublished ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      已发布
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <XCircle className="h-3 w-3 mr-1" />
                      草稿
                    </Badge>
                  )}
                </div>
              </div>

              {news.publishedAt && (
                <div>
                  <Label className="text-sm font-medium">发布时间</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(new Date(news.publishedAt), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })}
                  </p>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium">浏览量</Label>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {news.viewCount} 次
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 分类信息 */}
          <Card>
            <CardHeader>
              <CardTitle>分类信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label className="text-sm font-medium">新闻类别</Label>
                <div className="mt-1">
                  <Badge variant="outline">
                    {categoryLabel}
                  </Badge>
                </div>
              </div>
              
              <div className="mt-4">
                <Label className="text-sm font-medium">排序值</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {news.sortOrder}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 时间信息 */}
          <Card>
            <CardHeader>
              <CardTitle>时间信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium">创建时间</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {format(new Date(news.createdAt), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">更新时间</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {format(new Date(news.updatedAt), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">最后更新</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(news.updatedAt), { 
                    addSuffix: true, 
                    locale: zhCN 
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除新闻</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将永久删除新闻《{getMultiLangText(news.title)}》，包括所有相关数据。
              该操作无法撤销，请确认是否继续。
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

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>
}