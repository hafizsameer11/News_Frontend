// Category Types
export interface Category {
  id: string;
  nameEn: string;
  nameIt: string;
  slug: string;
  description?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryResponse {
  success: boolean;
  message: string;
  data: Category[];
}

export interface CreateCategoryInput {
  nameEn: string;
  nameIt: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  order?: number;
}

export interface UpdateCategoryInput {
  nameEn?: string;
  nameIt?: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
  order?: number;
}

