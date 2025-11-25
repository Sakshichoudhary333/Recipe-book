import { useParams } from "react-router-dom";

export function UserRecipesPage() {
  const { id } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">User's Recipes</h1>
      <p className="text-gray-600">Recipes by user ID: {id}</p>
      {/* TODO: Implement user recipes list using GET /api/users/:id/recipes
          - Display paginated recipe cards
          - Include filters and sorting options
      */}
    </div>
  );
}
