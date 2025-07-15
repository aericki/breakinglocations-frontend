import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

interface SearchableSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Selecione uma opção",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Garante que 'options' seja sempre um array
  const validOptions = Array.isArray(options) ? options : [];

  // Filtra as opções baseado no termo de pesquisa diretamente no render
  const filteredOptions = searchTerm
    ? validOptions.filter(option =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : validOptions;

  // Fecha o dropdown quando clica fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectOption = (option: string) => {
    onChange(option);
    setSearchTerm("");
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Campo de seleção atual */}
      <div
        className="bg-gray-100 border border-gray-200 rounded flex items-center justify-between p-2 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-grow truncate">
          {value || placeholder}
        </div>
        <div className="flex-shrink-0 ml-2">
          <svg
            className={`h-5 w-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dropdown com campo de pesquisa e opções */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg">
          {/* Campo de pesquisa */}
          <div className="p-2 border-b border-gray-200 flex items-center">
            <Search className="h-4 w-4 text-gray-400 mr-2" />
            <input
              type="text"
              className="w-full bg-transparent outline-none text-sm"
              placeholder="Pesquisar cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Lista de opções */}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={index}
                  className={`p-2 hover:bg-gray-100 cursor-pointer ${
                    option === value ? 'bg-blue-50 text-blue-600' : ''
                  }`}
                  onClick={() => handleSelectOption(option)}
                >
                  {option}
                </div>
              ))
            ) : (
              <div className="p-2 text-gray-500 text-center">
                Nenhum resultado encontrado
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
