'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft,
  BookOpen, 
  Search, 
  Filter, 
  Plus,
  Edit,
  Trash2,
  RotateCcw,
  Shield,
  Upload,
  Download,
  Globe
} from 'lucide-react'
import { 
  useDictionaryCategory, 
  useDictionaryItems, 
  useCreateDictionaryItem, 
  useUpdateDictionaryItem, 
  useDeleteDictionaryItem,
  useBatchImportDictionaryItems,
  useCountriesWithFlags
} from '@/hooks/use-api'
import { DataPagination } from '@/components/data-pagination'
import type { 
  DictionaryItem, 
  DictionaryItemQuery, 
  CreateDictionaryItemRequest, 
  UpdateDictionaryItemRequest 
} from '@/lib/types'
import { toast } from 'sonner'
import { getCountryFlag, getCountryDisplayName, isTaiwanRegion } from '@/lib/country-utils'

export default function DictionaryItemsPage() {
  const params = useParams()
  const router = useRouter()
  const categoryCode = params.code as string
  
  const [searchInput, setSearchInput] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [currentLang, setCurrentLang] = useState<'zh-CN' | 'en' | 'es'>('zh-CN')
  
  const [query, setQuery] = useState<DictionaryItemQuery>({
    page: 1,
    limit: 20,
    isActive: undefined,
  })

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<DictionaryItem | null>(null)

  // Form state
  const [formData, setFormData] = useState<CreateDictionaryItemRequest>({
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
    extraData: {},
    isActive: true,
    sortOrder: 1
  })

  const { data: category, isLoading: categoryLoading } = useDictionaryCategory(categoryCode)
  const { data, isLoading, error } = useDictionaryItems(categoryCode, query)
  const { data: countriesData } = useCountriesWithFlags()
  const createMutation = useCreateDictionaryItem()
  const updateMutation = useUpdateDictionaryItem()
  const deleteMutation = useDeleteDictionaryItem()
  const batchImportMutation = useBatchImportDictionaryItems()

  // 检查是否是国家分类
  const isCountriesCategory = categoryCode === 'countries'

  const handleSearch = () => {
    setQuery(prev => ({ 
      ...prev, 
      search: searchInput.trim() || undefined,
      isActive: activeFilter === 'all' ? undefined : activeFilter === 'active',
      page: 1 
    }))
  }

  const handleReset = () => {
    setSearchInput('')
    setActiveFilter('all')
    setQuery({
      page: 1,
      limit: 20,
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
      extraData: {},
      isActive: true,
      sortOrder: 1
    })
  }

  const handleCreate = () => {
    if (!formData.code.trim() || !formData.name['zh-CN'].trim()) {
      toast.error('请填写字典项代码和中文名称')
      return
    }

    createMutation.mutate({
      code: categoryCode,
      data: formData
    }, {
      onSuccess: () => {
        setIsCreateDialogOpen(false)
        resetForm()
      }
    })
  }

  const handleEdit = (item: DictionaryItem) => {
    setEditingItem(item)
    setFormData({
      code: item.code,
      name: item.name,
      description: item.description,
      extraData: item.extraData || {},
      isActive: item.isActive,
      sortOrder: item.sortOrder
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = () => {
    if (!editingItem || !formData.code.trim() || !formData.name['zh-CN'].trim()) {
      toast.error('请填写字典项代码和中文名称')
      return
    }

    updateMutation.mutate({
      id: editingItem.id,
      data: formData
    }, {
      onSuccess: () => {
        setIsEditDialogOpen(false)
        setEditingItem(null)
        resetForm()
      }
    })
  }

  const handleDelete = (item: DictionaryItem) => {
    if (item.isSystem) {
      toast.error('系统字典项不能删除')
      return
    }

    if (confirm(`确定要删除字典项 "${item.name['zh-CN']}" 吗？`)) {
      deleteMutation.mutate(item.id)
    }
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

  const renderCountrySpecialFields = () => {
    if (!isCountriesCategory) return null

    return (
      <>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="iso2">ISO2 代码</Label>
            <Input
              id="iso2"
              value={formData.extraData?.iso2 || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                extraData: { ...prev.extraData, iso2: e.target.value }
              }))}
              placeholder="如：CN"
            />
          </div>
          <div>
            <Label htmlFor="iso3">ISO3 代码</Label>
            <Input
              id="iso3"
              value={formData.extraData?.iso3 || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                extraData: { ...prev.extraData, iso3: e.target.value }
              }))}
              placeholder="如：CHN"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="countryCode">国家区号</Label>
            <Input
              id="countryCode"
              value={formData.extraData?.countryCode || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                extraData: { ...prev.extraData, countryCode: e.target.value }
              }))}
              placeholder="如：+86"
            />
          </div>
          <div>
            <Label htmlFor="continent">所属大洲</Label>
            <Select
              value={formData.extraData?.continent || ''}
              onValueChange={(value) => setFormData(prev => ({
                ...prev,
                extraData: { ...prev.extraData, continent: value }
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择大洲" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AS">亚洲 (Asia)</SelectItem>
                <SelectItem value="EU">欧洲 (Europe)</SelectItem>
                <SelectItem value="NA">北美洲 (North America)</SelectItem>
                <SelectItem value="SA">南美洲 (South America)</SelectItem>
                <SelectItem value="AF">非洲 (Africa)</SelectItem>
                <SelectItem value="OC">大洋洲 (Oceania)</SelectItem>
                <SelectItem value="AN">南极洲 (Antarctica)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="flag">国旗图标</Label>
          <Input
            id="flag"
            value={formData.extraData?.flag || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              extraData: { ...prev.extraData, flag: e.target.value }
            }))}
            placeholder="如：🇨🇳"
          />
        </div>
      </>
    )
  }

  if (categoryLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
          <div className="h-8 bg-muted animate-pulse rounded w-40" />
        </div>
      </div>
    )
  }

  if (error || !category) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
        </div>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            加载字典分类失败: {(error as any)?.message || '分类不存在'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6" />
            <div>
              <h1 className="text-2xl font-bold">{category.name['zh-CN']} 字典项管理</h1>
              <p className="text-muted-foreground">分类代码: {category.code}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* 语言切换 */}
          <Select value={currentLang} onValueChange={(value: 'zh-CN' | 'en' | 'es') => setCurrentLang(value)}>
            <SelectTrigger className="w-32">
              <Globe className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="zh-CN">中文</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            新增字典项
          </Button>
        </div>
      </div>

      {/* 分类信息卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{category.name['zh-CN']}</span>
            <div className="flex items-center gap-2">
              {getSystemBadge(category.isSystem)}
              {getStatusBadge(category.isActive)}
            </div>
          </CardTitle>
          {category.description && (
            <CardDescription>
              {category.description['zh-CN']}
            </CardDescription>
          )}
        </CardHeader>
      </Card>

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
                    placeholder="搜索字典项名称..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-8"
                  />
                </div>
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

      {/* 字典项列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            字典项列表
          </CardTitle>
          <CardDescription>
            {data && `共 ${data.meta.totalItems} 个字典项，当前显示第 ${data.meta.currentPage} 页`}
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
                    <TableHead>代码</TableHead>
                    <TableHead>名称</TableHead>
                    {isCountriesCategory && <TableHead>国旗</TableHead>}
                    {isCountriesCategory && <TableHead>ISO代码</TableHead>}
                    {isCountriesCategory && <TableHead>区号</TableHead>}
                    <TableHead>类型</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>排序</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium font-mono">
                        {item.code}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-semibold">
                            {isCountriesCategory 
                              ? getCountryDisplayName(item.name, currentLang)
                              : (item.name[currentLang] || item.name['zh-CN'])
                            }
                          </div>
                          {currentLang !== 'zh-CN' && item.name['zh-CN'] && (
                            <div className="text-sm text-muted-foreground">
                              {isCountriesCategory 
                                ? getCountryDisplayName(item.name, 'zh-CN')
                                : item.name['zh-CN']
                              }
                            </div>
                          )}
                        </div>
                      </TableCell>
                      {isCountriesCategory && (
                        <TableCell>
                          <span className="text-2xl" title={`${getCountryDisplayName(item.name, 'zh-CN')}国旗`}>
                            {getCountryFlag(item.extraData, item.name, item.code)}
                          </span>
                        </TableCell>
                      )}
                      {isCountriesCategory && (
                        <TableCell>
                          <div className="font-mono text-sm">
                            <div>{item.extraData?.iso2}</div>
                            <div className="text-muted-foreground">{item.extraData?.iso3}</div>
                          </div>
                        </TableCell>
                      )}
                      {isCountriesCategory && (
                        <TableCell>
                          <Badge variant="outline">{item.extraData?.countryCode}</Badge>
                        </TableCell>
                      )}
                      <TableCell>{getSystemBadge(item.isSystem)}</TableCell>
                      <TableCell>{getStatusBadge(item.isActive)}</TableCell>
                      <TableCell>{item.sortOrder}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(item)}
                            title="编辑字典项"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!item.isSystem && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(item)}
                              disabled={deleteMutation.isPending}
                              title="删除字典项"
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

      {/* 新增字典项对话框 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新增字典项</DialogTitle>
            <DialogDescription>
              为 "{category?.name['zh-CN']}" 分类创建新的字典项
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">字典项代码 *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="如：supplier"
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

            <Tabs defaultValue="zh-CN" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="zh-CN">中文</TabsTrigger>
                <TabsTrigger value="en">English</TabsTrigger>
                <TabsTrigger value="es">Español</TabsTrigger>
              </TabsList>
              
              <TabsContent value="zh-CN" className="space-y-4">
                <div>
                  <Label htmlFor="name-zh">中文名称 *</Label>
                  <Input
                    id="name-zh"
                    value={formData.name['zh-CN']}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      name: { ...prev.name, 'zh-CN': e.target.value }
                    }))}
                    placeholder="如：供应商"
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
                    placeholder="字典项的详细描述"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="en" className="space-y-4">
                <div>
                  <Label htmlFor="name-en">English Name</Label>
                  <Input
                    id="name-en"
                    value={formData.name.en}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      name: { ...prev.name, en: e.target.value }
                    }))}
                    placeholder="e.g., Supplier"
                  />
                </div>
                <div>
                  <Label htmlFor="desc-en">English Description</Label>
                  <Textarea
                    id="desc-en"
                    value={formData.description?.en || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      description: { ...prev.description, en: e.target.value }
                    }))}
                    placeholder="Detailed description of the dictionary item"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="es" className="space-y-4">
                <div>
                  <Label htmlFor="name-es">Nombre en Español</Label>
                  <Input
                    id="name-es"
                    value={formData.name.es || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      name: { ...prev.name, es: e.target.value }
                    }))}
                    placeholder="ej., Proveedor"
                  />
                </div>
                <div>
                  <Label htmlFor="desc-es">Descripción en Español</Label>
                  <Textarea
                    id="desc-es"
                    value={formData.description?.es || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      description: { ...prev.description, es: e.target.value }
                    }))}
                    placeholder="Descripción detallada del elemento del diccionario"
                  />
                </div>
              </TabsContent>
            </Tabs>

            {renderCountrySpecialFields()}
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
              创建字典项
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑字典项对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑字典项</DialogTitle>
            <DialogDescription>
              修改字典项的基本信息
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-code">字典项代码 *</Label>
                <Input
                  id="edit-code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  disabled={editingItem?.isSystem}
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

            <Tabs defaultValue="zh-CN" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="zh-CN">中文</TabsTrigger>
                <TabsTrigger value="en">English</TabsTrigger>
                <TabsTrigger value="es">Español</TabsTrigger>
              </TabsList>
              
              <TabsContent value="zh-CN" className="space-y-4">
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
              </TabsContent>
              
              <TabsContent value="en" className="space-y-4">
                <div>
                  <Label htmlFor="edit-name-en">English Name</Label>
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
                  <Label htmlFor="edit-desc-en">English Description</Label>
                  <Textarea
                    id="edit-desc-en"
                    value={formData.description?.en || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      description: { ...prev.description, en: e.target.value }
                    }))}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="es" className="space-y-4">
                <div>
                  <Label htmlFor="edit-name-es">Nombre en Español</Label>
                  <Input
                    id="edit-name-es"
                    value={formData.name.es || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      name: { ...prev.name, es: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-desc-es">Descripción en Español</Label>
                  <Textarea
                    id="edit-desc-es"
                    value={formData.description?.es || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      description: { ...prev.description, es: e.target.value }
                    }))}
                  />
                </div>
              </TabsContent>
            </Tabs>

            {renderCountrySpecialFields()}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false)
                setEditingItem(null)
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