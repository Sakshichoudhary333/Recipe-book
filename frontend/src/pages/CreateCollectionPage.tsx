export function CreateCollectionPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create Collection</h1>
      <p className="text-gray-600">Create a new recipe collection</p>
      {/* TODO: Implement collection creation form using POST /api/collections
          - Fields: collection_name (required), description, is_public
          - Redirect to collection detail page after creation
      */}
    </div>
  );
}
