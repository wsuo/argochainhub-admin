'use client'

import { StatsCards } from "@/components/dashboard/stats-cards"
import { Charts } from "@/components/dashboard/charts"
import { useDashboardStats, useDashboardCharts } from "@/hooks/use-api"

export default function DashboardPage() {
  const { 
    data: statsData, 
    isLoading: statsLoading, 
    error: statsError 
  } = useDashboardStats()
  
  const { 
    data: chartsData, 
    isLoading: chartsLoading, 
    error: chartsError 
  } = useDashboardCharts()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">仪表盘</h1>
        <p className="text-muted-foreground">
          ArgoChainHub 智慧农化采购平台管理概览
        </p>
      </div>

      {/* 统计卡片 */}
      {statsError ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            加载统计数据失败: {(statsError as any).message}
          </p>
        </div>
      ) : (
        <StatsCards data={statsData!} isLoading={statsLoading} />
      )}

      {/* 图表 */}
      {chartsError ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            加载图表数据失败: {(chartsError as any).message}
          </p>
        </div>
      ) : (
        <Charts data={chartsData!} isLoading={chartsLoading} />
      )}
    </div>
  )
}
