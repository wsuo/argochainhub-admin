'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Upload,
  X,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  FileImage,
  Eye,
  Clock,
  Edit,
  Save,
  Loader2
} from 'lucide-react'
import { useParsePriceImage, useTaskStatus, useSavePriceData } from '@/hooks/use-api'
import { cn } from '@/lib/utils'
import type { TaskStatusResponse, ImageParseResult } from '@/lib/types'

interface ImageUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// 定义组件的不同阶段
type DialogStage = 'upload' | 'processing' | 'preview' | 'completed'

// 编辑数据接口
interface EditableData {
  productName: string
  weekEndDate: string
  unitPrice: number
  id: string // 用于唯一标识
}

export function ImageUploadDialog({ open, onOpenChange }: ImageUploadDialogProps) {
  // 基础状态
  const [files, setFiles] = useState<File[]>([])
  const [exchangeRate, setExchangeRate] = useState('7.2100')
  const [dragActive, setDragActive] = useState(false)
  const [justPasted, setJustPasted] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  
  // 任务相关状态
  const [currentStage, setCurrentStage] = useState<DialogStage>('upload')
  const [taskId, setTaskId] = useState<string | null>(null)
  const [initialTaskResponse, setInitialTaskResponse] = useState<any>(null) // 存储初始任务响应
  const [editableData, setEditableData] = useState<EditableData[]>([])
  const [taskResult, setTaskResult] = useState<TaskStatusResponse | null>(null)
  const [saveErrors, setSaveErrors] = useState<string[]>([]) // 存储保存过程中的错误
  
  // API hooks
  const parseMutation = useParsePriceImage()
  const { data: taskStatus, isLoading: isTaskLoading, error: taskError } = useTaskStatus(taskId, currentStage === 'processing')
  const saveMutation = useSavePriceData()
  
  // 调试信息
  useEffect(() => {
    console.log('🎯 Dialog state changed:', { 
      currentStage, 
      taskId, 
      hasTaskStatus: !!taskStatus,
      taskStatus: taskStatus?.status,
      isEnabled: currentStage === 'processing'
    })
  }, [currentStage, taskId, taskStatus])
  
  // 处理轮询错误
  useEffect(() => {
    if (taskError && currentStage === 'processing') {
      console.error('Task status polling error:', taskError)
      // 如果轮询出错，显示错误信息但不改变阶段
    }
  }, [taskError, currentStage])
  
  // 处理任务状态变化
  useEffect(() => {
    if (taskStatus) {
      setTaskResult(taskStatus)
      
      if (taskStatus.status === 'completed') {
        // 任务完成，准备编辑数据
        const allData: EditableData[] = []
        taskStatus.imageResults.forEach(result => {
          result.parsedData.forEach((item, index) => {
            allData.push({
              ...item,
              id: `${result.imageIndex}-${index}`
            })
          })
        })
        setEditableData(allData)
        setCurrentStage('preview')
      }
      // 失败状态保持在processing阶段，通过UI显示错误信息
    }
  }, [taskStatus])
  
  // 处理剪切板粘贴
  const handlePaste = useCallback((e: ClipboardEvent) => {
    // 只在对话框打开且上传阶段时处理粘贴
    if (!open || currentStage !== 'upload') return
    
    const items = e.clipboardData?.items
    if (!items) return
    
    const imageFiles: File[] = []
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) {
          // 为剪切板图片生成一个名称
          const timestamp = new Date().getTime()
          const extension = file.type.split('/')[1] || 'png'
          const renamedFile = new File([file], `pasted-image-${timestamp}.${extension}`, {
            type: file.type
          })
          imageFiles.push(renamedFile)
        }
      }
    }
    
    if (imageFiles.length > 0) {
      setFiles(prev => [...prev, ...imageFiles].slice(0, 10))
      setJustPasted(true)
      // 3秒后清除粘贴提示
      setTimeout(() => setJustPasted(false), 3000)
      e.preventDefault()
    }
  }, [open, currentStage])
  
  // 监听全局粘贴事件
  useEffect(() => {
    if (open && currentStage === 'upload') {
      document.addEventListener('paste', handlePaste)
      return () => {
        document.removeEventListener('paste', handlePaste)
      }
    }
  }, [open, currentStage, handlePaste])
  
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    )
    
    if (droppedFiles.length > 0) {
      setFiles(prev => [...prev, ...droppedFiles].slice(0, 10))
    }
  }, [])
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []).filter(file =>
      file.type.startsWith('image/')
    )
    
    if (selectedFiles.length > 0) {
      setFiles(prev => [...prev, ...selectedFiles].slice(0, 10))
    }
  }
  
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }
  
  const previewFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }
  
  const handleSubmit = async () => {
    if (files.length === 0 || !exchangeRate) return
    
    console.log('📤 Starting image upload...', { fileCount: files.length, exchangeRate })
    
    try {
      const result = await parseMutation.mutateAsync({
        images: files,
        exchangeRate: parseFloat(exchangeRate)
      })
      
      console.log('✅ Upload successful, result:', result)
      
      setTaskId(result.taskId)
      setInitialTaskResponse(result) // 保存初始响应，包含estimatedTime
      setCurrentStage('processing')
      
      console.log('🔄 Set processing stage with taskId:', result.taskId)
    } catch (error) {
      console.error('❌ Upload failed:', error)
      // 错误已由mutation处理
    }
  }
  
  const handleSaveData = async () => {
    if (editableData.length === 0) return
    
    try {
      const result = await saveMutation.mutateAsync({
        taskId,
        exchangeRate: parseFloat(exchangeRate),
        priceData: editableData.map(item => ({
          productName: item.productName,
          weekEndDate: item.weekEndDate,
          unitPrice: item.unitPrice
        }))
      })
      
      // 存储保存过程中的错误信息
      if (result.errors && result.errors.length > 0) {
        setSaveErrors(result.errors)
      } else {
        setSaveErrors([])
      }
      
      setCurrentStage('completed')
    } catch (error) {
      // 错误已由mutation处理
    }
  }
  
  const handleDataEdit = (id: string, field: keyof Omit<EditableData, 'id'>, value: string | number) => {
    setEditableData(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }
  
  const handleDeleteData = (id: string) => {
    setEditableData(prev => prev.filter(item => item.id !== id))
  }
  
  const handleClose = () => {
    // 在处理阶段禁止关闭弹窗
    if (currentStage === 'processing') {
      return
    }
    
    setFiles([])
    setExchangeRate('7.2100')
    setCurrentStage('upload')
    setTaskId(null)
    setInitialTaskResponse(null)
    setEditableData([])
    setTaskResult(null)
    setSaveErrors([])
    setJustPasted(false)
    setPreviewImage(null)
    onOpenChange(false)
  }
  
  const handleForceClose = () => {
    // 强制关闭（用于错误情况或完成后）
    setFiles([])
    setExchangeRate('7.2100')
    setCurrentStage('upload')
    setTaskId(null)
    setInitialTaskResponse(null)
    setEditableData([])
    setTaskResult(null)
    setSaveErrors([])
    setJustPasted(false)
    setPreviewImage(null)
    onOpenChange(false)
  }
  
  const handleRestart = () => {
    setCurrentStage('upload')
    setTaskId(null)
    setInitialTaskResponse(null)
    setEditableData([])
    setTaskResult(null)
    setSaveErrors([])
    setFiles([])
  }
  
  const getStageTitle = () => {
    switch (currentStage) {
      case 'upload': return '上传图片解析价格'
      case 'processing': return '正在解析图片'
      case 'preview': return '预览和编辑数据'
      case 'completed': return '解析完成'
      default: return '上传图片解析价格'
    }
  }
  
  const getStageDescription = () => {
    switch (currentStage) {
      case 'upload': return '上传包含价格数据的图片，系统将自动识别并解析价格信息。支持拖拽、选择文件或直接粘贴剪切板中的图片。'
      case 'processing': return '系统正在后台解析您上传的图片，请稍等...'
      case 'preview': return '请检查解析结果，您可以编辑数据后再保存到系统中。'
      case 'completed': return '价格数据已成功保存到系统中。'
      default: return ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={cn(
        "sm:max-w-[600px]",
        currentStage === 'preview' && "sm:max-w-[900px]"
      )}>
        <DialogHeader>
          <DialogTitle>{getStageTitle()}</DialogTitle>
          <DialogDescription>
            {getStageDescription()}
          </DialogDescription>
        </DialogHeader>
        
        {/* 上传阶段 */}
        {currentStage === 'upload' && (
          <div className="space-y-6">
            {/* 汇率输入 */}
            <div className="space-y-2">
              <Label htmlFor="exchangeRate">当前汇率</Label>
              <Input
                id="exchangeRate"
                type="number"
                step="0.0001"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
                placeholder="7.2100"
              />
              <p className="text-sm text-muted-foreground">
                人民币对美元汇率（1美元 = ?人民币）
              </p>
            </div>
            
            {/* 文件上传区域 */}
            <div
              className={cn(
                "relative rounded-lg border-2 border-dashed p-8 text-center transition-colors",
                dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                files.length > 0 && "pb-4"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              />
              
              <div className="space-y-3">
                <div className="mx-auto h-12 w-12 text-muted-foreground">
                  <Upload className="h-full w-full" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    拖拽图片到此处，或点击选择文件
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    支持 PNG、JPEG、GIF、WebP 格式，最多10张，单文件最大10MB
                  </p>
                  <p className="text-xs text-primary mt-1 flex items-center justify-center gap-1">
                    💡 提示：您也可以直接粘贴剪切板中的图片 (Ctrl+V 或 Cmd+V)
                  </p>
                </div>
              </div>
            </div>
            
            {/* 粘贴成功提示 */}
            {justPasted && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  ✨ 已成功粘贴剪切板中的图片！
                </AlertDescription>
              </Alert>
            )}
            
            {/* 已选择的文件列表 */}
            {files.length > 0 && (
              <div className="space-y-2">
                <Label>已选择的文件 ({files.length}/10)</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
                      <FileImage className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          {file.name.startsWith('pasted-image-') && (
                            <Badge variant="secondary" className="text-xs px-1 py-0">
                              粘贴
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => previewFile(file)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 操作按钮 */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleClose}>
                取消
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={files.length === 0 || !exchangeRate || parseMutation.isPending}
              >
                {parseMutation.isPending ? (
                  <>
                    <span className="mr-2">创建任务...</span>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    开始解析
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
        
        {/* 处理中阶段 */}
        {currentStage === 'processing' && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
              <h3 className="text-lg font-semibold mb-2">正在解析图片</h3>
              <p className="text-muted-foreground mb-4">
                预计{initialTaskResponse?.estimatedTime || '1-2 分钟'}完成
              </p>
              
              {taskResult && (
                <div className="space-y-4">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${taskResult.progress}%` }}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    已处理 {taskResult.processedImages} / {taskResult.totalImages} 张图片
                    {process.env.NODE_ENV === 'development' && (
                      <div className="text-xs mt-1 opacity-50">
                        状态: {taskResult.status} | 任务ID: {taskId?.slice(-8)}
                      </div>
                    )}
                  </div>
                  {taskResult.status === 'failed' && (
                    <div className="mt-4">
                      <Alert className="border-destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-destructive">
                          解析失败，请重试或联系管理员
                          {taskResult.globalErrors && taskResult.globalErrors.length > 0 && (
                            <div className="mt-2 text-sm">
                              {taskResult.globalErrors.map((error, index) => (
                                <div key={index}>• {error}</div>
                              ))}
                            </div>
                          )}
                        </AlertDescription>
                      </Alert>
                      <div className="flex justify-center mt-4">
                        <Button variant="outline" onClick={handleForceClose}>
                          关闭
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* 只在失败时显示关闭按钮 */}
            {taskResult?.status !== 'failed' && !taskError && (
              <div className="text-center text-sm text-muted-foreground">
                处理中请勿关闭此窗口
              </div>
            )}
            
            {/* 轮询错误提示 */}
            {taskError && (
              <div className="mt-4">
                <Alert className="border-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-destructive">
                    无法获取任务状态，请检查网络连接
                  </AlertDescription>
                </Alert>
                <div className="flex justify-center mt-4">
                  <Button variant="outline" onClick={handleForceClose}>
                    关闭
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* 预览编辑阶段 */}
        {currentStage === 'preview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  共解析出 {editableData.length} 条价格数据，请检查并编辑后保存
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleRestart}>
                  重新上传
                </Button>
                <Button onClick={handleSaveData} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      保存数据
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {/* 编辑表格 */}
            <div className="border rounded-lg max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-3 w-2/5">产品名称</th>
                    <th className="text-left p-3 w-1/5">周结束日期</th>
                    <th className="text-right p-3 w-1/5">单价(元/吨·千升)</th>
                    <th className="text-center p-3 w-1/5">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {editableData.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/30">
                      <td className="p-2">
                        <Input
                          value={item.productName}
                          onChange={(e) => handleDataEdit(item.id, 'productName', e.target.value)}
                          className="h-8 text-sm"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="date"
                          value={item.weekEndDate}
                          onChange={(e) => handleDataEdit(item.id, 'weekEndDate', e.target.value)}
                          className="h-8 text-sm"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleDataEdit(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="h-8 text-sm text-right"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteData(item.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {editableData.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                没有可编辑的数据
              </div>
            )}
          </div>
        )}
        
        {/* 完成阶段 */}
        {currentStage === 'completed' && (
          <div className="space-y-6">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                价格数据已成功保存到系统中！
              </AlertDescription>
            </Alert>
            
            {/* 显示保存过程中的错误信息 */}
            {saveErrors.length > 0 && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription>
                  <div className="text-yellow-800">
                    <p className="font-medium mb-2">保存过程中遇到以下问题：</p>
                    <ul className="space-y-1 text-sm">
                      {saveErrors.map((error, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-yellow-600 mt-0.5">•</span>
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs mt-2 opacity-75">
                      提示：请确保相关的农药产品已在系统中创建
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleRestart}>
                继续上传
              </Button>
              <Button onClick={handleForceClose}>
                关闭
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
      
      {/* 图片预览对话框 */}
      {previewImage && (
        <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>图片预览</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center">
              <img 
                src={previewImage} 
                alt="预览图片" 
                className="max-w-full max-h-[600px] object-contain rounded-lg"
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setPreviewImage(null)}>
                关闭
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  )
}