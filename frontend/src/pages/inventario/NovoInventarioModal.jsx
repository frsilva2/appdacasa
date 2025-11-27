import { useState } from 'react';
import { X } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const NovoInventarioModal = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [tipo, setTipo] = useState('INVENTARIO');
  const [observacoes, setObservacoes] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await api.post('/inventario', {
        tipo,
        observacoes: observacoes || null,
      });

      alert('Inventário criado com sucesso!');
      onSuccess();
    } catch (error) {
      console.error('Erro ao criar inventário:', error);
      alert(error.response?.data?.message || 'Erro ao criar inventário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Novo Inventário</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo *
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="input"
                required
              >
                <option value="CONFERENCIA">Conferência de Recebimento</option>
                <option value="INVENTARIO">Inventário Geral</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Conferência: para recebimento de mercadorias
                <br />
                Inventário: para contagem geral de estoque
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="input min-h-[80px]"
                placeholder="Informações adicionais sobre este inventário..."
              />
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
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? <LoadingSpinner /> : 'Criar Inventário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NovoInventarioModal;
