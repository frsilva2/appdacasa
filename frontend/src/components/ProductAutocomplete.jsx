import { useState, useEffect, useRef } from 'react';
import { Search, Package, X } from 'lucide-react';

const ProductAutocomplete = ({ produtos, onSelect, selectedProduct, placeholder = "Buscar produto por nome ou código..." }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredProdutos, setFilteredProdutos] = useState([]);
  const wrapperRef = useRef(null);

  // Fecha o dropdown quando clica fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtra produtos enquanto digita
  useEffect(() => {
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const filtered = produtos.filter(p =>
        p.nome.toLowerCase().includes(term) ||
        p.codigo.toLowerCase().includes(term) ||
        p.curva?.toLowerCase().includes(term)
      ).slice(0, 10); // Limita a 10 resultados
      setFilteredProdutos(filtered);
      setIsOpen(true);
    } else {
      setFilteredProdutos([]);
      setIsOpen(false);
    }
  }, [searchTerm, produtos]);

  const handleSelect = (produto) => {
    onSelect(produto);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleClear = () => {
    if (selectedProduct) {
      onSelect(null);
    }
    setSearchTerm('');
    setFilteredProdutos([]);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      {/* Campo de busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchTerm && setIsOpen(true)}
          placeholder={placeholder}
          className="input pl-10 pr-10"
        />
        {(searchTerm || selectedProduct) && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Produto selecionado */}
      {selectedProduct && !searchTerm && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="font-medium text-gray-900">{selectedProduct.nome}</p>
              <p className="text-sm text-gray-600">
                Código: {selectedProduct.codigo} • Curva {selectedProduct.curva}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Trocar
          </button>
        </div>
      )}

      {/* Dropdown de resultados */}
      {isOpen && filteredProdutos.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {filteredProdutos.map((produto) => (
            <button
              key={produto.id}
              type="button"
              onClick={() => handleSelect(produto)}
              className="w-full p-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors text-left focus:outline-none focus:bg-blue-50"
            >
              <div className="flex items-center gap-3">
                {/* Ícone do produto */}
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="text-blue-600" size={24} />
                </div>

                {/* Informações do produto */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {produto.nome}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {produto.codigo}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      Curva {produto.curva}
                    </span>
                    {produto.cores && (
                      <span className="text-xs text-gray-500">
                        {produto.cores.length} {produto.cores.length === 1 ? 'cor' : 'cores'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Nenhum resultado */}
      {isOpen && searchTerm && filteredProdutos.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
          <p className="text-gray-500 text-center">
            Nenhum produto encontrado para "{searchTerm}"
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductAutocomplete;
