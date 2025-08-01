'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Beaker } from 'lucide-react'
import { PesticideForm } from '@/components/pesticide/pesticide-form'
import { useCreatePesticide } from '@/hooks/use-api'
import type { CreatePesticideRequest } from '@/lib/types'

export default function NewPesticidePage() {
  const router = useRouter()
  const createMutation = useCreatePesticide()

  const handleSubmit = async (data: CreatePesticideRequest) => {
    const pesticide = await createMutation.mutateAsync(data)
    router.push(`/content/pesticides/${pesticide.id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/content/pesticides">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Beaker className="h-8 w-8" />
              新建农药
            </h1>
          </div>
          <p className="text-muted-foreground ml-12">
            添加新的标准农药信息
          </p>
        </div>
      </div>

      <PesticideForm
        onSubmit={handleSubmit}
        loading={createMutation.isPending}
      />
    </div>
  )
}