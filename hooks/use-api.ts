import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useDictionaryOptions } from '@/lib/dictionary-utils'
import type {
  CompanyQuery,
  ProductQuery,
  CreateProductRequest,
  UpdateProductRequest,
  CreateControlMethodRequest,
  UpdateControlMethodRequest,
  BatchCreateControlMethodsRequest,
  UpdateControlMethodOrderRequest,
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
  DictionaryCategoryQuery,
  DictionaryItemQuery,
  CreateDictionaryCategoryRequest,
  UpdateDictionaryCategoryRequest,
  CreateDictionaryItemRequest,
  UpdateDictionaryItemRequest,
  BatchImportDictionaryItemRequest,
  BatchReviewProductRequest,
  BatchReviewProductResponse,
  CompanyUser,
  CompanyUserQuery,
  CreateCompanyUserRequest,
  UpdateCompanyUserRequest,
  InquiryQuery,
  InquiryStats,
  SampleRequest,
  SampleRequestQuery,
  SampleRequestStats,
  UpdateSampleRequestStatusRequest,
  RegistrationRequest,
  RegistrationRequestQuery,
  RegistrationRequestStats,
  UpdateRegistrationRequestStatusRequest,
  VipConfig,
  VipConfigQuery,
  VipConfigStats,
  CreateVipConfigRequest,
  UpdateVipConfigRequest,
  BatchToggleVipConfigStatusRequest,
  UpdateVipConfigSortOrderRequest,
  News,
  NewsQuery,
  CreateNewsRequest,
  UpdateNewsRequest,
  NewsListResponse,
  NewsDetailResponse,
  // 邮件管理相关类型
  EmailConfig,
  EmailConfigQuery,
  CreateEmailConfigRequest,
  UpdateEmailConfigRequest,
  TestEmailConfigRequest,
  EmailTemplate,
  EmailTemplateQuery,
  CreateEmailTemplateRequest,
  UpdateEmailTemplateRequest,
  PreviewEmailTemplateRequest,
  EmailHistory,
  EmailHistoryQuery,
  SendEmailRequest,
  SendDirectEmailRequest,
  ResendEmailRequest,
  // 农药管理相关类型
  Pesticide,
  PesticideQuery,
  CreatePesticideRequest,
  UpdatePesticideRequest,
  PriceTrend,
  PriceTrendQuery,
  CreatePriceTrendRequest,
  UpdatePriceTrendRequest,
  PriceTrendChartData,
  ImageParseRequest,
  ImageParseResponse,
  // 管理员通知相关类型
  AdminNotification,
  AdminNotificationQuery,
  UnreadNotificationCountResponse,
  UnreadCountByPriorityResponse,
  BroadcastNotificationRequest,
  PermissionNotificationRequest,
  SystemAlertRequest,
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
  
  // 企业用户管理
  companyUsers: (companyId: number, query?: CompanyUserQuery) => ['companies', companyId, 'users', query] as const,
  companyUser: (companyId: number, userId: number) => ['companies', companyId, 'users', userId] as const,
  
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
  
  // 认证
  currentUser: ['auth', 'current-user'] as const,
  
  // 字典管理
  dictionaryCategories: (query?: DictionaryCategoryQuery) => ['dictionary', 'categories', query] as const,
  dictionaryCategory: (code: string) => ['dictionary', 'categories', code] as const,
  dictionaryItems: (code: string, query?: DictionaryItemQuery) => ['dictionary', 'items', code, query] as const,
  dictionary: (code: string) => ['dictionary', code] as const,
  countriesWithFlags: ['dictionary', 'countries', 'with-flags'] as const,
  
  // 询盘管理
  inquiries: (query?: InquiryQuery) => ['inquiries', query] as const,
  inquiry: (id: number) => ['inquiries', id] as const,
  inquiryStats: ['inquiries', 'stats'] as const,
  
  // 样品申请管理
  sampleRequests: (query?: SampleRequestQuery) => ['sample-requests', query] as const,
  sampleRequest: (id: string) => ['sample-requests', id] as const,
  sampleRequestStats: ['sample-requests', 'stats'] as const,
  
  // 登记管理
  registrationRequests: (query?: RegistrationRequestQuery) => ['registration-requests', query] as const,
  registrationRequest: (id: string) => ['registration-requests', id] as const,
  registrationRequestStats: ['registration-requests', 'stats'] as const,
  
  // VIP配置管理
  vipConfigs: (query?: VipConfigQuery) => ['vip-configs', query] as const,
  vipConfig: (id: number) => ['vip-configs', id] as const,
  vipConfigStats: ['vip-configs', 'stats'] as const,
  vipConfigsByPlatform: (platform: 'supplier' | 'purchaser') => ['vip-configs', 'platform', platform] as const,
  
  // 新闻资讯管理
  news: (query?: NewsQuery) => ['news', query] as const,
  newsById: (id: string) => ['news', id] as const,

  // 邮件配置管理
  emailConfigs: (query?: EmailConfigQuery) => ['email-configs', query] as const,
  emailConfig: (id: number) => ['email-configs', id] as const,

  // 邮件模板管理
  emailTemplates: (query?: EmailTemplateQuery) => ['email-templates', query] as const,
  emailTemplate: (id: number) => ['email-templates', id] as const,

  // 邮件发送历史
  emailHistories: (query?: EmailHistoryQuery) => ['email-histories', query] as const,
  emailHistory: (id: number) => ['email-histories', id] as const,
  emailStatistics: (days: number) => ['email-histories', 'statistics', days] as const,
  
  // 农药管理
  pesticides: (query?: PesticideQuery) => ['pesticides', query] as const,
  pesticide: (id: number) => ['pesticides', id] as const,
  
  // 价格走势管理
  priceTrends: (query?: PriceTrendQuery) => ['price-trends', query] as const,
  priceTrend: (id: number) => ['price-trends', id] as const,
  priceTrendChart: (pesticideId: number, query?: { startDate?: string; endDate?: string }) => 
    ['price-trends', 'chart', pesticideId, query] as const,
  
  // 管理员通知管理
  adminNotifications: (query?: AdminNotificationQuery) => ['admin-notifications', query] as const,
  unreadNotificationCount: ['admin-notifications', 'unread-count'] as const,
  unreadCountByPriority: ['admin-notifications', 'unread-count-by-priority'] as const,
  filterTree: ['admin-notifications', 'filter-tree'] as const,
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

export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: api.auth.getCurrentUser,
    retry: false, // 如果401错误不重试
    staleTime: 5 * 60 * 1000, // 5分钟内不重新请求
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

export const useCreateProduct = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateProductRequest) => api.product.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('产品创建成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '产品创建失败')
    },
  })
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductRequest }) => 
      api.product.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('产品信息已更新')
    },
    onError: (error: any) => {
      toast.error(error.message || '产品信息更新失败')
    },
  })
}

