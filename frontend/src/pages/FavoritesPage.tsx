export function FavoritesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Favorites</h1>
      <p className="text-gray-600">Your favorited recipes</p>
      {/* TODO: Implement favorites list using GET /api/users/:id/favorites
          - Display recipe cards with unfavorite option
          - Use DELETE /api/recipes/:id/favorite to remove from favorites
      */}
    </div>
  );
}
