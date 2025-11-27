import { useState, useEffect } from 'react';
import { X, Plus, Search } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const DEPARAModal = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [mapeamentos, setMapeamentos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNovo, setShowNovo] = useState(false);
  const [novoMapeamento, setNovoMapeamento] = useState({
    codigoOrigem: '',
    descricaoOrigem: '',
    produtoId: '',
    corId: '',
    observacoes: '',
  });

  useEffect(() => {
    carregarMapeamentos();
    carregarProdutos();
  }, []);

  const carregarMapeamentos = async () => {
    try {
      const response = await api.get('/inventario/depara/mapeamentos');
      setMapeamentos(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar DEPARA:', error);
    }
  };

  const carregarProdutos = async () => {
    try {
      const response = await api.get('/produtos');
      setProdutos(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!novoMapeamento.codigoOrigem || !novoMapeamento.produtoId) {
      alert('Preencha código de origem e produto');
      return;
    }

    try {
      setLoading(true);
      await api.post('/inventario/depara/mapeamentos', novoMapeamento);
      alert('Mapeamento criado com sucesso!');
      setShowNovo(false);
      setNovoMapeamento({ codigoOrigem: '', descricaoOrigem: '', produtoId: '', corId: '', observacoes: '' });
      carregarMapeamentos();
    } catch (error) {
      console.error('Erro ao criar DEPARA:', error);
      alert(error.response?.data?.message || 'Erro ao criar mapeamento');
    } finally {
      setLoading(false);
    }
  };

  const mapeamentosFiltrados = mapeamentos.filter(m =>
    m.codigoOrigem.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.descricaoOrigem || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const produtoSelecionado = produtos.find(p => p.id === novoMapeamento.produtoId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
          <div>
            <h2 className="text-2xl font-bold">Sistema DEPARA</h2>
            <p className="text-purple-100">Mapeamento de Códigos</p>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200 bg-white bg-opacity-20 rounded-full p-2">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!showNovo ? (
            <>
              <div className="flex gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10"
                    placeholder="Buscar por código ou descrição..."
                  />
                </div>
                <button onClick={() => setShowNovo(true)} className="btn-primary flex items-center gap-2">
                  <Plus size={20} />
                  Novo
                </button>
              </div>

              <div className="space-y-3">
                {mapeamentosFiltrados.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>Nenhum mapeamento encontrado</p>
                  </div>
                ) : (
                  mapeamentosFiltrados.map(m => (
                    <div key={m.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-lg font-bold text-blue-600">{m.codigoOrigem}</span>
                            <span className="text-gray-400">→</span>
                            <span className="text-lg font-bold text-gray-900">{m.produto.nome}</span>
                            {m.cor && (
                              <>
                                <span className="text-gray-400">-</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 rounded-full border" style={{ backgroundColor: m.cor.codigoHex }} />
                                  <span className="text-sm">{m.cor.nome}</span>
                                </div>
                              </>
                            )}
                          </div>
                          {m.descricaoOrigem && (
                            <p className="text-sm text-gray-600 mb-2">Descrição: {m.descricaoOrigem}</p>
                          )}
                          {m.observacoes && (
                            <p className="text-xs text-gray-500">Obs: {m.observacoes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código de Origem *
                  </label>
                  <input
                    type="text"
                    value={novoMapeamento.codigoOrigem}
                    onChange={(e) => setNovoMapeamento({ ...novoMapeamento, codigoOrigem: e.target.value })}
                    className="input"
                    placeholder="COD123"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição de Origem
                  </label>
                  <input
                    type="text"
                    value={novoMapeamento.descricaoOrigem}
                    onChange={(e) => setNovoMapeamento({ ...novoMapeamento, descricaoOrigem: e.target.value })}
                    className="input"
                    placeholder="Descrição do fornecedor"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Produto de Destino *
                </label>
                <select
                  value={novoMapeamento.produtoId}
                  onChange={(e) => setNovoMapeamento({ ...novoMapeamento, produtoId: e.target.value, corId: '' })}
                  className="input"
                  required
                >
                  <option value="">Selecione...</option>
                  {produtos.map(p => (
                    <option key={p.id} value={p.id}>{p.codigo} - {p.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor (Opcional)
                </label>
                <select
                  value={novoMapeamento.corId}
                  onChange={(e) => setNovoMapeamento({ ...novoMapeamento, corId: e.target.value })}
                  className="input"
                  disabled={!novoMapeamento.produtoId}
                >
                  <option value="">Selecione...</option>
                  {(produtoSelecionado?.cores || []).map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  value={novoMapeamento.observacoes}
                  onChange={(e) => setNovoMapeamento({ ...novoMapeamento, observacoes: e.target.value })}
                  className="input min-h-[60px]"
                  placeholder="Informações adicionais..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNovo(false)}
                  className="btn-secondary flex-1"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary flex-1" disabled={loading}>
                  {loading ? <LoadingSpinner /> : 'Criar Mapeamento'}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="p-6 border-t">
          <button onClick={onClose} className="btn-secondary w-full">Fechar</button>
        </div>
      </div>
    </div>
  );
};

export default DEPARAModal;
