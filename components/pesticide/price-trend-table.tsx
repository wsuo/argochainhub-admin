'use client'

import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MoreHorizontal, 
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  TrendingUp
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { PriceTrend } from '@/lib/types'

export interface PriceTrendTableProps {
  priceTrends: PriceTrend[]
  loading?: boolean
  onEdit?: (id: number) => void
  onDelete?: (id: number) => void
}

export function PriceTrendTable({ 
  priceTrends, 
  loading = false,
  onEdit,
  onDelete
}: PriceTrendTableProps) {
  
  const calculateUsdPrice = (rmb: number, rate: number) => {
    return rmb / rate
  }
  
  return (
    <div className="relative overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>周结束日期</TableHead>
            <TableHead>人民币单价</TableHead>
            <TableHead>汇率</TableHead>
            <TableHead>美元单价</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {priceTrends.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                暂无数据
              </TableCell>
            </TableRow>
          ) : (
            priceTrends.map((trend) => {
              const usdPrice = calculateUsdPrice(trend.unitPrice, trend.exchangeRate)
              
              return (
                <TableRow key={trend.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {format(new Date(trend.weekEndDate), 'yyyy-MM-dd', { locale: zhCN })}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">¥</span>
                      <span className="font-medium">
                        {trend.unitPrice.toLocaleString('zh-CN', { 
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2 
                        })}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="outline">
                      {trend.exchangeRate.toFixed(4)}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">
                        {usdPrice.toLocaleString('en-US', { 
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2 
                        })}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-muted-foreground">
                    {format(new Date(trend.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">打开菜单</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>操作</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onEdit?.(trend.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          编辑价格
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => onDelete?.(trend.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          删除记录
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}