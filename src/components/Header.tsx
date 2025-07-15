// src/components/Header.tsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Button } from "./ui/button";
import { LogOut, LogIn, UserPlus, MapPin, User } from "lucide-react";

export function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login"); // Redirect to login after logout
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <header className="bg-background shadow-sm sticky top-0 z-40">
      <div className="container mx-auto flex h-16 items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <MapPin className="mr-2 h-4 w-4" />
          <Link to="/" className="text-2xl font-bold text-primary">
            BreakingLocations
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Olá, {user.displayName || user.email}
              </span>
              <Link to="/add-location">
                <Button>Adicionar Local</Button>
              </Link>
              <Link to={`/profile/${user.uid}`}>
                <Button variant="ghost" size="icon" title="Meu Perfil">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Meu Perfil</span>
                </Button>
              </Link>
              <Button size="icon" variant="ghost" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Sair</span>
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="outline">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Cadastre-se
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
