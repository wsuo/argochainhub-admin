'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Loader2, Save, TestTube } from 'lucide-react'
import { ErrorBoundary } from '@/components/error-boundary'
import { useCreateEmailConfig, useTestEmailConfig } from '@/hooks/use-api'
import type { CreateEmailConfigRequest, TestEmailConfigRequest } from '@/lib/types'
import { toast } from 'sonner'

// SMTP端口预设选项
const SMTP_PRESETS = {
  gmail: {
    name: 'Gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
  },
  outlook: {
    name: 'Outlook/Hotmail',
    host: 'smtp.live.com',
    port: 587,
    secure: false,
  },
  qq: {
    name: 'QQ邮箱',
    host: 'smtp.qq.com',
    port: 465,
    secure: true,
  },
  '163': {
    name: '163邮箱',
    host: 'smtp.163.com',
    port: 465,
    secure: true,
  },
  custom: {
    name: '自定义',
    host: '',
    port: 587,
    secure: false,
  }
}

export default function NewEmailConfigPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<CreateEmailConfigRequest>({
    name: '',
    host: '',
    port: 587,
    secure: false,
    authUser: '',
    authPass: '',
    fromEmail: '',
    fromName: '',
    isDefault: false,
    maxRetries: 3,
    retryDelay: 60,
  })
  const [selectedPreset, setSelectedPreset] = useState<string>('custom')
  const [testEmail, setTestEmail] = useState('')
  const [isTestingEnabled, setIsTestingEnabled] = useState(false)

  const createEmailConfigMutation = useCreateEmailConfig()
  const testEmailConfigMutation = useTestEmailConfig()

  // 处理预设选择
  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset)
    const presetConfig = SMTP_PRESETS[preset as keyof typeof SMTP_PRESETS]
    if (presetConfig && preset !== 'custom') {
      setFormData(prev => ({
        ...prev,
        host: presetConfig.host,
        port: presetConfig.port,
        secure: presetConfig.secure,
      }))
    }
  }

  // 处理表单字段变更
  const handleFieldChange = (field: keyof CreateEmailConfigRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // 表单验证
  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error('请输入配置名称')
      return false
    }
    if (!formData.host.trim()) {
      toast.error('请输入SMTP服务器地址')
      return false
    }
    if (!formData.port || formData.port < 1 || formData.port > 65535) {
      toast.error('请输入有效的端口号(1-65535)')
      return false
    }
    if (!formData.authUser.trim()) {
      toast.error('请输入认证用户名')
      return false
    }
    if (!formData.authPass.trim()) {
      toast.error('请输入认证密码')
      return false
    }
    if (!formData.fromEmail.trim()) {
      toast.error('请输入发件人邮箱')
      return false
    }
    if (!formData.fromName.trim()) {
      toast.error('请输入发件人姓名')
      return false
    }
    if (formData.maxRetries < 0 || formData.maxRetries > 10) {
      toast.error('最大重试次数应在0-10之间')
      return false
    }
    if (formData.retryDelay < 10 || formData.retryDelay > 3600) {
      toast.error('重试延迟应在10-3600秒之间')
      return false
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.fromEmail)) {
      toast.error('请输入有效的发件人邮箱地址')
      return false
    }

    return true
  }

  // 处理保存
  const handleSave = () => {
    if (!validateForm()) return

    createEmailConfigMutation.mutate(formData, {
      onSuccess: () => {
        toast.success('邮件配置创建成功')
        router.push('/system/email-configs')
      }
    })
  }

  // 处理测试（需要先保存）
  const handleTest = () => {
    if (!validateForm()) return
    if (!testEmail.trim()) {
      toast.error('请输入测试邮箱地址')
      return
    }

    // 先创建配置，然后测试
    createEmailConfigMutation.mutate(formData, {
      onSuccess: (result) => {
        const testData: TestEmailConfigRequest = {
          testEmail: testEmail.trim()
        }
        testEmailConfigMutation.mutate(
          { id: result.id, data: testData },
          {
            onSuccess: () => {
              toast.success('测试邮件发送成功，请检查收件箱')
              router.push('/system/email-configs')
            }
          }
        )
      }
    })
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">新增邮件配置</h1>
            <p className="text-sm text-gray-600">创建新的SMTP邮件服务器配置</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 主要配置表单 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基本信息 */}
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">配置名称 *</Label>
                    <Input
                      id="name"
                      placeholder="例如：主邮件服务器"
                      value={formData.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>邮箱类型预设</Label>
                    <Select value={selectedPreset} onValueChange={handlePresetChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(SMTP_PRESETS).map(([key, preset]) => (
                          <SelectItem key={key} value={key}>
                            {preset.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SMTP服务器配置 */}
            <Card>
              <CardHeader>
                <CardTitle>SMTP服务器配置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="host">SMTP服务器地址 *</Label>
                    <Input
                      id="host"
                      placeholder="smtp.example.com"
                      value={formData.host}
                      onChange={(e) => handleFieldChange('host', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="port">端口号 *</Label>
                    <Input
                      id="port"
                      type="number"
                      min="1"
                      max="65535"
                      value={formData.port}
                      onChange={(e) => handleFieldChange('port', parseInt(e.target.value) || 587)}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="secure"
                    checked={formData.secure}
                    onCheckedChange={(checked) => handleFieldChange('secure', checked)}
                  />
                  <Label htmlFor="secure">使用SSL/TLS加密连接</Label>
                </div>
              </CardContent>
            </Card>

            {/* 认证信息 */}
            <Card>
              <CardHeader>
                <CardTitle>认证信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="authUser">用户名 *</Label>
                    <Input
                      id="authUser"
                      placeholder="username@example.com"
                      value={formData.authUser}
                      onChange={(e) => handleFieldChange('authUser', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="authPass">密码 *</Label>
                    <Input
                      id="authPass"
                      type="password"
                      placeholder="输入SMTP认证密码"
                      value={formData.authPass}
                      onChange={(e) => handleFieldChange('authPass', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 发件人信息 */}
            <Card>
              <CardHeader>
                <CardTitle>发件人信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fromEmail">发件人邮箱 *</Label>
                    <Input
                      id="fromEmail"
                      type="email"
                      placeholder="noreply@example.com"
                      value={formData.fromEmail}
                      onChange={(e) => handleFieldChange('fromEmail', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fromName">发件人姓名 *</Label>
                    <Input
                      id="fromName"
                      placeholder="ArgoChainHub"
                      value={formData.fromName}
                      onChange={(e) => handleFieldChange('fromName', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 侧边栏配置 */}
          <div className="space-y-6">
            {/* 重试设置 */}
            <Card>
              <CardHeader>
                <CardTitle>重试设置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="maxRetries">最大重试次数</Label>
                  <Input
                    id="maxRetries"
                    type="number"
                    min="0"
                    max="10"
                    value={formData.maxRetries}
                    onChange={(e) => handleFieldChange('maxRetries', parseInt(e.target.value) || 3)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retryDelay">重试延迟（秒）</Label>
                  <Input
                    id="retryDelay"
                    type="number"
                    min="10"
                    max="3600"
                    value={formData.retryDelay}
                    onChange={(e) => handleFieldChange('retryDelay', parseInt(e.target.value) || 60)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 配置选项 */}
            <Card>
              <CardHeader>
                <CardTitle>配置选项</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isDefault"
                    checked={formData.isDefault}
                    onCheckedChange={(checked) => handleFieldChange('isDefault', checked)}
                  />
                  <Label htmlFor="isDefault">设为默认配置</Label>
                </div>
              </CardContent>
            </Card>

            {/* 测试配置 */}
            <Card>
              <CardHeader>
                <CardTitle>测试配置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enableTest"
                    checked={isTestingEnabled}
                    onCheckedChange={setIsTestingEnabled}
                  />
                  <Label htmlFor="enableTest">创建后立即测试</Label>
                </div>
                {isTestingEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="testEmail">测试邮箱</Label>
                    <Input
                      id="testEmail"
                      type="email"
                      placeholder="test@example.com"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 操作按钮 */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {isTestingEnabled ? (
                    <Button
                      onClick={handleTest}
                      disabled={createEmailConfigMutation.isPending || testEmailConfigMutation.isPending}
                      className="w-full"
                    >
                      {(createEmailConfigMutation.isPending || testEmailConfigMutation.isPending) && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      <TestTube className="w-4 h-4 mr-2" />
                      保存并测试
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSave}
                      disabled={createEmailConfigMutation.isPending}
                      className="w-full"
                    >
                      {createEmailConfigMutation.isPending && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      <Save className="w-4 h-4 mr-2" />
                      保存配置
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="w-full"
                  >
                    取消
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}