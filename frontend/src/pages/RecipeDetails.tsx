import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ChefHat,
  Utensils,
  Trash2,
  Edit,
  Star,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

import {
  getRecipeById,
  deleteRecipe,
  rateRecipe,
  commentOnRecipe,
} from "@/api/recipes";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function RecipeDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [commentText, setCommentText] = useState("");
  const [userRating, setUserRating] = useState<number>(0);

  const recipeId = Number(id);

  const {
    data: recipe,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["recipe", recipeId],
    queryFn: () => getRecipeById(recipeId),
    enabled: !!recipeId,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRecipe,
    onSuccess: () => {
      toast.success("Recipe deleted successfully");
      navigate("/");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to delete recipe");
    },
  });

  const rateMutation = useMutation({
    mutationFn: (rating: number) => rateRecipe(recipeId, { rating }),
    onSuccess: () => {
      toast.success("Rating submitted!");
      queryClient.invalidateQueries({ queryKey: ["recipe", recipeId] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to submit rating");
    },
  });

  const commentMutation = useMutation({
    mutationFn: (text: string) =>
      commentOnRecipe(recipeId, { comment_text: text }),
    onSuccess: () => {
      toast.success("Comment added!");
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["recipe", recipeId] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to add comment");
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate(recipeId);
  };

  const handleRate = (rating: number) => {
    if (!user) {
      toast.error("Please login to rate recipes");
      return;
    }
    setUserRating(rating);
    rateMutation.mutate(rating);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to comment");
      return;
    }
    if (!commentText.trim()) return;
    commentMutation.mutate(commentText);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-8 max-w-5xl">
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
        <Skeleton className="h-[400px] w-full" />
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    );
  }

  if (isError || !recipe) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh] text-center border border-dashed m-8">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-mono font-bold mb-2">
          ERROR_404: RECIPE_NOT_FOUND
        </h2>
        <p className="text-muted-foreground mb-6 font-mono">
          The requested resource could not be located.
        </p>
        <Button
          onClick={() => navigate("/")}
          variant="outline"
          className="font-mono"
        >
          RETURN_HOME
        </Button>
      </div>
    );
  }

  const isOwner = user?.user_id === recipe.user_id;

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Left Sidebar - Sticky */}
      <aside className="w-full md:w-[400px] border-r bg-background md:h-[calc(100vh-3.5rem)] md:sticky md:top-14 overflow-hidden flex flex-col">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="font-mono text-xs -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> BACK
            </Button>

            <div className="aspect-square border bg-muted relative overflow-hidden">
              {recipe.image_url ? (
                <img
                  src={recipe.image_url}
                  alt={recipe.recipe_name}
                  className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=2626&auto=format&fit=crop";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <ChefHat className="w-20 h-20 opacity-20" />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-sm font-bold uppercase">
                  Rating
                </h3>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-primary text-primary" />
                  <span className="font-mono font-bold">
                    {recipe.average_rating
                      ? Number(recipe.average_rating).toFixed(1)
                      : "0.0"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="border p-3 flex flex-col gap-1">
                  <span className="text-muted-foreground uppercase">Prep</span>
                  <span className="font-bold">{recipe.preparation_time}m</span>
                </div>
                <div className="border p-3 flex flex-col gap-1">
                  <span className="text-muted-foreground uppercase">Cook</span>
                  <span className="font-bold">{recipe.cooking_time}m</span>
                </div>
                <div className="border p-3 flex flex-col gap-1">
                  <span className="text-muted-foreground uppercase">
                    Servings
                  </span>
                  <span className="font-bold">{recipe.servings}</span>
                </div>
                <div className="border p-3 flex flex-col gap-1">
                  <span className="text-muted-foreground uppercase">
                    Difficulty
                  </span>
                  <span className="font-bold">{recipe.difficulty_level}</span>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <h3 className="font-mono text-sm font-bold uppercase flex items-center gap-2">
                  <Utensils className="w-4 h-4" /> Ingredients
                </h3>
                <ul className="space-y-2 text-sm font-mono">
                  {recipe.ingredients?.map((ingredient) => (
                    <li
                      key={ingredient.recipe_ingredient_id}
                      className="flex justify-between items-start gap-2 text-muted-foreground"
                    >
                      <span>{ingredient.ingredient_name}</span>
                      <span className="text-foreground whitespace-nowrap">
                        {ingredient.quantity} {ingredient.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <div className="max-w-3xl mx-auto p-6 md:p-12 space-y-12">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight font-mono uppercase break-words">
                  {recipe.recipe_name}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground font-mono">
                  <span>@{recipe.username || "unknown"}</span>
                  <span>//</span>
                  <span>
                    {format(
                      new Date(recipe.created_at || new Date()),
                      "MMMM dd, yyyy"
                    )}
                  </span>
                  <span>//</span>
                  <span className="uppercase">{recipe.cuisine_name}</span>
                </div>
              </div>

              {isOwner && (
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate(`/edit-recipe/${recipeId}`)}
                    className="h-8 w-8"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="border font-mono">
                      <AlertDialogHeader>
                        <AlertDialogTitle>CONFIRM_DELETION</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action is irreversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="font-mono">
                          CANCEL
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="font-mono"
                        >
                          DELETE
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>

            {recipe.description && (
              <p className="text-lg leading-relaxed font-mono text-muted-foreground border-l-2 border-primary pl-4">
                {recipe.description}
              </p>
            )}
          </div>

          {/* Instructions */}
          <div className="space-y-8">
            <h2 className="text-xl font-bold font-mono uppercase border-b pb-4">
              Execution_Sequence
            </h2>
            <div className="space-y-8">
              {recipe.instructions?.map((instruction, index) => (
                <div
                  key={instruction.instruction_id}
                  className="group relative pl-8 md:pl-12"
                >
                  <span className="absolute left-0 top-0 text-4xl font-mono font-bold text-muted-foreground/20 group-hover:text-primary/20 transition-colors select-none">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-base md:text-lg leading-relaxed font-mono">
                    {instruction.instruction_text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Interaction Section */}
          <div className="space-y-12">
            {/* Rating */}
            <div className="space-y-4">
              <h3 className="font-mono text-sm font-bold uppercase text-muted-foreground">
                Rate_This_Recipe
              </h3>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRate(star)}
                    className="group focus:outline-none"
                    disabled={rateMutation.isPending}
                  >
                    <Star
                      className={`w-8 h-8 transition-all ${
                        (userRating ||
                          Math.round(Number(recipe.average_rating || 0))) >=
                        star
                          ? "fill-primary text-primary"
                          : "text-muted-foreground/30 group-hover:text-primary/50"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-6">
              <h3 className="font-mono text-sm font-bold uppercase text-muted-foreground">
                Comments ({recipe.comments?.length || 0})
              </h3>

              {user ? (
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <Textarea
                    placeholder="Add to the discussion..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="min-h-[100px] font-mono text-sm bg-muted/30 resize-none focus:bg-background transition-colors"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={commentMutation.isPending}
                      className="font-mono uppercase"
                    >
                      {commentMutation.isPending
                        ? "Posting..."
                        : "Post Comment"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="border border-dashed p-6 text-center font-mono text-sm text-muted-foreground">
                  <span
                    className="cursor-pointer hover:text-primary underline"
                    onClick={() => navigate("/login")}
                  >
                    Login
                  </span>{" "}
                  to participate in the discussion.
                </div>
              )}

              <div className="space-y-6 pt-4">
                {recipe.comments?.map((comment) => (
                  <div key={comment.comment_id} className="flex gap-4">
                    <Avatar className="w-10 h-10 border rounded-none">
                      <AvatarFallback className="rounded-none bg-primary/10 font-mono font-bold text-primary">
                        {comment.username?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-baseline justify-between">
                        <span className="font-bold font-mono text-sm">
                          @{comment.username}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {comment.created_at &&
                            format(new Date(comment.created_at), "MMM d, yyyy")}
                        </span>
                      </div>
                      <p className="text-sm font-mono text-muted-foreground leading-relaxed">
                        {comment.comment_text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
