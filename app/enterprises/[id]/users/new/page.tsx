'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { 
  ArrowLeft, 
  UserPlus, 
  Building2,
  Loader2
} from 'lucide-react'
import { useCompany, useCreateCompanyUser } from '@/hooks/use-api'
import { ErrorDisplay } from '@/components/ui/error-display'
import { LoadingState } from '@/components/ui/loading-state'
import { getMultiLangText } from '@/lib/multi-lang-utils'
import { toast } from 'sonner'

// 表单验证schema
const createUserSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  name: z.string().min(2, '姓名至少需要2个字符').max(50, '姓名不能超过50个字符'),
  password: z.string().min(6, '密码至少需要6个字符'),
  phone: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  joinedAt: z.string().optional(),
  role: z.enum(['owner', 'admin', 'member']).default('member'),
  isActive: z.boolean().default(true),
})

type CreateUserFormData = z.infer<typeof createUserSchema>

export default function NewCompanyUserPage() {
  const params = useParams()
  const router = useRouter()
  const companyId = parseInt(params.id as string)
  
  const { data: company, isLoading: companyLoading, error: companyError } = useCompany(companyId)
  const createUserMutation = useCreateCompanyUser()

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      name: '',
      password: '',
      phone: '',
      position: '',
      department: '',
      joinedAt: new Date().toISOString().split('T')[0], // 默认今天
      role: 'member',
      isActive: true,
    },
  })

  const onSubmit = async (data: CreateUserFormData) => {
    try {
      await createUserMutation.mutateAsync({
        companyId,
        data,
      })
      toast.success('员工创建成功')
      router.push(`/enterprises/${companyId}/users`)
    } catch (error: any) {
      console.error('Create user failed:', error)
      toast.error(error.message || '员工创建失败')
    }
  }

  if (companyError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/enterprises/${companyId}/users`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回员工列表
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">新增员工</h1>
            <p className="text-muted-foreground">添加新的企业员工</p>
          </div>
        </div>
        <ErrorDisplay 
          error={companyError}
          title="加载企业信息失败"
          showRetry={true}
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  if (companyLoading || !company) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/enterprises/${companyId}/users`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回员工列表
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">新增员工</h1>
            <p className="text-muted-foreground">添加新的企业员工</p>
          </div>
        </div>
        <LoadingState
          type="card"
          message="加载企业信息..."
          description="正在获取企业基本信息"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/enterprises/${companyId}/users`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回员工列表
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">新增员工</h1>
          <p className="text-muted-foreground">
            为 {getMultiLangText(company.name, 'zh-CN')} 添加新员工
          </p>
        </div>
      </div>

      {/* 企业信息概览 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            企业信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">企业名称：</span>
              <span className="font-medium">{getMultiLangText(company.name, 'zh-CN')}</span>
            </div>
            <div>
              <span className="text-muted-foreground">企业类型：</span>
              <span className="font-medium">
                {company.type === 'supplier' ? '供应商' : 
                 company.type === 'buyer' ? '采购商' :
                 company.type === 'manufacturer' ? '制造商' : '分销商'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">企业状态：</span>
              <span className="font-medium">
                {company.status === 'active' ? '已激活' :
                 company.status === 'pending_review' ? '待审核' : '已禁用'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 员工信息表单 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            员工信息
          </CardTitle>
          <CardDescription>
            请填写新员工的基本信息。标有 * 的字段为必填项。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 基本信息 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">基本信息</h3>
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>姓名 *</FormLabel>
                        <FormControl>
                          <Input placeholder="请输入员工姓名" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>邮箱 *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="请输入邮箱地址" {...field} />
                        </FormControl>
                        <FormDescription>
                          邮箱将作为员工的登录账号
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>初始密码 *</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="请输入初始密码" {...field} />
                        </FormControl>
                        <FormDescription>
                          员工首次登录后可以修改密码
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>手机号</FormLabel>
                        <FormControl>
                          <Input placeholder="请输入手机号" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 职位信息 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">职位信息</h3>
                  
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>角色权限 *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="请选择角色权限" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="member">普通员工</SelectItem>
                            <SelectItem value="admin">管理员</SelectItem>
                            <SelectItem value="owner">企业主</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          企业主拥有最高权限，管理员可以管理普通员工
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>部门</FormLabel>
                        <FormControl>
                          <Input placeholder="请输入所属部门" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>职位</FormLabel>
                        <FormControl>
                          <Input placeholder="请输入职位名称" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="joinedAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>入职日期</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            账户状态
                          </FormLabel>
                          <FormDescription>
                            启用后员工可以正常登录使用系统
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* 提交按钮 */}
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/enterprises/${companyId}/users`)}
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={createUserMutation.isPending}
                >
                  {createUserMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  创建员工
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}