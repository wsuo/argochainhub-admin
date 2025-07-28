'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Newspaper, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Search,
  RotateCcw,
  Eye,
  Edit,
  Trash2,
  ExternalLink
} from 'lucide-react'
import { useNews, useDeleteNews, usePublishNews, useUnpublishNews } from '@/hooks/use-api'
import { DataPagination } from '@/components/data-pagination'
import { ErrorDisplay } from '@/components/ui/error-display'
import { LoadingState } from '@/components/ui/loading-state'
import { ErrorBoundary } from '@/components/error-boundary'
import type { News, NewsQuery } from '@/lib/types'
import { useDictionaryOptions } from '@/lib/dictionary-utils'
import { getMultiLangText } from '@/lib/multi-lang-utils'
import { formatDistanceToNow } from 'date-fns'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function NewsPage() {
  const [query, setQuery] = useState<NewsQuery>({
    page: 1,
    pageSize: 20,
  })
  
  // 状态管理
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [publishedFilter, setPublishedFilter] = useState('all')
  const [searchInput, setSearchInput] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [newsToDelete, setNewsToDelete] = useState<string | null>(null)

  const { data, isLoading, error } = useNews(query)
  const deleteMutation = useDeleteNews()
  const publishMutation = usePublishNews()
  const unpublishMutation = useUnpublishNews()

  // 获取新闻类别字典数据
  const newsCategories = useDictionaryOptions('news_category')

  const handleFilterChange = useCallback((newQuery: Partial<NewsQuery>) => {
    setQuery(prev => ({ ...prev, ...newQuery, page: 1 }))
  }, [])

  const handlePageChange = (page: number) => {
    setQuery(prev => ({ ...prev, page }))
  }

  const handleSearch = () => {
    const newQuery: Partial<NewsQuery> = {}
    
    if (searchInput.trim()) {
      newQuery.keyword = searchInput.trim()
    }
    
    if (categoryFilter !== 'all') {
      newQuery.category = categoryFilter
    }
    
    if (publishedFilter !== 'all') {
      newQuery.isPublished = publishedFilter === 'published'
    }
    
    handleFilterChange(newQuery)
  }

  const handleReset = () => {
    setCategoryFilter('all')
    setPublishedFilter('all')
    setSearchInput('')
    setQuery({ page: 1, pageSize: 20 })
  }

  const handleDeleteClick = (newsId: string) => {
    setNewsToDelete(newsId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (newsToDelete) {
      await deleteMutation.mutateAsync(newsToDelete)
      setDeleteDialogOpen(false)
      setNewsToDelete(null)
    }
  }

  const handleTogglePublish = async (news: News) => {
    if (news.isPublished) {
      await unpublishMutation.mutateAsync(news.id)
    } else {
      await publishMutation.mutateAsync(news.id)
    }
  }

  // 计算统计数据
  const newsList = data?.data.data || []
  const totalNews = newsList.length || 0
  const publishedNews = newsList.filter(news => news.isPublished).length || 0
  const draftNews = newsList.filter(news => !news.isPublished).length || 0

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">新闻资讯</h1>
          <p className="text-muted-foreground">管理平台新闻资讯内容</p>
        </div>
        <ErrorDisplay 
          error={error}
          title="加载新闻数据失败"
          showRetry={true}
          onRetry={() => window.location.reload()}
          showReportBug={true}
        />
      </div>
    )
  }

  // 如果是初始加载（data为undefined），显示完整的加载状态
  const isInitialLoading = isLoading && !data

  if (isInitialLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">新闻资讯</h1>
          <p className="text-muted-foreground">管理平台新闻资讯内容</p>
        </div>
        
        <LoadingState
          type="page"
          message="加载新闻数据..."
          description="正在获取最新的新闻资讯"
          icon="newspaper"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">新闻资讯</h1>
          <p className="text-muted-foreground">管理平台新闻资讯内容</p>
        </div>
        <div className="flex items-center gap-2">
          {totalNews > 0 && (
            <Badge variant="secondary" className="text-base px-3 py-1">
              <Newspaper className="h-4 w-4 mr-1" />
              {totalNews} 篇新闻
            </Badge>
          )}
          <Button asChild>
            <Link href="/content/news/new">
              <Plus className="h-4 w-4 mr-2" />
              发布新闻
            </Link>
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总新闻数</CardTitle>
            <Newspaper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalNews}
            </div>
            <p className="text-xs text-muted-foreground">
              平台上的新闻总数
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已发布</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {publishedNews}
            </div>
            <p className="text-xs text-muted-foreground">
              对外公开的新闻
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">草稿箱</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {draftNews}
            </div>
            <p className="text-xs text-muted-foreground">
              未发布的草稿
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 筛选器 */}
      <Card>
        <CardHeader>
          <CardTitle>筛选条件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search">搜索关键词</Label>
                <Input
                  id="search"
                  placeholder="搜索标题或内容..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="w-[200px]">
                <Label>新闻类别</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择类别" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类别</SelectItem>
                    {newsCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[200px]">
                <Label>发布状态</Label>
                <Select value={publishedFilter} onValueChange={setPublishedFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="published">已发布</SelectItem>
                    <SelectItem value="draft">草稿</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  搜索
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  重置
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 新闻列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="h-4 w-4" />
                新闻列表
              </CardTitle>
              <CardDescription>
                {data && `共 ${newsList.length} 篇新闻`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState
              type="table"
              message="加载新闻数据..."
              description="正在获取最新的新闻信息"
              icon="newspaper"
            />
          ) : newsList.length === 0 ? (
            <div className="text-center py-12">
              <Newspaper className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
              <h3 className="text-xl font-semibold mb-2">
                {Object.keys(query).length > 2 ? '未找到匹配的新闻' : '暂无新闻'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {Object.keys(query).length > 2 
                  ? '尝试调整筛选条件或搜索关键词来查找新闻' 
                  : '还没有发布任何新闻，点击下方按钮开始发布第一篇新闻'
                }
              </p>
              <div className="flex gap-3 justify-center">
                {Object.keys(query).length > 2 ? (
                  <Button variant="outline" onClick={handleReset}>
                    <XCircle className="h-4 w-4 mr-2" />
                    清除筛选条件
                  </Button>
                ) : null}
                <Button asChild>
                  <Link href="/content/news/new">
                    <Plus className="h-4 w-4 mr-2" />
                    {Object.keys(query).length > 2 ? '发布新闻' : '发布第一篇新闻'}
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <ErrorBoundary>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>标题</TableHead>
                      <TableHead>类别</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>浏览量</TableHead>
                      <TableHead>发布时间</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {newsList.map((news) => (
                      <TableRow key={news.id}>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="font-medium truncate">
                              {getMultiLangText(news.title)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(news.createdAt), { 
                                addSuffix: true, 
                                locale: zhCN 
                              })}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {newsCategories.find(cat => cat.value === news.category)?.label || news.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
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
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {news.viewCount}
                          </div>
                        </TableCell>
                        <TableCell>
                          {news.publishedAt ? formatDistanceToNow(new Date(news.publishedAt), { 
                            addSuffix: true, 
                            locale: zhCN 
                          }) : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/content/news/${news.id}`}>
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/content/news/${news.id}/edit`}>
                                <Edit className="h-3 w-3" />
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTogglePublish(news)}
                              disabled={publishMutation.isPending || unpublishMutation.isPending}
                            >
                              {news.isPublished ? '取消发布' : '发布'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(news.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ErrorBoundary>

              {/* 分页 */}
              {data && data.data && (
                <DataPagination
                  currentPage={data.data.page || 1}
                  totalPages={Math.ceil((data.data.total || 0) / (data.data.pageSize || 20))}
                  totalItems={data.data.total || 0}
                  itemsPerPage={data.data.pageSize || 20}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除新闻</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将永久删除该新闻资讯，包括所有相关数据。
              该操作无法撤销，请确认是否继续。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
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