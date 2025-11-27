import { useState } from 'react';
import { X, CheckCircle, XCircle, Package, Truck, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const GerenciarPedidoModal = ({ pedido, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [acao, setAcao] = useState('');
  const [motivoRecusa, setMotivoRecusa] = useState('');
  const [motivoCancelamento, setMotivoCancelamento] = useState('');
  const [numeroRastreio, setNumeroRastreio] = useState('');
  const [transportadora, setTransportadora] = useState('');

  const getAcoesDisponiveis = () => {
    const acoes = [];

    if (pedido.status === 'PENDENTE') {
      acoes.push({ value: 'aprovar', label: 'Aprovar Pedido', icon: CheckCircle, color: 'green' });
      acoes.push({ value: 'recusar', label: 'Recusar Pedido', icon: XCircle, color: 'red' });
    }

    if (pedido.status === 'APROVADA') {
      acoes.push({ value: 'iniciar-separacao', label: 'Iniciar Separação', icon: Package, color: 'blue' });
    }

    if (pedido.status === 'EM_SEPARACAO') {
      acoes.push({ value: 'enviar', label: 'Marcar como Enviado', icon: Truck, color: 'purple' });
    }

    if (pedido.status === 'ENVIADA') {
      acoes.push({ value: 'entregar', label: 'Marcar como Entregue', icon: CheckCircle, color: 'teal' });
    }

    if (pedido.status !== 'CANCELADA' && pedido.status !== 'ENTREGUE') {
      acoes.push({ value: 'cancelar', label: 'Cancelar Pedido', icon: AlertCircle, color: 'gray' });
    }

    return acoes;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!acao) {
      alert('Selecione uma ação');
      return;
    }

    // Validações específicas
    if (acao === 'recusar' && !motivoRecusa) {
      alert('Informe o motivo da recusa');
      return;
    }

    if (acao === 'cancelar' && !motivoCancelamento) {
      alert('Informe o motivo do cancelamento');
      return;
    }

    try {
      setLoading(true);

      let endpoint = '';
      let payload = {};

      switch (acao) {
        case 'aprovar':
          endpoint = `/pedidos-b2b/${pedido.id}/aprovar`;
          break;
        case 'recusar':
          endpoint = `/pedidos-b2b/${pedido.id}/recusar`;
          payload = { motivoRecusa };
          break;
        case 'iniciar-separacao':
          endpoint = `/pedidos-b2b/${pedido.id}/iniciar-separacao`;
          break;
        case 'enviar':
          endpoint = `/pedidos-b2b/${pedido.id}/enviar`;
          payload = { numeroRastreio: numeroRastreio || null, transportadora: transportadora || null };
          break;
        case 'entregar':
          endpoint = `/pedidos-b2b/${pedido.id}/entregar`;
          break;
        case 'cancelar':
          endpoint = `/pedidos-b2b/${pedido.id}/cancelar`;
          payload = { motivoCancelamento };
          break;
        default:
          throw new Error('Ação inválida');
      }

      await api.post(endpoint, payload);

      alert('Ação realizada com sucesso!');
      onSuccess();
    } catch (error) {
      console.error('Erro ao executar ação:', error);
      alert(error.response?.data?.message || 'Erro ao executar ação');
    } finally {
      setLoading(false);
    }
  };

  const acoes = getAcoesDisponiveis();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
          <div>
            <h2 className="text-2xl font-bold">Gerenciar Pedido</h2>
            <p className="text-blue-100">{pedido.numero}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 bg-white bg-opacity-20 rounded-full p-2"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            {/* Status Atual */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">Status Atual:</h3>
              <p className="text-lg font-semibold text-blue-600">
                {pedido.status.replace('_', ' ')}
              </p>
            </div>

            {/* Seleção de Ação */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Selecione uma Ação *
              </label>
              <div className="space-y-3">
                {acoes.map((a) => {
                  const Icon = a.icon;
                  const isSelected = acao === a.value;

                  return (
                    <div
                      key={a.value}
                      onClick={() => setAcao(a.value)}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        isSelected
                          ? `border-${a.color}-500 bg-${a.color}-50`
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? `border-${a.color}-500 bg-${a.color}-500`
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {isSelected && <CheckCircle size={20} className="text-white" />}
                        </div>
                        <Icon size={20} className={`text-${a.color}-500`} />
                        <span className="font-semibold text-gray-900">{a.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Campos Condicionais */}
            {acao === 'recusar' && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Motivo da Recusa *
                </label>
                <textarea
                  value={motivoRecusa}
                  onChange={(e) => setMotivoRecusa(e.target.value)}
                  className="input min-h-[80px]"
                  placeholder="Descreva o motivo da recusa..."
                  required
                />
              </div>
            )}

            {acao === 'cancelar' && (
              <div className="mb-6 p-4 bg-gray-50 border-l-4 border-gray-500 rounded">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Motivo do Cancelamento *
                </label>
                <textarea
                  value={motivoCancelamento}
                  onChange={(e) => setMotivoCancelamento(e.target.value)}
                  className="input min-h-[80px]"
                  placeholder="Descreva o motivo do cancelamento..."
                  required
                />
              </div>
            )}

            {acao === 'enviar' && (
              <div className="mb-6 p-4 bg-purple-50 border-l-4 border-purple-500 rounded">
                <h3 className="font-bold text-gray-900 mb-3">
                  Informações de Envio (Opcional)
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código de Rastreio
                    </label>
                    <input
                      type="text"
                      value={numeroRastreio}
                      onChange={(e) => setNumeroRastreio(e.target.value)}
                      className="input"
                      placeholder="BR123456789XX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transportadora
                    </label>
                    <input
                      type="text"
                      value={transportadora}
                      onChange={(e) => setTransportadora(e.target.value)}
                      className="input"
                      placeholder="Correios, Jadlog, etc."
                    />
                  </div>
                </div>
              </div>
            )}

            {acao === 'aprovar' && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded">
                <h3 className="font-bold text-gray-900 mb-2">
                  Confirmação de Aprovação
                </h3>
                <p className="text-sm text-gray-700 mb-2">
                  Ao aprovar este pedido:
                </p>
                <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                  <li>O prazo de entrega será definido como 15 dias corridos</li>
                  <li>O cliente será notificado da aprovação</li>
                  <li>O pedido entrará em fila de separação</li>
                </ul>
              </div>
            )}

            {acao === 'iniciar-separacao' && (
              <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                <h3 className="font-bold text-gray-900 mb-2">
                  Iniciar Separação
                </h3>
                <p className="text-sm text-gray-700">
                  O pedido será marcado como "Em Separação" e a equipe poderá começar a separar os produtos.
                </p>
              </div>
            )}

            {acao === 'entregar' && (
              <div className="mb-6 p-4 bg-teal-50 border-l-4 border-teal-500 rounded">
                <h3 className="font-bold text-gray-900 mb-2">
                  Confirmar Entrega
                </h3>
                <p className="text-sm text-gray-700">
                  Esta ação marca o pedido como entregue e finaliza o processo.
                </p>
              </div>
            )}

            {/* Resumo do Pedido */}
            <div className="p-4 bg-gray-100 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-3">Resumo do Pedido</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">Cliente:</p>
                  <p className="font-semibold">{pedido.cliente.name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Valor Total:</p>
                  <p className="font-semibold text-green-600">
                    R$ {parseFloat(pedido.valorTotal).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Itens:</p>
                  <p className="font-semibold">{pedido.items.length} produto(s)</p>
                </div>
                <div>
                  <p className="text-gray-600">Data do Pedido:</p>
                  <p className="font-semibold">
                    {new Date(pedido.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 p-6 border-t">
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
              disabled={loading || !acao}
            >
              {loading ? <LoadingSpinner /> : 'Confirmar Ação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GerenciarPedidoModal;
