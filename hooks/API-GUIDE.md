# API 调用规范

项目采用统一的 API 调用架构，所有新功能必须遵循以下规范：

## 1. 类型定义 (`lib/types.ts`)

为每个功能模块定义完整的 TypeScript 类型：

```typescript
// 数据模型
export interface SampleRequest {
  id: string
  // ... 其他字段
}

// 查询参数
export interface SampleRequestQuery {
  page?: number
  limit?: number
  // ... 其他查询参数
}

// 统计数据
export interface SampleRequestStats {
  total: number
  // ... 其他统计字段
}

// 请求参数
export interface UpdateSampleRequestStatusRequest {
  status: string
  // ... 其他请求字段
}
```

## 2. API 方法定义 (`lib/api.ts`)

在 `lib/api.ts` 中定义 API 方法，使用统一的 `apiClient`：

```typescript
// 1. 导入类型
import type {
  SampleRequest,
  SampleRequestQuery,
  SampleRequestStats,
  UpdateSampleRequestStatusRequest,
} from './types'

// 2. 定义 API 对象
export const sampleRequestApi = {
  // 获取列表
  getSampleRequests: (query: SampleRequestQuery = {}): Promise<ApiResponse<SampleRequest[]>> =>
    apiClient.get('/admin/sample-requests', filterQueryParams(query)),
  
  // 获取统计数据
  getSampleRequestStats: (): Promise<SampleRequestStats> =>
    apiClient.get('/admin/sample-requests/stats'),
  
  // 获取详情
  getSampleRequest: (id: string): Promise<SampleRequest> =>
    apiClient.get(`/admin/sample-requests/${id}`),
  
  // 更新状态
  updateSampleRequestStatus: (id: string, data: UpdateSampleRequestStatusRequest): Promise<SampleRequest> =>
    apiClient.patch(`/admin/sample-requests/${id}/status`, data),
  
  // 删除
  deleteSampleRequest: (id: string): Promise<{ message: string }> =>
    apiClient.delete(`/admin/sample-requests/${id}`),
}

// 3. 在导出的 api 对象中添加
export const api = {
  // ... 其他 API
  sampleRequest: sampleRequestApi,
}
```

## 3. React Query Hooks (`hooks/use-api.ts`)

使用 React Query 创建统一的 hooks：

```typescript
// 1. 导入类型
import type {
  SampleRequest,
  SampleRequestQuery,
  SampleRequestStats,
  UpdateSampleRequestStatusRequest,
} from '@/lib/types'

// 2. 定义查询键
export const queryKeys = {
  // ... 其他查询键
  sampleRequests: (query?: SampleRequestQuery) => ['sample-requests', query] as const,
  sampleRequest: (id: string) => ['sample-requests', id] as const,
  sampleRequestStats: ['sample-requests', 'stats'] as const,
}

// 3. 定义 hooks

// 获取列表
export const useSampleRequests = (query?: SampleRequestQuery) => {
  return useQuery({
    queryKey: queryKeys.sampleRequests(query),
    queryFn: () => api.sampleRequest.getSampleRequests(query),
    staleTime: 30 * 1000, // 30秒内不重新请求
  })
}

// 获取详情
export const useSampleRequest = (id: string) => {
  return useQuery({
    queryKey: queryKeys.sampleRequest(id),
    queryFn: () => api.sampleRequest.getSampleRequest(id),
    enabled: !!id,
  })
}

// 获取统计数据
export const useSampleRequestStats = () => {
  return useQuery({
    queryKey: queryKeys.sampleRequestStats,
    queryFn: api.sampleRequest.getSampleRequestStats,
    staleTime: 30 * 1000,
  })
}

// 更新操作
export const useUpdateSampleRequestStatus = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSampleRequestStatusRequest }) => 
      api.sampleRequest.updateSampleRequestStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sample-requests'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.sampleRequestStats })
      toast.success('状态更新成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '状态更新失败')
    },
  })
}

// 删除操作
export const useDeleteSampleRequest = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => api.sampleRequest.deleteSampleRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sample-requests'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.sampleRequestStats })
      toast.success('删除成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '删除失败')
    },
  })
}
```

## 4. 在组件中使用

在页面组件中使用定义好的 hooks：

```typescript
// 列表页面
export default function SampleRequestsPage() {
  const [page, setPage] = useState(1)
  const [searchNo, setSearchNo] = useState("")
  
  // 构建查询参数
  const query: SampleRequestQuery = {
    page,
    limit: 20,
    ...(searchNo && { sampleReqNo: searchNo }),
  }
  
  // 使用 hooks
  const { data: stats } = useSampleRequestStats()
  const { data, isLoading } = useSampleRequests(query)
  const sampleRequests = data?.data || []
  
  // ... 组件逻辑
}

// 详情页面
export default function SampleRequestDetailPage() {
  const { id } = useParams()
  
  // 使用 hooks
  const { data: sampleRequest, isLoading } = useSampleRequest(id)
  const updateStatusMutation = useUpdateSampleRequestStatus()
  const deleteMutation = useDeleteSampleRequest()
  
  // 更新状态
  const handleStatusUpdate = () => {
    updateStatusMutation.mutate(
      { id, data: updateData },
      {
        onSuccess: () => {
          // 成功后的处理
        },
      }
    )
  }
  
  // ... 组件逻辑
}
```

## 重要规则

1. **禁止直接使用 fetch**：所有 API 调用必须通过 `apiClient` 和定义的 hooks
2. **类型安全**：所有数据模型、请求参数、响应类型都必须有 TypeScript 类型定义
3. **错误处理**：使用 toast 进行用户友好的错误提示
4. **缓存管理**：合理设置 `staleTime` 和使用 `invalidateQueries` 更新缓存
5. **查询键规范**：使用 `queryKeys` 对象统一管理查询键，确保缓存失效的准确性
6. **加载状态**：在组件中处理 `isLoading`、`error` 等状态
7. **分页规范**：列表查询必须支持分页，使用 `page` 和 `limit` 参数

## 参考示例

- 询盘管理：`app/business/inquiries/page.tsx`
- 样品管理：`app/business/sample-requests/page.tsx`