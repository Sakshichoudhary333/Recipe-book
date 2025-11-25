export interface User {
  uid: number;
  email: string;
  f_name: string;
  l_name: string;
  city?: string;
  state?: string;
  street?: string;
  profile_image?: string;
  bio?: string;
  created_at: string;
  role?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
