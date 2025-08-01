'use client'

import Link from 'next/link'
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
  Eye, 
  Edit,
  Trash2,
  TrendingUp,
  EyeOff,
  DollarSign
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Pesticide } from '@/lib/types'
import { getDictionaryLabel } from '@/lib/dictionary-utils'
import { getMultiLangText } from '@/lib/multi-lang-utils'
import { useDictionaryOptions } from '@/lib/dictionary-utils'

export interface PesticideListTableProps {
  pesticides: Pesticide[]
  loading?: boolean
  onDelete?: (id: number) => void
}

export function PesticideListTable({ 
  pesticides, 
  loading = false,
  onDelete
}: PesticideListTableProps) {
  // 获取字典数据
  const categories = useDictionaryOptions('product_category')
  const formulations = useDictionaryOptions('formulation')

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'insecticide': return 'default'
      case 'herbicide': return 'secondary'
      case 'fungicide': return 'outline'
      case 'acaricide': return 'destructive'
      case 'plant_growth_regulator': return 'secondary'
      case 'rodenticide': return 'outline'
      default: return 'default'
    }
  }

  return (
    <div className="relative overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>产品名称</TableHead>
            <TableHead>类别</TableHead>
            <TableHead>剂型</TableHead>
            <TableHead>浓度规格</TableHead>
            <TableHead>最新价格</TableHead>
            <TableHead>可见性</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pesticides.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                暂无数据
              </TableCell>
            </TableRow>
          ) : (
            pesticides.map((pesticide) => (
              <TableRow key={pesticide.id}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">
                      {getMultiLangText(pesticide.productName, 'zh-CN')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {getMultiLangText(pesticide.productName, 'en')}
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <Badge variant={getCategoryBadgeVariant(pesticide.category)}>
                    {getDictionaryLabel(categories, pesticide.category)}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  <Badge variant="outline">
                    {getDictionaryLabel(formulations, pesticide.formulation)}
                  </Badge>
                </TableCell>
                
                <TableCell>{pesticide.concentration}</TableCell>
                
                <TableCell>
                  {pesticide.latestPrice ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">
                          ¥{pesticide.latestPrice.unitPrice.toLocaleString('zh-CN')}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(pesticide.latestPrice.weekEndDate), 'yyyy-MM-dd', { locale: zhCN })}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">暂无价格</span>
                  )}
                </TableCell>
                
                <TableCell>
                  {pesticide.isVisible ? (
                    <Badge variant="secondary" className="gap-1">
                      <Eye className="h-3 w-3" />
                      可见
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1">
                      <EyeOff className="h-3 w-3" />
                      隐藏
                    </Badge>
                  )}
                </TableCell>
                
                <TableCell>
                  {format(new Date(pesticide.createdAt), 'yyyy-MM-dd', { locale: zhCN })}
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
                      <DropdownMenuItem asChild>
                        <Link href={`/content/pesticides/${pesticide.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          查看详情
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/content/pesticides/${pesticide.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          编辑信息
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/content/pesticides/${pesticide.id}/prices`}>
                          <TrendingUp className="mr-2 h-4 w-4" />
                          价格走势
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete?.(typeof pesticide.id === 'string' ? parseInt(pesticide.id) : pesticide.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        删除农药
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}