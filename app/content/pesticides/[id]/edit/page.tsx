'use client'

import { use } from 'react'
import { notFound, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Beaker } from 'lucide-react'
import { PesticideForm } from '@/components/pesticide/pesticide-form'
import { usePesticide, useUpdatePesticide } from '@/hooks/use-api'
import { ErrorDisplay } from '@/components/ui/error-display'
import { LoadingState } from '@/components/ui/loading-state'
import type { UpdatePesticideRequest } from '@/lib/types'

interface EditPesticidePageProps {
  params: Promise<{ id: string }>
}

export default function EditPesticidePage({ params }: EditPesticidePageProps) {
  const { id } = use(params)
  const pesticideId = parseInt(id)
  const router = useRouter()
  
  const { data: pesticide, isLoading, error } = usePesticide(pesticideId)
  const updateMutation = useUpdatePesticide()

  const handleSubmit = async (data: UpdatePesticideRequest) => {
    await updateMutation.mutateAsync({ id: pesticideId, data })
    router.push(`/content/pesticides/${pesticideId}`)
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/content/pesticides">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">编辑农药</h1>
        </div>
        <ErrorDisplay 
          error={error}
          title="加载农药数据失败"
          showRetry={true}
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/content/pesticides">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">编辑农药</h1>
        </div>
        <LoadingState
          type="card"
          message="加载农药信息..."
          description="正在获取农药数据"
          icon="package"
        />
      </div>
    )
  }

  if (!pesticide) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href={`/content/pesticides/${pesticideId}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Beaker className="h-8 w-8" />
              编辑农药
            </h1>
          </div>
          <p className="text-muted-foreground ml-12">
            修改农药信息
          </p>
        </div>
      </div>

      <PesticideForm
        pesticide={pesticide}
        onSubmit={handleSubmit}
        loading={updateMutation.isPending}
      />
    </div>
  )
}