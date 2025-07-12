'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import type { ChartData } from '@/lib/types'

interface ChartsProps {
  data: ChartData
  isLoading?: boolean
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

function ChartSkeleton({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  )
}

export function Charts({ data, isLoading }: ChartsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <ChartSkeleton title="用户增长趋势" />
        <ChartSkeleton title="企业注册趋势" />
        <ChartSkeleton title="收入趋势" />
        <ChartSkeleton title="产品分类分布" />
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* 用户增长趋势 */}
      <Card>
        <CardHeader>
          <CardTitle>用户增长趋势</CardTitle>
          <CardDescription>最近30天的用户增长情况</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString('zh-CN')}
                formatter={(value, name) => [value, name === 'newUsers' ? '新增用户' : '总用户数']}
              />
              <Line 
                type="monotone" 
                dataKey="newUsers" 
                stroke="#8884d8" 
                strokeWidth={2}
                name="新增用户"
              />
              <Line 
                type="monotone" 
                dataKey="totalUsers" 
                stroke="#82ca9d" 
                strokeWidth={2}
                name="总用户数"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 企业注册趋势 */}
      <Card>
        <CardHeader>
          <CardTitle>企业注册趋势</CardTitle>
          <CardDescription>最近30天的企业注册情况</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.companyRegistration}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString('zh-CN')}
                formatter={(value, name) => [value, name === 'newCompanies' ? '新注册企业' : '总企业数']}
              />
              <Bar dataKey="newCompanies" fill="#8884d8" name="新注册企业" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 收入趋势 */}
      <Card>
        <CardHeader>
          <CardTitle>收入趋势</CardTitle>
          <CardDescription>最近30天的收入情况</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.revenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
              />
              <YAxis tickFormatter={(value) => `¥${value.toLocaleString()}`} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString('zh-CN')}
                formatter={(value, name) => [
                  name === 'revenue' ? `¥${Number(value).toLocaleString()}` : value,
                  name === 'revenue' ? '收入' : '订单数'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#82ca9d" 
                strokeWidth={2}
                name="收入"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 产品分类分布 */}
      <Card>
        <CardHeader>
          <CardTitle>产品分类分布</CardTitle>
          <CardDescription>平台产品分类统计</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.productCategoryStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percentage }) => `${category} ${percentage.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {data.productCategoryStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, '产品数量']} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}