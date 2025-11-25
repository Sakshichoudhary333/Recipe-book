import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Users,
  Tag,
  Carrot,
  TrendingUp,
  Activity,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getCategories,
  getIngredients,
  getAllUsers,
} from "@/features/admin/api";

export function AdminDashboardPage() {
  // Fetch data for stats
  const { data: categoriesData } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: getCategories,
  });

  const { data: ingredientsData } = useQuery({
    queryKey: ["admin", "ingredients"],
    queryFn: () => getIngredients({ page: 1, limit: 1 }),
  });

  const { data: usersData } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => getAllUsers({ page: 1, limit: 1 }),
  });

  const stats = {
    users: {
      total: usersData?.meta?.total || usersData?.data?.length || 0,
      active: usersData?.data?.filter((u) => u.is_active).length || 0,
    },
    categories: {
      total: categoriesData?.data?.length || 0,
      active: categoriesData?.data?.filter((c) => c.is_active).length || 0,
    },
    ingredients: {
      total: ingredientsData?.meta?.total || ingredientsData?.data?.length || 0,
      vegetarian:
        ingredientsData?.data?.filter((i) => i.is_vegetarian).length || 0,
    },
  };

  const quickActions = [
    {
      title: "Manage Users",
      description: "View and manage all registered users",
      icon: Users,
      href: "/admin/users",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Manage Categories",
      description: "Create and organize recipe categories",
      icon: Tag,
      href: "/admin/categories",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Manage Ingredients",
      description: "Add and update ingredient database",
      icon: Carrot,
      href: "/admin/ingredients",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the Recipe Book admin panel
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.users.active} active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.categories.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.categories.active} active categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingredients</CardTitle>
            <Carrot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ingredients.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.ingredients.vegetarian} vegetarian
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <Link key={action.href} to={action.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-lg ${action.bgColor} flex items-center justify-center mb-4`}
                  >
                    <action.icon className={`h-6 w-6 ${action.color}`} />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {action.description}
                  </p>
                  <Button variant="ghost" className="w-full justify-between">
                    Go to {action.title}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">System Overview</h2>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Platform Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">User Management</p>
                    <p className="text-sm text-muted-foreground">
                      {stats.users.total} registered users
                    </p>
                  </div>
                </div>
                <Link to="/admin/users">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                    <Tag className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Category Management</p>
                    <p className="text-sm text-muted-foreground">
                      {stats.categories.total} categories available
                    </p>
                  </div>
                </div>
                <Link to="/admin/categories">
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                    <Carrot className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Ingredient Database</p>
                    <p className="text-sm text-muted-foreground">
                      {stats.ingredients.total} ingredients in database
                    </p>
                  </div>
                </div>
                <Link to="/admin/ingredients">
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
