import { useState, useEffect } from 'react';
import { Plus, Package, FileText, CheckCircle, Clock, XCircle, Camera } from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import NovoInventarioModal from './NovoInventarioModal';
import DetalhesInventarioModal from './DetalhesInventarioModal';
import AdicionarItemModal from './AdicionarItemModal';
import DEPARAModal from './DEPARAModal';

const InventarioPage = () => {
  const { user } = useAuth();
  const [inventarios, setInventarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [showNovoModal, setShowNovoModal] = useState(false);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [showAdicionarModal, setShowAdicionarModal] = useState(false);
  const [showDEPARAModal, setShowDEPARAModal] = useState(false);
  const [inventarioSelecionado, setInventarioSelecionado] = useState(null);

  const isAdmin = user?.type === 'ADMIN';
  const isUsuarioCD = user?.type === 'USUARIO_CD';
  const podeGerenciar = isAdmin || isUsuarioCD;

  useEffect(() => {
    carregarInventarios();
  }, [filtroStatus]);

  const carregarInventarios = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filtroStatus) params.status = filtroStatus;

      const response = await api.get('/inventario', { params });
      setInventarios(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar inventários:', error);
      alert('Erro ao carregar inventários');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      EM_ANDAMENTO: { label: 'Em Andamento', class: 'bg-blue-100 text-blue-800', icon: Clock },
      FINALIZADO: { label: 'Finalizado', class: 'bg-green-100 text-green-800', icon: CheckCircle },
      CANCELADO: { label: 'Cancelado', class: 'bg-gray-100 text-gray-800', icon: XCircle },
    };

    const badge = badges[status] || badges.EM_ANDAMENTO;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${badge.class}`}>
        <Icon size={16} />
        {badge.label}
      </span>
    );
  };

  const getTipoBadge = (tipo) => {
    const badges = {
      CONFERENCIA: { label: 'Conferência', class: 'bg-purple-100 text-purple-800' },
      INVENTARIO: { label: 'Inventário', class: 'bg-orange-100 text-orange-800' },
    };
    const badge = badges[tipo] || badges.CONFERENCIA;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${badge.class}`}>
        {badge.label}
      </span>
    );
  };

  const handleVerDetalhes = (inventario) => {
    setInventarioSelecionado(inventario);
    setShowDetalhesModal(true);
  };

  const handleAdicionarItem = (inventario) => {
    setInventarioSelecionado(inventario);
    setShowAdicionarModal(true);
  };

  const handleFinalizar = async (inventario) => {
    if (!confirm('Tem certeza que deseja finalizar este inventário? O estoque será atualizado com as contagens realizadas.')) {
      return;
    }

    try {
      await api.post(`/inventario/${inventario.id}/finalizar`);
      alert('Inventário finalizado e estoque atualizado com sucesso!');
      carregarInventarios();
    } catch (error) {
      console.error('Erro ao finalizar inventário:', error);
      alert(error.response?.data?.message || 'Erro ao finalizar inventário');
    }
  };

  const handleCancelar = async (inventario) => {
    const motivo = prompt('Digite o motivo do cancelamento:');
    if (!motivo) return;

    try {
      await api.post(`/inventario/${inventario.id}/cancelar`, { motivo });
      alert('Inventário cancelado com sucesso!');
      carregarInventarios();
    } catch (error) {
      console.error('Erro ao cancelar inventário:', error);
      alert(error.response?.data?.message || 'Erro ao cancelar inventário');
    }
  };

  const calcularDivergencias = (items) => {
    return items.filter(item => parseFloat(item.divergencia) !== 0).length;
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
        <h1 className="page-title">Inventário / Almoxarifado</h1>
        <div className="flex gap-2">
          {podeGerenciar && (
            <>
              <button
                onClick={() => setShowDEPARAModal(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <FileText size={20} />
                DEPARA
              </button>
              <button
                onClick={() => setShowNovoModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={20} />
                Novo Inventário
              </button>
            </>
          )}
        </div>
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
              <option value="EM_ANDAMENTO">Em Andamento</option>
              <option value="FINALIZADO">Finalizado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Inventários */}
      <div className="grid grid-cols-1 gap-6">
        {inventarios.length === 0 ? (
          <div className="card text-center py-12">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">
              {podeGerenciar
                ? 'Nenhum inventário encontrado. Crie seu primeiro inventário!'
                : 'Nenhum inventário encontrado.'}
            </p>
          </div>
        ) : (
          inventarios.map((inventario) => {
            const divergencias = calcularDivergencias(inventario.items);
            const totalItens = inventario.items.length;

            return (
              <div key={inventario.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {inventario.numero}
                      </h3>
                      {getTipoBadge(inventario.tipo)}
                    </div>
                    <p className="text-sm text-gray-600">
                      Responsável: {inventario.responsavel.name}
                    </p>
                  </div>
                  {getStatusBadge(inventario.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-600">Data de Criação:</span>
                    <p className="font-medium">
                      {new Date(inventario.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div>
                    <span className="text-gray-600">Itens Contados:</span>
                    <p className="font-medium">{totalItens}</p>
                  </div>

                  <div>
                    <span className="text-gray-600">Divergências:</span>
                    <p className={`font-medium ${divergencias > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                      {divergencias}
                    </p>
                  </div>

                  {inventario.dataFinalizacao && (
                    <div>
                      <span className="text-gray-600">Finalizado em:</span>
                      <p className="font-medium">
                        {new Date(inventario.dataFinalizacao).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}
                </div>

                {inventario.observacoes && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Observações:</span>
                    <p className="text-sm mt-1">{inventario.observacoes}</p>
                  </div>
                )}

                {/* Resumo de Divergências */}
                {divergencias > 0 && inventario.status === 'EM_ANDAMENTO' && (
                  <div className="mb-4 p-3 bg-orange-50 border-l-4 border-orange-400 rounded">
                    <p className="text-sm font-semibold text-gray-900">
                      ⚠️ {divergencias} item(ns) com divergência
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Verifique os itens antes de finalizar
                    </p>
                  </div>
                )}

                {/* Ações */}
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <button
                    onClick={() => handleVerDetalhes(inventario)}
                    className="btn-secondary text-sm"
                  >
                    <FileText size={16} />
                    Ver Detalhes
                  </button>

                  {podeGerenciar && inventario.status === 'EM_ANDAMENTO' && (
                    <>
                      <button
                        onClick={() => handleAdicionarItem(inventario)}
                        className="btn-secondary text-sm"
                      >
                        <Camera size={16} />
                        Adicionar Item
                      </button>

                      <button
                        onClick={() => handleFinalizar(inventario)}
                        className="btn-success text-sm"
                        disabled={totalItens === 0}
                      >
                        <CheckCircle size={16} />
                        Finalizar
                      </button>

                      <button
                        onClick={() => handleCancelar(inventario)}
                        className="btn-secondary text-sm text-red-600"
                      >
                        <XCircle size={16} />
                        Cancelar
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      {showNovoModal && (
        <NovoInventarioModal
          onClose={() => setShowNovoModal(false)}
          onSuccess={() => {
            setShowNovoModal(false);
            carregarInventarios();
          }}
        />
      )}

      {showDetalhesModal && inventarioSelecionado && (
        <DetalhesInventarioModal
          inventario={inventarioSelecionado}
          onClose={() => {
            setShowDetalhesModal(false);
            setInventarioSelecionado(null);
          }}
          onReload={carregarInventarios}
        />
      )}

      {showAdicionarModal && inventarioSelecionado && (
        <AdicionarItemModal
          inventario={inventarioSelecionado}
          onClose={() => {
            setShowAdicionarModal(false);
            setInventarioSelecionado(null);
          }}
          onSuccess={() => {
            setShowAdicionarModal(false);
            setInventarioSelecionado(null);
            carregarInventarios();
          }}
        />
      )}

      {showDEPARAModal && (
        <DEPARAModal
          onClose={() => setShowDEPARAModal(false)}
        />
      )}
    </Layout>
  );
};

export default InventarioPage;
