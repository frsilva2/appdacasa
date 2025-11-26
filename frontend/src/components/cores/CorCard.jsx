import React from 'react';
import { getCorTextoContraste, getUrlFotoCor } from '../../services/assets';

/**
 * Card individual para exibir uma cor
 * @param {Object} cor - Objeto com dados da cor
 * @param {Function} onClick - Callback quando clicar no card
 * @param {boolean} selecionada - Se a cor está selecionada
 * @param {boolean} showFoto - Mostrar foto da cor
 */
const CorCard = ({ cor, onClick, selecionada = false, showFoto = true }) => {
  const corTexto = getCorTextoContraste(cor.hex);
  const urlFoto = getUrlFotoCor(cor.arquivo_imagem);

  return (
    <div
      onClick={() => onClick && onClick(cor)}
      className={`
        relative rounded-lg overflow-hidden shadow-md hover:shadow-xl
        transition-all duration-200 cursor-pointer
        ${selecionada ? 'ring-4 ring-primary scale-105' : 'hover:scale-102'}
      `}
    >
      {/* Foto da Cor (se showFoto = true) */}
      {showFoto && (
        <div className="w-full h-32 overflow-hidden bg-gray-200">
          <img
            src={urlFoto}
            alt={cor.nome_cor}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback para cor sólida se imagem não carregar
              e.target.style.display = 'none';
              e.target.parentElement.style.backgroundColor = cor.hex;
            }}
          />
        </div>
      )}

      {/* Amostra da Cor Sólida */}
      <div
        className="w-full h-20"
        style={{ backgroundColor: cor.hex }}
      />

      {/* Informações da Cor */}
      <div className="p-3 bg-white">
        <h3 className="font-semibold text-sm text-gray-900 mb-1">
          {cor.nome_cor}
        </h3>

        <div className="flex items-center justify-between text-xs text-gray-600">
          <span className="font-mono">{cor.hex}</span>
          {cor.codigo_cor && cor.codigo_cor !== cor.hex && (
            <span className="text-gray-500">{cor.codigo_cor}</span>
          )}
        </div>

        {/* Pantone (se disponível) */}
        {cor.pantone && cor.pantone !== cor.hex && (
          <div className="mt-2 text-xs text-gray-500">
            Pantone: {cor.pantone}
          </div>
        )}

        {/* Badge de selecionado */}
        {selecionada && (
          <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded-full text-xs font-semibold">
            ✓ Selecionada
          </div>
        )}
      </div>
    </div>
  );
};

export default CorCard;
