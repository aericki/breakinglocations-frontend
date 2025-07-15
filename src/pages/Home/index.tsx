import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAllLocations } from '@/api/locationApi';
import { Location } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentLocations, setRecentLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadRecentLocations = async () => {
      try {
        setIsLoading(true);
        const locations = await fetchAllLocations(user);
        // Sort by ID descending to get the most recent ones
        const sortedLocations = locations.sort((a, b) => b.id - a.id).slice(0, 5);
        setRecentLocations(sortedLocations);
      } catch (error) {
        console.error("Erro ao carregar locais recentes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadRecentLocations();
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/localization?city=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <section className="text-center my-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Encontre os Melhores Picos para Dançar
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore e compartilhe os melhores locais para treinar breaking e outras danças urbanas na sua cidade.
        </p>
      </section>

      <section className="my-12 max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="Digite o nome de uma cidade..."
            className="flex-grow"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="submit">
            <Search className="mr-2 h-4 w-4" />
            Buscar
          </Button>
        </form>
      </section>

      <section className="my-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <MapPin />
          Adicionados Recentemente
        </h2>
        {isLoading ? (
          <div className="text-center">
            <p>Carregando locais...</p>
          </div>
        ) : recentLocations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentLocations.map((location) => (
              <Card key={location.id}>
                <CardHeader>
                  <CardTitle>{location.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{location.address}</p>
                  <p className="text-sm text-muted-foreground mt-2">{location.city}, {location.state}</p>
                  <Link to={`/localization?city=${encodeURIComponent(location.city)}`} className="mt-4 inline-block">
                    <Button variant="outline">Ver no Mapa</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <p className="text-muted-foreground">Nenhum local recente encontrado.</p>
            <Link to="/add-location" className="mt-4 inline-block">
              <Button>Seja o primeiro a adicionar um!</Button>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}