import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { getRecipe, deleteRecipe } from "../api";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Clock, Users, Star, ChefHat, Trash2, Edit } from "lucide-react";
import { useAuthStore } from "@/features/auth/store";
import { toast } from "sonner";

export function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const recipeId = parseInt(id!, 10);

  const { data, isLoading, error } = useQuery({
    queryKey: ["recipe", recipeId],
    queryFn: () => getRecipe(recipeId),
    enabled: !!recipeId,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      toast.success("Recipe deleted successfully");
      navigate("/recipes");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete recipe");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="aspect-video w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center text-red-500">Failed to load recipe</div>
    );
  }

  const recipe = data.data;
  const isAuthor = user?.uid === recipe.author?.uid;

  return (
    <div className="space-y-8">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl">
        <img
          src={
            recipe.image_url ||
            "https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=2626&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          }
          alt={recipe.name}
          className="h-full w-full object-cover"
        />
        {isAuthor && (
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => navigate(`/recipes/${recipe.RID}/edit`)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => {
                if (confirm("Are you sure you want to delete this recipe?")) {
                  deleteMutation.mutate(recipe.RID);
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <h1 className="text-4xl font-bold">{recipe.name}</h1>
          <Badge
            variant={
              recipe.difficulty_level === "Easy"
                ? "secondary"
                : recipe.difficulty_level === "Medium"
                ? "default"
                : "destructive"
            }
            className="text-lg"
          >
            {recipe.difficulty_level}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-6 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <span>Prep: {recipe.prep_time}m</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <span>Cook: {recipe.cook_time}m</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span>{recipe.servings} Servings</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            <span>
              {recipe.average_rating
                ? Number(recipe.average_rating).toFixed(1)
                : "N/A"}{" "}
              ({recipe.total_ratings} ratings)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            <span>
              By {recipe.author?.f_name} {recipe.author?.l_name}
            </span>
          </div>
        </div>

        <p className="text-lg text-muted-foreground">{recipe.description}</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Ingredients</h2>
          <ul className="space-y-2">
            {recipe.ingredients?.map((ingredient) => (
              <li
                key={ingredient.IID}
                className="flex items-center gap-2 rounded-lg border p-3"
              >
                <span className="font-medium">
                  {ingredient.quantity} {ingredient.unit}
                </span>
                <span>{ingredient.I_Name}</span>
                {ingredient.notes && (
                  <span className="text-sm text-muted-foreground">
                    ({ingredient.notes})
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Instructions</h2>
          <div className="whitespace-pre-wrap rounded-lg border p-6 text-lg leading-relaxed">
            {recipe.instructions}
          </div>
        </div>
      </div>
    </div>
  );
}
