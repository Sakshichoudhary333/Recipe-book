import api from "../../api/axios";
import type { User, ApiResponse } from "../../types";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  f_name: string;
  l_name: string;
  city?: string;
  state?: string;
  street?: string;
  phone_no?: string;
}

interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  role?: string;
}

export const login = async (credentials: LoginCredentials) => {
  const response = await api.post<ApiResponse<AuthResponse>>(
    "/auth/login",
    credentials
  );
  return response.data;
};

export const register = async (credentials: RegisterCredentials) => {
  const response = await api.post<ApiResponse<AuthResponse>>(
    "/auth/register",
    credentials
  );
  return response.data;
};
