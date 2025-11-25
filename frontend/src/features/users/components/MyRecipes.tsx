import { useQuery } from "@tanstack/react-query";
import { getMyRecipes } from "../api";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

export function MyRecipes() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["myRecipes"],
    queryFn: getMyRecipes,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex flex-col space-y-3">
            <Skeleton className="h-[200px] w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">Failed to load recipes</div>
    );
  }

  const recipes = data?.data || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Recipes</h1>
        <Button asChild>
          <Link to="/recipes/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Recipe
          </Link>
        </Button>
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/10">
          <h3 className="text-lg font-semibold mb-2">No recipes yet</h3>
          <p className="text-muted-foreground mb-4">
            You haven't created any recipes yet.
          </p>
          <Button asChild>
            <Link to="/recipes/create">Create your first recipe</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.RID} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
