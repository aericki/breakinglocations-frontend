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
import { 
  Heart, 
  Camera, 
  Star, 
  ArrowLeft, 
  MapPin, 
  Navigation, 
  Phone, 
  Share2,
  MessageCircle,
  User,
  ThumbsUp,
  Loader2,
  Badge as BadgeIcon,
  Award
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    if (Object.values(ratings).some((r) => r === 0)) {
      alert("Por favor, avalie todos os critérios.");
      return;
    }
    onSubmit(ratings);
  };

  const ratingCategories: { key: keyof typeof ratings; label: string; icon: React.ReactNode }[] = [
    { key: "floor", label: "Piso", icon: <BadgeIcon className="w-4 h-4" /> },
    { key: "space", label: "Espaço", icon: <MapPin className="w-4 h-4" /> },
    { key: "safety", label: "Segurança", icon: <Award className="w-4 h-4" /> },
    { key: "sound", label: "Som", icon: <Star className="w-4 h-4" /> },
    { key: "vibe", label: "Vibe", icon: <Heart className="w-4 h-4" /> },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500" />
            Avalie este Local
          </DialogTitle>
        </DialogHeader>
        <div className="py-6 space-y-6">
          {ratingCategories.map(({ key, label, icon }) => (
            <div key={key} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="text-blue-600">{icon}</div>
                <span className="font-medium text-gray-900">{label}</span>
              </div>
              <StarRating
                initialRating={ratings[key]}
                onRate={(value) => handleRatingChange(key, value)}
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Star className="w-4 h-4 mr-2" />
                Enviar Avaliação
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const LocationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { firebaseUser: currentUser } = useAuth();
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
      await fetchLocation();
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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: location?.name,
        text: `Confira este spot: ${location?.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copiado!", description: "URL copiada para a área de transferência" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex justify-center items-center">
        <div className="text-center">
          <ClipLoader size={50} color="#3B82F6" />
          <p className="mt-4 text-gray-600 font-medium">Carregando local...</p>
        </div>
      </div>
    );
  }
  
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>;
  if (!location) return <div className="text-center p-8">Location not found.</div>;

  const mapPosition: [number, number] = [location.latitude, location.longitude];

  const ratingDetails = [
    { label: "Piso", value: location.averageFloor, icon: <BadgeIcon className="w-4 h-4" /> },
    { label: "Espaço", value: location.averageSpace, icon: <MapPin className="w-4 h-4" /> },
    { label: "Segurança", value: location.averageSafety, icon: <Award className="w-4 h-4" /> },
    { label: "Som", value: location.averageSound, icon: <Star className="w-4 h-4" /> },
    { label: "Vibe", value: location.averageVibe, icon: <Heart className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/locations"
              className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Voltar</span>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="rounded-lg"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
          </div>

          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                  {location.name}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  {location.city}, {location.state}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
              <Badge variant="secondary" className="px-3 py-1">
                <User className="w-3 h-3 mr-1" />
                Por {location.user.name}
              </Badge>
              <Badge variant="info" className="px-3 py-1">
                <Star className="w-3 h-3 mr-1 fill-current" />
                {location.overallAverage.toFixed(1)} / 5
              </Badge>
              <Badge variant="success" className="px-3 py-1">
                <ThumbsUp className="w-3 h-3 mr-1" />
                {likesCount} curtidas
              </Badge>
            </div>

            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {location.address}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-8">
            {/* Map Section */}
            <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
              <CardHeader className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Navigation className="w-5 h-5" />
                  Localização
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-80 sm:h-96 bg-muted rounded-b-2xl overflow-hidden">
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
              </CardContent>
            </Card>

            {/* Photos Section */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
              <CardHeader className="p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Camera className="w-5 h-5 text-blue-600" />
                    Fotos ({location.photos.length})
                  </CardTitle>
                  {currentUser && (
                    <Button onClick={handleAddPhoto} size="sm" className="rounded-lg">
                      <Camera className="mr-2 h-4 w-4" />
                      Adicionar Foto
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {location.photos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {location.photos.map((photo) => (
                      <div
                        key={photo.id}
                        className="bg-muted rounded-xl aspect-square overflow-hidden hover:scale-105 transition-transform duration-300 shadow-lg"
                      >
                        <img
                          src={photo.url}
                          alt={`Foto de ${location.name}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Camera className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nenhuma foto ainda
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Seja o primeiro a compartilhar uma foto deste local!
                    </p>
                    {currentUser && (
                      <Button onClick={handleAddPhoto} className="rounded-lg">
                        <Camera className="w-4 h-4 mr-2" />
                        Adicionar Primera Foto
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ratings Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
              <CardHeader className="p-6">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  Avaliações
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-gray-900 mb-2">
                    {location.overallAverage.toFixed(1)}
                  </div>
                  <StarRating initialRating={location.overallAverage} readOnly />
                  <p className="text-sm text-gray-600 mt-2">
                    Baseado em {location.ratingsCount} avaliações
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  {ratingDetails.map((detail) => (
                    <div key={detail.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="text-blue-600">{detail.icon}</div>
                        <span className="font-medium text-gray-900">{detail.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{detail.value.toFixed(1)}</span>
                        <Star size={16} className="text-yellow-400 fill-current" />
                      </div>
                    </div>
                  ))}
                </div>

                {currentUser && (
                  <Dialog open={isRatingModalOpen} onOpenChange={setIsRatingModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                        <Star className="w-4 h-4 mr-2" />
                        {location.ratings.some((r) => r.userId === currentUser.uid)
                          ? "Editar Avaliação"
                          : "Avaliar Local"}
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
                )}
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Like Button */}
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                    <div>
                      <div className="font-semibold text-gray-900">Curtidas</div>
                      <div className="text-2xl font-bold text-red-600">{likesCount}</div>
                    </div>
                    {currentUser && (
                      <Button
                        variant={isLiked ? "default" : "outline"}
                        size="lg"
                        onClick={handleLikeClick}
                        disabled={isLiking}
                        className={`rounded-xl ${
                          isLiked 
                            ? 'bg-red-500 hover:bg-red-600 text-white' 
                            : 'border-red-500 text-red-500 hover:bg-red-50'
                        }`}
                      >
                        <Heart
                          className={`h-5 w-5 mr-2 ${isLiked ? 'fill-current' : ''}`}
                        />
                        {isLiked ? 'Curtido' : 'Curtir'}
                      </Button>
                    )}
                  </div>

                  {/* Directions Button */}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button variant="outline" className="w-full rounded-xl border-2">
                      <Navigation className="w-4 h-4 mr-2" />
                      Como Chegar
                    </Button>
                  </a>

                  {/* WhatsApp Contact */}
                  {location.whatsapp && (
                    <a
                      href={`https://wa.me/${location.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button variant="outline" className="w-full rounded-xl border-green-500 text-green-600 hover:bg-green-50">
                        <Phone className="w-4 h-4 mr-2" />
                        Contato WhatsApp
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
              <CardHeader className="p-6">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                  Comentários ({location.comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {currentUser && (
                  <form onSubmit={handleCommentSubmit} className="mb-6">
                    <Textarea
                      placeholder="Compartilhe sua experiência neste local..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="mb-3 rounded-xl border-2 resize-none"
                      rows={3}
                    />
                    <Button 
                      type="submit" 
                      disabled={isSubmittingComment || !newComment.trim()}
                      className="w-full rounded-xl"
                    >
                      {isSubmittingComment ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Enviar Comentário
                        </>
                      )}
                    </Button>
                  </form>
                )}

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {location.comments.length > 0 ? (
                    location.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3 p-4 bg-gray-50 rounded-xl">
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={comment.user.profilePictureUrl || undefined}
                            alt={comment.user.name}
                          />
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                            {comment.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900">{comment.user.name}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{comment.text}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MessageCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Nenhum comentário ainda
                      </h3>
                      <p className="text-gray-600">
                        Seja o primeiro a compartilhar sua experiência!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationDetailPage;