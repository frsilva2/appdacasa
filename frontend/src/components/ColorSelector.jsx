import { useState } from 'react';
import { Check, Palette } from 'lucide-react';

const ColorSelector = ({
  cores,
  selectedCorId,
  selectedCorIds = [],
  onSelect,
  showEstoque = false,
  multiSelect = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar cores pela busca (suporte para nome e nome_cor)
  const filteredCores = cores.filter(cor => {
    const nomeCor = cor.nome || cor.nome_cor || '';
    return nomeCor.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Helper para gerar URL da imagem da cor
  const getColorImageUrl = (cor) => {
    // Suporte para cores do assets (JSON) e do banco (Prisma)
    const fileName = cor.arquivoImagem || cor.arquivo_imagem || cor.codigo;
    if (!fileName) return null;

    // As imagens estão em C:\Projetos\Emporio-Tecidos-Assets\cores\fotos
    // Servidor as serve via http://localhost:5000/assets/cores/fotos
    // Assets ficam no servidor base, não na rota /api
    return `http://localhost:5000/assets/cores/fotos/${fileName}`;
  };

  return (
    <div className="space-y-4">
      {/* Busca de Cores */}
      <div className="relative">
        <Palette className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar cor por nome..."
          className="input pl-10"
        />
      </div>

      {/* Grid de Cores Estilo Pantone */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-60 overflow-y-auto p-2">
        {filteredCores.map((cor) => {
          const isSelected = multiSelect
            ? selectedCorIds.includes(cor.id)
            : selectedCorId === cor.id;
          const estoque = showEstoque ? cor.estoques?.[0] : null;
          const imagemUrl = getColorImageUrl(cor);

          const handleClick = () => {
            if (multiSelect) {
              // Multi-select mode: toggle color in array
              const newSelection = isSelected
                ? selectedCorIds.filter(id => id !== cor.id)
                : [...selectedCorIds, cor.id];
              onSelect(newSelection, cor);
            } else {
              // Single select mode: just pass the color
              onSelect(cor);
            }
          };

          return (
            <button
              key={cor.id}
              type="button"
              onClick={handleClick}
              className={`
                relative group rounded-lg overflow-hidden transition-all duration-200
                ${isSelected
                  ? 'ring-4 ring-blue-500 shadow-xl scale-105'
                  : 'hover:ring-2 hover:ring-gray-300 hover:shadow-lg hover:scale-102'
                }
              `}
            >
              {/* Card de Cor */}
              <div className="bg-white border border-gray-200">
                {/* Swatch de Cor Grande */}
                <div
                  className="relative w-full h-32 flex items-center justify-center"
                  style={{
                    backgroundColor: cor.codigoHex || cor.hex || cor.codigo_cor || '#CCCCCC',
                  }}
                >
                  {/* Imagem da cor (se disponível) */}
                  {imagemUrl && (
                    <img
                      src={imagemUrl}
                      alt={cor.nome}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}

                  {/* Badge de Selecionado */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg z-10">
                      <Check className="text-white" size={20} />
                    </div>
                  )}

                  {/* Badge de Estoque (se mostrar) */}
                  {showEstoque && estoque && (
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black bg-opacity-75 text-white text-xs font-medium rounded z-10">
                      {estoque.quantidade}m
                    </div>
                  )}
                </div>

                {/* Informações da Cor */}
                <div className="p-3 space-y-1">
                  {/* Nome da Cor */}
                  <p className="font-semibold text-gray-900 text-sm leading-tight">
                    {cor.nome || cor.nome_cor}
                  </p>

                  {/* Código Hex */}
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded border border-gray-300 shadow-sm flex-shrink-0"
                      style={{ backgroundColor: cor.codigoHex || cor.hex || cor.codigo_cor || '#CCCCCC' }}
                    />
                    <p className="text-xs text-gray-600 font-mono">
                      {cor.codigoHex || cor.hex || cor.codigo_cor || 'N/A'}
                    </p>
                  </div>

                  {/* Pantone (se disponível) */}
                  {cor.pantone && (
                    <p className="text-xs text-gray-500">
                      Pantone: {cor.pantone}
                    </p>
                  )}

                  {/* Código da Cor (se disponível) */}
                  {cor.codigo && (
                    <p className="text-xs text-gray-500 font-medium">
                      Cód: {cor.codigo}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Nenhuma cor encontrada */}
      {filteredCores.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Palette size={48} className="mx-auto mb-2 opacity-50" />
          <p>Nenhuma cor encontrada para "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};

export default ColorSelector;
