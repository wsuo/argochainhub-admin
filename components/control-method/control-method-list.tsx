'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  GripVertical,
  Target,
  AlertTriangle,
  Upload
} from 'lucide-react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { ControlMethod } from '@/lib/types'
import { 
  useControlMethods, 
  useDeleteControlMethod, 
  useUpdateControlMethodOrder 
} from '@/hooks/use-api'

export interface ControlMethodListProps {
  productId: number
  onEdit: (method: ControlMethod) => void
  onCreateNew: () => void
  onBatchCreate: () => void
}

export function ControlMethodList({ 
  productId, 
  onEdit, 
  onCreateNew, 
  onBatchCreate 
}: ControlMethodListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [methodToDelete, setMethodToDelete] = useState<number | null>(null)

  const { data: methods, isLoading, error } = useControlMethods(productId)
  const deleteMutation = useDeleteControlMethod()
  const updateOrderMutation = useUpdateControlMethodOrder()

  const handleDeleteClick = (methodId: number) => {
    setMethodToDelete(methodId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (methodToDelete) {
      await deleteMutation.mutateAsync(methodToDelete)
      setDeleteDialogOpen(false)
      setMethodToDelete(null)
    }
  }

  const handleDragEnd = async (result: any) => {
    if (!result.destination || !methods) return

    const items = Array.from(methods)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // 更新排序
    const orderData = {
      methodIds: items.map(item => item.id)
    }

    await updateOrderMutation.mutateAsync({
      productId,
      data: orderData
    })
  }

  const getMultiLangText = (text: any, lang: 'zh-CN' | 'en' = 'zh-CN'): string => {
    if (!text) return ''
    if (typeof text === 'string') return text
    return text[lang] || text['zh-CN'] || text.zh || ''
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            防治方法
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <p className="text-sm text-destructive">
                加载防治方法失败: {(error as any).message}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              防治方法
            </CardTitle>
            <CardDescription>
              管理产品的防治对象和使用方法
              {methods && methods.length > 0 && ` (共 ${methods.length} 个)`}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onBatchCreate}>
              <Upload className="h-4 w-4 mr-2" />
              批量导入
            </Button>
            <Button size="sm" onClick={onCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              添加防治方法
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : !methods || methods.length === 0 ? (
          <div className="text-center py-12">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">暂无防治方法</h3>
            <p className="text-muted-foreground mb-4">
              还没有为该产品添加防治方法
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={onCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                添加第一个防治方法
              </Button>
              <Button variant="outline" onClick={onBatchCreate}>
                <Upload className="h-4 w-4 mr-2" />
                批量导入
              </Button>
            </div>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="control-methods">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40px]">排序</TableHead>
                        <TableHead>防治对象</TableHead>
                        <TableHead>使用方法</TableHead>
                        <TableHead>用药量</TableHead>
                        <TableHead>施药次数</TableHead>
                        <TableHead>安全间隔期</TableHead>
                        <TableHead className="w-[100px]">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {methods.map((method, index) => (
                        <Draggable 
                          key={method.id} 
                          draggableId={method.id.toString()} 
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <TableRow
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={snapshot.isDragging ? "opacity-50" : ""}
                            >
                              <TableCell>
                                <div 
                                  {...provided.dragHandleProps}
                                  className="cursor-grab active:cursor-grabbing"
                                >
                                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                                </div>
                              </TableCell>
                              
                              <TableCell>
                                <div>
                                  <div className="font-medium">
                                    {getMultiLangText(method.targetCrop, 'zh-CN')}
                                  </div>
                                  {getMultiLangText(method.targetCrop, 'en') && (
                                    <div className="text-sm text-muted-foreground">
                                      {getMultiLangText(method.targetCrop, 'en')}
                                    </div>
                                  )}
                                  {method.pestDisease && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      防治: {getMultiLangText(method.pestDisease, 'zh-CN')}
                                    </div>
                                  )}
                                </div>
                              </TableCell>

                              <TableCell>
                                <div>
                                  <div className="font-medium">
                                    {getMultiLangText(method.applicationMethod, 'zh-CN')}
                                  </div>
                                  {getMultiLangText(method.applicationMethod, 'en') && (
                                    <div className="text-sm text-muted-foreground">
                                      {getMultiLangText(method.applicationMethod, 'en')}
                                    </div>
                                  )}
                                </div>
                              </TableCell>

                              <TableCell>
                                <span className="font-medium">
                                  {getMultiLangText(method.dosage, 'zh-CN')}
                                </span>
                              </TableCell>

                              <TableCell>
                                <Badge variant="outline">
                                  {typeof method.applicationTimes === 'object' 
                                    ? getMultiLangText(method.applicationTimes, 'zh-CN')
                                    : method.applicationTimes}次
                                </Badge>
                              </TableCell>

                              <TableCell>
                                <Badge variant="secondary">
                                  {typeof method.safetyInterval === 'object' 
                                    ? getMultiLangText(method.safetyInterval, 'zh-CN')
                                    : method.safetyInterval}天
                                </Badge>
                              </TableCell>

                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <span className="sr-only">打开菜单</span>
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>操作</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => onEdit(method)}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      编辑
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteClick(method.id)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      删除
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </CardContent>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除防治方法</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将永久删除该防治方法信息。
              该操作无法撤销，请确认是否继续。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? '删除中...' : '确认删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}