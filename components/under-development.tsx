import { Construction, Clock, Wrench } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface UnderDevelopmentProps {
  title?: string
  description?: string
  estimatedCompletion?: string
}

export default function UnderDevelopment({
  title = "功能开发中",
  description = "该功能正在紧张开发中，敬请期待！",
  estimatedCompletion
}: UnderDevelopmentProps) {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-8">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-8 pb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Construction className="h-16 w-16 text-primary animate-bounce" />
              <div className="absolute -top-2 -right-2">
                <Clock className="h-6 w-6 text-orange-500 animate-pulse" />
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {title}
          </h2>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            {description}
          </p>
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
            <Wrench className="h-4 w-4" />
            <span>开发团队正在努力实现中...</span>
          </div>
          
          {estimatedCompletion && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <strong>预计完成时间：</strong>{estimatedCompletion}
              </p>
            </div>
          )}
          
          <div className="mt-6 flex justify-center">
            <div className="flex space-x-1">
              <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
              <div className="h-2 w-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="h-2 w-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}