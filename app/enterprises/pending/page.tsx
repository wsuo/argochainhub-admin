'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function PendingEnterprisesPage() {
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
              待审核企业
              <Badge variant="destructive">23</Badge>
            </CardTitle>
            <CardDescription>审核新注册的企业申请</CardDescription>
          </CardHeader>
          <CardContent>
            <p>待审核企业列表和审核功能正在开发中...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}