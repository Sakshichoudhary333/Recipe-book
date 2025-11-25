import { RecipeForm } from "../features/recipes/components/RecipeForm";

export function CreateRecipePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">
        Create New Recipe
      </h1>
      <div className="mx-auto max-w-2xl">
        <RecipeForm />
      </div>
    </div>
  );
}
