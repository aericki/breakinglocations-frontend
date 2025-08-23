import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, Plus, TrendingUp, Users, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchAllLocations } from "@/api/locationApi";
import { fetchStats, StatsResponse } from "@/api/userApi";
import { Location } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  const { firebaseUser } = useAuth();
  const navigate = useNavigate();
  const [recentLocations, setRecentLocations] = useState<Location[]>([]);
  const [stats, setStats] = useState<StatsResponse>({
    totalUsers: 0,
    totalRatings: 0,
    averageRating: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [locations, statsData] = await Promise.all([
          fetchAllLocations(firebaseUser),
          fetchStats(),
        ]);

        // Sort by ID descending to get the most recent ones
        const sortedLocations = locations
          .sort((a, b) => b.id - a.id)
          .slice(0, 6);
        setRecentLocations(sortedLocations);
        setStats(statsData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [firebaseUser]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/locations?city=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-3xl"></div>
        <div className="relative container mx-auto px-4 py-16 sm:py-24 lg:py-32">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <Badge className="mx-auto w-fit px-4 py-2 text-sm font-medium text-white">
                <TrendingUp className="w-4 h-4 mr-2" />
                Descubra novos spots
              </Badge>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Encontre os Melhores
                <br />
                <span className="text-gray-900 dark:text-white">
                  Picos para Dançar
                </span>
              </h1>
              <p className="mx-auto max-w-2xl text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                Explore e compartilhe os melhores locais para treinar breaking e
                outras danças urbanas na sua cidade. Conecte-se com a comunidade
                e descubra novos spots.
              </p>
            </div>

            {/* Search Section */}
            <div className="mx-auto max-w-2xl">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    type="text"
                    placeholder="Digite o nome de uma cidade..."
                    className="pl-12 pr-32 py-4 text-lg bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl focus:shadow-2xl transition-all duration-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
                  >
                    Buscar
                  </Button>
                </div>
              </form>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/add-location">
                <Button
                  size="lg"
                  className="rounded-xl  bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Adicionar Local
                </Button>
              </Link>
              <Link to="/locations">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl border-black bg-black backdrop-blur-sm hover:bg-white/80 transition-all duration-300 text-white"
                >
                  <MapPin className="w-5 h-5 mr-2 bg-black" />
                  Ver Todos os Locais
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center bg-white/70 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {recentLocations.length}+
              </h3>
              <p className="text-gray-600">Locais Cadastrados</p>
            </CardContent>
          </Card>
          <Card className="text-center bg-white/70 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {stats.totalUsers}+
              </h3>
              <p className="text-gray-600">Dançarinos Conectados</p>
            </CardContent>
          </Card>
          <Card className="text-center bg-white/70 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {stats.totalRatings}+
              </h3>
              <p className="text-gray-600">Avaliações Feitas</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent Locations */}
      <section className="container mx-auto px-4 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Adicionados Recentemente
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Descubra os spots mais novos da comunidade
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card
                key={i}
                className="animate-pulse bg-white/70 backdrop-blur-sm border-0 shadow-xl rounded-2xl"
              >
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recentLocations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentLocations.map((location) => (
              <Card
                key={location.id}
                className="group bg-white/70 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <CardHeader className="p-6 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                        {location.name}
                      </CardTitle>
                      <Badge className="mt-2">Novo</Badge>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {location.address}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    {location.city}, {location.state}
                  </p>
                  <Link
                    to={`/locations?city=${encodeURIComponent(location.city)}`}
                    className="block"
                  >
                    <Button
                      variant="outline"
                      className="w-full rounded-xl border-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
                    >
                      Ver no Mapa
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-16 bg-white/70 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
            <CardContent>
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <MapPin className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhum local encontrado
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Seja o primeiro a compartilhar um spot incrível com a
                comunidade!
              </p>
              <Link to="/add-location">
                <Button
                  size="lg"
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Adicionar Primeiro Local
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
