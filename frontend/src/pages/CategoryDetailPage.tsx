import { useParams } from "react-router-dom";

export function CategoryDetailPage() {
  const { id } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Category Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Category Name</h1>
            <p className="text-muted-foreground mb-4">
              Category description goes here
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>Meal Type: Breakfast</span>
              <span>Cuisine: Italian</span>
              <span>42 recipes</span>
            </div>
          </div>
          {/* Category image */}
          <div className="w-32 h-32 bg-muted rounded-lg" />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select className="border rounded-md px-3 py-2">
          <option>All Difficulties</option>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
        <select className="border rounded-md px-3 py-2">
          <option>Sort by Rating</option>
          <option>Sort by Date</option>
          <option>Sort by Views</option>
        </select>
      </div>

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Recipe cards will go here */}
        <div className="text-center text-muted-foreground py-12 col-span-full">
          <p>Loading recipes for category {id}...</p>
          <p className="text-sm mt-2">API: GET /api/categories/{id}/recipes</p>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-8 flex justify-center">
        {/* Pagination controls */}
      </div>
    </div>
  );
}
