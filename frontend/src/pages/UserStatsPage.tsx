import { useParams } from "react-router-dom";

export function UserStatsPage() {
  const { id } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">User Statistics</h1>
      <p className="text-gray-600">Statistics for user ID: {id}</p>
      {/* TODO: Implement user statistics using GET /api/users/:id/stats
          - Display: total_recipes, avg_rating_received, total_views
          - total_ratings_received, total_comments_given, total_favorites
          - Use charts/graphs for visual representation
      */}
    </div>
  );
}
