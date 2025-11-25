import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "../features/auth/store";

export function HomePage() {
  const { user, logout } = useAuthStore();

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-4xl font-bold">Recipe Book</h1>
      <p className="mb-8 text-lg">Welcome to the Recipe Book application.</p>

      {user ? (
        <div>
          <p className="mb-4">Hello, {user.f_name}!</p>
          <Button onClick={logout}>Logout</Button>
        </div>
      ) : (
        <div className="space-x-4">
          <Link to="/login">
            <Button>Login</Button>
          </Link>
          <Link to="/register">
            <Button variant="outline">Register</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