export const useDeleteProduct = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => api.product.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('产品删除成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '产品删除失败')
    },
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

export const useBatchReviewProduct = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: BatchReviewProductRequest) => 
      api.product.batchReviewProduct(data),
    onSuccess: (result: BatchReviewProductResponse) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      
      if (result.failed === 0) {
        toast.success(`批量审核完成！成功处理 ${result.success} 个产品`)
      } else {
        toast.warning(`批量审核完成！成功 ${result.success} 个，失败 ${result.failed} 个`)
      }
    },
    onError: (error: any) => {
      toast.error(error.message || '批量审核操作失败')
    },
  })
}

export const useListProduct = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => api.product.listProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('产品已上架')
    },
    onError: (error: any) => {
      toast.error(error.message || '产品上架失败')
    },
  })
}

export const useUnlistProduct = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => api.product.unlistProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('产品已下架')
    },
    onError: (error: any) => {
      toast.error(error.message || '产品下架失败')
    },
  })
}

// 防治方法相关hooks
export const useControlMethods = (productId: number) => {
  return useQuery({
    queryKey: ['controlMethods', productId],
    queryFn: () => api.product.getControlMethods(productId),
    enabled: !!productId,
  })
}

export const useCreateControlMethod = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ productId, data }: { productId: number; data: CreateControlMethodRequest }) => 
      api.product.createControlMethod(productId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['controlMethods', variables.productId] })
      queryClient.invalidateQueries({ queryKey: ['products', variables.productId] })
      toast.success('防治方法创建成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '防治方法创建失败')
    },
  })
}

export const useBatchCreateControlMethods = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ productId, data }: { productId: number; data: BatchCreateControlMethodsRequest }) => 
      api.product.batchCreateControlMethods(productId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['controlMethods', variables.productId] })
      queryClient.invalidateQueries({ queryKey: ['products', variables.productId] })
      toast.success('防治方法批量创建成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '防治方法批量创建失败')
    },
  })
}

export const useUpdateControlMethod = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateControlMethodRequest }) => 
      api.product.updateControlMethod(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['controlMethods'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('防治方法更新成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '防治方法更新失败')
    },
  })
}

export const useDeleteControlMethod = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => api.product.deleteControlMethod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['controlMethods'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('防治方法删除成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '防治方法删除失败')
    },
  })
}

