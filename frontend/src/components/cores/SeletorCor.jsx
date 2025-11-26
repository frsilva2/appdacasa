import React, { useState } from 'react';
import { X, Palette } from 'lucide-react';
import CoresGrid from './CoresGrid';

/**
 * Componente para seleção de cor em formulários
 * Exibe a cor selecionada e abre modal para escolher
 * @param {Object} corSelecionada - Cor atualmente selecionada
 * @param {Function} onChange - Callback quando selecionar cor
 * @param {string} label - Label do campo
 * @param {boolean} required - Se é obrigatório
 * @param {string} error - Mensagem de erro
 */
const SeletorCor = ({
  corSelecionada,
  onChange,
  label = 'Cor',
  required = false,
  error = null
}) => {
  const [modalAberto, setModalAberto] = useState(false);

  const handleSelectCor = (cor) => {
    onChange(cor);
    setModalAberto(false);
  };

  const handleRemoverCor = () => {
    onChange(null);
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Campo de Seleção */}
      <div
        onClick={() => setModalAberto(true)}
        className={`
          relative flex items-center gap-3 p-3 border rounded-lg cursor-pointer
          transition-all hover:border-primary hover:shadow-md
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${corSelecionada ? 'bg-white' : 'bg-gray-50'}
        `}
      >
        {/* Ícone ou Amostra da Cor */}
        {corSelecionada ? (
          <div className="flex items-center gap-3 flex-1">
            {/* Amostra */}
            <div
              className="w-12 h-12 rounded-md shadow-sm border border-gray-200"
              style={{ backgroundColor: corSelecionada.hex }}
            />

            {/* Informações */}
            <div className="flex-1">
              <div className="font-medium text-gray-900">
                {corSelecionada.nome_cor}
              </div>
              <div className="text-sm text-gray-500 font-mono">
                {corSelecionada.hex}
              </div>
            </div>

            {/* Botão Remover */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoverCor();
              }}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-gray-500">
            <Palette className="w-6 h-6" />
            <span>Clique para selecionar uma cor</span>
          </div>
        )}
      </div>

      {/* Mensagem de Erro */}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* Modal de Seleção */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Selecionar Cor
              </h2>
              <button
                onClick={() => setModalAberto(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="flex-1 overflow-y-auto p-6">
              <CoresGrid
                onSelectCor={handleSelectCor}
                modoSelecao={true}
                corSelecionada={corSelecionada}
                showFotos={true}
              />
            </div>

            {/* Footer do Modal */}
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setModalAberto(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeletorCor;
