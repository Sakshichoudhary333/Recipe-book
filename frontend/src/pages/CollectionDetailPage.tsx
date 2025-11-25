import { useParams } from "react-router-dom";

export function CollectionDetailPage() {
  const { id } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Collection Details</h1>
      <p className="text-gray-600">Viewing collection ID: {id}</p>
      {/* TODO: Implement collection detail using:
          - GET /api/collections/:id (collection info)
          - GET /api/collections/:id/recipes (recipes in collection)
          - If owner: show edit/delete options and ability to manage recipes
          - POST /api/collections/:id/recipes (add recipe)
          - DELETE /api/collections/:id/recipes/:recipeId (remove recipe)
      */}
    </div>
  );
}