export const useUpdateControlMethodOrder = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ productId, data }: { productId: number; data: UpdateControlMethodOrderRequest }) => 
      api.product.updateControlMethodOrder(productId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['controlMethods', variables.productId] })
      toast.success('防治方法排序更新成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '防治方法排序更新失败')
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

// 字典管理相关hooks
export const useDictionaryCategories = (query: DictionaryCategoryQuery = {}) => {
  return useQuery({
    queryKey: queryKeys.dictionaryCategories(query),
    queryFn: () => api.dictionary.getCategories(query),
  })
}

export const useDictionaryCategory = (code: string) => {
  return useQuery({
    queryKey: queryKeys.dictionaryCategory(code),
    queryFn: () => api.dictionary.getCategory(code),
    enabled: !!code,
  })
}

export const useDictionaryItems = (code: string, query: DictionaryItemQuery = {}) => {
  return useQuery({
    queryKey: queryKeys.dictionaryItems(code, query),
    queryFn: () => api.dictionary.getCategoryItems(code, query),
    enabled: !!code,
  })
}

export const useDictionary = (code: string) => {
  return useQuery({
    queryKey: queryKeys.dictionary(code),
    queryFn: () => api.dictionary.getDictionary(code),
    enabled: !!code,
  })
}

export const useCountriesWithFlags = () => {
  return useQuery({
    queryKey: queryKeys.countriesWithFlags,
    queryFn: () => api.dictionary.getCountriesWithFlags(),
  })
}

export const useCreateDictionaryCategory = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateDictionaryCategoryRequest) => api.dictionary.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dictionary', 'categories'] })
      toast.success('字典分类创建成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '字典分类创建失败')
    },
  })
}

export const useUpdateDictionaryCategory = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDictionaryCategoryRequest }) => 
      api.dictionary.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dictionary', 'categories'] })
      toast.success('字典分类更新成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '字典分类更新失败')
    },
  })
}

export const useDeleteDictionaryCategory = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => api.dictionary.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dictionary', 'categories'] })
      toast.success('字典分类删除成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '字典分类删除失败')
    },
  })
}

export const useCreateDictionaryItem = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ code, data }: { code: string; data: CreateDictionaryItemRequest }) => 
      api.dictionary.createItem(code, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dictionary', 'items', variables.code] })
      queryClient.invalidateQueries({ queryKey: ['dictionary', 'categories'] })
      toast.success('字典项创建成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '字典项创建失败')
    },
  })
}

export const useUpdateDictionaryItem = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDictionaryItemRequest }) => 
      api.dictionary.updateItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dictionary', 'items'] })
      queryClient.invalidateQueries({ queryKey: ['dictionary', 'categories'] })
      toast.success('字典项更新成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '字典项更新失败')
    },
  })
}

export const useDeleteDictionaryItem = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => api.dictionary.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dictionary', 'items'] })
      queryClient.invalidateQueries({ queryKey: ['dictionary', 'categories'] })
      toast.success('字典项删除成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '字典项删除失败')
    },
  })
}

export const useBatchImportDictionaryItems = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ code, data }: { code: string; data: BatchImportDictionaryItemRequest }) => 
      api.dictionary.batchImport(code, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dictionary', 'items', variables.code] })
      queryClient.invalidateQueries({ queryKey: ['dictionary', 'categories'] })
      toast.success('字典项批量导入成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '字典项批量导入失败')
    },
  })
}

// 企业用户管理相关hooks
export const useCompanyUsers = (companyId: number, query: CompanyUserQuery = {}) => {
  return useQuery({
    queryKey: queryKeys.companyUsers(companyId, query),
    queryFn: () => api.companyUser.getCompanyUsers(companyId, query),
    enabled: !!companyId,
  })
}

export const useCompanyUser = (companyId: number, userId: number) => {
  return useQuery({
    queryKey: queryKeys.companyUser(companyId, userId),
    queryFn: () => api.companyUser.getCompanyUser(companyId, userId),
    enabled: !!companyId && !!userId,
  })
}

export const useCreateCompanyUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ companyId, data }: { companyId: number; data: CreateCompanyUserRequest }) => 
      api.companyUser.createCompanyUser(companyId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['companies', variables.companyId, 'users'] })
      queryClient.invalidateQueries({ queryKey: ['companies', variables.companyId] })
      toast.success('企业用户创建成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '企业用户创建失败')
    },
  })
}

export const useUpdateCompanyUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ companyId, userId, data }: { companyId: number; userId: number; data: UpdateCompanyUserRequest }) => 
      api.companyUser.updateCompanyUser(companyId, userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['companies', variables.companyId, 'users'] })
      queryClient.invalidateQueries({ queryKey: ['companies', variables.companyId, 'users', variables.userId] })
      toast.success('企业用户信息已更新')
    },
    onError: (error: any) => {
      toast.error(error.message || '企业用户信息更新失败')
    },
  })
}

export const useDeleteCompanyUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ companyId, userId }: { companyId: number; userId: number }) => 
      api.companyUser.deleteCompanyUser(companyId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['companies', variables.companyId, 'users'] })
      queryClient.invalidateQueries({ queryKey: ['companies', variables.companyId] })
      toast.success('企业用户删除成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '企业用户删除失败')
    },
  })
}

