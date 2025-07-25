import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
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