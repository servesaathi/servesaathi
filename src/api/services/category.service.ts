import apiClient from '../axios';
import ENDPOINTS from '../endpoints';
import { unwrapList, type ListBody } from './listResponse';

// GET /api/v1/categories (Swagger tag "Categories", https://powderblue-rook-471609.hostingersite.com/api/docs#/Categories)
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  /** Non-null for a sub-category; top-level categories have parentId: null. */
  parentId: number | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesQuery {
  page?: number;
  limit?: number;
  /** Only real columns — an unknown value makes the backend 500. */
  sortBy?: 'sortOrder' | 'name' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
  /** Search by category name. */
  search?: string;
  parentId?: number;
  isActive?: boolean;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// The live backend returns `data: Category[]` with `meta` beside it, while the
// Swagger doc says `data: { items, meta }` — unwrapList accepts both.
export const categoryService = {
  getCategories: async (
    params?: CategoriesQuery
  ): Promise<{ items: Category[]; meta: PaginationMeta }> => {
    const res = await apiClient.get<ListBody<Category>>(ENDPOINTS.categories.list, { params });
    return unwrapList(res.data);
  },
};

export default categoryService;
