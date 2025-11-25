export function CategoriesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Recipe Categories</h1>
        <p className="text-muted-foreground">
          Browse recipes by category, meal type, or cuisine
        </p>
      </div>

      {/* TODO: Implement with API integration */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Category cards will go here */}
        {/* Each card should show:
            - Category image
            - Category name
            - Meal type / cuisine type
            - Recipe count
            - Link to /categories/:id
        */}
        <div className="text-center text-muted-foreground py-12">
          <p>Loading categories...</p>
          <p className="text-sm mt-2">API: GET /api/categories</p>
        </div>
      </div>

      {/* Categories grouped by type */}
      <div className="mt-12 space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">By Meal Type</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Breakfast, Lunch, Dinner, Desserts */}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">By Cuisine</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Italian, Mexican, Chinese, Indian, etc. */}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">By Dietary Preference</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Vegetarian, Vegan, Gluten-Free, etc. */}
          </div>
        </section>
      </div>
    </div>
  );
}
