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
        className={`backdrop-blur-xl bg-gradient-to-r from-blue-600/70 to-purple-600/70 shadow-lg sticky top-0 z-40 transition-transform duration-300 ${
          showHeader ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 sm:h-20 items-center justify-between">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
              <span className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg group-hover:scale-105 transition-transform">
                <MapPin className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
              </span>
              <span className="text-lg sm:text-2xl lg:text-3xl font-extrabold bg-gradient-to-r from-blue-200 via-white to-purple-200 bg-clip-text text-transparent tracking-tight group-hover:brightness-110 transition-all">
                BreakingLocations
              </span>
            </Link>

            {/* Navegação Desktop */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2 mx-6">
              <Link
                to="/"
                className={`text-white font-medium transition-all hover:text-blue-200 px-3 py-2 rounded-lg ${
                  isActiveRoute("/") ? "bg-white/20 text-blue-100" : ""
                }`}
              >
                Início
              </Link>
              <Link
                to="/locations"
                className={`text-white font-medium transition-all hover:text-blue-200 px-3 py-2 rounded-lg ${
                  isActiveRoute("/locations") ? "bg-white/20 text-blue-100" : ""
                }`}
              >
                Locais
              </Link>
              <Link
                to="/add-location"
                className={`text-white font-medium transition-all hover:text-blue-200 px-3 py-2 rounded-lg ${
                  isActiveRoute("/add-location") ? "bg-white/20 text-blue-100" : ""
                }`}
              >
                Adicionar Local
              </Link>
            </nav>

            {/* Ações do Usuário Desktop */}
            <div className="hidden md:flex items-center gap-2 lg:gap-3 flex-shrink-0">
              {firebaseUser ? (
                <>
                  <span className="text-sm text-white/80 font-medium max-w-32 lg:max-w-none truncate">
                    Olá, {appUser?.name || appUser?.email}
                  </span>
                  <Link to="/add-location" className="hidden lg:block">
                    <Button className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg text-white font-semibold px-4 py-2 transition-all text-sm">
                      <MapPin className="w-4 h-4 mr-2" />
                      Adicionar Local
                    </Button>
                  </Link>
                  <Link to={`/profile/${firebaseUser.uid}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Meu Perfil"
                      className="rounded-xl bg-white/20 hover:bg-white/40 text-white h-9 w-9"
                    >
                      <User className="h-4 w-4" />
                      <span className="sr-only">Meu Perfil</span>
                    </Button>
                  </Link>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleLogout}
                    className="rounded-xl bg-white/20 hover:bg-white/40 text-white h-9 w-9"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="sr-only">Sair</span>
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login">
                    <Button
                      variant="outline"
                      className="rounded-xl border-white/60 bg-white/20 text-white hover:bg-white/40 hover:text-blue-700 font-semibold px-4 py-2 transition-all text-sm"
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg text-white font-semibold px-4 py-2 transition-all text-sm">
                      <UserPlus className="mr-2 h-4 w-4" />
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
                    className="rounded-xl bg-white/20 hover:bg-white/40 text-white h-8 w-8"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </Link>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-white h-8 w-8"
                onClick={() => setMenuOpen(true)}
              >
                <MenuIcon className="h-5 w-5" />
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
          <div className="absolute right-0 top-0 h-full w-80 max-w-[90vw] bg-gradient-to-br from-blue-700 to-purple-700 shadow-2xl">
            <div className="flex flex-col h-full p-6">
              
              {/* Header do Menu */}
              <div className="flex items-center justify-between mb-8">
                <span className="text-xl font-bold text-white">Menu</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMenuOpen(false)}
                  className="text-white h-8 w-8"
                >
                  <CloseIcon className="h-5 w-5" />
                </Button>
              </div>

              {/* Navegação */}
              <nav className="flex flex-col gap-4">
                <Link
                  to="/"
                  className={`text-white text-lg font-medium hover:text-blue-200 transition-colors p-2 rounded-lg ${
                    isActiveRoute("/") ? "bg-white/20" : ""
                  }`}
                >
                  Início
                </Link>
                <Link
                  to="/locations"
                  className={`text-white text-lg font-medium hover:text-blue-200 transition-colors p-2 rounded-lg ${
                    isActiveRoute("/locations") ? "bg-white/20" : ""
                  }`}
                >
                  Locais
                </Link>
                <Link
                  to="/add-location"
                  className={`text-white text-lg font-medium hover:text-blue-200 transition-colors p-2 rounded-lg ${
                    isActiveRoute("/add-location") ? "bg-white/20" : ""
                  }`}
                >
                  Adicionar Local
                </Link>
              </nav>

              {/* Espaçador */}
              <div className="flex-1" />

              {/* Ações do usuário no drawer */}
              <div className="border-t border-white/20 pt-6 mt-6">
                {firebaseUser ? (
                  <div className="space-y-4">
                    <div className="text-white/80 text-sm">
                      Olá, {appUser?.name || appUser?.email}
                    </div>
                    <Link
                      to={`/profile/${firebaseUser.uid}`}
                      className="flex items-center gap-3 text-white font-medium hover:text-blue-200 transition-colors p-2 rounded-lg"
                    >
                      <User className="h-5 w-5" />
                      Meu Perfil
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-white hover:text-blue-200 hover:bg-white/10 p-2"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      Sair
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link to="/login" className="block">
                      <Button
                        variant="outline"
                        className="w-full rounded-xl border-white/60 bg-white/20 text-white hover:bg-white/40 hover:text-blue-700 font-semibold"
                      >
                        <LogIn className="mr-2 h-4 w-4" />
                        Login
                      </Button>
                    </Link>
                    <Link to="/signup" className="block">
                      <Button className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg text-white font-semibold">
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