// src/pages/Profile/index.tsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User } from '@/types'; // Assuming you have a User type with locations
import { api } from '@/api/locationApi'; // Assuming you have an API utility
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const UserProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        // You might need to create a new function in your api utility for this
        const response = await api.get(`/api/users/${id}`); 
        setUser(response.data);
      } catch (err) {
        setError('Failed to fetch user profile.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUserProfile();
    }
  }, [id]);

  if (loading) {
    return <div className="text-center py-10">Loading profile...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (!user) {
    return <div className="text-center py-10">User not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.profilePictureUrl} alt={user.name} />
              <AvatarFallback>{user.name?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user.name}</CardTitle>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
          {user.bio && (
            <CardContent className="pt-4">
              <p>{user.bio}</p>
            </CardContent>
          )}
        </CardHeader>
        <CardContent>
          <h3 className="text-xl font-semibold mb-4">Registered Locations</h3>
          {user.locations && user.locations.length > 0 ? (
            <ul className="space-y-2">
              {user.locations.map((location) => (
                <li key={location.id} className="border p-3 rounded-md hover:bg-gray-50">
                  <Link to={`/locations/${location.id}`} className="font-medium text-blue-600 hover:underline">
                    {location.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{location.address}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>This user has not registered any locations yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfilePage;
