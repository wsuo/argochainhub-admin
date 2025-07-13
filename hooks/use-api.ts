import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import type {
  CompanyQuery,
  ProductQuery,
  UserQuery,
  OrderQuery,
  PlanQuery,
  AdminLoginRequest,
  ReviewRequest,
  CreateCompanyRequest,
  UpdateCompanyRequest,
  CreatePlanRequest,
  UpdatePlanRequest,
  CreateSubscriptionRequest,
  TranslateRequest,
  DetectLanguageRequest,
} from '@/lib/types'

// 查询键常量
export const queryKeys = {
  // 仪表盘
  dashboardStats: ['dashboard', 'stats'] as const,
  dashboardCharts: ['dashboard', 'charts'] as const,
  
  // 企业管理
  companies: (query?: CompanyQuery) => ['companies', query] as const,
  pendingCompanies: (query?: Omit<CompanyQuery, 'status'>) => ['companies', 'pending', query] as const,
  company: (id: number) => ['companies', id] as const,
  companySubscriptions: (id: number, query?: { page?: number; limit?: number }) => 
    ['companies', id, 'subscriptions', query] as const,
  
  // 产品管理
  products: (query?: ProductQuery) => ['products', query] as const,
  pendingProducts: (query?: Omit<ProductQuery, 'status'>) => ['products', 'pending', query] as const,
  product: (id: number) => ['products', id] as const,
  
  // 用户管理
  users: (query?: UserQuery) => ['users', query] as const,
  user: (id: number) => ['users', id] as const,
  
  // 订单管理
  orders: (query?: OrderQuery) => ['orders', query] as const,
  order: (id: number) => ['orders', id] as const,
  
  // 会员计划
  plans: (query?: PlanQuery) => ['plans', query] as const,
}

// 仪表盘相关hooks
export const useDashboardStats = () => {
  return useQuery({
    queryKey: queryKeys.dashboardStats,
    queryFn: api.dashboard.getStats,
    staleTime: 5 * 60 * 1000, // 5分钟内不重新请求
  })
}

export const useDashboardCharts = () => {
  return useQuery({
    queryKey: queryKeys.dashboardCharts,
    queryFn: api.dashboard.getCharts,
    staleTime: 5 * 60 * 1000,
  })
}

// 认证相关hooks
export const useLogin = () => {
  return useMutation({
    mutationFn: (data: AdminLoginRequest) => api.auth.login(data),
    onSuccess: (response) => {
      // 保存token到cookie (这里会在登录页面中手动处理)
      toast.success('登录成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '登录失败')
    },
  })
}

// 企业管理相关hooks
export const useCompanies = (query: CompanyQuery = {}) => {
  return useQuery({
    queryKey: queryKeys.companies(query),
    queryFn: () => api.company.getCompanies(query),
  })
}

export const usePendingCompanies = (query: Omit<CompanyQuery, 'status'> = {}) => {
  return useQuery({
    queryKey: queryKeys.pendingCompanies(query),
    queryFn: () => api.company.getPendingCompanies(query),
  })
}

export const useCompany = (id: number) => {
  return useQuery({
    queryKey: queryKeys.company(id),
    queryFn: () => api.company.getCompany(id),
    enabled: !!id,
  })
}

export const useCompanySubscriptions = (id: number, query: { page?: number; limit?: number } = {}) => {
  return useQuery({
    queryKey: queryKeys.companySubscriptions(id, query),
    queryFn: () => api.company.getCompanySubscriptions(id, query),
    enabled: !!id,
  })
}

export const useReviewCompany = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ReviewRequest }) => 
      api.company.reviewCompany(id, data),
    onSuccess: () => {
      // 刷新相关查询
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      toast.success('企业审核操作完成')
    },
    onError: (error: any) => {
      toast.error(error.message || '审核操作失败')
    },
  })
}

export const useToggleCompanyStatus = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => api.company.toggleCompanyStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      toast.success('企业状态已更新')
    },
    onError: (error: any) => {
      toast.error(error.message || '状态更新失败')
    },
  })
}

export const useCreateCompany = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateCompanyRequest) => api.company.createCompany(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      toast.success('企业创建成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '企业创建失败')
    },
  })
}

export const useUpdateCompany = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCompanyRequest }) => 
      api.company.updateCompany(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      toast.success('企业信息已更新')
    },
    onError: (error: any) => {
      toast.error(error.message || '企业信息更新失败')
    },
  })
}

// 产品管理相关hooks
export const useProducts = (query: ProductQuery = {}) => {
  return useQuery({
    queryKey: queryKeys.products(query),
    queryFn: () => api.product.getProducts(query),
  })
}

export const usePendingProducts = (query: Omit<ProductQuery, 'status'> = {}) => {
  return useQuery({
    queryKey: queryKeys.pendingProducts(query),
    queryFn: () => api.product.getPendingProducts(query),
  })
}

export const useProduct = (id: number) => {
  return useQuery({
    queryKey: queryKeys.product(id),
    queryFn: () => api.product.getProduct(id),
    enabled: !!id,
  })
}

export const useReviewProduct = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ReviewRequest }) => 
      api.product.reviewProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('产品审核操作完成')
    },
    onError: (error: any) => {
      toast.error(error.message || '审核操作失败')
    },
  })
}

// 用户管理相关hooks
export const useUsers = (query: UserQuery = {}) => {
  return useQuery({
    queryKey: queryKeys.users(query),
    queryFn: () => api.user.getUsers(query),
  })
}

export const useUser = (id: number) => {
  return useQuery({
    queryKey: queryKeys.user(id),
    queryFn: () => api.user.getUser(id),
    enabled: !!id,
  })
}

// 订单管理相关hooks
export const useOrders = (query: OrderQuery = {}) => {
  return useQuery({
    queryKey: queryKeys.orders(query),
    queryFn: () => api.order.getOrders(query),
  })
}

export const useOrder = (id: number) => {
  return useQuery({
    queryKey: queryKeys.order(id),
    queryFn: () => api.order.getOrder(id),
    enabled: !!id,
  })
}

// 会员计划管理相关hooks
export const usePlans = (query: PlanQuery = {}) => {
  return useQuery({
    queryKey: queryKeys.plans(query),
    queryFn: () => api.plan.getPlans(query),
  })
}

export const useCreatePlan = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreatePlanRequest) => api.plan.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
      toast.success('会员计划创建成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '创建失败')
    },
  })
}

export const useUpdatePlan = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePlanRequest }) => 
      api.plan.updatePlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
      toast.success('会员计划更新成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '更新失败')
    },
  })
}

// 订阅管理相关hooks
export const useCreateSubscription = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateSubscriptionRequest) => api.subscription.createSubscription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      toast.success('订阅赠送成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '订阅赠送失败')
    },
  })
}

// 工具相关hooks
export const useTranslate = () => {
  return useMutation({
    mutationFn: (data: TranslateRequest) => api.utility.translate(data),
    onError: (error: any) => {
      toast.error(error.message || '翻译失败')
    },
  })
}

export const useDetectLanguage = () => {
  return useMutation({
    mutationFn: (data: DetectLanguageRequest) => api.utility.detectLanguage(data),
    onError: (error: any) => {
      toast.error(error.message || '语言检测失败')
    },
  })
}