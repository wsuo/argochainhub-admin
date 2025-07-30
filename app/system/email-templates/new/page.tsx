'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { ArrowLeft, Loader2, Save, Plus, Trash2, Eye } from 'lucide-react'
import { ErrorBoundary } from '@/components/error-boundary'
import { LoadingState } from '@/components/ui/loading-state'
import { 
  useCreateEmailTemplate, 
  useEmailTriggerEvents,
  usePreviewEmailTemplate
} from '@/hooks/use-api'
import type { 
  CreateEmailTemplateRequest, 
  EmailTemplateVariable,
  SupportedLanguage,
  PreviewEmailTemplateRequest
} from '@/lib/types'
import { createEmptyMultiLangText } from '@/lib/multi-lang-utils'
import { useDictionaryOptions, getDictionaryLabel } from '@/lib/dictionary-utils'
import { toast } from 'sonner'

// 语言选项
const LANGUAGE_OPTIONS: { value: SupportedLanguage; label: string; flag: string }[] = [
  { value: 'zh-CN', label: '中文', flag: '🇨🇳' },
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'es', label: 'Español', flag: '🇪🇸' }
]

export default function NewEmailTemplatePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('zh-CN')
  const [formData, setFormData] = useState<CreateEmailTemplateRequest>({
    code: '',
    name: createEmptyMultiLangText(),
    description: createEmptyMultiLangText(),
    subject: createEmptyMultiLangText(),
    body: createEmptyMultiLangText(),
    variables: [],
    triggerEvent: '',
  })
  const [newVariable, setNewVariable] = useState<EmailTemplateVariable>({
    name: '',
    description: '',
    example: ''
  })
  const [previewData, setPreviewData] = useState<{
    language: SupportedLanguage
    variables: Record<string, string>
    result?: { subject: string; body: string }
  } | null>(null)

  // API调用
  const { data: triggerEvents } = useEmailTriggerEvents()
  const createEmailTemplateMutation = useCreateEmailTemplate()
  const previewEmailTemplateMutation = usePreviewEmailTemplate()
  
  // 获取字典选项用于显示触发事件名称
  const triggerEventOptions = useDictionaryOptions('email_trigger_event')

  // 处理多语言字段更新
  const handleMultiLangChange = (
    field: 'name' | 'description' | 'subject' | 'body',
    language: SupportedLanguage,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [language]: value
      }
    }))
  }

  // 添加变量
  const handleAddVariable = () => {
    if (!newVariable.name.trim()) {
      toast.error('请输入变量名称')
      return
    }
    
    if (formData.variables.some(v => v.name === newVariable.name)) {
      toast.error('变量名称已存在')
      return
    }

    setFormData(prev => ({
      ...prev,
      variables: [...prev.variables, { ...newVariable }]
    }))
    
    setNewVariable({
      name: '',
      description: '',
      example: ''
    })
  }

  // 删除变量
  const handleRemoveVariable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index)
    }))
  }

  // 表单验证
  const validateForm = (): boolean => {
    if (!formData.code.trim()) {
      toast.error('请输入模板代码')
      return false
    }
    
    if (!formData.triggerEvent) {
      toast.error('请选择触发事件')
      return false
    }

    // 验证至少有一种语言的名称
    if (!formData.name['zh-CN']?.trim() && !formData.name['en']?.trim()) {
      toast.error('请至少填写一种语言的模板名称')
      return false
    }

    // 验证至少有一种语言的主题和内容
    const hasValidContent = LANGUAGE_OPTIONS.some(lang => 
      formData.subject[lang.value]?.trim() && formData.body[lang.value]?.trim()
    )
    
    if (!hasValidContent) {
      toast.error('请至少填写一种语言的邮件主题和内容')
      return false
    }

    // 验证变量名称格式
    const invalidVariable = formData.variables.find(v => 
      !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(v.name)
    )
    if (invalidVariable) {
      toast.error(`变量名称 "${invalidVariable.name}" 格式不正确，只能包含字母、数字和下划线，且以字母开头`)
      return false
    }

    return true
  }

  // 处理保存
  const handleSave = () => {
    if (!validateForm()) return

    createEmailTemplateMutation.mutate(formData, {
      onSuccess: () => {
        toast.success('邮件模板创建成功')
        router.push('/system/email-templates')
      }
    })
  }

  // 处理预览
  const handlePreview = (language: SupportedLanguage) => {
    const variables: Record<string, string> = {}
    formData.variables.forEach(variable => {
      variables[variable.name] = variable.example || `{{${variable.name}}}`
    })

    setPreviewData({
      language,
      variables,
    })

    // 模拟预览（实际应该调用API）
    const subject = formData.subject[language] || ''
    const body = formData.body[language] || ''
    
    let previewSubject = subject
    let previewBody = body
    
    // 替换变量
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
      previewSubject = previewSubject.replace(regex, value)
      previewBody = previewBody.replace(regex, value)
    })

    setPreviewData(prev => prev ? {
      ...prev,
      result: {
        subject: previewSubject,
        body: previewBody
      }
    } : null)
  }

  // 获取触发事件显示名称
  const getTriggerEventName = (event: string) => {
    return getDictionaryLabel(triggerEventOptions, event, event)
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
            <h1 className="text-2xl font-semibold text-gray-900">新增邮件模板</h1>
            <p className="text-sm text-gray-600">创建新的邮件通知模板</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 主要内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基本信息 */}
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">模板代码 *</Label>
                    <Input
                      id="code"
                      placeholder="inquiry_notification"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    />
                    <p className="text-xs text-gray-500">
                      唯一标识符，只能包含字母、数字和下划线
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>触发事件 *</Label>
                    <Select value={formData.triggerEvent} onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, triggerEvent: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="选择触发事件" />
                      </SelectTrigger>
                      <SelectContent>
                        {triggerEvents?.map((event) => (
                          <SelectItem key={event} value={event}>
                            {getTriggerEventName(event)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 多语言内容 */}
            <Card>
              <CardHeader>
                <CardTitle>多语言内容</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    {LANGUAGE_OPTIONS.map((lang) => (
                      <TabsTrigger key={lang.value} value={lang.value}>
                        {lang.flag} {lang.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <TabsContent key={lang.value} value={lang.value} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor={`name-${lang.value}`}>模板名称</Label>
                        <Input
                          id={`name-${lang.value}`}
                          placeholder="输入模板名称..."
                          value={formData.name[lang.value] || ''}
                          onChange={(e) => handleMultiLangChange('name', lang.value, e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`description-${lang.value}`}>模板描述</Label>
                        <Textarea
                          id={`description-${lang.value}`}
                          placeholder="输入模板描述..."
                          rows={3}
                          value={formData.description[lang.value] || ''}
                          onChange={(e) => handleMultiLangChange('description', lang.value, e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`subject-${lang.value}`}>邮件主题</Label>
                        <Input
                          id={`subject-${lang.value}`}
                          placeholder="输入邮件主题，可使用变量如 {{inquiryNumber}}"
                          value={formData.subject[lang.value] || ''}
                          onChange={(e) => handleMultiLangChange('subject', lang.value, e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`body-${lang.value}`}>邮件内容</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreview(lang.value)}
                            disabled={!formData.subject[lang.value] && !formData.body[lang.value]}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            预览
                          </Button>
                        </div>
                        <Textarea
                          id={`body-${lang.value}`}
                          placeholder="输入邮件内容，支持HTML格式，可使用变量如 {{inquiryNumber}}"
                          rows={12}
                          value={formData.body[lang.value] || ''}
                          onChange={(e) => handleMultiLangChange('body', lang.value, e.target.value)}
                        />
                        <p className="text-xs text-gray-500">
                          支持HTML格式，使用变量格式：{'{{'}{'{变量名}'}{'}'}
                        </p>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* 模板变量 */}
            <Card>
              <CardHeader>
                <CardTitle>模板变量</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 已有变量列表 */}
                {formData.variables.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">已添加变量</Label>
                    {formData.variables.map((variable, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-sm">
                            {'{{'}{variable.name}{'}}'}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {variable.description}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveVariable(index)}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* 添加新变量 */}
                <div className="space-y-3 pt-2 border-t">
                  <Label className="text-sm font-medium">添加变量</Label>
                  <div className="space-y-2">
                    <Input
                      placeholder="变量名称 (如: inquiryNumber)"
                      value={newVariable.name}
                      onChange={(e) => setNewVariable(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <Input
                      placeholder="变量描述"
                      value={newVariable.description}
                      onChange={(e) => setNewVariable(prev => ({ ...prev, description: e.target.value }))}
                    />
                    <Input
                      placeholder="示例值"
                      value={newVariable.example}
                      onChange={(e) => setNewVariable(prev => ({ ...prev, example: e.target.value }))}
                    />
                    <Button
                      onClick={handleAddVariable}
                      size="sm"
                      className="w-full"
                      disabled={!newVariable.name.trim()}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      添加变量
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 操作按钮 */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button
                    onClick={handleSave}
                    disabled={createEmailTemplateMutation.isPending}
                    className="w-full"
                  >
                    {createEmailTemplateMutation.isPending && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    <Save className="w-4 h-4 mr-2" />
                    保存模板
                  </Button>
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

        {/* 预览对话框 */}
        {previewData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">邮件预览</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewData(null)}
                  >
                    ×
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {LANGUAGE_OPTIONS.find(l => l.value === previewData.language)?.flag} {' '}
                  {LANGUAGE_OPTIONS.find(l => l.value === previewData.language)?.label}
                </p>
              </div>
              <div className="p-6 space-y-4">
                {previewData.result && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">邮件主题</Label>
                      <div className="p-3 border rounded-lg bg-gray-50">
                        {previewData.result.subject}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">邮件内容</Label>
                      <div 
                        className="p-4 border rounded-lg bg-white min-h-[300px]"
                        dangerouslySetInnerHTML={{ __html: previewData.result.body }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}