// Nova Cotação - Exibe fotos das cores dos tecidos
import { useState, useEffect } from 'react';
import { X, Send, Trash2, Package, Plus, Minus } from 'lucide-react';
import api from '../../services/api';
import { getUrlFotoCor } from '../../services/assets';
import LoadingSpinner from '../../components/LoadingSpinner';
import ProductAutocomplete from '../../components/ProductAutocomplete';

const NovaCotacaoModal = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [produto, setProduto] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState([]);
  const [observacoes, setObservacoes] = useState('');
  const [prazoExpiracao, setPrazoExpiracao] = useState('');
  const [tokensGerados, setTokensGerados] = useState(null);

  useEffect(() => {
    carregarProdutos();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setPrazoExpiracao(tomorrow.toISOString().split('T')[0]);
  }, []);

  const carregarProdutos = async () => {
    try {
      const response = await api.get('/produtos/com-estoque');
      setProdutos(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      alert('Erro ao carregar produtos');
    }
  };

  const handleProdutoSelect = (produtoSelecionado) => {
    setProduto(produtoSelecionado);
    setSearchTerm('');
  };

  // Incrementar quantidade da cor
  const incrementarCor = (cor) => {
    if (!produto) return;

    const existingIndex = items.findIndex(
      item => item.produtoId === produto.id && item.corId === cor.id
    );

    if (existingIndex >= 0) {
      const newItems = [...items];
      newItems[existingIndex].quantidade += 60;
      setItems(newItems);
    } else {
      setItems([
        ...items,
        {
          produtoId: produto.id,
          corId: cor.id,
          quantidade: 60,
          produto,
          cor,
        },
      ]);
    }
  };

  // Decrementar quantidade da cor
  const decrementarCor = (cor) => {
    if (!produto) return;

    const existingIndex = items.findIndex(
      item => item.produtoId === produto.id && item.corId === cor.id
    );

    if (existingIndex >= 0) {
      const newItems = [...items];
      if (newItems[existingIndex].quantidade > 60) {
        newItems[existingIndex].quantidade -= 60;
        setItems(newItems);
      } else {
        // Remove item
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
    return getUrlFotoCor(fileName);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      alert('Adicione pelo menos um item à cotação');
      return;
    }

    if (!prazoExpiracao) {
      alert('Informe o prazo de expiração');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        prazoExpiracao: new Date(prazoExpiracao).toISOString(),
        observacoes: observacoes || null,
        items: items.map((item) => ({
          produtoId: item.produtoId,
          corId: item.corId,
          quantidade: item.quantidade,
        })),
      };

      const response = await api.post('/cotacoes', payload);

      if (response.data.data.tokens) {
        setTokensGerados(response.data.data.tokens);
      } else {
        alert('Cotação criada com sucesso!');
        onSuccess();
      }
    } catch (error) {
      console.error('Erro ao criar cotação:', error);
      alert(error.response?.data?.message || 'Erro ao criar cotação');
    } finally {
      setLoading(false);
    }
  };

  const copiarLink = (link) => {
    navigator.clipboard.writeText(link);
    alert('Link copiado para a área de transferência!');
  };

  const coresFiltradas = produto?.cores.filter(cor =>
    cor.nome.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getQuantidadeCor = (corId) => {
    const item = items.find(i => i.corId === corId && i.produtoId === produto?.id);
    return item ? item.quantidade / 60 : 0;
  };

  if (tokensGerados) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900">
              Cotação Criada com Sucesso!
            </h2>
            <button onClick={() => onSuccess()} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Importante:</strong> Envie os links abaixo para os fornecedores via WhatsApp.
              </p>
              <p className="text-sm text-gray-600">
                Prazo para resposta: {new Date(prazoExpiracao).toLocaleDateString('pt-BR')}
              </p>
            </div>

            <div className="space-y-4">
              {tokensGerados.map((token, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-bold text-lg text-gray-900 mb-3">
                    {token.fornecedor}
                  </h3>
                  <div className="bg-white p-3 rounded border mb-3 break-all text-sm">
                    {token.link}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => copiarLink(token.link)} className="btn-secondary text-sm flex-1">
                      Copiar Link
                    </button>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`Olá! Nova cotação disponível. Acesse: ${token.link}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-sm flex-1 flex items-center justify-center gap-2"
                    >
                      <Send size={16} />
                      WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 border-t">
            <button onClick={() => onSuccess()} className="btn-primary w-full">
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header com Prazo */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Nova Cotação</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          {/* Prazo de Expiração Inline */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Prazo de Expiração:
            </label>
            <input
              type="date"
              value={prazoExpiracao}
              onChange={(e) => setPrazoExpiracao(e.target.value)}
              className="input flex-1 max-w-xs"
              required
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
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
                  Itens da Cotação ({items.length})
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
                          {item.quantidade / 60} peças × 60m = {item.quantidade}m
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
                placeholder="Informações adicionais para os fornecedores..."
              />
            </div>
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
              {loading ? <LoadingSpinner /> : `Criar Cotação (${items.length} itens)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NovaCotacaoModal;
