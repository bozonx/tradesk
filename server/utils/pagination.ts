import { QueryParams } from '../types/api'

export const DEFAULT_PAGE = 1
export const DEFAULT_LIMIT = 10

export function getPaginationParams(query: QueryParams) {
  const page = Number(query.page) || DEFAULT_PAGE
  const limit = Number(query.limit) || DEFAULT_LIMIT
  const skip = (page - 1) * limit

  return {
    skip,
    take: limit,
    page,
    limit,
  }
}

export function createPaginationResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export function createWhereClause(query: QueryParams) {
  const where: any = {
    deletedAt: null,
  }

  if (query.search) {
    where.OR = [
      { name: { contains: query.search } },
      { descr: { contains: query.search } },
    ]
  }

  if (query.filter) {
    Object.assign(where, query.filter)
  }

  return where
}

export function createOrderByClause(query: QueryParams) {
  if (!query.sortBy) {
    return { createdAt: 'desc' }
  }

  return {
    [query.sortBy]: query.sortOrder || 'asc',
  }
} 