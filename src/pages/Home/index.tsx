import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchAllLocations } from "@/api/locationApi";
import { Location } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  const { firebaseUser } = useAuth();
  const navigate = useNavigate();
  const [recentLocations, setRecentLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadRecentLocations = async () => {
      try {
        setIsLoading(true);
        const locations = await fetchAllLocations(firebaseUser);
        // Sort by ID descending to get the most recent ones
        const sortedLocations = locations
          .sort((a, b) => b.id - a.id)
          .slice(0, 5);
        setRecentLocations(sortedLocations);
      } catch (error) {
        console.error("Erro ao carregar locais recentes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadRecentLocations();
  }, [firebaseUser]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/locations?city=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <section className="text-center my-8 sm:my-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
          Encontre os Melhores Picos para Dançar
        </h1>
        <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore e compartilhe os melhores locais para treinar breaking e
          outras danças urbanas na sua cidade.
        </p>
      </section>

      <section className="my-8 sm:my-12 max-w-lg sm:max-w-2xl mx-auto">
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-2"
        >
          <Input
            type="text"
            placeholder="Digite o nome de uma cidade..."
            className="flex-grow min-w-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="submit" className="w-full sm:w-auto">
            <Search className="mr-2 h-4 w-4" />
            Buscar
          </Button>
        </form>
      </section>

      <section className="my-8 sm:my-12">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
          <MapPin />
          Adicionados Recentemente
        </h2>
        {isLoading ? (
          <div className="text-center">
            <p>Carregando locais...</p>
          </div>
        ) : recentLocations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {recentLocations.map((location) => (
              <Card
                key={location.id}
                className="h-full flex flex-col justify-between"
              >
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">
                    {location.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground break-words">
                    {location.address}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {location.city}, {location.state}
                  </p>
                  <Link
                    to={`/locations?city=${encodeURIComponent(location.city)}`}
                    className="mt-4 inline-block w-full"
                  >
                    <Button variant="outline" className="w-full sm:w-auto">
                      Ver no Mapa
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12 border rounded-lg">
            <p className="text-muted-foreground">
              Nenhum local recente encontrado.
            </p>
            <Link
              to="/add-location"
              className="mt-4 inline-block w-full sm:w-auto"
            >
              <Button className="w-full sm:w-auto">
                Seja o primeiro a adicionar um!
              </Button>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
