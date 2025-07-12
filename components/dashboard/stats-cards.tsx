'use client'

import { Building2, Users, Package, MessageSquare, ShoppingCart, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { DashboardStats } from '@/lib/types'

interface StatsCardsProps {
  data: DashboardStats
  isLoading?: boolean
}

interface StatCardProps {
  title: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  subtitle?: string
  badge?: {
    value: number
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  }
}

function StatCard({ title, value, icon: Icon, subtitle, badge }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">{value.toLocaleString()}</div>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {badge && (
            <Badge variant={badge.variant || 'default'}>
              {badge.value}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 w-20 bg-muted animate-pulse rounded" />
        <div className="h-4 w-4 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-16 bg-muted animate-pulse rounded mb-1" />
            <div className="h-3 w-24 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-5 w-8 bg-muted animate-pulse rounded" />
        </div>
      </CardContent>
    </Card>
  )
}

export function StatsCards({ data, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  const stats: StatCardProps[] = [
    {
      title: '企业总数',
      value: data.totalCompanies,
      icon: Building2,
      subtitle: '注册企业数量',
      badge: data.pendingCompanies > 0 ? {
        value: data.pendingCompanies,
        variant: 'destructive'
      } : undefined
    },
    {
      title: '用户总数',
      value: data.totalUsers,
      icon: Users,
      subtitle: '活跃用户数量'
    },
    {
      title: '产品总数',
      value: data.totalProducts,
      icon: Package,
      subtitle: '平台产品数量',
      badge: data.pendingProducts > 0 ? {
        value: data.pendingProducts,
        variant: 'destructive'
      } : undefined
    },
    {
      title: '询价总数',
      value: data.totalInquiries,
      icon: MessageSquare,
      subtitle: '询价单数量'
    },
    {
      title: '订单总数',
      value: data.totalOrders,
      icon: ShoppingCart,
      subtitle: '订阅订单数量'
    },
    {
      title: '待处理事项',
      value: data.pendingCompanies + data.pendingProducts,
      icon: TrendingUp,
      subtitle: '需要审核的项目',
      badge: data.pendingCompanies + data.pendingProducts > 0 ? {
        value: data.pendingCompanies + data.pendingProducts,
        variant: 'destructive'
      } : {
        value: 0,
        variant: 'secondary'
      }
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  )
}