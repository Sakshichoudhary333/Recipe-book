import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getRecipe } from "../features/recipes/api";
import { RecipeForm } from "../features/recipes/components/RecipeForm";
import { Skeleton } from "@/components/ui/skeleton";

export function EditRecipePage() {
  const { id } = useParams<{ id: string }>();
  const recipeId = parseInt(id!, 10);

  const { data, isLoading, error } = useQuery({
    queryKey: ["recipe", recipeId],
    queryFn: () => getRecipe(recipeId),
    enabled: !!recipeId,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <Skeleton className="h-[600px] w-full max-w-2xl mx-auto" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center text-red-500">Failed to load recipe</div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Edit Recipe</h1>
      <div className="mx-auto max-w-2xl">
        <RecipeForm recipe={data.data} />
      </div>
    </div>
  );
}
