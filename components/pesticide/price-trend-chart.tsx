'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react'
import { usePriceTrendChart } from '@/hooks/use-api'
import { ErrorDisplay } from '@/components/ui/error-display'

interface PriceTrendChartProps {
  pesticideId: number
}

export function PriceTrendChart({ pesticideId }: PriceTrendChartProps) {
  const [dateRange, setDateRange] = useState<string>('all')
  
  // 计算日期范围
  const getDateQuery = () => {
    if (dateRange === 'all') return undefined
    
    const endDate = new Date()
    const startDate = new Date()
    
    switch (dateRange) {
      case '1m':
        startDate.setMonth(startDate.getMonth() - 1)
        break
      case '3m':
        startDate.setMonth(startDate.getMonth() - 3)
        break
      case '6m':
        startDate.setMonth(startDate.getMonth() - 6)
        break
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
    }
    
    return {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd')
    }
  }
  
  const { data, isLoading, error } = usePriceTrendChart(pesticideId, getDateQuery())
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>价格走势图表</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorDisplay 
            error={error}
            title="加载图表数据失败"
            showRetry={false}
          />
        </CardContent>
      </Card>
    )
  }
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>价格走势图表</CardTitle>
              <CardDescription>正在加载价格走势数据...</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    )
  }
  
  if (!data || !data.priceData || data.priceData.length === 0) {
    return null
  }
  
  // 准备图表数据
  const chartData = data.priceData.map(item => ({
    date: format(new Date(item.date), 'MM-dd', { locale: zhCN }),
    fullDate: item.date,
    rmbPrice: item.cnyPrice,
    usdPrice: item.usdPrice,
    exchangeRate: item.exchangeRate
  }))
  
  // 计算价格变化率和统计信息
  const calculatePriceChangeRate = () => {
    if (data.priceData.length < 2) return 0
    const firstPrice = data.priceData[0].cnyPrice
    const lastPrice = data.priceData[data.priceData.length - 1].cnyPrice
    return ((lastPrice - firstPrice) / firstPrice) * 100
  }
  
  const calculatePriceStats = () => {
    if (data.priceData.length === 0) {
      return { maxPrice: 0, minPrice: 0, avgPrice: 0, latestPrice: 0 }
    }
    
    const prices = data.priceData.map(item => item.cnyPrice)
    const maxPrice = Math.max(...prices)
    const minPrice = Math.min(...prices)
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length
    const latestPrice = prices[prices.length - 1]
    
    return { maxPrice, minPrice, avgPrice, latestPrice }
  }
  
  const priceChangeRate = calculatePriceChangeRate()
  const priceStats = calculatePriceStats()
  
  // 格式化工具提示
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="rounded-lg border bg-background p-3 shadow-sm">
          <p className="font-semibold mb-2">{data.fullDate}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-8">
              <span className="text-muted-foreground">人民币:</span>
              <span className="font-medium">¥{data.rmbPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-muted-foreground">美元:</span>
              <span className="font-medium">${data.usdPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-muted-foreground">汇率:</span>
              <span className="font-medium">{data.exchangeRate.toFixed(4)}</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }
  
  // 计算趋势图标
  const getTrendIcon = () => {
    if (priceChangeRate > 0) {
      return <TrendingUp className="h-4 w-4 text-red-600" />
    } else if (priceChangeRate < 0) {
      return <TrendingDown className="h-4 w-4 text-green-600" />
    }
    return <Minus className="h-4 w-4 text-gray-600" />
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              价格走势图表
              {getTrendIcon()}
            </CardTitle>
            <CardDescription>
              {data.pesticide.productName['zh-CN']} - {data.pesticide.concentration}
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">价格变化</p>
              <p className={`text-lg font-semibold ${priceChangeRate > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {priceChangeRate > 0 ? '+' : ''}{priceChangeRate.toFixed(2)}%
              </p>
            </div>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[120px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="1m">近1个月</SelectItem>
                <SelectItem value="3m">近3个月</SelectItem>
                <SelectItem value="6m">近6个月</SelectItem>
                <SelectItem value="1y">近1年</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 统计信息 */}
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">最高价格</p>
              <p className="text-lg font-semibold">¥{priceStats.maxPrice.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">最低价格</p>
              <p className="text-lg font-semibold">¥{priceStats.minPrice.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">平均价格</p>
              <p className="text-lg font-semibold">¥{priceStats.avgPrice.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">最新价格</p>
              <p className="text-lg font-semibold">¥{priceStats.latestPrice.toLocaleString()}</p>
            </div>
          </div>
          
          {/* 图表 */}
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 5,
                  left: 5,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                  tickFormatter={(value) => `¥${value.toLocaleString()}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                />
                <ReferenceLine 
                  y={priceStats.avgPrice} 
                  stroke="currentColor" 
                  strokeDasharray="5 5"
                  opacity={0.3}
                />
                <Line
                  type="monotone"
                  dataKey="rmbPrice"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="人民币价格"
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* 图例说明 */}
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <span>价格走势</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-6 border-t-2 border-dashed border-current opacity-30" />
              <span>平均价格</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}