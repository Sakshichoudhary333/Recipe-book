import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../features/auth/store";

export function AdminRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has admin role
  if (role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