export const useToggleCompanyUserStatus = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ companyId, userId }: { companyId: number; userId: number }) => 
      api.companyUser.toggleCompanyUserStatus(companyId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['companies', variables.companyId, 'users'] })
      queryClient.invalidateQueries({ queryKey: ['companies', variables.companyId, 'users', variables.userId] })
      toast.success('企业用户状态已更新')
    },
    onError: (error: any) => {
      toast.error(error.message || '企业用户状态更新失败')
    },
  })
}

// ================================
// 询盘管理相关 hooks
// ================================

// 获取询盘列表
export const useInquiries = (query?: InquiryQuery) => {
  return useQuery({
    queryKey: queryKeys.inquiries(query),
    queryFn: () => api.inquiry.getInquiries(query),
    staleTime: 30 * 1000, // 30秒内不重新请求
  })
}

// 获取询盘详情
export const useInquiry = (id: number) => {
  return useQuery({
    queryKey: queryKeys.inquiry(id),
    queryFn: () => api.inquiry.getInquiry(id),
    enabled: !!id,
  })
}

// 获取询盘统计数据
export const useInquiryStats = () => {
  return useQuery({
    queryKey: queryKeys.inquiryStats,
    queryFn: () => api.inquiry.getInquiryStats(),
    staleTime: 60 * 1000, // 1分钟内不重新请求
  })
}

// 更新询盘状态
export const useUpdateInquiryStatus = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: number; 
      data: { 
        status: string; 
        quoteDetails?: any; 
        declineReason?: string; 
        operatedBy?: string; 
      } 
    }) => api.inquiry.updateInquiryStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] })
      queryClient.invalidateQueries({ queryKey: ['inquiries', variables.id] })
      queryClient.invalidateQueries({ queryKey: queryKeys.inquiryStats })
      toast.success('询盘状态已更新')
    },
    onError: (error: any) => {
      toast.error(error.message || '询盘状态更新失败')
    },
  })
}

// 删除询盘
export const useDeleteInquiry = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => api.inquiry.deleteInquiry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.inquiryStats })
      toast.success('询盘删除成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '询盘删除失败')
    },
  })
}

// 样品申请相关hooks

// 获取样品申请列表
export const useSampleRequests = (query?: SampleRequestQuery) => {
  return useQuery({
    queryKey: queryKeys.sampleRequests(query),
    queryFn: () => api.sampleRequest.getSampleRequests(query),
    staleTime: 30 * 1000, // 30秒内不重新请求
  })
}

// 获取样品申请详情
export const useSampleRequest = (id: string) => {
  return useQuery({
    queryKey: queryKeys.sampleRequest(id),
    queryFn: () => api.sampleRequest.getSampleRequest(id),
    enabled: !!id,
  })
}

// 获取样品申请统计数据
export const useSampleRequestStats = () => {
  return useQuery({
    queryKey: queryKeys.sampleRequestStats,
    queryFn: api.sampleRequest.getSampleRequestStats,
    staleTime: 30 * 1000,
  })
}

// 更新样品申请状态
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

// 删除样品申请
export const useDeleteSampleRequest = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => api.sampleRequest.deleteSampleRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sample-requests'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.sampleRequestStats })
      toast.success('样品申请删除成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '样品申请删除失败')
    },
  })
}

// 登记管理相关 hooks
// 获取登记申请列表
export const useRegistrationRequests = (query?: RegistrationRequestQuery) => {
  return useQuery({
    queryKey: queryKeys.registrationRequests(query),
    queryFn: () => api.registrationRequest.getRegistrationRequests(query),
    staleTime: 30 * 1000,
  })
}

// 获取登记申请详情
export const useRegistrationRequest = (id: string) => {
  return useQuery({
    queryKey: queryKeys.registrationRequest(id),
    queryFn: () => api.registrationRequest.getRegistrationRequest(id),
    enabled: !!id,
  })
}

// 获取登记申请统计数据
export const useRegistrationRequestStats = () => {
  return useQuery({
    queryKey: queryKeys.registrationRequestStats,
    queryFn: api.registrationRequest.getRegistrationRequestStats,
    staleTime: 30 * 1000,
  })
}

// 更新登记申请状态
export const useUpdateRegistrationRequestStatus = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRegistrationRequestStatusRequest }) => 
      api.registrationRequest.updateRegistrationRequestStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registration-requests'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.registrationRequestStats })
      toast.success('状态更新成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '状态更新失败')
    },
  })
}

// 删除登记申请
export const useDeleteRegistrationRequest = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => api.registrationRequest.deleteRegistrationRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registration-requests'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.registrationRequestStats })
      toast.success('登记申请删除成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '登记申请删除失败')
    },
  })
}

// VIP配置管理相关 hooks
// 获取VIP配置列表
export const useVipConfigs = (query?: VipConfigQuery) => {
  return useQuery({
    queryKey: queryKeys.vipConfigs(query),
    queryFn: () => api.vipConfig.getVipConfigs(query),
    staleTime: 30 * 1000,
  })
}

