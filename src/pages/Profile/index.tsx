// src/pages/Profile/index.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { User } from "@/types";
import { api } from "@/api/locationApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Trash } from "lucide-react";

const UserProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const {
    firebaseUser,
    appUser,
    loading: authLoading,
    refreshAppUser,
  } = useAuth();
  const { toast } = useToast();

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    bio: "",
  });

  const fetchUserProfile = async () => {
    if (!id || authLoading) return; // Wait for auth to load

    try {
      setLoading(true);
      const headers: Record<string, string> = {};
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await api.get(`/api/users/${id}`, { headers });
      setProfileUser(response.data);
      setEditForm({ name: response.data.name, bio: response.data.bio || "" });
    } catch (err) {
      setError("Failed to fetch user profile.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !profileUser) return;

    try {
      const token = await firebaseUser.getIdToken();
      const response = await api.put(`/api/users/${profileUser.id}`, editForm, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProfileUser(response.data);
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!",
      });
      setIsEditing(false);
      refreshAppUser(); // Refresh the appUser in AuthContext
    } catch (err) {
      console.error("Error updating profile:", err);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o perfil.",
      });
    }
  };

  // Função para deletar local
  const handleDeleteLocation = async (locationId: number) => {
    if (!firebaseUser) return;
    if (!window.confirm("Tem certeza que deseja excluir este local?")) return;
    try {
      const token = await firebaseUser.getIdToken();
      await api.delete(`/api/locations/${locationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfileUser((prev) =>
        prev && prev.locations
          ? {
              ...prev,
              locations: prev.locations.filter((loc) => loc.id !== locationId),
            }
          : prev
      );
      toast({
        title: "Local excluído",
        description: "O local foi removido com sucesso.",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível excluir o local.",
      });
    }
  };

  useEffect(() => {
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, firebaseUser, authLoading]);

  if (loading || authLoading) {
    return <div className="text-center py-10">Loading profile...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (!profileUser) {
    return <div className="text-center py-10">User not found.</div>;
  }

  const isOwnProfile =
    firebaseUser && appUser && firebaseUser.uid === appUser.id;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                <AvatarImage
                  src={profileUser.profilePictureUrl}
                  alt={profileUser.name}
                />
                <AvatarFallback className="text-3xl">
                  {profileUser.name?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="mt-2 sm:mt-0">
                <CardTitle className="text-2xl sm:text-3xl">{profileUser.name}</CardTitle>
                <p className="text-muted-foreground">{profileUser.email}</p>
              </div>
            </div>
            {isOwnProfile && (
              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">Editar Perfil</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Editar Perfil</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleEditSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="name" className="text-right">
                        Nome
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={editForm.name}
                        onChange={handleEditChange}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="bio" className="text-right">
                        Bio
                      </label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={editForm.bio}
                        onChange={handleEditChange}
                        className="col-span-3"
                      />
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline">
                          Cancelar
                        </Button>
                      </DialogClose>
                      <Button type="submit">Salvar mudanças</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
          {profileUser.bio && (
            <CardContent className="pt-4 sm:pt-6 text-sm sm:text-base text-muted-foreground">
              <p>{profileUser.bio}</p>
            </CardContent>
          )}
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-4">Locais Cadastrados</h3>
          {profileUser.locations && profileUser.locations.length > 0 ? (
            <ul className="space-y-3">
              {profileUser.locations.map((location) => (
                <li
                  key={location.id}
                  className="relative border p-3 sm:p-4 rounded-lg hover:bg-muted transition-colors flex justify-between items-center"
                >
                  <div>
                    <Link
                      to={`/locations/${location.id}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {location.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {location.address}
                    </p>
                  </div>
                  {isOwnProfile && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive/80"
                      title="Excluir local"
                      onClick={() => handleDeleteLocation(location.id)}
                    >
                      <Trash size={18} />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">Este usuário ainda não cadastrou locais.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfilePage;
