import { RecipeList } from "../features/recipes/components/RecipeList";

export function RecipesPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recipes</h1>
          <p className="text-muted-foreground">
            Discover and share your favorite recipes.
          </p>
        </div>
      </div>
      <RecipeList />
    </div>
  );
}
