'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ProductReviewPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              产品审核
              <Badge variant="destructive">8</Badge>
            </CardTitle>
            <CardDescription>审核新提交的产品信息</CardDescription>
          </CardHeader>
          <CardContent>
            <p>产品审核列表和功能正在开发中...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}