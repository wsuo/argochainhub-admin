'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  AlertTriangle, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Server, 
  Bug,
  HelpCircle,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react'
import { toast } from 'sonner'

export interface ErrorDisplayProps {
  error: any
  title?: string
  description?: string
  showRetry?: boolean
  onRetry?: () => void
  showReportBug?: boolean
  className?: string
}

export function ErrorDisplay({
  error,
  title = "出现错误",
  description,
  showRetry = true,
  onRetry,
  showReportBug = false,
  className = ""
}: ErrorDisplayProps) {
  const [copied, setCopied] = useState(false)

  const getErrorType = (error: any) => {
    if (!error) return 'unknown'
    
    const message = error.message || error.toString()
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'network'
    }
    if (message.includes('401') || message.includes('unauthorized')) {
      return 'auth'
    }
    if (message.includes('403') || message.includes('forbidden')) {
      return 'permission'
    }
    if (message.includes('404') || message.includes('not found')) {
      return 'notfound'
    }
    if (message.includes('500') || message.includes('server')) {
      return 'server'
    }
    
    return 'unknown'
  }

  const getErrorInfo = (type: string) => {
    switch (type) {
      case 'network':
        return {
          icon: WifiOff,
          title: '网络连接错误',
          description: '无法连接到服务器，请检查网络连接',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        }
      case 'auth':
        return {
          icon: AlertTriangle,
          title: '认证失败',
          description: '登录已过期，请重新登录',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        }
      case 'permission':
        return {
          icon: AlertTriangle,
          title: '权限不足',
          description: '您没有权限执行此操作',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        }
      case 'notfound':
        return {
          icon: HelpCircle,
          title: '资源不存在',
          description: '请求的资源未找到',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        }
      case 'server':
        return {
          icon: Server,
          title: '服务器错误',
          description: '服务器遇到问题，请稍后重试',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200'
        }
      default:
        return {
          icon: Bug,
          title: '未知错误',
          description: '发生了预期之外的错误',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        }
    }
  }

  const errorType = getErrorType(error)
  const errorInfo = getErrorInfo(errorType)
  const Icon = errorInfo.icon

  const copyErrorDetails = async () => {
    const errorDetails = {
      message: error.message || error.toString(),
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    }

    try {
      await navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
      setCopied(true)
      toast.success('错误详情已复制到剪贴板')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('复制失败')
    }
  }

  const getSuggestions = (type: string) => {
    switch (type) {
      case 'network':
        return [
          '检查网络连接是否正常',
          '尝试刷新页面',
          '检查防火墙设置'
        ]
      case 'auth':
        return [
          '重新登录账户',
          '检查账户是否被锁定',
          '联系管理员重置权限'
        ]
      case 'permission':
        return [
          '联系管理员获取权限',
          '检查账户角色设置',
          '使用其他账户尝试'
        ]
      case 'server':
        return [
          '稍后重试',
          '检查服务器状态',
          '联系技术支持'
        ]
      default:
        return [
          '尝试刷新页面',
          '检查操作步骤是否正确',
          '联系技术支持'
        ]
    }
  }

  return (
    <Card className={`${errorInfo.borderColor} ${className}`}>
      <CardHeader className={errorInfo.bgColor}>
        <div className="flex items-start gap-3">
          <Icon className={`h-6 w-6 ${errorInfo.color} mt-0.5`} />
          <div className="flex-1">
            <CardTitle className={`text-lg ${errorInfo.color}`}>
              {title || errorInfo.title}
            </CardTitle>
            <CardDescription className="mt-1">
              {description || errorInfo.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 错误消息 */}
        <div className="p-3 bg-muted rounded-lg">
          <div className="text-sm font-mono text-muted-foreground">
            {error.message || error.toString()}
          </div>
        </div>

        {/* 建议解决方案 */}
        <div>
          <h4 className="font-medium mb-2">建议解决方案:</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {getSuggestions(errorType).map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-xs mt-1">•</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2 pt-2">
          {showRetry && onRetry && (
            <Button onClick={onRetry} variant="default" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              重试
            </Button>
          )}
          
          <Button onClick={() => window.location.reload()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新页面
          </Button>

          <Button onClick={copyErrorDetails} variant="outline" size="sm">
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                已复制
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                复制错误详情
              </>
            )}
          </Button>

          {showReportBug && (
            <Button variant="outline" size="sm" asChild>
              <a href="mailto:support@example.com" target="_blank">
                <Bug className="h-4 w-4 mr-2" />
                报告问题
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
          )}
        </div>

        {/* 错误代码 */}
        {errorType !== 'unknown' && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>错误类型:</span>
              <Badge variant="outline" className="text-xs">
                {errorType.toUpperCase()}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}