'use client'

import { useState, useCallback } from 'react'
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
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Upload,
  X,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  FileImage
} from 'lucide-react'
import { useParsePriceImage } from '@/hooks/use-api'
import { cn } from '@/lib/utils'

interface ImageUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImageUploadDialog({ open, onOpenChange }: ImageUploadDialogProps) {
  const [files, setFiles] = useState<File[]>([])
  const [exchangeRate, setExchangeRate] = useState('7.2100')
  const [dragActive, setDragActive] = useState(false)
  const [parseResult, setParseResult] = useState<any>(null)
  
  const parseMutation = useParsePriceImage()
  
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
  
  const handleSubmit = async () => {
    if (files.length === 0 || !exchangeRate) return
    
    try {
      const result = await parseMutation.mutateAsync({
        images: files,
        exchangeRate: parseFloat(exchangeRate)
      })
      setParseResult(result)
    } catch (error) {
      // 错误已由mutation处理
    }
  }
  
  const handleClose = () => {
    setFiles([])
    setExchangeRate('7.2100')
    setParseResult(null)
    onOpenChange(false)
  }
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>上传图片解析价格</DialogTitle>
          <DialogDescription>
            上传包含价格数据的图片，系统将自动识别并解析价格信息
          </DialogDescription>
        </DialogHeader>
        
        {!parseResult ? (
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
                </div>
              </div>
            </div>
            
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
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
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
                    <span className="mr-2">解析中...</span>
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
        ) : (
          <div className="space-y-6">
            {/* 解析结果 */}
            <Alert className={parseResult.successfulSaves > 0 ? '' : 'border-destructive'}>
              <div className="flex items-start gap-3">
                {parseResult.successfulSaves > 0 ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                )}
                <div className="flex-1">
                  <AlertDescription className="text-base font-medium mb-2">
                    解析完成
                  </AlertDescription>
                  <div className="space-y-1 text-sm">
                    <p>图片数量：{parseResult.totalImages} 张</p>
                    <p>解析数据：{parseResult.totalParsedData} 条</p>
                    <p>成功保存：{parseResult.successfulSaves} 条</p>
                    {parseResult.failedSaves > 0 && (
                      <p className="text-destructive">
                        失败数量：{parseResult.failedSaves} 条
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Alert>
            
            {/* 错误信息 */}
            {parseResult.errors && parseResult.errors.length > 0 && (
              <div className="space-y-2">
                <Label>错误信息</Label>
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 space-y-1">
                  {parseResult.errors.map((error: string, index: number) => (
                    <p key={index} className="text-sm text-destructive">
                      • {error}
                    </p>
                  ))}
                </div>
              </div>
            )}
            
            {/* 解析的数据预览 */}
            {parseResult.parsedData && parseResult.parsedData.length > 0 && (
              <div className="space-y-2">
                <Label>解析的数据</Label>
                <div className="rounded-lg border max-h-48 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/50">
                      <tr>
                        <th className="text-left p-2">产品名称</th>
                        <th className="text-left p-2">日期</th>
                        <th className="text-right p-2">价格</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parseResult.parsedData.slice(0, 10).map((item: any, index: number) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{item.productName}</td>
                          <td className="p-2">{item.weekEndDate}</td>
                          <td className="p-2 text-right">
                            ¥{item.unitPrice.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parseResult.parsedData.length > 10 && (
                    <p className="text-center text-sm text-muted-foreground py-2">
                      还有 {parseResult.parsedData.length - 10} 条数据...
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* 操作按钮 */}
            <div className="flex justify-end">
              <Button onClick={handleClose}>
                完成
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}