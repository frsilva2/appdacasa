import { useState, useEffect } from 'react';
import { ShoppingCart, Search, Plus, Minus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const LojaB2BPage = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('');
  const [carrinho, setCarrinho] = useState([]);
  const [showCarrinho, setShowCarrinho] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    carregarProdutos();
    carregarCarrinhoLocalStorage();
  }, []);

  const carregarProdutos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/produtos/com-estoque');
      setProdutos(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      alert('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const carregarCarrinhoLocalStorage = () => {
    const carrinhoSalvo = localStorage.getItem('carrinho_b2b');
    if (carrinhoSalvo) {
      setCarrinho(JSON.parse(carrinhoSalvo));
    }
  };

  const salvarCarrinhoLocalStorage = (novoCarrinho) => {
    localStorage.setItem('carrinho_b2b', JSON.stringify(novoCarrinho));
    setCarrinho(novoCarrinho);
  };

  const adicionarAoCarrinho = (produto, coresQuantidades) => {
    let novoCarrinho = [...carrinho];

    coresQuantidades.forEach(({ cor, quantidade }) => {
      if (quantidade > 0) {
        const itemExistente = novoCarrinho.find(
          item => item.produtoId === produto.id && item.corId === cor.id
        );

        if (itemExistente) {
          novoCarrinho = novoCarrinho.map(item =>
            item.produtoId === produto.id && item.corId === cor.id
              ? { ...item, quantidade: item.quantidade + quantidade }
              : item
          );
        } else {
          novoCarrinho.push({
            produtoId: produto.id,
            corId: cor.id,
            quantidade,
            produto: {
              id: produto.id,
              codigo: produto.codigo,
              nome: produto.nome,
              precoAtacado: produto.precoAtacado
            },
            cor: {
              id: cor.id,
              nome: cor.nome,
              codigoHex: cor.codigoHex,
              arquivoImagem: cor.arquivoImagem
            }
          });
        }
      }
    });

    salvarCarrinhoLocalStorage(novoCarrinho);
  };

  const removerDoCarrinho = (produtoId, corId) => {
    const novoCarrinho = carrinho.filter(
      item => !(item.produtoId === produtoId && item.corId === corId)
    );
    salvarCarrinhoLocalStorage(novoCarrinho);
  };

  const atualizarQuantidade = (produtoId, corId, delta) => {
    const novoCarrinho = carrinho.map(item => {
      if (item.produtoId === produtoId && item.corId === corId) {
        const novaQuantidade = item.quantidade + delta;
        return novaQuantidade >= 60 ? { ...item, quantidade: novaQuantidade } : item;
      }
      return item;
    }).filter(item => item.quantidade >= 60);

    salvarCarrinhoLocalStorage(novoCarrinho);
  };

  const calcularTotal = () => {
    return carrinho.reduce((total, item) => {
      return total + (parseFloat(item.produto.precoAtacado) * item.quantidade);
    }, 0);
  };

  const getColorImageUrl = (arquivoImagem) => {
    if (!arquivoImagem) return null;
    return `http://localhost:5000/assets/cores/fotos/${arquivoImagem}`;
  };

  const produtosFiltrados = produtos.filter(p => {
    const matchSearch = !searchTerm ||
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategoria = !categoriaFilter || p.categoria === categoriaFilter;
    return matchSearch && matchCategoria;
  });

  const finalizarCompra = () => {
    if (carrinho.length === 0) {
      alert('Adicione produtos ao carrinho antes de finalizar a compra');
      return;
    }
    navigate('/checkout-b2b');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Empório Tecidos</h1>
              <p className="text-sm text-gray-600">Vendas para Pessoa Jurídica</p>
            </div>

            <button
              onClick={() => setShowCarrinho(!showCarrinho)}
              className="relative btn-primary flex items-center gap-2"
            >
              <ShoppingCart size={20} />
              Carrinho
              {carrinho.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                  {carrinho.length}
                </span>
              )}
            </button>
          </div>

          {/* Filtros */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                  placeholder="Buscar produtos..."
                />
              </div>
            </div>
            <div>
              <select
                value={categoriaFilter}
                onChange={(e) => setCategoriaFilter(e.target.value)}
                className="input"
              >
                <option value="">Todas as categorias</option>
                <option value="Tecidos">Tecidos</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Produtos */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {produtosFiltrados.map(produto => (
            <ProdutoCard
              key={produto.id}
              produto={produto}
              onClick={() => setProdutoSelecionado(produto)}
            />
          ))}
        </div>

        {produtosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum produto encontrado</p>
          </div>
        )}
      </main>

      {/* Modal de Produto */}
      {produtoSelecionado && (
        <ModalProduto
          produto={produtoSelecionado}
          onClose={() => setProdutoSelecionado(null)}
          onAdicionarAoCarrinho={adicionarAoCarrinho}
          getColorImageUrl={getColorImageUrl}
        />
      )}

      {/* Carrinho Lateral */}
      {showCarrinho && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowCarrinho(false)}>
          <div
            className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-bold">Carrinho</h2>
                <button onClick={() => setShowCarrinho(false)}>
                  <X size={24} />
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto p-6">
                {carrinho.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Carrinho vazio</p>
                ) : (
                  <div className="space-y-4">
                    {carrinho.map((item) => (
                      <CarrinhoItem
                        key={`${item.produtoId}-${item.corId}`}
                        item={item}
                        onRemover={removerDoCarrinho}
                        onAtualizarQuantidade={atualizarQuantidade}
                        getColorImageUrl={getColorImageUrl}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {carrinho.length > 0 && (
                <div className="border-t p-6 space-y-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>R$ {calcularTotal().toFixed(2)}</span>
                  </div>
                  <button
                    onClick={finalizarCompra}
                    className="btn-primary w-full"
                  >
                    Finalizar Compra
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente ProdutoCard (apenas informações)
const ProdutoCard = ({ produto, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 cursor-pointer transform hover:scale-105 transition-transform h-[380px] flex flex-col justify-center"
    >
      <div className="flex flex-col gap-6">
        {/* Info do Produto */}
        <div className="text-center">
          <h3 className="font-bold text-2xl mb-2 h-[80px] flex items-center justify-center leading-tight">
            {produto.nome}
          </h3>
          <p className="text-sm text-gray-600 mb-4">Código: {produto.codigo}</p>
          <div className="bg-primary text-white rounded-lg py-4 px-6 inline-block">
            <span className="text-3xl font-bold">R$ {parseFloat(produto.precoAtacado).toFixed(2)}</span>
            <span className="text-sm">/metro</span>
          </div>
        </div>

        {/* Botão */}
        <button className="btn-primary w-full py-3 text-lg">
          Selecionar Cores
        </button>
      </div>
    </div>
  );
};

// Modal de Produto com paleta grande e seleção múltipla
const ModalProduto = ({ produto, onClose, onAdicionarAoCarrinho, getColorImageUrl }) => {
  const [selecoes, setSelecoes] = useState({});

  // Extrair código do arquivo de imagem (formato: nomedacor_CODIGO.jpg)
  const extrairCodigoCor = (arquivoImagem) => {
    if (!arquivoImagem) return '';
    const match = arquivoImagem.match(/_(\d+)\./);
    return match ? match[1] : '';
  };

  const atualizarQuantidade = (corId, delta) => {
    setSelecoes(prev => {
      const quantidadeAtual = prev[corId] || 0;
      const novaQuantidade = Math.max(0, quantidadeAtual + delta);
      return {
        ...prev,
        [corId]: novaQuantidade
      };
    });
  };

  const temSelecao = Object.values(selecoes).some(q => q > 0);

  const handleAdicionarCarrinho = () => {
    const coresQuantidades = Object.entries(selecoes)
      .filter(([_, quantidade]) => quantidade > 0)
      .map(([corId, quantidade]) => ({
        cor: produto.cores.find(c => c.id === parseInt(corId)),
        quantidade
      }));

    if (coresQuantidades.length > 0) {
      onAdicionarAoCarrinho(produto, coresQuantidades);
      alert(`${coresQuantidades.length} cor(es) adicionada(s) ao carrinho!`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="bg-white rounded-lg shadow-2xl max-w-6xl w-full my-8 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold">{produto.nome}</h2>
            <p className="text-gray-600">Código: {produto.codigo} | R$ {parseFloat(produto.precoAtacado).toFixed(2)}/m</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200"
          >
            <X size={28} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 overflow-y-auto flex-1">
          <h3 className="text-lg font-semibold mb-4">Selecione as cores e quantidades:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-4">
            {produto.cores?.map(cor => {
              const quantidade = selecoes[cor.id] || 0;
              const codigoCor = extrairCodigoCor(cor.arquivoImagem);
              return (
                <div
                  key={cor.id}
                  className={`border-2 rounded-lg p-3 transition-all ${
                    quantidade > 0 ? 'border-primary bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  {/* Imagem/Cor */}
                  <div className="relative mb-2">
                    {cor.arquivoImagem ? (
                      <img
                        src={getColorImageUrl(cor.arquivoImagem)}
                        alt={cor.nome}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <div
                        className="w-full h-32 rounded-lg"
                        style={{ backgroundColor: cor.codigoHex || '#ccc' }}
                      />
                    )}
                    {quantidade > 0 && (
                      <div className="absolute top-2 right-2 bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                        ✓
                      </div>
                    )}
                  </div>

                  {/* Nome da cor com código */}
                  <div className="text-center mb-3">
                    <p className="text-sm font-medium" title={cor.nome}>{cor.nome}</p>
                    {codigoCor && <p className="text-lg font-bold text-primary">{codigoCor}</p>}
                  </div>

                  {/* Controles de quantidade */}
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => atualizarQuantidade(cor.id, -60)}
                      disabled={quantidade === 0}
                      className="p-2 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-bold text-center min-w-[60px]">
                      {quantidade > 0 ? `${quantidade}m` : '0m'}
                    </span>
                    <button
                      onClick={() => atualizarQuantidade(cor.id, 60)}
                      className="p-2 rounded border border-gray-300 hover:bg-gray-100"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50 flex-shrink-0">
          <div className="text-sm text-gray-600">
            {temSelecao ? (
              <span className="font-medium">
                {Object.values(selecoes).filter(q => q > 0).length} cor(es) selecionada(s) |{' '}
                {Object.values(selecoes).reduce((sum, q) => sum + q, 0)}m total
              </span>
            ) : (
              <span>Selecione pelo menos uma cor para adicionar ao carrinho</span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Fechar
            </button>
            <button
              onClick={handleAdicionarCarrinho}
              disabled={!temSelecao}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Adicionar ao Carrinho
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente CarrinhoItem
const CarrinhoItem = ({ item, onRemover, onAtualizarQuantidade, getColorImageUrl }) => {
  const subtotal = parseFloat(item.produto.precoAtacado) * item.quantidade;

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium">{item.produto.nome}</h4>
          <p className="text-sm text-gray-600">Código: {item.produto.codigo}</p>
          <div className="flex items-center gap-2 mt-2">
            {item.cor.arquivoImagem ? (
              <img
                src={getColorImageUrl(item.cor.arquivoImagem)}
                alt={item.cor.nome}
                className="w-8 h-8 rounded object-cover"
              />
            ) : (
              <div
                className="w-8 h-8 rounded"
                style={{ backgroundColor: item.cor.codigoHex || '#ccc' }}
              />
            )}
            <span className="text-sm">{item.cor.nome}</span>
          </div>
        </div>
        <button
          onClick={() => onRemover(item.produtoId, item.corId)}
          className="text-red-600 hover:text-red-800"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAtualizarQuantidade(item.produtoId, item.corId, -60)}
            className="p-1 rounded border hover:bg-gray-100"
            disabled={item.quantidade <= 60}
          >
            <Minus size={16} />
          </button>
          <span className="font-medium w-16 text-center">{item.quantidade}m</span>
          <button
            onClick={() => onAtualizarQuantidade(item.produtoId, item.corId, 60)}
            className="p-1 rounded border hover:bg-gray-100"
          >
            <Plus size={16} />
          </button>
        </div>
        <span className="font-bold">R$ {subtotal.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default LojaB2BPage;
