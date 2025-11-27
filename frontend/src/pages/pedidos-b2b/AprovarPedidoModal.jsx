import { useState } from 'react';
import { X, CheckCircle, XCircle, AlertCircle, Package, User, MapPin, CreditCard } from 'lucide-react';
import api from '../../services/api';
import { getUrlFotoCor } from '../../services/assets';
import LoadingSpinner from '../../components/LoadingSpinner';

const AprovarPedidoModal = ({ pedido, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [acao, setAcao] = useState(null); // 'aprovar' ou 'recusar'
  const [justificativaRecusa, setJustificativaRecusa] = useState('');

  const getColorImageUrl = (arquivoImagem) => {
    if (!arquivoImagem) return null;
    return getUrlFotoCor(arquivoImagem);
  };

  const calcularTotal = () => {
    return pedido.items.reduce((total, item) => {
      return total + (parseFloat(item.precoUnitario) * item.quantidade);
    }, 0);
  };

  const handleAprovar = async () => {
    try {
      setLoading(true);

      // Aprovar o pedido
      await api.post(`/pedidos-b2b/${pedido.id}/aprovar`);

      alert('Pedido aprovado! Status alterado para AGUARDANDO_PAGAMENTO.\nCliente receberá instruções de pagamento.');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao aprovar pedido:', error);
      alert(error.response?.data?.message || 'Erro ao aprovar pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleRecusar = async () => {
    if (!justificativaRecusa.trim()) {
      alert('Informe o motivo da recusa');
      return;
    }

    try {
      setLoading(true);

      await api.post(`/pedidos-b2b/${pedido.id}/recusar`, {
        justificativaRecusa
      });

      alert('Pedido recusado. Cliente será notificado.');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao recusar pedido:', error);
      alert(error.response?.data?.message || 'Erro ao recusar pedido');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      AGUARDANDO_APROVACAO: { color: 'bg-yellow-100 text-yellow-800', text: 'Aguardando Aprovação' },
      APROVADO: { color: 'bg-green-100 text-green-800', text: 'Aprovado' },
      RECUSADO: { color: 'bg-red-100 text-red-800', text: 'Recusado' },
      AGUARDANDO_PAGAMENTO: { color: 'bg-blue-100 text-blue-800', text: 'Aguardando Pagamento' },
      PAGO: { color: 'bg-green-100 text-green-800', text: 'Pago' },
      EM_SEPARACAO: { color: 'bg-purple-100 text-purple-800', text: 'Em Separação' },
      ENVIADO: { color: 'bg-indigo-100 text-indigo-800', text: 'Enviado' },
      ENTREGUE: { color: 'bg-gray-100 text-gray-800', text: 'Entregue' },
      CANCELADO: { color: 'bg-red-100 text-red-800', text: 'Cancelado' },
    };
    const badge = badges[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Aprovar Pedido B2B</h2>
            <p className="text-sm text-gray-600 mt-1">Pedido: {pedido.numero}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
          {/* Status Atual */}
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Status Atual:</span>
            {getStatusBadge(pedido.status)}
          </div>

          {/* Dados do Cliente */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="text-primary" size={20} />
              <h3 className="font-semibold text-lg">Dados do Cliente</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Razão Social:</span>
                <p className="font-medium">{pedido.cliente.razaoSocial}</p>
              </div>
              {pedido.cliente.nomeFantasia && (
                <div>
                  <span className="text-gray-600">Nome Fantasia:</span>
                  <p className="font-medium">{pedido.cliente.nomeFantasia}</p>
                </div>
              )}
              <div>
                <span className="text-gray-600">CNPJ:</span>
                <p className="font-medium">{pedido.cliente.cnpj}</p>
              </div>
              <div>
                <span className="text-gray-600">Inscrição Estadual:</span>
                <p className="font-medium">{pedido.cliente.inscricaoEstadual}</p>
              </div>
              <div>
                <span className="text-gray-600">E-mail:</span>
                <p className="font-medium">{pedido.cliente.email}</p>
              </div>
              <div>
                <span className="text-gray-600">Telefone:</span>
                <p className="font-medium">{pedido.cliente.telefone}</p>
              </div>
            </div>
          </div>

          {/* Endereço de Entrega */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="text-primary" size={20} />
              <h3 className="font-semibold text-lg">Endereço de Entrega</h3>
            </div>
            <p className="text-sm text-gray-700">{pedido.enderecoEntrega}</p>
          </div>

          {/* Forma de Pagamento */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="text-primary" size={20} />
              <h3 className="font-semibold text-lg">Forma de Pagamento</h3>
            </div>
            <p className="text-sm text-gray-700 font-medium">{pedido.formaPagamento}</p>
            <p className="text-xs text-gray-500 mt-1">
              Prazo de entrega: {pedido.prazoEntrega} dias após pagamento confirmado
            </p>
          </div>

          {/* Produtos */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Package className="text-primary" size={20} />
              <h3 className="font-semibold text-lg">Produtos ({pedido.items.length})</h3>
            </div>
            <div className="space-y-3">
              {pedido.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  {/* Imagem da Cor */}
                  {item.cor.arquivoImagem ? (
                    <img
                      src={getColorImageUrl(item.cor.arquivoImagem)}
                      alt={item.cor.nome}
                      className="w-16 h-16 rounded object-cover"
                    />
                  ) : (
                    <div
                      className="w-16 h-16 rounded"
                      style={{ backgroundColor: item.cor.codigoHex || '#ccc' }}
                    />
                  )}

                  {/* Info do Produto */}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.produto.nome}</p>
                    <p className="text-sm text-gray-600">Código: {item.produto.codigo}</p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Cor:</span> {item.cor.nome}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Quantidade:</span> {item.quantidade}m
                    </p>
                  </div>

                  {/* Valores */}
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      R$ {parseFloat(item.precoUnitario).toFixed(2)}/m
                    </p>
                    <p className="font-bold text-gray-900">
                      R$ {(parseFloat(item.precoUnitario) * item.quantidade).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className="text-lg font-semibold">Valor Total:</span>
              <span className="text-2xl font-bold text-primary">
                R$ {calcularTotal().toFixed(2)}
              </span>
            </div>
          </div>

          {/* Observações */}
          {pedido.observacoes && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Observações</h3>
              <p className="text-sm text-gray-700">{pedido.observacoes}</p>
            </div>
          )}

          {/* Verificação de Estoque */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="font-medium text-blue-900">Verificação de Disponibilidade</p>
                <p className="text-sm text-blue-700 mt-1">
                  Antes de aprovar, verifique se há estoque disponível para todos os produtos e cores solicitados.
                  Após a aprovação, o pedido entrará em status de aguardando pagamento.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Ações */}
        <div className="border-t p-6 bg-gray-50">
          {!acao ? (
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={() => setAcao('recusar')}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <XCircle size={20} />
                Recusar Pedido
              </button>
              <button
                onClick={() => setAcao('aprovar')}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle size={20} />
                Aprovar Pedido
              </button>
            </div>
          ) : acao === 'aprovar' ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-medium text-green-900">Confirmar Aprovação</p>
                <p className="text-sm text-green-700 mt-1">
                  O pedido será aprovado e o cliente receberá instruções para pagamento.
                  Status será alterado para <strong>AGUARDANDO_PAGAMENTO</strong>.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setAcao(null)}
                  className="btn-secondary flex-1"
                >
                  Voltar
                </button>
                <button
                  onClick={handleAprovar}
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? 'Aprovando...' : 'Confirmar Aprovação'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-medium text-red-900">Motivo da Recusa</p>
                <p className="text-sm text-red-700 mt-1 mb-3">
                  Informe o motivo da recusa do pedido. O cliente será notificado.
                </p>
                <textarea
                  value={justificativaRecusa}
                  onChange={(e) => setJustificativaRecusa(e.target.value)}
                  className="input w-full"
                  rows="4"
                  placeholder="Ex: Estoque insuficiente para os produtos solicitados..."
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setAcao(null)}
                  className="btn-secondary flex-1"
                >
                  Voltar
                </button>
                <button
                  onClick={handleRecusar}
                  disabled={loading || !justificativaRecusa.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Recusando...' : 'Confirmar Recusa'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AprovarPedidoModal;