// 获取VIP配置详情
export const useVipConfig = (id: number) => {
  return useQuery({
    queryKey: queryKeys.vipConfig(id),
    queryFn: () => api.vipConfig.getVipConfig(id),
    enabled: !!id,
  })
}

// 获取VIP配置统计数据
export const useVipConfigStats = () => {
  return useQuery({
    queryKey: queryKeys.vipConfigStats,
    queryFn: api.vipConfig.getVipConfigStats,
    staleTime: 30 * 1000,
  })
}

// 根据平台获取VIP配置
export const useVipConfigsByPlatform = (platform: 'supplier' | 'purchaser') => {
  return useQuery({
    queryKey: queryKeys.vipConfigsByPlatform(platform),
    queryFn: () => api.vipConfig.getVipConfigsByPlatform(platform),
    staleTime: 30 * 1000,
  })
}

// 创建VIP配置
export const useCreateVipConfig = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateVipConfigRequest) => api.vipConfig.createVipConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vip-configs'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.vipConfigStats })
      toast.success('VIP配置创建成功')
    },
    onError: (error: any) => {
      toast.error(error.message || 'VIP配置创建失败')
    },
  })
}

// 更新VIP配置
export const useUpdateVipConfig = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateVipConfigRequest }) => 
      api.vipConfig.updateVipConfig(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vip-configs'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.vipConfigStats })
      toast.success('VIP配置更新成功')
    },
    onError: (error: any) => {
      toast.error(error.message || 'VIP配置更新失败')
    },
  })
}

// 删除VIP配置
export const useDeleteVipConfig = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => api.vipConfig.deleteVipConfig(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vip-configs'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.vipConfigStats })
      toast.success('VIP配置删除成功')
    },
    onError: (error: any) => {
      toast.error(error.message || 'VIP配置删除失败')
    },
  })
}

// 切换VIP配置状态
export const useToggleVipConfigStatus = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => api.vipConfig.toggleVipConfigStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vip-configs'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.vipConfigStats })
      toast.success('状态切换成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '状态切换失败')
    },
  })
}

// 批量切换VIP配置状态
export const useBatchToggleVipConfigStatus = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: BatchToggleVipConfigStatusRequest) => api.vipConfig.batchToggleVipConfigStatus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vip-configs'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.vipConfigStats })
      toast.success('批量操作成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '批量操作失败')
    },
  })
}

// 更新VIP配置排序
export const useUpdateVipConfigSortOrder = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateVipConfigSortOrderRequest }) => 
      api.vipConfig.updateVipConfigSortOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vip-configs'] })
      toast.success('排序更新成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '排序更新失败')
    },
  })
}

// 新闻资讯相关hooks

// 获取新闻资讯列表
export const useNews = (query?: NewsQuery) => {
  return useQuery({
    queryKey: queryKeys.news(query),
    queryFn: () => api.news.getNews(query),
    staleTime: 30 * 1000, // 30秒内不重新请求
  })
}

// 获取新闻资讯详情
export const useNewsById = (id: string) => {
  return useQuery({
    queryKey: queryKeys.newsById(id),
    queryFn: () => api.news.getNewsById(id),
    enabled: !!id,
  })
}

// 创建新闻资讯
export const useCreateNews = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateNewsRequest) => api.news.createNews(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] })
      toast.success('新闻创建成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '新闻创建失败')
    },
  })
}

// 更新新闻资讯
export const useUpdateNews = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNewsRequest }) => 
      api.news.updateNews(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] })
      toast.success('新闻更新成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '新闻更新失败')
    },
  })
}

// 删除新闻资讯
export const useDeleteNews = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => api.news.deleteNews(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] })
      toast.success('新闻删除成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '新闻删除失败')
    },
  })
}

// 发布新闻
export const usePublishNews = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => api.news.publishNews(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] })
      toast.success('新闻发布成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '新闻发布失败')
    },
  })
}

// 取消发布新闻
export const useUnpublishNews = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => api.news.unpublishNews(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] })
      toast.success('新闻取消发布成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '新闻取消发布失败')
    },
  })
}

// ==================== 邮件配置管理相关hooks ====================

// 获取邮件配置列表
export const useEmailConfigs = (query?: EmailConfigQuery) => {
  return useQuery({
    queryKey: queryKeys.emailConfigs(query),
    queryFn: () => api.emailConfig.getEmailConfigs(query),
    staleTime: 30 * 1000,
  })
}

// 获取邮件配置详情
export const useEmailConfig = (id: number) => {
  return useQuery({
    queryKey: queryKeys.emailConfig(id),
    queryFn: () => api.emailConfig.getEmailConfig(id),
    enabled: !!id,
  })
}

// 创建邮件配置
export const useCreateEmailConfig = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateEmailConfigRequest) => api.emailConfig.createEmailConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-configs'] })
      toast.success('邮件配置创建成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '邮件配置创建失败')
    },
  })
}

