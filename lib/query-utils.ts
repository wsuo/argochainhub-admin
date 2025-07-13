/**
 * 过滤掉空值、null、undefined和空字符串的查询参数
 * @param query 查询对象
 * @returns 过滤后的查询对象
 */
export function filterQueryParams<T extends Record<string, any>>(query: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(query).filter(([_, value]) => {
      // 过滤掉 undefined、null、空字符串
      return value !== undefined && value !== null && value !== ''
    })
  ) as Partial<T>
}