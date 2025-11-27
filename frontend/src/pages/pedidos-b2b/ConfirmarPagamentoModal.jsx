import { useState } from 'react';
import { X, DollarSign, Calendar, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const ConfirmarPagamentoModal = ({ pedido, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const calcularTotal = () => {
    return pedido.items.reduce((total, item) => {
      return total + (parseFloat(item.precoUnitario) * item.quantidade);
    }, 0);
  };

  const calcularDataEntrega = () => {
    const dataEntrega = new Date();
    dataEntrega.setDate(dataEntrega.getDate() + (pedido.prazoEntrega || 15));
    return dataEntrega.toLocaleDateString('pt-BR');
  };

  const handleConfirmar = async () => {
    try {
      setLoading(true);

      await api.post(`/pedidos-b2b/${pedido.id}/confirmar-pagamento`);

      alert(`Pagamento confirmado!\nPrazo de entrega: ${calcularDataEntrega()}`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      alert(error.response?.data?.message || 'Erro ao confirmar pagamento');
    } finally {
      setLoading(false);
    }
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Confirmar Pagamento</h2>
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
        <div className="p-6 space-y-6">
          {/* Informações do Pedido */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cliente:</span>
              <span className="font-medium text-gray-900">{pedido.cliente.razaoSocial}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">CNPJ:</span>
              <span className="font-medium text-gray-900">{pedido.cliente.cnpj}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Forma de Pagamento:</span>
              <span className="font-medium text-gray-900">{pedido.formaPagamento}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-base font-semibold text-gray-700">Valor Total:</span>
              <span className="text-xl font-bold text-primary">
                R$ {calcularTotal().toFixed(2)}
              </span>
            </div>
          </div>

          {/* Prazo de Entrega */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Calendar className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="font-medium text-blue-900">Prazo de Entrega</p>
                <p className="text-sm text-blue-700 mt-1">
                  Após confirmar o pagamento, o prazo de entrega será calculado automaticamente:
                </p>
                <p className="text-base font-bold text-blue-900 mt-2">
                  {pedido.prazoEntrega || 15} dias corridos → {calcularDataEntrega()}
                </p>
              </div>
            </div>
          </div>

          {/* Instrução */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <DollarSign className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="font-medium text-green-900">Confirmar Recebimento</p>
                <p className="text-sm text-green-700 mt-1">
                  Ao confirmar, o status do pedido será alterado para <strong>PAGO</strong> e o cliente será notificado
                  sobre a data prevista de entrega. O pedido entrará na fila de separação.
                </p>
              </div>
            </div>
          </div>

          {/* Resumo de Produtos */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Produtos ({pedido.items.length})</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {pedido.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.produto.nome} - {item.cor.nome} ({item.quantidade}m)
                  </span>
                  <span className="font-medium text-gray-900">
                    R$ {(parseFloat(item.precoUnitario) * item.quantidade).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="btn-secondary flex-1"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={loading}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            <CheckCircle size={20} />
            {loading ? 'Confirmando...' : 'Confirmar Pagamento'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmarPagamentoModal;
