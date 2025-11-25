import { useParams } from "react-router-dom";

export function PublicUserProfilePage() {
  const { id } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">User Profile</h1>
      <p className="text-gray-600">Viewing profile for user ID: {id}</p>
      {/* TODO: Implement public user profile using GET /api/users/:id
          - Display user info, bio, profile image
          - Show user statistics
          - Link to user's recipes and stats pages
      */}
    </div>
  );
}