// 更新邮件配置
export const useUpdateEmailConfig = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEmailConfigRequest }) => 
      api.emailConfig.updateEmailConfig(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-configs'] })
      toast.success('邮件配置更新成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '邮件配置更新失败')
    },
  })
}

// 删除邮件配置
export const useDeleteEmailConfig = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => api.emailConfig.deleteEmailConfig(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-configs'] })
      toast.success('邮件配置删除成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '邮件配置删除失败')
    },
  })
}

// 测试邮件配置
export const useTestEmailConfig = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TestEmailConfigRequest }) => 
      api.emailConfig.testEmailConfig(id, data),
    onSuccess: (result) => {
      toast.success(result.message || '邮件配置测试成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '邮件配置测试失败')
    },
  })
}

// ==================== 邮件模板管理相关hooks ====================

// 获取邮件模板列表
export const useEmailTemplates = (query?: EmailTemplateQuery) => {
  return useQuery({
    queryKey: queryKeys.emailTemplates(query),
    queryFn: () => api.emailTemplate.getEmailTemplates(query),
    staleTime: 30 * 1000,
  })
}

// 获取邮件模板详情
export const useEmailTemplate = (id: number) => {
  return useQuery({
    queryKey: queryKeys.emailTemplate(id),
    queryFn: () => api.emailTemplate.getEmailTemplate(id),
    enabled: !!id,
  })
}

// 获取触发事件列表（使用字典数据）
export const useEmailTriggerEvents = () => {
  const { data: dictionaryOptions } = useDictionaryOptions('email_trigger_event')
  
  return useQuery({
    queryKey: ['emailTriggerEvents', 'dictionary'],
    queryFn: () => {
      // 将字典选项转换为触发事件数组
      const events = dictionaryOptions.map(option => option.value)
      return Promise.resolve(events)
    },
    enabled: !!dictionaryOptions?.length,
    staleTime: 5 * 60 * 1000, // 5分钟内不重新请求
  })
}

// 创建邮件模板
export const useCreateEmailTemplate = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateEmailTemplateRequest) => api.emailTemplate.createEmailTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] })
      toast.success('邮件模板创建成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '邮件模板创建失败')
    },
  })
}

// 更新邮件模板
export const useUpdateEmailTemplate = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEmailTemplateRequest }) => 
      api.emailTemplate.updateEmailTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] })
      toast.success('邮件模板更新成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '邮件模板更新失败')
    },
  })
}

// 删除邮件模板
export const useDeleteEmailTemplate = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => api.emailTemplate.deleteEmailTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] })
      toast.success('邮件模板删除成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '邮件模板删除失败')
    },
  })
}

// 预览邮件模板
export const usePreviewEmailTemplate = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PreviewEmailTemplateRequest }) => 
      api.emailTemplate.previewEmailTemplate(id, data),
    onError: (error: any) => {
      toast.error(error.message || '邮件模板预览失败')
    },
  })
}

// ==================== 邮件发送历史相关hooks ====================

// 获取邮件发送历史列表
export const useEmailHistories = (query?: EmailHistoryQuery) => {
  return useQuery({
    queryKey: queryKeys.emailHistories(query),
    queryFn: () => api.emailHistory.getEmailHistories(query),
    staleTime: 30 * 1000,
  })
}

// 获取邮件发送详情
export const useEmailHistory = (id: number) => {
  return useQuery({
    queryKey: queryKeys.emailHistory(id),
    queryFn: () => api.emailHistory.getEmailHistory(id),
    enabled: !!id,
  })
}

// 获取邮件统计信息
export const useEmailStatistics = (days: number = 7) => {
  return useQuery({
    queryKey: queryKeys.emailStatistics(days),
    queryFn: () => api.emailHistory.getEmailStatistics(days),
    staleTime: 5 * 60 * 1000, // 5分钟内不重新请求
  })
}

// 重新发送邮件
export const useResendEmail = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data?: ResendEmailRequest }) => 
      api.emailHistory.resendEmail(id, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['email-histories'] })
      toast.success(result.message || '邮件重新发送成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '邮件重新发送失败')
    },
  })
}

// 发送邮件（使用模板）
export const useSendEmail = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: SendEmailRequest) => api.emailHistory.sendEmail(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-histories'] })
      toast.success('邮件发送成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '邮件发送失败')
    },
  })
}

// 发送邮件（直接发送）
export const useSendDirectEmail = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: SendDirectEmailRequest) => api.emailHistory.sendDirectEmail(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-histories'] })
      toast.success('邮件发送成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '邮件发送失败')
    },
  })
}

// ==================== 农药管理相关hooks ====================

// 获取农药列表
export const usePesticides = (query?: PesticideQuery) => {
  return useQuery({
    queryKey: queryKeys.pesticides(query),
    queryFn: () => api.pesticide.getPesticides(query),
    staleTime: 30 * 1000,
  })
}

