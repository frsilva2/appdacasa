import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import CorCard from './CorCard';
import { getCores, searchCores, ordenarCoresCustomizada } from '../../services/assets';

/**
 * Grid de cores com busca e filtros
 * @param {Function} onSelectCor - Callback quando selecionar uma cor
 * @param {boolean} modoSelecao - Se está em modo de seleção (permite selecionar)
 * @param {Object} corSelecionada - Cor atualmente selecionada
 * @param {boolean} showFotos - Mostrar fotos das cores
 */
const CoresGrid = ({
  onSelectCor,
  modoSelecao = false,
  corSelecionada = null,
  showFotos = true
}) => {
  const [cores, setCores] = useState([]);
  const [coresExibidas, setCoresExibidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState('');
  const [ordenacao, setOrdenacao] = useState('padrao'); // 'padrao', 'nome', 'hex'

  // Carregar cores ao montar componente
  useEffect(() => {
    carregarCores();
  }, []);

  // Filtrar e ordenar quando busca ou ordenação mudar
  useEffect(() => {
    filtrarEOrdenar();
  }, [busca, ordenacao, cores]);

  const carregarCores = async () => {
    try {
      setLoading(true);
      const response = await getCores();
      setCores(response.data.aprovadas || []);
      setErro(null);
    } catch (error) {
      console.error('Erro ao carregar cores:', error);
      setErro('Erro ao carregar cores. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const filtrarEOrdenar = () => {
    let resultado = [...cores];

    // Filtrar por busca
    if (busca.trim()) {
      resultado = resultado.filter(cor =>
        cor.nome_cor.toLowerCase().includes(busca.toLowerCase()) ||
        cor.hex.toLowerCase().includes(busca.toLowerCase())
      );
    }

    // Ordenar
    if (ordenacao === 'padrao') {
      // Usar ordem customizada
      resultado = ordenarCoresCustomizada(resultado);
    } else if (ordenacao === 'nome') {
      resultado.sort((a, b) => a.nome_cor.localeCompare(b.nome_cor));
    } else if (ordenacao === 'hex') {
      resultado.sort((a, b) => a.hex.localeCompare(b.hex));
    }

    setCoresExibidas(resultado);
  };

  const handleSelectCor = (cor) => {
    if (modoSelecao && onSelectCor) {
      onSelectCor(cor);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-gray-600">Carregando cores...</span>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {erro}
        <button
          onClick={carregarCores}
          className="ml-4 text-red-800 underline hover:no-underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barra de Busca e Filtros */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Busca */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nome ou código hex..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Ordenação */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Ordenar por:</label>
          <select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="padrao">Ordem Padrão</option>
            <option value="nome">Nome (A-Z)</option>
            <option value="hex">Código Hex</option>
          </select>
        </div>

        {/* Contador */}
        <div className="text-sm text-gray-600">
          {coresExibidas.length} de {cores.length} cores
        </div>
      </div>

      {/* Grid de Cores */}
      {coresExibidas.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Nenhuma cor encontrada para "{busca}"
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {coresExibidas.map((cor) => (
            <CorCard
              key={cor.id}
              cor={cor}
              onClick={handleSelectCor}
              selecionada={corSelecionada?.id === cor.id}
              showFoto={showFotos}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CoresGrid;
