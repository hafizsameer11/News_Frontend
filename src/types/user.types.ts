// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "ADVERTISER" | "USER";
  avatar?: string;
  isActive: boolean;
  emailVerified?: boolean;
  companyName?: string;
  socialPostingAllowed: boolean;
  allowedCategories?: Array<{ id: string; nameEn: string; nameIt: string; slug: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  success: boolean;
  message: string;
  data: {
    users: User[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: User["role"];
  isActive?: boolean;
  companyName?: string;
  socialPostingAllowed?: boolean;
  categoryIds?: string[];
}

export interface UpdateUserInput {
  name?: string;
  password?: string;
  role?: User["role"];
  isActive?: boolean;
  companyName?: string;
  socialPostingAllowed?: boolean;
  categoryIds?: string[];
}

