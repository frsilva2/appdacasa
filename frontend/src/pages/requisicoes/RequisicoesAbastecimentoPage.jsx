import { useState, useEffect } from 'react';
import { Plus, FileText, Check, X, Truck, Clock, AlertCircle, Package } from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import NovaRequisicaoModal from './NovaRequisicaoModal';
import AprovarRequisicaoModal from './AprovarRequisicaoModal';
import AtenderRequisicaoModal from './AtenderRequisicaoModal';
import DetalhesRequisicaoModal from './DetalhesRequisicaoModal';

const RequisicoesAbastecimentoPage = () => {
  const { user } = useAuth();
  const [requisicoes, setRequisicoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [showNovaModal, setShowNovaModal] = useState(false);
  const [showAprovarModal, setShowAprovarModal] = useState(false);
  const [showAtenderModal, setShowAtenderModal] = useState(false);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [requisicaoSelecionada, setRequisicaoSelecionada] = useState(null);

  const isGerenteLoja = user?.type === 'GERENTE_LOJA';
  const isUsuarioCD = user?.type === 'USUARIO_CD';
  const isAdmin = user?.type === 'ADMIN';

  useEffect(() => {
    carregarRequisicoes();
  }, [filtroStatus]);

  const carregarRequisicoes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filtroStatus) params.status = filtroStatus;

      const response = await api.get('/requisicoes-abastecimento', { params });
      setRequisicoes(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar requisições:', error);
      alert('Erro ao carregar requisições');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDENTE: { label: 'Pendente', class: 'bg-yellow-100 text-yellow-800', icon: Clock },
      APROVADA: { label: 'Aprovada', class: 'bg-green-100 text-green-800', icon: Check },
      APROVADA_PARCIAL: { label: 'Aprovada Parcial', class: 'bg-blue-100 text-blue-800', icon: AlertCircle },
      RECUSADA: { label: 'Recusada', class: 'bg-red-100 text-red-800', icon: X },
      ATENDIDA_PARCIAL: { label: 'Atendida Parcial', class: 'bg-purple-100 text-purple-800', icon: Package },
      ATENDIDA: { label: 'Atendida', class: 'bg-indigo-100 text-indigo-800', icon: Package },
      ENVIADA: { label: 'Enviada', class: 'bg-gray-100 text-gray-800', icon: Truck },
    };

    const badge = badges[status] || badges.PENDENTE;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${badge.class}`}>
        <Icon size={16} />
        {badge.label}
      </span>
    );
  };

  const getPrioridadeBadge = (prioridade) => {
    const cores = {
      1: 'bg-red-500',
      2: 'bg-orange-500',
      3: 'bg-yellow-500',
      4: 'bg-blue-500',
      5: 'bg-gray-500',
    };

    return (
      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm ${cores[prioridade]}`}>
        {prioridade}
      </span>
    );
  };

  const handleAprovar = (requisicao) => {
    setRequisicaoSelecionada(requisicao);
    setShowAprovarModal(true);
  };

  const handleAtender = (requisicao) => {
    setRequisicaoSelecionada(requisicao);
    setShowAtenderModal(true);
  };

  const handleVerDetalhes = (requisicao) => {
    setRequisicaoSelecionada(requisicao);
    setShowDetalhesModal(true);
  };

  const handleEnviar = async (requisicao) => {
    if (!confirm('Confirma que a requisição foi enviada para a loja?')) return;

    try {
      await api.post(`/requisicoes-abastecimento/${requisicao.id}/enviar`);
      alert('Requisição marcada como enviada!');
      carregarRequisicoes();
    } catch (error) {
      console.error('Erro ao marcar como enviada:', error);
      alert('Erro ao atualizar requisição');
    }
  };

  const handleExcluir = async (requisicao) => {
    if (!confirm('Tem certeza que deseja excluir esta requisição?')) return;

    try {
      await api.delete(`/requisicoes-abastecimento/${requisicao.id}`);
      alert('Requisição excluída com sucesso!');
      carregarRequisicoes();
    } catch (error) {
      console.error('Erro ao excluir requisição:', error);
      alert(error.response?.data?.message || 'Erro ao excluir requisição');
    }
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
        <h1 className="page-title">Requisições de Abastecimento</h1>
        {isGerenteLoja && (
          <button
            onClick={() => setShowNovaModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Nova Requisição
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
              <option value="PENDENTE">Pendente</option>
              <option value="APROVADA">Aprovada</option>
              <option value="APROVADA_PARCIAL">Aprovada Parcial</option>
              <option value="RECUSADA">Recusada</option>
              <option value="ATENDIDA_PARCIAL">Atendida Parcial</option>
              <option value="ATENDIDA">Atendida</option>
              <option value="ENVIADA">Enviada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Requisições */}
      <div className="grid grid-cols-1 gap-6">
        {requisicoes.length === 0 ? (
          <div className="card text-center py-12">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">
              {isGerenteLoja
                ? 'Nenhuma requisição encontrada. Crie sua primeira requisição!'
                : 'Nenhuma requisição encontrada.'}
            </p>
          </div>
        ) : (
          requisicoes.map((requisicao) => (
            <div key={requisicao.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  {getPrioridadeBadge(requisicao.loja.prioridade)}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {requisicao.numero}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {requisicao.loja.nome}
                    </p>
                  </div>
                </div>
                {getStatusBadge(requisicao.status)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-600">Solicitante:</span>
                  <p className="font-medium">{requisicao.solicitante.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Data:</span>
                  <p className="font-medium">
                    {new Date(requisicao.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Itens:</span>
                  <p className="font-medium">{requisicao.items.length} produto(s)</p>
                </div>
              </div>

              {requisicao.observacoes && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Observações:</span>
                  <p className="text-sm mt-1">{requisicao.observacoes}</p>
                </div>
              )}

              {requisicao.justificativaRecusa && (
                <div className="mb-4 p-3 bg-red-50 rounded-lg">
                  <span className="text-sm text-red-600 font-medium">Justificativa da Recusa:</span>
                  <p className="text-sm mt-1 text-red-800">{requisicao.justificativaRecusa}</p>
                </div>
              )}

              {/* Produtos */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Produtos:</h4>
                <div className="space-y-2">
                  {requisicao.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-6 h-6 rounded-full border-2 border-gray-300"
                          style={{ backgroundColor: item.cor.codigoHex }}
                        />
                        <span className="font-medium">{item.produto.nome}</span>
                        <span className="text-gray-600">- {item.cor.nome}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          item.produto.curva === 'A' ? 'bg-green-100 text-green-800' :
                          item.produto.curva === 'B' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          Curva {item.produto.curva}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{item.quantidadeSolicitada}m</div>
                        {item.quantidadeAprovada !== null && (
                          <div className="text-xs text-green-600">
                            Aprovado: {item.quantidadeAprovada}m
                          </div>
                        )}
                        {item.quantidadeAtendida !== null && (
                          <div className="text-xs text-blue-600">
                            Atendido: {item.quantidadeAtendida}m
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {requisicao.items.length > 3 && (
                    <p className="text-sm text-gray-600 text-center">
                      + {requisicao.items.length - 3} produto(s)
                    </p>
                  )}
                </div>
              </div>

              {/* Ações */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <button
                  onClick={() => handleVerDetalhes(requisicao)}
                  className="btn-secondary text-sm"
                >
                  <FileText size={16} />
                  Ver Detalhes
                </button>

                {isUsuarioCD && requisicao.status === 'PENDENTE' && (
                  <button
                    onClick={() => handleAprovar(requisicao)}
                    className="btn-primary text-sm"
                  >
                    <Check size={16} />
                    Aprovar/Recusar
                  </button>
                )}

                {isUsuarioCD && ['APROVADA', 'APROVADA_PARCIAL', 'ATENDIDA_PARCIAL'].includes(requisicao.status) && (
                  <button
                    onClick={() => handleAtender(requisicao)}
                    className="btn-primary text-sm"
                  >
                    <Package size={16} />
                    Atender
                  </button>
                )}

                {isUsuarioCD && ['ATENDIDA', 'ATENDIDA_PARCIAL'].includes(requisicao.status) && (
                  <button
                    onClick={() => handleEnviar(requisicao)}
                    className="btn-success text-sm"
                  >
                    <Truck size={16} />
                    Marcar como Enviada
                  </button>
                )}

                {(isGerenteLoja || isAdmin) && requisicao.status === 'PENDENTE' && (
                  <button
                    onClick={() => handleExcluir(requisicao)}
                    className="btn-danger text-sm"
                  >
                    <X size={16} />
                    Excluir
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {showNovaModal && (
        <NovaRequisicaoModal
          onClose={() => setShowNovaModal(false)}
          onSuccess={() => {
            setShowNovaModal(false);
            carregarRequisicoes();
          }}
        />
      )}

      {showAprovarModal && requisicaoSelecionada && (
        <AprovarRequisicaoModal
          requisicao={requisicaoSelecionada}
          onClose={() => {
            setShowAprovarModal(false);
            setRequisicaoSelecionada(null);
          }}
          onSuccess={() => {
            setShowAprovarModal(false);
            setRequisicaoSelecionada(null);
            carregarRequisicoes();
          }}
        />
      )}

      {showAtenderModal && requisicaoSelecionada && (
        <AtenderRequisicaoModal
          requisicao={requisicaoSelecionada}
          onClose={() => {
            setShowAtenderModal(false);
            setRequisicaoSelecionada(null);
          }}
          onSuccess={() => {
            setShowAtenderModal(false);
            setRequisicaoSelecionada(null);
            carregarRequisicoes();
          }}
        />
      )}

      {showDetalhesModal && requisicaoSelecionada && (
        <DetalhesRequisicaoModal
          requisicao={requisicaoSelecionada}
          onClose={() => {
            setShowDetalhesModal(false);
            setRequisicaoSelecionada(null);
          }}
        />
      )}
    </Layout>
  );
};

export default RequisicoesAbastecimentoPage;
