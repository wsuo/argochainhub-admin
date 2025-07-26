'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  UserCog, 
  Building2,
  Loader2
} from 'lucide-react'
import { 
  useCompany, 
  useCompanyUser, 
  useUpdateCompanyUser 
} from '@/hooks/use-api'
import { ErrorDisplay } from '@/components/ui/error-display'
import { LoadingState } from '@/components/ui/loading-state'
import { getMultiLangText } from '@/lib/multi-lang-utils'
import { toast } from 'sonner'

// 表单验证schema（编辑时密码是可选的）
const updateUserSchema = z.object({
  name: z.string().min(2, '姓名至少需要2个字符').max(50, '姓名不能超过50个字符'),
  phone: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  joinedAt: z.string().optional(),
  role: z.enum(['owner', 'admin', 'member']),
  isActive: z.boolean(),
})

type UpdateUserFormData = z.infer<typeof updateUserSchema>

export default function EditCompanyUserPage() {
  const params = useParams()
  const router = useRouter()
  const companyId = parseInt(params.id as string)
  const userId = parseInt(params.userId as string)
  
  const { data: company, isLoading: companyLoading, error: companyError } = useCompany(companyId)
  const { data: user, isLoading: userLoading, error: userError } = useCompanyUser(companyId, userId)
  const updateUserMutation = useUpdateCompanyUser()

  const form = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: '',
      phone: '',
      position: '',
      department: '',
      joinedAt: '',
      role: 'member',
      isActive: true,
    },
  })

  // 当用户数据加载完成后，填充表单
  useEffect(() => {
    if (user) {
      const formData = {
        name: user.name,
        phone: user.phone || '',
        position: user.position || '',
        department: user.department || '',
        joinedAt: user.joinedAt ? user.joinedAt.split('T')[0] : '', // 安全处理日期格式化
        role: user.role,
        isActive: user.isActive,
      }
      
      // 使用 reset 设置所有字段
      form.reset(formData)
      
      // 单独设置角色字段以确保 Select 组件正确回显
      setTimeout(() => {
        form.setValue('role', user.role)
      }, 100)
    }
  }, [user, form])

  const onSubmit = async (data: UpdateUserFormData) => {
    try {
      await updateUserMutation.mutateAsync({
        companyId,
        userId,
        data,
      })
      toast.success('员工信息更新成功')
      router.push(`/enterprises/${companyId}/users/${userId}`)
    } catch (error: any) {
      console.error('Update user failed:', error)
      toast.error(error.message || '员工信息更新失败')
    }
  }

  if (companyError || userError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/enterprises/${companyId}/users/${userId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回员工详情
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">编辑员工</h1>
            <p className="text-muted-foreground">修改员工信息</p>
          </div>
        </div>
        <ErrorDisplay 
          error={companyError || userError}
          title="加载数据失败"
          showRetry={true}
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  if (companyLoading || userLoading || !company || !user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/enterprises/${companyId}/users/${userId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回员工详情
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">编辑员工</h1>
            <p className="text-muted-foreground">修改员工信息</p>
          </div>
        </div>
        <LoadingState
          type="card"
          message="加载员工信息..."
          description="正在获取员工详细信息"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/enterprises/${companyId}/users/${userId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回员工详情
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">编辑员工</h1>
          <p className="text-muted-foreground">
            修改 {user.name} 的员工信息
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
              <span className="text-muted-foreground">员工邮箱：</span>
              <span className="font-medium">{user.email}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 员工信息表单 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            员工信息
          </CardTitle>
          <CardDescription>
            修改员工的基本信息。注意：邮箱地址无法修改。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 基本信息 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">基本信息</h3>
                  
                  <div>
                    <Label>邮箱（不可修改）</Label>
                    <Input 
                      value={user.email} 
                      disabled 
                      className="bg-muted text-muted-foreground"
                    />
                  </div>
                  
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
                </div>

                {/* 职位信息和权限 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">职位信息</h3>
                  
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>角色权限 *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
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
                </div>
              </div>

              {/* 账户状态设置 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">账户状态</h3>
                
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          账户启用状态
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

              {/* 提交按钮 */}
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/enterprises/${companyId}/users/${userId}`)}
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  保存更改
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}