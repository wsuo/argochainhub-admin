'use client'

import React, { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import Cookies from 'js-cookie'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Upload, 
  File, 
  Image, 
  X, 
  Eye, 
  Download, 
  AlertCircle,
  Check
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UploadFile, UploadFileRequest } from '@/lib/types'

interface FileUploadProps {
  value?: string[]
  onChange?: (urls: string[]) => void
  maxFiles?: number
  maxSize?: number // bytes
  accept?: Record<string, string[]>
  fileType: 'product_image' | 'company_certificate' | 'sample_document' | 'registration_document' | 'other'
  relatedId?: number
  className?: string
  preview?: boolean
  disabled?: boolean
}

export function FileUpload({
  value = [],
  onChange,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'text/plain': ['.txt']
  },
  fileType,
  relatedId,
  className,
  preview = true,
  disabled = false
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([])
  const [error, setError] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const [previewTitle, setPreviewTitle] = useState('')

  // 处理模态框打开时的页面滚动锁定
  useEffect(() => {
    if (previewOpen) {
      // 记录当前滚动位置
      const currentScrollY = window.scrollY
      
      // 保存当前滚动位置到自定义属性
      document.body.setAttribute('data-scroll-lock-offset', currentScrollY.toString())
      
      // 锁定页面滚动
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${currentScrollY}px`
      document.body.style.width = '100%'
    } else {
      // 获取之前保存的滚动位置
      const savedOffset = document.body.getAttribute('data-scroll-lock-offset')
      
      // 恢复页面滚动
      document.body.style.overflow = 'unset'
      document.body.style.position = 'static'
      document.body.style.top = 'auto'
      document.body.style.width = 'auto'
      
      // 恢复滚动位置
      if (savedOffset) {
        const scrollPosition = parseInt(savedOffset, 10)
        window.scrollTo(0, scrollPosition)
        
        // 清除保存的偏移量
        document.body.removeAttribute('data-scroll-lock-offset')
      }
    }

    // 清理函数：组件卸载时恢复滚动
    return () => {
      const savedOffset = document.body.getAttribute('data-scroll-lock-offset')
      if (savedOffset) {
        document.body.style.overflow = 'unset'
        document.body.style.position = 'static'
        document.body.style.top = 'auto'
        document.body.style.width = 'auto'
        document.body.removeAttribute('data-scroll-lock-offset')
        
        const scrollPosition = parseInt(savedOffset, 10)
        window.scrollTo(0, scrollPosition)
      }
    }
  }, [previewOpen])

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', fileType)
    if (relatedId) {
      formData.append('relatedId', relatedId.toString())
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3010/api/v1'
    const token = Cookies.get('auth_token')
    
    const response = await fetch(`${API_BASE_URL}/uploads`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || '文件上传失败')
    }

    const uploadedFile: UploadFile = await response.json()
    setUploadedFiles(prev => [...prev, uploadedFile])
    return uploadedFile.url
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled) return

    setError(null)
    setUploading(true)
    setUploadProgress(0)

    try {
      const newUrls: string[] = []
      const totalFiles = acceptedFiles.length
      
      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i]
        
        // 检查文件大小
        if (file.size > maxSize) {
          throw new Error(`文件 ${file.name} 超过大小限制 (${(maxSize / 1024 / 1024).toFixed(1)}MB)`)
        }

        // 检查文件数量限制
        if (value.length + newUrls.length >= maxFiles) {
          throw new Error(`最多只能上传 ${maxFiles} 个文件`)
        }

        const url = await uploadFile(file)
        newUrls.push(url)
        
        // 更新进度
        setUploadProgress(((i + 1) / totalFiles) * 100)
      }

      // 更新父组件的值
      const updatedUrls = [...value, ...newUrls]
      onChange?.(updatedUrls)

    } catch (error: any) {
      setError(error.message)
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [value, onChange, maxFiles, maxSize, fileType, relatedId, disabled])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    disabled: disabled || uploading || value.length >= maxFiles,
    multiple: maxFiles > 1
  })

  const removeFile = (urlToRemove: string) => {
    if (disabled) return
    const updatedUrls = value.filter(url => url !== urlToRemove)
    onChange?.(updatedUrls)
    setUploadedFiles(prev => prev.filter(file => file.url !== urlToRemove))
  }

  const handlePreview = (url: string, filename: string) => {
    setPreviewUrl(url)
    setPreviewTitle(filename)
    setPreviewOpen(true)
  }

  const handleDownload = async (url: string, filename: string) => {
    // 保存当前滚动位置
    const currentScrollY = window.scrollY
    
    try {
      // 对于外部CDN链接，直接使用a标签下载，避免CORS问题
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      
      // 策略：隐藏式下载，避免影响页面布局和焦点
      link.style.display = 'none'
      link.style.position = 'fixed'
      link.style.top = '-9999px'
      link.style.left = '-9999px'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // 确保滚动位置没有变化
      if (window.scrollY !== currentScrollY) {
        window.scrollTo(0, currentScrollY)
      }
      
    } catch (error) {
      console.error('下载失败:', error)
      // 如果下载失败，尝试直接打开链接
      const newWindow = window.open(url, '_blank')
      if (!newWindow) {
        console.error('无法打开新窗口 - 可能被弹窗拦截器阻止')
      }
      
      // 确保滚动位置没有变化
      if (window.scrollY !== currentScrollY) {
        window.scrollTo(0, currentScrollY)
      }
    }
  }

  const getFileIcon = (url: string) => {
    const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(url)
    return isImage ? <Image className="h-4 w-4" /> : <File className="h-4 w-4" />
  }

  const getFileName = (url: string) => {
    const uploadedFile = uploadedFiles.find(file => file.url === url)
    if (uploadedFile) {
      return uploadedFile.originalName
    }
    return url.split('/').pop() || 'Unknown file'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* 拖拽上传区域 */}
      {value.length < maxFiles && (
        <Card>
          <CardContent className="p-6">
            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25',
                disabled || uploading ? 'cursor-not-allowed opacity-50' : 'hover:border-primary',
                'flex flex-col items-center justify-center min-h-[120px]'
              )}
            >
              <input {...getInputProps()} />
              <Upload className="h-10 w-10 text-muted-foreground mb-4" />
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {isDragActive ? '释放文件到这里' : '点击上传或拖拽文件到这里'}
                </p>
                <p className="text-xs text-muted-foreground">
                  支持的格式：图片、PDF、Office文档 | 最大 {(maxSize / 1024 / 1024).toFixed(1)}MB
                  {maxFiles > 1 && ` | 最多 ${maxFiles} 个文件`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 上传进度 */}
      {uploading && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Upload className="h-5 w-5 animate-bounce" />
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>正在上传...</span>
                  <span>{uploadProgress.toFixed(0)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 错误提示 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 已上传文件列表 */}
      {value.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">已上传文件</h4>
                <Badge variant="secondary">{value.length}/{maxFiles}</Badge>
              </div>
              
              <div className="space-y-2">
                {value.map((url, index) => {
                  const uploadedFile = uploadedFiles.find(file => file.url === url)
                  const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(url)
                  
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50"
                    >
                      {getFileIcon(url)}
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {getFileName(url)}
                        </p>
                        {uploadedFile && (
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(uploadedFile.size)} • {uploadedFile.mimetype}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {preview && isImage && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePreview(url, getFileName(url))}
                            title="预览"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(url, getFileName(url))}
                          title="下载"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        
                        {!disabled && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(url)}
                            title="删除"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 图片预览模态框 */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-lg font-medium truncate">
              {previewTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-6 pt-4">
            <img
              src={previewUrl}
              alt={previewTitle}
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
              onError={(e) => {
                console.error('图片加载失败:', previewUrl)
                e.currentTarget.src = '/placeholder-image.svg'
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// 专门用于图片上传的组件
interface ImageUploadProps extends Omit<FileUploadProps, 'accept' | 'fileType'> {
  fileType?: 'product_image' | 'company_certificate'
}

export function ImageUpload({ 
  fileType = 'company_certificate',
  ...props 
}: ImageUploadProps) {
  return (
    <FileUpload
      accept={{
        'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
      }}
      fileType={fileType}
      {...props}
    />
  )
}