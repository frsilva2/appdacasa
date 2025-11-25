import { useState, useEffect } from 'react';
import { Plus, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import NovaCotacaoModal from './NovaCotacaoModal';
import DetalhesCotacaoModal from './DetalhesCotacaoModal';
import AprovarCotacaoModal from './AprovarCotacaoModal';

const CotacoesPage = () => {
  const { user } = useAuth();
  const [cotacoes, setCotacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [showNovaModal, setShowNovaModal] = useState(false);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [showAprovarModal, setShowAprovarModal] = useState(false);
  const [cotacaoSelecionada, setCotacaoSelecionada] = useState(null);

  const isUsuarioCD = user?.type === 'USUARIO_CD';
  const isAdmin = user?.type === 'ADMIN';

  useEffect(() => {
    carregarCotacoes();
  }, [filtroStatus]);

  const carregarCotacoes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filtroStatus) params.status = filtroStatus;

      const response = await api.get('/cotacoes', { params });
      setCotacoes(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar cotações:', error);
      alert('Erro ao carregar cotações');
    } finally {
      setLoading(false);
    }
  };

  const handleConcluirCotacao = async (cotacaoId) => {
    try {
      await api.post(`/cotacoes/${cotacaoId}/fechar`);
      alert('Cotação concluída com sucesso!');
      setShowDetalhesModal(false);
      setCotacaoSelecionada(null);
      carregarCotacoes();
    } catch (error) {
      console.error('Erro ao concluir cotação:', error);
      alert(error.response?.data?.message || 'Erro ao concluir cotação');
    }
  };

  const handleCancelarCotacao = async (cotacaoId) => {
    try {
      await api.delete(`/cotacoes/${cotacaoId}`);
      alert('Cotação cancelada com sucesso!');
      setShowDetalhesModal(false);
      setCotacaoSelecionada(null);
      carregarCotacoes();
    } catch (error) {
      console.error('Erro ao cancelar cotação:', error);
      alert(error.response?.data?.message || 'Erro ao cancelar cotação');
    }
  };

  const handleEditarCotacao = (cotacao) => {
    // TODO: Implementar edição de cotação
    alert('Funcionalidade de edição será implementada em breve');
    setShowDetalhesModal(false);
  };

  const getStatusBadge = (status) => {
    const badges = {
      ABERTA: { label: 'Aberta', class: 'bg-blue-100 text-blue-800', icon: Clock },
      FECHADA: { label: 'Fechada', class: 'bg-gray-100 text-gray-800', icon: XCircle },
      APROVADA: { label: 'Aprovada', class: 'bg-green-100 text-green-800', icon: CheckCircle },
    };

    const badge = badges[status] || badges.ABERTA;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${badge.class}`}>
        <Icon size={16} />
        {badge.label}
      </span>
    );
  };

  const handleVerDetalhes = async (cotacao) => {
    try {
      // Buscar detalhes completos da cotação (com tokens e respostas)
      const response = await api.get(`/cotacoes/${cotacao.id}`);
      setCotacaoSelecionada(response.data.data);
      setShowDetalhesModal(true);
    } catch (error) {
      console.error('Erro ao carregar detalhes da cotação:', error);
      alert('Erro ao carregar detalhes da cotação');
    }
  };

  const handleAprovar = (cotacao) => {
    setCotacaoSelecionada(cotacao);
    setShowAprovarModal(true);
  };

  const handleFechar = async (cotacao) => {
    if (!confirm('Tem certeza que deseja fechar esta cotação?')) return;

    try {
      await api.post(`/cotacoes/${cotacao.id}/fechar`);
      alert('Cotação fechada com sucesso!');
      carregarCotacoes();
    } catch (error) {
      console.error('Erro ao fechar cotação:', error);
      alert(error.response?.data?.message || 'Erro ao fechar cotação');
    }
  };

  const calcularRespostasFornecedores = (cotacao) => {
    if (!cotacao.respostas || cotacao.respostas.length === 0) {
      return 0;
    }
    const fornecedoresUnicos = new Set();
    cotacao.respostas.forEach(resposta => {
      fornecedoresUnicos.add(resposta.fornecedor.id);
    });
    return fornecedoresUnicos.size;
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Requisições de Cotação</h1>
        {(isUsuarioCD || isAdmin) && (
          <button
            onClick={() => setShowNovaModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Nova Cotação
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por Status
            </label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="input"
            >
              <option value="">Todos</option>
              <option value="ABERTA">Aberta</option>
              <option value="FECHADA">Fechada</option>
              <option value="APROVADA">Aprovada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Cotações */}
      <div className="grid grid-cols-1 gap-6">
        {cotacoes.length === 0 ? (
          <div className="card text-center py-12">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">
              {isUsuarioCD || isAdmin
                ? 'Nenhuma cotação encontrada. Crie sua primeira cotação!'
                : 'Nenhuma cotação encontrada.'}
            </p>
          </div>
        ) : (
          cotacoes.map((cotacao) => {
            const totalRespostas = calcularRespostasFornecedores(cotacao);
            const prazoExpirado = new Date(cotacao.prazoExpiracao) < new Date();

            return (
              <div key={cotacao.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {cotacao.numero}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Solicitante: {cotacao.criador.name}
                    </p>
                  </div>
                  {getStatusBadge(cotacao.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-600">Data:</span>
                    <p className="font-medium">
                      {new Date(cotacao.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Prazo:</span>
                    <p className={`font-medium ${prazoExpirado ? 'text-red-600' : ''}`}>
                      {new Date(cotacao.prazoExpiracao).toLocaleDateString('pt-BR')}
                      {prazoExpirado && ' (Expirado)'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Itens:</span>
                    <p className="font-medium">{cotacao.items.length} produto(s)</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Respostas:</span>
                    <p className="font-medium">{totalRespostas} fornecedor(es)</p>
                  </div>
                </div>

                {cotacao.observacoes && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Observações:</span>
                    <p className="text-sm mt-1">{cotacao.observacoes}</p>
                  </div>
                )}

                {/* Produtos */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Produtos:</h4>
                  <div className="space-y-2">
                    {cotacao.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-6 h-6 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: item.cor.codigoHex }}
                          />
                          <span className="font-medium">{item.produto.nome}</span>
                          <span className="text-gray-600">- {item.cor.nome}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{item.quantidadeSolicitada}m</div>
                        </div>
                      </div>
                    ))}
                    {cotacao.items.length > 3 && (
                      <p className="text-sm text-gray-600 text-center">
                        + {cotacao.items.length - 3} produto(s)
                      </p>
                    )}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <button
                    onClick={() => handleVerDetalhes(cotacao)}
                    className="btn-secondary text-sm"
                  >
                    <FileText size={16} />
                    Ver Detalhes
                  </button>

                  {(isUsuarioCD || isAdmin) && cotacao.status === 'ABERTA' && totalRespostas > 0 && (
                    <button
                      onClick={() => handleFechar(cotacao)}
                      className="btn-secondary text-sm"
                    >
                      <XCircle size={16} />
                      Fechar Cotação
                    </button>
                  )}

                  {(isUsuarioCD || isAdmin) && cotacao.status === 'FECHADA' && totalRespostas > 0 && (
                    <button
                      onClick={() => handleAprovar(cotacao)}
                      className="btn-success text-sm"
                    >
                      <CheckCircle size={16} />
                      Aprovar Fornecedor
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      {showNovaModal && (
        <NovaCotacaoModal
          onClose={() => setShowNovaModal(false)}
          onSuccess={() => {
            setShowNovaModal(false);
            carregarCotacoes();
          }}
        />
      )}

      {showDetalhesModal && cotacaoSelecionada && (
        <DetalhesCotacaoModal
          cotacao={cotacaoSelecionada}
          onClose={() => {
            setShowDetalhesModal(false);
            setCotacaoSelecionada(null);
          }}
          onConcluir={handleConcluirCotacao}
          onCancelar={handleCancelarCotacao}
          onEditar={handleEditarCotacao}
        />
      )}

      {showAprovarModal && cotacaoSelecionada && (
        <AprovarCotacaoModal
          cotacao={cotacaoSelecionada}
          onClose={() => {
            setShowAprovarModal(false);
            setCotacaoSelecionada(null);
          }}
          onSuccess={() => {
            setShowAprovarModal(false);
            setCotacaoSelecionada(null);
            carregarCotacoes();
          }}
        />
      )}
    </Layout>
  );
};

export default CotacoesPage;
