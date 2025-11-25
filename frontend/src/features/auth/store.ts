import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../../types";

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  role: string | null;
  isAuthenticated: boolean;
  setAuth: (
    user: User,
    token: string,
    refreshToken: string,
    role?: string
  ) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      role: null,
      isAuthenticated: false,
      setAuth: (user, token, refreshToken, role) =>
        set({
          user,
          token,
          refreshToken,
          role: role || user.role || null,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          user: null,
          token: null,
          refreshToken: null,
          role: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "auth-storage",
    }
  )
);
