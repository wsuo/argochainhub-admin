'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  BookOpen, 
  Search, 
  Filter, 
  Plus,
  Edit,
  Trash2,
  RotateCcw,
  ToggleLeft,
  ToggleRight,
  Shield,
  Settings,
  Eye
} from 'lucide-react'
import { useDictionaryCategories, useCreateDictionaryCategory, useUpdateDictionaryCategory, useDeleteDictionaryCategory } from '@/hooks/use-api'
import { DataPagination } from '@/components/data-pagination'
import type { DictionaryCategory, DictionaryCategoryQuery, CreateDictionaryCategoryRequest, UpdateDictionaryCategoryRequest, MultiLangText } from '@/lib/types'
import { toast } from 'sonner'

export default function DictionaryPage() {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState('')
  const [systemFilter, setSystemFilter] = useState<string>('all')
  const [activeFilter, setActiveFilter] = useState<string>('all')
  
  const [query, setQuery] = useState<DictionaryCategoryQuery>({
    page: 1,
    limit: 20,
    isSystem: undefined,
    isActive: undefined,
  })

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<DictionaryCategory | null>(null)

  // Form state
  const [formData, setFormData] = useState<CreateDictionaryCategoryRequest>({
    code: '',
    name: {
      'zh-CN': '',
      'en': '',
      'es': ''
    },
    description: {
      'zh-CN': '',
      'en': '',
      'es': ''
    },
    isActive: true,
    sortOrder: 1
  })

  const { data, isLoading, error } = useDictionaryCategories(query)
  const createMutation = useCreateDictionaryCategory()
  const updateMutation = useUpdateDictionaryCategory()
  const deleteMutation = useDeleteDictionaryCategory()

  const handleSearch = () => {
    setQuery(prev => ({ 
      ...prev, 
      search: searchInput.trim() || undefined,
      isSystem: systemFilter === 'all' ? undefined : systemFilter === 'system',
      isActive: activeFilter === 'all' ? undefined : activeFilter === 'active',
      page: 1 
    }))
  }

  const handleReset = () => {
    setSearchInput('')
    setSystemFilter('all')
    setActiveFilter('all')
    setQuery({
      page: 1,
      limit: 20,
      isSystem: undefined,
      isActive: undefined,
    })
  }

  const handlePageChange = (page: number) => {
    setQuery(prev => ({ ...prev, page }))
  }

  const resetForm = () => {
    setFormData({
      code: '',
      name: {
        'zh-CN': '',
        'en': '',
        'es': ''
      },
      description: {
        'zh-CN': '',
        'en': '',
        'es': ''
      },
      isActive: true,
      sortOrder: 1
    })
  }

  const handleCreate = () => {
    if (!formData.code.trim() || !formData.name['zh-CN'].trim()) {
      toast.error('请填写分类代码和中文名称')
      return
    }

    createMutation.mutate(formData, {
      onSuccess: () => {
        setIsCreateDialogOpen(false)
        resetForm()
      }
    })
  }

  const handleEdit = (category: DictionaryCategory) => {
    setEditingCategory(category)
    setFormData({
      code: category.code,
      name: category.name,
      description: category.description,
      isActive: category.isActive,
      sortOrder: category.sortOrder
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = () => {
    if (!editingCategory || !formData.code.trim() || !formData.name['zh-CN'].trim()) {
      toast.error('请填写分类代码和中文名称')
      return
    }

    updateMutation.mutate({
      id: editingCategory.id,
      data: formData
    }, {
      onSuccess: () => {
        setIsEditDialogOpen(false)
        setEditingCategory(null)
        resetForm()
      }
    })
  }

  const handleDelete = (category: DictionaryCategory) => {
    if (category.isSystem) {
      toast.error('系统分类不能删除')
      return
    }

    if (confirm(`确定要删除分类 "${category.name['zh-CN']}" 吗？`)) {
      deleteMutation.mutate(category.id)
    }
  }

  const handleViewItems = (category: DictionaryCategory) => {
    router.push(`/system/dictionary/${category.code}`)
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="secondary">启用</Badge>
    ) : (
      <Badge variant="outline">禁用</Badge>
    )
  }

  const getSystemBadge = (isSystem: boolean) => {
    return isSystem ? (
      <Badge variant="default" className="gap-1">
        <Shield className="h-3 w-3" />
        系统
      </Badge>
    ) : (
      <Badge variant="outline">自定义</Badge>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">数据字典</h1>
          <p className="text-muted-foreground">管理系统中的字典分类和字典项</p>
        </div>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            加载字典数据失败: {(error as any).message}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">数据字典</h1>
          <p className="text-muted-foreground">管理系统中的字典分类和字典项</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          新增分类
        </Button>
      </div>

      {/* 筛选器 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            筛选条件
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-4">
            {/* 左侧搜索条件 */}
            <div className="flex items-end gap-4">
              {/* 搜索 */}
              <div className="w-[300px]">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索分类名称..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-8"
                  />
                </div>
              </div>

              {/* 系统分类筛选 */}
              <div className="min-w-[150px]">
                <Select
                  value={systemFilter}
                  onValueChange={setSystemFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="分类类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类型</SelectItem>
                    <SelectItem value="system">系统分类</SelectItem>
                    <SelectItem value="custom">自定义分类</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 状态筛选 */}
              <div className="min-w-[150px]">
                <Select
                  value={activeFilter}
                  onValueChange={setActiveFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="active">已启用</SelectItem>
                    <SelectItem value="inactive">已禁用</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 右侧操作按钮 */}
            <div className="flex gap-2">
              <Button onClick={handleSearch} className="min-w-[80px]">
                <Search className="h-4 w-4 mr-2" />
                搜索
              </Button>
              <Button variant="outline" onClick={handleReset} className="min-w-[80px]">
                <RotateCcw className="h-4 w-4 mr-2" />
                重置
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 字典分类列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            字典分类列表
          </CardTitle>
          <CardDescription>
            {data && `共 ${data.meta.totalItems} 个分类，当前显示第 ${data.meta.currentPage} 页`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>分类代码</TableHead>
                    <TableHead>分类名称</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>字典项数量</TableHead>
                    <TableHead>排序</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium font-mono">
                        {category.code}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-semibold">{category.name['zh-CN']}</div>
                          {category.name.en && (
                            <div className="text-sm text-muted-foreground">
                              {category.name.en}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getSystemBadge(category.isSystem)}</TableCell>
                      <TableCell>{getStatusBadge(category.isActive)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{category.itemCount || 0}</Badge>
                      </TableCell>
                      <TableCell>{category.sortOrder}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewItems(category)}
                            title="查看字典项"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(category)}
                            title="编辑分类"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!category.isSystem && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(category)}
                              disabled={deleteMutation.isPending}
                              title="删除分类"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* 分页 */}
              {data && (
                <DataPagination
                  currentPage={data.meta.currentPage}
                  totalPages={data.meta.totalPages}
                  totalItems={data.meta.totalItems}
                  itemsPerPage={data.meta.itemsPerPage}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 新增分类对话框 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>新增字典分类</DialogTitle>
            <DialogDescription>
              创建新的字典分类，用于组织相关的字典项
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">分类代码 *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="如：business_type"
                />
              </div>
              <div>
                <Label htmlFor="sortOrder">排序</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="name-zh">中文名称 *</Label>
              <Input
                id="name-zh"
                value={formData.name['zh-CN']}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  name: { ...prev.name, 'zh-CN': e.target.value }
                }))}
                placeholder="如：业务类别"
              />
            </div>

            <div>
              <Label htmlFor="name-en">英文名称</Label>
              <Input
                id="name-en"
                value={formData.name.en}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  name: { ...prev.name, en: e.target.value }
                }))}
                placeholder="如：Business Type"
              />
            </div>

            <div>
              <Label htmlFor="desc-zh">中文描述</Label>
              <Textarea
                id="desc-zh"
                value={formData.description?.['zh-CN'] || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  description: { ...prev.description, 'zh-CN': e.target.value }
                }))}
                placeholder="分类的详细描述"
              />
            </div>

            <div>
              <Label htmlFor="desc-en">英文描述</Label>
              <Textarea
                id="desc-en"
                value={formData.description?.en || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  description: { ...prev.description, en: e.target.value }
                }))}
                placeholder="Category description in English"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false)
                resetForm()
              }}
            >
              取消
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending}
            >
              创建分类
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑分类对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑字典分类</DialogTitle>
            <DialogDescription>
              修改字典分类的基本信息
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-code">分类代码 *</Label>
                <Input
                  id="edit-code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  disabled={editingCategory?.isSystem}
                />
              </div>
              <div>
                <Label htmlFor="edit-sortOrder">排序</Label>
                <Input
                  id="edit-sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-name-zh">中文名称 *</Label>
              <Input
                id="edit-name-zh"
                value={formData.name['zh-CN']}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  name: { ...prev.name, 'zh-CN': e.target.value }
                }))}
              />
            </div>

            <div>
              <Label htmlFor="edit-name-en">英文名称</Label>
              <Input
                id="edit-name-en"
                value={formData.name.en}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  name: { ...prev.name, en: e.target.value }
                }))}
              />
            </div>

            <div>
              <Label htmlFor="edit-desc-zh">中文描述</Label>
              <Textarea
                id="edit-desc-zh"
                value={formData.description?.['zh-CN'] || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  description: { ...prev.description, 'zh-CN': e.target.value }
                }))}
              />
            </div>

            <div>
              <Label htmlFor="edit-desc-en">英文描述</Label>
              <Textarea
                id="edit-desc-en"
                value={formData.description?.en || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  description: { ...prev.description, en: e.target.value }
                }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false)
                setEditingCategory(null)
                resetForm()
              }}
            >
              取消
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateMutation.isPending}
            >
              保存更改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}