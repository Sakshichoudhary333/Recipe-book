export function EditProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
      <p className="text-gray-600">Update your profile information</p>
      {/* TODO: Implement profile edit form using:
          - GET /api/users/profile (to fetch current data)
          - PUT /api/users/profile (to update)
          - POST /api/users/profile/image (for profile image upload)
          - POST /api/auth/change-password (for password change)
      */}
    </div>
  );
}
