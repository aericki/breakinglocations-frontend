// src/components/Header.tsx
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Button } from "./ui/button";
import {
  LogOut,
  LogIn,
  UserPlus,
  MapPin,
  User,
  Menu as MenuIcon,
  X as CloseIcon,
} from "lucide-react";

export function Header() {
  const { firebaseUser, appUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Hook reativo para rota atual

  // Estado para mostrar/esconder o header
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY.current && window.scrollY > 80) {
        setShowHeader(false); // Rolando para baixo
      } else {
        setShowHeader(true); // Rolando para cima
      }
      lastScrollY.current = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fecha menu mobile ao mudar de rota
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setMenuOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  // Função para verificar se a rota está ativa
  const isActiveRoute = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header
        className={`backdrop-blur-xl bg-gradient-to-r from-blue-600/80 to-purple-600/80 shadow-lg sticky top-0 z-40 transition-transform duration-300 border-b border-white/10 ${
          showHeader ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 group flex-shrink-0"
            >
              <span className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg group-hover:scale-105 transition-transform">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </span>
              <span className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-blue-200 via-white to-purple-200 bg-clip-text text-transparent tracking-tight group-hover:brightness-110 transition-all">
                BreakingLocations
              </span>
            </Link>

            {/* Navegação Desktop */}
            <nav className="hidden lg:flex items-center gap-1 mx-6 flex-1 justify-center">
              <Link
                to="/"
                className={`text-white/90 font-medium transition-all hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg text-sm ${
                  isActiveRoute("/") ? "bg-white/20 text-white" : ""
                }`}
              >
                Início
              </Link>
              <Link
                to="/locations"
                className={`text-white/90 font-medium transition-all hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg text-sm ${
                  isActiveRoute("/locations") ? "bg-white/20 text-white" : ""
                }`}
              >
                Locais
              </Link>
              {firebaseUser && (
                <Link
                  to="/add-location"
                  className={`text-white/90 font-medium transition-all hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg text-sm ${
                    isActiveRoute("/add-location")
                      ? "bg-white/20 text-white"
                      : ""
                  }`}
                >
                  Adicionar Local
                </Link>
              )}
            </nav>

            {/* Ações do Usuário Desktop */}
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              {firebaseUser ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/80 font-medium max-w-24 lg:max-w-32 truncate">
                    {appUser?.name || "Usuário"}
                  </span>
                  <Link to={`/profile/${firebaseUser.uid}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Meu Perfil"
                      className="rounded-lg bg-white/10 hover:bg-white/20 text-white h-8 w-8"
                    >
                      <User className="h-4 w-4" />
                      <span className="sr-only">Meu Perfil</span>
                    </Button>
                  </Link>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleLogout}
                    title="Sair"
                    className="rounded-lg bg-white/10 hover:bg-white/20 text-white h-8 w-8"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="sr-only">Sair</span>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login">
                    <Button
                      variant="ghost"
                      className="rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium px-3 py-1.5 text-sm h-8"
                    >
                      <LogIn className="mr-1.5 h-3.5 w-3.5" />
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="rounded-lg bg-white/20 hover:bg-white/30 text-white font-medium px-3 py-1.5 text-sm h-8 shadow-sm">
                      <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                      Cadastre-se
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Botão Menu Mobile */}
            <div className="flex items-center gap-2 md:hidden">
              {firebaseUser && (
                <Link to={`/profile/${firebaseUser.uid}`}>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Meu Perfil"
                    className="rounded-lg bg-white/10 hover:bg-white/20 text-white h-8 w-8"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </Link>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-white h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20"
                onClick={() => setMenuOpen(true)}
              >
                <MenuIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Overlay do Menu Mobile */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute right-0 top-0 h-full w-72 max-w-[85vw] bg-gradient-to-br from-blue-700/95 to-purple-700/95 backdrop-blur-xl shadow-2xl border-l border-white/10">
            <div className="flex flex-col h-full p-6">
              {/* Header do Menu */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-lg font-semibold text-white">Menu</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMenuOpen(false)}
                  className="text-white h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20"
                >
                  <CloseIcon className="h-4 w-4" />
                </Button>
              </div>

              {/* Navegação */}
              <nav className="flex flex-col gap-2">
                <Link
                  to="/"
                  className={`text-white font-medium hover:text-blue-200 transition-colors px-3 py-2.5 rounded-lg ${
                    isActiveRoute("/") ? "bg-white/20" : "hover:bg-white/10"
                  }`}
                >
                  Início
                </Link>
                <Link
                  to="/locations"
                  className={`text-white font-medium hover:text-blue-200 transition-colors px-3 py-2.5 rounded-lg ${
                    isActiveRoute("/locations")
                      ? "bg-white/20"
                      : "hover:bg-white/10"
                  }`}
                >
                  Locais
                </Link>
                {firebaseUser && (
                  <Link
                    to="/add-location"
                    className={`text-white font-medium hover:text-blue-200 transition-colors px-3 py-2.5 rounded-lg ${
                      isActiveRoute("/add-location")
                        ? "bg-white/20"
                        : "hover:bg-white/10"
                    }`}
                  >
                    Adicionar Local
                  </Link>
                )}
              </nav>

              {/* Espaçador */}
              <div className="flex-1" />

              {/* Ações do usuário no drawer */}
              <div className="border-t border-white/20 pt-4 mt-4">
                {firebaseUser ? (
                  <div className="space-y-3">
                    <div className="text-white/80 text-sm px-3">
                      {appUser?.name || "Usuário"}
                    </div>
                    <Link
                      to={`/profile/${firebaseUser.uid}`}
                      className="flex items-center gap-3 text-white font-medium hover:text-blue-200 transition-colors px-3 py-2.5 rounded-lg hover:bg-white/10"
                    >
                      <User className="h-4 w-4" />
                      Meu Perfil
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-white hover:text-blue-200 hover:bg-white/10 px-3 py-2.5 rounded-lg"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sair
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link to="/login" className="block">
                      <Button
                        variant="ghost"
                        className="w-full rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium py-2.5"
                      >
                        <LogIn className="mr-2 h-4 w-4" />
                        Login
                      </Button>
                    </Link>
                    <Link to="/signup" className="block">
                      <Button className="w-full rounded-lg bg-white/20 hover:bg-white/30 text-white font-medium py-2.5">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Cadastre-se
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
