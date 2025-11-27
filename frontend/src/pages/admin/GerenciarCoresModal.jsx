import { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle2, Palette } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const GerenciarCoresModal = ({ produto, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [coresDisponiveis, setCoresDisponiveis] = useState([]);
  const [coresDoProduct, setCoresDoProduct] = useState([]);
  const [selectedCores, setSelectedCores] = useState(new Set());

  useEffect(() => {
    carregarCores();
  }, []);

  const carregarCores = async () => {
    try {
      setLoading(true);

      // Carregar cores disponíveis no sistema (46 cores)
      const [responseCoresDisponiveis, responseProduto] = await Promise.all([
        api.get('/produtos/cores/disponiveis'),
        api.get(`/produtos/${produto.id}`),
      ]);

      setCoresDisponiveis(responseCoresDisponiveis.data.data);
      setCoresDoProduct(responseProduto.data.data.cores || []);
    } catch (error) {
      console.error('Erro ao carregar cores:', error);
      alert('Erro ao carregar cores');
    } finally {
      setLoading(false);
    }
  };

  const toggleCorSelecionada = (nomeCor) => {
    const newSet = new Set(selectedCores);
    if (newSet.has(nomeCor)) {
      newSet.delete(nomeCor);
    } else {
      newSet.add(nomeCor);
    }
    setSelectedCores(newSet);
  };

  const adicionarCoresSelecionadas = async () => {
    if (selectedCores.size === 0) {
      alert('Selecione pelo menos uma cor');
      return;
    }

    try {
      setLoading(true);

      // Filtrar cores que ainda não estão no produto
      const nomesExistentes = new Set(coresDoProduct.map(c => c.nome));
      const coresParaAdicionar = coresDisponiveis
        .filter(cor => selectedCores.has(cor.nome) && !nomesExistentes.has(cor.nome))
        .map(cor => ({
          nome: cor.nome,
          codigoHex: cor.codigoHex,
          arquivoImagem: cor.arquivoImagem,
        }));

      if (coresParaAdicionar.length === 0) {
        alert('Todas as cores selecionadas já estão cadastradas');
        return;
      }

      // Adicionar em lote
      await api.post(`/produtos/${produto.id}/cores/lote`, {
        cores: coresParaAdicionar,
      });

      alert(`${coresParaAdicionar.length} cor(es) adicionada(s) com sucesso!`);
      setSelectedCores(new Set());
      carregarCores();
      onSuccess();
    } catch (error) {
      console.error('Erro ao adicionar cores:', error);
      alert(error.response?.data?.message || 'Erro ao adicionar cores');
    } finally {
      setLoading(false);
    }
  };

  const removerCor = async (cor) => {
    if (!confirm(`Tem certeza que deseja remover a cor "${cor.nome}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/produtos/cores/${cor.id}`);
      alert('Cor removida com sucesso!');
      carregarCores();
      onSuccess();
    } catch (error) {
      console.error('Erro ao remover cor:', error);
      alert(error.response?.data?.message || 'Erro ao remover cor');
    } finally {
      setLoading(false);
    }
  };

  const selecionarTodasCores = () => {
    const nomesExistentes = new Set(coresDoProduct.map(c => c.nome));
    const coresFaltantes = coresDisponiveis
      .filter(cor => !nomesExistentes.has(cor.nome))
      .map(cor => cor.nome);
    setSelectedCores(new Set(coresFaltantes));
  };

  const limparSelecao = () => {
    setSelectedCores(new Set());
  };

  // Separar cores em disponíveis e já cadastradas
  const nomesExistentes = new Set(coresDoProduct.map(c => c.nome));
  const coresFaltantes = coresDisponiveis.filter(cor => !nomesExistentes.has(cor.nome));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-600 to-pink-600">
          <div className="text-white">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Palette size={28} />
              Gerenciar Cores - {produto.nome}
            </h2>
            <p className="text-sm mt-1 opacity-90">
              {coresDoProduct.length} de {coresDisponiveis.length} cores cadastradas
            </p>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading && coresDisponiveis.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Cores Já Cadastradas */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="text-green-600" size={24} />
                  Cores Cadastradas ({coresDoProduct.length})
                </h3>

                {coresDoProduct.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-600">Nenhuma cor cadastrada ainda</p>
                    <p className="text-sm text-gray-500 mt-1">Adicione cores na seção abaixo</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {coresDoProduct.map((cor) => (
                      <div
                        key={cor.id}
                        className="relative border-2 border-green-200 rounded-lg p-3 bg-green-50 hover:shadow-md transition-shadow"
                      >
                        {cor.arquivoImagem && (
                          <div className="w-full h-20 rounded-lg overflow-hidden mb-2">
                            <img
                              src={`/assets/cores/fotos/${cor.arquivoImagem}`}
                              alt={cor.nome}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <p className="text-sm font-medium text-gray-900 text-center mb-2">
                          {cor.nome}
                        </p>
                        <button
                          onClick={() => removerCor(cor)}
                          disabled={loading}
                          className="w-full bg-red-500 text-white px-2 py-1.5 rounded text-xs hover:bg-red-600 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Adicionar Cores */}
              <div className="border-t-2 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Plus className="text-primary" size={24} />
                    Adicionar Cores ({coresFaltantes.length} disponíveis)
                  </h3>

                  <div className="flex gap-2">
                    <button
                      onClick={selecionarTodasCores}
                      className="btn-secondary text-sm"
                      disabled={coresFaltantes.length === 0}
                    >
                      Selecionar Todas
                    </button>
                    <button
                      onClick={limparSelecao}
                      className="btn-secondary text-sm"
                      disabled={selectedCores.size === 0}
                    >
                      Limpar Seleção
                    </button>
                  </div>
                </div>

                {selectedCores.size > 0 && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                    <span className="text-sm text-blue-900">
                      {selectedCores.size} cor(es) selecionada(s)
                    </span>
                    <button
                      onClick={adicionarCoresSelecionadas}
                      disabled={loading}
                      className="btn-primary text-sm"
                    >
                      <Plus size={16} />
                      Adicionar Selecionadas
                    </button>
                  </div>
                )}

                {coresFaltantes.length === 0 ? (
                  <div className="text-center py-8 bg-green-50 rounded-lg border-2 border-green-200">
                    <CheckCircle2 className="mx-auto text-green-600 mb-2" size={48} />
                    <p className="text-green-900 font-semibold">Todas as cores já estão cadastradas!</p>
                    <p className="text-sm text-green-700 mt-1">
                      Este produto possui todas as {coresDisponiveis.length} cores disponíveis no sistema
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {coresFaltantes.map((cor) => (
                      <button
                        key={cor.nome}
                        onClick={() => toggleCorSelecionada(cor.nome)}
                        disabled={loading}
                        className={`relative border-2 rounded-lg p-3 transition-all transform hover:scale-105 ${
                          selectedCores.has(cor.nome)
                            ? 'border-primary bg-primary bg-opacity-10 shadow-lg'
                            : 'border-gray-300 bg-white hover:border-primary hover:shadow-md'
                        }`}
                      >
                        {cor.arquivoImagem && (
                          <div className="w-full h-20 rounded-lg overflow-hidden mb-2">
                            <img
                              src={`/assets/cores/fotos/${cor.arquivoImagem}`}
                              alt={cor.nome}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <p className="text-sm font-medium text-gray-900 text-center">
                          {cor.nome}
                        </p>
                        {selectedCores.has(cor.nome) && (
                          <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
                            <CheckCircle2 size={18} className="text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="btn-secondary flex-1"
            disabled={loading}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default GerenciarCoresModal;
