// src/pages/LocationDetail/index.tsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  api,
  postComment,
  toggleLike,
  rateLocation,
  addPhotoByUrl,
} from "@/api/locationApi";
import { LocationDetail, Rating, Like } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ClipLoader } from "react-spinners";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/StarRating";
import { Heart, Camera, Star } from "lucide-react";
import "leaflet/dist/leaflet.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

// --- Leaflet Icon Setup ---
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- Rating Modal Component ---
const RatingModal = ({
  open,
  onOpenChange,
  onSubmit,
  initialRatings,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (ratings: Omit<Rating, "userId" | "locationId">) => void;
  initialRatings: Omit<Rating, "userId" | "locationId">;
  isSubmitting: boolean;
}) => {
  const [ratings, setRatings] = useState(initialRatings);

  const handleRatingChange = (
    category: keyof typeof ratings,
    value: number
  ) => {
    setRatings((prev) => ({ ...prev, [category]: value }));
  };

  const handleSubmit = () => {
    // Basic validation
    if (Object.values(ratings).some((r) => r === 0)) {
      alert("Por favor, avalie todos os critérios.");
      return;
    }
    onSubmit(ratings);
  };

  const ratingCategories: { key: keyof typeof ratings; label: string }[] = [
    { key: "floor", label: "Piso" },
    { key: "space", label: "Espaço" },
    { key: "safety", label: "Segurança" },
    { key: "sound", label: "Som" },
    { key: "vibe", label: "Vibe" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Avalie este Local</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {ratingCategories.map(({ key, label }) => (
            <div key={key} className="flex justify-between items-center">
              <span className="font-medium">{label}</span>
              <StarRating
                initialRating={ratings[key]}
                onRate={(value) => handleRatingChange(key, value)}
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <ClipLoader size={16} color="#fff" />
            ) : (
              "Enviar Avaliação"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const LocationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const [location, setLocation] = useState<LocationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<string | null>(null);

  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const fetchLocation = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const response = await api.get(`/api/locations/${id}`);
      const locationData = response.data;
      setLocation(locationData);
      setLikesCount(locationData.likesCount);
      if (currentUser) {
        setIsLiked(
          locationData.likes.some(
            (like: Like) => like.userId === currentUser.uid
          )
        );
      }
    } catch {
      // setError('Failed to fetch location details.'); // Removed as per ESLint warning
      console.error("Failed to fetch location details.");
    } finally {
      setIsLoading(false);
    }
  }, [id, currentUser]);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  const userRating = useMemo(() => {
    const defaultRating = { floor: 0, space: 0, safety: 0, sound: 0, vibe: 0 };
    if (!location || !currentUser) return defaultRating;
    const rating = location.ratings.find((r) => r.userId === currentUser.uid);
    return rating
      ? {
          floor: rating.floor,
          space: rating.space,
          safety: rating.safety,
          sound: rating.sound,
          vibe: rating.vibe,
        }
      : defaultRating;
  }, [location, currentUser]);

  const handleAddPhoto = async () => {
    if (!currentUser || !location) return;
    const imageUrl = window.prompt("Por favor, cole o URL da imagem:");
    if (imageUrl && imageUrl.trim() !== "") {
      try {
        const newPhoto = await addPhotoByUrl(
          location.id,
          imageUrl,
          currentUser
        );
        setLocation((prev) =>
          prev ? { ...prev, photos: [...prev.photos, newPhoto] } : null
        );
        toast({ title: "Sucesso", description: "Foto adicionada!" });
      } catch {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível adicionar a foto.",
        });
      }
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !location || !newComment.trim()) return;
    setIsSubmittingComment(true);
    try {
      const createdComment = await postComment(
        location.id,
        newComment,
        currentUser
      );
      setLocation((prev) =>
        prev ? { ...prev, comments: [createdComment, ...prev.comments] } : null
      );
      setNewComment("");
      toast({ title: "Sucesso", description: "Comentário adicionado!" });
    } catch {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível adicionar o comentário.",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleLikeClick = async () => {
    if (!currentUser || !location || isLiking) return;
    setIsLiking(true);
    const originalIsLiked = isLiked;
    const originalLikesCount = likesCount;
    setIsLiked(!isLiked);
    setLikesCount(likesCount + (isLiked ? -1 : 1));
    try {
      await toggleLike(location.id, currentUser);
    } catch {
      setIsLiked(originalIsLiked);
      setLikesCount(originalLikesCount);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível registrar o like.",
      });
    } finally {
      setIsLiking(false);
    }
  };

  const handleRatingSubmit = async (
    ratings: Omit<Rating, "userId" | "locationId">
  ) => {
    if (!currentUser || !location) return;
    setIsSubmittingRating(true);
    try {
      await rateLocation(location.id, ratings, currentUser);
      toast({ title: "Sucesso", description: `Sua avaliação foi enviada!` });
      await fetchLocation(); // Refetch to get updated averages
      setIsRatingModalOpen(false);
    } catch {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível enviar sua avaliação.",
      });
    } finally {
      setIsSubmittingRating(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <ClipLoader size={50} />
      </div>
    );
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>;
  if (!location)
    return <div className="text-center p-8">Location not found.</div>;

  const mapPosition: [number, number] = [location.latitude, location.longitude];

  const ratingDetails = [
    { label: "Piso", value: location.averageFloor },
    { label: "Espaço", value: location.averageSpace },
    { label: "Segurança", value: location.averageSafety },
    { label: "Som", value: location.averageSound },
    { label: "Vibe", value: location.averageVibe },
  ];

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 z-10 relative">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">{location.name}</h1>
        <p className="text-lg text-muted-foreground mt-2">{location.address}</p>
        <p className="text-sm text-muted-foreground">
          {location.city}, {location.state}
        </p>
        <div className="mt-4 text-sm">
          Cadastrado por:{" "}
          <Link
            to={`/profile/${location.user.id}`}
            className="font-semibold text-blue-600 hover:underline"
          >
            {location.user.name}
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Mapa primeiro */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Mapa</h2>
            <div className="h-96 bg-muted rounded-lg overflow-hidden z-0">
              <MapContainer
                center={mapPosition}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={mapPosition}>
                  <Popup>{location.name}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </section>
          {/* Fotos depois */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Fotos</h2>
              {currentUser && (
                <Button onClick={handleAddPhoto}>
                  <Camera className="mr-2 h-4 w-4" /> Adicionar Foto
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {location.photos.length > 0 ? (
                location.photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="bg-muted rounded-lg aspect-square overflow-hidden"
                  >
                    <img
                      src={photo.url}
                      alt={`Foto de ${location.name}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-full bg-muted rounded-lg aspect-video flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">
                    Nenhuma foto ainda. Seja o primeiro a adicionar!
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="p-6 border rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Avaliações</h2>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <span className="text-5xl font-bold">
                  {location.overallAverage.toFixed(1)}
                </span>
                <span className="text-muted-foreground">/ 5</span>
              </div>
              <StarRating initialRating={location.overallAverage} readOnly />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Baseado em {location.ratingsCount} avaliações
            </p>
            <div className="mt-4 space-y-2">
              {ratingDetails.map((detail) => (
                <div
                  key={detail.label}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-muted-foreground">{detail.label}</span>
                  <div className="flex items-center gap-2">
                    <span>{detail.value.toFixed(1)}</span>
                    <Star size={16} className="text-yellow-400 fill-current" />
                  </div>
                </div>
              ))}
            </div>
            {currentUser && (
              <div className="mt-4 pt-4 border-t">
                <Dialog
                  open={isRatingModalOpen}
                  onOpenChange={setIsRatingModalOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      {location.ratings.some(
                        (r) => r.userId === currentUser.uid
                      )
                        ? "Editar sua Avaliação"
                        : "Avaliar este Local"}
                    </Button>
                  </DialogTrigger>
                  <RatingModal
                    open={isRatingModalOpen}
                    onOpenChange={setIsRatingModalOpen}
                    onSubmit={handleRatingSubmit}
                    initialRatings={userRating}
                    isSubmitting={isSubmittingRating}
                  />
                </Dialog>
              </div>
            )}
          </section>

          <section className="p-6 border rounded-lg shadow-sm">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Likes</h2>
              {currentUser && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLikeClick}
                  disabled={isLiking}
                >
                  <Heart
                    className={`h-6 w-6 ${
                      isLiked ? "text-red-500 fill-current" : "text-gray-500"
                    }`}
                  />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-3xl font-bold">{likesCount}</span>
              <span className="text-muted-foreground">Likes</span>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Comentários ({location.comments.length})
            </h2>
            {currentUser && (
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <Textarea
                  placeholder="Adicione seu comentário..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="mb-2"
                />
                <Button type="submit" disabled={isSubmittingComment}>
                  {isSubmittingComment ? "Enviando..." : "Enviar Comentário"}
                </Button>
              </form>
            )}
            <div className="space-y-4">
              {location.comments.length > 0 ? (
                location.comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage
                        src={comment.user.profilePictureUrl || undefined}
                        alt={comment.user.name}
                      />
                      <AvatarFallback>
                        {comment.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <p className="font-semibold">{comment.user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-sm">{comment.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">
                  Nenhum comentário ainda. Seja o primeiro a comentar!
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default LocationDetailPage;
