import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Package, Tag, Palette } from 'lucide-react';
import Layout from '../../components/Layout';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import CriarEditarProdutoModal from './CriarEditarProdutoModal';
import GerenciarCoresModal from './GerenciarCoresModal';

const ProdutosPage = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [curvaFilter, setCurvaFilter] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('');

  // Modals
  const [showCriarEditarModal, setShowCriarEditarModal] = useState(false);
  const [showGerenciarCoresModal, setShowGerenciarCoresModal] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    try {
      setLoading(true);
      const params = {};
      if (curvaFilter) params.curva = curvaFilter;
      if (categoriaFilter) params.categoria = categoriaFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await api.get('/produtos', { params });
      setProdutos(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      alert('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    carregarProdutos();
  };

  const handleNovoProduto = () => {
    setProdutoSelecionado(null);
    setShowCriarEditarModal(true);
  };

  const handleEditarProduto = (produto) => {
    setProdutoSelecionado(produto);
    setShowCriarEditarModal(true);
  };

  const handleGerenciarCores = (produto) => {
    setProdutoSelecionado(produto);
    setShowGerenciarCoresModal(true);
  };

  const handleDeletarProduto = async (produto) => {
    if (!confirm(`Tem certeza que deseja excluir o produto "${produto.nome}"?`)) {
      return;
    }

    try {
      await api.delete(`/produtos/${produto.id}`);
      alert('Produto excluído com sucesso!');
      carregarProdutos();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      alert(error.response?.data?.message || 'Erro ao excluir produto');
    }
  };

  const getCurvaBadge = (curva) => {
    const colors = {
      A: 'bg-green-100 text-green-800',
      B: 'bg-blue-100 text-blue-800',
      C: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colors[curva]}`}>
        Curva {curva}
      </span>
    );
  };

  const filteredProdutos = produtos.filter(p =>
    !searchTerm ||
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Package className="w-8 h-8 text-primary" />
              Gerenciar Produtos
            </h1>
            <p className="text-gray-600 mt-2">
              {produtos.length} produtos cadastrados
            </p>
          </div>

          <button
            onClick={handleNovoProduto}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Novo Produto
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="input pl-10"
                  placeholder="Código ou nome do produto..."
                />
              </div>
            </div>

            {/* Curva Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Curva ABC
              </label>
              <select
                value={curvaFilter}
                onChange={(e) => { setCurvaFilter(e.target.value); }}
                className="input"
              >
                <option value="">Todas</option>
                <option value="A">Curva A</option>
                <option value="B">Curva B</option>
                <option value="C">Curva C</option>
              </select>
            </div>

            {/* Categoria Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select
                value={categoriaFilter}
                onChange={(e) => { setCategoriaFilter(e.target.value); }}
                className="input"
              >
                <option value="">Todas</option>
                <option value="Tecidos">Tecidos</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button onClick={handleSearch} className="btn-primary">
              Buscar
            </button>
            <button
              onClick={() => {
                setSearchTerm('');
                setCurvaFilter('');
                setCategoriaFilter('');
              }}
              className="btn-secondary"
            >
              Limpar Filtros
            </button>
          </div>
        </div>

        {/* Products Table */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Curva
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cores
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Preço Atacado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Preço Varejo
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProdutos.map((produto) => (
                    <tr key={produto.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{produto.codigo}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{produto.nome}</div>
                        {produto.larguraMetros && (
                          <div className="text-xs text-gray-500">Largura: {produto.larguraMetros}m</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{produto.categoria}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getCurvaBadge(produto.curva)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleGerenciarCores(produto)}
                          className="flex items-center gap-2 hover:text-primary transition-colors"
                        >
                          <Palette size={16} className="text-gray-400" />
                          <span className="text-sm text-gray-900 font-medium">
                            {produto.cores?.length || 0} cores
                          </span>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          R$ {Number(produto.precoAtacado).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          R$ {Number(produto.precoVarejo).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditarProduto(produto)}
                          className="text-primary hover:text-primary-dark mr-3"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeletarProduto(produto)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredProdutos.length === 0 && (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum produto encontrado</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || curvaFilter || categoriaFilter
                    ? 'Tente ajustar os filtros'
                    : 'Comece criando um novo produto'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">Curva A</h3>
            <p className="text-2xl font-bold text-green-700">
              {produtos.filter(p => p.curva === 'A').length}
            </p>
            <p className="text-sm text-green-600">produtos</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Curva B</h3>
            <p className="text-2xl font-bold text-blue-700">
              {produtos.filter(p => p.curva === 'B').length}
            </p>
            <p className="text-sm text-blue-600">produtos</p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Curva C</h3>
            <p className="text-2xl font-bold text-gray-700">
              {produtos.filter(p => p.curva === 'C').length}
            </p>
            <p className="text-sm text-gray-600">produtos</p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2">Total de Cores</h3>
            <p className="text-2xl font-bold text-purple-700">
              {produtos.reduce((sum, p) => sum + (p.cores?.length || 0), 0)}
            </p>
            <p className="text-sm text-purple-600">cores cadastradas</p>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCriarEditarModal && (
        <CriarEditarProdutoModal
          produto={produtoSelecionado}
          onClose={() => {
            setShowCriarEditarModal(false);
            setProdutoSelecionado(null);
          }}
          onSuccess={() => {
            setShowCriarEditarModal(false);
            setProdutoSelecionado(null);
            carregarProdutos();
          }}
        />
      )}

      {showGerenciarCoresModal && produtoSelecionado && (
        <GerenciarCoresModal
          produto={produtoSelecionado}
          onClose={() => {
            setShowGerenciarCoresModal(false);
            setProdutoSelecionado(null);
          }}
          onSuccess={() => {
            carregarProdutos();
          }}
        />
      )}
    </Layout>
  );
};

export default ProdutosPage;
