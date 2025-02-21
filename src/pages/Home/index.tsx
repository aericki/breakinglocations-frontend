import { Link } from "react-router-dom";
import { Search } from "lucide-react";

export default function Home() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex flex-col md:flex-row w-full h-screen overflow-hidden">
      {/* Seção de Conteúdo - Área Esquerda */}
      <div className="w-full md:w-1/2 flex flex-col h-full p-4 sm:p-6 md:p-8 lg:p-12 overflow-y-auto">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M18.364 17.364L12 23.728l-6.364-6.364a9 9 0 1112.728 0zM12 13a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </div>
            <span className="ml-2 text-2xl font-bold">Breaking Locations</span>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors" aria-label="Sobre">
              Sobre
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors" aria-label="Contato">
              Contato
            </a>
          </nav>
        </header>

        <main className="flex flex-col items-center justify-center flex-1">
          <p className="text-lg md:text-xl text-gray-700 text-center mb-8 px-4">
            Encontre os melhores locais para treinar breaking na sua cidade
          </p>

          <Link to="/localization" className="w-full max-w-md">
            <button
              className="relative w-full bg-gray-800 text-white rounded-md transition-colors hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 h-12 pl-12 pr-4 text-base"
              aria-label="Encontrar local"
            >
              <div className="absolute inset-y-0 left-0 flex items-center justify-center w-12 bg-gray-900 rounded-l-md">
                <Search size={20} className="w-5 h-5" />
              </div>
              <span className="font-medium">Encontrar local</span>
            </button>
          </Link>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10 w-full">
            <div className="bg-white p-4 rounded-md border border-gray-200 shadow hover:shadow-lg transition-shadow">
              <h3 className="text-blue-600 font-semibold text-sm mb-1">Fácil de usar</h3>
              <p className="text-gray-600 text-xs">Encontre locais com poucos cliques</p>
            </div>
            <div className="bg-white p-4 rounded-md border border-gray-200 shadow hover:shadow-lg transition-shadow">
              <h3 className="text-blue-600 font-semibold text-sm mb-1">100% gratuito</h3>
              <p className="text-gray-600 text-xs">Cadastre e busque sem custos</p>
            </div>
            <div className="bg-white p-4 rounded-md border border-gray-200 shadow hover:shadow-lg transition-shadow">
              <h3 className="text-blue-600 font-semibold text-sm mb-1">Comunidade</h3>
              <p className="text-gray-600 text-xs">Conecte-se com outros b-boys/b-girls</p>
            </div>
            <div className="bg-white p-4 rounded-md border border-gray-200 shadow hover:shadow-lg transition-shadow">
              <h3 className="text-blue-600 font-semibold text-sm mb-1">Atualizado</h3>
              <p className="text-gray-600 text-xs">Dados sempre atualizados pela comunidade</p>
            </div>
          </section>
        </main>

        <footer className="mt-8 pt-4 border-t border-gray-200">
          <div className="flex justify-center space-x-4 mb-2">
            <a
              href="https://github.com/aericki"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-600"
              aria-label="GitHub"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/in/aericki"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-600"
              aria-label="LinkedIn"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          </div>
          <p className="text-center text-gray-600 text-sm">Desenvolvido por Aéricki Ferreira</p>
          <p className="text-center text-gray-500 text-xs mt-1">
            Copyright © {currentYear} BreakingLocations. Todos os direitos reservados.
          </p>
        </footer>
      </div>

      {/* Seção de Imagem - Área Direita */}
      <div className="w-full md:w-1/2 relative">
        <div
          className="absolute inset-0 md:rounded-l-3xl bg-cover bg-center"
          style={{ backgroundImage: "url('/home-background.svg')" }}
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent md:hidden"></div>
        </div>
        {/* Overlay para Mobile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:hidden">
          <h2 className="text-white text-xl font-bold text-center">Comece agora</h2>
          <p className="text-white text-sm text-center mt-1">
            Encontre ou cadastre locais de treino em sua cidade
          </p>
        </div>
      </div>
    </div>
  );
}