// 获取农药详情
export const usePesticide = (id: number) => {
  return useQuery({
    queryKey: queryKeys.pesticide(id),
    queryFn: () => api.pesticide.getPesticide(id),
    enabled: !!id,
  })
}

// 创建农药
export const useCreatePesticide = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreatePesticideRequest) => api.pesticide.createPesticide(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pesticides'] })
      toast.success('农药创建成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '农药创建失败')
    },
  })
}

// 更新农药
export const useUpdatePesticide = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePesticideRequest }) => 
      api.pesticide.updatePesticide(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pesticides'] })
      toast.success('农药更新成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '农药更新失败')
    },
  })
}

// 删除农药
export const useDeletePesticide = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => api.pesticide.deletePesticide(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pesticides'] })
      toast.success('农药删除成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '农药删除失败')
    },
  })
}

// ==================== 价格走势管理相关hooks ====================

// 获取价格走势列表
export const usePriceTrends = (query?: PriceTrendQuery) => {
  return useQuery({
    queryKey: queryKeys.priceTrends(query),
    queryFn: () => api.priceTrend.getPriceTrends(query),
    staleTime: 30 * 1000,
  })
}

// 获取价格走势详情
export const usePriceTrend = (id: number) => {
  return useQuery({
    queryKey: queryKeys.priceTrend(id),
    queryFn: () => api.priceTrend.getPriceTrend(id),
    enabled: !!id,
  })
}

// 获取价格走势图表数据
export const usePriceTrendChart = (pesticideId: number, query?: { startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: queryKeys.priceTrendChart(pesticideId, query),
    queryFn: () => api.priceTrend.getPriceTrendChart(pesticideId, query),
    enabled: !!pesticideId,
    staleTime: 5 * 60 * 1000, // 5分钟内不重新请求
  })
}

// 创建价格走势
export const useCreatePriceTrend = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreatePriceTrendRequest) => api.priceTrend.createPriceTrend(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-trends'] })
      toast.success('价格记录创建成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '价格记录创建失败')
    },
  })
}

// 更新价格走势
export const useUpdatePriceTrend = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePriceTrendRequest }) => 
      api.priceTrend.updatePriceTrend(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-trends'] })
      toast.success('价格记录更新成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '价格记录更新失败')
    },
  })
}

// 删除价格走势
export const useDeletePriceTrend = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => api.priceTrend.deletePriceTrend(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-trends'] })
      toast.success('价格记录删除成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '价格记录删除失败')
    },
  })
}

// 图片解析价格数据（异步接口）
export const useParsePriceImage = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: { images: File[]; exchangeRate: number }) => 
      api.priceTrend.parsePriceImage(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['price-trends'] })
      toast.success(`图片解析任务已创建：${result.taskId}`)
    },
    onError: (error: any) => {
      toast.error(error.message || '图片解析任务创建失败')
    },
  })
}

// 查询任务状态
export const useTaskStatus = (taskId: string | null, enabled: boolean = false) => {
  console.log('🔍 useTaskStatus called:', { taskId, enabled })
  
  return useQuery({
    queryKey: ['task-status', taskId],
    queryFn: async () => {
      console.log('🌐 Calling getTaskStatus for:', taskId)
      const result = await api.priceTrend.getTaskStatus(taskId!)
      console.log('📥 API Response:', result)
      return result
    },
    enabled: !!taskId && enabled,
    refetchInterval: (query) => {
      // 从 query.state.data 获取实际的任务状态数据
      const taskData = query.state.data
      console.log('⏰ Checking refetch interval:', { 
        taskData: taskData,
        status: taskData?.status, 
        hasData: !!taskData,
        progress: taskData?.progress,
        queryStatus: query.state.status
      })
      
      // 如果任务还在处理中，每3秒查询一次
      if (taskData?.status === 'processing') {
        console.log('🔄 Setting refetch interval to 3000ms for processing task')
        return 3000
      }
      
      console.log('⏹️ Stopping refetch interval, final status:', taskData?.status)
      // 任务完成或失败时停止轮询
      return false
    },
    refetchIntervalInBackground: false,
    staleTime: 0, // 始终被认为是过期的，每次都重新请求
  })
}

// 保存编辑后的价格数据
export const useSavePriceData = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.priceTrend.savePriceData,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['price-trends'] })
      queryClient.invalidateQueries({ queryKey: ['pesticides'] })
      
      // 显示保存成功信息
      toast.success(`成功保存 ${result.successfulSaves} 条价格数据${result.failedSaves > 0 ? `，${result.failedSaves} 条保存失败` : ''}`)
      
      // 如果有错误信息，显示警告提示
      if (result.errors && result.errors.length > 0) {
        result.errors.forEach(error => {
          toast.error(error, {
            duration: 6000, // 错误信息显示更长时间
          })
        })
      }
    },
    onError: (error: any) => {
      toast.error(error.message || '价格数据保存失败')
    },
  })
}

// ==================== 管理员通知相关hooks ====================

