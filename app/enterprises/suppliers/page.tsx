'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SuppliersPage() {
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
            <CardTitle>供应商管理</CardTitle>
            <CardDescription>管理平台上的供应商企业</CardDescription>
          </CardHeader>
          <CardContent>
            <p>供应商列表和管理功能正在开发中...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}