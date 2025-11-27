import { useState, useEffect } from 'react';
import { X, Trash2, Package, Plus, Minus } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ProductAutocomplete from '../../components/ProductAutocomplete';

const NovaRequisicaoModal = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [loadingProdutos, setLoadingProdutos] = useState(true);
  const [produtos, setProdutos] = useState([]);
  const [produto, setProduto] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    try {
      setLoadingProdutos(true);
      const response = await api.get('/produtos/com-estoque');
      setProdutos(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      alert('Erro ao carregar produtos');
    } finally {
      setLoadingProdutos(false);
    }
  };

  const handleProdutoSelect = (produtoSelecionado) => {
    setProduto(produtoSelecionado);
    setSearchTerm('');
  };

  // Incrementar quantidade da cor em 60m
  const incrementarCor = (cor) => {
    if (!produto) return;

    const existingIndex = items.findIndex(
      item => item.produtoId === produto.id && item.corId === cor.id
    );

    if (existingIndex >= 0) {
      const newItems = [...items];
      newItems[existingIndex].quantidadeSolicitada += 60;
      setItems(newItems);
    } else {
      setItems([
        ...items,
        {
          produtoId: produto.id,
          corId: cor.id,
          quantidadeSolicitada: 60,
          produto,
          cor,
        },
      ]);
    }
  };

  // Decrementar quantidade da cor em 60m
  const decrementarCor = (cor) => {
    if (!produto) return;

    const existingIndex = items.findIndex(
      item => item.produtoId === produto.id && item.corId === cor.id
    );

    if (existingIndex >= 0) {
      const newItems = [...items];
      if (newItems[existingIndex].quantidadeSolicitada > 60) {
        newItems[existingIndex].quantidadeSolicitada -= 60;
        setItems(newItems);
      } else {
        // Remove item se chegar a 0
        setItems(items.filter((_, i) => i !== existingIndex));
      }
    }
  };

  const removerItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const getColorImageUrl = (cor) => {
    const fileName = cor.arquivoImagem || cor.arquivo_imagem;
    if (!fileName) return null;
    // Assets ficam no servidor base, não na rota /api
    return `http://localhost:5000/assets/cores/fotos/${fileName}`;
  };

  const getQuantidadeCor = (corId) => {
    const item = items.find(i => i.corId === corId && i.produtoId === produto?.id);
    return item ? item.quantidadeSolicitada / 60 : 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      alert('Adicione pelo menos um item à requisição');
      return;
    }

    try {
      setLoading(true);

      const data = {
        items: items.map(item => ({
          produtoId: item.produtoId,
          corId: item.corId,
          quantidadeSolicitada: item.quantidadeSolicitada,
        })),
        observacoes: observacoes.trim() || undefined,
      };

      await api.post('/requisicoes-abastecimento', data);
      alert('Requisição criada com sucesso!');
      onSuccess();
    } catch (error) {
      console.error('Erro ao criar requisição:', error);
      alert(error.response?.data?.message || 'Erro ao criar requisição');
    } finally {
      setLoading(false);
    }
  };

  const coresFiltradas = produto?.cores.filter(cor =>
    cor.nome.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Nova Requisição de Abastecimento</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            {loadingProdutos ? (
              <div className="text-center py-8">
                <LoadingSpinner />
              </div>
            ) : (
              <>
                {/* Produto */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecione o Produto *
                  </label>
                  <ProductAutocomplete
                    produtos={produtos}
                    selectedProduct={produto}
                    onSelect={handleProdutoSelect}
                    placeholder="Buscar produto por nome ou código..."
                  />
                </div>

                {/* Grid de Cores com +/- */}
                {produto && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selecione as Cores (cada peça = 60m)
                    </label>

                    {/* Busca */}
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Filtrar cores..."
                      className="input mb-4"
                    />

                    {/* Grid de Cores */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {coresFiltradas.map((cor) => {
                        const quantidade = getQuantidadeCor(cor.id);
                        const imagemUrl = getColorImageUrl(cor);
                        const estoque = cor.estoques?.[0]?.quantidade || 0;

                        return (
                          <div
                            key={cor.id}
                            className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                              quantidade > 0 ? 'border-blue-500 shadow-lg' : 'border-gray-200'
                            }`}
                          >
                            {/* Imagem ou Cor */}
                            <div
                              className="h-32 flex items-center justify-center relative"
                              style={{ backgroundColor: cor.codigoHex || '#CCCCCC' }}
                            >
                              {imagemUrl && (
                                <img
                                  src={imagemUrl}
                                  alt={cor.nome}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              )}

                              {/* Badge de Quantidade */}
                              {quantidade > 0 && (
                                <div className="absolute top-2 right-2 bg-blue-500 text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                                  {quantidade}
                                </div>
                              )}

                              {/* Badge de Estoque */}
                              {estoque > 0 && (
                                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black bg-opacity-75 text-white text-xs font-medium rounded">
                                  {estoque}m
                                </div>
                              )}
                            </div>

                            {/* Nome */}
                            <div className="p-2 bg-white border-t">
                              <p className="text-xs font-medium text-gray-900 truncate text-center">
                                {cor.nome}
                              </p>
                            </div>

                            {/* Botões +/- */}
                            <div className="flex">
                              <button
                                type="button"
                                onClick={() => decrementarCor(cor)}
                                disabled={quantidade === 0}
                                className={`flex-1 py-2 flex items-center justify-center border-t transition-colors ${
                                  quantidade === 0
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white hover:bg-red-50 text-red-600'
                                }`}
                              >
                                <Minus size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => incrementarCor(cor)}
                                className="flex-1 py-2 flex items-center justify-center bg-white hover:bg-green-50 text-green-600 border-t border-l transition-colors"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {!produto && (
                  <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg mb-6">
                    <Package size={48} className="mx-auto mb-2 opacity-50" />
                    <p>Selecione um produto para ver as cores disponíveis</p>
                  </div>
                )}

                {/* Carrinho */}
                {items.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Itens da Requisição ({items.length})
                    </h3>
                    <div className="space-y-2">
                      {items.map((item, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded flex-shrink-0 border"
                            style={{ backgroundColor: item.cor.codigoHex || '#CCCCCC' }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">
                              {item.produto.nome}
                            </p>
                            <p className="text-xs text-gray-600 truncate">{item.cor.nome}</p>
                            <p className="text-xs font-semibold text-blue-600">
                              {item.quantidadeSolicitada / 60} peças × 60m = {item.quantidadeSolicitada}m
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removerItem(index)}
                            className="text-red-600 hover:text-red-800 p-2"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Observações */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações
                  </label>
                  <textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="input min-h-[80px]"
                    placeholder="Informações adicionais..."
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex gap-3 p-6 border-t bg-white">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={loading || items.length === 0}
            >
              {loading ? <LoadingSpinner /> : `Criar Requisição (${items.length} itens)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NovaRequisicaoModal;