// 获取管理员通知列表
export const useAdminNotifications = (query?: AdminNotificationQuery) => {
  return useQuery({
    queryKey: queryKeys.adminNotifications(query),
    queryFn: () => api.adminNotification.getNotifications(query),
    staleTime: 0, // 实时数据，立即失效以便WebSocket触发时能重新获取
  })
}

// 获取未读通知数量 - 移除定时轮询，基于Socket.IO事件触发
export const useUnreadNotificationCount = () => {
  return useQuery({
    queryKey: queryKeys.unreadNotificationCount,
    queryFn: () => api.adminNotification.getUnreadCount(),
    staleTime: 0, // 实时数据，立即失效以便WebSocket触发时能重新获取
    gcTime: 10 * 60 * 1000, // 10分钟后回收缓存
    // 移除 refetchInterval，改为通过 Socket.IO 事件触发刷新
  })
}

// 获取按优先级分组的未读数量 - 移除定时轮询，基于Socket.IO事件触发
export const useUnreadCountByPriority = () => {
  return useQuery({
    queryKey: queryKeys.unreadCountByPriority,
    queryFn: () => api.adminNotification.getUnreadCountByPriority(),
    staleTime: 0, // 实时数据，立即失效以便WebSocket触发时能重新获取
    gcTime: 10 * 60 * 1000, // 10分钟后回收缓存
    // 移除 refetchInterval，改为通过 Socket.IO 事件触发刷新
  })
}

// 标记通知为已读
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number | string) => api.adminNotification.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.unreadNotificationCount })
      queryClient.invalidateQueries({ queryKey: queryKeys.unreadCountByPriority })
      toast.success('通知已标记为已读')
    },
    onError: (error: any) => {
      toast.error(error.message || '标记失败')
    },
  })
}

// 标记所有通知为已读
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: () => api.adminNotification.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.unreadNotificationCount })
      queryClient.invalidateQueries({ queryKey: queryKeys.unreadCountByPriority })
      toast.success('所有通知已标记为已读')
    },
    onError: (error: any) => {
      toast.error(error.message || '批量标记失败')
    },
  })
}

// 归档通知
export const useArchiveNotification = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number | string) => api.adminNotification.archiveNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.unreadNotificationCount })
      queryClient.invalidateQueries({ queryKey: queryKeys.unreadCountByPriority })
      toast.success('通知已归档')
    },
    onError: (error: any) => {
      toast.error(error.message || '归档失败')
    },
  })
}

// 删除通知
export const useDeleteNotification = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number | string) => api.adminNotification.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.unreadNotificationCount })
      queryClient.invalidateQueries({ queryKey: queryKeys.unreadCountByPriority })
      toast.success('通知已删除')
    },
    onError: (error: any) => {
      toast.error(error.message || '删除失败')
    },
  })
}

// 发送广播通知
export const useSendBroadcastNotification = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: BroadcastNotificationRequest) => api.adminNotification.sendBroadcast(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.unreadNotificationCount })
      queryClient.invalidateQueries({ queryKey: queryKeys.unreadCountByPriority })
      toast.success(`广播通知发送成功，共 ${result.count} 个管理员收到通知`)
    },
    onError: (error: any) => {
      toast.error(error.message || '广播通知发送失败')
    },
  })
}

// 根据权限发送通知
export const useSendPermissionNotification = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: PermissionNotificationRequest) => api.adminNotification.sendByPermission(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.unreadNotificationCount })
      queryClient.invalidateQueries({ queryKey: queryKeys.unreadCountByPriority })
      toast.success(`权限通知发送成功，共 ${result.count} 个管理员收到通知`)
    },
    onError: (error: any) => {
      toast.error(error.message || '权限通知发送失败')
    },
  })
}

// 发送系统告警
export const useSendSystemAlert = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: SystemAlertRequest) => api.adminNotification.sendSystemAlert(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.unreadNotificationCount })
      queryClient.invalidateQueries({ queryKey: queryKeys.unreadCountByPriority })
      toast.success(`系统告警发送成功，共 ${result.count} 个管理员收到通知`)
    },
    onError: (error: any) => {
      toast.error(error.message || '系统告警发送失败')
    },
  })
}

// 清理过期通知
export const useCleanupExpiredNotifications = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: () => api.adminNotification.cleanupExpired(),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.unreadNotificationCount })
      queryClient.invalidateQueries({ queryKey: queryKeys.unreadCountByPriority })
      toast.success(`清理完成，共清理 ${result.count} 个过期通知`)
    },
    onError: (error: any) => {
      toast.error(error.message || '清理过期通知失败')
    },
  })
}

// 获取筛选树结构
export const useFilterTree = () => {
  return useQuery({
    queryKey: queryKeys.filterTree,
    queryFn: () => api.adminNotification.getFilterTree(),
    staleTime: 10 * 60 * 1000, // 10分钟缓存
    gcTime: 30 * 60 * 1000, // 30分钟垃圾回收
  })
}