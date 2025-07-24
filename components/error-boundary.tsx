'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Bug } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; errorInfo: React.ErrorInfo; retry: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // 调用错误回调
    this.props.onError?.(error, errorInfo)

    // 在开发环境中输出详细错误信息
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error)
      console.error('Error info:', errorInfo)
    }
  }

  retry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义fallback组件，则使用它
      if (this.props.fallback && this.state.error && this.state.errorInfo) {
        const FallbackComponent = this.props.fallback
        return (
          <FallbackComponent 
            error={this.state.error} 
            errorInfo={this.state.errorInfo}
            retry={this.retry}
          />
        )
      }

      // 使用默认的错误UI
      return (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <div>
                <CardTitle className="text-lg text-destructive">
                  页面渲染出错
                </CardTitle>
                <CardDescription>
                  页面组件在渲染过程中遇到了错误
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* 错误信息 */}
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm font-mono text-muted-foreground">
                {this.state.error?.message || '未知错误'}
              </div>
            </div>

            {/* 开发环境显示详细信息 */}
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="text-xs">
                <summary className="cursor-pointer font-medium mb-2">
                  技术详情（开发模式）
                </summary>
                <pre className="whitespace-pre-wrap bg-slate-100 p-2 rounded text-xs overflow-auto">
                  {this.state.error?.stack}
                  {'\n\n'}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-2 pt-2">
              <Button onClick={this.retry} variant="default" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                重试
              </Button>
              
              <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                刷新页面
              </Button>

              {process.env.NODE_ENV === 'development' && (
                <Button 
                  onClick={() => {
                    console.error('Error details:', {
                      error: this.state.error,
                      errorInfo: this.state.errorInfo
                    })
                  }}
                  variant="outline" 
                  size="sm"
                >
                  <Bug className="h-4 w-4 mr-2" />
                  控制台日志
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

// 简化的错误边界Hook版本（仅用于函数组件内部错误处理）
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const handleError = React.useCallback((error: Error) => {
    console.error('Handled error:', error)
    setError(error)
  }, [])

  // 如果有错误，抛出以便ErrorBoundary捕获
  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { handleError, resetError }
}