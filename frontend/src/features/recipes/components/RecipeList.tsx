import { useQuery } from "@tanstack/react-query";
import { getRecipes } from "../api";
import { RecipeCard } from "./RecipeCard";
import { Skeleton } from "@/components/ui/skeleton";

export function RecipeList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["recipes"],
    queryFn: () => getRecipes(),
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="aspect-video w-full rounded-xl" />
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

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {data?.data.map((recipe) => (
        <RecipeCard key={recipe.RID} recipe={recipe} />
      ))}
    </div>
  );
}
