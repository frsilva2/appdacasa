import { useState, useEffect } from 'react';
import { Plus, ShoppingCart, Clock, CheckCircle, XCircle, Package, Truck, AlertCircle } from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import NovoPedidoModal from './NovoPedidoModal';
import DetalhesPedidoModal from './DetalhesPedidoModal';
import GerenciarPedidoModal from './GerenciarPedidoModal';

const PedidosB2BPage = () => {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [showNovoModal, setShowNovoModal] = useState(false);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [showGerenciarModal, setShowGerenciarModal] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);

  const isClienteB2B = user?.type === 'CLIENTE_B2B';
  const isAdmin = user?.type === 'ADMIN';
  const isOperador = user?.type === 'OPERADOR';
  const podeGerenciar = isAdmin || isOperador;

  useEffect(() => {
    carregarPedidos();
  }, [filtroStatus]);

  const carregarPedidos = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filtroStatus) params.status = filtroStatus;

      const response = await api.get('/pedidos-b2b', { params });
      setPedidos(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      alert('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDENTE: { label: 'Pendente', class: 'bg-yellow-100 text-yellow-800', icon: Clock },
      APROVADA: { label: 'Aprovada', class: 'bg-green-100 text-green-800', icon: CheckCircle },
      RECUSADA: { label: 'Recusada', class: 'bg-red-100 text-red-800', icon: XCircle },
      EM_SEPARACAO: { label: 'Em Separação', class: 'bg-blue-100 text-blue-800', icon: Package },
      ENVIADA: { label: 'Enviada', class: 'bg-purple-100 text-purple-800', icon: Truck },
      ENTREGUE: { label: 'Entregue', class: 'bg-teal-100 text-teal-800', icon: CheckCircle },
      CANCELADA: { label: 'Cancelada', class: 'bg-gray-100 text-gray-800', icon: XCircle },
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

  const handleVerDetalhes = (pedido) => {
    setPedidoSelecionado(pedido);
    setShowDetalhesModal(true);
  };

  const handleGerenciar = (pedido) => {
    setPedidoSelecionado(pedido);
    setShowGerenciarModal(true);
  };

  const handleCancelar = async (pedido) => {
    const motivo = prompt('Digite o motivo do cancelamento:');
    if (!motivo) return;

    try {
      await api.post(`/pedidos-b2b/${pedido.id}/cancelar`, {
        motivoCancelamento: motivo,
      });
      alert('Pedido cancelado com sucesso!');
      carregarPedidos();
    } catch (error) {
      console.error('Erro ao cancelar pedido:', error);
      alert(error.response?.data?.message || 'Erro ao cancelar pedido');
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
        <h1 className="page-title">Pedidos B2B</h1>
        {isClienteB2B && (
          <button
            onClick={() => setShowNovoModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Novo Pedido
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
              <option value="RECUSADA">Recusada</option>
              <option value="EM_SEPARACAO">Em Separação</option>
              <option value="ENVIADA">Enviada</option>
              <option value="ENTREGUE">Entregue</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Informações Importantes (para clientes B2B) */}
      {isClienteB2B && (
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
          <h3 className="font-bold text-gray-900 mb-2">Informações Importantes:</h3>
          <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
            <li>Pedido mínimo: R$ 500,00</li>
            <li>Quantidade por cor: múltiplos de 60 metros</li>
            <li>Prazo de entrega: 15 dias corridos após aprovação</li>
            <li>Formas de pagamento: 4x no cartão, PIX ou dinheiro</li>
          </ul>
        </div>
      )}

      {/* Lista de Pedidos */}
      <div className="grid grid-cols-1 gap-6">
        {pedidos.length === 0 ? (
          <div className="card text-center py-12">
            <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">
              {isClienteB2B
                ? 'Nenhum pedido encontrado. Crie seu primeiro pedido!'
                : 'Nenhum pedido encontrado.'}
            </p>
          </div>
        ) : (
          pedidos.map((pedido) => {
            const prazoProximo = pedido.dataPrevisaoEntrega &&
              new Date(pedido.dataPrevisaoEntrega) - new Date() < 3 * 24 * 60 * 60 * 1000;

            return (
              <div key={pedido.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {pedido.numero}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Cliente: {pedido.cliente.name}
                    </p>
                  </div>
                  {getStatusBadge(pedido.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-600">Data do Pedido:</span>
                    <p className="font-medium">
                      {new Date(pedido.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div>
                    <span className="text-gray-600">Valor Total:</span>
                    <p className="font-medium text-green-600">
                      R$ {parseFloat(pedido.valorTotal).toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <span className="text-gray-600">Itens:</span>
                    <p className="font-medium">{pedido.items.length} produto(s)</p>
                  </div>

                  {pedido.dataPrevisaoEntrega && (
                    <div>
                      <span className="text-gray-600">Previsão de Entrega:</span>
                      <p className={`font-medium ${prazoProximo ? 'text-orange-600' : ''}`}>
                        {new Date(pedido.dataPrevisaoEntrega).toLocaleDateString('pt-BR')}
                        {prazoProximo && ' (Próximo!)'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Endereço de Entrega */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Endereço de Entrega:</span>
                  <p className="text-sm mt-1">{pedido.enderecoEntrega}</p>
                </div>

                {/* Forma de Pagamento */}
                <div className="mb-4">
                  <span className="text-sm text-gray-600">Forma de Pagamento:</span>
                  <p className="text-sm font-medium mt-1">{pedido.formaPagamento}</p>
                </div>

                {/* Rastreio (se disponível) */}
                {pedido.numeroRastreio && (
                  <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm text-gray-600">Código de Rastreio:</span>
                    <p className="text-sm font-medium mt-1">
                      {pedido.numeroRastreio} - {pedido.transportadora || 'N/A'}
                    </p>
                  </div>
                )}

                {/* Motivos de Recusa/Cancelamento */}
                {(pedido.motivoRecusa || pedido.motivoCancelamento) && (
                  <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded">
                    <span className="text-sm font-semibold text-gray-900">
                      {pedido.motivoRecusa ? 'Motivo da Recusa:' : 'Motivo do Cancelamento:'}
                    </span>
                    <p className="text-sm mt-1">{pedido.motivoRecusa || pedido.motivoCancelamento}</p>
                  </div>
                )}

                {/* Ações */}
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <button
                    onClick={() => handleVerDetalhes(pedido)}
                    className="btn-secondary text-sm"
                  >
                    <ShoppingCart size={16} />
                    Ver Detalhes
                  </button>

                  {podeGerenciar && pedido.status !== 'CANCELADA' && pedido.status !== 'ENTREGUE' && (
                    <button
                      onClick={() => handleGerenciar(pedido)}
                      className="btn-primary text-sm"
                    >
                      <Package size={16} />
                      Gerenciar
                    </button>
                  )}

                  {isClienteB2B && pedido.status === 'PENDENTE' && (
                    <button
                      onClick={() => handleCancelar(pedido)}
                      className="btn-secondary text-sm text-red-600"
                    >
                      <XCircle size={16} />
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      {showNovoModal && (
        <NovoPedidoModal
          onClose={() => setShowNovoModal(false)}
          onSuccess={() => {
            setShowNovoModal(false);
            carregarPedidos();
          }}
        />
      )}

      {showDetalhesModal && pedidoSelecionado && (
        <DetalhesPedidoModal
          pedido={pedidoSelecionado}
          onClose={() => {
            setShowDetalhesModal(false);
            setPedidoSelecionado(null);
          }}
        />
      )}

      {showGerenciarModal && pedidoSelecionado && (
        <GerenciarPedidoModal
          pedido={pedidoSelecionado}
          onClose={() => {
            setShowGerenciarModal(false);
            setPedidoSelecionado(null);
          }}
          onSuccess={() => {
            setShowGerenciarModal(false);
            setPedidoSelecionado(null);
            carregarPedidos();
          }}
        />
      )}
    </Layout>
  );
};

export default PedidosB2BPage;
