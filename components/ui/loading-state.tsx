'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Loader2, 
  Package, 
  RefreshCw, 
  Upload, 
  Download,
  Search,
  Users,
  Building
} from 'lucide-react'

export interface LoadingStateProps {
  type?: 'page' | 'card' | 'table' | 'form' | 'overlay'
  message?: string
  description?: string
  showProgress?: boolean
  progress?: number
  variant?: 'default' | 'minimal' | 'detailed'
  icon?: 'loader' | 'package' | 'refresh' | 'upload' | 'download' | 'search' | 'users' | 'building'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingState({
  type = 'card',
  message = '加载中...',
  description,
  showProgress = false,
  progress = 0,
  variant = 'default',
  icon = 'loader',
  size = 'md',
  className = ''
}: LoadingStateProps) {
  
  const icons = {
    loader: Loader2,
    package: Package,
    refresh: RefreshCw,
    upload: Upload,
    download: Download,
    search: Search,
    users: Users,
    building: Building
  }

  const Icon = icons[icon]

  const sizes = {
    sm: {
      icon: 'h-4 w-4',
      title: 'text-sm',
      description: 'text-xs',
      spacing: 'space-y-2',
      padding: 'p-4'
    },
    md: {
      icon: 'h-6 w-6',
      title: 'text-base',
      description: 'text-sm',
      spacing: 'space-y-3',
      padding: 'p-6'
    },
    lg: {
      icon: 'h-8 w-8',
      title: 'text-lg',
      description: 'text-base',
      spacing: 'space-y-4',
      padding: 'p-8'
    }
  }

  const sizeConfig = sizes[size]

  // 页面级加载
  if (type === 'page') {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-muted animate-pulse rounded" />
          <div>
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-32 bg-muted animate-pulse rounded mt-2" />
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    )
  }

  // 表格加载
  if (type === 'table') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded" />
        ))}
      </div>
    )
  }

  // 表单加载
  if (type === 'form') {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-10 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </div>
    )
  }

  // 覆盖层加载
  if (type === 'overlay') {
    return (
      <div className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center ${className}`}>
        <Card className="max-w-sm">
          <CardContent className={sizeConfig.padding}>
            <div className={`text-center ${sizeConfig.spacing}`}>
              <Icon className={`${sizeConfig.icon} animate-spin mx-auto text-primary`} />
              <div>
                <h3 className={`font-medium ${sizeConfig.title}`}>{message}</h3>
                {description && (
                  <p className={`text-muted-foreground ${sizeConfig.description}`}>
                    {description}
                  </p>
                )}
              </div>
              {showProgress && (
                <div className="space-y-2">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">{progress}%</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 最小化变体
  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Icon className={`${sizeConfig.icon} animate-spin text-primary`} />
        <span className={`text-muted-foreground ${sizeConfig.title}`}>{message}</span>
      </div>
    )
  }

  // 详细变体 - 卡片加载
  if (variant === 'detailed') {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon className={`${sizeConfig.icon} animate-spin text-primary`} />
            <div>
              <CardTitle className={sizeConfig.title}>{message}</CardTitle>
              {description && (
                <CardDescription className={sizeConfig.description}>
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        {showProgress && (
          <CardContent>
            <div className="space-y-2">
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground text-center">{progress}%</div>
            </div>
          </CardContent>
        )}
      </Card>
    )
  }

  // 默认卡片加载
  return (
    <div className={`text-center ${sizeConfig.padding} ${className}`}>
      <div className={sizeConfig.spacing}>
        <Icon className={`${sizeConfig.icon} animate-spin mx-auto text-primary`} />
        <div>
          <h3 className={`font-medium ${sizeConfig.title}`}>{message}</h3>
          {description && (
            <p className={`text-muted-foreground ${sizeConfig.description}`}>
              {description}
            </p>
          )}
        </div>
        {showProgress && (
          <div className="space-y-2 max-w-xs mx-auto">
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground">{progress}%</div>
          </div>
        )}
      </div>
    </div>
  )
}

// 预设的骨架屏组件
export function ProductListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-[80px]" />
            <Skeleton className="h-4 w-[60px]" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-4 rounded" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-[60px] mb-2" />
            <Skeleton className="h-3 w-[120px]" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}