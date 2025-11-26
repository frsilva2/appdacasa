import { useState, useEffect } from 'react';
import { X, Trash2, Package, Plus, Minus, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ProductAutocomplete from '../../components/ProductAutocomplete';

const NovoPedidoModal = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [produto, setProduto] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState([]);
  const [enderecoEntrega, setEnderecoEntrega] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('');
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    carregarProdutos();
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
          precoUnitario: '',
          produto,
          cor,
        },
      ]);
    }
  };

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
        setItems(items.filter((_, i) => i !== existingIndex));
      }
    }
  };

  const removerItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const atualizarPreco = (index, preco) => {
    const newItems = [...items];
    newItems[index].precoUnitario = preco;
    setItems(newItems);
  };

  const getColorImageUrl = (cor) => {
    const fileName = cor.arquivoImagem || cor.arquivo_imagem;
    if (!fileName) return null;
    // Assets ficam no servidor base, não na rota /api
    return `http://localhost:5000/assets/cores/fotos/${fileName}`;
  };

  const calcularTotal = () => {
    return items.reduce((acc, item) => {
      if (item.quantidade && item.precoUnitario) {
        return acc + parseFloat(item.quantidade) * parseFloat(item.precoUnitario);
      }
      return acc;
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      alert('Adicione pelo menos um item ao pedido');
      return;
    }

    if (!enderecoEntrega) {
      alert('Informe o endereço de entrega');
      return;
    }

    if (!formaPagamento) {
      alert('Selecione a forma de pagamento');
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.precoUnitario || parseFloat(item.precoUnitario) <= 0) {
        alert(`Defina o preço unitário para "${item.produto.nome} - ${item.cor.nome}"`);
        return;
      }
    }

    const total = calcularTotal();
    if (total < 500) {
      alert(`Valor mínimo do pedido é R$ 500,00. Valor atual: R$ ${total.toFixed(2)}`);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        items: items.map((item) => ({
          produtoId: item.produtoId,
          corId: item.corId,
          quantidade: parseFloat(item.quantidade),
          precoUnitario: parseFloat(item.precoUnitario),
        })),
        enderecoEntrega,
        formaPagamento,
        observacoes: observacoes || null,
      };

      await api.post('/pedidos-b2b', payload);

      alert('Pedido criado com sucesso! Aguarde aprovação.');
      onSuccess();
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      alert(error.response?.data?.message || 'Erro ao criar pedido');
    } finally {
      setLoading(false);
    }
  };

  const coresFiltradas = produto?.cores.filter(cor =>
    cor.nome.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getQuantidadeCor = (corId) => {
    const item = items.find(i => i.corId === corId && i.produtoId === produto?.id);
    return item ? item.quantidade / 60 : 0;
  };

  const total = calcularTotal();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Novo Pedido B2B</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          {/* Aviso */}
          <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded flex items-start gap-2">
            <AlertCircle className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
            <div className="text-xs text-gray-700">
              <strong>Lembre-se:</strong> Pedido mínimo R$ 500,00 • Cada peça = 60m • Entrega em 15 dias
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            {/* Endereço e Pagamento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Endereço de Entrega *
                </label>
                <textarea
                  value={enderecoEntrega}
                  onChange={(e) => setEnderecoEntrega(e.target.value)}
                  className="input min-h-[80px]"
                  placeholder="Rua, número, bairro, cidade - UF, CEP"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Forma de Pagamento *
                </label>
                <select
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                  className="input"
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="4x Cartão de Crédito">4x Cartão de Crédito</option>
                  <option value="PIX">PIX</option>
                  <option value="Dinheiro">Dinheiro</option>
                </select>
              </div>
            </div>

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

            {/* Grid de Cores */}
            {produto && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecione as Cores (cada peça = 60m)
                </label>

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filtrar cores..."
                  className="input mb-4"
                />

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

                          {quantidade > 0 && (
                            <div className="absolute top-2 right-2 bg-blue-500 text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                              {quantidade}
                            </div>
                          )}
                        </div>

                        <div className="p-2 bg-white border-t">
                          <p className="text-xs font-medium text-gray-900 truncate text-center">
                            {cor.nome}
                          </p>
                        </div>

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

            {/* Carrinho com Preços */}
            {items.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Itens do Pedido ({items.length})
                </h3>
                <div className="space-y-2">
                  {items.map((item, index) => {
                    const subtotal = item.precoUnitario
                      ? parseFloat(item.quantidade) * parseFloat(item.precoUnitario)
                      : 0;

                    return (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-3 mb-2">
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
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-xs font-medium text-gray-700 w-20">
                            Preço (R$/m):
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={item.precoUnitario}
                            onChange={(e) => atualizarPreco(index, e.target.value)}
                            className="input flex-1"
                            placeholder="0.00"
                            required
                          />
                          {subtotal > 0 && (
                            <span className="text-sm font-bold text-green-600 w-28 text-right">
                              R$ {subtotal.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Total */}
                {total > 0 && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 font-medium">Valor Total do Pedido</p>
                        <p className={`text-sm ${total >= 500 ? 'text-green-600' : 'text-red-600'}`}>
                          {total >= 500 ? '✓ Valor mínimo atingido' : `✗ Faltam R$ ${(500 - total).toFixed(2)}`}
                        </p>
                      </div>
                      <p className="text-3xl font-bold text-blue-600">
                        R$ {total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
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
                className="input min-h-[60px]"
                placeholder="Informações adicionais..."
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
              {loading ? <LoadingSpinner /> : `Criar Pedido (${items.length} itens)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NovoPedidoModal;
