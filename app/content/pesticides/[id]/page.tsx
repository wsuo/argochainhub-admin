'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Beaker, Eye, EyeOff, TrendingUp, Calendar } from 'lucide-react'
import { usePesticide } from '@/hooks/use-api'
import { ErrorDisplay } from '@/components/ui/error-display'
import { LoadingState } from '@/components/ui/loading-state'
import { getMultiLangText } from '@/lib/multi-lang-utils'
import { getDictionaryLabel, useDictionaryOptions } from '@/lib/dictionary-utils'

interface PesticidePageProps {
  params: Promise<{ id: string }>
}

export default function PesticideDetailPage({ params }: PesticidePageProps) {
  const { id } = use(params)
  const pesticideId = parseInt(id)
  
  const { data: pesticide, isLoading, error } = usePesticide(pesticideId)
  
  // 获取字典数据
  const categories = useDictionaryOptions('product_category')
  const formulations = useDictionaryOptions('formulation')

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/content/pesticides">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">农药详情</h1>
        </div>
        <ErrorDisplay 
          error={error}
          title="加载农药数据失败"
          showRetry={true}
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/content/pesticides">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">农药详情</h1>
        </div>
        <LoadingState
          type="card"
          message="加载农药信息..."
          description="正在获取农药详细数据"
          icon="package"
        />
      </div>
    )
  }

  if (!pesticide) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/content/pesticides">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Beaker className="h-8 w-8" />
              农药详情
            </h1>
          </div>
          <p className="text-muted-foreground ml-12">
            查看农药的详细信息
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/content/pesticides/${pesticideId}/prices`}>
              <TrendingUp className="h-4 w-4 mr-2" />
              价格走势
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/content/pesticides/${pesticideId}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              编辑
            </Link>
          </Button>
        </div>
      </div>

      {/* 基本信息 */}
      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
          <CardDescription>农药的基本属性信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">产品类别</p>
              <Badge variant="secondary" className="text-base">
                {getDictionaryLabel(categories, pesticide.category)}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">剂型</p>
              <Badge variant="outline" className="text-base">
                {getDictionaryLabel(formulations, pesticide.formulation)}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">浓度规格</p>
              <p className="text-lg font-medium">{pesticide.concentration}</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">可见性</p>
              {pesticide.isVisible ? (
                <Badge variant="secondary" className="gap-1">
                  <Eye className="h-3 w-3" />
                  前台可见
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1">
                  <EyeOff className="h-3 w-3" />
                  前台隐藏
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 多语言名称 */}
      <Card>
        <CardHeader>
          <CardTitle>多语言名称</CardTitle>
          <CardDescription>农药在不同语言下的名称</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">中文名称</p>
            <p className="text-lg font-medium">
              {getMultiLangText(pesticide.productName, 'zh-CN') || '-'}
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">英文名称</p>
            <p className="text-lg font-medium">
              {getMultiLangText(pesticide.productName, 'en') || '-'}
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">西班牙文名称</p>
            <p className="text-lg font-medium">
              {getMultiLangText(pesticide.productName, 'es') || '-'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 价格信息 */}
      {(pesticide.latestPrice || pesticide.priceChangeRate !== undefined) && (
        <Card>
          <CardHeader>
            <CardTitle>价格信息</CardTitle>
            <CardDescription>最新的价格数据</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pesticide.latestPrice && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">最新价格</p>
                <p className="text-2xl font-bold">
                  ¥ {pesticide.latestPrice.toLocaleString('zh-CN', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2 
                  })}
                </p>
              </div>
            )}
            
            {pesticide.priceChangeRate !== undefined && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">价格变化率</p>
                <p className={`text-lg font-medium ${pesticide.priceChangeRate > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {pesticide.priceChangeRate > 0 ? '+' : ''}{pesticide.priceChangeRate.toFixed(2)}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 时间信息 */}
      <Card>
        <CardHeader>
          <CardTitle>时间信息</CardTitle>
          <CardDescription>创建和更新时间记录</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pesticide.createdAt && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">创建时间</p>
                <p className="font-medium">
                  {(() => {
                    try {
                      const date = new Date(pesticide.createdAt)
                      return isNaN(date.getTime()) ? '-' : format(date, 'yyyy年MM月dd日 HH:mm', { locale: zhCN })
                    } catch {
                      return '-'
                    }
                  })()}
                </p>
              </div>
            </div>
          )}
          
          {pesticide.updatedAt && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">更新时间</p>
                <p className="font-medium">
                  {(() => {
                    try {
                      const date = new Date(pesticide.updatedAt)
                      return isNaN(date.getTime()) ? '-' : format(date, 'yyyy年MM月dd日 HH:mm', { locale: zhCN })
                    } catch {
                      return '-'
                    }
                  })()}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}